---
phase: 02-preformatted-vector-card-canvas-print-engine
plan: 01
subsystem: ui-cards
tags: [cr80, qrcode, print-engine, canvas, vector, iso-7810]

# Dependency graph
requires: [phase-1]
provides:
  - Base CR80 ISO/IEC 7810 ID-1 card container with physical 85.60 mm × 53.98 mm scaling
  - Pure client-side dynamic QR code component with 2x vector density
  - Zero-margin @page print stylesheet locking printer trays to CR80 dimensions
  - Interactive preview showcase at /cards with zoom, flip, and print controls
affects: [02-02, 02-03, phase-3]

# Tech tracking
tech-stack:
  added: [qrcode, jspdf, html2canvas, "@types/qrcode"]
  patterns: [ISO-7810 CR80 Card Geometry, Exact @page 85.6mm 53.98mm print scaling, Client-side QR generation]

key-files:
  created:
    - src/components/cards/CardQrCode.tsx
    - src/components/cards/Cr80CardContainer.tsx
    - src/components/cards/PrintControls.tsx
    - src/app/cards/page.tsx
  modified:
    - package.json
    - src/app/globals.css

key-decisions:
  - "Configured root @page { size: 85.6mm 53.98mm; margin: 0; } with -webkit-print-color-adjust: exact to prevent printer tray clipping"
  - "Built client-side QRCode generation via qrcode.toDataURL with 2x resolution density to avoid third-party API dependencies"
  - "Implemented dual view modes in Cr80CardContainer: side-by-side inspection and 3D flippable card with 3mm inner safe-zone guides"

patterns-established:
  - "All printable cards wrap in Cr80CardContainer with separate screen and print:block DOM nodes"
  - "Print media stylesheet automatically hides .no-print elements and maps front/back to distinct pages with page-break-after: always"
---

# Plan 02-01 Summary: CR80 Card Container, QR Generator & Print Engine

Constructed the base CR80 ISO/IEC 7810 ID-1 card container, integrated client-side dynamic QR code generation, configured strict zero-margin `@page` print media stylesheets, and created an interactive showcase workspace at `/cards`.

## What was built
- **Core Card Dependencies**: Installed `qrcode`, `jspdf`, `html2canvas`, and `@types/qrcode`.
- **CR80 Base Container (`Cr80CardContainer.tsx`)**: Enforces exact physical dimensions (85.60 mm × 53.98 mm, 3.18mm border radius) with adjustable zoom (100% actual, 125%, 150%, 200%), Front/Back flip toggle, side-by-side mode, and 3mm inner safe print guides.
- **Dynamic QR Generator (`CardQrCode.tsx`)**: Vector 2x density QR code generator using pure client-side `qrcode` with transparent background support and error-correction levels.
- **Print Controls Bar (`PrintControls.tsx`)**: Operator action bar with zoom steps, flip toggle, safety margin toggles, and direct PVC printer tray print triggering.
- **Card Showcase Workspace (`src/app/cards/page.tsx`)**: Full interactive preview environment rendering sample cards, inspection controls, and print previews.
- **Print Stylesheet Optimization**: Enhanced `src/app/globals.css` with exact `@page` rules and `.cr80-print-tray` print media directives.

## Verification
- `npm run build` compiled all 11 routes cleanly with zero TypeScript errors or ESLint warnings.
- Verified `/cards` route generates as static page and loads in browser.
