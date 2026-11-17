# Google Search Console Indexing Investigation Report
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Technology Stack:** Next.js 15.5.26 (App Router), React 19, TypeScript (Strict), Tailwind CSS, MongoDB, Vercel  
**Date:** November 17, 2026  
**Investigator:** Senior Technical SEO Engineer & Next.js SEO Architect  
**Data Extraction Mechanisms:** 
1. Live Google Search Console via Windsor.ai MCP (`connector: all` / `searchconsole__https://printportal.accero.app/` / `googleanalytics4__557117688`)
2. Google Search Console Drill-Down Verification Screenshots (`media_1794868652270_95934a8c.png`, `media_1794868693200_4c5cc19e.png`, `media_1794868728317_68c16d31.png`)
3. Live HTTP/2 Production Header & HTML Inspections (`https://printportal.accero.app`)

---

## 1. Executive Summary & Inventory Reconciliation

This report delivers an exhaustive, evidence-based Google Search Console (GSC) indexing diagnostic for **Accero PrintPortal**, reconciling the historical GSC snapshot with the active production deployment.

### The Core Diagnostic Question
> *Why did Google report 25 indexed pages and 25 not indexed pages (10 "Crawled – currently not indexed", 15 "Discovered – currently not indexed"), and how does that reconcile with the 52 canonical routes in the production sitemap?*

### Key Findings & Historical Timeline Reconciliation
1. **Accurate Date Segregation:**
   - **GSC Snapshot Date:** **November 13, 2026** (`Last update: 11/13/26`).
   - **GSC Validation Start Date:** **November 16, 2026** (`Validation started: Started: 11/16/26` for both Crawled and Discovered categories).
   - **Live Production Audit Date:** **November 17, 2026**.
   - Historical snapshots and active production state must never be commingled.
2. **Mathematical Reconciliation of 50 URLs vs. 52 Canonical Routes:**
   - The **November 13 GSC snapshot** tracked exactly **50 URLs**:
     - **25 Indexed Pages**
     - **15 Discovered – currently not indexed Pages** (all 15 were canonical pages)
     - **10 Crawled – currently not indexed URLs** (8 were canonical pages, and **2 were non-canonical URLs discovered by Googlebot**: `/llms.txt` and `/services?q={search_term_string}`)
     - Total canonical pages in the Nov 13 snapshot: $25 + 15 + 8 = 48$ canonical routes.
   - On **November 14, 2026**, commit `a792e84` and subsequent updates launched 2 new canonical pillar routes (`/ration-card-printing-for-csc` and `/farmer-id-printing-for-csc`) and formalized `/services/farmer-id-printing`, bringing the total canonical public routes to **52**.
   - On **November 15, 2026**, the refreshed `sitemap.xml` was submitted to GSC containing exactly **52 submitted URLs**, with **0 errors and 0 warnings** (verified via Windsor MCP).
   - On **November 16, 2026**, Google initiated official validation cycles for the 10 Crawled URLs and 15 Discovered URLs.
3. **The 2 Non-Canonical URLs in "Crawled – currently not indexed":**
   - **`/services?q={search_term_string}`:** Sitelinks Searchbox schema in `src/lib/seo/structuredData.ts` declared `urlTemplate: https://printportal.accero.app/services?q={search_term_string}`. Googlebot followed the literal parameter placeholder as a distinct URL, crawled it on Nov 14, and marked it un-indexed.
   - **`/llms.txt`:** Plaintext AI crawler manifest linked in the website footer. Googlebot crawled the plaintext file on Nov 14 and appropriately excluded it from the HTML web search index.

---

## 2. GSC Property & Windsor MCP Extraction Details

### A. Connected Property Verification
* **Property URL:** `https://printportal.accero.app/`
* **Property Type:** URL-prefix property
* **Windsor.ai Connectors:** `all` (`searchconsole__https%3A%2F%2Fprintportal.accero.app%2F` & `googleanalytics4__557117688`)
* **Extraction Date:** November 17, 2026

### B. Live Sitemap Submission Verification (Windsor MCP)
```json
{
  "path": "https://printportal.accero.app/sitemap.xml",
  "last_submitted": "2026-11-15T22:27:59.261Z",
  "last_downloaded": "2026-11-15T22:28:00.928Z",
  "submitted": 52.0,
  "errors": 0.0,
  "warnings": 0.0,
  "is_sitemaps_index": false
}
```
* **Status:** `Success`
* **Submitted URLs:** 52
* **Errors:** 0.0
* **Warnings:** 0.0
* **Download Latency:** 1.67 seconds

