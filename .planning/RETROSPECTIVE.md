# Project Retrospective: PrintPortal Next.js

## Milestone: v1.0 — PrintPortal Next.js MVP

**Shipped:** 2026-09-28
**Phases:** 6 | **Plans:** 15 | **Tasks:** 38

### What Was Built
- Full-stack Next.js 15 App Router modernization from brownfield PHP.
- ISO/IEC 7810 ID-1 standard (85.60 mm × 53.98 mm) vector canvas renderers for PAN, Aadhaar, Voter, DL, and Vehicle RC.
- Interactive split-screen Studio with live two-way reactive data binding, automated missing-field flags, and manual entry mode.
- Server-side multi-provider verification pipeline with partial-payload recovery.
- Atomic MongoDB wallet ledger with conditional deductions (`$gte`) and 100% free lifetime re-printing.
- Programmatic regional GEO search engine with 725 state/district combinations, dual AEO answer blocks, schema.org JSON-LD, robots.txt, and 732-URL sitemap.xml.

### What Worked
- **Strict Verification Cycles:** Plan-level and phase-level verification with `npx tsc --noEmit` and production build validation prevented regressions early.
- **Client/Server Decoupling:** Isolating wallet constants from server Mongoose models (`src/lib/wallet/constants.ts`) resolved browser bundle issues cleanly.
- **Vector Canvas Fidelity:** CSS `@page` print rules combined with precise absolute coordinates ensure zero-drift tray alignment across desktop PVC card printers.

### What Was Inefficient
- Legacy brownfield PHP code contained fragmented API credentials and procedural logic that required careful reverse engineering.
- Type mismatch in driving license vehicle class required defensive `Array.isArray` check in `DlCardCanvas.tsx`.

### Patterns Established
- Client component boundaries around interactive elements (`HeroCardPreview.tsx`, `HeroLookupForm.tsx`, `StudioSearchBar.tsx`) preserving Server Component SSR benefits.
- Dual AEO strategy: 40-50 word direct on-page answer callouts paired with deep Schema.org JSON-LD scripts (`SoftwareApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`).
