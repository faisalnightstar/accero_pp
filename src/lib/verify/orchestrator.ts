import { DocumentType } from '@/types/cards';
import { ProviderAdapter, VerificationResult } from './types';

export async function executeProviderCascade(
  docType: DocumentType,
  queryId: string,
  providers: ProviderAdapter[]
): Promise<VerificationResult> {
  const sanitizedId = queryId.trim().toUpperCase();
  let lastError = 'No verification provider succeeded';

  for (const provider of providers) {
    if (!provider.supports(docType)) {
      continue;
    }

    try {
      const result = await provider.lookup(docType, sanitizedId);

      // If lookup succeeded with data
      if (result.success && result.data && Object.keys(result.data).length > 0) {
        return result;
      }

      // If lookup was unsuccessful, record error message and cascade
      lastError = result.errorMessage || `${provider.name} returned empty record`;
      console.warn(`[Verify Orchestrator] Provider ${provider.name} did not return data: ${lastError}. Cascading...`);
    } catch (err: any) {
      lastError = err?.message || 'Unexpected provider exception';
      console.error(`[Verify Orchestrator] Provider ${provider.name} threw error: ${lastError}. Cascading...`);
    }
  }

  // All providers in cascade failed
  return {
    success: false,
    documentType: docType,
    idNumber: sanitizedId,
    data: {},
    isPartial: false,
    errorMessage: lastError,
  };
}
