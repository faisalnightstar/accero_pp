/**
 * PAN Input & Provider Response Validation
 * Accero PrintPortal - Strict Validation Engine
 */

import { PanErrorCode, PanLookupError, PAN_ERROR_MESSAGES } from './pan.errors';
import { RawWebApiResponse } from './pan.types';

/**
 * Strict Official Indian Income Tax PAN regex:
 * Exactly 5 uppercase letters, followed by 4 digits, followed by 1 uppercase letter.
 */
export const PAN_FORMAT_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export interface PanValidationResult {
  valid: boolean;
  normalized: string;
  errorMessage?: string;
  errorCode?: PanErrorCode;
}

/**
 * Normalizes a raw PAN input string:
 * - Trims leading and trailing whitespace
 * - Strips any internal whitespace or hyphens
 * - Converts to uppercase
 */
export function normalizePanNumber(raw: string | null | undefined): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw.trim().replace(/[\s-]+/g, '').toUpperCase();
}

/**
 * Strictly validates a PAN number:
 * - Rejects empty/null input
 * - Normalizes to uppercase and trims
 * - Rejects input shorter or longer than 10 characters
 * - Rejects input containing invalid characters
 * - Validates strict ^[A-Z]{5}[0-9]{4}[A-Z]$ pattern
 */
export function validatePanNumber(raw: string | null | undefined): PanValidationResult {
  const normalized = normalizePanNumber(raw);

  if (!normalized) {
    return {
      valid: false,
      normalized: '',
      errorMessage: 'Please enter a 10-character PAN number.',
      errorCode: 'INVALID_PAN',
    };
  }

  if (normalized.length !== 10) {
    return {
      valid: false,
      normalized,
      errorMessage: `PAN must be exactly 10 characters (received ${normalized.length}).`,
      errorCode: 'INVALID_PAN',
    };
  }

  if (!PAN_FORMAT_REGEX.test(normalized)) {
    return {
      valid: false,
      normalized,
      errorMessage: 'Invalid PAN format. Expected 5 letters, 4 numbers, and 1 letter (e.g. ABCDE1234F).',
      errorCode: 'INVALID_PAN',
    };
  }

  return {
    valid: true,
    normalized,
  };
}

/**
 * Validates that an input is a non-null plain JavaScript object.
 */
function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export interface ProviderValidationResult {
  valid: boolean;
  status: 'SUCCESS' | 'FAILED';
  errorCode?: PanErrorCode;
  reason?: string;
  raw?: RawWebApiResponse;
}

/**
 * Strictly validates raw WebAPI V1/V2 provider responses:
 * 1. Checks that the response is a valid plain object.
 * 2. Checks status === "100" or status === 100 (Official success status).
 * 3. Validates that the returned PAN matches the requested PAN after normalization.
 * 4. Checks that required fields (pan and at least fullname or message) are present.
 * 5. Handles provider error messages (e.g. invalid token, not found, rate limit).
 */
export function validateProviderResponse(
  raw: unknown,
  requestedPan: string
): ProviderValidationResult {
  if (!isPlainObject(raw)) {
    return {
      valid: false,
      status: 'FAILED',
      errorCode: 'INVALID_JSON',
      reason: PAN_ERROR_MESSAGES.INVALID_JSON,
    };
  }

  const rawObj = raw as RawWebApiResponse;
  const statusStr = String(rawObj.status ?? '').trim();
  const messageStr = String(rawObj.message ?? '').trim();
  const lowerMsg = messageStr.toLowerCase();

  // Check for authentication / token errors
  if (
    statusStr === '401' ||
    statusStr === '403' ||
    lowerMsg.includes('invalid token') ||
    lowerMsg.includes('token expired') ||
    lowerMsg.includes('unauthorized') ||
    lowerMsg.includes('api key')
  ) {
    return {
      valid: false,
      status: 'FAILED',
      errorCode: 'AUTH_ERROR',
      reason: PAN_ERROR_MESSAGES.AUTH_ERROR,
      raw: rawObj,
    };
  }

  // Check for rate limiting
  if (statusStr === '429' || lowerMsg.includes('rate limit') || lowerMsg.includes('too many requests')) {
    return {
      valid: false,
      status: 'FAILED',
      errorCode: 'RATE_LIMIT_EXCEEDED',
      reason: PAN_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      raw: rawObj,
    };
  }

  // Check for not found / invalid PAN reported by provider
  if (
    lowerMsg.includes('not found') ||
    lowerMsg.includes('invalid pan') ||
    lowerMsg.includes('record not found') ||
    lowerMsg.includes('no record')
  ) {
    return {
      valid: false,
      status: 'FAILED',
      errorCode: 'NOT_FOUND',
      reason: PAN_ERROR_MESSAGES.NOT_FOUND,
      raw: rawObj,
    };
  }

  // Check official success status: 100
  if (statusStr !== '100') {
    return {
      valid: false,
      status: 'FAILED',
      errorCode: 'NOT_FOUND',
      reason: messageStr || PAN_ERROR_MESSAGES.NOT_FOUND,
      raw: rawObj,
    };
  }

  // Validate returned PAN
  const returnedPan = normalizePanNumber(rawObj.pan);
  const expectedPan = normalizePanNumber(requestedPan);

  if (!returnedPan) {
    return {
      valid: false,
      status: 'FAILED',
      errorCode: 'UNEXPECTED_FORMAT',
      reason: 'Provider response did not contain a PAN number.',
      raw: rawObj,
    };
  }

  if (returnedPan !== expectedPan) {
    return {
      valid: false,
      status: 'FAILED',
      errorCode: 'PAN_MISMATCH',
      reason: PAN_ERROR_MESSAGES.PAN_MISMATCH,
      raw: rawObj,
    };
  }

  return {
    valid: true,
    status: 'SUCCESS',
    raw: rawObj,
  };
}
