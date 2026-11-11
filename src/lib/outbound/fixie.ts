/**
 * Fixed IP Outbound Client via Fixie Proxy
 *
 * Implements static IP routing for outbound HTTP/HTTPS requests in serverless environments (Vercel).
 * Reference: https://usefixie.com/documentation/http-and-https-requests
 *
 * Capabilities:
 * - Reads and parses FIXIE_URL environment variable.
 * - Manages Undici ProxyAgent dispatcher for modern Node/Next.js fetch.
 * - Manages HttpsProxyAgent for traditional Node http/https clients (axios, got, etc.).
 * - Drop-in `fixedFetch()` that proxies when FIXIE_URL is configured, and falls back to global fetch.
 * - Diagnostic utility `checkOutboundIp()` to verify active egress IP.
 * - Masks credentials to prevent accidental token exposure in server logs.
 */

import { ProxyAgent, fetch as undiciFetch, Dispatcher } from 'undici';
import { HttpsProxyAgent } from 'https-proxy-agent';

export interface FixieConfig {
  /** Original unmasked proxy URL */
  url: string;
  /** Safe-for-logging URL with masked password/token */
  maskedUrl: string;
  /** Protocol scheme: 'http:' or 'https:' */
  protocol: 'http:' | 'https:';
  /** Fixie proxy group hostname, e.g. 'pipeline.usefixie.com' */
  host: string;
  /** Proxy port, typically 80 for HTTP or 443 for TLS */
  port: number;
  /** Fixie username (typically 'fixie') */
  username: string;
  /** Fixie authentication token/password */
  password?: string;
}

export interface OutboundIpResult {
  success: boolean;
  ip?: string;
  proxied: boolean;
  latencyMs: number;
  fixieConfigured: boolean;
  proxyHost?: string;
  error?: string;
}

export type FixedFetchOptions = RequestInit & {
  timeoutMs?: number;
};

// Cached singleton agents to reuse connections and avoid connection leaks
let cachedDispatcher: Dispatcher | null = null;
let cachedDispatcherUrl: string | null = null;

let cachedHttpsAgent: HttpsProxyAgent<string> | null = null;
let cachedHttpsAgentUrl: string | null = null;

let testingFetch: typeof undiciFetch | null = null;

/**
 * Injects a custom fetch transport for test suites.
 */
export function setFixieFetchForTesting(fn: typeof undiciFetch | null): void {
  testingFetch = fn;
}

/**
 * Parses FIXIE_URL and returns structured configuration.
 * Returns null if the URL is not provided or invalid.
 */
export function parseFixieUrl(rawUrl?: string): FixieConfig | null {
  const urlString = rawUrl || process.env.FIXIE_URL;
  if (!urlString || typeof urlString !== 'string' || !urlString.trim()) {
    return null;
  }

  try {
    const parsed = new URL(urlString.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      console.warn(`[Fixie] Invalid protocol in FIXIE_URL: ${parsed.protocol}. Expected http: or https:`);
      return null;
    }

    const defaultPort = parsed.protocol === 'https:' ? 443 : 80;
    const port = parsed.port ? parseInt(parsed.port, 10) : defaultPort;

    // Mask password in URL for safe logging
    const maskedUrl = urlString.trim().replace(/:([^:@]+)@/, ':*****@');

    return {
      url: urlString.trim(),
      maskedUrl,
      protocol: parsed.protocol as 'http:' | 'https:',
      host: parsed.hostname,
      port,
      username: decodeURIComponent(parsed.username || ''),
      password: decodeURIComponent(parsed.password || ''),
    };
  } catch (err: any) {
    console.error(`[Fixie] Failed to parse FIXIE_URL: ${err?.message || err}`);
    return null;
  }
}

/**
 * Checks whether Fixie fixed IP outbound proxy is configured in the environment.
 */
export function isFixieConfigured(): boolean {
  return parseFixieUrl() !== null;
}

/**
 * Gets the current raw Fixie proxy URL if configured.
 */
export function getFixieUrl(): string | undefined {
  return parseFixieUrl()?.url;
}

/**
 * Gets the parsed Fixie configuration, or null if not configured.
 */
export function getFixieConfig(): FixieConfig | null {
  return parseFixieUrl();
}

/**
 * Returns a cached Undici ProxyAgent dispatcher for use with `undici.fetch`.
 * Returns undefined if FIXIE_URL is not configured.
 */
export function getFixieDispatcher(): Dispatcher | undefined {
  const config = getFixieConfig();
  if (!config) {
    return undefined;
  }

  if (cachedDispatcher && cachedDispatcherUrl === config.url) {
    return cachedDispatcher;
  }

  try {
    cachedDispatcher = new ProxyAgent({
      uri: config.url,
      keepAliveTimeout: 30_000,
      keepAliveMaxTimeout: 60_000,
    });
    cachedDispatcherUrl = config.url;
    return cachedDispatcher;
  } catch (err: any) {
    console.error(`[Fixie] Failed to instantiate Undici ProxyAgent: ${err?.message || err}`);
    return undefined;
  }
}

