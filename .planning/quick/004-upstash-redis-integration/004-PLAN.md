# Quick Task 004: Upstash Redis Client & Ratelimit Integration

## Objective
Set up Upstash Redis tooling, SDKs, and client module for Accero PrintPortal:
- Install Upstash agent skills (`upstash-redis-js`, `upstash-ratelimit-js`, `upstash-cli`, `redis-best-practices`) globally for Antigravity.
- Register the remote Upstash MCP server (`https://mcp.upstash.com/mcp`) in Antigravity's MCP configuration.
- Install `@upstash/redis` and `@upstash/ratelimit`.
- Implement a build-safe, lazy singleton Upstash Redis client and rate limiter factory in `src/lib/redis.ts`.
- Upgrade `src/lib/security/rateLimiter.ts` to use `@upstash/ratelimit` backed by Upstash Redis when configured, preserving MongoDB TTL and in-memory fallbacks.
- Provision Upstash Redis database and store `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env` / `.env.local` once Upstash authentication/MCP reload completes.

## Deliverables
1. `package.json` / `package-lock.json` - Add `@upstash/redis` and `@upstash/ratelimit`.
2. `src/lib/redis.ts` - Build-safe singleton Upstash Redis client (`getRedis`, `requireRedis`, `isRedisConfigured`, `getRateLimiter`, `resetRedisClientForTesting`).
3. `src/lib/security/rateLimiter.ts` - Integrate `@upstash/ratelimit` sliding-window limiter with graceful MongoDB/in-memory fallback.
4. `tests/rate-limiting.test.ts` & `tests/redis-client.test.ts` - Unit tests verifying build-safe lazy initialization, `UrlError` validation, and `@upstash/ratelimit` behavior.
5. Upstash Redis database provisioned via Upstash MCP/CLI and credentials written to `.env`.

