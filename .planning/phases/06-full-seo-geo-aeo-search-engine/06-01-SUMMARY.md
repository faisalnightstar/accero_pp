# Phase 6 Plan 01 Summary: Public Service Landing Pages & AEO Schemas

## Objectives Achieved
1. **SEO Service Content Library (`src/lib/seo/servicesData.ts`)**:
   - Comprehensive configurations for all 5 document types (`pan-card`, `aadhaar-card`, `voter-id`, `driving-license`, `vehicle-rc`).
   - Includes official fee schedules (₹50, ₹25, ₹20, ₹30, ₹35), ISO 7810 ID-1 standard specs, 4-step HowTo workflows, 5 curated FAQs each, and 40-50 word AEO direct answer blocks.
2. **Schema.org Structured JSON-LD Generator (`src/lib/seo/schemaGenerator.ts`)**:
   - `generateSoftwareApplicationSchema()`
   - `generateFaqSchema()`
   - `generateHowToSchema()`
   - `generateBreadcrumbSchema()`
3. **Public Services Directory (`src/app/services/page.tsx`)**:
   - Public server-side catalog linking to all 5 services with pricing badges, feature lists, and regulatory compliance notices.
4. **Dynamic Core Service Landing Pages (`src/app/services/[card]/page.tsx`)**:
   - Above-the-fold split hero with live CR80 card preview (`HeroCardPreview.tsx`) and 1-Click number lookup (`HeroLookupForm.tsx`).
   - Dedicated AEO quick answer block formatted for Perplexity, ChatGPT Search, and Gemini answer engine citations.
   - 4-step HowTo process and technical specs table for printer tray compatibility (Epson, Canon, Zebra, Evolis).
   - Injected with all 4 Schema.org JSON-LD scripts (`SoftwareApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`).
5. **Decoupled Wallet Constants (`src/lib/wallet/constants.ts`)**:
   - Separated client-safe fee definitions and thresholds from server-side database models to prevent client-side Webpack bundling errors.

## Verification
- `npx tsc --noEmit` passed with 0 errors.
- HTTP 200 verified on `/services`, `/services/pan-card`, `/services/aadhaar-card`, `/services/voter-id`, `/services/driving-license`, and `/services/vehicle-rc`.
- JSON-LD schemas validated in server-rendered HTML.
