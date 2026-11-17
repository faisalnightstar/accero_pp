# Accero PrintPortal — Authentication Redirect Architecture & Root Cause Audit

## 1. Executive Summary

This document details the investigation, root cause identification, architectural resolution, and verification for the issue where authenticated users accessing the Accero PrintPortal homepage (`/`) remained on the public landing page with an authenticated navbar rendered, rather than being redirected to `/dashboard`.

---

## 2. Root Cause Analysis

### 2.1. The Symptoms
When a logged-in user with valid HTTP-only JWT cookies (`accessToken` / `auth-token`) navigated to the root URL `https://printportal.accero.app/`:
1. The user was served the public marketing homepage (`Pixel-Perfect PVC Cards with Zero Missing Data`).
2. The top navigation bar, however, detected the authenticated session client-side via `/api/auth/me` and rendered `UserNavbar` showing:
   - User profile badge / initial.
   - Operator wallet balance (`BALANCE ₹1785.00`).
   - Private operational navigation links (`Dashboard`, `Studio`, `PAN Lookup`, `Templates`, `Wallet`, `Rewards`).
3. The user was not redirected to `/dashboard`, creating a confusing hybrid state between a public sales landing page and an authenticated operator workspace.

### 2.2. The Root Cause
1. **Omission of `/` in Middleware:**
   In `src/middleware.ts`, lines 85–89 previously restricted authenticated user redirection exclusively to authentication pages:
   ```typescript
   // Previous implementation
   const pathname = request.nextUrl.pathname;
   const isAuthPage = pathname === '/login' || pathname === '/register';

   if (isAuthPage) {
     // redirected to dashboard
   }
   ```
   The root homepage path (`pathname === '/'`) was not included in this condition. As a result, authenticated users passed through middleware directly to `/`.
2. **Absence of Server-Side Redirect in Homepage:**
   The root page (`src/app/page.tsx`) was rendered as a static Server Component without any session check or redirect.
3. **RBAC Loop Prevention Vulnerability:**
   In `src/lib/rbac.ts`, `getSafeRedirectUrl` checked against `/login` and `/register`, but did not reject `/` or `/?...` as a return destination. If an authenticated user arrived with `returnTo=/`, it returned `/`, creating a potential redirect cycle.

---

## 3. Files Inspected & Modified

### 3.1. Files Inspected
- `src/lib/auth.ts`: Authoritative JWT verification, secret key resolution, cookie extraction, session hydration.
- `src/lib/rbac.ts`: Role-based access control, safe redirect resolution, dashboard URL resolution.
- `src/middleware.ts`: Edge/Server routing middleware, security headers, authentication gate.
- `src/app/page.tsx`: Public marketing landing page.
- `src/app/(auth)/login/page.tsx`: Server Component login gate.
- `src/app/(auth)/login/LoginForm.tsx`: Client-side login form submission and router redirect.
- `src/app/(auth)/register/page.tsx`: Server Component register gate.
- `src/app/api/auth/login/route.ts`: Login API, rate limiting, and HTTP-only cookie setting.
- `src/app/api/auth/me/route.ts`: Session inspection endpoint with strict no-cache headers.
- `src/components/layout/Navbar.tsx`: Navbar authentication hydration and component switching (`UserNavbar` vs `PublicNavbar`).
- `src/components/layout/UserNavbar.tsx`: Authenticated operator header.
- `src/app/dashboard/layout.tsx`: Protected layout enforcing server-side session checks.
- `tests/auth-redirects.test.ts`: Automated test suite for authentication redirects.

### 3.2. Files Modified
1. `src/lib/rbac.ts`:
   - Updated `getSafeRedirectUrl` to treat `/` and `/?...` as invalid return targets for authenticated users, returning `fallback` (`getRoleDashboardUrl(role)`) instead.
2. `src/middleware.ts`:
   - Expanded the redirect condition to include `isHomepage = pathname === '/'`.
   - Authenticated requests to `/` immediately issue an HTTP 307 temporary redirect to the user's role-appropriate dashboard (`/dashboard` for regular users and operators, `/admin` for administrators, `/support` for support specialists).
3. `src/components/layout/Navbar.tsx`:
   - Added client-side defense-in-depth redirect fallback: if a cached view or bfcache serves `/` to an authenticated user, `useEffect` triggers `router.replace(destination)`.
4. `tests/auth-redirects.test.ts`:
   - Added 6 comprehensive automated test cases verifying `/` redirect policies across unauthenticated, operator, admin, support, expired, and invalid token scenarios.

---

## 4. Redirect Behavior Matrix (Before vs After)

