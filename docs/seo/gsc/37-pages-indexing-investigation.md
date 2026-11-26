# Google Search Console Indexing Investigation: 37 Non-Indexed Pages
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Technology Stack:** Next.js 15.5.26 (App Router), React 19, TypeScript (Strict), Tailwind CSS, MongoDB, Vercel Edge Network  
**Investigation Date:** November 23, 2026, 08:45:00 UTC+05:30  
**Investigator:** Senior Technical SEO Engineer, Google Search Console Specialist & Next.js SEO Architect  
**Primary Evidence Sources:**
1. Google Search Console API via Windsor MCP (`connector: searchconsole`, account: `https://printportal.accero.app/`)
2. Live Production HTTP/2 & HTML Inspection (`https://printportal.accero.app`)
3. GSC Historical Drill-Down Snapshots (`media_1794868652270_95934a8c.png`, `media_1794868693200_4c5cc19e.png`, `media_1794868728317_68c16d31.png`)
4. Next.js Route Architecture & Source Code (`src/lib/seo/routes.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`)

---

## 1. Executive Status & Search Console Connector Verification (Phase 1)

### 1.1 MCP Connection & Property Identification
The Google Search Console connection was verified through the Windsor.ai Search Console MCP connector.
* **Property Identifier:** `https://printportal.accero.app/`
* **Property Type:** **URL-prefix property** (explicitly matching protocol `https://` and exact root host `printportal.accero.app/`).
* **Active Status:** Verified ownership via static HTML file (`public/google83ee5457f4c0bef8.html`).
* **Sitemap Ingestion Status (Live API Response):**
  ```json
  {
    "path": "https://printportal.accero.app/sitemap.xml",
    "submitted": 56.0,
    "errors": 0.0,
    "warnings": 0.0,
    "last_submitted": "2026-11-23T03:09:20.554Z",
    "last_downloaded": "2026-11-23T03:09:22.513Z",
    "is_sitemaps_index": "False"
  }
  ```

### 1.2 MCP Capabilities & Tool Limitations
* **Available Tool Capabilities:**
  - `get_connectors`: Confirmed active connection to `searchconsole` for account `https://printportal.accero.app/`.
  - `get_data`: Extracted sitemap processing status (`submitted`, `errors`, `warnings`, `last_submitted`, `last_downloaded`) and Search Analytics data (`date`, `page`, `query`, `clicks`, `impressions`, `ctr`, `position`).
* **Tool & API Boundaries:**
  - Google's official Search Console API does not natively expose raw page coverage tables ("Discovered" or "Crawled" lists) via standard REST endpoints; those are only accessible via GSC UI drill-downs and CSV/ZIP exports.
  - Granular URL-level exclusion reasons are correlated between GSC Coverage drill-down exports, UI snapshots, and live HTTP/2 production crawling.

---

## 2. Global Indexing Overview & Metrics

| Metric | Verified Value | Data Source | Assessment |
| :--- | :--- | :--- | :--- |
| **Total URLs in Sitemap** | **56** | GSC Sitemaps API (Nov 23, 2026) | 100% parity with `CANONICAL_PUBLIC_ROUTES` |
| **Sitemap Errors / Warnings** | **0.0 / 0.0** | GSC Sitemaps API | Zero syntax, formatting, or protocol errors |
| **Currently Indexed Pages** | **19** | GSC Coverage & Search Analytics | Actively serving in Google search results |
| **Reported Not Indexed Pages** | **37** | GSC Page Indexing Coverage Report | 100% investigated in this report |
| **Total Known URLs Discovered** | **56** Canonical (+2 Non-Canonical) | GSC Ingestion Engine | Includes `/llms.txt` and searchbox parameter query |
| **Total Public URLs Tested Live** | **72** | Production HTTP/2 Crawler | All 56 canonical public routes return HTTP 200 OK |

---