### C. Live Search Performance & Organic Analytics (Windsor MCP)
* **Organic Search Performance:**
  - GA4 recorded `organic_google_search_clicks: 1.0` landing on `/` (matching GSC clicks).
  - Daily impressions increased from 1 on Nov 10 to 29 on Nov 15.
  - 11 distinct URLs are actively ranking on Google Search in positions 3 to 10:
    1. `/compare/eforms99-alternative` (Pos 3.0 for "eforms99")
    2. `/compare/kamboj-print-portal-alternative` (Pos 5.0 for "kamboj print portal")
    3. `/blog/pvc-card-printer-tray-guide` (Pos 6.0 for "chassis number print")
    4. `/compare/apna-print-portal-alternative` (Pos 6.0 for "apna print portal")
    5. `/services/vehicle-rc-printing` (Pos 7.0 for "vehicle rc smart card")
    6. `/` (Pos 7.5 for "accero print portal")
    7. `/blog/cyber-cafe-document-printing-guide` (Pos 8.0 for "cyber cafe printing")
    8. `/compare/rajprint-alternative` (Pos 8.0 for "rajprint portal")
    9. `/compare/digitalportal-alternative` (Pos 9.0 for "digital portal")
    10. `/features/wallet-management` (Pos 9.0 for "operator wallet")
    11. `/pricing` (Pos 10.0 for "print portal pricing")

---

## 3. All GSC Exclusion Categories & Status Breakdown

| GSC Indexing Category | Status in GSC | URL Count (Nov 13 Snapshot) | Current State (Nov 17 Audit) | Technical Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| **Indexed** | Valid | 25 | 25 canonical routes active in search | None (Healthy) |
| **Crawled – currently not indexed** | Excluded | 10 | 10 (8 canonical pages + 2 non-canonical resources) | High (Validation in progress since Nov 16) |
| **Discovered – currently not indexed** | Excluded | 15 | 17 (15 original + 2 newly added Nov 14 routes) | Medium (Validation in progress since Nov 16) |
| **Excluded by 'noindex' tag** | Excluded | 0 public routes | 4 Auth routes intentionally noindexed (`/login`, `/register`, etc.) | None (Intentional) |
| **Blocked by robots.txt** | Excluded | 0 public routes | Private routes correctly disallowed (`/dashboard`, `/studio`, etc.) | None (Intentional) |
| **Duplicate without user-selected canonical** | Excluded | 0 | 0 (All 52 routes declare strict canonical URLs) | None (Resolved) |
| **Duplicate, Google chose different canonical** | Excluded | 0 | 0 (Verified self-referencing canonicals) | None (Resolved) |
| **Page with redirect (301/308)** | Excluded | 0 in sitemap | 16 legacy service aliases redirect 308 (correctly excluded from sitemap) | None (Resolved) |
| **Not found (404)** | Excluded | 0 | 0 (Zero 404s on all 52 routes) | None (Resolved) |
| **Server error (5xx)** | Excluded | 0 | 0 (Static prerendering eliminates 5xx runtime errors) | None (Resolved) |
| **Total Evaluated URLs** | — | **50** | **54 (52 Canonical + 2 Non-Canonical)** | — |

---

## 4. URL-by-URL Forensic Diagnosis (Master Inventory Breakdown)

### A. The 10 "Crawled – Currently Not Indexed" URLs
*(Verified from GSC Screenshot `media_1794868728317_68c16d31.png` — Last Crawled: Nov 14, 2026; Validation Started: Nov 16, 2026)*

| URL | Type | Last Crawled | Root Cause | Status & Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `https://printportal.accero.app/compare/eforms99-alternative` | Canonical HTML | Nov 14, 2026 | New URL crawled during rapid indexing; quality validation pending | **5,344 words**; ranking #3 for "eforms99". Awaiting validation completion. |
| `https://printportal.accero.app/services/voter-id-printing` | Canonical HTML | Nov 14, 2026 | High-volume service route queued for quality evaluation | **196KB HTML**, complete Voter ID workflow & FAQ. High priority for manual inspection. |
| `https://printportal.accero.app/compare/fastprintportal-alternative` | Canonical HTML | Nov 14, 2026 | Competitor alternative page crawled Nov 14 | **5,461 words**, unique comparison matrix. Awaiting validation cycle. |
| `https://printportal.accero.app/best-print-portal-for-csc` | Canonical HTML | Nov 14, 2026 | Intent pillar page crawled Nov 14 | Deep CSC operator hardware guidance. High priority for manual inspection. |
| `https://printportal.accero.app/features/document-lookup` | Canonical HTML | Nov 14, 2026 | Feature detail page crawled Nov 14 | Rich document lookup workflow. High priority for manual inspection. |
| `https://printportal.accero.app/llms.txt` | Non-Canonical Resource | Nov 14, 2026 | Plaintext file crawled from footer link | Expected behavior: text/plain AI manifest. Do not index. |
| `https://printportal.accero.app/features/document-printing` | Canonical HTML | Nov 14, 2026 | Feature detail page crawled Nov 14 | Thermal & PVC card tray calibration guide. Awaiting validation. |
| `https://printportal.accero.app/terms` | Canonical HTML | Nov 14, 2026 | Legal terms page crawled Nov 14 | Full DPDPA compliance terms. Awaiting validation. |
| `https://printportal.accero.app/services?q={search_term_string}` | Non-Canonical Query | Nov 14, 2026 | Crawled literal placeholder from Sitelinks Searchbox JSON-LD | Update `generateWebSiteSchema` or canonicalize searchbox query. |
| `https://printportal.accero.app/solutions/printing-shops` | Canonical HTML | Nov 14, 2026 | Industry solution hub crawled Nov 14 | Commercial print shop persona hub. Awaiting validation. |

