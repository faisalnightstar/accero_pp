import { DocumentType } from '@/types/cards';
import { ProviderAdapter, VerificationResult } from '../types';
import { validateEpicNumber, validateWebApiInVoterResponse, validateWebApiInCaptchaResponse } from '../validators';
import { normalizeWebApiInVoter } from '../normalizers/webapiInNormalizer';
import { providerFetch } from '@/lib/network/provider-client';
import { maskIdentifier as maskIdForLog, sanitizeNetworkErrorMessage } from '@/lib/network/proxy-config';
import { providerHealthTracker } from '@/lib/reliability/providerHealth';
import { classifyProviderError } from '@/lib/reliability/errorClassifier';

const WEBAPI_IN_VOTER_DETAILS_URL = 'https://webapi.in.net/api/voter_details.php';
const WEBAPI_IN_CAPTCHA_URL = 'https://webapi.in.net/api/voter_captcha.php';
const WEBAPI_IN_CAPTCHA_INFO_URL = 'https://webapi.in.net/api/voter_captcha_info.php';
const DEFAULT_TIMEOUT_MS = 8000;

export class WebApiInProvider implements ProviderAdapter {
  readonly name = 'WebAPI.in';
  readonly id = 'webapi_in';
  private readonly timeoutMs: number;

  constructor(options?: { timeoutMs?: number }) {
    this.timeoutMs = options?.timeoutMs && options.timeoutMs > 0 ? options.timeoutMs : DEFAULT_TIMEOUT_MS;
  }

  supports(docType: DocumentType): boolean {
    return docType === 'voter';
  }

  /**
   * Direct EPIC Voter lookup without captcha.
   */
  async lookup(docType: DocumentType, idNumber: string): Promise<VerificationResult> {
    if (docType !== 'voter') {
      return {
        success: false,
        documentType: docType,
        idNumber,
        data: {},
        provider: this.name,
        isPartial: false,
        errorMessage: `WebAPI.in provider does not support document type: ${docType}`,
        latencyMs: 0,
      };
    }

    return this.lookupVoterDirect(idNumber);
  }

