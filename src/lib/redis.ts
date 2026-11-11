/**
 * Upstash Redis & Rate Limit Client
 *
 * Serverless HTTP/REST Redis client backed by @upstash/redis and @upstash/ratelimit.
 * Follows Upstash `upstash-redis-js`, `upstash-ratelimit-js`, and `redis-best-practices`
 * guidelines:
 * - Lazy module-level singleton reuse across warm serverless invocations (no TCP pooling needed).
 * - Build-safe: avoids warnings or UrlError during `next build` when env vars are unset.
 * - Per-request AbortSignal timeout (5s) and built-in exponential-backoff retries.
 */

import { Redis, errors } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

let cachedRedis: Redis | null = null;
let cachedCredentialKey: string | null = null;

// Shared module-level ephemeral cache for @upstash/ratelimit across warm invocations
const ratelimitEphemeralCache = new Map<string, number>();
const ratelimitInstances = new Map<string, Ratelimit>();

function readRedisEnv(): { url: string; token: string } | null {
  const url = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '').trim();

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

/**
 * Checks whether Upstash Redis REST credentials are configured in the server environment.
 */
export function isRedisConfigured(): boolean {
  return readRedisEnv() !== null;
}

/**
 * Returns the shared singleton Upstash Redis client, or `null` if env vars are not set.
 * Throws `UrlError` synchronously if `UPSTASH_REDIS_REST_URL` is non-empty but malformed.
 */
export function getRedis(): Redis | null {
  const creds = readRedisEnv();
  if (!creds) {
    return null;
  }

  const credentialKey = `${creds.url}|${creds.token}`;
  if (cachedRedis && cachedCredentialKey === credentialKey) {
    return cachedRedis;
  }

  // Clear cached rate limiters if Redis credentials changed
  ratelimitInstances.clear();
  ratelimitEphemeralCache.clear();

  cachedRedis = new Redis({
    url: creds.url,
    token: creds.token,
    signal: () => AbortSignal.timeout(5000),
  });
  cachedCredentialKey = credentialKey;

  return cachedRedis;
}

/**
 * Returns the active Upstash Redis client or throws an explicit configuration error.
 */
export function requireRedis(): Redis {
  const client = getRedis();
  if (!client) {
    throw new Error(
      'Upstash Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.'
    );
  }
  return client;
}

/**
 * Returns a cached @upstash/ratelimit sliding-window limiter for the given profile,
 * or `null` if Upstash Redis is not configured.
 */
export function getRateLimiter(
  profileKey: string,
  maxRequests: number,
  windowSeconds: number
): Ratelimit | null {
  const client = getRedis();
  if (!client) {
    return null;
  }

  const cacheKey = `${profileKey}:${maxRequests}:${windowSeconds}`;
  const existing = ratelimitInstances.get(cacheKey);
  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
    prefix: `printportal:ratelimit:${profileKey}`,
    ephemeralCache: ratelimitEphemeralCache,
    timeout: 2500,
  });

  ratelimitInstances.set(cacheKey, limiter);
  return limiter;
}

/**
 * Resets cached Redis and Ratelimit instances (for unit tests).
 */
export function resetRedisClientForTesting(): void {
  cachedRedis = null;
  cachedCredentialKey = null;
  ratelimitInstances.clear();
  ratelimitEphemeralCache.clear();
}

/**
 * Eager export when credentials exist at startup; `null` when unconfigured (build-safe).
 * Prefer `getRedis()` in server code that may run after dynamic env injection.
 */
export const redis: Redis | null = getRedis();

export { Redis, Ratelimit, errors };
