---
phase: 1
slug: foundation-architecture-setup
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-28
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Next.js Build & Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm run test` or `npm run lint` |
| **Full suite command** | `npm run build && npm run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint` or quick unit test
- **After every plan wave:** Run `npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FOUND-01 | — | App Router compiles with TypeScript and Tailwind | build | `npm run build` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FOUND-03 | — | Brand CSS tokens render without missing variable warnings | visual | `npm run build` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | FOUND-02 | T-01-01 | MongoDB connection caches globally to avoid pool exhaustion | unit | `npm run test` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 3 | FOUND-04 | T-01-02 | Passwords hashed with bcrypt, JWT issued in HTTP-only cookie | unit/integration | `npm run test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Vitest configuration
- [ ] `src/lib/__tests__/mongodb.test.ts` — Connection pooling test
- [ ] `src/lib/__tests__/auth.test.ts` — Password hashing & JWT validation tests
