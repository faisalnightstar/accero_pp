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

### Active

- [ ] Next.js 15+ App Router full-stack architecture with React 19, TypeScript, and clean modular UI
- [ ] MongoDB with Mongoose document modeling for flexible document storage and user wallet ledgers
- [ ] Split-screen live preview card editor: form on left with missing-field detection & highlights, real-time updated preformatted card canvas on right
- [ ] Preformatted printable cards for all 5 document types: PAN card, Aadhaar card, Voter EPIC card, Driving License (DL), and Vehicle Registration Certificate (RC)
- [ ] High-DPI physical card export: CSS print stylesheets (`@page 85.6mm 53.98mm`) and high-resolution PDF/image generation matching standard CR80 PVC dimensions
- [ ] Resilient multi-provider API integrations (NeoAPI, AxenAPI, FastNexora) with graceful fallbacks on partial data or timeout
- [ ] Wallet & credits management: user authentication, balance dashboard, top-up/recharge flow, and audit trail
- [ ] Full SEO, GEO, and AEO suite: SSR public landing pages, programmatic regional state/district pages (GEO), and JSON-LD structured schemas (`FAQPage`, `HowTo`, `SoftwareApplication`) for high search & AI engine visibility
- [ ] Production Vercel deployment with Edge caching, robust security headers, and sanitized environment variables

### Out of Scope

- Physical card postal delivery — Portal produces print-ready digital outputs (PDF, high-res SVG, direct browser print) for users with PVC printers; physical shipping is out of scope.
- Government issuing authority impersonation — Portal acts strictly as a formatting and reprint tool for legally held documents.
- Mobile native application (iOS/Android) — Responsive web application (PWA-ready) meets all mobile and desktop requirements.

## Context

- Migrating from a legacy brownfield PHP codebase (`printportal/`) with 50+ MySQL tables and procedural page controllers.
- Legacy system experienced frequent issues with incomplete API responses rendering broken cards; the Next.js portal prioritizes an interactive split-screen editing gateway to solve this.
- Modernized color palette adopted from legacy design specification (`printportal/design.md`): Deep Burgundy (`#8B1E2D`), Crimson Red (`#E63946`), Warm Gold (`#F4D35E`), Steel Blue (`#457B9D`), and Dark Navy (`#1D3557`).
- Security enhancement: All hardcoded credentials and API keys in legacy code will be migrated exclusively to Vercel/serverless environment variables.

## Constraints

- **Tech Stack**: Next.js App Router (TypeScript), MongoDB (Mongoose), Vanilla CSS / Tailwind for custom design system, deployed on Vercel.
- **Card Precision**: Output must conform to ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm) for seamless physical card tray printing.
- **API Reliability**: External government lookup endpoints are prone to latency and intermittent downtimes; system must never block or crash on partial data.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router + Vercel | Maximizes SEO indexing, Edge performance, and modern React 19 server components | — Pending |
| MongoDB for Document Storage | Schemaless flexibility accommodates varying document payloads and custom user edits | — Pending |
| Split-Screen Live Preview | Immediate visual feedback when completing missing API fields before printing | — Pending |
| Wallet & Credits Billing | Familiar business model for cyber café / CSC operators printing multiple cards daily | — Pending |
| Full SEO + GEO + AEO Suite | Programmatic regional pages and JSON-LD schemas capture high-intent local search queries | — Pending |

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
*Last updated: 2026-09-28 after initialization*
