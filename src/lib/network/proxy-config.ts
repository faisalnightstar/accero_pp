/**
 * Fixie Proxy Configuration & URL Parsing
 *
 * Handles server-side validation and sanitization of FIXIE_URL for outbound proxying.
 * Reference: https://usefixie.com/documentation/http-and-https-requests
 */

export interface FixieProxyConfig {
  /** Full validated proxy URL */
  url: string;
  /** Sanitized URL safe for logging and diagnostics (password masked with *****) */
  maskedUrl: string;
  /** Protocol: 'http:' or 'https:' */
  protocol: 'http:' | 'https:';
  /** Fixie group hostname, e.g. 'ventoux.usefixie.com' */
  host: string;
  /** Port number, typically 80 for HTTP or 443 for TLS */
  port: number;
  /** Fixie username (typically 'fixie') */
  username: string;
  /** Fixie password / API token */
  password: string;
}

/**
 * Known Fixie Outbound Static IP Addresses for PrintPortal
 * Whitelist both addresses with NeoAPI and external providers.
 */
export const FIXIE_STATIC_IPS = ['54.195.3.54', '54.217.142.99'] as const;

/**
 * Safely masks proxy passwords or authorization tokens in a URL string.
 */
export function maskUrlCredentials(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  return rawUrl.replace(/:([^:@]+)@/, ':*****@');
}

/**
 * Validates and parses a FIXIE_URL string.
 * Returns null if the URL is missing, invalid, or lacks necessary authentication.
 */
export function parseFixieProxyUrl(rawUrl?: string): FixieProxyConfig | null {
  const urlString = (rawUrl || process.env.FIXIE_URL || '').trim();
  if (!urlString) {
    return null;
  }

  try {
    const parsed = new URL(urlString);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    if (!parsed.hostname) {
      return null;
    }

    const defaultPort = parsed.protocol === 'https:' ? 443 : 80;
    const port = parsed.port ? parseInt(parsed.port, 10) : defaultPort;

    if (isNaN(port) || port <= 0 || port > 65535) {
      return null;
    }

    const username = decodeURIComponent(parsed.username || '');
    const password = decodeURIComponent(parsed.password || '');

    return {
      url: urlString,
      maskedUrl: maskUrlCredentials(urlString),
      protocol: parsed.protocol as 'http:' | 'https:',
      host: parsed.hostname,
      port,
      username,
      password,
    };
  } catch {
    return null;
  }
}

/**
 * Returns the active Fixie proxy configuration from environment variables, or null if not configured.
 */
export function getFixieConfig(): FixieProxyConfig | null {
  return parseFixieProxyUrl(process.env.FIXIE_URL);
}

/**
 * Checks whether FIXIE_URL is configured and valid.
 */
export function isFixieConfigured(): boolean {
  return getFixieConfig() !== null;
}

/**
 * Returns safe-for-logging masked proxy URL, or null if unconfigured.
 */
export function getMaskedFixieUrl(): string | null {
  return getFixieConfig()?.maskedUrl || null;
}

/**
 * Determines whether Fixie proxy routing is strictly enforced for a provider.
 *
 * Rules:
 * - In Production (NODE_ENV === 'production'):
 *   Providers requiring static IPs MUST route via Fixie. Missing FIXIE_URL fails closed.
 * - In Development / Test:
 *   If ALLOW_FIXIE_BYPASS_DEV=true is explicitly set, direct connections are permitted.
 *   Otherwise, missing FIXIE_URL fails closed to maintain parity with production.
 */
export function isFixieEnforcedForEnvironment(): boolean {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    return true;
  }

  // In non-production, bypass is allowed only if explicitly enabled
  const devBypassAllowed = process.env.ALLOW_FIXIE_BYPASS_DEV === 'true' || process.env.ALLOW_FIXIE_BYPASS === 'true';
  return !devBypassAllowed;
}
