import { DocumentType } from '@/types/cards';
import { ProviderAdapter, VerificationResult } from '../types';
import { normalizeFastNexoraVoter } from '../normalizers/voterNormalizer';
import { providerFetch } from '@/lib/network/provider-client';
import { maskIdentifier, sanitizeNetworkErrorMessage } from '@/lib/network/proxy-config';

export class FastNexoraProvider implements ProviderAdapter {
  name = 'FastNexora';

  supports(docType: DocumentType): boolean {
    return docType === 'voter';
  }

  async lookup(docType: DocumentType, idNumber: string): Promise<VerificationResult> {
    const startTime = Date.now();
    const apiKey = process.env.FASTNEXORA_API_KEY?.trim();
    const maskedId = maskIdentifier(idNumber);

    console.log('[FastNexora:Voter] Lookup start', {
      epic: maskedId,
      hasApiKey: Boolean(apiKey),
      hasFixieUrl: Boolean(process.env.FIXIE_URL?.trim()),
    });

    if (!apiKey) {
      console.warn('[FastNexora:Voter] Missing FASTNEXORA_API_KEY in server environment');
      return {
        success: false,
        documentType: docType,
        idNumber,
        data: {},
        provider: this.name,
        isPartial: false,
        errorMessage: 'FASTNEXORA_API_KEY is not configured in server environment.',
        latencyMs: Date.now() - startTime,
      };
    }

    try {
      const url = `https://auth.fastnexora.xyz/api/v1/voterVerification.php?apiKey=${encodeURIComponent(apiKey)}&epicNumber=${encodeURIComponent(idNumber)}`;
      const response = await providerFetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        timeoutMs: 8000,
        cache: 'no-store',
        providerId: 'fastnexora',
      });

      const latencyMs = Date.now() - startTime;
      console.log('[FastNexora:Voter] HTTP response received', {
        epic: maskedId,
        httpStatus: response.status,
        latencyMs,
      });

      if (!response.ok) {
        console.warn('[FastNexora:Voter] Non-OK HTTP status', {
          epic: maskedId,
          httpStatus: response.status,
          latencyMs,
        });
        return {
          success: false,
          documentType: docType,
          idNumber,
          data: {},
          provider: this.name,
          isPartial: false,
          errorMessage: `FastNexora gateway returned HTTP ${response.status}`,
          statusCode: response.status,
          latencyMs,
        };
      }

      const json = await response.json();
      if (!json || (json.status !== 'success' && !json.data)) {
        const rawMsg = typeof json?.message === 'string' ? json.message.trim() : '';
        console.warn('[FastNexora:Voter] Upstream validation rejected response', {
          epic: maskedId,
          status: json?.status,
          message: rawMsg ? sanitizeNetworkErrorMessage(rawMsg) : undefined,
          latencyMs,
        });
        const safeMsg =
          rawMsg && rawMsg !== 'Failed'
            ? sanitizeNetworkErrorMessage(rawMsg)
            : 'No voter record found for this EPIC number.';
        return {
          success: false,
          documentType: docType,
          idNumber,
          data: {},
          provider: this.name,
          isPartial: false,
          errorMessage: safeMsg,
          latencyMs,
        };
      }

      const normalized = normalizeFastNexoraVoter(json, idNumber);
      console.log('[FastNexora:Voter] Lookup succeeded', { epic: maskedId, latencyMs });
      return {
        success: true,
        documentType: docType,
        idNumber,
        data: normalized,
        provider: this.name,
        isPartial: false,
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const isTimeout = err.name === 'TimeoutError' || err.message?.includes('timeout') || err.message?.includes('aborted');
      const safeErr = sanitizeNetworkErrorMessage(err?.message || 'FastNexora connection error');
      console.error('[FastNexora:Voter] Transport/proxy exception', {
        epic: maskedId,
        isTimeout,
        errorName: err?.name,
        errorMessage: safeErr,
        latencyMs,
      });
      return {
        success: false,
        documentType: docType,
        idNumber,
        data: {},
        provider: this.name,
        isPartial: false,
        errorMessage: isTimeout ? 'FastNexora request timed out after 8s.' : safeErr,
        latencyMs,
      };
    }
  }
}
