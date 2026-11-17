# GOOGLE SEARCH CONSOLE INTEGRATION & REPORTING TEMPLATE

**Entity:** Accero PrintPortal (`https://printportal.accero.app`)  
**Target Domain:** `printportal.accero.app`  
**Sitemap URL:** `https://printportal.accero.app/sitemap.xml`  
**Standard:** Rigorous measurement framework. No fabricated impressions, clicks, or ranking numbers.

---

## 1. INTEGRATION & VERIFICATION PROCEDURE

### A. Ownership Verification Methods
1. **Domain Property (Recommended):**  
   - Add a DNS TXT record to the root DNS zone for `accero.app` at your registrar (Cloudflare / Hostinger / Route 53):
     ```
     v=google-site-verification=<verification_token>
     ```
   - Covers all subdomains (`printportal.accero.app`, staging, and future micro-services).
2. **URL Prefix Property:**  
   - Target: `https://printportal.accero.app/`
   - Secondary verification via HTML Meta Tag injected into `src/app/layout.tsx`:
     ```html
     <meta name="google-site-verification" content="<verification_token>" />
     ```

### B. Sitemap Submission Protocol
1. Navigate to **Google Search Console > Indexing > Sitemaps**.
2. Enter the path: `sitemap.xml`.
3. Click **Submit**.
4. Confirm Status: **Success** with **76 discovered URLs** (verified against production build static routes).

### C. URL Inspection Testing Protocol
For each newly deployed competitor pillar page, execute a URL Inspection test:
- `/print-portal`
- `/best-print-portal-for-csc`
- `/print-portal-for-cyber-cafe`
- `/print-portal-for-retailers`
- `/pvc-card-printing-software`
- `/csc-operator-software`
- `/document-processing-platform`

Verify:
- **Page Fetch:** Successful (HTTP 200)
- **User-declared Canonical:** Matches `https://printportal.accero.app/...`
- **Google-selected Canonical:** Inspect to confirm Google respects the user-declared canonical.
- **Rich Results Status:** Valid `SoftwareApplication`, `BreadcrumbList`, and `FAQPage` schemas detected with zero critical errors.

---

## 2. WEEKLY SEARCH CONSOLE REPORTING TEMPLATE

