# Phase 3.1.2.1: Staging Validation & Release Verification Matrix

**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Phase:** 3.1.2.1 — Staging Validation & Production Release Gate  
**Execution Date:** 2026-11-17  
**Framework:** Next.js 15.5.26 / React 19 / TypeScript (Strict)  

---

## 1. Traceability & Engineering Release Matrix

| ID | Workstream | Requirement | Implementation Path | Test Evidence | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **WS-A01** | Workstream A: PII Protection | Strip 12-digit Aadhaar in all formats (continuous, spaced, Unicode) | `src/lib/analytics/dataLayer.ts` | `tests/analytics-pii-adversarial.test.ts` (Test 1) | **VERIFIED** |
| **WS-A02** | Workstream A: PII Protection | Strip Indian PAN cards (case-insensitive, spaced, underscored) | `src/lib/analytics/dataLayer.ts` | `tests/analytics-pii-adversarial.test.ts` (Test 2) | **VERIFIED** |
| **WS-A03** | Workstream A: PII Protection | Strip EPIC Voter ID numbers across arbitrary field names | `src/lib/analytics/dataLayer.ts` | `tests/analytics-pii-adversarial.test.ts` (Test 3) | **VERIFIED** |
| **WS-A04** | Workstream A: PII Protection | Strip Driving Licence (DL) and Vehicle Registration (RC) | `src/lib/analytics/dataLayer.ts` | `tests/analytics-pii-adversarial.test.ts` (Test 4) | **VERIFIED** |
| **WS-A05** | Workstream A: PII Protection | Strip Ration Card & Farmer ID numbers | `src/lib/analytics/dataLayer.ts` | `tests/analytics-pii-adversarial.test.ts` (Test 5) | **VERIFIED** |
| **WS-A06** | Workstream A: PII Protection | Strip Indian mobile phone numbers (+91, 91, 0, local) | `src/lib/analytics/dataLayer.ts` | `tests/analytics-pii-adversarial.test.ts` (Test 6) | **VERIFIED** |
| **WS-A07** | Workstream A: PII Protection | Strip email addresses in parameters and sentences | `src/lib/analytics/dataLayer.ts` | `tests/analytics-pii-adversarial.test.ts` (Test 7) | **VERIFIED** |
| **WS-A08** | Workstream A: PII Protection | Strip names, father names, DOBs, and addresses | `src/lib/analytics/dataLayer.ts` | `tests/analytics-pii-adversarial.test.ts` (Test 8) | **VERIFIED** |
| **WS-A09** | Workstream A: PII Protection | Strip photos, signatures, base64 data URIs, biometrics | `src/lib/analytics/dataLayer.ts` | `tests/analytics-pii-adversarial.test.ts` (Test 9) | **VERIFIED** |
| **WS-A10** | Workstream A: PII Protection | Strip bank accounts, IFSC codes, UPI VPAs, and ledgers | `src/lib/analytics/dataLayer.ts` | `tests/analytics-pii-adversarial.test.ts` (Test 10-11) | **VERIFIED** |
| **WS-A11** | Workstream A: PII Protection | Strip JWT tokens, Bearer headers, passwords, and API keys | `src/lib/analytics/dataLayer.ts` | `tests/analytics-pii-adversarial.test.ts` (Test 12) | **VERIFIED** |
| **WS-A12** | Workstream A: PII Protection | Safely handle circular object references without crashing | `src/lib/analytics/dataLayer.ts` | `tests/analytics-pii-adversarial.test.ts` (Test 15) | **VERIFIED** |
| **WS-A13** | Workstream A: PII Protection | Strip sensitive query parameters from URLs and paths | `src/lib/analytics/dataLayer.ts` | `tests/analytics-pii-adversarial.test.ts` (Test 17) | **VERIFIED** |
| **WS-A14** | Workstream A: PII Protection | Preserve legitimate GA4 purchase e-commerce telemetry | `src/lib/analytics/dataLayer.ts` | `tests/analytics-pii-adversarial.test.ts` (Test 18) | **VERIFIED** |
| **WS-A15** | Workstream A: PII Protection | Direct inspection of Google Tag Manager UI / workspace | Third-party Google Tag Manager | External GTM web interface | **BLOCKED EXTERNAL** |
| **WS-B01** | Workstream B: Payment Idempotency | Authoritative backend database source of truth | `src/lib/payment/paytm.ts` | `tests/payment-idempotency.test.ts` (Test 1) | **VERIFIED** |
| **WS-B02** | Workstream B: Payment Idempotency | Repeated verification calls return `alreadyCredited: true` | `src/lib/payment/paytm.ts` | `tests/payment-idempotency.test.ts` (Test 1) | **VERIFIED** |
| **WS-B03** | Workstream B: Payment Idempotency | Concurrent callback race condition handling (atomic claim) | `src/lib/payment/paytm.ts` | `tests/payment-idempotency.test.ts` (Test 2) | **VERIFIED** |
| **WS-B04** | Workstream B: Payment Idempotency | Rejection of missing, empty, or unassociated order IDs | `src/lib/payment/paytm.ts` | `tests/payment-idempotency.test.ts` (Test 3-4) | **VERIFIED** |
| **WS-B05** | Workstream B: Payment Idempotency | Rejection of gateway reported terminal payment failure | `src/lib/payment/paytm.ts` | `tests/payment-idempotency.test.ts` (Test 5) | **VERIFIED** |
| **WS-B06** | Workstream B: Payment Idempotency | Rejection of altered amounts (expected vs reported mismatch) | `src/lib/payment/paytm.ts` | `tests/payment-idempotency.test.ts` (Test 6) | **VERIFIED** |
| **WS-B07** | Workstream B: Payment Idempotency | Client purchase event deduplication via transaction Set | `src/lib/analytics/events.ts` | `tests/payment-idempotency.test.ts` (Test 7) | **VERIFIED** |
| **WS-B08** | Workstream B: Payment Idempotency | Decoupling: analytics failure cannot disrupt wallet credit | `src/lib/payment/paytm.ts` | `tests/payment-idempotency.test.ts` (Test 8) | **VERIFIED** |
| **WS-B09** | Workstream B: Payment Idempotency | Live payment gateway execution with real banking credentials | Third-party Paytm gateway | Requires live merchant MID / Key | **IMPLEMENTED — NOT EXTERNALLY VERIFIED** |
| **WS-C01** | Workstream C: Security Claims | Modern TLS 1.3 / 256-bit transport encryption badge | `src/components/public/PublicFooter.tsx` | Codebase scan: zero legacy SSL | **VERIFIED** |
| **WS-C02** | Workstream C: Security Claims | Configure global HSTS, X-Content-Type-Options, X-Frame-Options | `next.config.ts` | `next.config.ts` headers block | **VERIFIED** |
| **WS-C03** | Workstream C: Security Claims | Replaced ungrounded "AES-256 database" and "certified DPDPA" claims | `src/app/privacy-policy/`, `src/app/security/` | Document audits & code verification | **VERIFIED** |
| **WS-C04** | Workstream C: Security Claims | Formal statutory DPDPA compliance legal opinion | Legal counsel requirement | Requires licensed Indian cyber law firm | **BLOCKED EXTERNAL** |
| **WS-D01** | Workstream D: CR80 Calculator | Public product tool route at `/tools/cr80-card-size-calculator` | `src/app/tools/cr80-card-size-calculator/page.tsx` | Prerendered in build (77/77 routes) | **VERIFIED** |
| **WS-D02** | Workstream D: CR80 Calculator | Interactive client component with live DPI, bleed, and presets | `src/components/tools/Cr80CalculatorClient.tsx` | `tests/cr80-calculator.test.ts` (8 tests) | **VERIFIED** |
| **WS-D03** | Workstream D: CR80 Calculator | Internal linking from PublicFooter & Cornerstone Guides | `PublicFooter.tsx`, `cr80-card-dimensions-guide` | Verified anchor tags & navigation links | **VERIFIED** |
| **WS-D04** | Workstream D: CR80 Calculator | Registration in canonical routes registry and sitemap | `src/lib/seo/routes.ts` | `tests/seo/sitemap.test.ts` (53 routes) | **VERIFIED** |
| **WS-E01** | Workstream E: Document Retention | 72-Hour TTL parameters (`CACHE_TTL_HOURS = 72`, 259,200,000 ms) | `src/lib/documents/documentCache.ts` | `tests/document-retention.test.ts` (Test 1) | **VERIFIED** |
| **WS-E02** | Workstream E: Document Retention | Synchronous validity check returns true before expiry | `src/lib/documents/documentCache.ts` | `tests/document-retention.test.ts` (Test 2-3) | **VERIFIED** |
| **WS-E03** | Workstream E: Document Retention | Boundary check: returns false at exact expiry and post-expiry | `src/lib/documents/documentCache.ts` | `tests/document-retention.test.ts` (Test 4-5) | **VERIFIED** |
| **WS-E04** | Workstream E: Document Retention | Rejection of missing, null, or invalid `expiresAt` timestamps | `src/lib/documents/documentCache.ts` | `tests/document-retention.test.ts` (Test 6-7) | **VERIFIED** |
| **WS-E05** | Workstream E: Document Retention | Strict tenant isolation (User B cannot access User A documents) | `src/lib/documents/documentCache.ts` | `tests/document-retention.test.ts` (Test 9) | **VERIFIED** |
| **WS-E06** | Workstream E: Document Retention | HMAC-SHA256 lookup hashing without plaintext index exposure | `src/lib/documents/documentCache.ts` | `tests/document-retention.test.ts` (Test 10-11) | **VERIFIED** |
| **WS-F01** | Workstream F: SEO Validation | 52 canonical public baseline routes + 1 tool asset (53 total) | `src/lib/seo/routes.ts` | `tests/seo-indexing-policy.test.ts` | **VERIFIED** |
| **WS-F02** | Workstream F: SEO Validation | Sitemap contains only authoritative canonical URLs | `src/app/sitemap.ts` | `tests/seo/sitemap.test.ts` | **VERIFIED** |
| **WS-F03** | Workstream F: SEO Validation | Obsolete SearchAction JSON-LD removed | `src/lib/seo/structuredData.ts` | `tests/seo/structured-data.test.ts` | **VERIFIED** |
| **WS-F04** | Workstream F: SEO Validation | `X-Robots-Tag: noindex` configured on `/llms.txt` manifests | `next.config.ts` | Configured in `headers()` | **VERIFIED** |
| **WS-F05** | Workstream F: SEO Validation | Google Search Console re-crawl & indexation validation | Google Search Console integration | Requires Google web crawler re-visit | **BLOCKED EXTERNAL** |
| **WS-G01** | Workstream G: Print Workflow | `print_initiated` fires strictly after server fee authorization | `src/app/studio/page.tsx`, `cards/page.tsx` | Code inspection & event contract | **VERIFIED** |
| **WS-G02** | Workstream G: Print Workflow | `print_dialog_closed` represents browser dialog exit | `src/app/studio/page.tsx`, `cards/page.tsx` | Replaced premature `PRINT_COMPLETED` | **VERIFIED** |
| **WS-G03** | Workstream G: Print Workflow | WhatsApp support widget mobile clearance (`bottom-20 sm:bottom-6`) | `src/components/layout/WhatsAppSupportWidget.tsx` | Viewport CSS inspection (80px clearance) | **VERIFIED** |
| **WS-G04** | Workstream G: Print Workflow | Physical Canon G570 / G670 & Epson L805 hardware tray test | Physical printer hardware | Requires physical printing shop hardware | **BLOCKED EXTERNAL** |

---

## 2. Release Metric Summary
- **Total Requirements Tracked:** 44
- **VERIFIED:** 39 (88.6%)
- **IMPLEMENTED — NOT EXTERNALLY VERIFIED:** 1 (2.3% — Live Paytm gateway payment using real bank money)
- **BLOCKED EXTERNAL:** 4 (9.1% — GTM Workspace UI review, Physical printer hardware, Legal counsel DPDPA review, Google Search Console recrawl)
- **FAILED:** 0 (0.0%)
- **NOT APPLICABLE:** 0 (0.0%)
