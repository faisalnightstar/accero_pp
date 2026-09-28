---
phase: 04
slug: multi-provider-verification-fallback-apis
status: draft
shadcn_initialized: false
preset: none
created: 2026-09-28
---

# Phase 04 — UI Design Contract

> Visual and interaction contract for Multi-Provider Verification & Fallback APIs. Defines component inventory, color distribution, typography, spacing, and interaction states for the Dashboard Quick Lookup Modal, In-Studio Search Bar, and Dirty-Form Overwrite Guard.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | Vanilla Tailwind CSS |
| Preset | Custom Portal Design System Tokens |
| Component library | None (native accessible React components) |
| Icon library | Lucide React |
| Font | Inter (Latin), Hind (Devanagari) |

---

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, search bar inline badge padding |
| sm | 8px | Button inline gaps, input padding |
| md | 16px | Form input margins, modal internal padding |
| lg | 24px | Modal content sections, card headers |
| xl | 32px | Dashboard search launcher spacing |
| 2xl | 48px | Modal overlay bounds |
| 3xl | 64px | Page-level layout breaks |

Exceptions: None

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px (0.875rem) | 400 (Regular) | 1.5 |
| Label | 12px (0.75rem) | 600 (Semibold) | 1.25 |
| Subheading | 16px (1rem) | 600 (Semibold) | 1.4 |
| Heading | 20px (1.25rem) | 700 (Bold) | 1.2 |
| Display | 24px (1.5rem) | 800 (Extrabold) | 1.15 |

---

## Color Palette & Allocation (60-30-10 Rule)

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#0F172A` (Slate 900) & `#1E293B` (Slate 800) | Application backgrounds, modal backdrops, container surfaces |
| Secondary (30%) | `#334155` (Slate 700) & `#8B1E2D` (Burgundy) | Input borders, search bar backdrops, card shells, inactive tabs |
| Accent (10%) | `#E63946` (Crimson) & `#F4D35E` (Gold) | Primary "Fetch Card Data" CTA button, amber missing-field badges, active search focus rings |
| Destructive | `#DC2626` (Red 600) | "Overwrite Draft" confirmation button |
| Success | `#10B981` (Emerald 500) | "100% Verified" lookup badge |

**Accent Reserved For:**
- Primary action buttons: "Fetch & Open in Studio" and "Verify ID"
- Amber warning badges on partial response cards
- Search bar focus glow (`ring-2 ring-[#E63946]`)

---

## Component Inventory & Interactions

### 1. `QuickLookupModal` (Dashboard Modal)
- **Trigger:** "Quick Document Lookup" button on `/dashboard` hero and individual service cards.
- **Controls:**
  - Document Type Segmented Control (PAN, Aadhaar, Voter, DL, RC)
  - ID Number input with auto-capitalization and helper hint
  - Fetch CTA button with dynamic loading state
- **States:**
  - `idle`: Ready for input
  - `loading`: Disabled inputs, spinning loader, text: *"Querying government gateway..."*
  - `error`: Inline red error alert with button: *"Proceed with Blank Studio Form"*

### 2. `StudioSearchBar` (In-Studio Form Header)
- **Location:** Top of `CardForm.tsx` (above document fields).
- **Controls:** Compact input + inline "Fetch" button + provider latency indicator.
- **Behavior:** On submit, triggers server action. If form is dirty, opens `OverwriteConfirmModal`.

### 3. `OverwriteConfirmModal` (Dirty State Guard)
- **Heading:** "Overwrite Current Draft?"
- **Body:** "You have unsaved changes or uploaded files in this session. Fetching new data from the API will replace these values."
- **Primary CTA:** "Yes, Replace Form Data" (`#DC2626` Destructive)
- **Secondary CTA:** "Cancel & Keep Current Draft" (`#334155` Ghost)

### 4. Toast Notifications
- **Partial Payload:** Toast alert *"External lookup returned partial data. 2 missing fields flagged"* (Amber banner).
- **Timeout / Fallback:** Toast alert *"API gateway timed out after 8s. Opened manual studio entry"* (Blue/Info banner).

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Dashboard Modal Primary CTA | `Fetch & Open in Studio` |
| In-Studio Search CTA | `Fetch Details` |
| Loading State Label | `Connecting to external gateway...` |
| Partial Result Toast | `Partial record found — missing fields highlighted for manual completion` |
| Timeout Fallback Toast | `External gateway timed out. Switched to manual Studio entry.` |
| Overwrite Modal Confirm | `Overwrite Draft` |
| Overwrite Modal Cancel | `Keep Current Draft` |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-09-28
