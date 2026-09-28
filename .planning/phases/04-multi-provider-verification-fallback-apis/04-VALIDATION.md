# Phase 4: Multi-Provider Verification & Fallback APIs - Validation

**Phase:** 04-multi-provider-verification-fallback-apis
**Domain:** External Verification Pipelines, Silent Cascade Failover, Timeout Resilience, and Studio Routing
**Date:** 2026-09-28
**Status:** READY

---

## 1. Validation Criteria Matrix

| Req ID | Description | Validation Method | Success Threshold |
|---|---|---|---|
| **VERIF-01** | Secure server-only execution | Static code audit & bundle inspection | Zero vendor API keys (`NEO_API_KEY`, `AXEN_API_KEY`, `FASTNEXORA_API_KEY`) present in client-side bundles; all requests execute via Server Actions (`'use server'`) |
| **VERIF-02** | Voter ID (EPIC) verification | FastNexora primary lookup + NeoAPI fallback | Entering valid EPIC number fetches voter name, relation name, assembly constituency, and address; direct non-captcha prioritized |
| **VERIF-03** | PAN Card verification | NeoAPI primary lookup + AxenAPI fallback | Entering valid PAN format (`[A-Z]{5}[0-9]{4}[A-Z]{1}`) returns cardholder name, father name, and DOB |
| **VERIF-04** | Driving License & Vehicle RC verification | AxenAPI lookup client integration | Entering DL number or vehicle registration number returns demographic details, maker/model, fuel type, chassis/engine numbers |
| **VERIF-05** | Resilient error handling & Studio handoff | Simulated timeout (>8s) and partial JSON test | Stalled requests abort at 8s, cascade to secondary provider, and route partial fields directly into Split-Screen Studio with amber missing-field badges |

---

## 2. Automated & Compile-Time Checks

- **TypeScript Compilation:**
  ```bash
  npm run build
  ```
  Must compile with zero TypeScript errors under strict mode (`strict: true`). All vendor payload adapters and normalizers must cleanly type-check against `src/types/cards.ts`.
- **Linting:**
  ```bash
  npm run lint
  ```
  Must pass cleanly with no ESLint warnings.

---

## 3. Verification & Failover Test Procedures

1. **Server-Side Key Isolation:**
   - Audit client-facing JS bundles for `FASTNEXORA_API_KEY`, `NEO_API_KEY`, and `AXEN_API_KEY`.
   - Verify all credentials remain exclusively on the server runtime.
2. **8-Second Timeout & Silent Cascade:**
   - Simulate a network delay (>8000ms) on the primary provider.
   - Verify request aborts immediately at 8s and invokes the secondary provider.
   - Total cascading response time must complete under 16 seconds.
3. **Partial Payload Studio Population:**
   - Feed a partial mock payload (e.g. name only, omitting father name and address).
   - Confirm Split-Screen Studio loads with the partial fields populated.
   - Confirm non-blocking toast displays: *"External lookup returned partial data. Missing fields highlighted for manual completion"*.
   - Confirm missing field banner and amber badges activate immediately.
4. **Dual Entry Point Transition:**
   - Submit a document number via Dashboard Quick Lookup modal; confirm seamless navigation to `/studio` with pre-filled canvas.
   - Submit a query via In-Studio Search Bar while editing; confirm dirty-form overwrite confirmation modal appears.
