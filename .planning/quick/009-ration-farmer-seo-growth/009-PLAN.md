# Quick Task 009: Ration Card & Farmer ID SEO, AEO & GEO Growth Strategy

## Task Goal
Develop and implement a comprehensive SEO, AEO, and GEO acquisition strategy for **Ration Card** and **Farmer ID / AgriStack / Farmer Registry Card** in Accero PrintPortal. Target search engines (Google, Bing) and AI answer engines (ChatGPT Search, Perplexity, Google AI Overviews, Copilot) to convert CSC operators, cyber cafe owners, and retailers into active, paying Accero users.

## Scope of Work
1. **Reconnaissance & Inventory**: Audit existing SEO infrastructure, routes, services catalog, and document templates.
2. **Keyword & Competitor Research**:
   - Compile comprehensive clusters for Ration Card and Farmer ID (Primary, Commercial, Informational, Long-tail, Regional Devanagari).
   - Research actual competitors (DigitalPortal, FastPrintPortal, SKPrintPortal, RajPrint, EForms99).
3. **Canonical Service Pages & Data Enhancement**:
   - Update `src/lib/seo/servicesData.ts` with canonical `/services/ration-card-printing` and new `/services/farmer-id-printing`.
   - Implement complete AEO quick answers, technical specifications, How-To steps, FAQs, and live canvas preview integration.
4. **Audience Landing Pages**:
   - Create `/ration-card-printing-for-csc/page.tsx` for CSC VLEs and cyber cafes.
   - Create `/farmer-id-printing-for-csc/page.tsx` for rural operators and digital service centers.
5. **SEO Infrastructure & Parity**:
   - Register routes in `src/lib/seo/routes.ts` (`CANONICAL_PUBLIC_ROUTES`).
   - Expand `src/lib/seo/keywords.ts`.
   - Ensure `sitemap.ts`, `robots.ts`, and JSON-LD schemas (`SoftwareApplication`, `BreadcrumbList`, `FAQPage`) reflect all additions.
6. **Internal Linking**:
   - Link from `/print-portal`, `/services`, `/solutions/csc-operators`, `/solutions/cyber-cafes`, header/footer navigation.
7. **Analytics & Privacy**:
   - Verify analytics event tracking in `src/lib/analytics/events.ts` without citizen PII.
8. **Documentation Package (`docs/seo/ration-farmer/`)**:
   - 9 required strategy documents detailing evidence, search intent, competitor analysis, internal linking, and implementation.
9. **Verification**:
   - Run Vitest suite, TypeScript validation (`npx tsc --noEmit`), and ensure zero regressions.
