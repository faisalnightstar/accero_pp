import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '@/lib/security/rateLimiter';

describe('Distributed Rate Limiting Engine', () => {
  it('allows requests within the specified limit', async () => {
    const testId = `test_user_${Date.now()}`;
    const customConfig = { maxRequests: 3, windowSeconds: 10 };

    const res1 = await checkRateLimit('TEST_ACTION', testId, customConfig);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = await checkRateLimit('TEST_ACTION', testId, customConfig);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = await checkRateLimit('TEST_ACTION', testId, customConfig);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it('blocks requests once the threshold is exceeded', async () => {
    const testId = `test_blocked_${Date.now()}`;
    const customConfig = { maxRequests: 2, windowSeconds: 10 };

    await checkRateLimit('TEST_BLOCKED', testId, customConfig);
    await checkRateLimit('TEST_BLOCKED', testId, customConfig);

    // Third request exceeds threshold
    const resBlocked = await checkRateLimit('TEST_BLOCKED', testId, customConfig);
    expect(resBlocked.allowed).toBe(false);
    expect(resBlocked.remaining).toBe(0);
    expect(resBlocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('isolates different identifiers independently', async () => {
    const userA = `user_a_${Date.now()}`;
    const userB = `user_b_${Date.now()}`;
    const customConfig = { maxRequests: 1, windowSeconds: 10 };

    const resA1 = await checkRateLimit('TEST_ISOLATE', userA, customConfig);
    expect(resA1.allowed).toBe(true);

    const resA2 = await checkRateLimit('TEST_ISOLATE', userA, customConfig);
    expect(resA2.allowed).toBe(false);

    // User B should still be allowed
    const resB1 = await checkRateLimit('TEST_ISOLATE', userB, customConfig);
    expect(resB1.allowed).toBe(true);
  });
});

