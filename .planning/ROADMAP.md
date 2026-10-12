# Roadmap: PrintPortal Next.js

## Milestones

- ✅ **v1.0 PrintPortal Next.js MVP** — Phases 1-6 (shipped 2026-09-28)
- 🚧 **v1.1 Exact Official Vehicle RC Smart Card Engine** — Phase 7 (in progress)

## Archived Milestones

<details>
<summary>✅ v1.0 PrintPortal Next.js MVP (Phases 1-6) — SHIPPED 2026-09-28</summary>

Full phase plans and archived roadmap details: [.planning/milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

- [x] Phase 1: Foundation & Architecture Setup (3/3 plans) — completed 2026-09-27
- [x] Phase 2: Preformatted Vector Card Canvas & Print Engine (3/3 plans) — completed 2026-09-27
- [x] Phase 3: Interactive Split-Screen Studio & Missing Field Editor (3/3 plans) — completed 2026-09-28
- [x] Phase 4: Multi-Provider Verification & Fallback APIs (2/2 plans) — completed 2026-09-28
- [x] Phase 5: Wallet & Credits Management (2/2 plans) — completed 2026-09-28
- [x] Phase 6: Full SEO, GEO & AEO Search Engine (2/2 plans) — completed 2026-09-28

</details>

## Current Milestone: v1.1 Exact Official Vehicle RC Smart Card Engine

### Phase 7: Exact Official Vehicle RC Smart Card Engine
**Goal**: Deliver a 100% pixel-perfect replica of the official Indian Union Vehicle Registration Certificate (Form 23A) smart card matching exact colors, typography, emblems, badge pills, chip with pointer, dense QR code, and front/back field placement.
**Depends on**: Phase 2, Phase 3
**Requirements**: RC-01, RC-02, RC-03, RC-04, RC-05
**Success Criteria** (what must be TRUE):
  1. Front canvas renders exact subtle cyan/sky blue gradient, Ashoka Lion emblem with curved crest, NT and state badges, contact chip with blue arrow pointer, 6-row label/value hierarchy, left fuel/emission text, and rotated card issue date.
  2. Back canvas renders NT/State badges, Vehicle Class header, left column with registration number, dense QR code, mfg date, cylinder count, right column with all 11 technical specs, financier, registration authority, and rotated Form 23A label.
  3. Interactive Split-Screen Studio provides responsive form inputs for all Form 23A vehicle attributes with real-time two-way synchronization.
  4. Physical print preview and 1-click PDF/PNG downloads lock strictly to ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm) with zero drift on PVC printer trays.

Plans:
- [x] 07-01: Data schema extension (`RcCardData`) and pixel-perfect front and back vector canvas components (`RcCardCanvas.tsx`).
- [x] 07-02: Studio form integration, sample data update, and print/PDF export verification.

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Milestone | Plans Complete | Status | Completed |
|---|---|:---:|:---:|:---:|
| 1. Foundation & Architecture Setup | v1.0 | 3/3 | Complete | 2026-09-27 |
| 2. Preformatted Vector Card Canvas & Print Engine | v1.0 | 3/3 | Complete | 2026-09-27 |
| 3. Interactive Split-Screen Studio & Missing Field Editor | v1.0 | 3/3 | Complete | 2026-09-28 |
| 4. Multi-Provider Verification & Fallback APIs | v1.0 | 2/2 | Complete | 2026-09-28 |
| 5. Wallet & Credits Management | v1.0 | 2/2 | Complete | 2026-09-28 |
| 6. Full SEO, GEO & AEO Search Engine | v1.0 | 2/2 | Complete | 2026-09-28 |
| 7. Exact Official Vehicle RC Smart Card Engine | v1.1 | 2/2 | Complete | 2026-09-29 |
| 8. Exact Official PAN Card Engine | v1.2 | 2/2 | Complete   | 2026-10-12 |
| 8.1. PVC Tray Print Engine Zero-Drift Isolation | v1.2 | 1/1 | Complete   | 2026-10-13 |

