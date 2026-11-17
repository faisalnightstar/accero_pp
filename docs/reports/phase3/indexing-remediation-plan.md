# SEO Indexing Remediation Plan: Implementation & Validation Guide
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Scope:** 52 Canonical Public URLs + 2 Non-Canonical Crawled Resources  
**Auditor:** Senior Technical SEO Engineer & Next.js SEO Architect  
**Date:** November 17, 2026  

---

## 1. Overview & Prioritization Matrix

This remediation and validation plan organizes all necessary technical and operational actions into prioritized tiers to transition un-indexed URLs into the Google Search index:

* **Tier 1 (Immediate Manual URL Inspection in GSC):** High-priority manual inspection and re-indexing requests for the top 5 commercial canonical URLs currently in "Crawled – currently not indexed".
* **Tier 2 (Non-Canonical Crawl Hygiene):** Address `/services?q={search_term_string}` to prevent searchbot query crawl waste.
* **Tier 3 (Internal Linking & Click Depth Optimization):** Elevate `/ration-card-printing-for-csc` and `/farmer-id-printing-for-csc` internal link visibility.
* **Tier 4 (Validation Monitoring):** Track the ongoing GSC validation cycle started on November 16, 2026.

---

## 2. Tier 1 — Prioritized Manual URL Inspection Checklist

Google allows up to 10–12 manual URL inspection re-indexing requests per property per day. Use the Google Search Console **URL Inspection Tool** to manually inspect and request indexing for these high-priority URLs in the following exact order:

### Priority 1: High-Volume Commercial Service Routes
1. **`https://printportal.accero.app/services/voter-id-printing`**
   - **Current Status:** Crawled – currently not indexed (Last crawled: Nov 14, 2026).
   - **Why Prioritize:** Massive search volume across India for Voter ID (EPIC) card printing.
   - **Steps:**
     1. Paste URL into GSC top search bar: `https://printportal.accero.app/services/voter-id-printing`.
     2. Click **Test Live URL**. Verify HTTP 200, canonical URL matched, and structured data detected (`SoftwareApplication`, `Service`, `BreadcrumbList`, `FAQPage`, `HowTo`).
     3. Click **Request Indexing**.

2. **`https://printportal.accero.app/best-print-portal-for-csc`**
   - **Current Status:** Crawled – currently not indexed (Last crawled: Nov 14, 2026).
   - **Why Prioritize:** Highest-converting commercial intent keyword for CSC VLEs.
   - **Steps:**
     1. Inspect URL in GSC: `https://printportal.accero.app/best-print-portal-for-csc`.
     2. Click **Test Live URL**. Verify `<title>`, meta description, and 3 schema blocks.
     3. Click **Request Indexing**.

### Priority 2: Core Platform Feature Workflows
3. **`https://printportal.accero.app/features/document-lookup`**
   - **Current Status:** Crawled – currently not indexed (Last crawled: Nov 14, 2026).
   - **Why Prioritize:** Key differentiator demonstrating automated card number lookup and real-time field validation.
   - **Steps:**
     1. Inspect URL in GSC: `https://printportal.accero.app/features/document-lookup`.
     2. Test Live URL & click **Request Indexing**.

4. **`https://printportal.accero.app/features/document-printing`**
   - **Current Status:** Crawled – currently not indexed (Last crawled: Nov 14, 2026).
   - **Why Prioritize:** Crucial for operator queries regarding CR80 card tray calibration (Epson L805, Canon G series).
   - **Steps:**
     1. Inspect URL in GSC: `https://printportal.accero.app/features/document-printing`.
     2. Test Live URL & click **Request Indexing**.

### Priority 3: Commercial Competitor & Solution Pages
5. **`https://printportal.accero.app/compare/fastprintportal-alternative`**
   - **Current Status:** Crawled – currently not indexed (Last crawled: Nov 14, 2026).
   - **Why Prioritize:** High search volume for Fast Print Portal alternatives; already ranking sister page `eforms99-alternative` at #3.
   - **Steps:**
     1. Inspect URL in GSC: `https://printportal.accero.app/compare/fastprintportal-alternative`.
     2. Test Live URL & click **Request Indexing**.