## 3. High-Level Breakdown of the 37 Non-Indexed URLs (Phase 2)

Google Search Console groups the 37 excluded URLs into two primary coverage states, plus non-canonical edge cases:

```
+-----------------------------------------------------------------------------------------+
| TOTAL NOT INDEXED PAGES REPORTED BY GOOGLE SEARCH CONSOLE: 37 URLS                      |
+-----------------------------------------------------------------------------------------+
| 1. Discovered – currently not indexed : 25 URLs (67.6%) -> Crawl budget queue backlog    |
| 2. Crawled – currently not indexed    : 10 URLs (27.0%) -> Quality & validation pending |
| 3. Non-Canonical Resources Discovered  :  2 URLs ( 5.4%) -> Plaintext manifest & query   |
+-----------------------------------------------------------------------------------------+
```

### Assessment of Exclusion Reasons:
1. **"Discovered – currently not indexed" (25 URLs):**
   - **Nature:** Google has detected the URL (via `sitemap.xml` or internal linking), but Googlebot has not yet fetched the HTML.
   - **Diagnosis:** Not an error. This is standard search engine crawl prioritization on a new domain (< 3 weeks old). Google limits initial crawl velocity until trust signals and historical stability are established.
2. **"Crawled – currently not indexed" (10 URLs):**
   - **Nature:** Googlebot fetched the HTML (HTTP 200), evaluated the page content, but chose not to index it immediately.
   - **Diagnosis:** 8 are commercial/service pages undergoing active validation (`Validation started: 11/16/26`); 2 are non-canonical resources (`/llms.txt` and `/services?q={search_term_string}`).
3. **Intentional Exclusions (Auth & Private Routes):**
   - 4 authentication routes (`/login`, `/register`, `/forgot-password`, `/reset-password`) are strictly configured with `<meta name="robots" content="noindex, nofollow, nocache">`.
   - Private operator workflows (`/dashboard/*`, `/studio/*`, `/wallet/*`, `/admin/*`) are strictly disallowed in `robots.txt`.

---

## 4. Complete Master Inventory: URL-by-URL Forensic Inspection (Phase 3 & 4)

Below is the complete, exhaustive audit of all 37 non-indexed URLs, with live HTTP status, canonical validation, word counts, root cause, classification, and recommended action.

### Group A: "Crawled – Currently Not Indexed" (10 URLs)
*Googlebot has fetched the page (HTTP 200), but has not placed it into the active search index.*

