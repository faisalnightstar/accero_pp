import { DocumentType } from '@/types/cards';
import { ProviderAdapter, VerificationResult } from '../types';
import { normalizeFastNexoraVoter } from '../normalizers/voterNormalizer';
import { providerFetch } from '@/lib/network/provider-client';

export class FastNexoraProvider implements ProviderAdapter {
  name = 'FastNexora';

  supports(docType: DocumentType): boolean {
    return docType === 'voter';
  }

  async lookup(docType: DocumentType, idNumber: string): Promise<VerificationResult> {
    const startTime = Date.now();
    const apiKey = process.env.FASTNEXORA_API_KEY;

    if (!apiKey) {
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

      if (!response.ok) {
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
        return {
          success: false,
          documentType: docType,
          idNumber,
          data: {},
          provider: this.name,
          isPartial: false,
          errorMessage: json?.message || 'No voter record found for this EPIC number.',
          latencyMs,
        };
      }

      const normalized = normalizeFastNexoraVoter(json, idNumber);
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
      return {
        success: false,
        documentType: docType,
        idNumber,
        data: {},
        provider: this.name,
        isPartial: false,
        errorMessage: isTimeout ? 'FastNexora request timed out after 8s.' : (err.message || 'FastNexora connection error'),
        latencyMs,
      };
    }
  }
}
