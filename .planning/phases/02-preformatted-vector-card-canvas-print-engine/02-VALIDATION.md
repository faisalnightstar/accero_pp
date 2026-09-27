# Phase 2: Preformatted Vector Card Canvas & Print Engine - Validation

**Phase:** 02-preformatted-vector-card-canvas-print-engine
**Domain:** CR80 Vector Card Canvas & Print Engine Verification
**Date:** 2026-09-28
**Status:** READY

---

## 1. Validation Criteria Matrix

| Req ID | Description | Validation Method | Success Threshold |
|---|---|---|---|
| **CARD-01** | PAN Card vector canvas (Front & Back) | Visual component inspection + DOM layout | Ashoka Lions, Income tax header, photo, signature, father name, and QR rendered in exact positions |
| **CARD-02** | Aadhaar Card vector canvas (Front & Back) | Visual component inspection + Devanagari text | UIDAI tricolor motif, regional font rendering, demographic details, UIDAI standard QR |
| **CARD-03** | Voter ID / EPIC vector canvas | Visual component inspection + bilingual data | ECI banner, portrait photo, EPIC number, AC and Part details, regional + English addresses |
| **CARD-04** | Driving License (DL) vector canvas | Visual component inspection + vehicle badges | Smart chip overlay, DL number, validity, vehicle class authorizations (MCWG, LMV), signature |
| **CARD-05** | Vehicle Registration Certificate (RC) vector canvas | Visual component inspection + sample data from `pdf.html` | Registration number, chassis, engine, fuel type, owner details, vehicle specs |
| **CARD-06** | Physical print scaling (CR80) | Browser Print Preview (`window.print()`) | Exact 85.60 mm × 53.98 mm `@page` dimensions, zero page overflow, zero margin clipping |
| **CARD-07** | 1-Click High-DPI PDF & PNG export | Functional test in browser | Downloads 2-page landscape PDF (85.6mm × 53.98mm) and high-res PNGs with sharp vector text |

---

## 2. Automated & Compile-Time Checks

- **TypeScript Compilation:**
  ```bash
  npm run build
  ```
  Must compile with zero TypeScript errors under strict mode (`strict: true`). All card component prop interfaces (`PanCardData`, `AadhaarCardData`, `VoterCardData`, `DlCardData`, `RcCardData`) must be fully typed without `any`.
- **Linting:**
  ```bash
  npm run lint
  ```
  Must pass Next.js ESLint rules cleanly.

---

## 3. Visual & Print Verification Procedures

1. **Card Aspect Ratio & Sizing:**
   - Verify the `.cr80-card-page` container evaluates to exactly 85.60 mm width by 53.98 mm height (3.18mm border radius).
2. **Dynamic QR Code Generation:**
   - Verify QR codes for PAN, Aadhaar, and Voter cards generate on-the-fly and scan properly using a smartphone QR scanner.
3. **Print Media Stylesheet:**
   - In browser print preview (`Ctrl+P` / `Cmd+P`), confirm:
     - Navigation, sidebar, action buttons, and background chrome are hidden (`display: none`).
     - Front card prints on Page 1; Back card prints on Page 2 (or side-by-side depending on chosen print mode).
     - Margin is locked to 0 mm; scale is 100%.
4. **PDF & PNG Export:**
   - Click "Download Print-Ready PDF" and open the generated file in Adobe Acrobat or browser PDF viewer to verify crisp vector rendering and exact ID-1 paper dimensions.
   - Click "Download PNG" to verify high-resolution front/back PNG images.
