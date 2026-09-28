# Roadmap: PrintPortal Next.js

## Overview

PrintPortal Next.js modernizes and replaces the legacy PHP document printing platform with a high-performance Next.js 15+ App Router web application backed by MongoDB and deployed on Vercel. The roadmap spans 6 focused phases: establishing the core full-stack foundation, constructing pixel-perfect CR80 vector card canvas renderers for all 5 document types, delivering the flagship split-screen studio with real-time missing-field detection, integrating resilient multi-provider verification APIs, implementing atomic wallet deductions, and deploying a programmatic SEO, GEO, and AEO engine.

## Phases

- [x] **Phase 1: Foundation & Architecture Setup** - Initialize Next.js 15 App Router in root with TypeScript, Tailwind design tokens, cached MongoDB Mongoose connection, and authentication. (completed 2026-09-27)
- [x] **Phase 2: Preformatted Vector Card Canvas & Print Engine** - Build high-DPI vector card renderers for PAN, Aadhaar, Voter, DL, and RC with exact ISO 7810 CR80 physical dimensions (`@page 85.6mm 53.98mm`) and PDF/PNG export. (completed 2026-09-27)
- [x] **Phase 3: Interactive Split-Screen Studio & Missing Field Editor** - Implement the dual-pane studio featuring real-time missing-field detection, live two-way canvas synchronization, and manual data/image uploads. (completed 2026-09-28)
- [x] **Phase 4: Multi-Provider Verification & Fallback APIs** - Integrate server-side verification pipelines for NeoAPI, AxenAPI, and FastNexora with error interception and studio routing. (completed 2026-09-28)
- [ ] **Phase 5: Wallet & Credits Management** - Develop MongoDB wallet balance ledger, atomic deductions (`$gte`), low-balance alerts, and transaction history.
- [ ] **Phase 6: Full SEO, GEO & AEO Search Engine** - Deploy SSR public landing pages, programmatic regional state/district routes, and rich JSON-LD structured schemas (`FAQPage`, `HowTo`, `SoftwareApplication`).

---

## Phase Details

### Phase 1: Foundation & Architecture Setup
**Goal**: Establish a rock-solid, production-ready full-stack foundation in the root directory with database persistence, design system tokens, and authentication.
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04
**Success Criteria** (what must be TRUE):
  1. Next.js 15+ App Router application runs locally in the root directory with clean TypeScript and Tailwind CSS compilation.
  2. MongoDB connection is established with serverless connection pooling and caching.
  3. Brand design tokens (`#8B1E2D` Burgundy, `#E63946` Crimson, `#F4D35E` Gold, `#457B9D` Steel Blue) are available across global styles and components.
  4. User can sign up, log in, view authenticated dashboard navigation, and log out securely.
**Plans**: 3 plans

Plans:
- [x] 01-01: Next.js 15 project setup, root configuration, Tailwind theme tokens, and base layout.
- [x] 01-02: MongoDB connection utility with serverless caching and Mongoose User & Session models.
- [x] 01-03: Authentication flow (JWT session handler, sign-up, sign-in, and route guards).

### Phase 2: Preformatted Vector Card Canvas & Print Engine
**Goal**: Deliver pixel-perfect, high-DPI printable card canvas components for all 5 document types (PAN, Aadhaar, Voter, DL, RC) with zero margin drift on PVC card printers.
**Depends on**: Phase 1
**Requirements**: CARD-01, CARD-02, CARD-03, CARD-04, CARD-05, CARD-06, CARD-07
**Success Criteria** (what must be TRUE):
  1. User can view high-DPI front and back preformatted card layouts for PAN, Aadhaar, Voter EPIC, Driving License, and Vehicle RC.
  2. Dynamic QR codes render sharply on Aadhaar, PAN, and Voter cards.
  3. Browser print preview (`Ctrl+P` / `Cmd+P`) locks exactly to ISO 7810 CR80 dimensions (85.60 mm × 53.98 mm) without page overflow or shifted margins.
  4. User can download a 1-click high-resolution print-ready PDF and PNG of any formatted card.
**Plans**: 3 plans

Plans:
- [x] 02-01: CR80 Card Canvas base container, QR code generator, and CSS `@page` print stylesheets.
- [x] 02-02: PAN and Voter card canvas components with front/back vector overlays and regional typography.
- [x] 02-03: Aadhaar, Driving License (DL), and Vehicle RC card canvas components, plus 1-click PDF export utility.

