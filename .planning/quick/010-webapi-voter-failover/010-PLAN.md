# Quick Task 010: WebAPI.in Voter Integration & Multi-Provider Failover Architecture

## Objective
Implement a production-grade Voter Lookup integration using the newly supplied WebAPI.in endpoints (`voter_details.php`, `voter_captcha.php`, `voter_captcha_info.php`) and introduce a reusable, configurable, automatic multi-provider failover architecture with circuit breaking, provider health monitoring, unified normalization, and idempotent wallet deduction in Accero PrintPortal (`accero_pp`).

## Core Architecture Components
1. **Network Layer (`src/lib/network/provider-registry.ts`)**:
   - Register `webapi_in` provider for `webapi.in.net`.
   - Support configurable routing (direct HTTPS egress default, with Fixie static IP support when `WEBAPI_IN_USE_FIXIE=true`).
2. **WebAPI.in Adapter (`src/lib/verify/providers/webapiIn.ts`)**:
   - `lookup()`: Direct EPIC lookup (`voter_details.php?token=...&voter_no=...`).
   - `getCaptcha()`: Captcha generation (`voter_captcha.php?token=...`).
   - `lookupWithCaptcha()`: Captcha-based lookup (`voter_captcha_info.php?...`).
   - Validate response (`status: true`, `message`, `data.epicNumber`). Do not trust upstream `debited` or `remaining_balance`.
3. **Unified Normalizer (`src/lib/verify/normalizers/webapiInNormalizer.ts`)**:
   - Maps WebAPI.in data into standard `VoterCardData` preserving Unicode Hindi regional text, assembly/part details, English/regional addresses, and safe `null` DOB.
4. **Reliability Layer**:
   - **Error Classifier (`src/lib/reliability/errorClassifier.ts`)**: Categorizes errors into retryable (network, timeout, 5xx, rate limits, malformed) vs non-retryable (invalid EPIC, record not found, invalid captcha, wallet limit).
   - **Circuit Breaker (`src/lib/reliability/circuitBreaker.ts`)**: CLOSED, OPEN, HALF_OPEN states per provider with configurable failure threshold (default 3), open cooldown (default 60s), and half-open probing.
   - **Health Monitor (`src/lib/reliability/providerHealth.ts`)**: Tracks request counts, successes, failures, timeouts, P50/P95 latencies, last error, and circuit state.
5. **Centralized Failover Orchestrator (`src/lib/verify/voterOrchestrator.ts`)**:
   - Reads provider priority from `ServiceConfig.providerPriority` or `VOTER_PROVIDER_ORDER` env (default: `['neoapi', 'webapi_in']`).
   - Evaluates circuit breakers, skips OPEN circuits, falls back automatically on retryable errors, and halts immediately on non-retryable errors.
   - Preserves lookup-time wallet billing invariant (charged at most once on success, never on failure, ₹0 reprint).
6. **Actions & UI**:
   - `src/actions/verify.ts`: Add `getVoterCaptchaAction` and `verifyVoterWithCaptchaAction`.
   - `src/components/studio/StudioSearchBar.tsx`: Add seamless inline/modal captcha challenge when direct lookup indicates captcha requirement.
   - `src/app/admin/services/page.tsx` & `src/actions/admin.ts`: Add provider priority configuration, circuit breaker controls, and health metrics monitoring.
7. **Documentation**:
   - `docs/integrations/voter-provider-architecture.md`
   - `docs/integrations/webapi-in-voter-integration.md`
   - `docs/reliability/voter-api-failover.md`
   - `docs/security/voter-lookup-security.md`
8. **Automated Verification**:
   - Provider tests, normalizer tests, circuit breaker/health tests, multi-provider failover tests, and wallet billing integrity tests.
