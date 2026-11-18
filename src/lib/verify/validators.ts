/**
 * Pure validation utilities for Voter (EPIC) input and NeoAPI Voter responses.
 * Safe for both server and client usage.
 */

export const EPIC_FORMAT_REGEX = /^(?:[A-Z]{3}[0-9]{7}|[A-Z]{2}[0-9]{8,14}|[A-Z]{2}\/\d{2}\/\d{3}\/\d{6,7})$/;

export type VoterValidationErrorCode =
  | 'INVALID_EPIC'
  | 'AUTH_ERROR'
  | 'MALFORMED_RESPONSE'
  | 'EMPTY_DOCS'
  | 'PROVIDER_ERROR'
  | 'INVALID_STATUS'
  | 'INVALID_SAMPLE_CODE'
  | 'EPIC_MISMATCH'
  | 'NOT_FOUND'
  | 'CAPTCHA_REQUIRED'
  | 'CAPTCHA_INVALID'
  | 'CAPTCHA_EXPIRED';

export function normalizeEpicNumber(raw: string | null | undefined): string {
  return (raw || '').trim().replace(/\s+/g, '').toUpperCase();
}

export function validateEpicNumber(raw: string | null | undefined): {
  valid: boolean;
  normalized: string;
  errorMessage?: string;
} {
  const normalized = normalizeEpicNumber(raw);

  if (!normalized) {
    return {
      valid: false,
      normalized: '',
      errorMessage: 'Please enter a Voter EPIC number.',
    };
  }

  if (!EPIC_FORMAT_REGEX.test(normalized)) {
    return {
      valid: false,
      normalized,
      errorMessage: 'Please enter a valid Voter EPIC number (e.g. IFV1949684).',
    };
  }

  return {
    valid: true,
    normalized,
  };
}

function isPlainObject(val: unknown): val is Record<string, any> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function pickString(val: unknown): string {
  return typeof val === 'string' ? val.trim() : '';
}

function isSuccessMessage(msg: string): boolean {
  return /^(?:success|successful|successfully|ok)$/i.test(msg.trim());
}

function isAuthErrorText(text: string): boolean {
  return /invalid\s*api\s*key|api\s*key.*invalid|unauthoriz|forbidden|invalid\s*token|auth(?:entication)?\s*fail|access\s*denied|not\s*authorized|allowed_ips/i.test(
    text
  );
}

function isSuccessStatusFlag(status: unknown): boolean {
  if (status === true) return true;
  if (typeof status === 'string') {
    const clean = status.trim().toLowerCase();
    return clean === 'true' || clean === 'success';
  }
  return false;
}

function isValidSampleCode(code: unknown): boolean {
  if (code === undefined || code === null) return true;
  const str = String(code).trim();
  if (!str) return true;
  return str === '200';
}

export interface NeoApiVoterValidationResult {
  valid: boolean;
  doc?: Record<string, any>;
  errorCode?: VoterValidationErrorCode;
  reason?: string;
}

/**
 * Strictly validates a NeoAPI V1/V2 Voter response payload against business rules:
 * - Top-level Message indicates success
 * - response.docs exists and is a non-empty array
 * - docs[0].Message indicates success
 * - docs[0].status indicates success
 * - sampleCode indicates success where applicable
 * - Returned epic_no matches requested EPIC after normalization
 */
