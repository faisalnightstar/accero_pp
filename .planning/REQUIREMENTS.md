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

### Exact Official PAN Card Engine (PAN)

- [x] **PAN-01**: Asset preparation pipeline extracting high-res NSDL and UTIITSL front, back, and full sheet templates into `public/assets/pan/`.
- [x] **PAN-02**: Extended `PanCardData` schema supporting `templateVariant?: 'nsdl' | 'utiitsl'`, `gender`, and `layoutFormat?: 'cr80' | 'sheet'`.
- [x] **PAN-03**: Pixel-perfect `PanCardCanvas.tsx` matching legacy `pan.php` / `pan2.php` micro-coordinates with percentage responsiveness and crisp typography.
- [x] **PAN-04**: Dynamic official XML QR barcode generator (`<PrintLetterBarcodeData uid="..." name="..." dob="..." .../>`).
- [x] **PAN-05**: Interactive Split-Screen Studio integration: live switching between NSDL and UTIITSL variants, foldable sheet vs CR80 tray modes, with real-time form two-way sync and 1-click PDF/PNG downloads.

### PVC Tray Print Engine Zero-Drift Isolation (PRINT)

- [x] **PRINT-01**: Card Studio & Gallery print isolation: hiding entire editor form, search bar, header, and action controls so only the physical card tray prints.
- [x] **PRINT-02**: Zero-margin CR80 Tray page break fix: Page 1 = Front (85.60 mm × 53.98 mm), Page 2 = Back (85.60 mm × 53.98 mm), strictly eliminating trailing blank Page 3.
- [x] **PRINT-03**: Named paged media support for side-by-side foldable sheet printing (171.2 mm × 53.98 mm) without horizontal clipping.

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
| PAN-01 | Phase 8 | Complete |
| PAN-02 | Phase 8 | Complete |
| PAN-03 | Phase 8 | Complete |
| PAN-04 | Phase 8 | Complete |
| PAN-05 | Phase 8 | Complete |
| PRINT-01 | Phase 8.1 | Complete |
| PRINT-02 | Phase 8.1 | Complete |
| PRINT-03 | Phase 8.1 | Complete |

**Coverage:**
- Active requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements updated: 2026-10-13 for Phase 8.1 PVC Tray Print Engine Zero-Drift Isolation*
