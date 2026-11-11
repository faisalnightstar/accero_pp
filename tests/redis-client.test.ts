import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isRedisConfigured,
  getRedis,
  requireRedis,
  getRateLimiter,
  resetRedisClientForTesting,
} from '@/lib/redis';

describe('Upstash Redis Client & Ratelimit Integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    resetRedisClientForTesting();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetRedisClientForTesting();
    vi.restoreAllMocks();
  });

  it('returns null safely when Upstash credentials are not configured', () => {
    expect(isRedisConfigured()).toBe(false);
    expect(getRedis()).toBeNull();
    expect(getRateLimiter('AUTH_LOGIN', 5, 60)).toBeNull();
  });

  it('throws descriptive error in requireRedis() when unconfigured', () => {
    expect(() => requireRedis()).toThrow('UPSTASH_REDIS_REST_URL');
  });

  it('throws UrlError when UPSTASH_REDIS_REST_URL is malformed', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'not-a-valid-url';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test_token';

    expect(() => getRedis()).toThrow();
  });

  it('initializes and reuses a singleton Redis client when configured', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example-redis.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token_abc_123';

    expect(isRedisConfigured()).toBe(true);
    const client1 = getRedis();
    const client2 = getRedis();

    expect(client1).not.toBeNull();
    expect(client1).toBe(client2);
  });

  it('refreshes the singleton when environment credentials change', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis-one.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token_1';
    const client1 = getRedis();

    process.env.UPSTASH_REDIS_REST_URL = 'https://redis-two.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token_2';
    const client2 = getRedis();

    expect(client1).not.toBeNull();
    expect(client2).not.toBeNull();
    expect(client1).not.toBe(client2);
  });

  it('caches @upstash/ratelimit instances per profile and window configuration', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example-redis.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token_abc_123';

    const limiterA1 = getRateLimiter('AUTH_LOGIN', 5, 60);
    const limiterA2 = getRateLimiter('AUTH_LOGIN', 5, 60);
    const limiterB = getRateLimiter('DOC_LOOKUP', 10, 60);

    expect(limiterA1).not.toBeNull();
    expect(limiterA1).toBe(limiterA2);
    expect(limiterA1).not.toBe(limiterB);
  });
});

