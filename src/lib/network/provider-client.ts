/**
 * Centralized Provider Outbound HTTP Client
 *
 * Enforces provider-specific routing policies (Fixie static IP proxy vs direct egress).
 * Features:
 * - Three-tier enforcement:
 *   1. Registered Fixie providers -> Mandatory Fixie proxy
 *   2. Registered Direct providers -> Direct connection only
 *   3. Unregistered providers / hostnames -> Rejected by default
 * - Fail-safe closed: Production & Preview requests requiring Fixie fail if FIXIE_URL is missing or invalid.
 * - Redirect validation: Overrides `redirect: 'manual'` and blocks redirects to unregistered or unapproved hostnames.
 * - Sanitized security logging: Never exposes credentials, API keys, query strings, or citizen PII.
 * - Connection reuse: Utilizes cached Undici ProxyAgent dispatchers.
 */

import {
  validateOutboundTarget,
  ProviderRegistration,
} from './provider-registry';
import {
  getFixieDispatcher,
  getEffectiveUndiciFetch,
  FixieProxyConfigurationError,
  FixieSecurityError,
  FixieProxyConnectionError,
} from './fixie';
import {
  isFixieEnforcedForEnvironment,
  sanitizeNetworkErrorMessage,
} from './proxy-config';

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

const MAX_SAFE_REDIRECTS = 3;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

/**
 * Sanitized logger for external provider requests.
 * Ensures zero credential, token, query parameter, header, or PII leakage.
 */
function logProviderNetworkEvent(entry: SanitizedAuditLogEntry): void {
  const isError =
    typeof entry.status === 'string' ||
    (typeof entry.status === 'number' && entry.status >= 400);

  const logPayload = {
    tag: '[ProviderNetwork]',
    provider: entry.provider,
    destinationHost: entry.destinationHost,
    proxied: entry.proxied,
    durationMs: entry.durationMs,
    status: entry.status,
    ...(entry.error ? { error: sanitizeNetworkErrorMessage(entry.error) } : {}),
  };

  if (isError) {
    console.warn(JSON.stringify(logPayload));
  } else {
    if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_NETWORK_AUDIT_LOGS === 'true') {
      console.log(JSON.stringify(logPayload));
    }
  }
}

/**
 * Normalizes transport errors into controlled operational errors without leaking secrets.
 */
function normalizeTransportError(err: any, proxied: boolean, timeoutMs: number): Error {
  if (
    err instanceof FixieProxyConfigurationError ||
    err instanceof FixieSecurityError ||
    err instanceof FixieProxyConnectionError
  ) {
    return err;
  }

  const msg = String(err?.message || '');
  const causeMsg = String(err?.cause?.message || '');
  const causeCode = String(err?.cause?.code || err?.code || '');

  const isTimeout =
    err?.name === 'TimeoutError' ||
    err?.name === 'AbortError' ||
    msg.toLowerCase().includes('timeout') ||
    msg.toLowerCase().includes('aborted');

  if (isTimeout) {
    const timeoutErr = new Error(`Request timed out after ${timeoutMs}ms`);
    timeoutErr.name = 'TimeoutError';
    return timeoutErr;
  }

  if (proxied) {
    if (causeMsg.includes('Request was cancelled') || causeMsg.includes('407')) {
      return new FixieProxyConnectionError(
        'Fixie proxy authentication failed (HTTP 407) or tunnel cancelled.'
      );
    }
    if (causeCode === 'ENOTFOUND' || causeMsg.includes('ENOTFOUND')) {
      return new FixieProxyConnectionError('Fixie proxy DNS resolution failed (ENOTFOUND).');
    }
    if (causeCode === 'ECONNREFUSED' || causeMsg.includes('ECONNREFUSED')) {
      return new FixieProxyConnectionError('Fixie proxy connection refused (proxy unreachable).');
    }
    return new FixieProxyConnectionError(
      `Fixie proxy transport failure: ${sanitizeNetworkErrorMessage(causeMsg || msg)}`
    );
  }

  return new Error(sanitizeNetworkErrorMessage(causeMsg || msg || 'Network connection error'));
}

/**
 * Executes a network fetch request for a registered provider, applying its
 * registered routing policy (Fixie proxy or Direct connection) and strict redirect guards.
 *
 * @param input Destination URL or Request
 * @param init Request options with optional providerId and timeoutMs
 */
export async function providerFetch(
  input: string | URL | Request,
  init?: ProviderFetchOptions
): Promise<Response> {
  return executeProviderFetchInternal(input, init, 0);
}

