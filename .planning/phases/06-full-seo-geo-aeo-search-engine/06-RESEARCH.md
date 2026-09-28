# Phase 6: Full SEO, GEO & AEO Search Engine — Research & Technical Spikes

**Phase:** 06-full-seo-geo-aeo-search-engine  
**Date:** 2026-09-28  
**Scope:** Public SSR service landing pages, programmatic regional state/district hubs, dual AEO on-page blocks, JSON-LD schemas, and dynamic Next.js sitemaps/robots.

---

## 1. Next.js 15 App Router SEO Architecture

### Metadata API & Dynamic OpenGraph
Next.js 15 provides native `generateMetadata` supporting dynamic titles, descriptions, canonical URLs, and OpenGraph/Twitter cards:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const { card, state, district } = await params;
  return {
    title: `...`,
    description: `...`,
    alternates: {
      canonical: `https://printportal.vercel.app/services/...`,
    },
    openGraph: {
      title: `...`,
      description: `...`,
      url: `...`,
      siteName: 'PrintPortal Next.js',
      locale: 'en_IN',
      type: 'website',
    },
  };
}
```

### JSON-LD in Server Components
In App Router, JSON-LD is safely embedded into server components as `<script type="application/ld+json">` without needing external hydration libraries:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
/>
```

---

## 2. Programmatic Regional GEO Strategy

### Route Structure
`/services/[card]/[state]/[district]`
- `[card]`: Document slug (`pan-card`, `aadhaar-card`, `voter-id`, `driving-license`, `vehicle-rc`).
- `[state]`: Slugified state name (e.g. `uttar-pradesh`, `maharashtra`).
- `[district]`: Slugified district name (e.g. `lucknow`, `varanasi`, `mumbai`, `pune`).

### Static Generation with Dynamic SSR Fallback
Using `generateStaticParams()` to pre-build top high-traffic combinations at build time, while enabling `dynamicParams = true` to allow any valid state and district to render on-demand via SSR with localized content.

---

## 3. Answer Engine Optimization (AEO)

Modern search engines (Perplexity, ChatGPT Search, Gemini, Claude, Google Search Generative Experience) extract direct answers from high-authority pages that feature:
1. **Concise Direct Answers:** 40–50 word authoritative paragraph answering "What is this and how to generate it".
2. **Step-by-Step `HowTo` Schema:** 4-step sequence indicating precise user flow.
3. **Structured `FAQPage` Markup:** Questions matching natural language conversational queries (e.g., *"How long does it take to print a PVC PAN card?"*, *"What are the official dimensions of CR80 card?"*).
4. **`SoftwareApplication` Schema:** Declaring software category, browser requirement, pricing in INR, zero government impersonation disclaimer.

---

## 4. Crawl Optimization: `sitemap.ts` and `robots.ts`

- **`src/app/robots.ts`:**
  Next.js built-in API exporting `MetadataRoute.Robots`:
  - Rules: `allow: ['/', '/services', '/services/']`, `disallow: ['/studio', '/dashboard', '/wallet', '/api/']`.
  - Crawl budget directed exclusively to high-converting public landing pages.
- **`src/app/sitemap.ts`:**
  Next.js built-in API exporting `MetadataRoute.Sitemap`:
  - Static base routes (`/`, `/services`).
  - Core service landing pages (Priority `1.0`, `daily`).
  - Programmatic regional GEO hubs (Priority `0.8`, `weekly`).