---

## Milestone: v1.2 Exact Official PAN Card Engine

### Phase 8: Exact Official PAN Card Engine
**Goal:** Deliver a 100% pixel-perfect replica of the official Income Tax Department PAN Card matching legacy `printportal/admin/aadhar/pan.php`, supporting both NSDL (`bpana.jpg`) and UTIITSL (`1panaa.jpg`) authentic background templates, micro-coordinate text & asset placement, dynamic photo & signature overlays, official high-density UIDAI/ITD XML QR code, security hologram, and seamless CR80 dual-side / side-by-side foldable print layouts.
**Depends on:** Phase 2, Phase 3, Phase 7
**Requirements**: PAN-01, PAN-02, PAN-03, PAN-04, PAN-05
**Success Criteria** (what must be TRUE):
  1. Front canvas accurately aligns photo (60x60px / 15% width), PAN number, applicant name, father's name, DOB, and signature at the exact micro-coordinates defined in legacy `printportal/admin/aadhar/pan.php`.
  2. Supports both official NSDL (`bpana.jpg`) and UTIITSL (`1panaa.jpg`) authentic background templates with high-fidelity asset rendering, guilloche security patterns, and Mahatma Gandhi watermark.
  3. Back canvas faithfully renders the official Income Tax Department / NSDL / UTIITSL return instructions, contact details, helpline, and security hologram badge.
  4. Generates standard scannable QR code formatted to official XML string (`<PrintLetterBarcodeData uid="..." name="..." dob="..." .../>`).
  5. Dual-mode print & display support: standard ISO/IEC 7810 ID-1 (85.60 mm × 53.98 mm) individual front/back tray mode AND legacy side-by-side foldable cutout sheet mode with central fold guide.
  6. Interactive Split-Screen Studio provides real-time template switching (NSDL vs UTIITSL), print mode toggling (CR80 vs Side-by-Side Sheet), and instant 2-way synchronized form editing.

Plans:
- [x] 08-01: Asset extraction pipeline and pixel-perfect `PanCardCanvas.tsx` implementation supporting NSDL/UTIITSL variants and CR80/Sheet modes.
- [x] 08-02: Studio form integration, template & layout mode selectors, XML QR code formatting, sample data update, and print/PDF export verification.

---

### Phase 8.1: PVC Tray Print Engine Zero-Drift Isolation
**Goal:** Fix "Print PVC Tray" in Card Studio and Gallery so browser print spoolers output strictly the isolated CR80 PVC card trays (Page 1 = Front, Page 2 = Back; 85.60 mm × 53.98 mm) or side-by-side sheet (171.2 mm × 53.98 mm) with zero drift, zero UI leakage (no form inputs, search bar, dropzones, headers, or banners), and zero blank trailing pages.
**Depends on:** Phase 2, Phase 3, Phase 8
**Requirements**: PRINT-01, PRINT-02, PRINT-03
**Success Criteria** (what must be TRUE):
  1. Clicking "Print PVC Tray" in Studio or Cards Gallery prints ONLY the physical card canvas, hiding the entire left editor form, search bar, header, and all action buttons.
  2. Output in CR80 Tray mode is exactly 2 pages: Page 1 Front (85.60 mm × 53.98 mm), Page 2 Back (85.60 mm × 53.98 mm), with zero 3rd blank trailing page.
  3. Output in Side-by-Side Sheet mode prints a single isolated 171.2 mm × 53.98 mm card sheet without being clipped by CR80 tray dimensions.
  4. Global print CSS completely eliminates outer padding, margins, flexbox gaps, and CSS grid constraints from `body`, `main`, and studio layout containers during print spooling.

Plans:
- [x] 08.1-01: Studio and Gallery print isolation, CSS grid/flex resets, last-card page-break fix, and multi-mode print verification.

---
*Roadmap updated: 2026-10-13 for milestone v1.2*
