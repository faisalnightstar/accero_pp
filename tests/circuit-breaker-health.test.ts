import { describe, it, expect, beforeEach, vi } from 'vitest';
import { circuitBreaker } from '@/lib/reliability/circuitBreaker';
import { providerHealthTracker } from '@/lib/reliability/providerHealth';
import { classifyProviderError } from '@/lib/reliability/errorClassifier';

describe('Circuit Breaker & Provider Health Monitoring', () => {
  beforeEach(() => {
    circuitBreaker.resetAll();
    providerHealthTracker.resetMetrics('test_provider');
  });

  describe('Circuit Breaker State Machine', () => {
    it('initializes in CLOSED state and allows requests', () => {
      expect(circuitBreaker.canExecute('test_provider')).toBe(true);
      const status = circuitBreaker.getStatus('test_provider');
      expect(status.state).toBe('CLOSED');
      expect(status.consecutiveFailures).toBe(0);
    });

    it('does NOT trip circuit for non-retryable errors (e.g. invalid EPIC or record not found)', () => {
      // Record 5 non-retryable failures
      for (let i = 0; i < 5; i++) {
        circuitBreaker.recordFailure('test_provider', false);
      }

      const status = circuitBreaker.getStatus('test_provider');
      expect(status.state).toBe('CLOSED');
      expect(status.consecutiveFailures).toBe(0);
      expect(circuitBreaker.canExecute('test_provider')).toBe(true);
    });

    it('trips from CLOSED to OPEN after 3 consecutive retryable failures', () => {
      circuitBreaker.recordFailure('test_provider', true);
      expect(circuitBreaker.getStatus('test_provider').state).toBe('CLOSED');
      expect(circuitBreaker.getStatus('test_provider').consecutiveFailures).toBe(1);

      circuitBreaker.recordFailure('test_provider', true);
      expect(circuitBreaker.getStatus('test_provider').state).toBe('CLOSED');
      expect(circuitBreaker.getStatus('test_provider').consecutiveFailures).toBe(2);

      circuitBreaker.recordFailure('test_provider', true);
      expect(circuitBreaker.getStatus('test_provider').state).toBe('OPEN');
      expect(circuitBreaker.getStatus('test_provider').consecutiveFailures).toBe(3);

      // Now execution is blocked
      expect(circuitBreaker.canExecute('test_provider')).toBe(false);
    });

    it('transitions to HALF_OPEN after cooldown period passes', () => {
      const now = Date.now();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      // Trip the breaker to OPEN
      circuitBreaker.recordFailure('test_provider', true);
      circuitBreaker.recordFailure('test_provider', true);
      circuitBreaker.recordFailure('test_provider', true);
      expect(circuitBreaker.canExecute('test_provider')).toBe(false);

      // Advance time by 59 seconds (cooldown is 60s)
      vi.advanceTimersByTime(59000);
      expect(circuitBreaker.canExecute('test_provider')).toBe(false);

      // Advance past 60s cooldown
      vi.advanceTimersByTime(2000);
      expect(circuitBreaker.canExecute('test_provider')).toBe(true);
      expect(circuitBreaker.getStatus('test_provider').state).toBe('HALF_OPEN');

      vi.useRealTimers();
    });

    it('re-trips to OPEN if HALF_OPEN probe fails', () => {
      const now = Date.now();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      // Trip to OPEN
      circuitBreaker.recordFailure('test_provider', true);
      circuitBreaker.recordFailure('test_provider', true);
      circuitBreaker.recordFailure('test_provider', true);

      // Advance past cooldown to HALF_OPEN
      vi.advanceTimersByTime(61000);
      expect(circuitBreaker.canExecute('test_provider')).toBe(true);
      expect(circuitBreaker.getStatus('test_provider').state).toBe('HALF_OPEN');

      // Probe fails
      circuitBreaker.recordFailure('test_provider', true);
      expect(circuitBreaker.getStatus('test_provider').state).toBe('OPEN');
      expect(circuitBreaker.canExecute('test_provider')).toBe(false);

      vi.useRealTimers();
    });

    it('recovers to CLOSED if HALF_OPEN probe succeeds', () => {
      const now = Date.now();
      vi.useFakeTimers();
      vi.setSystemTime(now);

      // Trip to OPEN
      circuitBreaker.recordFailure('test_provider', true);
      circuitBreaker.recordFailure('test_provider', true);
      circuitBreaker.recordFailure('test_provider', true);

      // Advance past cooldown to HALF_OPEN
      vi.advanceTimersByTime(61000);
      expect(circuitBreaker.canExecute('test_provider')).toBe(true);

      // Probe succeeds
      circuitBreaker.recordSuccess('test_provider');
      expect(circuitBreaker.getStatus('test_provider').state).toBe('CLOSED');
      expect(circuitBreaker.getStatus('test_provider').consecutiveFailures).toBe(0);
      expect(circuitBreaker.canExecute('test_provider')).toBe(true);

      vi.useRealTimers();
    });

    it('resets circuit manually via admin reset', () => {
      circuitBreaker.recordFailure('test_provider', true);
      circuitBreaker.recordFailure('test_provider', true);
      circuitBreaker.recordFailure('test_provider', true);
      expect(circuitBreaker.getStatus('test_provider').state).toBe('OPEN');

      circuitBreaker.reset('test_provider');
      expect(circuitBreaker.getStatus('test_provider').state).toBe('CLOSED');
      expect(circuitBreaker.canExecute('test_provider')).toBe(true);
    });
  });

  describe('Provider Health Metrics Tracking', () => {
    it('accurately tracks requests, success rate, and latencies', () => {
      providerHealthTracker.recordExecution({
        providerId: 'test_provider',
        success: true,
        latencyMs: 100,
      });

      providerHealthTracker.recordExecution({
        providerId: 'test_provider',
        success: true,
        latencyMs: 200,
      });

      providerHealthTracker.recordExecution({
        providerId: 'test_provider',
        success: false,
        latencyMs: 300,
        isTimeout: true,
        isRetryable: true,
        errorMessage: 'Gateway Timeout',
      });

      const metrics = providerHealthTracker.getMetrics('test_provider');
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.successfulRequests).toBe(2);
      expect(metrics.failedRequests).toBe(1);
      expect(metrics.timeoutCount).toBe(1);
      expect(metrics.successRate).toBe(67); // 2/3 = 67%
      expect(metrics.avgLatencyMs).toBe(200); // (100+200+300)/3
      expect(metrics.p50LatencyMs).toBe(200);
      expect(metrics.lastErrorMessage).toBe('Gateway Timeout');
    });
  });

  describe('Error Classification', () => {
    it('classifies invalid EPIC and not found as non-retryable', () => {
      const err1 = classifyProviderError({ errorCode: 'INVALID_EPIC' });
      expect(err1.retryable).toBe(false);
      expect(err1.category).toBe('VALIDATION_ERROR');

      const err2 = classifyProviderError({ errorCode: 'NOT_FOUND', statusCode: 404 });
      expect(err2.retryable).toBe(false);
      expect(err2.category).toBe('NOT_FOUND');

      const err3 = classifyProviderError({ errorCode: 'CAPTCHA_INVALID' });
      expect(err3.retryable).toBe(false);
      expect(err3.category).toBe('CAPTCHA_ERROR');
    });

    it('classifies timeouts, 5xx, and rate limits as retryable', () => {
      const err1 = classifyProviderError({ statusCode: 504, errorMessage: 'Gateway Timeout' });
      expect(err1.retryable).toBe(true);
      expect(err1.category).toBe('TIMEOUT');

      const err2 = classifyProviderError({ statusCode: 429, errorMessage: 'Rate limit exceeded' });
      expect(err2.retryable).toBe(true);
      expect(err2.category).toBe('RATE_LIMITED');

      const err3 = classifyProviderError({ errorCode: 'MALFORMED_RESPONSE' });
      expect(err3.retryable).toBe(true);
      expect(err3.category).toBe('PROVIDER_ERROR');

      const err4 = classifyProviderError({ errorCode: 'AUTH_ERROR', statusCode: 401 });
      expect(err4.retryable).toBe(true);
      expect(err4.category).toBe('AUTH_ERROR');
    });
  });
});
