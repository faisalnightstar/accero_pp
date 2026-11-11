import { DocumentType } from '@/types/cards';
import { ProviderAdapter, VerificationResult } from '../types';
import { normalizeAxenDl } from '../normalizers/dlNormalizer';
import { normalizeAxenRc } from '../normalizers/rcNormalizer';
import { fixedFetch } from '@/lib/outbound/fixie';

export class AxenApiProvider implements ProviderAdapter {
  name = 'AxenAPI';

  supports(docType: DocumentType): boolean {
    return docType === 'dl' || docType === 'rc';
  }

  async lookup(docType: DocumentType, idNumber: string): Promise<VerificationResult> {
    const startTime = Date.now();
    const apiKey = process.env.AXEN_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        documentType: docType,
        idNumber,
        data: {},
        provider: this.name,
        isPartial: false,
        errorMessage: 'AXEN_API_KEY is not configured in server environment.',
        latencyMs: Date.now() - startTime,
      };
    }

    try {
      let endpoint = '';
      if (docType === 'dl') {
        endpoint = `https://test.axenapi.co.in/Dashboard/Verify_api/Dl/DLFind.php?api=${encodeURIComponent(apiKey)}&dl_no=${encodeURIComponent(idNumber)}`;
      } else if (docType === 'rc') {
        endpoint = `https://test.axenapi.co.in/Dashboard/Verify_api/vehical_rc/rc_reter.php?api=${encodeURIComponent(apiKey)}&rc_no=${encodeURIComponent(idNumber)}`;
      } else {
        return {
          success: false,
          documentType: docType,
          idNumber,
          data: {},
          provider: this.name,
          isPartial: false,
          errorMessage: `AxenAPI does not support document type: ${docType}`,
          latencyMs: Date.now() - startTime,
        };
      }

      const response = await fixedFetch(endpoint, {
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
          errorMessage: `AxenAPI gateway returned HTTP ${response.status}`,
          statusCode: response.status,
          latencyMs,
        };
      }

      const json = await response.json();
      if (!json || json.error) {
        return {
          success: false,
          documentType: docType,
          idNumber,
          data: {},
          provider: this.name,
          isPartial: false,
          errorMessage: json?.error || json?.statusMessage || 'No matching record found.',
          latencyMs,
        };
      }

      if (docType === 'dl') {
        const data = normalizeAxenDl(json, idNumber);
        return {
          success: true,
          documentType: docType,
          idNumber,
          data,
          provider: this.name,
          isPartial: !data.fatherOrHusbandName || !data.dateOfBirth,
          latencyMs,
        };
      } else {
        const data = normalizeAxenRc(json, idNumber);
        return {
          success: true,
          documentType: docType,
          idNumber,
          data,
          provider: this.name,
          isPartial: !data.engineNumber || !data.chassisNumber,
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
        errorMessage: isTimeout ? 'AxenAPI request timed out after 8s.' : (err.message || 'AxenAPI connection error'),
        latencyMs,
      };
    }
  }
}
