import { DocumentType } from '@/types/cards';
import { ProviderAdapter, VerificationResult } from './types';
import { NeoApiProvider } from './providers/neoapi';
import { WebApiInProvider } from './providers/webapiIn';
import { FastNexoraProvider } from './providers/fastnexora';
import { MockProvider } from './providers/mock';
import { circuitBreaker } from '@/lib/reliability/circuitBreaker';
import { providerHealthTracker } from '@/lib/reliability/providerHealth';
import { classifyProviderError } from '@/lib/reliability/errorClassifier';
import { maskIdentifier } from '@/lib/network/proxy-config';

export interface PrioritizedProviderEntry {
  id: string;
  name: string;
  provider: ProviderAdapter;
}

export interface VoterCascadeOptions {
  customPriority?: string[];
  timeoutMs?: number;
}

const DEFAULT_PRIORITY_ORDER = ['neoapi', 'webapi_in', 'fastnexora'];

/**
 * Normalizes provider identifiers from configuration/env to standard IDs.
 */
export function normalizeProviderId(rawId: string): string {
  const clean = rawId.toLowerCase().trim();
  if (clean === 'neo' || clean === 'neoapi') return 'neoapi';
  if (clean === 'webapi' || clean === 'webapi_in' || clean === 'webapi.in') return 'webapi_in';
  if (clean === 'fastnexora' || clean === 'nexora') return 'fastnexora';
  if (clean === 'mock') return 'mock';
  return clean;
}

/**
 * Resolves available and configured Voter providers according to prioritized list.
 */
export function getPrioritizedVoterProviders(
  customPriority?: string[]
): PrioritizedProviderEntry[] {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowMock =
    !isProduction &&
    (process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test' ||
      process.env.ALLOW_MOCK_PROVIDERS === 'true');

  // Determine requested priority order
  let order: string[] = [];
  if (Array.isArray(customPriority) && customPriority.length > 0) {
    order = customPriority.map(normalizeProviderId);
  } else if (process.env.VOTER_PROVIDER_ORDER) {
    order = process.env.VOTER_PROVIDER_ORDER.split(',')
      .map((s) => normalizeProviderId(s))
      .filter(Boolean);
  } else {
    order = DEFAULT_PRIORITY_ORDER;
  }

  // Deduplicate order
  const uniqueOrder = Array.from(new Set(order));
  const result: PrioritizedProviderEntry[] = [];

  for (const id of uniqueOrder) {
    switch (id) {
      case 'neoapi': {
        if (process.env.NEO_API_KEY) {
          result.push({
            id: 'neoapi',
            name: 'NeoAPI',
            provider: new NeoApiProvider(),
          });
        }
        break;
      }

      case 'webapi_in': {
        if (process.env.WEBAPI_IN_TOKEN) {
          result.push({
            id: 'webapi_in',
            name: 'WebAPI.in',
            provider: new WebApiInProvider(),
          });
        }
        break;
      }

      case 'fastnexora': {
        if (process.env.FASTNEXORA_API_KEY) {
          result.push({
            id: 'fastnexora',
            name: 'FastNexora',
            provider: new FastNexoraProvider(),
          });
        }
        break;
      }

      case 'mock': {
        if (allowMock) {
          result.push({
            id: 'mock',
            name: 'MockProvider',
            provider: new MockProvider(),
          });
        }
        break;
      }

      default:
        break;
    }
  }

  // Fallback in test/dev if no live credentials configured
  if (result.length === 0 && allowMock) {
    result.push({
      id: 'mock',
      name: 'MockProvider',
      provider: new MockProvider(),
    });
  }

  return result;
}

/**
 * Executes multi-provider failover cascade for Voter (EPIC) lookups:
 * 1. Iterates through providers in priority order.
 * 2. Checks circuit breaker state for each provider; skips OPEN circuits.
 * 3. Dispatches lookup to the active provider.
 * 4. On success: records health metrics and immediately returns normalized record.
 * 5. On failure: classifies error via `classifyProviderError`:
 *    - Non-retryable (invalid EPIC, record not found, invalid captcha): halts failover immediately.
 *    - Retryable (timeout, 5xx, rate limits, provider network issue): records failure in circuit breaker
 *      and cascades automatically to the next available provider.
 * 6. If all providers fail or are tripped: returns a controlled failure without wallet deduction.
 */
