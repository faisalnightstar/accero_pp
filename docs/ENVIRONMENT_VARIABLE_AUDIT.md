# Accero PrintPortal — Environment Variable Audit & Security Cleanup Report

**Audit Date:** November 2026  
**Auditor:** Technical Documentation Architect & DevEx Security Engineer  
**Repository:** `accero_pp` (Accero PrintPortal Next.js)  
**Status:** Audit Complete & Verified  

---

## 1. Executive Summary

A comprehensive, repository-wide audit and cleanup of all environment configuration files (`.env`, `.env.local`, `.env.example`) was conducted. The objectives were to:
1. Identify all active, optional, development-only, and obsolete environment variables.
2. Scrub an active credential leak discovered in `.env.example` (where a live Upstash Redis URL and REST token had been committed).
3. Eliminate duplicate and malformed variable entries (`MID1`/`UPI1` aliases, `//URI` syntax defects).
4. Synchronize `.env.example` with all actual production runtime dependencies, including SMTP mail configurations, token expiration durations, and secondary merchant account parameters.
5. Guarantee that all secret-bearing files (`.env`, `.env.local`) are strictly excluded from Git tracking via `.gitignore`.

> [!IMPORTANT]
> **Zero Exposure Guarantee:** In accordance with strict security standards, no plaintext secrets, tokens, database passwords, or merchant keys are displayed, recorded, or committed in this document or version control.

---

## 2. Environment Variable Inventory & Classification

All 40 discovered variables have been classified into six operational categories based on codebase references across `src/`, `scripts/`, and `tests/`:

### 2.1 Required Production Variables
Core variables without which the Next.js runtime, authentication, or persistence layer will fail immediately.

| Variable Name | Purpose & Runtime Scope | Validation & Enforcement |
| :--- | :--- | :--- |
| `ACCERO_MONGODB_URI` | MongoDB connection string (Replica Set / MongoDB Atlas) for users, ledger, cards, and audits. | Enforced in `src/lib/config/env.ts` and `src/lib/mongodb.ts`. |
| `JWT_SECRET` | Primary cryptographic key (min 32 chars) for signing and verifying Jose JWT session tokens. | Enforced in `src/lib/config/env.ts` and `src/lib/auth.ts`. |
| `NODE_ENV` | Next.js runtime environment mode (`development`, `production`, `test`). | Core framework standard. |
| `NEXT_PUBLIC_APP_URL` | Public canonical base URL (e.g. `https://printportal.accero.app`) for SEO, sitemaps, and canonical tags. | Enforced in `src/lib/seo/canonical.ts`. |

---

### 2.2 Optional Production Variables (Actively Used)
Variables supporting modular external integrations. If omitted, the application operates safely using graceful fallbacks.

