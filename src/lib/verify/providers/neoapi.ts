import { DocumentType } from '@/types/cards';
import { ProviderAdapter, ProviderAttemptSummary, VerificationResult } from '../types';
import { normalizeNeoApiPan } from '../normalizers/panNormalizer';
import { normalizeNeoApiVoter } from '../normalizers/voterNormalizer';
import { validateEpicNumber, validateNeoApiVoterResponse } from '../validators';
import { analyzeDocumentCompleteness } from '@/lib/missingFields';
import { providerFetch } from '@/lib/network/provider-client';
import {
  FixieProxyConfigurationError,
  FixieProxyConnectionError,
  FixieSecurityError,
} from '@/lib/network/fixie';
import { sanitizeNetworkErrorMessage, maskIdentifier as maskIdForLog } from '@/lib/network/proxy-config';

const NEOAPI_VOTER_V1_URL = 'https://core.neoapi.io/v1/voter/detail.php';
const NEOAPI_VOTER_V2_URL = 'https://core.neoapi.io/v2/voter/detail.php';
const DEFAULT_VOTER_TIMEOUT_MS = 8000;

interface VoterEndpointAttemptResult {
  success: boolean;
  data?: Record<string, any>;
  isPartial?: boolean;
  attempt: ProviderAttemptSummary;
  errorCode?: string;
  statusCode?: number;
  internalError?: string;
}

function extractSafeUpstreamDiagnostic(json: unknown): {
  topMessage?: string;
  sampleCode?: string;
  upstreamError?: string;
  docsCount?: number;
} {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return {};
  }
  const obj = json as Record<string, unknown>;
  const pickStr = (v: unknown): string | undefined =>
    typeof v === 'string' && v.trim() ? sanitizeNetworkErrorMessage(v.trim()) : undefined;

  const responseObj =
    obj.response && typeof obj.response === 'object' && !Array.isArray(obj.response)
      ? (obj.response as Record<string, unknown>)
      : undefined;

  return {
    topMessage: pickStr(obj.Message ?? obj.message),
    sampleCode:
      obj.sampleCode !== undefined && obj.sampleCode !== null ? String(obj.sampleCode) : undefined,
    upstreamError: pickStr(obj.error ?? obj.Error),
    docsCount: Array.isArray(responseObj?.docs) ? responseObj.docs.length : undefined,
  };
}

function classifyHttpError(status: number): string {
  if (status === 401 || status === 403) return 'AUTH_ERROR';
  if (status === 408 || status === 504) return 'TIMEOUT';
  if (status === 429) return 'RATE_LIMITED';
  if (status === 404) return 'NOT_FOUND';
  return 'UPSTREAM_HTTP_ERROR';
}

function buildSafeVoterErrorMessage(errorCode: string, internalError?: string): string {
  switch (errorCode) {
    case 'INVALID_EPIC':
      return internalError || 'Please enter a valid Voter EPIC number (e.g. IFV1949684).';
    case 'MISSING_API_KEY':
      return 'NEO_API_KEY is not configured in server environment.';
    case 'FIXIE_CONFIG_ERROR':
      return internalError || 'Static IP proxy is required (FIXIE_URL missing or invalid).';
    case 'PROXY_ERROR':
      return 'Verification network proxy is temporarily unavailable. No wallet amount was charged.';
    case 'AUTH_ERROR':
      return 'Voter verification service authentication failed. Please try again later or contact support.';
    case 'TIMEOUT':
      return 'Voter verification gateway timed out. No wallet amount was charged. Please try again.';
    case 'NOT_FOUND':
    case 'EMPTY_DOCS':
      return 'No matching Voter record was found for this EPIC number. No wallet amount was charged.';
    case 'EPIC_MISMATCH':
    case 'MALFORMED_RESPONSE':
    case 'INVALID_STATUS':
    case 'INVALID_SAMPLE_CODE':
    case 'PROVIDER_ERROR':
      return 'Verification provider returned an invalid or incomplete response. No wallet amount was charged.';
    default:
      return 'Unable to verify Voter ID right now. No wallet amount was charged. Please try again or enter details manually.';
  }
}

