# Application Layout Architecture & Route Boundary Separation

**Accero PrintPortal** (`accero_pp`)  
**Production URL:** [https://printportal.accero.app](https://printportal.accero.app)  
**Framework:** Next.js 15.5 App Router (React 19, TypeScript, Tailwind CSS)  
**Date of Audit & Refactor:** November 18, 2026  

---

## 1. Executive Summary

This architecture document details the resolution of a critical design flaw where the public marketing navigation (Services, Platform, Pricing, FAQ, About, Contact, Install App, Operator Login, Get Started) was inadvertently rendered on authenticated application dashboards:
1. **Operator Application Dashboard** (`/dashboard`, `/studio`, `/wallet`, `/cards`)
2. **Admin Command Center** (`/admin`, `/admin/*`)
3. **Support Command Center** (`/support`, `/support/*`)

The problem was resolved without resorting to fragile CSS hacks (`display: none`), without scattered conflicting pathname conditions, and without destructive file migrations that could break existing public SEO indexing or test suites.

---

## 2. Root Cause Analysis

### The Flawed Previous Architecture

Previously, `src/app/layout.tsx` (the root layout) unconditionally rendered the public marketing components directly into the document `<body>`:

```tsx
// PREVIOUS RootLayout (Flawed)
<body className="min-h-screen flex flex-col font-sans antialiased overflow-x-hidden">
  <GoogleTagManagerNoscript />
  <WebMcpProvider />
  <ServiceWorkerRegistration />
  <InstallPrompt />
  <Suspense fallback={null}>
    <AppRouterPageTracker />
  </Suspense>
  <Navbar />
  <main className="flex-1">{children}</main>
  <WhatsAppSupportWidget />
  <Footer />
  <Analytics />
  <SpeedInsights />
</body>
```

Inside `Navbar.tsx`, navigation switching was based purely on client-side state (`session.isAuthenticated`):

```tsx
// PREVIOUS Navbar.tsx (Flawed)
if (session.isAuthenticated && session.user) {
  return <UserNavbar user={session.user} ... />;
}
return <PublicNavbar />;
```

### Why Authenticated Dashboards Displayed the Public Navbar

1. **Server-Side Rendering (SSR) & Initial Hydration Fallback:**  
   During SSR and before client-side session hydration completed, `session.isAuthenticated` defaulted to `false`. Next.js rendered `<PublicNavbar />` into the initial server HTML of `/dashboard` and `/admin`.
2. **Lack of Domain Awareness in Admin Shell:**  
   Even after authenticating as an administrator, `Navbar` rendered `<UserNavbar />` (the operator navigation) at the top of `/admin`, directly above the dark `<AdminLayout />` sidebar.
3. **Global Marketing Leakage:**  
   `<Footer />` (the 4-column public marketing footer with links) and `<WhatsAppSupportWidget />` were rendered globally on every authenticated page, cluttering the operator studio and admin tables.
4. **Inversion of Control:**  
   The root layout attempted to manage page presentation globally instead of allowing each application domain to own its presentation shell.

---

## 3. The New Three-Tier Application Architecture

The application now establishes three clearly separated experiences governed by application context:

```
                                  RootLayout (src/app/layout.tsx)
                                                │
                                    AppLayoutShell (Router)
                        ┌───────────────────────┼────────────────────────┐
                        │                       │                        │
                 Public Context          Operator Context          Admin Context
                        │                       │                        │
               Public Website Layout      OperatorShell            AdminLayout
                 - PublicNavbar         - OperatorHeader         - AdminHeader
                 - Page Content         - Page Content           - Admin Sidebar
                 - WhatsApp Widget      - RechargeModal          - Page Content
                 - Footer (Marketing)     (Zero Public Nav)        (Zero Public Nav)
```

### A. Public Website Layout (`public`)
- **Applies to:** `/`, `/pricing`, `/about`, `/contact`, `/faq`, `/terms`, `/privacy-policy`, `/security`, `/resources`, `/services/*`, `/blog/*`, `/solutions/*`, `/features/*`, `/compare/*`, `/tools/*`.
- **Navigation:**
  - Accero PrintPortal Logo
  - Services (PAN, Aadhaar, Voter, DL, RC, Ration, Farmer ID)
  - Platform / Explore Dropdown
  - Pricing
  - FAQ
  - About
  - Contact
  - Install App
  - Operator Login
  - Get Started
- **Included Shell Components:** `<PublicNavbar />`, `<main className="flex-1">{children}</main>`, `<WhatsAppSupportWidget />`, `<Footer />`.
- **SEO & Performance:** 100% static page generation (SSG) preserved across all 56 canonical public routes.

### B. Operator Application Layout (`operator`)
- **Applies to:** `/dashboard`, `/dashboard/*`, `/studio`, `/wallet`, `/cards`.
- **Architecture:** Managed authoritatively by `src/components/layout/operator/OperatorShell.tsx`.
- **Operator Header (`src/components/layout/operator/OperatorHeader.tsx`):**
  - **Left:** Logo, Operator Context badge (`Operator Portal`, `Card Studio`, `Wallet & Ledger`, `CR80 Templates`), and dynamic Breadcrumbs.
  - **Center:** Primary operator links (`Dashboard`, `Studio`, `PAN Lookup`, `Templates`, `Wallet`, `Rewards` dropdown).
  - **Right:**
    - Live Wallet balance indicator (with low-balance alert and instant recharge modal trigger)
    - Notifications button
    - Help / Operator Support link
    - Operator Profile Menu:
      - Operator Avatar, name, email, verified status
      - Profile (`/dashboard`)
      - Account & Ledger (`/wallet`)
      - Security Settings (`/dashboard`)
      - Role switcher (Admin Command Center link if administrator, Support Center link if support staff)
      - Sign Out (clears session and redirects to `/login`)
  - **Mobile:** Dedicated mobile drawer without marketing clutter.
- **Embedded Capabilities:** Embedded `<RechargeModal />` accessible from any operator route.
- **Exclusions:** Zero public marketing navbar, zero public marketing footer, zero floating marketing widgets.

### C. Admin Application Layout (`admin`)
- **Applies to:** `/admin`, `/admin/*` (`/admin/operators`, `/admin/finance`, `/admin/campaigns`, `/admin/promo-codes`, `/admin/referrals`, `/admin/services`, `/admin/payments`, `/admin/reports`, `/admin/team`).
- **Architecture:** Managed by `src/app/admin/layout.tsx` and `src/components/layout/admin/AdminHeader.tsx`.
- **Admin Header:**
  - Branding badge (`Accero Admin`)
  - Dynamic breadcrumbs (`Admin > Overview & Metrics`, `Admin > Wallet & Finance`, etc.)
  - Support & Operator Portal quick switcher
  - Real-time system health indicator
  - Admin Profile & Account Menu
  - Sign Out action
- **Admin Sidebar:**
  - Overview & Metrics (`/admin`)
  - Operator Management (`/admin/operators`)
  - Wallet & Finance (`/admin/finance`)
  - Campaigns & Bonuses (`/admin/campaigns`)
  - Promo Codes & Coupons (`/admin/promo-codes`)
  - Referral & Rewards (`/admin/referrals`)
  - Service Pricing (`/admin/services`)
  - Payment Auditing (`/admin/payments`)
  - Reports & Exports (`/admin/reports`)
  - Team & Access Control (`/admin/team` - Super Admin only)
  - Support Dashboard (`/support`)
- **Exclusions:** Zero public marketing navbar, zero operator navbar, zero public footer.

### D. Support Command Center Layout (`support`)
- **Applies to:** `/support`, `/support/*`.
- **Architecture:** Managed by `src/app/support/layout.tsx` and `src/components/layout/support/SupportHeader.tsx`.
- **Components:** Dedicated Support Header and Support Sidebar (`Overview`, `Ticket Queue`, `Operator Lookup`, `Troubleshooting`, `Knowledge Base`).
- **Exclusions:** Zero public navbar, zero public footer.

---

## 4. Centralized Route Context Engine

The mapping between pathnames and application domains is handled by a pure, single source of truth: [`src/lib/layout/routeContext.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/lib/layout/routeContext.ts).

```ts
export type ApplicationContext = 'public' | 'operator' | 'admin' | 'support' | 'auth';

export function getApplicationContext(pathname: string | null | undefined): ApplicationContext {
  if (!pathname) return 'public';

  const normalized = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;

  if (normalized === '/admin' || normalized.startsWith('/admin/')) return 'admin';
  if (normalized === '/support' || normalized.startsWith('/support/')) return 'support';

  for (const prefix of OPERATOR_ROUTE_PREFIXES) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) return 'operator';
  }

  for (const authRoute of AUTH_ROUTES) {
    if (normalized === authRoute || normalized.startsWith(`${authRoute}/`)) return 'auth';
  }

  return 'public';
}
```

---

## 5. Files Summary

### Files Created
1. `src/lib/layout/routeContext.ts`: Pure application context router and route classifier.
2. `src/lib/layout/operatorSession.ts`: Server-side operator session and wallet balance resolver.
3. `src/components/layout/AppLayoutShell.tsx`: Root layout discriminator.
4. `src/components/layout/operator/OperatorHeader.tsx`: Dedicated operator application header.
5. `src/components/layout/operator/OperatorShell.tsx`: Dedicated operator application shell.
6. `src/components/layout/admin/AdminHeader.tsx`: Dedicated admin application header.
7. `src/components/layout/support/SupportHeader.tsx`: Dedicated support staff application header.
8. `tests/application-layout-architecture.test.ts`: 25 automated unit and integration tests.
9. `docs/architecture/application-layout-architecture.md`: Architectural specification.
10. `docs/security/authenticated-route-layout-audit.md`: Security, authentication, and RBAC audit.

### Files Modified
1. `src/app/layout.tsx`: Removed unconditional `<Navbar />`, `<Footer />`, and `<WhatsAppSupportWidget />`. Implemented `<AppLayoutShell>{children}</AppLayoutShell>`.
2. `src/app/dashboard/layout.tsx`: Refactored to wrap children in `<OperatorShell user={user}>`.
3. `src/app/studio/layout.tsx`: Refactored to wrap children in `<OperatorShell user={user}>`.
4. `src/app/wallet/layout.tsx`: Refactored to wrap children in `<OperatorShell user={user}>`.
5. `src/app/cards/layout.tsx`: Refactored to wrap children in `<OperatorShell user={user}>`.
6. `src/app/admin/layout.tsx`: Integrated `<AdminHeader>`.
7. `src/app/support/layout.tsx`: Integrated `<SupportHeader>`.
