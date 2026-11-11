/**
 * Centralized Provider Outbound HTTP Client
 *
 * Enforces provider-specific routing policies (Fixie static IP proxy vs direct egress).
 * Features:
 * - Explicit allowlist enforcement: Only registered hostnames can use Fixie.
 * - Fail-safe closed: Production requests requiring Fixie fail if FIXIE_URL is missing.
 * - Sanitized security logging: Never exposes credentials, API keys, or citizen PII.
 * - Connection reuse: Utilizes cached Undici ProxyAgent dispatchers.
 */

import {
  validateProxyEligibility,
  getProviderForUrl,
  getProviderById,
  ProviderRegistration,
} from './provider-registry';
import {
  getFixieDispatcher,
  getEffectiveUndiciFetch,
  FixieProxyConfigurationError,
  FixieSecurityError,
} from './fixie';
import { getFixieConfig, isFixieEnforcedForEnvironment } from './proxy-config';

export interface ProviderFetchOptions extends RequestInit {
  /** Explicit provider identifier (e.g. 'neoapi', 'fastnexora', 'axenapi') */
  providerId?: string;
  /** Explicit request timeout in milliseconds */
  timeoutMs?: number;
}

export interface SanitizedAuditLogEntry {
  provider: string;
  destinationHost: string;
  proxied: boolean;
  durationMs: number;
  status: number | string;
  error?: string;
}

/**
 * Sanitized logger for external provider requests.
 * Ensures zero credential, token, header, or PII leakage.
 */
function logProviderNetworkEvent(entry: SanitizedAuditLogEntry): void {
  const isError = typeof entry.status === 'string' || (typeof entry.status === 'number' && entry.status >= 400);

  const logPayload = {
    tag: '[ProviderNetwork]',
    provider: entry.provider,
    destinationHost: entry.destinationHost,
    proxied: entry.proxied,
    durationMs: entry.durationMs,
    status: entry.status,
    ...(entry.error ? { error: entry.error } : {}),
  };

  if (isError) {
    console.warn(JSON.stringify(logPayload));
  } else {
    // Info log in development, or keep lightweight in production
    if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_NETWORK_AUDIT_LOGS === 'true') {
      console.log(JSON.stringify(logPayload));
    }
  }
}

/**
 * Executes a network fetch request for a specific provider, applying the
 * registered routing policy (Fixie proxy or Direct connection).
 *
 * @param input Destination URL or Request
 * @param init Request options with optional providerId and timeoutMs
 */
export async function providerFetch(
  input: string | URL | Request,
  init?: ProviderFetchOptions
): Promise<Response> {
  // Ensure server-side execution
  if (typeof window !== 'undefined') {
    throw new Error('providerFetch must only be executed on the server.');
  }

  const startTime = Date.now();

  let targetUrl: URL;
  try {
    if (typeof input === 'string') {
      targetUrl = new URL(input);
    } else if (input instanceof URL) {
      targetUrl = input;
    } else if ('url' in input && typeof input.url === 'string') {
      targetUrl = new URL(input.url);
    } else {
      throw new Error('Invalid request input format.');
    }
  } catch (err: any) {
    throw new Error(`Failed to parse target URL: ${err?.message || err}`);
  }

  // 1. Resolve Provider Registration & Validate Policy
  const validation = validateProxyEligibility(targetUrl, init?.providerId);
  const provider = validation.provider || getProviderForUrl(targetUrl);
  const providerName = provider?.name || init?.providerId || 'unregistered';
  const shouldProxy = validation.authorized;

  // 2. Setup Request Timeout & Signals
  const defaultTimeout = provider?.defaultTimeoutMs || 8000;
  const timeoutMs = init?.timeoutMs || defaultTimeout;

  let effectiveSignal = init?.signal;
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined;

  if (timeoutMs > 0) {
    if (typeof AbortSignal !== 'undefined' && 'any' in AbortSignal && effectiveSignal) {
      effectiveSignal = AbortSignal.any([effectiveSignal, AbortSignal.timeout(timeoutMs)]);
    } else if (!effectiveSignal) {
      if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
        effectiveSignal = AbortSignal.timeout(timeoutMs);
      } else {
        const controller = new AbortController();
        timeoutTimer = setTimeout(
          () => controller.abort(new Error(`Request timed out after ${timeoutMs}ms`)),
          timeoutMs
        );
        effectiveSignal = controller.signal;
      }
    }
  }

  const { providerId: _, timeoutMs: __, ...standardInit } = init || {};
  const requestInit = {
    ...standardInit,
    signal: effectiveSignal,
  };

  try {
    // 3. Routing Branch: Fixie Proxy vs Direct
    if (shouldProxy) {
      // Provider requires Fixie
      const dispatcher = getFixieDispatcher();

      if (!dispatcher) {
        if (isFixieEnforcedForEnvironment()) {
          throw new FixieProxyConfigurationError(
            `Outbound static IP proxy required: FIXIE_URL is missing or invalid in server environment for provider "${providerName}".`
          );
        }

        // Only reachable if dev bypass was explicitly allowed
        console.warn(
          `[ProviderNetwork:DEV] Provider "${providerName}" bypassing Fixie proxy due to development bypass override.`
        );
        const res = await globalThis.fetch(targetUrl.toString(), requestInit);

        logProviderNetworkEvent({
          provider: providerName,
          destinationHost: targetUrl.hostname,
          proxied: false,
          durationMs: Date.now() - startTime,
          status: res.status,
        });

        return res;
      }

      // Route via Undici with Fixie dispatcher (HTTP CONNECT tunnel for https://)
      const fetcher = getEffectiveUndiciFetch();
      const res = await fetcher(targetUrl.toString(), {
        ...requestInit,
        dispatcher,
      } as any);

      logProviderNetworkEvent({
        provider: providerName,
        destinationHost: targetUrl.hostname,
        proxied: true,
        durationMs: Date.now() - startTime,
        status: res.status,
      });

      return res as unknown as Response;
    }

    // Direct Route (Payment gateways, MongoDB, WhatsApp, internal, unregistered)
    const res = await globalThis.fetch(targetUrl.toString(), requestInit);

    logProviderNetworkEvent({
      provider: providerName,
      destinationHost: targetUrl.hostname,
      proxied: false,
      durationMs: Date.now() - startTime,
      status: res.status,
    });

    return res;
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    const isTimeout =
      err.name === 'TimeoutError' ||
      err.message?.includes('timeout') ||
      err.message?.includes('aborted');

    logProviderNetworkEvent({
      provider: providerName,
      destinationHost: targetUrl.hostname,
      proxied: shouldProxy,
      durationMs,
      status: isTimeout ? 'TIMEOUT' : 'ERROR',
      error: isTimeout ? `Timed out after ${timeoutMs}ms` : (err.message || 'Network error'),
    });

    throw err;
  } finally {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
    }
  }
}