export class NeoApiProvider implements ProviderAdapter {
  name = 'NeoAPI';
  private readonly timeoutMs: number;

  constructor(options?: { timeoutMs?: number }) {
    this.timeoutMs = options?.timeoutMs && options.timeoutMs > 0 ? options.timeoutMs : DEFAULT_VOTER_TIMEOUT_MS;
  }

  supports(docType: DocumentType): boolean {
    return docType === 'pan' || docType === 'voter';
  }

  async lookup(docType: DocumentType, idNumber: string): Promise<VerificationResult> {
    if (docType === 'pan') {
      return this.lookupPan(idNumber);
    }

    if (docType === 'voter') {
      return this.lookupVoter(idNumber);
    }

    return {
      success: false,
      documentType: docType,
      idNumber,
      data: {},
      provider: this.name,
      isPartial: false,
      errorMessage: `NeoAPI does not support document type: ${docType}`,
      latencyMs: 0,
    };
  }

  private async lookupPan(idNumber: string): Promise<VerificationResult> {
    const startTime = Date.now();
    const apiKey = process.env.NEO_API_KEY?.trim();
    const maskedPan = maskIdForLog(idNumber);

    console.log('[NeoAPI:PAN] Lookup start', {
      pan: maskedPan,
      hasApiKey: Boolean(apiKey),
      hasFixieUrl: Boolean(process.env.FIXIE_URL?.trim()),
      timeoutMs: this.timeoutMs,
    });

    if (!apiKey) {
      console.warn('[NeoAPI:PAN] Missing NEO_API_KEY in server environment');
      return {
        success: false,
        documentType: 'pan',
        idNumber,
        data: {},
        provider: this.name,
        isPartial: false,
        errorMessage: 'NEO_API_KEY is not configured in server environment.',
        latencyMs: Date.now() - startTime,
      };
    }

    try {
      const endpoint = `https://core.neoapi.io/v1/pan/detail/premium.php?apikey=${encodeURIComponent(apiKey)}&pan=${encodeURIComponent(idNumber)}`;

      const response = await providerFetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        timeoutMs: this.timeoutMs,
        cache: 'no-store',
        providerId: 'neoapi',
      });

      const latencyMs = Date.now() - startTime;
      console.log('[NeoAPI:PAN] HTTP response received', {
        pan: maskedPan,
        httpStatus: response.status,
        latencyMs,
      });

      if (!response.ok) {
        console.warn('[NeoAPI:PAN] Non-OK HTTP status', {
          pan: maskedPan,
          httpStatus: response.status,
          latencyMs,
        });
        return {
          success: false,
          documentType: 'pan',
          idNumber,
          data: {},
          provider: this.name,
          isPartial: false,
          errorMessage: `NeoAPI gateway returned HTTP ${response.status}`,
          statusCode: response.status,
          latencyMs,
        };
      }

      const json = await response.json();
      if (!json) {
        console.warn('[NeoAPI:PAN] Empty JSON response', { pan: maskedPan, latencyMs });
        return {
          success: false,
          documentType: 'pan',
          idNumber,
          data: {},
          provider: this.name,
          isPartial: false,
          errorMessage: 'Empty response received from NeoAPI.',
          latencyMs,
        };
      }

