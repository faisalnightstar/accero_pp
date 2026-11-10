---
phase: 02-preformatted-vector-card-canvas-print-engine
plan: 02
subsystem: ui-cards
tags: [pan-card, voter-card, epic, typography, devanagari, emblems]

# Dependency graph
requires: [02-01]
provides:
  - TypeScript interfaces for PanCardData and VoterCardData
  - Vector SVG Emblems (Ashoka Lions, ECI crest, gold chip, guilloche waves)
  - Pixel-perfect PanCardCanvas (Front & Back) with official Income Tax header and QR code
  - Pixel-perfect VoterCardCanvas (Front & Back) with bilingual Devanagari/Hindi typography
  - Integrated PAN and Voter ID tabs in /cards showcase
affects: [02-03, phase-3]

# Tech tracking
tech-stack:
  added: []
  patterns: [Bilingual Devanagari typography, Vector SVG Emblems, CR80 Security Overlays]

key-files:
  created:
    - src/types/cards.ts
    - src/components/cards/Emblems.tsx
    - src/components/cards/PanCardCanvas.tsx
    - src/components/cards/VoterCardCanvas.tsx
  modified:
    - src/app/cards/page.tsx

key-decisions:
  - "Constructed vector SVG Lion Capital of Ashoka and ECI crests rather than raster images to ensure infinite crispness on 300+ DPI card printers"
  - "Configured bilingual field layout for Voter ID (Hindi + English) with automatic fallback handling"
  - "Implemented simulated Code 128 barcode and NSDL return instructions on PAN card back"

patterns-established:
  - "Cards take typed data props and side: 'front' | 'back' to render modularly for both screen review and dual-page printer spools"
---

# Plan 02-02 Summary: PAN and Voter ID Vector Card Canvases

Delivered production-grade vector card canvas renderers for PAN Card and Voter ID (EPIC), including front and back sides, official header typography, bilingual regional language rendering (Devanagari/Hindi), security background patterns, photo and signature frames, and dynamic QR code verification blocks.

## What was built
- **Card Data Interfaces (`src/types/cards.ts`)**: Strict TypeScript types for `PanCardData`, `VoterCardData`, `AadhaarCardData`, `DlCardData`, and `RcCardData`.
- **Vector Emblems (`src/components/cards/Emblems.tsx`)**: High-definition vector SVGs for the Lion Capital of Ashoka ("सत्यमेव जयते"), Election Commission of India (ECI) crest, gold smart card microchip, and security guilloche wave patterns.
- **PAN Card Canvas (`src/components/cards/PanCardCanvas.tsx`)**:
  - Front: Income Tax Department heading, Ashoka Lions emblem, photo frame, signature strip, father name, DOB, Permanent Account Number, dynamic verification QR.
  - Back: Official NSDL return guidelines, Code 128 barcode, Income Tax toll-free helplines.
- **Voter ID Canvas (`src/components/cards/VoterCardCanvas.tsx`)**:
  - Front: ECI banner, Ashoka Lions & hologram cues, large EPIC number (`ABC0123456`), bilingual elector name (Devanagari + English), relation name, gender, age/DOB.
  - Back: Assembly Constituency No & Name, Part No & Name, full address, Electoral Registration Officer signature seal, and dynamic QR code.
- **Showcase Integration (`src/app/cards/page.tsx`)**: Tabbed interface previewing PAN and Voter ID cards with real sample data, zoom controls, flip view, and print simulation.

## Verification
- `npm run build` compiled all 11 routes cleanly with zero TypeScript errors or ESLint warnings.
- Verified PAN and Voter ID front/back rendering with dynamic QR codes and Devanagari text.