export function validateNeoApiVoterResponse(
  json: unknown,
  requestedEpic: string
): NeoApiVoterValidationResult {
  if (!isPlainObject(json)) {
    return {
      valid: false,
      errorCode: 'MALFORMED_RESPONSE',
      reason: 'Provider returned non-object JSON payload.',
    };
  }

  const topError = pickString(json.error);
  const topMsg = pickString(json.Message ?? json.message);

  if (
    isAuthErrorText(topError) ||
    isAuthErrorText(topMsg) ||
    String(json.sampleCode ?? '').trim() === '401' ||
    String(json.sampleCode ?? '').trim() === '403'
  ) {
    return {
      valid: false,
      errorCode: 'AUTH_ERROR',
      reason: 'Provider rejected credentials or outbound IP authorization.',
    };
  }

  if (topError) {
    return {
      valid: false,
      errorCode: 'PROVIDER_ERROR',
      reason: 'Provider returned top-level error.',
    };
  }

  if (json.status === false || (typeof json.status === 'string' && ['false', 'error', 'failed'].includes(json.status.trim().toLowerCase()))) {
    return {
      valid: false,
      errorCode: 'INVALID_STATUS',
      reason: 'Provider top-level status indicated failure.',
    };
  }

  if (!isSuccessMessage(topMsg)) {
    const isNotFound =
      /not\s*found|no\s*record/i.test(topMsg) ||
      /not\s*found|no\s*record/i.test(topError) ||
      String(json.sampleCode ?? '').trim() === '404' ||
      (Array.isArray((json as any).response?.docs) &&
        (json as any).response.docs.some((d: any) =>
          /not\s*found|no\s*record/i.test(String(d?.Message || '')) ||
          String(d?.sampleCode || '').trim() === '404'
        ));

    return {
      valid: false,
      errorCode: isNotFound ? 'NOT_FOUND' : 'PROVIDER_ERROR',
      reason: isNotFound ? 'No voter record found.' : 'Top-level Message did not indicate success.',
    };
  }

  if (!isValidSampleCode(json.sampleCode)) {
    return {
      valid: false,
      errorCode: 'INVALID_SAMPLE_CODE',
      reason: 'Top-level sampleCode did not indicate success.',
    };
  }

  const docs = json.response?.docs;
  if (!Array.isArray(docs) || docs.length === 0) {
    return {
      valid: false,
      errorCode: 'EMPTY_DOCS',
      reason: 'response.docs is missing or empty.',
    };
  }

  const doc = docs[0];
  if (!isPlainObject(doc)) {
    return {
      valid: false,
      errorCode: 'MALFORMED_RESPONSE',
      reason: 'response.docs[0] is not a valid object.',
    };
  }

  const docError = pickString(doc.error);
  const docMsg = pickString(doc.Message ?? doc.message);

  if (isAuthErrorText(docError) || isAuthErrorText(docMsg)) {
    return {
      valid: false,
      errorCode: 'AUTH_ERROR',
      reason: 'Provider rejected credentials in document payload.',
    };
  }

  if (docError) {
    return {
      valid: false,
      errorCode: 'PROVIDER_ERROR',
      reason: 'Document entry contained error.',
    };
  }

  if (!isSuccessMessage(docMsg)) {
    return {
      valid: false,
      errorCode: /not\s*found|no\s*record/i.test(docMsg) ? 'NOT_FOUND' : 'PROVIDER_ERROR',
      reason: 'docs[0].Message did not indicate success.',
    };
  }

  if (!isSuccessStatusFlag(doc.status)) {
    return {
      valid: false,
      errorCode: 'INVALID_STATUS',
      reason: 'docs[0].status did not indicate success.',
    };
  }

  if (!isValidSampleCode(doc.sampleCode)) {
    return {
      valid: false,
      errorCode: 'INVALID_SAMPLE_CODE',
      reason: 'docs[0].sampleCode did not indicate success.',
    };
  }

  const normalizedRequested = normalizeEpicNumber(requestedEpic);
  const normalizedReturned = normalizeEpicNumber(
    typeof doc.epic_no === 'string'
      ? doc.epic_no
      : typeof doc.epicNumber === 'string'
        ? doc.epicNumber
        : ''
  );

  if (!normalizedReturned || normalizedReturned !== normalizedRequested) {
    return {
      valid: false,
      errorCode: 'EPIC_MISMATCH',
      reason: 'Returned EPIC number did not match requested EPIC number.',
    };
  }

  return {
    valid: true,
    doc,
  };
}

export interface WebApiInVoterValidationResult {
  valid: boolean;
  doc?: Record<string, any>;
  errorCode?: VoterValidationErrorCode;
  reason?: string;
}

/**
 * Strictly validates a WebAPI.in Voter response payload:
 * - status must be true (or indicate success)
 * - data must be a valid non-empty object
 * - Returned epicNumber matches requested EPIC after normalization
 * - Identifies auth, not-found, and captcha specific failure codes
 */
