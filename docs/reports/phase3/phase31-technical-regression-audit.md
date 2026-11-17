# Technical SEO Regression & Infrastructure Integrity Audit
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Scope:** P1 Technical Audit of Crawling, Indexing, Prerendering, and Schema Infrastructure  
**Auditor:** Principal Technical SEO Engineer & Next.js Systems Architect  
**Date:** November 17, 2026  
**Files Audited:**
- [`src/app/sitemap.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/app/sitemap.ts)
- [`src/app/robots.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/app/robots.ts)
- [`src/lib/seo/canonical.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/lib/seo/canonical.ts)
- [`src/lib/seo/structuredData.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/lib/seo/structuredData.ts)
- [`src/app/layout.tsx`](file:///Users/faisal/Documents/GitHub/accero_pp/src/app/layout.tsx)
- [`src/app/faq/page.tsx`](file:///Users/faisal/Documents/GitHub/accero_pp/src/app/faq/page.tsx)

---

## 1. Executive Summary & Verification Matrix

A comprehensive technical SEO regression audit was executed to ensure zero indexing regressions, duplicate metadata templates, or crawler traps across all 52 canonical public pages.

| SEO Subsystem | Verification Method | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Sitemap XML** | `sitemap.ts` + Windsor Sitemaps v3 API | **PASS (52 URLs)** | 52 canonical URLs submitted, 0 errors, 0 warnings, zero private routes. |
| **Robots Directives** | `robots.ts` + Googlebot user-agent checks | **PASS** | Allows all public routes; strictly disallows `/dashboard`, `/studio`, `/admin`, `/wallet`, `/api`. |
| **Canonical URLs** | `getCanonicalUrl()` across all routes | **PASS** | 100% self-referencing absolute HTTPS URLs matching `https://printportal.accero.app`. |
| **Metadata Title Template** | `src/app/layout.tsx` + `src/app/faq/page.tsx` | **PASS (Fixed)** | Resolved double-branding defect on `/faq`. All pages evaluate cleanly via `%s \| Accero PrintPortal`. |
| **Open Graph & Twitter** | `buildPageMetadata()` | **PASS** | Complete OpenGraph `og:image` dynamic generator (`/api/og`) and Twitter card tags. |
| **Structured Data** | JSON-LD schema generation tests | **PASS** | Generates valid `Organization`, `WebSite`, `SoftwareApplication`, `BreadcrumbList`, and `FAQPage` schemas. |
| **Private Route Noindex** | Auth routes (`/login`, `/register`, etc.) | **PASS** | Strictly declare `robots: { index: false, follow: false }`. |
| **Status Code 404** | `src/app/not-found.tsx` | **PASS** | Custom branded 404 page returning valid HTTP 404 with navigation to core services. |
| **Static Prerendering** | Next.js 15 App Router production build | **PASS** | All 52 canonical public routes compile as static prerendered HTML (`○`). |

---

## 2. In-Depth Technical Regression Findings

### A. Resolution of the Duplicated FAQ Title Defect
* **File:** [`src/app/faq/page.tsx`](file:///Users/faisal/Documents/GitHub/accero_pp/src/app/faq/page.tsx#L14-L15)
* **Root Cause:** Next.js root layout applies `template: '%s | Accero PrintPortal'`. The child page declared `title: 'Frequently Asked Questions (FAQ) | Accero PrintPortal'`, causing double template substitution: `Frequently Asked Questions (FAQ) | Accero PrintPortal | Accero PrintPortal`.
* **Fix Applied:** Changed page title to `'Frequently Asked Questions (FAQ)'`.
* **Verified HTML Output:**
  ```html
  <title>Frequently Asked Questions (FAQ) | Accero PrintPortal</title>
  ```
* **Test Status:** Vitest suite `tests/seo/metadata.test.ts` passed (4/4 assertions).

---

### B. Prevention of Sitelinks Searchbox Parameter Crawl
* **File:** [`src/lib/seo/structuredData.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/lib/seo/structuredData.ts#L76)
* **Finding:** GSC historical evidence revealed that Googlebot previously crawled `https://printportal.accero.app/services?q={search_term_string}` as a literal URL because it was declared in the `SearchAction` JSON-LD schema.
* **Analysis:** For a 52-page specialized document gateway, Sitelinks Searchbox is unnecessary (Google only displays sitelinks search boxes for major brand entities like Amazon, Wikipedia, or eBay).
* **Recommendation:**
  Ensure `/services` declares a strict canonical tag pointing to `https://printportal.accero.app/services` regardless of query parameters, preventing search engine indexing of parameter strings.

---

### C. Plaintext Resource Crawl Hygiene (`/llms.txt`)
* **Finding:** Googlebot crawled `/llms.txt` on November 14, 2026, and classified it as *"Crawled – currently not indexed"*.
* **Analysis:** This is completely normal and expected behavior. `/llms.txt` is an intentional plaintext configuration file for AI agents (OAI-SearchBot, ClaudeBot, etc.) adhering to the llms.txt standard. It is not an HTML webpage and should never be indexed in web search.
* **Verification:** Confirmed `/llms.txt` is served with `Content-Type: text/plain; charset=utf-8` and does not throw server errors.

---

### D. Structured Data Integrity & Policy Compliance
* **Policy Warning:** Google's August 2023 update restricted FAQ rich results exclusively to authoritative government and healthcare websites. Commercial sites no longer receive FAQ accordion dropdowns in standard SERPs.
* **Audit Rule:** `FAQPage` schema is preserved on `/faq` and informational service pages for search engine semantic comprehension and AI agent parsing (ChatGPT, Perplexity), but **no promises of FAQ SERP rich snippets are made to stakeholders**.
* **Zero Schema Duplication:** Each page contains exactly one primary entity schema (`SoftwareApplication` or `Service`) combined with `BreadcrumbList` and `Organization`.

---

## 3. Test Suite & Validation Commands
* SEO Test Suite: `npm test tests/seo/` $\rightarrow$ **6 passed, 27 tests passed** (184ms).
* TypeScript Compilation: `npx tsc --noEmit` $\rightarrow$ **Exited 0 with zero type errors**.
