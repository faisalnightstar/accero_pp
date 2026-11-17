/**
 * Standardized PAN Lookup Errors
 * Accero PrintPortal - Security & Error Architecture
 */

export type PanErrorCode =
  | 'INVALID_PAN'
  | 'UNAUTHORIZED'
  | 'INVALID_TOKEN'
  | 'AUTH_ERROR'
  | 'INSUFFICIENT_BALANCE'
  | 'NOT_FOUND'
  | 'TIMEOUT'
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_JSON'
  | 'PAN_MISMATCH'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNEXPECTED_FORMAT'
  | 'INTERNAL_ERROR';

export class PanLookupError extends Error {
  public readonly code: PanErrorCode;
  public readonly httpStatus: number;
  public readonly isOperational: boolean;

  constructor(code: PanErrorCode, message: string, httpStatus: number = 400) {
    super(message);
    this.name = 'PanLookupError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.isOperational = true;
    Object.setPrototypeOf(this, PanLookupError.prototype);
  }
}

/**
 * User-friendly error message dictionary that avoids exposing raw stack traces,
 * API tokens, internal URLs, or implementation details.
 */
export const PAN_ERROR_MESSAGES: Record<PanErrorCode, string> = {
  INVALID_PAN: 'Please enter a valid 10-character PAN number (e.g. ABCDE1234F).',
  UNAUTHORIZED: 'Authentication required. Please sign in to verify PAN cards.',
  INVALID_TOKEN: 'PAN verification gateway service configuration error. Please contact support.',
  AUTH_ERROR: 'Provider authentication failed. Please contact administrator.',
  INSUFFICIENT_BALANCE: 'Insufficient wallet balance for PAN verification.',
  NOT_FOUND: 'No matching records found for the requested PAN number.',
  TIMEOUT: 'PAN verification request timed out. Please try again in a few moments.',
  PROVIDER_UNAVAILABLE: 'Government PAN verification server is currently unreachable. Please try again shortly.',
  INVALID_JSON: 'Received an invalid response from the verification server.',
  PAN_MISMATCH: 'Security validation failed: provider returned mismatched identity information.',
  RATE_LIMIT_EXCEEDED: 'Too many lookup requests. Please wait a minute before trying again.',
  UNEXPECTED_FORMAT: 'Verification response was incomplete or in an unexpected format.',
  INTERNAL_ERROR: 'An error occurred while processing the PAN lookup. No fee was charged.',
};

/**
 * Sanitizes any raw error message or exception into a safe, human-readable user message.
 */
export function getSafePanErrorMessage(err: unknown, defaultCode: PanErrorCode = 'INTERNAL_ERROR'): {
  code: PanErrorCode;
  message: string;
} {
  if (err instanceof PanLookupError) {
    return {
      code: err.code,
      message: err.message,
    };
  }

  const msg = err instanceof Error ? err.message : String(err || '');
  const lower = msg.toLowerCase();

  if (lower.includes('timeout') || lower.includes('aborted')) {
    return { code: 'TIMEOUT', message: PAN_ERROR_MESSAGES.TIMEOUT };
  }
  if (lower.includes('token') || lower.includes('unauthorized') || lower.includes('auth')) {
    return { code: 'INVALID_TOKEN', message: PAN_ERROR_MESSAGES.INVALID_TOKEN };
  }
  if (lower.includes('network') || lower.includes('econnrefused') || lower.includes('unreachable') || lower.includes('enotfound')) {
    return { code: 'PROVIDER_UNAVAILABLE', message: PAN_ERROR_MESSAGES.PROVIDER_UNAVAILABLE };
  }
  if (lower.includes('json') || lower.includes('syntaxerror')) {
    return { code: 'INVALID_JSON', message: PAN_ERROR_MESSAGES.INVALID_JSON };
  }
  if (lower.includes('balance')) {
    return { code: 'INSUFFICIENT_BALANCE', message: PAN_ERROR_MESSAGES.INSUFFICIENT_BALANCE };
  }

  return {
    code: defaultCode,
    message: PAN_ERROR_MESSAGES[defaultCode] || 'PAN lookup failed. No fee was charged.',
  };
}
