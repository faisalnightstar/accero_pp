/**
 * Fixie Static IP Proxy Transport
 *
 * Implements proxy agents, HTTPS CONNECT tunneling, and connection reuse for:
 * 1. Modern Node.js / Next.js `fetch` via Undici `ProxyAgent` dispatcher.
 * 2. Axios / HTTP clients via standard Axios proxy config and `HttpsProxyAgent`.
 *
 * Reference: https://usefixie.com/documentation/http-and-https-requests
 */

import { ProxyAgent, fetch as undiciFetch, Dispatcher } from 'undici';
import { HttpsProxyAgent } from 'https-proxy-agent';
import {
  getFixieConfig,
  isFixieConfigured,
  isFixieEnforcedForEnvironment,
  FixieProxyConfig,
} from './proxy-config';

/**
 * Custom error thrown when Fixie is required by the provider policy,
 * but FIXIE_URL is missing or invalid in the environment.
 */
export class FixieProxyConfigurationError extends Error {
  public readonly code = 'FIXIE_CONFIG_ERROR';
  public readonly isOperational = true;

  constructor(message: string = 'Static IP proxy is required for this external provider, but FIXIE_URL is not configured.') {
    super(message);
    this.name = 'FixieProxyConfigurationError';
    Object.setPrototypeOf(this, FixieProxyConfigurationError.prototype);
  }
}

/**
 * Custom error thrown when an outbound request attempts to tunnel to an
 * unauthorized or unregistered destination hostname.
 */
export class FixieSecurityError extends Error {
  public readonly code = 'FIXIE_SECURITY_REJECTED';
  public readonly isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = 'FixieSecurityError';
    Object.setPrototypeOf(this, FixieSecurityError.prototype);
  }
}

// Singletons to ensure connection pooling and avoid connection leakage
let cachedDispatcher: Dispatcher | null = null;
let cachedDispatcherUrl: string | null = null;

let cachedHttpsAgent: HttpsProxyAgent<string> | null = null;
let cachedHttpsAgentUrl: string | null = null;

let testingDispatcher: Dispatcher | null = null;
let testingFetch: typeof undiciFetch | null = null;

/**
 * Injects a mock Undici dispatcher for unit tests.
 */
export function setTestingDispatcher(dispatcher: Dispatcher | null): void {
  testingDispatcher = dispatcher;
}

/**
 * Injects a mock fetch transport for unit tests.
 */
export function setTestingFetch(fn: typeof undiciFetch | null): void {
  testingFetch = fn;
}

/**
 * Resets cached agents and testing hooks.
 */
export function resetFixieCache(): void {
  if (cachedDispatcher) {
    try {
      cachedDispatcher.destroy();
    } catch {
      // Ignore destroy errors during cleanup
    }
    cachedDispatcher = null;
    cachedDispatcherUrl = null;
  }
  cachedHttpsAgent = null;
  cachedHttpsAgentUrl = null;
  testingDispatcher = null;
  testingFetch = null;
}

/**
 * Returns a cached Undici ProxyAgent dispatcher for use with `fetch({ dispatcher })`.
 *
 * Fail-Safe Behavior:
 * If FIXIE_URL is missing or invalid:
 * - When strictly enforced (Production or dev without bypass), throws `FixieProxyConfigurationError`.
 * - When dev bypass is permitted, returns undefined.
 */
export function getFixieDispatcher(): Dispatcher | undefined {
  if (testingDispatcher) {
    return testingDispatcher;
  }

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
    throw new FixieProxyConfigurationError(
      `Failed to initialize Fixie ProxyAgent dispatcher: ${err?.message || err}`
    );
  }
}

/**
 * Returns a cached HttpsProxyAgent instance for Axios or Node http/https agents.
 */
export function getFixieHttpsAgent(): HttpsProxyAgent<string> | undefined {
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
    throw new FixieProxyConfigurationError(
      `Failed to initialize HttpsProxyAgent: ${err?.message || err}`
    );
  }
}

/**
 * Returns Axios-compatible proxy configuration parsed from FIXIE_URL.
 * As documented in: https://usefixie.com/documentation/http-and-https-requests
 */
export function getFixieAxiosProxyConfig(): {
  protocol: string;
  host: string;
  port: number;
  auth: {
    username: string;
    password?: string;
  };
} | false {
  const config = getFixieConfig();
  if (!config) {
    return false;
  }

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
 * Returns the effective fetch function (supports test override).
 */
export function getEffectiveUndiciFetch(): typeof undiciFetch {
  return testingFetch || undiciFetch;
}
