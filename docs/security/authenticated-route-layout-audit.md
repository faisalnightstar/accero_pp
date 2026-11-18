# Security & Authenticated Route Layout Audit

**Accero PrintPortal** (`accero_pp`)  
**Production URL:** [https://printportal.accero.app](https://printportal.accero.app)  
**Security & Layout Audit Date:** November 18, 2026  
**Auditor:** Senior Next.js Architect & Application Security Engineer  

---

## 1. Security Overview & Context

This security audit verifies that the layout refactoring strictly preserves and reinforces the application's authentication, authorization, and role-based access control (RBAC) boundaries.

No frontend layout mechanism or route classification is trusted for authorization:
- **Authorization Authority:** All route protection and RBAC guards are strictly executed on the server in Next.js Server Components (`AdminLayout`, `SupportLayout`, `DashboardLayout`, `StudioLayout`, `WalletLayout`, `CardsLayout`) and Next.js Middleware.
- **Client Fallbacks:** Client-side components (`AppLayoutShell`, `OperatorShell`, `AdminHeader`) only govern presentation ergonomics (preventing UI leakage); they do not replace or weaken server-side security checks.

---

## 2. Authentication & Authorization Matrix

| Route Hierarchy | Layout / Shell Component | Server Authorization Guard | Permitted Roles | Unauthorized Behavior |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `PublicWebsiteLayout` | None (Public) | Anyone | Allowed (Authenticated redirected to role dashboard) |
| `/pricing`, `/about`, `/contact`, `/services/*`, `/blog/*` | `PublicWebsiteLayout` | None (Public) | Anyone | Allowed |
| `/login`, `/register`, `/forgot-password` | `AuthLayout` | Middleware Redirect | Unauthenticated | Authenticated redirected to role dashboard |
| `/dashboard` | `OperatorShell` | `getOperatorUserSession()` | `operator`, `customer`, `admin`, `super_admin` | 307 Redirect -> `/login?redirect=/dashboard` |
| `/studio` | `OperatorShell` | `getOperatorUserSession()` | `operator`, `customer`, `admin`, `super_admin` | 307 Redirect -> `/login?redirect=/studio` |
| `/wallet` | `OperatorShell` | `getOperatorUserSession()` | `operator`, `customer`, `admin`, `super_admin` | 307 Redirect -> `/login?redirect=/wallet` |
| `/cards` | `OperatorShell` | `getOperatorUserSession()` | `operator`, `customer`, `admin`, `super_admin` | 307 Redirect -> `/login?redirect=/cards` |
| `/admin`, `/admin/*` | `AdminLayout` + `AdminHeader` | `getSession()`, `isAdmin()` | `admin`, `super_admin` | 307 Redirect -> `/dashboard?error=unauthorized_admin` (or `/login`) |
| `/admin/team` | `AdminLayout` + `AdminHeader` | `isSuperAdmin()` | `super_admin` | Hidden from navigation; server action rejects unauthorized |
| `/support`, `/support/*` | `SupportLayout` + `SupportHeader` | `getSession()`, `isSupportStaff()` | `support_agent`, `support_manager`, `admin`, `super_admin` | 307 Redirect -> `/dashboard?error=unauthorized_support` (or `/login`) |

---

## 3. Threat Modeling & Verification

### Threat 1: Public Marketing Navigation Leakage on Authenticated Pages
- **Vulnerability:** Unintended exposure of marketing CTAs ("Operator Login", "Get Started", "Pricing", "About") on internal operational dashboards.
- **Mitigation:**
  - Removed `<Navbar />` and `<Footer />` from `src/app/layout.tsx`.
  - Implemented `AppLayoutShell` which checks `getApplicationContext(pathname)` and returns raw `{children}` for all operational routes (`admin`, `operator`, `support`).
  - Wrapped operator routes in dedicated `OperatorShell` and admin routes in `AdminHeader` + sidebar.
- **Verification:**
  - Unit tests 6, 7, 8, 9, 11, 12, 13, 21, 22, 23, 24 in `tests/application-layout-architecture.test.ts` assert zero presence of `PublicNavbar` or `Footer` in authenticated layout outputs.

### Threat 2: Client-Side Role Tampering (Frontend Spoofing)
- **Vulnerability:** A malicious operator modifies `localStorage` or React client state to mimic an `admin` role in an attempt to render the admin shell or execute admin actions.
- **Mitigation:**
  - `AdminLayout` is a Next.js Server Component running in the secure Node.js runtime.
  - It decrypts the HTTP-only JWT `accessToken` or `auth-token` cookie directly using cryptographic secrets (`ACCESS_TOKEN_SECRET_VALUE`).
  - If `isAdmin(session.role)` fails, it immediately triggers a server-side `redirect('/dashboard?error=unauthorized_admin')` before rendering any HTML.
  - Server actions in `src/actions/admin.ts` verify the session role independently on every execution.
- **Verification:**
  - `tests/admin-support-rbac.test.ts` and `tests/auth-redirects.test.ts` enforce strict privilege boundaries.

### Threat 3: Direct URL Access Bypassing Navigation
- **Vulnerability:** Unauthenticated users attempting to bypass frontend navigation by directly entering `https://printportal.accero.app/dashboard` or `https://printportal.accero.app/admin`.
- **Mitigation:**
  - `getOperatorUserSession()` and `getSession()` verify the cryptographically signed JWT cookie.
  - Absence of a valid cookie halts rendering and issues an immediate HTTP 307 redirect to `/login?redirect=<path>`.
  - Middleware enforces security headers (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`).
- **Verification:**
  - Test 15 in `tests/application-layout-architecture.test.ts` confirms unauthenticated calls return `null` and trigger redirect.

### Threat 4: Suspended or Disabled Account Access
- **Vulnerability:** Suspended operators continuing to access the dashboard through cached client state.
- **Mitigation:**
  - Server components query the database via Mongoose on sensitive views (`User.findById(session.userId)`).
  - Any suspended status flags in the database revoke active sessions.
  - Logout endpoint (`/api/auth/logout`) clears all auth cookies with `maxAge: 0` and `expires: new Date(0)`.

---

## 4. Verification & Automated Test Results

### Suite Summary
- **Test File:** `tests/application-layout-architecture.test.ts`
- **Total Tests:** 25/25 Passing
- **Core Test Suites Combined:** 160/160 Passing across:
  - `tests/application-layout-architecture.test.ts` (25 tests)
  - `tests/auth-redirects.test.ts` (22 tests)
  - `tests/seo-indexing-policy.test.ts` (15 tests)
  - `tests/pagespeed-fixes.test.ts` (8 tests)
  - `tests/recharge-modal-polling.test.ts` (4 tests)
  - `tests/admin-support-rbac.test.ts` (19 tests)
  - `tests/skeletons/route-loading.test.ts` (46 tests)
  - `tests/skeletons/skeleton-primitives.test.ts` (15 tests)
  - `tests/webmcp-ard.test.ts` (6 tests)
- **Production Build:** `npm run build` completed with zero errors; all 83 static and dynamic routes compiled and optimized successfully.
