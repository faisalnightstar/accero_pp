# Phase 3.1.2.1: Production Release Gate & Verification Checklist

**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Phase:** 3.1.2.1 — Staging Validation & Production Release Gate  
**Execution Date:** 2026-11-17  
**Gatekeeper:** Principal Release Manager & Application Security Engineer  

---

## 1. Mandatory Pre-Release Gate Checklist

Every item in this checklist represents a hard production release gate. Any failure blocks production promotion.

### Section 1: Application Security & Citizen PII Protection (P0)
- [x] **Adversarial PII Defense:** 12-digit continuous, spaced, and Unicode-spaced Aadhaar numbers are purged before dataLayer dispatch (`tests/analytics-pii-adversarial.test.ts`).
- [x] **PAN Card Defense:** Uppercase, lowercase, mixed-case, and spaced Indian PAN cards are purged.
- [x] **Voter ID (EPIC), DL, RC Defense:** Voter IDs, Driving Licences, and Vehicle RC numbers are purged.
- [x] **Ration Card & Farmer ID Defense:** 12-digit ration IDs and AgriStack farmer IDs are purged.
- [x] **Demographic & Contact Data Defense:** Mobile numbers (+91/91/0), email addresses, citizen names, DOBs, and addresses are purged.
- [x] **Biometric Data Defense:** Photos, signatures, base64 data URIs, and biometric buffers are strictly purged.
- [x] **Authentication & Secret Defense:** Passwords, JWT tokens, Bearer headers, and API keys are strictly purged.
- [x] **Circular Reference Protection:** Recursive object traversal uses `WeakSet` visited traps to prevent call stack overflow crashes.
- [x] **URL Parameter Scrubbing:** Sensitive tokens and document numbers are stripped from tracking paths and URLs.
- [x] **GA4 E-Commerce Telemetry Integrity:** Valid conversion parameters (`items`, `currency`, `value`, `transaction_id`) are preserved.

### Section 2: Payment Idempotency & Revenue Tracking (P0)
- [x] **Authoritative Backend Verification:** Wallet balances are modified strictly inside atomic database operations (`findOneAndUpdate`).
- [x] **Repeated Callback Idempotency:** Subsequent verification requests return `alreadyCredited: true` and never increment balance twice (`tests/payment-idempotency.test.ts`).
- [x] **Atomic State Lock:** Concurrency races are handled via atomic `PENDING -> PROCESSING` transition lock.
- [x] **Ledger Redundancy Check:** Transaction ledger is inspected for duplicate `referenceId` prior to crediting.
- [x] **Amount Tampering Rejection:** Gateway reported amounts differing from order amounts by > ₹0.01 trigger terminal failure and security warnings.
- [x] **Client Purchase Deduplication:** Client-side `Set<string>` prevents double-firing of `purchase` events on React re-renders.
- [x] **Financial Decoupling:** Analytics delivery failures or adblocker blocking cannot disrupt backend wallet crediting.

### Section 3: Transport Security & Marketing Claims (P1)
- [x] **Global HSTS:** `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` configured in `next.config.ts`.
- [x] **MIME Sniffing & Framing Protection:** `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN` active.
- [x] **Referrer & Permissions Policies:** `strict-origin-when-cross-origin` and camera/microphone denial active.
- [x] **Accurate TLS Marketing:** Legacy "256-bit SSL" badges replaced with "256-Bit TLS Encryption".
- [x] **Ungrounded Claims Removed:** Fabricated "AES-256 database storage" and "certified DPDPA" claims replaced with factual DPDP-aligned wording.

### Section 4: Public Product Asset: CR80 Card Size Calculator (P1)
- [x] **Public Route Implemented:** Accessible at `/tools/cr80-card-size-calculator` (`src/app/tools/cr80-card-size-calculator/page.tsx`).
- [x] **Interactive Client Component:** Live DPI selector, bleed slider, presets, SVG card preview, and copy button (`Cr80CalculatorClient.tsx`).
- [x] **Structured Data Injected:** BreadcrumbList, SoftwareApplication, and FAQ schemas server-rendered.
- [x] **Internal Linking Active:** Linked from `PublicFooter.tsx` (Cornerstone Guides) and `cr80-card-dimensions-guide`.
- [x] **Sitemap Registration:** Added to `CANONICAL_PUBLIC_ROUTES` and reflected in `sitemap.xml` (53 routes total).

### Section 5: Ephemeral Document Retention & Privacy Boundaries (P1)
- [x] **72-Hour TTL Configuration:** `CACHE_TTL_HOURS = 72` (259,200,000 ms) strictly configured (`documentCache.ts`).
- [x] **Synchronous Expiration Validation:** `isDocumentCacheValid` returns `false` at exact expiration timestamp and post-expiry.
- [x] **Invalid Expiration Handled:** Missing, null, or invalid Date objects return `false`.
- [x] **Tenant Isolation Enforced:** Database queries strictly enforce `userId` scoping, preventing cross-tenant access (`tests/document-retention.test.ts`).
- [x] **HMAC Hash Lookup:** Document lookups utilize HMAC-SHA256 hashed keys without storing plaintext citizen numbers in indices.

### Section 6: SEO Route Governance & Crawl Control (P1)
- [x] **Canonical Route Parity:** 52 baseline canonical routes + 1 new public tool asset = 53 canonical routes (`routes.ts`).
- [x] **Sitemap Integrity:** `sitemap.xml` contains exactly 53 authoritative production HTTPS URLs with zero duplicates or query strings.
- [x] **Obsolete SearchAction Purged:** Removed retired Sitelinks Searchbox JSON-LD declaration.
- [x] **LLM Manifest Indexing Controls:** `X-Robots-Tag: noindex` configured on `/llms.txt` and `/llms-full.txt`.

### Section 7: Print Workflow & Mobile Viewport Usability (P2)
- [x] **Authorized Print Initiation:** `print_initiated` fires strictly after server fee authorization.
- [x] **Print Dialog Semantic Return:** `print_dialog_closed` represents return from browser print window (not physical output proof).
- [x] **Mobile Widget Clearance:** Floating WhatsApp support widget shifted to `bottom-20 sm:bottom-6 right-4 sm:right-6` providing 80px clearance from sticky CTA elements.

### Section 8: Quality Assurance & Build Verification (P0)
- [x] **TypeScript Strict Compilation:** `npx tsc --noEmit` passed with 0 errors.
- [x] **Automated Test Suite:** 37 test files passed, 375 tests passed, 0 failures (`npm test`).
- [x] **Next.js Production Build:** Succeeded (`npm run build`), generating 77 static and dynamic server routes.
- [x] **Zero Production Mutation:** No live production deployment executed; staging release hold maintained.

---

## 2. Release Gate Verdict

**Current Status:** **READY FOR STAGING, PRODUCTION HOLD (OPTION B)**

### Rationales:
1. All local and staging engineering hardening objectives have been completed, tested, and validated.
2. 37/37 automated test suites (375 tests) pass cleanly.
3. Zero TypeScript errors and clean production build (77/77 routes generated).
4. Production deployment remains strictly prohibited until staging integration with live Paytm merchant credentials and Google Search Console recrawl verification are completed.
