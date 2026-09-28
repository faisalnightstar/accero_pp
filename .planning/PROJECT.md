# PrintPortal Next.js (Document Print & Verification Gateway)

## What This Is

PrintPortal Next.js is a high-performance web portal built with Next.js (App Router) and MongoDB, engineered for deployment on Vercel. It enables users to quickly format and print official-standard preformatted PVC cards (PAN, Aadhaar, Voter ID, Driving License, and Vehicle RC) via automatic card number lookup or manual data entry. It provides a real-time split-screen interactive editor that flags missing fields returned by external APIs, allowing users to update and complete the data before rendering and printing pixel-perfect cards.

## Core Value

Effortless, pixel-perfect card printing with zero missing-data failures — allowing users to seamlessly review, edit, and fill missing fields in real-time on preformatted card canvases.

## Requirements

### Validated

- ✓ Manual and API lookup for PAN, Aadhaar, Voter ID, Driving License, and Vehicle RC — legacy PHP implementation
- ✓ Preformatted card templates with regional language font support — legacy templates
- ✓ Wallet and per-service credit balance deduction — legacy MySQL ledger
- ✓ Next.js 15+ App Router full-stack architecture with React 19, TypeScript, and clean modular UI — v1.0
- ✓ MongoDB with Mongoose document modeling for flexible document storage and user wallet ledgers — v1.0
- ✓ Split-screen live preview card editor: form on left with missing-field detection & highlights, real-time updated preformatted card canvas on right — v1.0
- ✓ Preformatted printable cards for all 5 document types: PAN card, Aadhaar card, Voter EPIC card, Driving License (DL), and Vehicle Registration Certificate (RC) — v1.0
- ✓ High-DPI physical card export: CSS print stylesheets (`@page 85.6mm 53.98mm`) and high-resolution PDF/image generation matching standard CR80 PVC dimensions — v1.0
- ✓ Resilient multi-provider API integrations with graceful fallbacks on partial data or timeout — v1.0
- ✓ Wallet & credits management: user authentication, balance dashboard, top-up/recharge flow, and audit trail — v1.0
- ✓ Full SEO, GEO, and AEO suite: SSR public landing pages, programmatic regional state/district pages (GEO), and JSON-LD structured schemas (`FAQPage`, `HowTo`, `SoftwareApplication`) for high search & AI engine visibility — v1.0

### Active (v1.1 - Exact Official Vehicle RC Smart Card Engine)

- [ ] Pixel-perfect Front Canvas matching official Indian Union Vehicle Registration Certificate (subtle cyan/sky gradient background, Ashoka Lion emblem crest, NT/state badge pills, contact chip with arrow pointer, exact 6-row label/value hierarchy, left fuel/emission specs, rotated card issue date on right edge).
- [ ] Pixel-perfect Back Canvas matching official Form 23A layout (NT/state badge pills, Vehicle Class header, left column with registration number, dense square QR code, mfg date, cylinders count; right column with maker, model, color/body type, seating, weight, cubic capacity/BHP/wheelbase, financier, registration authority, rotated Form 23A label).
- [ ] Extended `RcCardData` schema and validation to seamlessly support all detailed Form 23A vehicle parameters with smart defaults and regional state/transport-type derivation.
- [ ] Studio editor and sample data update for Vehicle RC to expose the complete Form 23A specifications with missing-field assistance.
- [ ] Zero-drift print preview and high-DPI export verification matching standard ISO 7810 CR80 physical tray alignment.

### Future (v1.2+)

- [ ] Automated Optical Character Recognition (OCR) to extract card data directly from uploaded photo scans
- [ ] Multi-language UI toggle (Hindi, Bengali, Marathi, Tamil, Telugu, Gujarati) across the entire portal interface
- [ ] Automated dynamic UPI QR payment gateway integration for automated instant wallet balance top-ups
- [ ] Bulk batch card printing: CSV upload generating multi-page card print sheets for institutional operators

### Out of Scope

- Physical card postal delivery — Portal produces print-ready digital outputs (PDF, high-res SVG, direct browser print) for users with PVC printers; physical shipping is out of scope.
- Government issuing authority impersonation — Portal acts strictly as a formatting and reprint tool for legally held documents.
- Mobile native application (iOS/Android) — Responsive web application (PWA-ready) meets all mobile and desktop requirements.

## Context

- Successfully migrated and modernized from legacy brownfield PHP codebase (`printportal/`) to Next.js 15 App Router.
- Current codebase status: 15 plans across 6 phases fully implemented and tested.
- Modernized color palette active: Deep Burgundy (`#8B1E2D`), Crimson Red (`#E63946`), Warm Gold (`#F4D35E`), Steel Blue (`#457B9D`), and Dark Navy (`#1D3557`).
- Security architecture: All server credentials, third-party API keys, and JWT secrets isolated strictly to server-only runtime environment variables.

## Constraints

- **Tech Stack**: Next.js App Router (TypeScript), MongoDB (Mongoose), Vanilla CSS / Tailwind for custom design system, deployed on Vercel.
- **Card Precision**: Output must conform to ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm) for seamless physical card tray printing.
- **API Reliability**: External government lookup endpoints are prone to latency and intermittent downtimes; system must never block or crash on partial data.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router + Vercel | Maximizes SEO indexing, Edge performance, and modern React 19 server components | ✓ Good |
| MongoDB for Document Storage | Schemaless flexibility accommodates varying document payloads and custom user edits | ✓ Good |
| Split-Screen Live Preview | Immediate visual feedback when completing missing API fields before printing | ✓ Good |
| Wallet & Credits Billing | Familiar business model for cyber café / CSC operators printing multiple cards daily | ✓ Good |
| Full SEO + GEO + AEO Suite | Programmatic regional pages and JSON-LD schemas capture high-intent local search queries | ✓ Good |
| Decoupled Wallet Constants | Separate client-safe pricing constants from server mongoose models to prevent Webpack bundling errors | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-29 after v1.0 milestone*
