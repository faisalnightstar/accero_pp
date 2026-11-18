import { DocumentType } from '@/types/cards';
import { ProviderAdapter, VerificationResult } from './types';
import { circuitBreaker } from '@/lib/reliability/circuitBreaker';
import { providerHealthTracker } from '@/lib/reliability/providerHealth';
import { classifyProviderError } from '@/lib/reliability/errorClassifier';

export async function executeProviderCascade(
  docType: DocumentType,
  queryId: string,
  providers: ProviderAdapter[]
): Promise<VerificationResult> {
  const sanitizedId = queryId.trim().toUpperCase();
  let lastError = 'No verification provider succeeded';
  let lastErrorCode: string | undefined;
  let lastStatusCode: number | undefined;
  let lastAttempts: VerificationResult['attempts'];
  let skippedOpenCount = 0;

  for (const provider of providers) {
    if (!provider.supports(docType)) {
      continue;
    }

    const providerKey =
      (provider as any).id || provider.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Circuit Breaker check
    if (!circuitBreaker.canExecute(providerKey)) {
      console.warn(`[Verify Orchestrator] Circuit OPEN for ${provider.name}. Skipping to next provider...`);
      skippedOpenCount += 1;
      continue;
    }

    const start = Date.now();

    try {
      const result = await provider.lookup(docType, sanitizedId);
      const latencyMs = Date.now() - start;

      // If lookup succeeded with data
      if (result.success && result.data && Object.keys(result.data).length > 0) {
        providerHealthTracker.recordExecution({
          providerId: providerKey,
          success: true,
          latencyMs,
        });
        return result;
      }

      // If lookup was unsuccessful, classify error and record metrics
      const classified = classifyProviderError({
        statusCode: result.statusCode,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      });

      providerHealthTracker.recordExecution({
        providerId: providerKey,
        success: false,
        latencyMs,
        isTimeout: classified.category === 'TIMEOUT',
        isRetryable: classified.retryable,
        errorMessage: result.errorMessage,
      });

      lastError = result.errorMessage || `${provider.name} returned empty record`;
      lastErrorCode = result.errorCode || classified.code;
      lastStatusCode = result.statusCode;
      lastAttempts = result.attempts;

      // Non-retryable check: halt immediately on definitive client/absence errors
      if (!classified.retryable) {
        console.log(
          `[Verify Orchestrator] Non-retryable error from ${provider.name} (${classified.code}). Halting cascade.`
        );
        return {
          ...result,
          errorCode: lastErrorCode,
          errorMessage: lastError,
        };
      }

      console.warn(`[Verify Orchestrator] Provider ${provider.name} did not return data: ${lastError}. Cascading...`);
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      lastError = err?.message || 'Unexpected provider exception';
      const classified = classifyProviderError({
        errorCode: 'INFRASTRUCTURE_ERROR',
        errorMessage: lastError,
      });

      providerHealthTracker.recordExecution({
        providerId: providerKey,
        success: false,
        latencyMs,
        isRetryable: true,
        errorMessage: lastError,
      });

      console.error(`[Verify Orchestrator] Provider ${provider.name} threw error: ${lastError}. Cascading...`);
    }
  }

  if (skippedOpenCount === providers.length && providers.length > 0) {
    return {
      success: false,
      documentType: docType,
      idNumber: sanitizedId,
      data: {},
      isPartial: false,
      errorCode: 'ALL_CIRCUITS_OPEN',
      errorMessage: 'All verification providers are temporarily offline due to upstream outages. Please try again shortly.',
      statusCode: 503,
      attempts: lastAttempts,
    };
  }

  // All providers in cascade failed
  return {
    success: false,
    documentType: docType,
    idNumber: sanitizedId,
    data: {},
    isPartial: false,
    errorMessage: lastError,
    errorCode: lastErrorCode || 'LOOKUP_FAILED',
    statusCode: lastStatusCode,
    attempts: lastAttempts,
  };
}
