# SEO Indexing Technical Findings & Code-Level Defects
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Investigator:** Senior Technical SEO Engineer & Next.js SEO Architect  
**Date:** November 17, 2026  

---

## 1. Executive Summary

This document registers all verified code-level defects, architectural nuances, and crawler interaction behaviors discovered during the Google Search Console indexing investigation. Every finding is referenced with exact file paths, line numbers, mechanism of impact on Googlebot, and remediation status.

---

## 2. Comprehensive Inventory of Technical Defects & Code Findings

### Finding 1: Client Component Blocker Preventing SSR Metadata on `/faq`
* **File:** [`src/app/faq/page.tsx`](file:///Users/faisal/Documents/GitHub/accero_pp/src/app/faq/page.tsx)
* **Location:** Line 1 (`'use client';`)
* **Classification:** `HIGH — TECHNICAL_RENDERING`
* **Impact on Googlebot:**
  - Next.js 15 App Router strictly prohibits exporting `export const metadata: Metadata` or `export async function generateMetadata()` from a file marked with `'use client'`.
  - Prior to remediation, Googlebot received fallback root layout metadata instead of custom FAQ title, description, and canonical tags.
  - Crucially, no `FAQPage` JSON-LD schema was present in the initial SSR HTML.
* **Remediation Implemented:**
  - Extracted interactive client state (`useState`, search filter, accordion toggles) into [`src/components/public/FaqInteractiveClient.tsx`](file:///Users/faisal/Documents/GitHub/accero_pp/src/components/public/FaqInteractiveClient.tsx).
  - Converted `src/app/faq/page.tsx` into an async/static Server Component exporting complete `metadata` via `buildPageMetadata` and injecting `generateFaqSchema(allFaqs)` directly into the server HTML payload.
  - Live production curl verification confirms HTTP 200, `<title>Frequently Asked Questions (FAQ) | Accero PrintPortal</title>`, `<link rel="canonical" href="https://printportal.accero.app/faq" />`, and **5 JSON-LD schema blocks including FAQPage with 19 questions**.
* **Status:** `RESOLVED & PRODUCTION VERIFIED`.

---

### Finding 2: Root Canonical Trailing Slash vs. GSC Property Discrepancy
* **File:** [`src/lib/seo/canonical.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/lib/seo/canonical.ts)
* **Location:** Lines 36–38
* **Classification:** `MEDIUM — CANONICAL_CONSISTENCY`
* **Code Snippet:**
  ```typescript
  export function getCanonicalUrl(path: string = '/'): string {
    const baseUrl = getBaseUrl();
    const cleanPath = path.split('?')[0].split('#')[0].trim();

    if (!cleanPath || cleanPath === '/' || cleanPath === '') {
      return baseUrl; // Returns https://printportal.accero.app (no trailing slash)
    }
  ```
* **Impact on Googlebot:**
  - The connected Google Search Console property is registered as `https://printportal.accero.app/` (with a trailing slash).
  - Vercel's Edge routing normalizes the root to `https://printportal.accero.app`, which self-canonicalizes without trailing slash.
  - Google Search Console successfully indexed `https://printportal.accero.app/` without duplicate canonical conflict warnings.
* **Status:** `VERIFIED HARMLESS — ARCHITECTURALLY SOUND`.

---

### Finding 3: Sitelinks Searchbox URL Template Parameter Crawl
* **File:** [`src/lib/seo/structuredData.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/lib/seo/structuredData.ts)
* **Location:** Line 76
* **Classification:** `MEDIUM — CRAWL_BUDGET_HYGIENE`
* **Code Snippet:**
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
* **Impact on Googlebot:**
  - Googlebot followed the literal parameter placeholder `{search_term_string}` as a distinct crawl target: `https://printportal.accero.app/services?q={search_term_string}`.
  - On November 14, 2026, Googlebot crawled this parameter URL and marked it as *"Crawled – currently not indexed"* (item 9 in GSC Crawled list).
* **Remediation Recommendation:**
  - Ensure canonical tag on `/services` strictly resolves to `https://printportal.accero.app/services` regardless of query parameters.
  - Remove `potentialAction` from `WebSite` schema if Sitelinks Searchbox is not actively utilized.
* **Status:** `DIAGNOSED — NON-BLOCKING FOR CANONICAL INDEXATION`.

---

### Finding 4: Plaintext AI Agent Manifest Crawl (`/llms.txt`)
* **File:** [`src/components/public/PublicFooter.tsx`](file:///Users/faisal/Documents/GitHub/accero_pp/src/components/public/PublicFooter.tsx)
* **Location:** Line 360 (`href="/llms.txt"`)
* **Classification:** `LOW — EXPECTED_BEHAVIOR`
* **Impact on Googlebot:**
  - Googlebot discovered the link to `/llms.txt` in the public footer and crawled it on November 14, 2026.
  - Because `/llms.txt` is an intentional `text/plain` file adhering to the AI crawler specification (and not an HTML document), Google search algorithms classified it as *"Crawled – currently not indexed"*.
  - This is standard and expected behavior for non-HTML files linked in the DOM.
* **Status:** `INTENDED BEHAVIOR — NO ACTION REQUIRED`.

---

### Finding 5: Navigation Click Depth for CSC Intent Pages vs Service Pages
* **Files:** [`src/components/public/PublicFooter.tsx`](file:///Users/faisal/Documents/GitHub/accero_pp/src/components/public/PublicFooter.tsx), [`src/app/solutions/csc-operators/page.tsx`](file:///Users/faisal/Documents/GitHub/accero_pp/src/app/solutions/csc-operators/page.tsx)
* **Classification:** `MEDIUM — INTERNAL_LINK_EQUITY`
* **Impact on Googlebot:**
  - In `PublicFooter.tsx`, under "Document Services", the links point to:
    - `/services/ration-card-printing` (Click Depth 1)
    - `/services/farmer-id-printing` (Click Depth 1)
  - The dedicated pillar landing pages:
    - `/ration-card-printing-for-csc`
    - `/farmer-id-printing-for-csc`
    are linked from `/solutions/csc-operators` (Click Depth 2) and `/not-found.tsx`, but not from the footer.
* **Remediation Recommendation:**
  - Cross-link the service pages to the CSC pillar pages and vice-versa.
  - Add both CSC pillar links under "Specialized Portals" in `PublicFooter.tsx`.
* **Status:** `OPPORTUNITY IDENTIFIED FOR INTERNAL LINK ELEVATION`.