| Variable Name | Subsystem / Purpose | Fallback Behavior if Unset |
| :--- | :--- | :--- |
| `ACCESS_TOKEN_SECRET` | Dedicated secret for signing short-lived access tokens. | Falls back to `JWT_SECRET`. |
| `ACCESS_TOKEN_EXPIRY` | Access token lifespan (e.g. `3d` / 259200s). | Defaults to `3d` in `src/app/api/auth/`. |
| `REFRESH_TOKEN_SECRET` | Dedicated secret for signing long-lived refresh tokens. | Falls back to internal cryptographic constant in `src/lib/auth.ts`. |
| `REFRESH_TOKEN_EXPIRY` | Refresh token lifespan (e.g. `30d` / 2592000s). | Defaults to `30d` in `src/app/api/auth/`. |
| `PAYTM_MID` | Primary Paytm Merchant ID for UPI dynamic QR and wallet recharges. | Recharges disabled; manual bank transfer review available. |
| `PAYTM_MERCHANT_KEY` | Paytm Merchant Secret Key for SHA256 checksum signing and webhook validation. | Dynamic order generation disabled. |
| `PAYTM_UPI` | Primary Paytm UPI VPA handle for dynamic QR rendering. | UPI QR generation disabled. |
| `PAYTM_MID2` | Secondary Paytm Merchant ID for multi-account rotation. | System routes all orders to primary merchant. |
| `PAYTM_UPI2` | Secondary Paytm UPI VPA handle for multi-account rotation. | System routes all orders to primary merchant. |
| `PAYTM_WEBSITE` | Paytm website parameter (Default: `DEFAULT`). | Defaults to `DEFAULT` in `src/lib/config/env.ts`. |
| `PAYTM_ENVIRONMENT` | Paytm mode (`STANDARD` or `CUSTOM`). | Defaults to `STANDARD` in `src/lib/config/env.ts`. |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for distributed sliding-window rate limiting. | Falls back to MongoDB TTL + in-memory store. |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token for authenticated Redis commands. | Paired with `UPSTASH_REDIS_REST_URL`. |
| `KV_REST_API_URL` / `TOKEN` | Vercel KV alternative aliases for Upstash Redis. | Handled automatically in `src/lib/redis.ts`. |
| `NEO_API_KEY` | API key for NeoAPI (V1/V2 citizen and voter card lookups). | Operator uses manual data entry mode. |
| `AXEN_API_KEY` | API key for AxenAPI secondary document lookup provider. | Provider cascade skips to next provider. |
| `FASTNEXORA_API_KEY` | API key for FastNexora tertiary document lookup provider. | Provider cascade skips to next provider. |
| `FIXIE_URL` | Fixed outbound IP proxy URL for whitelisted government data provider endpoints. | Direct fetch used (local dev); required in production. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier for remote citizen photo and signature storage. | Fallback to temporary local Base64 buffers. |
| `CLOUDINARY_API_KEY` | Server-side Cloudinary API key. | Paired with `CLOUDINARY_CLOUD_NAME`. |
| `CLOUDINARY_API_SECRET` | Server-side Cloudinary API secret (never exposed to browser). | Paired with `CLOUDINARY_CLOUD_NAME`. |
| `CLOUDINARY_URL` | Single-string Cloudinary configuration (`cloudinary://key:secret@cloud`). | Alternative to individual Cloudinary keys. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Public client-side Cloudinary cloud name for Next-Cloudinary components. | Image components use standard Next.js Image. |
| `CLOUDINARY_AUTH_TOKEN_KEY` | Key for generating signed, time-limited private delivery URLs. | Falls back to standard HTTPS CDN delivery. |
| `MAIL_HOST` | SMTP server host for transactional password reset emails (e.g. `smtp.gmail.com`). | Password reset URLs logged to server console. |
| `MAIL_PORT` | SMTP port (587 for TLS, 465 for SSL). | Defaults to `587`. |
| `MAIL_SECURE` | Boolean flag for SSL socket connections. | Evaluates port 465. |
| `MAIL_USER` | SMTP authentication username / sender email address. | Console fallback. |
| `MAIL_PASS` | SMTP authentication password or Gmail App Password. | Console fallback. |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager web container ID for analytics telemetry. | Analytics tracking gracefully suppressed. |
| `PORT` | Local HTTP server port. | Defaults to `3000`. |
| `CLIENT_URL` | Client application URL used as fallback base for password reset links. | Falls back to `request.headers.get('origin')`. |

---

### 2.3 Development & Testing-Only Variables
Variables strictly restricted to local development or Vitest integration testing.

| Variable Name | Purpose | Production Protection |
| :--- | :--- | :--- |
| `ALLOW_SANDBOX_RECHARGE` | Enables instant wallet top-up button without real payment gateway interaction. | Strictly disabled and blocked in `NODE_ENV=production`. |
| `ALLOW_MOCK_PROVIDERS` | Allows MockSimulation provider to return synthetic test documents. | Strictly disabled and blocked in `NODE_ENV=production`. |
| `ALLOW_FIXIE_BYPASS_DEV` | Allows direct fetch when `FIXIE_URL` is omitted in local dev. | Fails closed with error if omitted in production. |
| `ENABLE_NETWORK_AUDIT_LOGS` | Enables verbose HTTP network request logging in terminal. | Defaults to `false`. |

---

### 2.4 Duplicate, Obsolete or Removed Variables