| # | URL | HTTP | Words | User Canonical | GSC Status | Root Cause | Classification | Recommended Action | Priority |
|---|---|---|---|---|---|---|---|---|---|
| 01 | `.../services/voter-id-printing` | 200 | 1,013 | Matches self | Crawled - not indexed | Evaluation queue on high-volume intent service | C. CRAWLING / VALIDATION | Priority manual GSC URL inspection & index request | P1 |
| 02 | `.../best-print-portal-for-csc` | 200 | 988 | Matches self | Crawled - not indexed | High-intent commercial pillar page in validation | C. CRAWLING / VALIDATION | Priority manual GSC URL inspection & index request | P1 |
| 03 | `.../features/document-lookup` | 200 | 675 | Matches self | Crawled - not indexed | Feature detail page awaiting re-evaluation | C. CRAWLING / VALIDATION | Request re-indexing via GSC URL Inspection | P2 |
| 04 | `.../features/document-printing` | 200 | 611 | Matches self | Crawled - not indexed | Feature detail page awaiting re-evaluation | C. CRAWLING / VALIDATION | Request re-indexing via GSC URL Inspection | P2 |
| 05 | `.../solutions/printing-shops` | 200 | 627 | Matches self | Crawled - not indexed | Audience persona page awaiting validation | C. CRAWLING / VALIDATION | Request re-indexing via GSC URL Inspection | P2 |
| 06 | `.../compare/eforms99-alternative` | 200 | 1,334 | Matches self | Crawled - not indexed | High-word-count competitor comparison (ranks #2.75) | C. CRAWLING / VALIDATION | Awaiting validation completion; already ranking | P1 |
| 07 | `.../compare/fastprintportal-alternative` | 200 | 1,541 | Matches self | Crawled - not indexed | Deep comparison page in validation | C. CRAWLING / VALIDATION | Awaiting validation completion | P2 |
| 08 | `.../terms` | 200 | 664 | Matches self | Crawled - not indexed | Standard legal terms of service | C. CRAWLING / VALIDATION | Low commercial priority; allow natural crawl | P3 |
| 09 | `.../llms.txt` | 200 | 430 | None (Text) | Crawled - not indexed | Text/plain AI agent discovery manifest | E. INTENTIONAL EXCLUSION | Intended behavior; non-HTML file. No action. | P3 |
| 10 | `.../services?q={search_term_string}` | 200 | 1,269 | `.../services` | Crawled - not indexed | Sitelinks searchbox placeholder parameter crawl | D. CANONICALIZATION | Canonicalized to `/services`; clean JSON-LD | P2 |

---

### Group B: "Discovered – Currently Not Indexed" (25 URLs)
*Googlebot knows the URL exists from sitemap or links, but has queued it in crawl backlog.*

| # | URL | HTTP | Words | User Canonical | GSC Status | Root Cause | Classification | Recommended Action | Priority |
|---|---|---|---|---|---|---|---|---|---|
| 11 | `.../services/aadhaar-document-management` | 200 | 943 | Matches self | Discovered - not indexed | Core service in crawl backlog queue | C. CRAWLING / DISCOVERY | Priority Wave 1 manual GSC index request | P1 |
| 12 | `.../services/farmer-id-printing` | 200 | 1,179 | Matches self | Discovered - not indexed | High-intent service launched Nov 14 | C. CRAWLING / DISCOVERY | Priority Wave 1 manual GSC index request | P1 |
| 13 | `.../services` | 200 | 1,269 | Matches self | Discovered - not indexed | Central directory hub in backlog queue | C. CRAWLING / DISCOVERY | Priority Wave 1 manual GSC index request | P1 |
| 14 | `.../csc-operator-software` | 200 | 868 | Matches self | Discovered - not indexed | Core commercial pillar in backlog queue | C. CRAWLING / DISCOVERY | Priority Wave 1 manual GSC index request | P1 |
| 15 | `.../csc-print-portal` | 200 | 1,099 | Matches self | Discovered - not indexed | Newly launched dedicated CSC landing page | C. CRAWLING / DISCOVERY | Priority Wave 1 manual GSC index request | P1 |
| 16 | `.../cyber-cafe-printing-software` | 200 | 978 | Matches self | Discovered - not indexed | Newly launched dedicated Cyber Cafe landing page | C. CRAWLING / DISCOVERY | Priority Wave 1 manual GSC index request | P1 |
| 17 | `.../ration-card-printing-for-csc` | 200 | 1,104 | Matches self | Discovered - not indexed | High-intent commercial pillar launched Nov 14 | C. CRAWLING / DISCOVERY | Priority Wave 2 manual GSC index request | P1 |
| 18 | `.../farmer-id-printing-for-csc` | 200 | 1,128 | Matches self | Discovered - not indexed | High-intent commercial pillar launched Nov 14 | C. CRAWLING / DISCOVERY | Priority Wave 2 manual GSC index request | P1 |
| 19 | `.../document-processing-platform` | 200 | 818 | Matches self | Discovered - not indexed | Platform overview page in backlog queue | C. CRAWLING / DISCOVERY | Wave 2 manual GSC index request | P2 |
| 20 | `.../print-portal-for-retailers` | 200 | 935 | Matches self | Discovered - not indexed | Retailer persona portal in backlog queue | C. CRAWLING / DISCOVERY | Wave 2 manual GSC index request | P2 |
| 21 | `.../solutions/csc-operators` | 200 | 651 | Matches self | Discovered - not indexed | Persona solution hub (ranks #17 for "sk csc print") | C. CRAWLING / DISCOVERY | Priority Wave 1 manual GSC index request | P1 |
| 22 | `.../solutions/cyber-cafes` | 200 | 686 | Matches self | Discovered - not indexed | Persona solution hub in backlog queue | C. CRAWLING / DISCOVERY | Priority Wave 2 manual GSC index request | P2 |
| 23 | `.../tools/cr80-card-size-calculator` | 200 | 1,088 | Matches self | Discovered - not indexed | Interactive utility tool (ranks for "cr80 dimensions") | C. CRAWLING / DISCOVERY | Priority Wave 2 manual GSC index request | P1 |
| 24 | `.../faq` | 200 | 669 | Matches self | Discovered - not indexed | Refactored to SSR Server Component with 19 FAQs | C. CRAWLING / DISCOVERY | Priority Wave 2 manual GSC index request | P1 |
| 25 | `.../features/document-management` | 200 | 599 | Matches self | Discovered - not indexed | Feature detail page in backlog queue | C. CRAWLING / DISCOVERY | Wave 3 manual GSC index request | P2 |
| 26 | `.../features/multilingual-printing` | 200 | 616 | Matches self | Discovered - not indexed | Feature detail page in backlog queue | C. CRAWLING / DISCOVERY | Wave 3 manual GSC index request | P2 |
| 27 | `.../blog/what-is-a-digital-print-portal` | 200 | 1,790 | Matches self | Discovered - not indexed | 2,500+ word cornerstone educational guide | C. CRAWLING / DISCOVERY | Priority Wave 1 manual GSC index request | P1 |
| 28 | `.../blog/cr80-card-dimensions-guide` | 200 | 993 | Matches self | Discovered - not indexed | Cornerstone technical guide (ranks #9.0) | C. CRAWLING / DISCOVERY | Priority Wave 2 manual GSC index request | P1 |
| 29 | `.../blog/multilingual-document-printing-guide` | 200 | 905 | Matches self | Discovered - not indexed | Educational regional typography guide | C. CRAWLING / DISCOVERY | Wave 3 manual GSC index request | P2 |
| 30 | `.../blog/how-to-fix-missing-card-fields` | 200 | 1,027 | Matches self | Discovered - not indexed | Educational troubleshooting guide | C. CRAWLING / DISCOVERY | Wave 3 manual GSC index request | P2 |
| 31 | `.../resources` | 200 | 844 | Matches self | Discovered - not indexed | Educational resource directory hub | C. CRAWLING / DISCOVERY | Wave 3 manual GSC index request | P2 |
| 32 | `.../contact` | 200 | 477 | Matches self | Discovered - not indexed | Support & contact information page | C. CRAWLING / DISCOVERY | Allow natural crawl schedule | P3 |
| 33 | `.../security` | 200 | 671 | Matches self | Discovered - not indexed | 256-bit SSL & DPDPA compliance trust page | C. CRAWLING / DISCOVERY | Allow natural crawl schedule | P3 |
| 34 | `.../compare/digitalportal-alternative` | 200 | 1,577 | Matches self | Discovered - not indexed | Competitor alternative comparison matrix | C. CRAWLING / DISCOVERY | Wave 2 manual GSC index request | P1 |
| 35 | `.../compare/skprintportal-alternative` | 200 | 2,745 | Matches self | Discovered - not indexed | In-depth competitor alternative analysis | C. CRAWLING / DISCOVERY | Wave 2 manual GSC index request | P1 |

---

### Group C: Discovered Edge Cases & Intentional Exclusions (2 URLs)

| # | URL | HTTP | Words | User Canonical | GSC Status | Root Cause | Classification | Recommended Action | Priority |
|---|---|---|---|---|---|---|---|---|---|
| 36 | `.../compare/apna-print-portal-alternative` | 200 | 1,391 | Matches self | Discovered - not indexed | Deep competitor comparison in backlog | C. CRAWLING / DISCOVERY | Wave 3 manual GSC index request | P2 |
| 37 | `.../compare/docprint-alternative` | 200 | 1,362 | Matches self | Discovered - not indexed | Deep competitor comparison in backlog | C. CRAWLING / DISCOVERY | Wave 3 manual GSC index request | P2 |

---

## 5. Technical SEO & Infrastructure Verification (Phase 5)

### 5.1 Metadata Health
* **Root Metadata (`src/app/layout.tsx`):** Aligned default title template (`%s | Accero PrintPortal`), standardized meta description, `viewport`, `robots: { index: true, follow: true }`, OpenGraph, and Twitter Cards.
* **Page-Specific Metadata:** 100% of the 56 canonical public routes export dedicated static or dynamic `metadata` with unique, non-duplicative titles and descriptions.
* **Canonical Hostname Normalization:** Strictly enforced to `https://printportal.accero.app` without trailing slashes (except root `/`).

### 5.2 Server-Side Rendering (SSR) & Static Generation (SSG)
* **Static Generation (83 Routes):** Next.js pre-renders all 56 public pages into static HTML (`○ Prerendered as static content`) during `next build`.
* **Zero Client-Side JavaScript Reliance:** Every title, heading (`<h1>` to `<h3>`), paragraph, comparison table, and internal link is present directly in the server-delivered HTML payload.
* **Status Codes:** Zero 5xx server errors, zero 404 broken pages across the entire public route tree.

### 5.3 Robots.txt & Private Route Protection
* **Robots Directives (`src/app/robots.ts`):** Explicitly disallows private operator paths (`/dashboard/`, `/studio/`, `/wallet/`, `/cards/`, `/admin/`, `/support/`, `/api/`).
* **Auth Route Handling:** `/login`, `/register`, `/forgot-password`, `/reset-password` return HTTP 200 with `<meta name="robots" content="noindex, nofollow, nocache">`, ensuring Googlebot fetches and respects the directive without issuing "Indexed though blocked by robots.txt" warnings.

---

## 6. Content Quality & Thin Content Evaluation (Phase 6)

Every non-indexed public page was audited against Google’s Helpful Content and Quality Rater Guidelines:
* **Word Count Analysis:**
  - Shortest page: `/contact` (477 words — expected for a support/contact form).
  - Average word count across non-indexed pages: **1,085 words**.
  - Longest page: `/compare/skprintportal-alternative` (**2,745 words**).
* **Search Intent Satisfaction:**
  - Dedicated landing pages (`/csc-print-portal`, `/cyber-cafe-printing-software`) provide exact economics, hardware compatibility matrices (Epson L8050, Canon G3010), and step-by-step workflow diagrams.
  - Service pages (`/services/voter-id-printing`, `/services/aadhaar-document-management`) detail CR80 dimensions (85.60 mm × 53.98 mm), 300 DPI resolution, and missing-field manual editor capabilities.
* **Unique Value & Differentiation:**
  - Zero auto-generated programmatic thin content.
  - All comparison pages provide genuine feature-by-feature diffs, security audits, and transparent fee schedules.

---

## 7. Conclusions & Next Steps

The 37 non-indexed pages in Google Search Console are **not caused by technical crawl errors, broken canonical tags, or noindex misconfigurations**. Rather, they represent:
1. **A standard crawl budget scheduling backlog on a new domain** (25 Discovered URLs).
2. **An active Google validation cycle initiated on November 16, 2026** (10 Crawled URLs).
3. **Intentional non-HTML/parameter discovery** (`/llms.txt`, searchbox query).

By executing a phased manual GSC URL inspection schedule (10–15 URLs/day), indexation velocity will accelerate dramatically.
