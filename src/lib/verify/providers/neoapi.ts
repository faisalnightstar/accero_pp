import { DocumentType } from '@/types/cards';
import { ProviderAdapter, VerificationResult } from '../types';
import { normalizeNeoApiPan } from '../normalizers/panNormalizer';
import { normalizeNeoApiVoter } from '../normalizers/voterNormalizer';

export class NeoApiProvider implements ProviderAdapter {
  name = 'NeoAPI';

  supports(docType: DocumentType): boolean {
    return docType === 'pan' || docType === 'voter';
  }

  async lookup(docType: DocumentType, idNumber: string): Promise<VerificationResult> {
    const startTime = Date.now();
    const apiKey = process.env.NEO_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        documentType: docType,
        idNumber,
        data: {},
        provider: this.name,
        isPartial: false,
        errorMessage: 'NEO_API_KEY is not configured in server environment.',
        latencyMs: Date.now() - startTime,
      };
    }

    try {
      let endpoint = '';
      if (docType === 'pan') {
        endpoint = `https://core.neoapi.io/v1/pan/detail/premium.php?apikey=${encodeURIComponent(apiKey)}&pan=${encodeURIComponent(idNumber)}`;
      } else if (docType === 'voter') {
        endpoint = `https://core.neoapi.io/v2/voter/detail.php?apikey=${encodeURIComponent(apiKey)}&epicno=${encodeURIComponent(idNumber)}`;
      } else {
        return {
          success: false,
          documentType: docType,
          idNumber,
          data: {},
          provider: this.name,
          isPartial: false,
          errorMessage: `NeoAPI does not support document type: ${docType}`,
          latencyMs: Date.now() - startTime,
        };
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
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
          errorMessage: `NeoAPI gateway returned HTTP ${response.status}`,
          statusCode: response.status,
          latencyMs,
        };
      }

      const json = await response.json();
      if (!json) {
        return {
          success: false,
          documentType: docType,
          idNumber,
          data: {},
          provider: this.name,
          isPartial: false,
          errorMessage: 'Empty response received from NeoAPI.',
          latencyMs,
        };
      }

      if (docType === 'pan') {
        // NeoAPI returns sampleCode or message or fullname
        if (json.error || (!json.fullname && !json.name)) {
          return {
            success: false,
            documentType: docType,
            idNumber,
            data: {},
            provider: this.name,
            isPartial: false,
            errorMessage: json.error || json.message || json.Message || 'No PAN record found.',
            latencyMs,
          };
        }
        const data = normalizeNeoApiPan(json, idNumber);
        return {
          success: true,
          documentType: docType,
          idNumber,
          data,
          provider: this.name,
          isPartial: !data.fatherName || !data.dateOfBirth,
          latencyMs,
        };
      } else {
        // Voter
        if (!json.response?.docs?.length && !json.data) {
          return {
            success: false,
            documentType: docType,
            idNumber,
            data: {},
            provider: this.name,
            isPartial: false,
            errorMessage: json.Message || json.message || 'No voter record found.',
            latencyMs,
          };
        }
        const data = normalizeNeoApiVoter(json, idNumber);
        return {
          success: true,
          documentType: docType,
          idNumber,
          data,
          provider: this.name,
          isPartial: !data.relationName || !data.assemblyConstituency,
          latencyMs,
        };
      }
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
        errorMessage: isTimeout ? 'NeoAPI request timed out after 8s.' : (err.message || 'NeoAPI connection error'),
        latencyMs,
      };
    }
  }
}
