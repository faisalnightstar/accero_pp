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
  | 'NOT_FOUND';

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
    return {
      valid: false,
      errorCode: /not\s*found|no\s*record/i.test(topMsg) ? 'NOT_FOUND' : 'PROVIDER_ERROR',
      reason: 'Top-level Message did not indicate success.',
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