### Phase 3: Interactive Split-Screen Studio & Missing Field Editor
**Goal**: Solve the core problem of incomplete data with a responsive dual-pane studio where missing API fields are detected, highlighted, and editable in real time alongside the live card canvas.
**Depends on**: Phase 2
**Requirements**: STUDIO-01, STUDIO-02, STUDIO-03, STUDIO-04, STUDIO-05
**Success Criteria** (what must be TRUE):
  1. Split-screen layout displays form controls on the left and live reactive card canvas on the right.
  2. Incomplete or missing API fields are automatically detected and highlighted with amber warning badges and dashed guide boxes on the card.
  3. Typing in any form field instantly updates the corresponding text on the live card preview with zero lag.
  4. User can enter documents completely manually, uploading candidate photos and signatures via drag-and-drop.
  5. Saved cards persist completely to MongoDB with audit timestamps and user edits.
**Plans**: 3 plans

Plans:
- [x] 03-01: Split-screen studio layout and two-way reactive state machine.
- [x] 03-02: Missing field detection engine, warning badges, and Dropify photo/signature uploaders.
- [x] 03-03: MongoDB Document model, snapshot persistence, and document retrieval dashboard.

### Phase 4: Multi-Provider Verification & Fallback APIs
**Goal**: Build secure, server-side verification pipelines connecting to third-party endpoints with graceful error fallbacks and seamless routing into the Split-Screen Studio.
**Depends on**: Phase 3
**Requirements**: VERIF-01, VERIF-02, VERIF-03, VERIF-04, VERIF-05
**Success Criteria** (what must be TRUE):
  1. All external verification requests execute strictly in server-only Server Actions without leaking vendor API keys.
  2. Entering a PAN number fetches cardholder name, father name, and DOB.
  3. Entering an EPIC voter number fetches voter demographic records via API.
  4. Entering a DL or vehicle RC number fetches driving license and registration details.
  5. Any API failure, timeout, or partial response smoothly routes the user into the Split-Screen Studio pre-filled with whatever data was retrieved.
**Plans**: 2 plans

Plans:
- [x] 04-01: Server-side API client infrastructure, provider key security, and PAN/Voter lookup actions.
- [x] 04-02: DL and RC lookup integrations, timeout interceptor, and partial-payload fallback orchestrator.

### Phase 5: Wallet & Credits Management
**Goal**: Implement a tamper-proof wallet accounting system supporting atomic deductions, recharge flows, low-balance notifications, and full audit logs.
**Depends on**: Phase 4
**Requirements**: WALL-01, WALL-02, WALL-03, WALL-04
**Success Criteria** (what must be TRUE):
  1. User wallet balance is tracked accurately in MongoDB and displayed prominently in the portal header.
  2. Generating or searching a document triggers an atomic conditional deduction (`$gte`) preventing double-charges or overdrafts.
  3. Users with insufficient balance receive an instant SweetAlert-style recharge dialog with recharge options.
  4. User can review a detailed transaction log recording date, document type, ID number, and credit debits/credits.
**Plans**: 2 plans

Plans:
- [ ] 05-01: MongoDB Wallet model, atomic deduction transaction logic, and header balance indicator.
- [ ] 05-02: Wallet recharge modal, payment mock/gateway integration, and transaction audit history table.

### Phase 6: Full SEO, GEO & AEO Search Engine
**Goal**: Establish dominant search engine visibility across traditional organic search, hyper-local queries across India, and modern AI answer engines.
**Depends on**: Phase 5
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04
**Success Criteria** (what must be TRUE):
  1. Public Server-Side Rendered (SSR) landing pages exist for all document services with comprehensive OpenGraph meta tags.
  2. Programmatic regional GEO routes (`/services/[card]/[state]/[district]`) render localized search landing pages.
  3. Rich JSON-LD schemas (`SoftwareApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`) validate with zero errors in Google Rich Results Test.
  4. Automated `sitemap.xml` and `robots.txt` dynamically list all public service and regional endpoints.
**Plans**: 2 plans

Plans:
- [ ] 06-01: Public service landing pages, dynamic metadata API, and JSON-LD structured schemas.
- [ ] 06-02: Programmatic regional state/district generator, dynamic sitemap.xml, robots.txt, and Vercel edge deployment configuration.

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Architecture Setup | 3/3 | Complete    | 2026-09-27 |
| 2. Preformatted Vector Card Canvas & Print Engine | 3/3 | Complete    | 2026-09-27 |
| 3. Interactive Split-Screen Studio & Missing Field Editor | 3/3 | Complete | 2026-09-28 |
| 4. Multi-Provider Verification & Fallback APIs | 2/2 | Complete | 2026-09-28 |
| 5. Wallet & Credits Management | 0/2 | Not started | - |
| 6. Full SEO, GEO & AEO Search Engine | 0/2 | Not started | - |

---
*Roadmap created: 2026-09-28*
