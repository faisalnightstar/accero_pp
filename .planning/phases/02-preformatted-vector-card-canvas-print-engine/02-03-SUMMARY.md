---
phase: 02-preformatted-vector-card-canvas-print-engine
plan: 03
subsystem: ui-cards
tags: [aadhaar, dl, rc, jspdf, html2canvas, pdf-export, high-dpi]

# Dependency graph
requires: [02-01, 02-02]
provides:
  - AadhaarCardCanvas (Front & Back) with UIDAI tricolor motif and XML QR code
  - DlCardCanvas (Front & Back) with smart chip graphic and vehicle class badges
  - RcCardCanvas (Front & Back) with Form 23 Certificate of Registration layout
  - 1-click high-DPI PDF (85.6mm × 53.98mm landscape) and PNG export utility (cardExport.ts)
  - Complete 5-document card showcase with export action bar at /cards
affects: [phase-3, phase-4]

# Tech tracking
tech-stack:
  added: []
  patterns: [Client-side jsPDF custom dimensions, html2canvas 300+ DPI rasterization, Full 5-card vector renderers]

key-files:
  created:
    - src/components/cards/AadhaarCardCanvas.tsx
    - src/components/cards/DlCardCanvas.tsx
    - src/components/cards/RcCardCanvas.tsx
    - src/lib/cardExport.ts
  modified:
    - src/types/cards.ts
    - src/app/cards/page.tsx

key-decisions:
  - "Configured pure client-side PDF generation using jsPDF with exact [85.60, 53.98] mm dimensions and FAST compression"
  - "Added 1-click PNG exports for individual Front/Back sides alongside 2-page landscape print-ready PDF"
  - "Populated all 5 document tabs with realistic Indian demographic test data (including sample data from pdf.html)"

patterns-established:
  - "cardExport.ts provides reusable captureCardCanvas, exportCardAsPdf, and exportCardAsPng for subsequent Studio integration in Phase 3"
---

# Plan 02-03 Summary: Aadhaar, DL, Vehicle RC & 1-Click High-DPI PDF/PNG Export

Delivered the remaining vector card canvases for Aadhaar Card, Driving License (DL), and Vehicle Registration Certificate (RC), and implemented the 1-click high-DPI PDF and PNG export utility.

## What was built
- **Aadhaar Card Canvas (`src/components/cards/AadhaarCardCanvas.tsx`)**:
  - Front: UIDAI tricolor motif, Government of India header, Ashoka Lions, photo frame, bilingual demographic details (Devanagari + English), 12-digit grouped Aadhaar number, and "मेरा आधार, मेरी पहचान" tagline.
  - Back: Bilingual address, C/O info, high-density UIDAI XML QR code (`<PrintLetterBarcodeData ... />`), and 1947 helpline.
- **Driving License Canvas (`src/components/cards/DlCardCanvas.tsx`)**:
  - Front: Union of India / State Transport Department, gold smart chip graphic, DL number, issue/validity dates, photo, signature, address, and authorized vehicle class pills (MCWG, LMV).
  - Back: Vehicle category endorsement grid, issuing authority seal, and Parivahan QR code.
- **Vehicle RC Canvas (`src/components/cards/RcCardCanvas.tsx`)**:
  - Front: Form 23 Certificate of Registration, prominent Registration Number pill (`UP05LD1234`), chassis number, engine number, owner details, maker/model, address.
  - Back: Fuel type, emission norms (BS VI), seating, weight, financier hypothecation, fitness validity, and Parivahan QR code.
- **1-Click High-DPI Export Engine (`src/lib/cardExport.ts`)**:
  - Client-side 300+ DPI rasterization using `html2canvas` and `jsPDF`.
  - Downloads 2-page landscape PDF (Page 1 Front, Page 2 Back) locked to 85.60 mm × 53.98 mm.
  - Downloads individual Front and Back PNG images.
- **Complete 5-Card Showcase (`src/app/cards/page.tsx`)**:
  - 5-tab navigation: PAN, Aadhaar, Voter ID, Driving License, Vehicle RC.
  - Action bar with direct PVC tray print, 300 DPI PDF download, Front/Back PNG download, zoom, flip view, and 3mm safety margins.

## Verification
- `npm run build` compiled all 11 routes cleanly with zero TypeScript errors or ESLint warnings.
- Verified all 5 document tabs, dynamic QR codes, bilingual text, and export utilities.