6. **`https://printportal.accero.app/solutions/printing-shops`**
   - **Current Status:** Crawled – currently not indexed (Last crawled: Nov 14, 2026).
   - **Why Prioritize:** Commercial print shop persona hub targeting bulk PVC badge and card printing businesses.
   - **Steps:**
     1. Inspect URL in GSC: `https://printportal.accero.app/solutions/printing-shops`.
     2. Test Live URL & click **Request Indexing**.

7. **`https://printportal.accero.app/compare/eforms99-alternative`**
   - **Current Status:** Crawled – currently not indexed (Last crawled: Nov 14, 2026).
   - **Why Prioritize:** Actively generating impressions and ranking at position #3 for "eforms99". Requesting indexation will solidify SERP presence.
   - **Steps:**
     1. Inspect URL in GSC: `https://printportal.accero.app/compare/eforms99-alternative`.
     2. Test Live URL & click **Request Indexing**.

---

## 3. Tier 2 — Non-Canonical Crawl Hygiene & Prevention

### 1. Sitelinks Searchbox URL Template: `/services?q={search_term_string}`
* **Issue:** Googlebot crawled the literal placeholder string `{search_term_string}` declared in `WebSite` JSON-LD schema (`src/lib/seo/structuredData.ts`).
* **Root Cause:**
  ```typescript
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${baseUrl}/services?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  }
  ```
* **Recommended Fix:**
  - In `src/app/services/page.tsx`, ensure that any query parameters (such as `?q=...`) self-canonicalize to `https://printportal.accero.app/services`.
  - Alternatively, if Sitelinks Searchbox is not critical for a 52-page domain, omit `potentialAction` from `generateWebSiteSchema` until the domain exceeds 500+ indexed pages.

### 2. AI Agent Manifest: `/llms.txt`
* **Issue:** Crawled on Nov 14, 2026, and listed as "Crawled – currently not indexed".
* **Analysis:** This is completely expected behavior. `/llms.txt` is an intentional plaintext document formatted according to the `/llms.txt` specification for AI agents and LLMs. Google web search algorithms naturally do not index raw plaintext configuration files as standard web pages. No SEO action is required.

---

## 4. Tier 3 — Internal Linking & Navigation Optimization

### 1. Elevating New CSC Intent Pages
* **Current Link Structure:**
  - `/services/ration-card-printing` and `/services/farmer-id-printing` are linked directly in `PublicFooter.tsx` (Click Depth 1).
  - `/ration-card-printing-for-csc` and `/farmer-id-printing-for-csc` are linked from `/solutions/csc-operators` (Click Depth 2) and `/not-found.tsx`.
* **Recommended Optimization:**
  - Add cross-links between the service detail pages and the specialized CSC pages:
    - On `/services/ration-card-printing`, link to `/ration-card-printing-for-csc` ("Are you a CSC VLE? View dedicated CSC Ration Card workflow →").
    - On `/services/farmer-id-printing`, link to `/farmer-id-printing-for-csc` ("Are you an AgriStack operator? View CSC Farmer Registry portal →").
  - Under `PublicFooter.tsx` > "Specialized Portals", include dedicated anchor links to both CSC pages to elevate them to Click Depth 1.

---

## 5. Tier 4 — Monitoring the Active Validation Cycle

* **Validation Start Date:** November 16, 2026 (`Validation started: Started: 11/16/26` in GSC).
* **Target Categories:**
  1. Crawled – currently not indexed (10 URLs)
  2. Discovered – currently not indexed (15 URLs)
* **Estimated Validation Duration:** Google typically takes 7 to 14 days to re-crawl and re-evaluate pages under active validation.
* **Monitoring Schedule:**
  - **Day 3 (Nov 19, 2026):** Check GSC "Validation Details" to observe initial re-crawl timestamps.
  - **Day 7 (Nov 23, 2026):** Query Windsor MCP for changes in total indexed pages and new impressions.
  - **Day 14 (Nov 30, 2026):** Final audit of validation outcome. Any remaining un-indexed pages should be individually inspected.
