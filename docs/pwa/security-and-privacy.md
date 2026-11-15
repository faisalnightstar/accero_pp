# Accero PrintPortal — PWA Security & Privacy Specification

**Document Version:** 1.0.0  
**Security Classification:** Critical Infrastructure Guide  
**Compliance Alignment:** Digital Personal Data Protection (DPDP) Act, 2023 & OWASP Top 10  

---

## 1. Security Philosophy & The Shared-Terminal Problem

Accero PrintPortal operates in high-density, multi-user retail environments:
- In rural CSC centers, operators often share a single desktop PC across multiple shifts.
- In cyber cafes, walk-in customers occasionally sit at operator-assisted terminals.
- Operator smartphones and tablets are frequently handled by assistants or customers reviewing preview cards.

In standard PWAs, aggressive client-side caching (e.g. caching all HTML pages, IndexedDB persistence, or saving API responses) can lead to catastrophic privacy violations where one operator or walk-in citizen inadvertently views another citizen's private identity documents or an operator's wallet ledger.

**Accero's PWA architecture enforces a strict Zero-Trust client caching posture to eliminate this threat vector completely.**

---

## 2. PWA Security Controls & Data Boundaries

### 2.1 Caching Prohibition on Sensitive Records
The service worker (`public/sw.js`) explicitly checks every incoming request URL against the `isNeverCacheRequest` security guard:

```javascript
function isNeverCacheRequest(pathname) {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/wallet') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/support') ||
    pathname.startsWith('/cards') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  );
}
```

Under no condition are the following records stored in CacheStorage, IndexedDB, or local browser storage:
- Citizen Aadhaar numbers, virtual IDs, or biometric demographic records.
- Permanent Account Number (PAN) details or tax records.
- Electoral Photo Identity Card (EPIC) voter details.
- Driving licence, vehicle registration, ration card, or farmer land records.
- Wallet ledger balances, payment gateway order IDs, or Paytm transaction checksums.
- Authentication JWTs, password reset tokens, or user passwords.

### 2.2 HTTPS Enforcement & Service Worker Scope
- Service workers require a secure context (`https://`) to register, preventing man-in-the-middle (MITM) attacks and cache poisoning.
- The service worker scope is locked strictly to `/` on `https://printportal.accero.app`.
- In local development, the registration component permits `localhost` and `127.0.0.1` only.

### 2.3 Session Isolation & Logout Mechanics
- Authentication state is governed exclusively by a signed JSON Web Token (JWT) stored in an HTTP-only, `Secure`, `SameSite=Lax` cookie (`auth-token`).
- JavaScript code and the service worker cannot read or modify the `auth-token` cookie.
- When an operator clicks **Logout**, `/api/auth/logout` clears the cookie on the server.
- Because no protected workspace pages (`/studio`, `/dashboard`, etc.) are cached in CacheStorage, refreshing or opening the app immediately forces a clean redirect to `/login`. No residual customer cards can be recovered by inspecting browser caches.

---

## 3. Financial Integrity & Offline Boundaries

A critical vulnerability in poorly designed PWAs is permitting offline actions that pretend to succeed and queue mutations in local storage.

### Why Accero Rejects Offline Transactions:
1. **Balance Conservation Law:** Wallet balances must be verified atomically against MongoDB Atlas before any document lookup or print authorization.
2. **Preventing Double-Spending:** Allowing offline balance decrements would permit malicious actors to forge ledger transactions or replay expired print jobs.
3. **Statutory Data Freshness:** Citizen document lookups require live upstream verification from authorized government data bridges (NeoAPI, AxenAPI, FastNexora).

**Policy:** When an operator is offline, all financial, verification, and document creation actions are safely blocked. The application renders the `/offline` screen, preventing fraudulent balance claims or corrupted print states.

---

## 4. Privacy-Conscious Telemetry

The PWA integrates with Accero's existing Google Tag Manager (GTM) data layer using strict data minimization:
- **Zero PII Transmission:** Events log only abstract lifecycle milestones (`pwa_install_prompt_view`, `pwa_install_completed`, `pwa_standalone_launch`, `pwa_offline_view`).
- **Platform Analytics:** Records only high-level device category (`chromium`, `ios`, `ipados`), screen orientation, and standalone launch mode.
- **No Document Context:** No document identifiers, cardholder names, or transaction values are ever attached to PWA telemetry payloads.