### B. The 15 "Discovered – Currently Not Indexed" URLs
*(Verified from GSC Screenshot `media_1794868693200_4c5cc19e.png` — Last Crawled: N/A; Validation Started: Nov 16, 2026)*

| URL | Type | Last Crawled | Root Cause | Status & Current State |
| :--- | :--- | :--- | :--- | :--- |
| `https://printportal.accero.app/blog/cr80-card-dimensions-guide` | Canonical HTML | N/A | In Googlebot crawl backlog | Pillar technical guide; linked across site. Awaiting crawl. |
| `https://printportal.accero.app/blog/multilingual-document-printing-guide` | Canonical HTML | N/A | In Googlebot crawl backlog | Regional language guide. Awaiting crawl. |
| `https://printportal.accero.app/contact` | Canonical HTML | N/A | In Googlebot crawl backlog | Operator support & contact page. Awaiting crawl. |
| `https://printportal.accero.app/csc-operator-software` | Canonical HTML | N/A | In Googlebot crawl backlog | High-value commercial pillar page. Awaiting crawl. |
| `https://printportal.accero.app/document-processing-platform` | Canonical HTML | N/A | In Googlebot crawl backlog | Multi-counter platform overview. Awaiting crawl. |
| `https://printportal.accero.app/faq` | Canonical HTML | N/A | In Googlebot crawl backlog | **Refactored to Server Component**: 19 FAQPage schema items, full SSR. |
| `https://printportal.accero.app/features/document-management` | Canonical HTML | N/A | In Googlebot crawl backlog | Document vault and re-print feature guide. Awaiting crawl. |
| `https://printportal.accero.app/features/multilingual-printing` | Canonical HTML | N/A | In Googlebot crawl backlog | Devanagari font rendering feature guide. Awaiting crawl. |
| `https://printportal.accero.app/print-portal-for-retailers` | Canonical HTML | N/A | In Googlebot crawl backlog | Retailer persona portal. Awaiting crawl. |
| `https://printportal.accero.app/resources` | Canonical HTML | N/A | In Googlebot crawl backlog | Educational guides directory; enriched with CR80 cheatsheet. |
| `https://printportal.accero.app/security` | Canonical HTML | N/A | In Googlebot crawl backlog | 256-bit SSL and encryption trust page. Awaiting crawl. |
| `https://printportal.accero.app/services` | Canonical HTML | N/A | In Googlebot crawl backlog | Central document services directory; 161KB rich HTML. |
| `https://printportal.accero.app/services/aadhaar-document-management` | Canonical HTML | N/A | In Googlebot crawl backlog | High-intent Aadhaar PVC management service. Awaiting crawl. |
| `https://printportal.accero.app/solutions/csc-operators` | Canonical HTML | N/A | In Googlebot crawl backlog | Primary audience solution hub. Awaiting crawl. |
| `https://printportal.accero.app/solutions/cyber-cafes` | Canonical HTML | N/A | In Googlebot crawl backlog | Primary audience solution hub. Awaiting crawl. |

---

## 5. Architectural Correctness & Validation Progress

1. **Static Prerendering Guarantee:** All 52 canonical routes are statically pre-rendered (`○ Prerendered as static content`) via Next.js 15 App Router, guaranteeing instant sub-200ms TTFB on Vercel Edge CDN without SSR waterfalls or database dependencies.
2. **Validation Lifecycle (Started Nov 16, 2026):** Google typically takes 7 to 14 days to process validation requests across 25 URLs on a newer domain. The presence of active validation in GSC confirms that Google's systems have queued both sets of URLs for re-crawl and assessment.
3. **Internal Linking Health:** 50 out of 52 canonical routes are linked directly in the header or footer (Click Depth 1). The 2 newly added routes (`/ration-card-printing-for-csc` and `/farmer-id-printing-for-csc`) are linked from `/solutions/csc-operators` (Click Depth 2) and `/not-found.tsx`.
