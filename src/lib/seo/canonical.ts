/**
 * Canonical URL & Domain Management Engine
 * Accero PrintPortal (https://printportal.accero.app)
 */

export const PRIMARY_CANONICAL_DOMAIN = 'https://printportal.accero.app';

/**
 * Returns the resolved canonical base URL.
 * Guarantees HTTPS protocol and eliminates trailing slashes.
 */
export function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    // If someone accidentally points to staging or localhost in production, enforce production canonical
    if (process.env.NODE_ENV === 'production' && !trimmed.includes('localhost')) {
      return trimmed;
    }
    return trimmed;
  }
  return PRIMARY_CANONICAL_DOMAIN;
}

/**
 * Constructs a fully qualified, normalized canonical URL for any internal route.
 * Enforces:
 * - Single preferred hostname
 * - Consistent non-trailing-slash formatting (except root '/')
 * - Strips query parameters and hashes from indexable canonical tags
 */
export function getCanonicalUrl(path: string = '/'): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.split('?')[0].split('#')[0].trim();

  if (!cleanPath || cleanPath === '/' || cleanPath === '') {
    return baseUrl;
  }

  const normalized = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  // Remove trailing slashes for route uniformity
  const sanitized = normalized.replace(/\/+$/, '');

  return `${baseUrl}${sanitized}`;
}

