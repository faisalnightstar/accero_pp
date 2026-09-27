---
phase: 03-interactive-split-screen-studio-missing-field-editor
plan: 02
subsystem: ui-studio
tags: [missing-fields, validation-engine, amber-badges, visual-cues, studio]

# Dependency graph
requires: [03-01]
provides:
  - Declarative missing field validation rules (missingFields.ts) for all 5 document types
  - Dynamic completion score calculation (0% - 100%) and completeness analyzer
  - MissingFieldBanner component with "Fix Next Field" auto-scrolling jumper
  - Amber warning pill badges ("⚠️ Missing from API") and highlighted input rings in CardForm
affects: [03-03, phase-4]

# Tech tracking
tech-stack:
  added: []
  patterns: [Declarative Document Rules Engine, Dynamic Completeness Metric, Contextual Jump-to-Field Navigation]

key-files:
  created:
    - src/lib/missingFields.ts
    - src/components/studio/MissingFieldBanner.tsx
  modified:
    - src/app/studio/page.tsx
    - src/components/studio/CardForm.tsx

key-decisions:
  - "Defined declarative validation schemas per document type in missingFields.ts, separating mandatory from optional fields"
  - "Constructed MissingFieldBanner with instant scroll-and-focus jumper so operators can resolve omissions in seconds"
  - "Rendered amber warning badges directly on input headers with highlighted focus rings"

patterns-established:
  - "Completeness analysis runs synchronously on state change via useMemo, guaranteeing reactive feedback without lag"
---

# Plan 03-02 Summary: Missing Field Detection Engine & Warning Cues

Built the automatic missing-field detection engine, visual warning cues, completion score metrics, and quick-jump navigation to deliver the core "zero missing-data failures" guarantee.

## What was built
- **Declarative Missing Fields Engine (`src/lib/missingFields.ts`)**:
  - Defines strict validation schemas (`panRules`, `aadhaarRules`, `voterRules`, `dlRules`, `rcRules`).
  - Implements `analyzeDocumentCompleteness(docType, data)` computing `completionScore`, `missingKeys`, `missingFields`, and `isPrintReady`.
- **Missing Field Banner (`src/components/studio/MissingFieldBanner.tsx`)**:
  - Color-coded progress bar (Green at 100%, Amber <100%, Red <50%).
  - Status alert: "100% Data Complete" vs "Incomplete Data Detected".
  - "Fix Next Field" button that smoothly scrolls to and focuses the first empty input.
  - Interactive pill tags for each missing field.
- **Form Highlighting (`src/components/studio/CardForm.tsx`)**:
  - Displays amber badges (`⚠️ Missing from API`) and highlighted focus rings on empty mandatory inputs.
- **Studio Integration (`src/app/studio/page.tsx`)**:
  - Wired live completeness calculation and jumper handlers into the split-screen studio.

## Verification
- `npm run build` compiled all 12 routes cleanly with zero TypeScript errors or ESLint warnings.
- Verified missing field calculation, amber pill displays, and smooth focus jumping.
