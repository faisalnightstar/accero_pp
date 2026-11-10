import connectToDatabase from '@/lib/mongodb';
import RateLimit from '@/models/RateLimit';
import { logAuditEvent } from '@/lib/logger/audit';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export const RATE_LIMIT_PROFILES: Record<string, RateLimitConfig> = {
  AUTH_LOGIN: { maxRequests: 5, windowSeconds: 60 },
  AUTH_REGISTER: { maxRequests: 5, windowSeconds: 60 },
  AUTH_FORGOT_PASSWORD: { maxRequests: 3, windowSeconds: 60 },
  AUTH_RESET_PASSWORD: { maxRequests: 5, windowSeconds: 60 },
  DOC_LOOKUP: { maxRequests: 10, windowSeconds: 60 },
  PAYMENT_CREATE: { maxRequests: 10, windowSeconds: 60 },
  PAYMENT_VERIFY: { maxRequests: 20, windowSeconds: 60 },
  MANUAL_RECHARGE: { maxRequests: 3, windowSeconds: 60 },
};

// In-memory fallback cache for fast sub-millisecond local checks
const memoryCache = new Map<string, { count: number; resetAt: number }>();

/**
 * Checks and increments rate limit for a given action and identifier.
 * Uses Upstash Redis if configured; otherwise uses MongoDB TTL collection with memory cache.
 */
export async function checkRateLimit(
  profileKey: keyof typeof RATE_LIMIT_PROFILES | string,
  identifier: string,
  customConfig?: RateLimitConfig
): Promise<RateLimitResult> {
  const config =
    customConfig ||
    RATE_LIMIT_PROFILES[profileKey] || { maxRequests: 10, windowSeconds: 60 };

  const cleanId = (identifier || 'unknown').trim();
  const bucketKey = `ratelimit:${profileKey}:${cleanId}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  // 1. Fast in-memory check
  const memEntry = memoryCache.get(bucketKey);
  if (memEntry && memEntry.resetAt > now) {
    if (memEntry.count >= config.maxRequests) {
      const retryAfter = Math.ceil((memEntry.resetAt - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetSeconds: retryAfter,
        retryAfterSeconds: retryAfter,
      };
    }
  }

  // 2. Upstash Redis REST API check (if configured)
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const resp = await fetch(`${upstashUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', bucketKey],
          ['EXPIRE', bucketKey, config.windowSeconds, 'NX'],
          ['TTL', bucketKey],
        ]),
        cache: 'no-store',
      });

      if (resp.ok) {
        const json = await resp.json();
        const currentCount = Number(json[0]?.result || 1);
        const ttl = Number(json[2]?.result || config.windowSeconds);
        const allowed = currentCount <= config.maxRequests;
        const remaining = Math.max(0, config.maxRequests - currentCount);

        memoryCache.set(bucketKey, {
          count: currentCount,
          resetAt: now + (ttl > 0 ? ttl * 1000 : windowMs),
        });

        if (!allowed) {
          logAuditEvent({
            action: 'SECURITY_RATE_LIMITED',
            resourceType: 'SECURITY',
            resourceId: cleanId,
            details: { profileKey, currentCount, maxRequests: config.maxRequests },
            status: 'WARNING',
          }).catch(() => {});
        }

        return {
          allowed,
          remaining,
          resetSeconds: ttl > 0 ? ttl : config.windowSeconds,
          retryAfterSeconds: allowed ? 0 : ttl > 0 ? ttl : config.windowSeconds,
        };
      }
    } catch (redisErr) {
      console.warn('[RateLimiter] Upstash Redis request failed, falling back to MongoDB:', redisErr);
    }
  }

  // 3. Distributed MongoDB TTL Bucket Check
  try {
    await connectToDatabase();
    const expiresAt = new Date(now + windowMs);

    // Atomically increment counter, creating document if it doesn't exist
    const doc = await RateLimit.findOneAndUpdate(
      { key: bucketKey },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt },
      },
      { upsert: true, new: true }
    );

    const count = doc.count;
    const remainingTimeMs = Math.max(0, doc.expiresAt.getTime() - now);
    const ttlSeconds = Math.ceil(remainingTimeMs / 1000) || config.windowSeconds;
    const allowed = count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count);

    memoryCache.set(bucketKey, {
      count,
      resetAt: now + remainingTimeMs,
    });

    if (!allowed) {
      logAuditEvent({
        action: 'SECURITY_RATE_LIMITED',
        resourceType: 'SECURITY',
        resourceId: cleanId,
        details: { profileKey, count, maxRequests: config.maxRequests },
        status: 'WARNING',
      }).catch(() => {});
    }

    return {
      allowed,
      remaining,
      resetSeconds: ttlSeconds,
      retryAfterSeconds: allowed ? 0 : ttlSeconds,
    };
  } catch (mongoErr) {
    console.error('[RateLimiter] MongoDB rate limit check error:', mongoErr);
    // In event of total database connection error, fallback to in-memory check
    const current = (memEntry?.count || 0) + 1;
    const resetAt = memEntry?.resetAt && memEntry.resetAt > now ? memEntry.resetAt : now + windowMs;
    memoryCache.set(bucketKey, { count: current, resetAt });

    const allowed = current <= config.maxRequests;
    const retryAfter = Math.ceil((resetAt - now) / 1000);

    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - current),
      resetSeconds: retryAfter,
      retryAfterSeconds: allowed ? 0 : retryAfter,
    };
  }
}

