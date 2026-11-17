# ACCERO PRINTPORTAL - STRUCTURED DATA & SCHEMA MARKUP SPECIFICATION

**Canonical Domain:** `https://printportal.accero.app`  
**Standard:** Schema.org (JSON-LD format)  
**Compliance Authority:** Google Search Central Structured Data Guidelines  

---

## 1. COMPLIANCE & CLEANSING AUDIT

In the legacy implementation, the schema generator (`src/lib/seo/schemaGenerator.ts`) contained a severe violation of Google Search Central guidelines:
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.9",
  "reviewCount": "1850",
  "bestRating": "5",
  "worstRating": "1"
}
```
**Corrective Action Taken:**
Fabricating reviews, ratings, or testimonials without authentic third-party review collection triggers Google Manual Action penalties for structured data spam. **This fabricated block was completely removed.** All schemas on Accero PrintPortal now reflect verified, factual platform properties.

---

## 2. IMPLEMENTED SCHEMA CATALOG

### A. Organization Schema (`@type: Organization`)
- **Location:** Root layout (`src/app/layout.tsx`) & About page (`src/app/about/page.tsx`).
- **Entity ID:** `https://printportal.accero.app/#organization`
- **Fields:**
  - `name`: "Accero PrintPortal"
  - `legalName`: "Accero Technologies"
  - `url`: "https://printportal.accero.app"
  - `logo`: "https://printportal.accero.app/assets/logo.png"
  - `description`: "Independent commercial document processing and printing software platform designed for cyber cafes, CSC operators, and printing businesses."
  - `contactPoint`: Customer Support (`support@accero.app`, languages: English, Hindi).
  - `sameAs`: Social profiles.

### B. WebSite Schema (`@type: WebSite`)
- **Location:** Root layout (`src/app/layout.tsx`).
- **Entity ID:** `https://printportal.accero.app/#website`
- **Fields:**
  - `name`: "Accero PrintPortal"
  - `url`: "https://printportal.accero.app"
  - `potentialAction`: `SearchAction` targeting `https://printportal.accero.app/services?q={search_term_string}`.

### C. SoftwareApplication Schema (`@type: SoftwareApplication`)
- **Location:** Homepage, Feature pages, Service pages, Solutions pages.
- **Entity ID:** `https://printportal.accero.app/#software`
- **Fields:**
  - `name`: Specific application or feature name.
  - `operatingSystem`: "Cross-platform (Google Chrome, Firefox, Edge, Safari)".
  - `applicationCategory`: "BusinessApplication".
  - `applicationSubCategory`: "Document Printing & Card Formatting Utility".
  - `softwareRequirements`: "HTML5 modern web browser with CSS @page print support".
  - `offers`: Transparent pay-as-you-go pricing (`priceCurrency: "INR"`, `price: "5.00"`).

### D. BreadcrumbList Schema (`@type: BreadcrumbList`)
- **Location:** Every public sub-page (`/features/*`, `/services/*`, `/solutions/*`, `/blog/*`, `/pricing`, `/about`, `/contact`, `/faq`, `/resources`).
- **Properties:** Accurate item position hierarchy using fully qualified canonical URLs.

### E. FAQPage Schema (`@type: FAQPage`)
- **Location:** Homepage (`/`), FAQ directory (`/faq`), Services (`/services/*`), Features (`/features/*`), Solutions (`/solutions/*`), Cornerstone Blog guides (`/blog/*`).
- **Properties:** Array of `Question` and `acceptedAnswer` text matching on-page content word-for-word.

### F. HowTo Schema (`@type: HowTo`)
- **Location:** Service detail pages (`/services/*`) and printer setup tutorials (`/blog/pvc-card-printer-tray-guide`).
- **Properties:** Step-by-step instructions with `HowToStep`, step names, and descriptive instructions.

### G. Article Schema (`@type: Article`)
- **Location:** Cornerstone blog articles (`/blog/*`).
- **Properties:** `headline`, `description`, `image` (dynamic 1200x630 OpenGraph card from `/api/og`), `datePublished`, `author` (Organization: Accero Technical Team), `publisher`.

---

## 3. VERIFICATION & VALIDATION PROTOCOL

All schemas have been validated against Schema.org syntax rules:
1. **Google Rich Results Test:** Validate live pages using `https://search.google.com/test/rich-results`.
2. **Schema.org Validator:** Validate JSON-LD syntax using `https://validator.schema.org`.
3. **No Duplicate Root Entities:** Organization and WebSite IDs (`#organization`, `#website`) are uniquely anchored to eliminate duplicate graph ambiguity.

