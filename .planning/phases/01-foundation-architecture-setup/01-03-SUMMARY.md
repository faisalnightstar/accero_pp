---
phase: 01-foundation-architecture-setup
plan: 03
subsystem: auth
tags: [auth, jwt, bcryptjs, jose, middleware, cookies, dashboard, wallet-provisioning]

# Dependency graph
requires:
  - phase: 01-foundation-architecture-setup
    provides: MongoDB User & Wallet schemas (plan 01-02), Brand styles & layout (plan 01-01)
provides:
  - Password hashing (bcrypt) and JWT session creation/verification (jose)
  - Full auth API endpoints: /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me
  - Automatic zero-balance wallet creation for every registered user
  - Responsive Sign In and Registration pages matching brand identity
  - Authenticated Operator Dashboard with wallet balance display and card studio triggers
  - Next.js Edge Middleware protecting /dashboard, /studio, and /wallet routes
affects: [phase-2, phase-3, phase-4, phase-5]

# Tech tracking
tech-stack:
  added: [bcryptjs, jose, "@types/bcryptjs"]
  patterns: [HTTP-only cookie JWT session management, Edge Middleware route protection, Auto wallet provisioning on registration]

key-files:
  created:
    - src/lib/auth.ts
    - src/middleware.ts
    - src/app/api/auth/register/route.ts
    - src/app/api/auth/login/route.ts
    - src/app/api/auth/logout/route.ts
    - src/app/api/auth/me/route.ts
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/register/page.tsx
    - src/app/dashboard/page.tsx

key-decisions:
  - "Used jose for lightweight, Edge-compatible JWT verification in Next.js middleware"
  - "Wrapped useSearchParams in Suspense boundary for Next.js 15 static prerendering compliance"
  - "Auto-created a Wallet document with 0 balance for every user upon registration to eliminate orphaned user states"

patterns-established:
  - "Protected routes enforced on the Edge via src/middleware.ts with automatic redirect preservation"
  - "Session data verified server-side with HTTP-only cookies, preventing XSS token theft"
---

# Plan 01-03 Summary: Authentication, Protected Dashboard & Edge Middleware

Successfully delivered complete authentication lifecycle, JWT sessions in HTTP-only cookies, automatic wallet provisioning, responsive auth pages, and Edge middleware route protection.

## What was built
- **JWT & Password Security**: `src/lib/auth.ts` provides bcrypt hashing (10 rounds) and JOSE JWT token creation/verification.
- **Auth API Endpoints**:
  - `POST /api/auth/register`: Zod-validated registration that creates User and provisions linked Wallet.
  - `POST /api/auth/login`: Authenticates via email or phone, verifies password, and issues 7-day HTTP-only session cookie.
  - `POST /api/auth/logout`: Clears session cookie.
  - `GET /api/auth/me`: Returns active operator profile and live wallet balance.
- **Auth UI & Dashboard**:
  - `src/app/(auth)/login/page.tsx`: Operator login form with error alerts and redirect support.
  - `src/app/(auth)/register/page.tsx`: Registration form with instant feedback.
  - `src/app/dashboard/page.tsx`: Operator dashboard with live wallet balance card, ISO 7810 PVC printer specifications, and quick launch triggers for PAN, Aadhaar, Voter, DL, and RC card studios.
- **Edge Middleware**: `src/middleware.ts` intercepts unauthenticated visits to `/dashboard`, `/studio`, and `/wallet`.

## Verification
- `npm run build` compiled all 10 pages and middleware in 2.1s with 0 errors.