/**
 * Returns a cached HttpsProxyAgent instance for traditional Node http/https libraries (axios, node-fetch, got).
 * Returns undefined if FIXIE_URL is not configured.
 */
export function getFixieAgent(): HttpsProxyAgent<string> | undefined {
  const config = getFixieConfig();
  if (!config) {
    return undefined;
  }

  if (cachedHttpsAgent && cachedHttpsAgentUrl === config.url) {
    return cachedHttpsAgent;
  }

  try {
    cachedHttpsAgent = new HttpsProxyAgent<string>(config.url);
    cachedHttpsAgentUrl = config.url;
    return cachedHttpsAgent;
  } catch (err: any) {
    console.error(`[Fixie] Failed to instantiate HttpsProxyAgent: ${err?.message || err}`);
    return undefined;
  }
}

/**
 * Returns Axios-compatible proxy configuration object.
 */
export function getAxiosProxyConfig(): {
  protocol: string;
  host: string;
  port: number;
  auth?: { username: string; password?: string };
} | false {
  const config = getFixieConfig();
  if (!config) return false;

  return {
    protocol: config.protocol.replace(':', ''),
    host: config.host,
    port: config.port,
    auth: {
      username: config.username,
      password: config.password,
    },
  };
}

/**
 * Clear cached agents (useful in test suites or dynamic env switching).
 */
export function resetFixieAgentCache(): void {
  if (cachedDispatcher) {
    try {
      cachedDispatcher.destroy();
    } catch {
      // Ignore cleanup error
    }
    cachedDispatcher = null;
    cachedDispatcherUrl = null;
  }
  cachedHttpsAgent = null;
  cachedHttpsAgentUrl = null;
  testingFetch = null;
}

/**
 * Fixed IP fetch wrapper.
 *
 * If FIXIE_URL is configured:
 *   - Routes the request through Fixie's HTTP/HTTPS proxy to egress via static IP.
 *   - Uses Undici ProxyAgent dispatcher for high performance and connection reuse.
 *
 * If FIXIE_URL is NOT configured:
 *   - Seamlessly falls back to native `globalThis.fetch()`.
 *   - Ensures zero breakage in local development or unproxied deployments.
 */
export async function fixedFetch(
  input: string | URL | Request,
  init?: FixedFetchOptions
): Promise<Response> {
  const config = getFixieConfig();
  const timeoutMs = init?.timeoutMs;

  let effectiveSignal = init?.signal;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  // Handle timeout option if provided
  if (timeoutMs && timeoutMs > 0) {
    if (typeof AbortSignal !== 'undefined' && 'any' in AbortSignal && effectiveSignal) {
      effectiveSignal = AbortSignal.any([effectiveSignal, AbortSignal.timeout(timeoutMs)]);
    } else if (!effectiveSignal) {
      if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
        effectiveSignal = AbortSignal.timeout(timeoutMs);
      } else {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
        effectiveSignal = controller.signal;
      }
    }
  }

  const { timeoutMs: _, ...fetchInit } = init || {};
  const mergedInit = {
    ...fetchInit,
    signal: effectiveSignal,
  };

  try {
    if (config) {
      const dispatcher = getFixieDispatcher();
      if (dispatcher) {
        // undiciFetch handles HTTP CONNECT tunneling for https: destinations
        const fetcher = testingFetch || undiciFetch;
        const res = await fetcher(input as any, {
          ...mergedInit,
          dispatcher,
        } as any);

        return res as unknown as Response;
      }
    }

    // Direct fallback
    return await globalThis.fetch(input, mergedInit);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Diagnostic utility to verify outbound IP address and Fixie static IP status.
 * Queries IP reflection services via `fixedFetch`.
 */
export async function checkOutboundIp(): Promise<OutboundIpResult> {
  const startTime = Date.now();
  const config = getFixieConfig();

  // Try ipify first, then icanhazip as backup
  const reflectionUrls = [
    'https://api.ipify.org?format=json',
    'https://icanhazip.com',
  ];

  let lastError: string | undefined;

  for (const testUrl of reflectionUrls) {
    try {
      const response = await fixedFetch(testUrl, {
        method: 'GET',
        headers: { Accept: 'application/json, text/plain' },
        timeoutMs: 6000,
        cache: 'no-store',
      });

      if (response.ok) {
        let detectedIp = '';
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data: any = await response.json();
          detectedIp = data.ip || data.origin || '';
        } else {
          detectedIp = (await response.text()).trim();
        }

        if (detectedIp) {
          return {
            success: true,
            ip: detectedIp,
            proxied: Boolean(config),
            latencyMs: Date.now() - startTime,
            fixieConfigured: Boolean(config),
            proxyHost: config?.host,
          };
        }
      }
      lastError = `HTTP ${response.status} from ${testUrl}`;
    } catch (err: any) {
      lastError = err?.message || String(err);
    }
  }

  return {
    success: false,
    proxied: Boolean(config),
    latencyMs: Date.now() - startTime,
    fixieConfigured: Boolean(config),
    proxyHost: config?.host,
    error: lastError || 'Unable to determine outbound IP address',
  };
}
