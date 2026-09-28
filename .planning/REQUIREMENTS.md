# Requirements: PrintPortal Next.js (Milestone v1.1)

**Milestone:** v1.1 - Exact Official Vehicle RC Smart Card Engine
**Defined:** 2026-09-29
**Core Value:** Pixel-perfect reproduction of official Indian Union Vehicle Registration Certificate (Form 23A) smart cards matching colors, typography, emblems, badges, chip with pointer, QR code, and exact field layout.

## v1.1 Requirements

### Vehicle RC Smart Card Engine (RC)

- [x] **RC-01**: Extended `RcCardData` schema supporting all Form 23A vehicle parameters (state issued, state code badge, transport type badge, owner serial, registration validity, card issue date, maker, model, body type, cubic capacity, BHP, wheelbase, manufacturing date, cylinder count, financier, and registering authority) with smart auto-derivation.
- [x] **RC-02**: Exact official Front Canvas layout: subtle sky-blue/cyan gradient background, Ashoka Lion emblem with curved blue crest, dual NT/State circular badge pills, smart card chip with directional arrow pointer (`◀`), 6-row label/value hierarchy, left-side fuel & emission norms, and rotated right-edge card issue date.
- [x] **RC-03**: Exact official Back Canvas layout (Form 23A): top NT/State circular badges with Vehicle Class header, left column with registration number, dense square QR code, manufacturing date, and cylinder count; right column with maker, model, color, body type, seating capacity, unladen weight, cubic cap / BHP / wheelbase, financier, registration authority, and rotated right-edge Form 23A label.
- [x] **RC-04**: Interactive Split-Screen Studio integration: comprehensive form fields for all Form 23A parameters with real-time two-way canvas synchronization, missing-field assistance, and updated realistic sample data.
- [x] **RC-05**: High-precision physical print and export verification: seamless ISO/IEC 7810 ID-1 dimensions (85.60 mm × 53.98 mm) print styling and high-DPI PDF/PNG export.

## Future Requirements (v1.2+)

- **ENH-01**: Automated Optical Character Recognition (OCR) to extract card data directly from uploaded photo scans.
- **ENH-02**: Multi-language UI toggle (Hindi, Bengali, Marathi, Tamil, Telugu, Gujarati) across the entire portal interface.
- **ENH-03**: Automated dynamic UPI QR payment gateway integration for automated instant wallet balance top-ups.
- **ENH-04**: Bulk batch card printing: CSV upload generating multi-page card print sheets for institutional operators.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Physical Card Printing & Courier Shipping | Portal focuses on high-precision digital formatting and print-ready files for local card printers. |
| Government Issuing Authority Impersonation | PrintPortal is strictly a document formatting utility; does not manufacture or issue statutory credentials. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| RC-01 | Phase 7 | Complete |
| RC-02 | Phase 7 | Complete |
| RC-03 | Phase 7 | Complete |
| RC-04 | Phase 7 | Complete |
| RC-05 | Phase 7 | Complete |

**Coverage:**
- v1.1 requirements: 5 total
- Mapped to phases: 5
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-29 for milestone v1.1*
