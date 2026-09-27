---
phase: 03-interactive-split-screen-studio-missing-field-editor
plan: 01
subsystem: ui-studio
tags: [split-screen, dual-pane, live-editor, two-way-binding, studio]

# Dependency graph
requires: [phase-2]
provides:
  - Controlled state management hook (useCardStudio.ts) for all 5 document types
  - Responsive dual-pane layout component (StudioLayout.tsx) with sticky preview
  - Dynamic multi-document form editor (CardForm.tsx)
  - Interactive studio route at /studio with 0ms keystroke canvas synchronization
affects: [03-02, 03-03, phase-4]

# Tech tracking
tech-stack:
  added: []
  patterns: [Split-screen live dual-pane editor, In-memory two-way controlled binding, Sticky card preview container]

key-files:
  created:
    - src/hooks/useCardStudio.ts
    - src/components/studio/StudioLayout.tsx
    - src/components/studio/CardForm.tsx
    - src/app/studio/page.tsx

key-decisions:
  - "Engineered in-memory state synchronization via useCardStudio to guarantee 0ms latency between form typing and card canvas updates"
  - "Configured sticky top-24 viewport on desktop for Cr80CardContainer to keep the physical card in view while scrolling long forms"
  - "Built tabbed document switcher in studio header supporting PAN, Aadhaar, Voter, DL, and RC with default realistic templates"

patterns-established:
  - "CardForm components assign ID matching each field key to facilitate direct programmatic scrolling and focus in Plan 03-02"
---

# Plan 03-01 Summary: Split-Screen Studio Layout & Live Two-Way Binding Engine

Constructed the dual-pane split-screen studio layout and two-way reactive state engine, enabling operators to edit form fields on the left while simultaneously watching the live vector card canvas update on the right in real time across all 5 document types.

## What was built
- **Controlled State Hook (`src/hooks/useCardStudio.ts`)**:
  - Manages active document type and state payloads with default realistic mock data.
  - Implements `updateField(key, value)` with instant re-render.
  - Implements `switchDocType`, `resetToOriginal`, `resetToBlank`, and `loadData`.
- **Dual-Pane Layout (`src/components/studio/StudioLayout.tsx`)**:
  - Left pane: Scrollable form controls (45%-50% desktop width).
  - Right pane: Sticky viewport (`sticky top-24`) maintaining the card preview in view.
  - Collapses cleanly into a stacked view on mobile/tablet viewports.
- **Dynamic Card Form (`src/components/studio/CardForm.tsx`)**:
  - Renders document-specific input sections for PAN, Aadhaar, Voter ID, DL, and Vehicle RC.
  - Supports input IDs matching field keys for direct jumping.
- **Interactive Studio Page (`src/app/studio/page.tsx`)**:
  - Renders at `/studio` with document switcher tabs, zoom controls, flip view, and PVC print preview.

## Verification
- `npm run build` compiled all 12 routes cleanly with zero TypeScript errors or ESLint warnings.
- Verified `/studio` route generates as static page and updates live canvas on form changes.
