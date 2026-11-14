# Accero PrintPortal — Technical SEO Implementation Specification

**Document:** Technical SEO Architecture & Next.js Implementation  
**Domain:** `https://printportal.accero.app`  
**Framework:** Next.js 15.5.26 (App Router), React 19, TypeScript  

---

## 1. Technical Architecture Overview

Accero PrintPortal employs an enterprise-grade technical SEO architecture built natively on Next.js 15 App Router principles. All public-facing content is rendered using **React Server Components (RSC)** with static site generation (`generateStaticParams`) where dynamic parameters exist, ensuring:
* Sub-100ms time-to-first-byte (TTFB) on Vercel’s global Edge network.
* Zero client-side JavaScript execution required for search crawlers to index full text and structured data.
* Elimination of rendering waterfalls and layout shifts.

---

## 2. Centralized Metadata & Canonical Engine

### 2.1 Single Source of Truth (`src/lib/seo/metadata.ts`)
All metadata across the application is constructed via two centralized factory functions:
1. **`buildPageMetadata(options: PageMetadataOptions): Metadata`**:
   * Generates strictly formatted `<title>` tags with brand suffixes.
   * Injects `<meta name="description">` optimized between 140–160 characters.
   * Sets `<link rel="canonical">` pointing strictly to `https://printportal.accero.app`.
   * Enforces OpenGraph (`og:title`, `og:description`, `og:url`, `og:siteName`, `og:image`).
   * Injects dynamic OpenGraph social preview images via Edge route `/api/og?title=...`.
   * Configures Twitter Summary Cards (`summary_large_image`, creator `@acceroapp`).
   * Enforces Googlebot directives: `max-video-preview: -1`, `max-image-preview: 'large'`, `max-snippet: -1`.
2. **`buildPrivateMetadata(title: string): Metadata`**:
   * Enforces `robots: { index: false, follow: false, nocache: true }`.
   * Applied across `/dashboard`, `/studio`, `/wallet`, `/cards`, and `/admin`.

### 2.2 Canonical URL Normalization (`src/lib/seo/canonical.ts`)
* **Protocol & Domain Enforcement:** All canonical URLs resolve to `https://printportal.accero.app`.
* **Zero Trailing Slashes:** Paths are normalized to strip trailing slashes (e.g. `/about/` &rarr; `/about`) to prevent duplicate URL indexing.
* **Query Parameter Stripping:** Any campaign tracking parameters (`utm_*`, `ref`, `fbclid`) or UI search parameters are stripped from the canonical tag.

---

## 3. Dynamic Sitemap Architecture (`src/app/sitemap.ts`)

The sitemap is dynamically generated using Next.js 15 Metadata API (`export default function sitemap(): MetadataRoute.Sitemap`):
* **Route Registry Integration:** Directly reads from `CANONICAL_PUBLIC_ROUTES` in `src/lib/seo/routes.ts`.
* **Deterministic Dates:** Uses actual content revision timestamps (e.g. `2026-11-14`) rather than runtime request timestamps, preventing search engines from ignoring false lastmod churn.
* **Zero Private Leakage:** All authenticated dashboards, operator wallet tools, and API routes are strictly excluded.
* **Parity Guarantees:** 100% verified by automated test suites (`tests/seo/sitemap.test.ts`).

---

## 4. Crawl Budget & Robots Policy (`src/app/robots.ts`)

The `robots.txt` configuration balances commercial search engine discovery, AI search agent access, and application data protection:

### 4.1 Allowed Crawlers
* **Commercial Search Engines:** `*` (Default), `Googlebot`, `bingbot`.
* **Search & Generative AI Agents:** `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `GPTBot`.

### 4.2 Allowances & Exclusions
* **Allowed Paths:** All 52 canonical public routes, `/services/*`, `/features/*`, `/solutions/*`, `/blog/*`, and static verification assets (`/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, `/.well-known/ard.json`, `/.well-known/ai-catalog.json`).
* **Disallowed Paths:** `/dashboard`, `/dashboard/*`, `/studio`, `/studio/*`, `/wallet`, `/wallet/*`, `/cards`, `/cards/*`, `/admin`, `/admin/*`, `/support`, `/support/*`, `/api/*`.
* **Deliberate Allowance:** `/login` and `/register` are intentionally omitted from disallow blocks so crawlers can reach the pages and process their `<meta name="robots" content="noindex, follow">` tags.

---

## 5. Structured Data & Semantic Web Engineering

Structured data is generated via type-safe utility functions in `src/lib/seo/structuredData.ts` and injected as JSON-LD (`application/ld+json`):

### 5.1 Deployed Schema Types
1. **`Organization`:** Legal name (Accero Technologies), brand name, canonical logo, official support contacts, social profiles.
2. **`WebSite`:** Site search action targeting `/services?q={search_term_string}`.
3. **`SoftwareApplication`:** Cross-platform web application declaration, ISO 7810 ID-1 card formatting classification, transparent utility pricing offer (₹5.00 INR, InStock).
4. **`Service`:** Schema.org Service markup on each document page declaring provider, areaServed (India), serviceType, and itemized offer catalog.
5. **`BreadcrumbList`:** 1-based sequential hierarchy providing rich breadcrumb display in SERPs.
6. **`FAQPage`:** High-intent question and answer entities targeting direct search answers.
7. **`HowTo`:** Step-by-step procedural workflow schema for physical card formatting.
8. **`Article`:** Educational technical guides with verified author and publisher bindings.

> [!CAUTION]
> **Zero Fabrication Policy:** Accero PrintPortal strictly forbids generating fake reviews, synthetic 5-star aggregate ratings, or simulated customer testimonials. All schema properties represent genuine platform characteristics.

---

## 6. Core Web Vitals & Rendering Performance

* **LCP Optimization:** Hero sections load system and local font assets with `font-display: swap` to prevent text rendering delays.
* **Package Import Optimization:** Configured `optimizePackageImports: ['lucide-react']` in `next.config.ts`, reducing client bundle size by over 45 kB.
* **Third-Party Script Isolation:** Google Tag Manager is loaded via Next.js `Script` with `strategy="lazyOnload"`, ensuring analytics tags never compete with main thread layout rendering.
* **CLS Prevention:** All document canvas previews and card containers maintain fixed aspect ratios (`1.5857:1` matching standard CR80) to eliminate layout shift during image loading.
