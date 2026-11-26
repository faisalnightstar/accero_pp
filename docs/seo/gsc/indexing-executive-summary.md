# Google Search Console Indexing Investigation: Executive Summary
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Auditor:** Senior Technical SEO Engineer & Next.js SEO Architect  
**Investigation Date:** November 23, 2026, 08:45 UTC+05:30  
**Authority Reference:** Google Search Console API via Windsor MCP & Production HTTP/2 Crawler

---

## 1. High-Level Audit Findings

Google Search Console currently reports **37 pages as "Not Indexed"** for the property `https://printportal.accero.app/`.

This comprehensive investigation audited all 37 excluded URLs, alongside the 19 indexed pages, 4 authentication routes, 7 static/AI discovery manifests, and 4 redirected legacy aliases (**72 total URLs evaluated live**).

### Core Audit Metric Summary

| Metric | Verified Value | Assessment |
| :--- | :--- | :--- |
| **Total URLs Reported Not Indexed** | **37** | 100% investigated individually |
| **Total URLs Tested Live on Production** | **72** | 100% return expected HTTP status codes |
| **Sitemap Submitted URLs** | **56** | 100% parity with `CANONICAL_PUBLIC_ROUTES` |
| **Sitemap Processing Errors / Warnings** | **0.0 / 0.0** | Downloaded successfully Nov 23, 2026 |
| **URLs That Genuinely Deserve Indexing** | **35** | High-value commercial, service & blog pages |
| **URLs Intentionally Excluded** | **2** (+4 Auth) | Plaintext `/llms.txt`, searchbox query, auth routes |
| **URLs with Blocking Technical Errors** | **0** | Zero 5xx, zero 404s, zero broken canonicals |
| **URLs with Thin Content** | **0** | Average word count: 1,085 words across all pages |
| **URLs Requiring GSC Manual Re-Crawl** | **20** | High-intent commercial services & pillars |

---

## 2. Breakdown of the 37 Non-Indexed URLs

```
+-----------------------------------------------------------------------------------------+
| TOTAL NOT INDEXED PAGES: 37 URLS                                                        |
+-----------------------------------------------------------------------------------------+
| 1. Discovered – currently not indexed : 25 URLs (67.6%) -> Scheduled in Google's queue  |
| 2. Crawled – currently not indexed    : 10 URLs (27.0%) -> Validation cycle in progress |
| 3. Non-Canonical Resources Discovered  :  2 URLs ( 5.4%) -> Plaintext manifest & query   |
+-----------------------------------------------------------------------------------------+
```

### Key Diagnoses
1. **The 25 "Discovered" URLs are NOT technical errors.** Googlebot has added them to its crawl queue via `sitemap.xml` and internal links, but has deferred crawling due to standard crawl budget throttling on a newly verified domain (< 3 weeks old).
2. **The 10 "Crawled" URLs are in active validation.** Googlebot fetched the HTML between Nov 10 and Nov 14, and an official GSC validation cycle was initiated on **November 16, 2026** (`Validation started: Started: 11/16/26`). Several of these pages (e.g. `/compare/eforms99-alternative` at #2.75) are **already ranking in Google Search**, proving high algorithmic quality.
3. **The 2 Non-Canonical URLs are intended edge cases:**
   - `/llms.txt`: Plaintext AI crawler specification linked in the footer. Appropriately excluded from web search.
   - `/services?q={search_term_string}`: Parameter placeholder from Sitelinks Searchbox JSON-LD schema. Correctly canonicalized to `/services`.

---

## 3. Most Critical Root Causes

1. **New Domain Crawl Budget Throttle:** Google allocates conservative crawl frequency to domains verified under 30 days ago.
2. **GSC Dashboard Reporting Lag vs. Active SERPs:** Search Console validation cycles take 7–14 days. GSC reporting runs 48–72 hours behind live indexation.
3. **Absence of Sitelinks Searchbox Route:** Sitelinks Searchbox JSON-LD encouraged Googlebot to crawl literal parameter strings.

---

## 4. Recommended Immediate Actions

1. **Execute Wave 1 Manual GSC URL Inspections (10 URLs Today):**
   Prioritize direct conversion drivers through Google Search Console's "Request Indexing" tool:
   - `/csc-print-portal`
   - `/cyber-cafe-printing-software`
   - `/services/voter-id-printing`
   - `/services/aadhaar-document-management`
   - `/services`
   - `/best-print-portal-for-csc`
   - `/csc-operator-software`
   - `/solutions/csc-operators`
   - `/blog/what-is-a-digital-print-portal`
   - `/services/farmer-id-printing`
2. **Execute Wave 2 (Day 2 — 10 URLs):**
   Commercial pillars, tools, and competitor comparisons (`/ration-card-printing-for-csc`, `/farmer-id-printing-for-csc`, `/tools/cr80-card-size-calculator`, `/faq`, `/compare/skprintportal-alternative`, etc.).
3. **Clean Up Searchbox Schema:**
   Remove literal searchbox `potentialAction` from `src/lib/seo/structuredData.ts` to prevent Googlebot from wasting crawl cycles on query parameters.
4. **Monitor GSC Validation:**
   Allow the active validation cycle (started Nov 16) to reach completion without altering canonical URLs or sitemap configurations.