export async function executeVoterCascade(
  epicNumber: string,
  options?: VoterCascadeOptions
): Promise<VerificationResult> {
  const startTime = Date.now();
  const sanitizedEpic = epicNumber.trim().toUpperCase();
  const maskedEpic = maskIdentifier(sanitizedEpic);

  const providers = getPrioritizedVoterProviders(options?.customPriority);

  console.log('[VoterOrchestrator] Starting cascade', {
    epic: maskedEpic,
    providersCount: providers.length,
    priority: providers.map((p) => p.id),
  });

  if (providers.length === 0) {
    return {
      success: false,
      documentType: 'voter',
      idNumber: sanitizedEpic,
      data: {},
      isPartial: false,
      errorCode: 'NO_PROVIDER',
      errorMessage: 'No active Voter verification providers are configured or available.',
      latencyMs: Date.now() - startTime,
    };
  }

  let lastResult: VerificationResult | null = null;
  let skippedOpenCount = 0;

  for (const { id: providerId, name: providerName, provider } of providers) {
    // 1. Circuit Breaker Check
    const canRun = circuitBreaker.canExecute(providerId);
    if (!canRun) {
      console.warn(`[VoterOrchestrator] Circuit OPEN for "${providerName}" (${providerId}). Skipping...`);
      skippedOpenCount += 1;
      continue;
    }

    const providerStart = Date.now();
    console.log(`[VoterOrchestrator] Invoking provider "${providerName}" (${providerId})`);

    try {
      const result = await provider.lookup('voter', sanitizedEpic);
      const providerLatency = Date.now() - providerStart;

      // 2. Success Case
      if (result.success && result.data && Object.keys(result.data).length > 0) {
        providerHealthTracker.recordExecution({
          providerId,
          success: true,
          latencyMs: providerLatency,
        });

        console.log(`[VoterOrchestrator] Provider "${providerName}" succeeded in ${providerLatency}ms`);

        return {
          ...result,
          provider: providerName,
          latencyMs: Date.now() - startTime,
        };
      }

      // 3. Failure Case: Classify Error
      const classified = classifyProviderError({
        statusCode: result.statusCode,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      });

      providerHealthTracker.recordExecution({
        providerId,
        success: false,
        latencyMs: providerLatency,
        isTimeout: classified.category === 'TIMEOUT',
        isRetryable: classified.retryable,
        errorMessage: result.errorMessage,
      });

      lastResult = {
        ...result,
        provider: providerName,
        errorCode: result.errorCode || classified.code,
        latencyMs: Date.now() - startTime,
      };

      // 4. Non-Retryable Check: Halt failover immediately on non-transient error
      if (!classified.retryable) {
        console.log(
          `[VoterOrchestrator] Non-retryable error from "${providerName}" (${classified.code}). Halting failover.`
        );
        return {
          ...lastResult,
          errorMessage: result.errorMessage || classified.userFacingMessage,
        };
      }

      console.warn(
        `[VoterOrchestrator] Retryable error from "${providerName}" (${classified.code}). Cascading to next provider...`
      );
    } catch (err: any) {
      const providerLatency = Date.now() - providerStart;
      const classified = classifyProviderError({
        errorCode: 'INFRASTRUCTURE_ERROR',
        errorMessage: err?.message,
      });

      providerHealthTracker.recordExecution({
        providerId,
        success: false,
        latencyMs: providerLatency,
        isRetryable: true,
        errorMessage: err?.message,
      });

      lastResult = {
        success: false,
        documentType: 'voter',
        idNumber: sanitizedEpic,
        data: {},
        provider: providerName,
        isPartial: false,
        errorCode: classified.code,
        errorMessage: classified.userFacingMessage,
        latencyMs: Date.now() - startTime,
      };

      console.error(
        `[VoterOrchestrator] Provider "${providerName}" threw unexpected exception. Cascading...`,
        err
      );
    }
  }

  // All providers failed or were skipped
  if (lastResult) {
    return lastResult;
  }

  if (skippedOpenCount === providers.length) {
    return {
      success: false,
      documentType: 'voter',
      idNumber: sanitizedEpic,
      data: {},
      isPartial: false,
      errorCode: 'ALL_CIRCUITS_OPEN',
      errorMessage:
        'All Voter verification services are temporarily offline due to upstream provider outages. Please try again in 1 minute.',
      latencyMs: Date.now() - startTime,
    };
  }

  return {
    success: false,
    documentType: 'voter',
    idNumber: sanitizedEpic,
    data: {},
    isPartial: false,
    errorCode: 'LOOKUP_FAILED',
    errorMessage: 'Unable to retrieve Voter record across verification providers. No wallet fee was deducted.',
    latencyMs: Date.now() - startTime,
  };
}

/**
 * Retrieves a captcha challenge from a capable provider (e.g. WebAPI.in).
 */
export async function getVoterCaptchaChallenge(
  preferredProviderId: string = 'webapi_in'
): Promise<{
  success: boolean;
  captchaId?: string;
  captchaDataUri?: string;
  providerId?: string;
  errorMessage?: string;
}> {
  if (preferredProviderId === 'webapi_in') {
    const webapi = new WebApiInProvider();
    const res = await webapi.getCaptcha();
    return {
      ...res,
      providerId: 'webapi_in',
    };
  }

  return {
    success: false,
    errorMessage: `Provider "${preferredProviderId}" does not support captcha generation.`,
  };
}

/**
 * Executes a captcha-based Voter lookup using the designated provider.
 */
export async function executeVoterLookupWithCaptcha(params: {
  epicNumber: string;
  captchaId: string;
  captchaAnswer: string;
  stateCd?: string;
  providerId?: string;
}): Promise<VerificationResult> {
  const startTime = Date.now();
  const providerId = params.providerId || 'webapi_in';

  if (providerId === 'webapi_in') {
    const webapi = new WebApiInProvider();
    const result = await webapi.lookupWithCaptcha(
      params.epicNumber,
      params.captchaId,
      params.captchaAnswer,
      params.stateCd || 'S24'
    );
    return {
      ...result,
      latencyMs: Date.now() - startTime,
    };
  }

  return {
    success: false,
    documentType: 'voter',
    idNumber: params.epicNumber,
    data: {},
    isPartial: false,
    errorCode: 'UNSUPPORTED_PROVIDER',
    errorMessage: `Provider "${providerId}" does not support captcha-based lookup.`,
    latencyMs: Date.now() - startTime,
  };
}