      if (json.error || json.Message === 'Failed' || (!json.fullname && !json.name)) {
        const diag = extractSafeUpstreamDiagnostic(json);
        console.warn('[NeoAPI:PAN] Lookup rejected by upstream response', {
          pan: maskedPan,
          ...diag,
          hasName: Boolean(json.fullname || json.name),
          latencyMs,
        });
        const descriptiveMsg =
          (typeof json.error === 'string' && json.error.trim()) ||
          (typeof json.message === 'string' &&
            json.message.trim() &&
            json.message.trim() !== 'Failed'
            ? json.message.trim()
            : '') ||
          (typeof json.Message === 'string' &&
            json.Message.trim() &&
            json.Message.trim() !== 'Failed'
            ? json.Message.trim()
            : '');
        return {
          success: false,
          documentType: 'pan',
          idNumber,
          data: {},
          provider: this.name,
          isPartial: false,
          errorMessage:
            (descriptiveMsg ? sanitizeNetworkErrorMessage(descriptiveMsg) : '') ||
            'No PAN record found or upstream verification failed.',
          latencyMs,
        };
      }
      const data = normalizeNeoApiPan(json, idNumber);
      const isPartial = !data.fatherName || !data.dateOfBirth;
      console.log('[NeoAPI:PAN] Lookup succeeded', { pan: maskedPan, isPartial, latencyMs });
      return {
        success: true,
        documentType: 'pan',
        idNumber,
        data,
        provider: this.name,
        isPartial,
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const isTimeout = err.name === 'TimeoutError' || err.message?.includes('timeout') || err.message?.includes('aborted');
      const safeErr = sanitizeNetworkErrorMessage(err?.message || 'NeoAPI connection error');
      console.error('[NeoAPI:PAN] Transport/proxy exception', {
        pan: maskedPan,
        isTimeout,
        errorName: err?.name,
        errorMessage: safeErr,
        latencyMs,
      });
      return {
        success: false,
        documentType: 'pan',
        idNumber,
        data: {},
        provider: this.name,
        isPartial: false,
        errorMessage: isTimeout ? 'NeoAPI request timed out after 8s.' : safeErr,
        latencyMs,
      };
    }
  }

  /**
   * Executes Voter (EPIC) lookup using NeoAPI V1 as primary and automatically
   * falling back to NeoAPI V2 on any V1 failure, timeout, or invalid response.
   */
  private async lookupVoter(rawIdNumber: string): Promise<VerificationResult> {
    const overallStart = Date.now();
    const epicCheck = validateEpicNumber(rawIdNumber);

    if (!epicCheck.valid) {
      return {
        success: false,
        documentType: 'voter',
        idNumber: epicCheck.normalized,
        data: {},
        provider: this.name,
        errorCode: 'INVALID_EPIC',
        isPartial: false,
        errorMessage: epicCheck.errorMessage,
        latencyMs: Date.now() - overallStart,
        attempts: [],
      };
    }

    const epicNumber = epicCheck.normalized;
    const maskedEpic = maskIdForLog(epicNumber);
    const apiKey = process.env.NEO_API_KEY?.trim();

    console.log('[NeoAPI:Voter] Lookup start', {
      epic: maskedEpic,
      hasApiKey: Boolean(apiKey),
      hasFixieUrl: Boolean(process.env.FIXIE_URL?.trim()),
      timeoutMs: this.timeoutMs,
    });

    if (!apiKey) {
      console.warn('[NeoAPI:Voter] Missing NEO_API_KEY in server environment', { epic: maskedEpic });
      return {
        success: false,
        documentType: 'voter',
        idNumber: epicNumber,
        data: {},
        provider: this.name,
        errorCode: 'MISSING_API_KEY',
        isPartial: false,
        errorMessage: buildSafeVoterErrorMessage('MISSING_API_KEY'),
        latencyMs: Date.now() - overallStart,
        attempts: [],
      };
    }

    console.log("Starting to fetch from Neo API V1 URL: ", NEOAPI_VOTER_V1_URL);
    // Primary Attempt: NeoAPI V1
    const v1Result = await this.callVoterEndpoint('v1', NEOAPI_VOTER_V1_URL, apiKey, epicNumber);
    if (v1Result.success && v1Result.data) {
      const totalLatencyMs = Date.now() - overallStart;
      console.log('[NeoAPI:Voter] Lookup succeeded', {
        epic: maskedEpic,
        version: 'v1',
        fallbackUsed: false,
        isPartial: Boolean(v1Result.isPartial),
        latencyMs: totalLatencyMs,
      });
      return {
        success: true,
        documentType: 'voter',
        idNumber: epicNumber,
        data: v1Result.data,
        provider: this.name,
        providerVersion: 'v1',
        fallbackUsed: false,
        isPartial: Boolean(v1Result.isPartial),
        latencyMs: totalLatencyMs,
        attempts: [v1Result.attempt],
      };
    }

    // Sanitized telemetry for V1 failure (never logs API keys or citizen PII)
    console.warn(
      JSON.stringify({
        tag: '[NeoAPI:Voter]',
        event: 'v1_failed_attempting_v2_fallback',
        epic: maskedEpic,
        errorCode: v1Result.errorCode || 'UNKNOWN',
        statusCode: v1Result.statusCode,
        latencyMs: v1Result.attempt.latencyMs,
      })
    );

    // Fallback Attempt: NeoAPI V2 (even if V1 failed due to auth/status/timeout/malformed)
    const v2Result = await this.callVoterEndpoint('v2', NEOAPI_VOTER_V2_URL, apiKey, epicNumber);
    if (v2Result.success && v2Result.data) {
      const totalLatencyMs = Date.now() - overallStart;
      console.log('[NeoAPI:Voter] Lookup succeeded', {
        epic: maskedEpic,
        version: 'v2',
        fallbackUsed: true,
        isPartial: Boolean(v2Result.isPartial),
        latencyMs: totalLatencyMs,
      });
      return {
        success: true,
        documentType: 'voter',
        idNumber: epicNumber,
        data: v2Result.data,
        provider: this.name,
        providerVersion: 'v2',
        fallbackUsed: true,
        isPartial: Boolean(v2Result.isPartial),
        latencyMs: totalLatencyMs,
        attempts: [v1Result.attempt, v2Result.attempt],
      };
    }

    // Both V1 and V2 failed — preserve internal classification accurately without exposing PII/secrets
    const finalErrorCode =
      v1Result.errorCode === 'AUTH_ERROR' || v2Result.errorCode === 'AUTH_ERROR'
        ? 'AUTH_ERROR'
        : v2Result.errorCode || v1Result.errorCode || 'UPSTREAM_ERROR';

    console.warn(
      JSON.stringify({
        tag: '[NeoAPI:Voter]',
        event: 'v1_and_v2_failed',
        v1ErrorCode: v1Result.errorCode,
        v1StatusCode: v1Result.statusCode,
        v2ErrorCode: v2Result.errorCode,
        v2StatusCode: v2Result.statusCode,
        finalErrorCode,
        totalLatencyMs: Date.now() - overallStart,
      })
    );

    return {
      success: false,
      documentType: 'voter',
      idNumber: epicNumber,
      data: {},
      provider: this.name,
      errorCode: finalErrorCode,
      statusCode: v2Result.statusCode ?? v1Result.statusCode,
      isPartial: false,
      errorMessage: buildSafeVoterErrorMessage(
        finalErrorCode,
        v2Result.internalError || v1Result.internalError
      ),
      latencyMs: Date.now() - overallStart,
      attempts: [v1Result.attempt, v2Result.attempt],
    };
  }

  private async callVoterEndpoint(
    version: 'v1' | 'v2',
    baseUrl: string,
    apiKey: string,
    epicNumber: string
  ): Promise<VoterEndpointAttemptResult> {
    const maskedEpic = maskIdForLog(epicNumber);
    const start = Date.now();
    const endpoint = `${baseUrl}?apikey=${encodeURIComponent(apiKey)}&epicno=${encodeURIComponent(epicNumber)}`;

    console.log('[NeoAPI:Voter] Calling endpoint', {
      version,
      epic: maskedEpic,
      endpointHost: 'core.neoapi.io',
      timeoutMs: this.timeoutMs,
    });

    try {
      const response = await providerFetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        timeoutMs: this.timeoutMs,
        cache: 'no-store',
        providerId: 'neoapi',
      });

      const latencyMs = Date.now() - start;
      console.log('[NeoAPI:Voter] HTTP response received', {
        version,
        epic: maskedEpic,
        httpStatus: response.status,
        latencyMs,
      });

      if (!response.ok) {
        const errorCode = classifyHttpError(response.status);
        console.warn('[NeoAPI:Voter] Upstream HTTP error', {
          version,
          epic: maskedEpic,
          httpStatus: response.status,
          errorCode,
          latencyMs,
        });
        return {
          success: false,
          errorCode,
          statusCode: response.status,
          attempt: {
            version,
            success: false,
            statusCode: response.status,
            errorCode,
            latencyMs,
          },
        };
      }

      let json: unknown;
      try {
        json = await response.json();
      } catch {
        console.warn('[NeoAPI:Voter] Malformed JSON response', {
          version,
          epic: maskedEpic,
          httpStatus: response.status,
          latencyMs,
        });
        return {
          success: false,
          errorCode: 'MALFORMED_RESPONSE',
          statusCode: response.status,
          attempt: {
            version,
            success: false,
            statusCode: response.status,
            errorCode: 'MALFORMED_RESPONSE',
            latencyMs,
          },
        };
      }

      const validation = validateNeoApiVoterResponse(json, epicNumber);
      if (!validation.valid || !validation.doc) {
        const errorCode = validation.errorCode || 'PROVIDER_ERROR';
        const diag = extractSafeUpstreamDiagnostic(json);
        console.warn('[NeoAPI:Voter] Upstream validation failed', {
          version,
          epic: maskedEpic,
          httpStatus: response.status,
          errorCode,
          reason: validation.reason,
          ...diag,
          latencyMs,
        });
        return {
          success: false,
          errorCode,
          statusCode: response.status,
          attempt: {
            version,
            success: false,
            statusCode: response.status,
            errorCode,
            latencyMs,
          },
        };
      }

      const normalized = normalizeNeoApiVoter(json, epicNumber);
      const completeness = analyzeDocumentCompleteness('voter', normalized);
      console.log('[NeoAPI:Voter] Normalized voter record ready', {
        version,
        epic: maskedEpic,
        isPartial: !completeness.isPrintReady,
        latencyMs,
      });

      return {
        success: true,
        data: normalized,
        isPartial: !completeness.isPrintReady,
        statusCode: response.status,
        attempt: {
          version,
          success: true,
          statusCode: response.status,
          latencyMs,
        },
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      let errorCode = 'NETWORK_ERROR';
      let internalError: string | undefined;

      if (err instanceof FixieProxyConfigurationError) {
        errorCode = 'FIXIE_CONFIG_ERROR';
        internalError = sanitizeNetworkErrorMessage(err.message);
      } else if (err instanceof FixieProxyConnectionError || err instanceof FixieSecurityError) {
        errorCode = 'PROXY_ERROR';
        internalError = sanitizeNetworkErrorMessage(err.message);
      } else if (
        err?.name === 'TimeoutError' ||
        err?.name === 'AbortError' ||
        String(err?.message || '').toLowerCase().includes('timeout') ||
        String(err?.message || '').toLowerCase().includes('aborted')
      ) {
        errorCode = 'TIMEOUT';
      }

      console.error('[NeoAPI:Voter] Transport/proxy exception', {
        version,
        epic: maskedEpic,
        errorCode,
        errorName: err?.name,
        errorMessage: sanitizeNetworkErrorMessage(err?.message || String(err)),
        causeCode: err?.cause?.code,
        latencyMs,
      });

      return {
        success: false,
        errorCode,
        internalError,
        attempt: {
          version,
          success: false,
          errorCode,
          latencyMs,
        },
      };
    }
  }
}
