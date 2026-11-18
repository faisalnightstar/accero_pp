/**
 * Error Classifier for Verification Providers
 *
 * Distinguishes between retryable (transient/infrastructure) and non-retryable
 * (client error / definitive absence of record) errors.
 *
 * Rules:
 * - Non-retryable errors (e.g. invalid EPIC format, citizen not registered, bad captcha, insufficient wallet)
 *   MUST NOT trigger failover cascade to sibling providers, and MUST NOT trip the provider's circuit breaker.
 * - Retryable errors (e.g. HTTP 5xx, gateway timeouts, connection resets, malformed JSON, provider rate limits)
 *   SHOULD trigger automatic failover to the next available provider, and DO trip the circuit breaker.
 */

export interface ClassifiedError {
  retryable: boolean;
  category:
    | 'VALIDATION_ERROR'
    | 'NOT_FOUND'
    | 'CAPTCHA_ERROR'
    | 'CLIENT_ERROR'
    | 'AUTH_ERROR'
    | 'TIMEOUT'
    | 'RATE_LIMITED'
    | 'INFRASTRUCTURE_ERROR'
    | 'PROVIDER_ERROR'
    | 'UNKNOWN';
  code: string;
  userFacingMessage: string;
}

export function classifyProviderError(params: {
  statusCode?: number;
  errorCode?: string;
  errorMessage?: string;
}): ClassifiedError {
  const code = (params.errorCode || '').toUpperCase();
  const status = params.statusCode || 0;
  const msg = (params.errorMessage || '').toLowerCase();

  // 1. Definite Non-Retryable Errors
  if (code === 'INVALID_EPIC' || code === 'VALIDATION_ERROR') {
    return {
      retryable: false,
      category: 'VALIDATION_ERROR',
      code: 'INVALID_EPIC',
      userFacingMessage: params.errorMessage || 'Please enter a valid Voter EPIC number.',
    };
  }

  if (code === 'NOT_FOUND' || msg.includes('not found') || msg.includes('no record') || status === 404) {
    return {
      retryable: false,
      category: 'NOT_FOUND',
      code: 'NOT_FOUND',
      userFacingMessage: 'No matching Voter record found for this EPIC number. No wallet fee was deducted.',
    };
  }

  if (code === 'CAPTCHA_INVALID' || msg.includes('invalid captcha') || msg.includes('wrong captcha')) {
    return {
      retryable: false,
      category: 'CAPTCHA_ERROR',
      code: 'CAPTCHA_INVALID',
      userFacingMessage: 'Incorrect captcha entered. Please try again with a new captcha.',
    };
  }

  if (code === 'CAPTCHA_EXPIRED' || msg.includes('captcha expired')) {
    return {
      retryable: false,
      category: 'CAPTCHA_ERROR',
      code: 'CAPTCHA_EXPIRED',
      userFacingMessage: 'Captcha has expired. Please refresh the captcha and try again.',
    };
  }

  if (code === 'UNAUTHORIZED' || code === 'INSUFFICIENT_BALANCE') {
    return {
      retryable: false,
      category: 'CLIENT_ERROR',
      code,
      userFacingMessage: params.errorMessage || 'Operation not permitted.',
    };
  }

  // 2. Retryable Errors
  if (code === 'TIMEOUT' || status === 408 || status === 504 || msg.includes('timeout') || msg.includes('aborted')) {
    return {
      retryable: true,
      category: 'TIMEOUT',
      code: 'TIMEOUT',
      userFacingMessage: 'Provider verification timed out. Failing over...',
    };
  }

  if (code === 'RATE_LIMITED' || status === 429 || msg.includes('rate limit') || msg.includes('too many requests')) {
    return {
      retryable: true,
      category: 'RATE_LIMITED',
      code: 'RATE_LIMITED',
      userFacingMessage: 'Provider rate limit exceeded. Failing over...',
    };
  }

  if (
    code === 'AUTH_ERROR' ||
    code === 'MISSING_API_KEY' ||
    code === 'MISSING_TOKEN' ||
    status === 401 ||
    status === 403 ||
    msg.includes('unauthorized') ||
    msg.includes('invalid token') ||
    msg.includes('invalid api key') ||
    msg.includes('access denied')
  ) {
    return {
      retryable: true,
      category: 'AUTH_ERROR',
      code: 'AUTH_ERROR',
      userFacingMessage: 'Provider authentication failed. Failing over...',
    };
  }

  if (
    code === 'PROXY_ERROR' ||
    code === 'FIXIE_CONFIG_ERROR' ||
    status === 502 ||
    status === 503 ||
    status === 500 ||
    msg.includes('econnrefused') ||
    msg.includes('enotfound') ||
    msg.includes('proxy')
  ) {
    return {
      retryable: true,
      category: 'INFRASTRUCTURE_ERROR',
      code: 'INFRASTRUCTURE_ERROR',
      userFacingMessage: 'Provider connection or infrastructure issue. Failing over...',
    };
  }

  if (
    code === 'MALFORMED_RESPONSE' ||
    code === 'EMPTY_DOCS' ||
    code === 'INVALID_STATUS' ||
    code === 'INVALID_SAMPLE_CODE' ||
    code === 'EPIC_MISMATCH' ||
    code === 'PROVIDER_ERROR'
  ) {
    return {
      retryable: true,
      category: 'PROVIDER_ERROR',
      code: code || 'PROVIDER_ERROR',
      userFacingMessage: 'Provider returned an incomplete or invalid response. Failing over...',
    };
  }

  // Default fallback: Treat unknown provider errors as retryable to attempt fallback
  return {
    retryable: true,
    category: 'UNKNOWN',
    code: code || 'UNKNOWN_ERROR',
    userFacingMessage: 'Unable to verify Voter ID with current provider. Failing over...',
  };
}