async function executeProviderFetchInternal(
  input: string | URL | Request,
  init?: ProviderFetchOptions,
  redirectDepth: number = 0
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
      throw new FixieSecurityError('Invalid request input format.');
    }
  } catch (err: any) {
    if (err instanceof FixieSecurityError) throw err;
    throw new FixieSecurityError(`Invalid destination URL: ${sanitizeNetworkErrorMessage(err?.message || '')}`);
  }

  // 1. Validate against Explicit Allowlist (3 categories: Fixie, Direct, Reject Unregistered)
  const validation = validateOutboundTarget(targetUrl, init?.providerId);
  const provider: ProviderRegistration | undefined = validation.provider;
  const providerName = provider?.name || init?.providerId || 'unregistered';

  if (!validation.allowed) {
    logProviderNetworkEvent({
      provider: providerName,
      destinationHost: targetUrl.hostname || 'unknown',
      proxied: false,
      durationMs: Date.now() - startTime,
      status: 'REJECTED',
      error: validation.rejectionReason || 'Unregistered provider or disallowed hostname',
    });
    throw new FixieSecurityError(
      validation.rejectionReason ||
        `Destination "${targetUrl.hostname}" is not in the registered provider allowlist.`
    );
  }

  const shouldProxy = validation.useFixie;

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

  const { providerId: _, timeoutMs: __, redirect: requestedRedirect, ...standardInit } = init || {};

  // SECURITY: Force manual redirect interception to prevent automatic redirects to unapproved hosts
  const requestInit: RequestInit = {
    ...standardInit,
    redirect: 'manual',
    signal: effectiveSignal,
  };

  let actuallyProxied = false;

  try {
    let response: Response;

    if (shouldProxy) {
      const dispatcher = getFixieDispatcher();

      if (!dispatcher) {
        if (isFixieEnforcedForEnvironment()) {
          throw new FixieProxyConfigurationError(
            `Outbound static IP proxy required: FIXIE_URL is missing or invalid in server environment for provider "${providerName}".`
          );
        }

        // Only reachable if dev bypass was explicitly enabled in local dev
        console.warn(
          `[ProviderNetwork:DEV] Provider "${providerName}" bypassing Fixie proxy due to development bypass override.`
        );
        response = await globalThis.fetch(targetUrl.toString(), requestInit);
        actuallyProxied = false;
      } else {
        // Route via Undici ProxyAgent with HTTP CONNECT tunneling
        actuallyProxied = true;
        const fetcher = getEffectiveUndiciFetch();
        const undiciRes = await fetcher(targetUrl.toString(), {
          ...requestInit,
          dispatcher,
        } as any);
        response = undiciRes as unknown as Response;
      }
    } else {
      // Registered Direct Route (e.g., Paytm, WhatsApp)
      actuallyProxied = false;
      response = await globalThis.fetch(targetUrl.toString(), requestInit);
    }

    // 3. Intercept and Validate HTTP Redirects
    if (REDIRECT_STATUSES.has(response.status)) {
      const locationHeader = response.headers.get('location');
      if (locationHeader) {
        let redirectTarget: URL;
        try {
          redirectTarget = new URL(locationHeader, targetUrl);
        } catch {
          throw new FixieSecurityError(
            `Blocked invalid redirect location returned by "${providerName}".`
          );
        }

        // Validate that redirect target stays strictly within the SAME provider's allowlist
        const redirectValidation = validateOutboundTarget(redirectTarget, provider?.id);
        if (!redirectValidation.allowed) {
          logProviderNetworkEvent({
            provider: providerName,
            destinationHost: targetUrl.hostname,
            proxied: actuallyProxied,
            durationMs: Date.now() - startTime,
            status: 'REDIRECT_BLOCKED',
            error: `Blocked redirect to unapproved host: ${redirectTarget.hostname}`,
          });
          throw new FixieSecurityError(
            `Blocked unsafe redirect from "${targetUrl.hostname}" to unregistered or unauthorized host "${redirectTarget.hostname}".`
          );
        }

        if (requestedRedirect === 'manual') {
          return response;
        }
        if (requestedRedirect === 'error') {
          throw new FixieSecurityError(`Redirect encountered for "${providerName}" with redirect: 'error'.`);
        }
        if (redirectDepth >= MAX_SAFE_REDIRECTS) {
          throw new FixieSecurityError(`Exceeded maximum safe redirects (${MAX_SAFE_REDIRECTS}) for "${providerName}".`);
        }

        // Follow safe same-provider redirect (strip sensitive auth headers if origin changed)
        const nextInit: ProviderFetchOptions = { ...init };
        if (redirectTarget.origin !== targetUrl.origin && nextInit.headers) {
          const cleanHeaders = new Headers(nextInit.headers);
          cleanHeaders.delete('authorization');
          cleanHeaders.delete('cookie');
          cleanHeaders.delete('x-api-key');
          nextInit.headers = cleanHeaders;
        }
        if (response.status === 303 && nextInit.method && nextInit.method !== 'GET' && nextInit.method !== 'HEAD') {
          nextInit.method = 'GET';
          delete nextInit.body;
        }

        return await executeProviderFetchInternal(redirectTarget, nextInit, redirectDepth + 1);
      }
    }

    logProviderNetworkEvent({
      provider: providerName,
      destinationHost: targetUrl.hostname,
      proxied: actuallyProxied,
      durationMs: Date.now() - startTime,
      status: response.status,
    });

    return response;
  } catch (err: any) {
    const normalizedErr = normalizeTransportError(err, shouldProxy, timeoutMs);
    const durationMs = Date.now() - startTime;
    const isTimeout = normalizedErr.name === 'TimeoutError';

    logProviderNetworkEvent({
      provider: providerName,
      destinationHost: targetUrl.hostname,
      proxied: shouldProxy,
      durationMs,
      status: isTimeout ? 'TIMEOUT' : 'ERROR',
      error: normalizedErr.message,
    });

    throw normalizedErr;
  } finally {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
    }
  }
}
