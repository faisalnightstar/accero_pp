# Requirements: PrintPortal Next.js

**Defined:** 2026-09-28
**Core Value:** Effortless, pixel-perfect card printing with zero missing-data failures — allowing users to seamlessly review, edit, and fill missing fields in real-time on preformatted card canvases.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation & Infrastructure (FOUND)

- [x] **FOUND-01**: Next.js 15+ App Router full-stack architecture initialized with TypeScript, Tailwind CSS, and modular layout.
- [x] **FOUND-02**: MongoDB database integration with cached Mongoose connection pattern optimized for Vercel serverless functions.
- [x] **FOUND-03**: Custom design system and palette tokens matching brand identity (`#8B1E2D` Burgundy, `#E63946` Crimson, `#F4D35E` Gold, `#457B9D` Steel Blue).
- [x] **FOUND-04**: User authentication system (JWT session management, sign-up, sign-in, and protected dashboard routes).

### Card Canvas & Print Engine (CARD)

- [x] **CARD-01**: Preformatted vector card canvas for PAN Card (standard front and back layouts with photo, signature, father name, and QR code).
- [x] **CARD-02**: Preformatted vector card canvas for Aadhaar Card (front and back layouts with Devanagari/regional text, demographic box, and high-density QR code).
- [x] **CARD-03**: Preformatted vector card canvas for Voter ID / EPIC Card (front portrait, EPIC number, constituency, and back details).
- [x] **CARD-04**: Preformatted vector card canvas for Driving License (DL) (standard smart card chip layout, vehicle classes, issue/expiry dates).
- [x] **CARD-05**: Preformatted vector card canvas for Vehicle Registration Certificate (RC) (vehicle details, chassis, engine, fuel type, owner info).
- [x] **CARD-06**: Exact physical print scaling via CSS `@page { size: 85.6mm 53.98mm; margin: 0; }` preventing margin drift on PVC card printers.
- [x] **CARD-07**: Direct 1-click high-DPI PDF and PNG export for digital archival and offline card tray printing.

### Split-Screen Studio & Interactive Editor (STUDIO)

- [x] **STUDIO-01**: Responsive split-screen studio layout: editable form controls on the left, reactive live card canvas preview on the right.
- [x] **STUDIO-02**: Automatic missing-field detection that scans incoming API records and visually highlights missing/incomplete fields in amber/yellow.
- [x] **STUDIO-03**: Real-time two-way data binding: typing or updating any form input instantly reflects on the live card canvas without page reload.
- [x] **STUDIO-04**: Manual entry mode supporting full blank document creation with photo and signature image uploads (Dropify / drag-and-drop).
- [x] **STUDIO-05**: Document record persistence saving completed card snapshots, user modifications, and timestamps into MongoDB.

### Verification & Multi-Provider APIs (VERIF)

- [x] **VERIF-01**: Secure server-only API route handlers/server actions executing third-party verification requests without exposing API keys to client bundles.
- [x] **VERIF-02**: Voter ID (EPIC) verification integration with captcha solver and fallback lookup.
- [x] **VERIF-03**: PAN verification integration returning cardholder name, father name, and DOB.
- [x] **VERIF-04**: Driving License and Vehicle RC verification integration returning vehicle and license demographic payloads.
- [x] **VERIF-05**: Resilient error handling that intercepts API timeouts or partial payloads, gracefully routing available data into the Split-Screen Studio for missing-field completion.

### Wallet & Credits Management (WALL)

- [ ] **WALL-01**: MongoDB wallet ledger tracking user account balance, credit additions, and service fee deductions.
- [ ] **WALL-02**: Atomic wallet deductions using conditional updates (`$gte`) to prevent race conditions or overdrafts during concurrent card generations.
- [ ] **WALL-03**: Interactive wallet balance display in header with low-balance warnings and recharge prompt dialog.
- [ ] **WALL-04**: Transaction history log displaying date, document type, ID number, fee charged, and status.

### SEO, GEO & AEO Search Engine (SEO)

- [ ] **SEO-01**: Server-Side Rendered (SSR) public landing pages for each service (`/services/pan-card`, `/services/voter-id`, etc.) with optimized metadata and OpenGraph tags.
- [ ] **SEO-02**: Programmatic regional GEO landing pages targeting states and major districts across India to capture local search intent.
- [ ] **SEO-03**: Comprehensive JSON-LD structured schemas (`SoftwareApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`) for Google Rich Results and AI Answer Engines (Perplexity, ChatGPT Search).
- [ ] **SEO-04**: Dynamic `sitemap.xml` and `robots.txt` generation including all service and regional routes.

## v2 Requirements

### Advanced Enhancements

- **ENH-01**: Automated Optical Character Recognition (OCR) to extract card data directly from uploaded photo scans.
- **ENH-02**: Multi-language UI toggle (Hindi, Bengali, Marathi, Tamil, Telugu, Gujarati) across the entire portal interface.
- **ENH-03**: Automated UPI QR dynamic payment gateway integration for automated instant wallet balance top-ups.
- **ENH-04**: Bulk batch card printing: CSV upload generating multi-page card print sheets for institutional operators.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Physical Card Printing & Courier Shipping | Requires complex courier logistics, physical inventory, and warehousing; portal focuses on instant digital & print-ready outputs for local PVC printers. |
| Client-Side Direct Scraping of Government Portals | Bypassing server APIs causes CORS errors, IP blocks, and severe fragility; all integrations run server-side via third-party gateways. |
| Mobile Native App (iOS/Android App Stores) | Responsive web app (PWA-enabled) satisfies mobile and desktop browser requirements with lower maintenance. |

## Traceability

Which phases cover which requirements. (To be mapped in ROADMAP.md).

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| CARD-01 | Phase 2 | Complete |
| CARD-02 | Phase 2 | Complete |
| CARD-03 | Phase 2 | Complete |
| CARD-04 | Phase 2 | Complete |
| CARD-05 | Phase 2 | Complete |
| CARD-06 | Phase 2 | Complete |
| CARD-07 | Phase 2 | Complete |
| STUDIO-01 | Phase 3 | Complete |
| STUDIO-02 | Phase 3 | Complete |
| STUDIO-03 | Phase 3 | Complete |
| STUDIO-04 | Phase 3 | Complete |
| STUDIO-05 | Phase 3 | Complete |
| VERIF-01 | Phase 4 | Complete |
| VERIF-02 | Phase 4 | Complete |
| VERIF-03 | Phase 4 | Complete |
| VERIF-04 | Phase 4 | Complete |
| VERIF-05 | Phase 4 | Complete |
| WALL-01 | Phase 5 | Pending |
| WALL-02 | Phase 5 | Pending |
| WALL-03 | Phase 5 | Pending |
| WALL-04 | Phase 5 | Pending |
| SEO-01 | Phase 6 | Pending |
| SEO-02 | Phase 6 | Pending |
| SEO-03 | Phase 6 | Pending |
| SEO-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-28*
*Last updated: 2026-09-28 after initial definition*
