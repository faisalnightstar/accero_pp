# Ration Card & Farmer ID SEO, AEO & GEO Strategy Implementation Report

**Author:** Antigravity Engineering Agent  
**Date:** November 14, 2026  
**Status:** Implemented Locally & Verified  
**Target Platform:** Accero PrintPortal (`https://printportal.accero.app`)

---

## 1. Executive Implementation Summary

A comprehensive, multi-engine SEO, AEO, and GEO strategy has been designed and implemented across Accero PrintPortal for:
1. **Ration Card Document Processing & PVC Printing**
2. **Farmer ID / AgriStack / Farmer Registry Card Document Processing & PVC Printing**

The architecture establishes Accero as an authoritative, discoverable commercial platform across Google Search, Google AI Overviews, ChatGPT Search, Perplexity, and Bing Copilot while driving commercial conversion from organic discovery to repeat paid usage.

---

## 2. Inventory of Changes & Additions

### 2.1 New Canonical Pages Created
| Route Path | Page Title | Primary Intent |
| :--- | :--- | :--- |
| `/ration-card-printing-for-csc` | Ration Card Printing Software for CSC Operators & Cyber Cafes | Commercial B2B Pillar (CSC VLEs, Cyber Cafes) |
| `/farmer-id-printing-for-csc` | Farmer ID Card Printing Software for CSC Operators & Retailers | Commercial B2B Pillar (Rural Kiosks, Retailers) |

### 2.2 Existing Canonical Service Data Enhanced (`src/lib/seo/servicesData.ts`)
- **`/services/ration-card-printing`**:
  - Migrated primary canonical slug from `/services/ration-card-management` to `/services/ration-card-printing`.
  - Added full AEO direct answers, technical card specs (ISO 7810 ID-1, 300+ DPI), How-To steps, FAQs, and sample data.
  - Transparent pricing: ₹25 lookup (29% OFF from ₹35) with ₹0 lifetime re-prints.
- **`/services/farmer-id-printing`**:
  - Added new canonical configuration for Farmer ID (`docType: 'farmer'`).
  - Highlights AgriStack context and explicitly identifies current support for the authenticated **Rajasthan Farmer Registry (RJFR)** format.
  - Transparent pricing: ₹20 lookup (43% OFF from ₹35) with ₹0 lifetime re-prints.
  - Full alias resolution: `farmer`, `farmer-id`, `farmer-card`, `farmer-registry-card`, `agristack`.

### 2.3 SEO Infrastructure & Route Registry (`src/lib/seo/routes.ts`)
- Expanded `CANONICAL_PUBLIC_ROUTES` to **52 canonical routes**:
  - Registered `/services/ration-card-printing`
  - Registered `/services/farmer-id-printing`
  - Registered `/ration-card-printing-for-csc`
  - Registered `/farmer-id-printing-for-csc`
- Confirmed `sitemap.ts` and `robots.ts` reflect all additions with zero private leakage.

### 2.4 Internal Linking Architecture Updated
- **Homepage (`/`)**: Added Farmer ID and updated Ration Card in the Services Showcase grid with % OFF badges.
- **Print Portal Hub (`/print-portal`)**: Added dedicated "Supported Document Pipelines" section linking to all 7 card services.
- **Global Header (`PublicHeader.tsx`)**: Added Farmer ID (AgriStack) and updated Ration Card in navigation.
- **Global Footer (`PublicFooter.tsx`)**: Added Farmer ID and Ration Card in Services column.
- **Solutions Hub (`/solutions/csc-operators`)**: Added contextual deep-links to both audience guides.
- **Comparison Pages (`skprintportal-alternative`)**: Linked to both services in the workflow comparison table.

### 2.5 Privacy-Conscious Analytics (`src/lib/analytics/events.ts`)
- Added dedicated tracking events for Ration and Farmer funnels:
  - `ration_page_view`, `ration_registration_cta_click`, `ration_registration_completed`, `ration_first_lookup_success`, `ration_first_recharge_success`
  - `farmer_page_view`, `farmer_registration_cta_click`, `farmer_registration_completed`, `farmer_first_lookup_success`, `farmer_first_recharge_success`
- Enforced strict privacy rules: **Zero citizen PII (Aadhaar, card numbers, names, photos) is ever dispatched to GTM/GA4**.

### 2.6 Strategy Documentation Created (`docs/seo/ration-farmer/`)
1. `keyword-research.md`: Complete keyword clusters, search volumes, and query classifications.
2. `search-intent-map.md`: Keyword-to-URL mapping and cannibalization prevention.
3. `seo-aeo-geo-strategy.md`: Multi-engine strategy for Google, ChatGPT, Perplexity, and Copilot.
4. `competitor-research.md`: In-depth audit of legacy portals (DigitalPortal, FastPrintPortal, SKPrintPortal).
5. `content-roadmap.md`: Content clusters and state template rollout pipeline.
6. `internal-linking-map.md`: Hub-and-spoke internal link graph.
7. `structured-data-audit.md`: Schema.org JSON-LD definitions and compliance verification.
8. `search-performance-baseline.md`: Funnel KPIs and GSC tracking framework.
9. `implementation-report.md`: Technical execution report.

---

## 3. Verification & Testing

- **Vitest Suites:**
  - `tests/seo-indexing-policy.test.ts`: 15/15 tests passing (all 52 canonical routes validated on disk).
  - `tests/service-pricing-ssot.test.ts`: 13/13 tests passing.
  - `tests/ration-card.test.ts`: 14/14 tests passing.
  - `tests/farmer-card.test.ts`: 21/21 tests passing.
- **TypeScript:** `npx tsc --noEmit` passed with 0 errors in strict mode.
- **Total Test Suite:** All 25 test suites passing (277/277 tests).