| User State | Requested Path | Behavior Before Fix | Behavior After Fix | HTTP Status |
| :--- | :--- | :--- | :--- | :--- |
| **Authenticated (Operator)** | `/` | Stayed on `/` with `UserNavbar` | **Redirects to `/dashboard`** | `307 Temporary Redirect` |
| **Authenticated (Admin)** | `/` | Stayed on `/` with `UserNavbar` | **Redirects to `/admin`** | `307 Temporary Redirect` |
| **Authenticated (Support)** | `/` | Stayed on `/` with `UserNavbar` | **Redirects to `/support`** | `307 Temporary Redirect` |
| **Authenticated (Any Role)** | `/login` | Redirected to `/dashboard` | Redirects to role dashboard | `307 Temporary Redirect` |
| **Authenticated (Any Role)** | `/register` | Redirected to `/dashboard` | Redirects to role dashboard | `307 Temporary Redirect` |
| **Authenticated (Any Role)** | `/pricing`, `/about`, `/services/*` | Allowed access | **Allowed access** (Preserves public SEO pages) | `200 OK` |
| **Authenticated (Any Role)** | `/dashboard` | Allowed access | Allowed access | `200 OK` |
| **Unauthenticated** | `/` | Allowed access | **Allowed access** | `200 OK` |
| **Unauthenticated** | `/login` | Allowed access | Allowed access | `200 OK` |
| **Unauthenticated** | `/dashboard` | Redirects to `/login` | Redirects to `/login` | `307 Temporary Redirect` |
| **Expired JWT** | `/` | Allowed access | **Allowed access** (Treated as unauthenticated) | `200 OK` |
| **Invalid/Tampered JWT** | `/` | Allowed access | **Allowed access** (Treated as unauthenticated) | `200 OK` |

---

## 5. Security & Architectural Considerations

1. **Server-Side Enforcement (Zero Client Flash):**
   The redirect is executed at the Next.js middleware routing boundary before any HTML or component payload is dispatched to the client. This guarantees zero visual layout flashes.
2. **SEO & Web Crawler Integrity:**
   Search engine crawlers (Googlebot, Bingbot, etc.) do not have authentication cookies. Middleware evaluates them as unauthenticated and allows immediate pass-through to `/`, serving static pre-rendered SEO content with optimal Core Web Vitals.
3. **Public Route Preservation:**
   Public educational, marketing, and tooling pages (`/services/*`, `/pricing`, `/features`, `/tools/cr80-card-size-calculator`, `/blog/*`) remain accessible to logged-in users who wish to review pricing, specifications, or terms.
4. **Open Redirect & Redirect Loop Defense:**
   `getSafeRedirectUrl` prevents attackers from exploiting query parameters (`/?returnTo=https://evil.com` or `/?returnTo=//attacker.com`) and eliminates infinite redirect loops by stripping auth and root paths.
5. **Role-Based Routing:**
   Redirects respect the user's authoritative role stored in the verified JWT:
   - Operators and standard users $\to$ `/dashboard`
   - Admins and Super Admins $\to$ `/admin`
   - Support Agents and Managers $\to$ `/support`

---

## 6. Test Suite & Verification Results

### Automated Vitest Suite (`tests/auth-redirects.test.ts`)
```bash
npx vitest run tests/auth-redirects.test.ts
```
Results:
- `✓ 1. allows logged-out user to access /login`
- `✓ 2. allows logged-out user to access /register`
- `✓ 3. redirects normal authenticated user visiting /login to /dashboard`
- `✓ 4. redirects normal authenticated user visiting /register to /dashboard`
- `✓ 5. redirects ADMIN and SUPER_ADMIN visiting /login to /admin`
- `✓ 6. redirects SUPPORT_AGENT and SUPPORT_MANAGER visiting /register to /support`
- `✓ 7. ensures expired JWT does not grant access and deletes cookie on login/protected pages`
- `✓ 8. ensures invalid/tampered JWT passes to Server Components without premature cookie destruction`
- `✓ 9. allows access to /login and /register when cookie is missing`
- `✓ 10. verifies suspended user logic in server data layer`
- `✓ 11. verifies logout clears the session cookie and permits login access`
- `✓ 12. prevents redirect loops and blocks malicious open redirects`
- `✓ 13. Homepage (/) authentication redirect policy:`
  - `✓ allows unauthenticated visitor to view homepage (/) without redirect`
  - `✓ redirects authenticated regular user/operator visiting / to /dashboard`
  - `✓ redirects authenticated admin visiting / to /admin`
  - `✓ redirects authenticated support agent visiting / to /support`
  - `✓ preserves public SEO and marketing pages for authenticated users`
  - `✓ allows access to homepage when token is expired or invalid`
- `✓ getSafeRedirectUrl helper unit tests:`
  - `✓ returns role dashboard when returnTo is null or undefined`
  - `✓ rejects external schemes`
  - `✓ rejects auth paths and root homepage to prevent loops`
  - `✓ allows valid internal paths and query parameters`

**Total: 22 / 22 Passed (100% pass rate).**

### Type Safety & Production Build
- `npx tsc --noEmit` exited with status `0` (Zero TypeScript errors).
- `npm run build` compiled 80/80 routes successfully in production mode.
