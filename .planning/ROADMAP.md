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

---
*Roadmap updated: 2026-09-29 for milestone v1.1*