| Variable Name | Source File | Action Taken | Rationale |
| :--- | :--- | :--- | :--- |
| `UPSTASH_REDIS_REST_URL` (duplicate live token) | `.env.example` | **Scrubbed** | Replaced live credentials with safe placeholder `https://your-upstash-redis-url.upstash.io`. |
| `UPSTASH_REDIS_REST_TOKEN` (duplicate live token) | `.env.example` | **Scrubbed** | Replaced live credentials with safe placeholder `your_upstash_redis_rest_token_here`. |
| `//URI` (malformed comment) | `.env.local` | **Corrected** | Converted malformed `//` line into a proper `# MONGODB_URI_ALT` comment. |
| `MID1` / `UPI1` | `.env.local` | **Normalized** | Duplicate legacy aliases of `PAYTM_MID` and `PAYTM_UPI`. Standardized on `PAYTM_MID`/`PAYTM_UPI` while preserving code fallback. |
| `NEO_KEY_Afjal` | `.env.local` | **Archived** | Obsolete personal key; active provider uses `NEO_API_KEY`. Preserved as `# NEO_KEY_AFJAL_BACKUP` comment. |
| `GOOGLE_CLIENT_ID` / `SECRET` | `.env.local` | **Preserved as Comment** | Not referenced in active codebase (JWT auth used). Preserved as `# GOOGLE_CLIENT_ID` comment for future OAuth. |
| `CORS_ORIGIN` | `.env.local` | **Removed** | Unreferenced in Next.js App Router codebase. |

---

## 3. Files Modified

1. **`.env.example` (Completely Modernized & Scrubbed):**
   - Removed live leaked Upstash credentials.
   - Grouped all variables into 11 logical sections matching the architectural domains.
   - Added missing variables (`ACCESS_TOKEN_*`, `REFRESH_TOKEN_*`, `MAIL_*`, `CLIENT_URL`, `PORT`).
   - Added concise comments explaining whether each variable is `[Required]` or `[Optional]`.
2. **`.env.local` (Cleaned & Structured):**
   - Corrected malformed `//URI` line to `# MONGODB_URI_ALT`.
   - Removed duplicate `CORS_ORIGIN`.
   - Commented legacy `MID1`/`UPI1` aliases and archived `NEO_KEY_Afjal` safely.
   - Grouped into identical 11 logical sections without altering any active secret values.
3. **`.env` (Preserved & Formatted):**
   - Formatted into clean sections with defaults, preserving all existing values.
4. **`.gitignore` (Hardened):**
   - Explicitly verified `.env`, `.env.local`, and `.env*.local` are ignored, while whitelisting `!.env.example`.

---

## 4. Verification & Build Results

- **Git Ignore Verification:**
  - `git check-ignore -v .env .env.local .env.example` confirms:
    - `.env` $\rightarrow$ **IGNORED** (`.gitignore:24:.env*`)
    - `.env.local` $\rightarrow$ **IGNORED** (`.gitignore:24:.env*`)
    - `.env.example` $\rightarrow$ **TRACKED** (`!.env.example`)
- **TypeScript Type Checking:**
  - `npx tsc --noEmit` executed with **0 errors**.
- **PWA & Core Test Suites:**
  - `npx vitest run tests/pwa.test.ts` $\rightarrow$ **18 / 18 tests passing**.
- **Link Integrity:**
  - Cross-references to `.env.example` in `README.md` and documentation remain valid.

---

## 5. Deployment & Vercel Configuration Guide

For production deployments on Vercel:
1. Configure `ACCERO_MONGODB_URI`, `JWT_SECRET`, and `NEXT_PUBLIC_APP_URL` in the Vercel Project Settings under **Environment Variables**.
2. For live recharges, configure `PAYTM_MID`, `PAYTM_MERCHANT_KEY`, and `PAYTM_UPI`.
3. For static egress whitelisting, configure `FIXIE_URL`.
4. For edge rate limiting, configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
5. Ensure `ALLOW_SANDBOX_RECHARGE` and `ALLOW_MOCK_PROVIDERS` are either omitted or explicitly set to `false`.
