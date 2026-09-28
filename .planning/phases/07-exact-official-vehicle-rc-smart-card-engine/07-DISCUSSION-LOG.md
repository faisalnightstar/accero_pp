# Phase 7: Exact Official Vehicle RC Smart Card Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-29
**Phase:** 07-exact-official-vehicle-rc-smart-card-engine
**Areas discussed:** State Adaptation, Literal Technical Fallbacks, Grouped Studio Form Layout

---

## 1. Dynamic State Theming vs. Fixed Template

| Option | Description | Selected |
|--------|-------------|:--------:|
| Dynamic State Adaptation | Automatically derive state name (`Issued by Government of [State]`), state badge pill (`UP`, `DL`, `MH`, etc.), and registering authority from registration number prefix, with Uttar Pradesh fallback | ✓ |
| Fixed Uttar Pradesh Template | Lock the header, crest, and badges strictly to Uttar Pradesh (UP) regardless of registration prefix | |

**User's choice:** Dynamic State Adaptation.
**Notes:** The card will automatically adapt to any state (e.g. `DL-04...` -> Delhi, `MH-12...` -> Maharashtra, `UP-16...` -> Uttar Pradesh), while defaulting to Uttar Pradesh (`UP`) matching the reference image.

---

## 2. Technical Specs Fallback Handling

| Option | Description | Selected |
|--------|-------------|:--------:|
| Exact Literal Fallbacks | Display "0" or "NA" exactly as shown on official government cards when unladen weight, cubic capacity, BHP, wheelbase, or cylinder count are 0 or unprovided | ✓ |
| Blank Spacing | Render empty space if value is 0 or missing | |

**User's choice:** Exact Literal Fallbacks.
**Notes:** Form 23A on official government smart cards frequently displays literal "0" for unladen weight, horsepower, wheelbase, and cylinder count. The canvas will accurately reflect this government standard.

---

## 3. Studio Form Layout Organization

| Option | Description | Selected |
|--------|-------------|:--------:|
| Grouped Studio Form | Organize the 20+ Form 23A fields into logical sections (Header & Badges, Vehicle Identification, Owner Details, Technical Specs, Financial & Authority) | ✓ |
| Flat List | Render all 20+ inputs in a single continuous two-column grid | |

**User's choice:** Grouped Studio Form.
**Notes:** Studio editor will provide clear segmented field groups with icons and missing-field indicators to keep editing effortless.

---

## The Agent's Discretion

- **Ashoka Crest:** Exact dark grey emblem with light sky-blue radial crest accent in the top-left corner.
- **Smart Chip Contact:** 8-contact gold microchip with gradient traces and solid royal blue directional arrow pointer (`◀`).
- **Rotated Text:** Right edge rotated 90° for "Card Issue Date (DD-MM-YYYY)" on Front, and "Form 23A" on Back.
- **Badge Colors:** `#38BDF8` cyan for `NT` badge, `#F59E0B` vibrant orange for State badge.

## Deferred Ideas
- None for Phase 7. All requirements are focused on achieving 100% visual and physical parity with the government reference image.