export function validateWebApiInVoterResponse(
  raw: unknown,
  requestedEpic: string
): WebApiInVoterValidationResult {
  if (!isPlainObject(raw)) {
    return {
      valid: false,
      errorCode: 'MALFORMED_RESPONSE',
      reason: 'WebAPI.in returned non-object response payload.',
    };
  }

  const msg = pickString(raw.message ?? raw.Message ?? raw.error);
  const status = raw.status;

  if (isAuthErrorText(msg)) {
    return {
      valid: false,
      errorCode: 'AUTH_ERROR',
      reason: 'WebAPI.in authentication or token error.',
    };
  }

  if (/captcha\s*(?:is\s*)?required/i.test(msg)) {
    return {
      valid: false,
      errorCode: 'CAPTCHA_REQUIRED',
      reason: 'Voter lookup requires captcha verification.',
    };
  }

  if (/invalid\s*captcha/i.test(msg) || /wrong\s*captcha/i.test(msg)) {
    return {
      valid: false,
      errorCode: 'CAPTCHA_INVALID',
      reason: 'Incorrect captcha entered.',
    };
  }

  if (/captcha\s*expired/i.test(msg) || /session\s*expired/i.test(msg)) {
    return {
      valid: false,
      errorCode: 'CAPTCHA_EXPIRED',
      reason: 'Captcha challenge has expired.',
    };
  }

  if (status !== true && status !== 'true') {
    if (/(?:not\s*found|no\s*(?:.*)?found|invalid\s*(?:epic|voter)|record\s*not\s*found|no\s*record)/i.test(msg)) {
      return {
        valid: false,
        errorCode: 'NOT_FOUND',
        reason: msg || 'No voter record found for this EPIC.',
      };
    }
    return {
      valid: false,
      errorCode: 'PROVIDER_ERROR',
      reason: msg || 'WebAPI.in status did not indicate success.',
    };
  }

  const doc = isPlainObject(raw.data) ? raw.data : undefined;
  if (!doc || Object.keys(doc).length === 0) {
    return {
      valid: false,
      errorCode: 'EMPTY_DOCS',
      reason: 'WebAPI.in data object was empty or missing.',
    };
  }

  const normalizedRequested = normalizeEpicNumber(requestedEpic);
  const normalizedReturned = normalizeEpicNumber(
    doc.epicNumber || doc.epic || doc.voter_no || raw.epic || ''
  );

  if (normalizedReturned && normalizedReturned !== normalizedRequested) {
    return {
      valid: false,
      errorCode: 'EPIC_MISMATCH',
      reason: 'Returned EPIC number did not match requested EPIC number.',
    };
  }

  return {
    valid: true,
    doc,
  };
}

export interface WebApiInCaptchaValidationResult {
  valid: boolean;
  captchaId?: string;
  captchaDataUri?: string;
  errorCode?: 'MALFORMED_RESPONSE' | 'AUTH_ERROR' | 'PROVIDER_ERROR';
  reason?: string;
}

/**
 * Validates a WebAPI.in captcha generation payload:
 * - success is true
 * - captchaId is a non-empty string
 * - captcha is a valid data URI or base64 string
 */
export function validateWebApiInCaptchaResponse(raw: unknown): WebApiInCaptchaValidationResult {
  if (!isPlainObject(raw)) {
    return {
      valid: false,
      errorCode: 'MALFORMED_RESPONSE',
      reason: 'Non-object captcha response payload.',
    };
  }

  const msg = pickString(raw.message ?? raw.error);
  if (isAuthErrorText(msg)) {
    return {
      valid: false,
      errorCode: 'AUTH_ERROR',
      reason: 'Authentication error generating captcha.',
    };
  }

  const isSuccess = raw.success === true || raw.status === true;
  const captchaId = pickString(raw.captchaId || raw.captcha_id);
  const captcha = pickString(raw.captcha);

  if (!isSuccess || !captchaId || !captcha) {
    return {
      valid: false,
      errorCode: 'PROVIDER_ERROR',
      reason: msg || 'Captcha generation response missing required fields.',
    };
  }

  // Ensure captcha has data URI prefix
  const captchaDataUri = captcha.startsWith('data:') ? captcha : `data:image/jpeg;base64,${captcha}`;

  return {
    valid: true,
    captchaId,
    captchaDataUri,
  };
}