  /**
   * Direct Voter Lookup (GET /api/voter_details.php)
   */
  async lookupVoterDirect(rawIdNumber: string): Promise<VerificationResult> {
    const startTime = Date.now();
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
        latencyMs: Date.now() - startTime,
      };
    }

    const epicNumber = epicCheck.normalized;
    const maskedEpic = maskIdForLog(epicNumber);
    const token = process.env.WEBAPI_IN_TOKEN?.trim();

    if (!token) {
      console.warn('[WebAPI.in:Voter] Missing WEBAPI_IN_TOKEN in server environment');
      return {
        success: false,
        documentType: 'voter',
        idNumber: epicNumber,
        data: {},
        provider: this.name,
        errorCode: 'MISSING_TOKEN',
        isPartial: false,
        errorMessage: 'WEBAPI_IN_TOKEN is not configured in server environment.',
        latencyMs: Date.now() - startTime,
      };
    }

    try {
      const endpoint = `${WEBAPI_IN_VOTER_DETAILS_URL}?token=${encodeURIComponent(token)}&voter_no=${encodeURIComponent(epicNumber)}`;

      const response = await providerFetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        timeoutMs: this.timeoutMs,
        cache: 'no-store',
        providerId: 'webapi_in',
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        console.warn('[WebAPI.in:Voter] Non-OK HTTP status', {
          epic: maskedEpic,
          status: response.status,
          latencyMs,
        });

        const classified = classifyProviderError({ statusCode: response.status });
        providerHealthTracker.recordExecution({
          providerId: this.id,
          success: false,
          latencyMs,
          isRetryable: classified.retryable,
          errorMessage: `HTTP ${response.status}`,
        });

        return {
          success: false,
          documentType: 'voter',
          idNumber: epicNumber,
          data: {},
          provider: this.name,
          errorCode: classified.code,
          statusCode: response.status,
          isPartial: false,
          errorMessage: `WebAPI.in gateway returned HTTP ${response.status}`,
          latencyMs,
        };
      }

      const json = await response.json();
      const validation = validateWebApiInVoterResponse(json, epicNumber);

      if (!validation.valid || !validation.doc) {
        const classified = classifyProviderError({
          errorCode: validation.errorCode,
          errorMessage: validation.reason,
        });

        providerHealthTracker.recordExecution({
          providerId: this.id,
          success: false,
          latencyMs,
          isRetryable: classified.retryable,
          errorMessage: validation.reason,
        });

        return {
          success: false,
          documentType: 'voter',
          idNumber: epicNumber,
          data: {},
          provider: this.name,
          errorCode: validation.errorCode || classified.code,
          isPartial: false,
          errorMessage: validation.reason || 'Verification provider returned an invalid response.',
          latencyMs,
        };
      }

      const normalizedData = normalizeWebApiInVoter(json, epicNumber);
      const isPartial = !normalizedData.relationName || !normalizedData.assemblyConstituency;

      providerHealthTracker.recordExecution({
        providerId: this.id,
        success: true,
        latencyMs,
      });

      return {
        success: true,
        documentType: 'voter',
        idNumber: epicNumber,
        data: normalizedData,
        provider: this.name,
        isPartial,
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const isTimeout =
        err.name === 'TimeoutError' ||
        err.message?.toLowerCase().includes('timeout') ||
        err.message?.toLowerCase().includes('aborted');

      const safeErr = sanitizeNetworkErrorMessage(err?.message || 'WebAPI.in connection error');
      const classified = classifyProviderError({
        errorCode: isTimeout ? 'TIMEOUT' : 'INFRASTRUCTURE_ERROR',
        errorMessage: safeErr,
      });

      providerHealthTracker.recordExecution({
        providerId: this.id,
        success: false,
        latencyMs,
        isTimeout,
        isRetryable: classified.retryable,
        errorMessage: safeErr,
      });

      return {
        success: false,
        documentType: 'voter',
        idNumber: epicNumber,
        data: {},
        provider: this.name,
        errorCode: isTimeout ? 'TIMEOUT' : classified.code,
        isPartial: false,
        errorMessage: isTimeout ? `WebAPI.in timed out after ${this.timeoutMs}ms.` : safeErr,
        latencyMs,
      };
    }
  }

  /**
   * Generates a new Voter captcha image and session token.
   * Never exposes the backend API token or logs captcha identifiers.
   */
  async getCaptcha(): Promise<{
    success: boolean;
    captchaId?: string;
    captchaDataUri?: string;
    errorMessage?: string;
  }> {
    const startTime = Date.now();
    const token = process.env.WEBAPI_IN_TOKEN?.trim();

    if (!token) {
      return {
        success: false,
        errorMessage: 'WEBAPI_IN_TOKEN is not configured in server environment.',
      };
    }

    try {
      const endpoint = `${WEBAPI_IN_CAPTCHA_URL}?token=${encodeURIComponent(token)}`;

      const response = await providerFetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        timeoutMs: this.timeoutMs,
        cache: 'no-store',
        providerId: 'webapi_in',
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          errorMessage: `WebAPI.in captcha service returned HTTP ${response.status}`,
        };
      }

      const json = await response.json();
      const validation = validateWebApiInCaptchaResponse(json);

      if (!validation.valid || !validation.captchaId || !validation.captchaDataUri) {
        return {
          success: false,
          errorMessage: validation.reason || 'Failed to generate captcha challenge.',
        };
      }

      return {
        success: true,
        captchaId: validation.captchaId,
        captchaDataUri: validation.captchaDataUri,
      };
    } catch (err: any) {
      const safeErr = sanitizeNetworkErrorMessage(err?.message || 'Captcha generation error');
      return {
        success: false,
        errorMessage: safeErr,
      };
    }
  }

  /**
   * Captcha-Based Voter Lookup (GET /api/voter_captcha_info.php)
   */
  async lookupWithCaptcha(
    rawIdNumber: string,
    captchaId: string,
    captchaAnswer: string,
    stateCd: string = 'S24'
  ): Promise<VerificationResult> {
    const startTime = Date.now();
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
        latencyMs: Date.now() - startTime,
      };
    }

    const epicNumber = epicCheck.normalized;
    const maskedEpic = maskIdForLog(epicNumber);
    const token = process.env.WEBAPI_IN_TOKEN?.trim();

    if (!token) {
      return {
        success: false,
        documentType: 'voter',
        idNumber: epicNumber,
        data: {},
        provider: this.name,
        errorCode: 'MISSING_TOKEN',
        isPartial: false,
        errorMessage: 'WEBAPI_IN_TOKEN is not configured in server environment.',
        latencyMs: Date.now() - startTime,
      };
    }

    if (!captchaId.trim() || !captchaAnswer.trim()) {
      return {
        success: false,
        documentType: 'voter',
        idNumber: epicNumber,
        data: {},
        provider: this.name,
        errorCode: 'CAPTCHA_INVALID',
        isPartial: false,
        errorMessage: 'Please enter the captcha shown on screen.',
        latencyMs: Date.now() - startTime,
      };
    }

    try {
      const endpoint = `${WEBAPI_IN_CAPTCHA_INFO_URL}?token=${encodeURIComponent(
        token
      )}&voter_no=${encodeURIComponent(epicNumber)}&captchaId=${encodeURIComponent(
        captchaId.trim()
      )}&captcha=${encodeURIComponent(captchaAnswer.trim())}&stateCd=${encodeURIComponent(
        (stateCd || 'S24').trim()
      )}`;

      const response = await providerFetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        timeoutMs: this.timeoutMs,
        cache: 'no-store',
        providerId: 'webapi_in',
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const classified = classifyProviderError({ statusCode: response.status });
        providerHealthTracker.recordExecution({
          providerId: this.id,
          success: false,
          latencyMs,
          isRetryable: classified.retryable,
          errorMessage: `HTTP ${response.status}`,
        });

        return {
          success: false,
          documentType: 'voter',
          idNumber: epicNumber,
          data: {},
          provider: this.name,
          errorCode: classified.code,
          statusCode: response.status,
          isPartial: false,
          errorMessage: `Captcha verification returned HTTP ${response.status}`,
          latencyMs,
        };
      }

      const json = await response.json();
      const validation = validateWebApiInVoterResponse(json, epicNumber);

      if (!validation.valid || !validation.doc) {
        const classified = classifyProviderError({
          errorCode: validation.errorCode,
          errorMessage: validation.reason,
        });

        providerHealthTracker.recordExecution({
          providerId: this.id,
          success: false,
          latencyMs,
          isRetryable: classified.retryable,
          errorMessage: validation.reason,
        });

        return {
          success: false,
          documentType: 'voter',
          idNumber: epicNumber,
          data: {},
          provider: this.name,
          errorCode: validation.errorCode || classified.code,
          isPartial: false,
          errorMessage: validation.reason || 'Verification provider returned an invalid response.',
          latencyMs,
        };
      }

      const normalizedData = normalizeWebApiInVoter(json, epicNumber);
      const isPartial = !normalizedData.relationName || !normalizedData.assemblyConstituency;

      providerHealthTracker.recordExecution({
        providerId: this.id,
        success: true,
        latencyMs,
      });

      return {
        success: true,
        documentType: 'voter',
        idNumber: epicNumber,
        data: normalizedData,
        provider: this.name,
        isPartial,
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const isTimeout =
        err.name === 'TimeoutError' ||
        err.message?.toLowerCase().includes('timeout') ||
        err.message?.toLowerCase().includes('aborted');

      const safeErr = sanitizeNetworkErrorMessage(err?.message || 'WebAPI.in connection error');
      const classified = classifyProviderError({
        errorCode: isTimeout ? 'TIMEOUT' : 'INFRASTRUCTURE_ERROR',
        errorMessage: safeErr,
      });

      providerHealthTracker.recordExecution({
        providerId: this.id,
        success: false,
        latencyMs,
        isTimeout,
        isRetryable: classified.retryable,
        errorMessage: safeErr,
      });

      return {
        success: false,
        documentType: 'voter',
        idNumber: epicNumber,
        data: {},
        provider: this.name,
        errorCode: isTimeout ? 'TIMEOUT' : classified.code,
        isPartial: false,
        errorMessage: isTimeout ? `WebAPI.in timed out after ${this.timeoutMs}ms.` : safeErr,
        latencyMs,
      };
    }
  }

  /**
   * Health Check: Validates connectivity to WebAPI.in without triggering charges.
   */
  async healthCheck(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const start = Date.now();
    try {
      const res = await this.getCaptcha();
      return {
        ok: res.success,
        message: res.success ? 'WebAPI.in operational' : res.errorMessage || 'Health check failed',
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        ok: false,
        message: sanitizeNetworkErrorMessage(err?.message || 'WebAPI.in unreachable'),
        latencyMs: Date.now() - start,
      };
    }
  }
}
