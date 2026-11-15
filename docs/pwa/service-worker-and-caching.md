# Accero PrintPortal — Service Worker & Caching Specification

**File Location:** `public/sw.js`  
**Registration Component:** `src/components/pwa/ServiceWorkerRegistration.tsx`  
**Version Identifier:** `accero-pwa-v1.0.0`  

---

## 1. Overview & Security Mandate

The Accero PrintPortal service worker is an enterprise-grade, zero-dependency caching and offline engine. Its primary design mandate is to **guarantee absolute data isolation and zero caching of sensitive citizen data or operator financial records**, while providing instant launch performance for static bundles and graceful fallback when the internet drops.

### Core Non-Negotiable Invariants
1. **Never Cache Authentication & Tokens:** JWT cookies and `/api/auth/*` responses are strictly Network-Only.
2. **Never Cache Financial Ledgers:** Wallet balances, Paytm transaction status, and `/api/wallet/*` endpoints are never written to CacheStorage.
3. **Never Cache Document Lookup Data:** Aadhaar, PAN, Voter ID, Driving Licence, Vehicle RC, Ration Card, and Farmer records are never stored in service worker caches.
4. **Never Cache Split-Screen Studio State:** `/studio` is an authenticated operator workspace and must always reflect live, fresh server state.

---

## 2. Cache Partitioning & Versioning

The service worker establishes two isolated cache partitions prefixed by the active release version:

```javascript
const CACHE_VERSION = 'accero-pwa-v1.0.0';
const STATIC_CACHE = `accero-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `accero-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';
```

### Static Cache (`STATIC_CACHE`)
Precached upon service worker installation. Holds immutable assets required to render the application shell and the offline fallback screen:
- `/offline` — Pre-rendered offline fallback HTML.
- `/favicon.ico` — Multi-resolution browser icon.
- `/favicon.svg` — Scalable vector SVG icon.
- `/icons/icon-192.png` — Standard 192px application icon.
- `/icons/icon-512.png` — Standard 512px high-DPI application icon.
- `/icons/icon-maskable-192.png` — 192px maskable adaptive icon.
- `/icons/icon-maskable-512.png` — 512px maskable adaptive icon.
- `/icons/apple-touch-icon.png` — 180px iOS Home Screen icon.
- `/manifest.webmanifest` — Web App Manifest payload.

### Runtime Cache (`RUNTIME_CACHE`)
Populated on-demand using a **Network-First** strategy for public, non-sensitive marketing and informational pages:
- Landing page (`/`)
- Public service pages (`/services/*`)
- Competitor comparison pages (`/compare/*`)
- Help & support articles (`/faq`, `/about`, `/contact`, `/pricing`)

---

## 3. Strict Routing & Caching Matrix

| Request Category | Pattern / Route Match | Strategy | Fallback Behavior |
| :--- | :--- | :--- | :--- |
| **All Mutation Requests** | `POST`, `PUT`, `DELETE`, `PATCH` | **Network-Only** | Bypass SW completely. |
| **Authentication APIs** | `/api/auth/*` | **Network-Only** | Return HTTP 503 JSON if offline. |
| **Financial / Payment APIs** | `/api/wallet/*`, `/api/print/*` | **Network-Only** | Return HTTP 503 JSON if offline. |
| **Document Processing APIs**| `/api/documents/*`, `/api/verify/*` | **Network-Only** | Return HTTP 503 JSON if offline. |
| **Administrative & Support** | `/api/admin/*`, `/api/support/*` | **Network-Only** | Return HTTP 503 JSON if offline. |
| **Operator Workspaces** | `/dashboard`, `/studio`, `/wallet`, `/cards`, `/admin`, `/support` | **Network-Only** | Serve cached `/offline` page on network disconnect. |
| **Authentication Pages** | `/login`, `/register`, `/forgot-password`, `/reset-password` | **Network-Only** | Serve cached `/offline` page on network disconnect. |
| **Static Next.js Chunks** | `/_next/static/*` | **Cache-First** | Return cached JS/CSS chunks; fetch and cache on miss. |
| **Branding & Static Icons** | `/icons/*`, `/assets/*`, `/favicon.*` | **Cache-First** | Serve from `STATIC_CACHE`. |
| **Google Fonts** | `fonts.googleapis.com`, `fonts.gstatic.com` | **Cache-First** | Cache cross-origin font files for offline font fidelity. |
| **Public HTML Navigations** | `/`, `/pricing`, `/faq`, `/services/*` | **Network-First** | Fall back to `RUNTIME_CACHE`; if unvisited, serve `/offline`. |

---

## 4. Lifecycle Event Management

### 1. Install Event (`install`)
Preloads all critical application shell assets into `STATIC_CACHE`. Calls `self.skipWaiting()` to allow the service worker to transition to the installed/waiting phase immediately.

### 2. Activate Event (`activate`)
Iterates over all existing caches in `caches.keys()`. Any cache starting with `accero-` whose name does not match the current `STATIC_CACHE` or `RUNTIME_CACHE` is deleted immediately. Upon completion, calls `self.clients.claim()` to take control of open tabs.

### 3. Update Message Handling (`message`)
Listens for `{ type: 'SKIP_WAITING' }` dispatched from `ServiceWorkerRegistration.tsx`. When the operator clicks "Update Now" on the update notification banner, this message is posted to activate the new service worker version without requiring a manual browser restart.

---

## 5. Security & Multi-User Terminal Safeguards

In Indian cyber cafes and CSC kiosks, multiple operators or customers frequently share the same physical computer terminal:

1. **Zero Cross-Session Data Leakage:** Because neither the studio canvas data nor document records are stored in CacheStorage, logging out of an operator account instantly clears all session data. A subsequent user opening the application cannot inspect or recover the previous user's documents from the service worker cache.
2. **HTTP-Only Cookies Intact:** Authentication continues to rely exclusively on signed JWTs stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies. The service worker never inspects, modifies, or stores session credentials.
3. **SSRF & Network Boundary Enforcement:** External API calls to government verification providers or payment gateways remain governed by server-side server actions and the Fixie outbound static proxy, entirely untouched by client-side service worker caching.
