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
 * Known Fixie Outbound Static IP Addresses for PrintPortal.
 * Both addresses must be whitelisted with upstream providers.
 */
export const FIXIE_STATIC_IPS = ['54.195.3.54', '54.217.142.99'] as const;

/**
 * Safely masks proxy passwords or authorization tokens in a URL string.
 */
export function maskUrlCredentials(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  return rawUrl.replace(/\/\/([^:]+):([^@]+)@/g, '//$1:*****@').replace(/:([^:@]+)@/, ':*****@');
}

/**
 * Strips query parameters and credentials from error messages so secrets and PII
 * (API keys, FIXIE_URL, PAN, Aadhaar, EPIC) never appear in logs or responses.
 */
export function sanitizeNetworkErrorMessage(rawMessage: string): string {
  if (!rawMessage || typeof rawMessage !== 'string') return 'Unknown network error';
  return maskUrlCredentials(rawMessage).replace(/\?[^\s"']+/g, '?[REDACTED]');
}

/**
 * Validates and parses a FIXIE_URL string.
 * Returns null if the URL is missing, invalid, or lacks valid protocol/host/port.
 */
export function parseFixieProxyUrl(rawUrl?: string): FixieProxyConfig | null {
  if (typeof window !== 'undefined') {
    return null;
  }

  const urlString = (rawUrl ?? process.env.FIXIE_URL ?? '').trim();
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
 * Checks whether FIXIE_URL env var is present (non-empty string), even if malformed.
 */
export function hasRawFixieUrlSet(): boolean {
  if (typeof window !== 'undefined') return false;
  return Boolean(process.env.FIXIE_URL && process.env.FIXIE_URL.trim().length > 0);
}

/**
 * Returns the active Fixie proxy configuration from environment variables, or null if not configured/invalid.
 */
export function getFixieConfig(): FixieProxyConfig | null {
  if (typeof window !== 'undefined') {
    throw new Error('getFixieConfig must only be called on the server.');
  }
  return parseFixieProxyUrl(process.env.FIXIE_URL);
}

/**
 * Checks whether FIXIE_URL is configured and valid.
 */
export function isFixieConfigured(): boolean {
  if (typeof window !== 'undefined') return false;
  return getFixieConfig() !== null;
}

/**
 * Returns safe-for-logging masked proxy URL, or null if unconfigured.
 */
export function getMaskedFixieUrl(): string | null {
  if (typeof window !== 'undefined') return null;
  return getFixieConfig()?.maskedUrl || null;
}

/**
 * Determines whether Fixie proxy routing is strictly enforced for a provider.
 *
 * Rules:
 * - In Vercel Production, Vercel Preview, or NODE_ENV=production:
 *   Providers requiring static IPs MUST route via Fixie.
 *   ALLOW_FIXIE_BYPASS_DEV CANNOT disable enforcement in Preview or Production.
 * - In local Development / Test (when neither Preview nor Production):
 *   If ALLOW_FIXIE_BYPASS_DEV=true is explicitly set AND FIXIE_URL is omitted,
 *   direct connections are permitted.
 * - Note: If FIXIE_URL is explicitly set to a malformed value, it is ALWAYS rejected.
 */
export function isFixieEnforcedForEnvironment(): boolean {
  const isProdOrPreview =
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview';

  if (isProdOrPreview) {
    return true;
  }

  // If FIXIE_URL was explicitly provided (even if invalid), never silently bypass
  if (hasRawFixieUrlSet() && !isFixieConfigured()) {
    return true;
  }

  const devBypassAllowed =
    process.env.ALLOW_FIXIE_BYPASS_DEV === 'true' || process.env.ALLOW_FIXIE_BYPASS === 'true';

  return !devBypassAllowed;
}
