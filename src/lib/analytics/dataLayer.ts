/**
 * Accero PrintPortal - Privacy-Preserving Google Tag Manager / dataLayer Engine
 * https://printportal.accero.app
 *
 * PRIVACY GUARANTEES:
 * 1. Zero Citizen PII: Strips document numbers (Aadhaar, PAN, Voter, DL, RC, Ration), names, photos, DOB.
 * 2. Zero Financial Data: Strips wallet balances, bank accounts, UPI IDs, ledgers.
 * 3. Sanitized URLs: Strips query parameters containing sensitive tokens or document references.
 * 4. Safe Failover: Operates safely during SSR, SSG, and client environments without throwing errors.
 * 5. Adversarial Hardening: Defends against circular references, Unicode whitespace, nested arrays, and sentence embeddings.
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
 * Explicit allowlist of legitimate analytics parameter keys.
 * Normalized to lowercase alphanumeric without punctuation.
 */
const SAFE_EXEMPT_KEYS = new Set([
  'doctype',
  'doccategory',
  'itemname',
  'itemid',
  'paymentmethod',
  'transactionid',
  'orderid',
  'pagepath',
  'pagetitle',
  'pagelocation',
  'referrer',
  'errortype',
  'printformat',
  'printertray',
  'operatorrole',
  'devicetype',
  'safestatus',
  'safemetadata',
  'safeparam',
  'safemetric',
  'safecontext',
  'safenote',
  'status',
  'isreprint',
  'fee',
  'value',
  'price',
  'quantity',
  'rechargeamount',
  'timestamp',
  'currency',
  'ismanual',
  'missingcount',
  'event',
  'method',
  'createdat',
  'label',
  'identifier',
]);

/**
 * Root tokens for sensitive citizen or authentication keys.
 */
const SENSITIVE_KEY_ROOTS = [
  'aadhaar',
  'aadhar',
  'uid',
  'pan',
  'epic',
  'voter',
  'dl',
  'licen',
  'rc',
  'chassis',
  'engine',
  'ration',
  'farmer',
  'agristack',
  'father',
  'mother',
  'spouse',
  'citizen',
  'beneficiary',
  'fullname',
  'firstname',
  'lastname',
  'dob',
  'birth',
  'address',
  'city',
  'pincode',
  'mobile',
  'phone',
  'contact',
  'cell',
  'sms',
  'email',
  'upi',
  'vpa',
  'bank',
  'account',
  'ifsc',
  'cardnumber',
  'cvv',
  'expiry',
  'balance',
  'ledger',
  'walletbal',
  'password',
  'passcode',
  'secret',
  'jwt',
  'token',
  'auth',
  'bearer',
  'apikey',
  'photo',
  'signature',
  'image',
  'canvas',
  'biometric',
  'fingerprint',
  'iris',
];

/**
 * Regex patterns to detect sensitive values even when embedded in sentences.
 */
