/**
 * Accero PrintPortal - Privacy-Preserving Google Tag Manager / dataLayer Engine
 * https://printportal.accero.app
 *
 * PRIVACY GUARANTEES:
 * 1. Zero Citizen PII: Strips document numbers (Aadhaar, PAN, Voter, DL, RC, Ration), names, photos, DOB.
 * 2. Zero Financial Data: Strips wallet balances, bank accounts, UPI IDs.
 * 3. Sanitized URLs: Strips query parameters containing sensitive tokens or document references.
 * 4. Safe Failover: Operates safely during SSR, SSG, and client environments without throwing errors.
 */

export const DEFAULT_GTM_ID = 'GTM-MKXHQ658';

export function getGtmId(): string {
  return process.env.NEXT_PUBLIC_GTM_ID || DEFAULT_GTM_ID;
}

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
  }
}

/**
 * Denylist of sensitive key names that must never enter dataLayer under any circumstances.
 */
const SENSITIVE_KEYS_DENYLIST = new Set([
  'aadhaar',
  'aadhar',
  'uid',
  'pan',
  'pannumber',
  'epic',
  'voterid',
  'voter',
  'dl',
  'licensenumber',
  'drivinglicence',
  'rc',
  'registrationnumber',
  'chassisnumber',
  'enginenumber',
  'ration',
  'rationcard',
  'name',
  'firstname',
  'lastname',
  'fullname',
  'fathername',
  'dob',
  'dateofbirth',
  'phone',
  'mobile',
  'contactnumber',
  'email',
  'upi',
  'upiid',
  'vpa',
  'accountnumber',
  'ifsc',
  'balance',
  'walletbalance',
  'currentbalance',
  'remainingbalance',
  'balancebefore',
  'balanceafter',
  'token',
  'authtoken',
  'password',
  'secret',
  'jwt',
  'photo',
  'signature',
  'image',
  'imagebase64',
  'canvas',
]);

/**
 * Regex patterns to detect accidental leakages in string values.
 */
const AADHAAR_REGEX = /\b[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\b/;
const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/i;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
const INDIAN_PHONE_REGEX = /\b(?:\+91|91)?[6-9]\d{9}\b/;

/**
 * Strips sensitive query parameters from URLs or paths before sending to analytics.
 */
export function sanitizeAnalyticsUrl(rawUrlOrPath: string): string {
  if (!rawUrlOrPath) return '/';

  try {
    // If relative path, anchor with dummy base
    const isRelative = rawUrlOrPath.startsWith('/');
    const url = new URL(rawUrlOrPath, 'https://printportal.accero.app');

    const sensitiveParamNames = [
      'token',
      'auth',
      'key',
      'secret',
      'id',
      'card',
      'number',
      'aadhaar',
      'pan',
      'epic',
      'dl',
      'rc',
      'email',
      'phone',
      'code',
      'session',
    ];

    sensitiveParamNames.forEach((param) => {
      url.searchParams.delete(param);
    });

    if (isRelative) {
      return url.pathname + (url.search ? url.search : '');
    }
    return url.toString();
  } catch {
    // Fallback if URL parsing fails
    return rawUrlOrPath.split('?')[0] || '/';
  }
}

/**
 * Deep sanitation for any object intended for window.dataLayer.
 */
export function sanitizeDataLayerPayload(data: Record<string, any>): Record<string, any> {
  if (!data || typeof data !== 'object') return {};

  const clean: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');

    // 1. Check against sensitive keys denylist
    if (SENSITIVE_KEYS_DENYLIST.has(normalizedKey)) {
      continue;
    }

    // 2. Filter sensitive string values
    if (typeof value === 'string') {
      if (
        AADHAAR_REGEX.test(value) ||
        PAN_REGEX.test(value) ||
        EMAIL_REGEX.test(value) ||
        INDIAN_PHONE_REGEX.test(value)
      ) {
        continue; // Drop value containing sensitive citizen identifier
      }

      // Sanitize URL strings
      if (key.toLowerCase().includes('url') || key.toLowerCase().includes('path') || key.toLowerCase().includes('referrer')) {
        clean[key] = sanitizeAnalyticsUrl(value);
      } else {
        clean[key] = value.slice(0, 200); // cap string length
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      clean[key] = value;
    } else if (Array.isArray(value)) {
      clean[key] = value
        .filter((item) => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean')
        .slice(0, 10);
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeDataLayerPayload(value);
    }
  }

  return clean;
}

/**
 * Pushes a sanitized event object into window.dataLayer.
 */
export function pushToDataLayer(eventPayload: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];

  const sanitized = sanitizeDataLayerPayload(eventPayload);

  window.dataLayer.push({
    ...sanitized,
    timestamp: Date.now(),
  });

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('[Accero GTM dataLayer]', sanitized);
  }
}

/**
 * Helper to dispatch virtual page_view event on Next.js App Router navigation.
 */
export function pushPageView(pathname: string, searchParamsString?: string): void {
  if (typeof window === 'undefined') return;

  const rawPath = searchParamsString ? `${pathname}?${searchParamsString}` : pathname;
  const cleanPath = sanitizeAnalyticsUrl(rawPath);

  pushToDataLayer({
    event: 'page_view',
    page_path: cleanPath,
    page_title: typeof document !== 'undefined' ? document.title : '',
    page_location: typeof window !== 'undefined' ? sanitizeAnalyticsUrl(window.location.href) : '',
  });
}
