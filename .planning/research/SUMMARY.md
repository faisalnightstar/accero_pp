# Project Research Summary

**Project:** PrintPortal Next.js (Document Print & Verification Gateway)
**Domain:** Full-Stack Document Generation, PVC Card Printing & Verification Portal
**Researched:** 2026-09-28
**Confidence:** HIGH

## Executive Summary

The project is a migration and complete modernization of a legacy PHP document printing portal into a Next.js 15+ App Router application backed by MongoDB and deployed on Vercel. The system serves CSC operators, cyber café owners, and individuals who need fast, official-quality preformatted cards (PAN, Aadhaar, Voter ID, Driving License, Vehicle RC) for instant PVC printing.

The critical user need addressed by this architecture is the resolution of **incomplete API payloads**. When external APIs return partial data, the application immediately surfaces a **split-screen interactive studio**: the editable form on the left with missing fields visually highlighted, and a reactive, pixel-accurate CR80 card canvas on the right. Operators can fill missing fields, upload photos/signatures, observe the card update in real-time, and print with zero defects.

Furthermore, the portal is architected from the ground up for maximum discoverability, incorporating Server-Side Rendered (SSR) public landing pages, programmatic regional state/district pages (GEO), and JSON-LD structured schemas (`FAQPage`, `HowTo`, `SoftwareApplication`) to dominate traditional and AI-driven search engines (AEO).

## Key Findings

### Recommended Stack
- **Framework:** Next.js 15+ App Router with React 19 and TypeScript.
- **Database:** MongoDB with Mongoose (cached connection pattern for serverless).
- **Styling:** Custom design system based on established brand colors (`#8B1E2D`, `#E63946`, `#F4D35E`, `#457B9D`, `#1D3557`).
- **Validation:** Zod schemas for all card formats and API payloads.
- **Print Engine:** CSS `@page` print rules matching ISO 7810 CR80 dimensions (85.60 mm × 53.98 mm) plus high-DPI PDF generation via jsPDF.

### Expected Features
- **All 5 Core Card Types:** PAN, Aadhaar, Voter EPIC, Driving License (DL), Vehicle RC.
- **Two Entry Modes:** Instant Card Number Lookup via API, and Direct Manual Entry.
- **Split-Screen Studio:** Form editor with missing-field detection and live synchronized card canvas.
- **Wallet & Billing:** Atomic wallet credit deductions, recharge flow, and transaction history.
- **SEO/GEO/AEO Suite:** Public SSR hubs, state/district landing pages, and Google/AI rich snippets.

### Critical Pitfalls to Avoid
- Physical print margin drift: Prevented by strict CSS physical dimensions (`@page { size: 85.6mm 53.98mm; margin: 0; }`) and vector PDF export.
- Serverless DB connection exhaustion: Prevented by global Mongoose connection caching.
- Vendor key leakage: Prevented by confining all API requests strictly to server-only Server Actions / Route Handlers.
- Wallet race conditions: Prevented by atomic MongoDB conditional updates (`$inc` with `$gte`).

## Roadmap Implications & Suggested Phases

1. **Phase 1: Project Foundation & Architecture Setup** — Next.js 15 App Router initialization in workspace root, MongoDB connection caching, design system tokens, layout, and authentication.
2. **Phase 2: Preformatted Card Rendering Engine** — High-DPI CR80 vector card canvas components for all 5 document types (PAN, Aadhaar, Voter, DL, RC) with print media stylesheets and PDF exporter.
3. **Phase 3: Interactive Split-Screen Studio & Missing Field Editor** — Two-way data binding studio, missing field detection, real-time live synchronization, and manual entry forms.
4. **Phase 4: Multi-Provider Verification & Fallback APIs** — Server Actions connecting to third-party APIs (NeoAPI, AxenAPI, FastNexora) with error handling and partial-data parsing.
5. **Phase 5: Wallet & Transaction Ledger** — MongoDB wallet schemas, atomic deductions, top-up interface, and transaction audit logs.
6. **Phase 6: SEO, GEO & AEO Engine** — SSR public landing pages, programmatic regional state/district routes, and JSON-LD schema integration for search and AI engine rankings.
7. **Phase 7: Production Hardening & Vercel Deployment** — Security audits, environment variable configuration, performance optimizations, and Vercel edge deployment.

---
*Research summary: 2026-09-28*