const SENSITIVE_PATTERNS = [
  // 12-digit Aadhaar / identity number (continuous or spaced)
  /(?:^|\D)\d{4}\s?\d{4}\s?\d{4}(?:\D|$)/,
  // 10-char Indian PAN
  /(?:^|\D)[A-Z]{5}\s?[0-9]{4}\s?[A-Z](?:\D|$)/i,
  // EPIC / Voter ID (3 letters + 7 digits)
  /(?:^|\D)[A-Z]{3}\s?[0-9]{7}(?:\D|$)/i,
  // Driving Licence (e.g., DL0420220000001, MH12 20110012345)
  /(?:^|\D)[A-Z]{2}[-\s]?[0-9]{2}\s?[0-9]{4}[-\s]?[0-9]{7}(?:\D|$)/i,
  /(?:^|\D)DL[-\s]?[0-9]{10,15}(?:\D|$)/i,
  // Vehicle RC (e.g., DL01AB1234, MH-12-DE-1433)
  /(?:^|\D)[A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{4}(?:\D|$)/i,
  // Indian Mobile (+91, 91, 0, or 10-digit)
  /(?:^|\D)(?:\+91|91|0)?[6-9]\d{9}(?:\D|$)/,
  // Email Address
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
  // IFSC Code
  /\b[A-Z]{4}0[A-Z0-9]{6}\b/i,
  // UPI VPA
  /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/,
  // JWT Token structure
  /eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+/,
  // Bearer Token / API Key
  /(?:Bearer\s+[A-Za-z0-9-_.]+|sk_live_[A-Za-z0-9]+)/i,
];

/**
 * Checks whether a key is classified as sensitive citizen or auth metadata.
 */
function isKeySensitive(rawKey: string): boolean {
  const normKey = rawKey.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Exact exempt keys are safe
  if (SAFE_EXEMPT_KEYS.has(normKey)) {
    return false;
  }

  // Exact match for name
  if (normKey === 'name' || normKey === 'fname' || normKey === 'lname') {
    return true;
  }

  // Check against sensitive root tokens
  for (const root of SENSITIVE_KEY_ROOTS) {
    if (root === 'dl' || root === 'rc' || root === 'uid') {
      if (normKey === root || normKey.startsWith(root) || normKey.endsWith(root)) {
        return true;
      }
    } else if (normKey.includes(root)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether a string value contains sensitive citizen or authentication data.
 */
function isValueSensitive(val: string, key?: string): boolean {
  const normKey = (key || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  // Allow transaction IDs, order IDs, timestamps from sensitive pattern rejection
  if (normKey === 'transactionid' || normKey === 'orderid' || normKey === 'timestamp' || normKey === 'itemid') {
    return false;
  }

  // Normalize unicode spaces and control characters
  const normalized = val.replace(/[\u200B-\u200D\uFEFF\u00A0\t\r\n]+/g, ' ').trim();

  // Fast check: Base64 data URIs
  if (normalized.startsWith('data:image/') || normalized.startsWith('data:application/')) {
    return true;
  }

  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(normalized));
}

/**
 * Strips sensitive query parameters from URLs or paths before sending to analytics.
 */
export function sanitizeAnalyticsUrl(rawUrlOrPath: string): string {
  if (!rawUrlOrPath) return '/';

  try {
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
      'aadhar',
      'pan',
      'epic',
      'voter',
      'dl',
      'rc',
      'ration',
      'farmer',
      'email',
      'phone',
      'mobile',
      'code',
      'session',
      'jwt',
      'bearer',
    ];

    sensitiveParamNames.forEach((param) => {
      url.searchParams.delete(param);
    });

    if (isRelative) {
      return url.pathname + (url.search ? url.search : '');
    }
    return url.toString();
  } catch {
    return rawUrlOrPath.split('?')[0] || '/';
  }
}

/**
 * Deep sanitization for any object intended for window.dataLayer or analytics dispatchers.
 * Guards against circular references, nested objects, and arrays.
 */
export function sanitizeDataLayerPayload(
  data: Record<string, any>,
  visited: WeakSet<object> = new WeakSet()
): Record<string, any> {
  if (!data || typeof data !== 'object') return {};

  // Detect and break circular references
  if (visited.has(data)) {
    return {};
  }
  visited.add(data);

  const clean: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      continue;
    }

    // 1. Key Denylist Check
    if (isKeySensitive(key)) {
      continue; // Drop key entirely
    }

    // 2. Special object handling
    if (value instanceof Date) {
      clean[key] = value.toISOString();
      continue;
    }

    if (value instanceof Error) {
      if (!isValueSensitive(value.message, key)) {
        clean[key] = value.message.slice(0, 200);
      } else {
        clean[key] = '[REDACTED_PII]';
      }
      continue;
    }

    // 3. String value checks
    if (typeof value === 'string') {
      if (value === '[REDACTED_PII]') {
        clean[key] = value;
        continue;
      }

      if (isValueSensitive(value, key)) {
        continue; // Drop key entirely from dataLayer
      }

      // Sanitize URL strings
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('url') || lowerKey.includes('path') || lowerKey.includes('referrer')) {
        clean[key] = sanitizeAnalyticsUrl(value);
      } else {
        clean[key] = value.slice(0, 200);
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      clean[key] = value;
    } else if (Array.isArray(value)) {
      clean[key] = value
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            return sanitizeDataLayerPayload(item, visited);
          }
          if (typeof item === 'string') {
            return isValueSensitive(item) ? '[REDACTED_PII]' : item.slice(0, 200);
          }
          if (typeof item === 'number' || typeof item === 'boolean') {
            return item;
          }
          return null;
        })
        .filter((item) => item !== null && (typeof item !== 'object' || Object.keys(item).length > 0))
        .slice(0, 10);
    } else if (typeof value === 'object') {
      const nestedClean = sanitizeDataLayerPayload(value, visited);
      if (Object.keys(nestedClean).length > 0) {
        clean[key] = nestedClean;
      }
    }
  }

  return clean;
}

/**
 * Authoritative push to window.dataLayer after strict central sanitization.
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
 * Dispatches virtual page_view event on Next.js App Router navigation.
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