```markdown
# Weekly Google Search Console Performance Report
**Reporting Week:** [YYYY-MM-DD to YYYY-MM-DD]  
**Property:** https://printportal.accero.app  
**Date Generated:** [YYYY-MM-DD]  

### 1. High-Level Performance Overview
| Metric | Previous Week | Current Week | Week-over-Week Change | Target KPI |
|---|---|---|---|---|
| Total Clicks | -- | -- | +--% | 500+ / mo |
| Total Impressions | -- | -- | +--% | 15,000+ / mo |
| Average CTR | --% | --% | +--% | > 2.5% |
| Average Position | -- | -- | +-- | < 15.0 |
| Total Valid Indexed Pages | 76 | 76 | 0 | 76 |
| Pages with Crawl Errors | 0 | 0 | 0 | 0 |

---

### 2. Top Performing Search Queries
| Search Query | Intent | Clicks | Impressions | CTR (%) | Avg Position | Target Landing Page |
|---|---|---|---|---|---|---|
| print portal | Commercial | [ ] | [ ] | [ ]% | [ ] | /print-portal |
| best print portal in india | Commercial Invest | [ ] | [ ] | [ ]% | [ ] | /print-portal |
| csc print portal | Commercial | [ ] | [ ] | [ ]% | [ ] | /best-print-portal-for-csc |
| vle print portal | Commercial | [ ] | [ ] | [ ]% | [ ] | /best-print-portal-for-csc |
| cyber cafe print software | Commercial Invest | [ ] | [ ] | [ ]% | [ ] | /print-portal-for-cyber-cafe |
| pvc card printing software | Commercial Invest | [ ] | [ ] | [ ]% | [ ] | /pvc-card-printing-software |
| cr80 card dimensions in mm | Informational | [ ] | [ ] | [ ]% | [ ] | /blog/cr80-card-dimensions-guide |
| epson l805 id card tray settings | Informational | [ ] | [ ] | [ ]% | [ ] | /blog/pvc-card-printer-tray-guide |
| missing father name in print portal | Troubleshooting | [ ] | [ ] | [ ]% | [ ] | /blog/how-to-fix-missing-card-fields |
| pan card print portal | Transactional | [ ] | [ ] | [ ]% | [ ] | /services/pan-card-printing |
| aadhar print portal | Transactional | [ ] | [ ] | [ ]% | [ ] | /services/aadhaar-document-management |
| voter id print portal | Transactional | [ ] | [ ] | [ ]% | [ ] | /services/voter-id-printing |

---

### 3. Landing Page Performance Breakdown
| Page URL | Page Category | Clicks | Impressions | CTR (%) | Avg Position | Index Status |
|---|---|---|---|---|---|---|
| /print-portal | Competitor Pillar | [ ] | [ ] | [ ]% | [ ] | Indexed |
| /best-print-portal-for-csc | Solution Pillar | [ ] | [ ] | [ ]% | [ ] | Indexed |
| /print-portal-for-cyber-cafe | Solution Pillar | [ ] | [ ] | [ ]% | [ ] | Indexed |
| /print-portal-for-retailers | Solution Pillar | [ ] | [ ] | [ ]% | [ ] | Indexed |
| /pvc-card-printing-software | Technical Pillar | [ ] | [ ] | [ ]% | [ ] | Indexed |
| /pricing | Core Commercial | [ ] | [ ] | [ ]% | [ ] | Indexed |
| /services/pan-card-printing | Service Gateway | [ ] | [ ] | [ ]% | [ ] | Indexed |
| /services/aadhaar-document-management | Service Gateway | [ ] | [ ] | [ ]% | [ ] | Indexed |
| /services/voter-id-printing | Service Gateway | [ ] | [ ] | [ ]% | [ ] | Indexed |
| /blog/cr80-card-dimensions-guide | Educational Blog | [ ] | [ ] | [ ]% | [ ] | Indexed |
| /blog/pvc-card-printer-tray-guide | Educational Blog | [ ] | [ ] | [ ]% | [ ] | Indexed |
| /blog/how-to-fix-missing-card-fields | Educational Blog | [ ] | [ ] | [ ]% | [ ] | Indexed |
```

---

## 3. PAGE INDEXING & EXCLUSION DIAGNOSTIC MATRIX

Google Search Console categorizes non-indexed URLs into specific status codes. Use this checklist during weekly reviews:

| GSC Exclusion Status | Expected Status on Accero | Root Cause | Immediate Action Required |
|---|---|---|---|
| **Discovered – currently not indexed** | 0 pages (Target) | Google discovered URL via sitemap but hasn't crawled yet due to crawl budget. | If pending > 14 days, request re-indexing via URL Inspection tool and verify internal link from `/print-portal`. |
| **Crawled – currently not indexed** | 0 pages (Target) | Google crawled the page but deemed content thin or low value. | Review content depth; ensure minimum 1,000 words of original text with structured data and unique value propositions. |
| **Excluded by ‘noindex’ tag** | Expected on private routes only (`/dashboard`, `/studio`, `/wallet`, `/cards`, `/(auth)`) | Intentional security & privacy protection. | Verify that NO public marketing or blog pages have accidentally inherited the `noindex` layout. |
| **Duplicate without user-selected canonical** | 0 pages (Target) | Multiple URL paths serving identical content without `<link rel="canonical">`. | Handled: All 76 routes declare their exact canonical path using `getCanonicalUrl()`. |
| **Page with redirect (301/308)** | Expected on deprecated doorway pages (`/services/[card]/[state]/[district]`) | Programmatic doorway cleanup from Phase 1. | Normal: Deprecated doorway routes safely return 308 permanent redirect to the parent service page. |

---

## 4. CANONICAL SELECTION AUDIT PROTOCOL

To ensure Google never selects a non-preferred canonical URL:
1. Export the **Page Indexing > Alternative page with proper canonical tag** report monthly.
2. Confirm that only intended aliases (e.g. `/services/aadhaar-document-processing` pointing to `/services/aadhaar-document-management`) appear in this list.
3. If Google selects an unexpected canonical for any pillar page, cross-check:
   - Internal linking anchor text.
   - Sitemap inclusion (sitemap must ONLY contain canonical URLs).
   - In-memory OpenGraph `og:url` parameter.

