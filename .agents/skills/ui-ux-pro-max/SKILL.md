---
name: ui-ux-pro-max
description: Complete UI/UX design intelligence system for crafting conversion-focused, ergonomic, accessible, and visually stunning web applications. Applies systematic design tokens, 60-30-10 color rules, 8pt spatial rhythm, state completeness (loading, empty, error), and mobile-first touch ergonomics. Use when architecting UI layouts, user flows, dashboards, data-dense editors, forms, and product surfaces.
license: MIT
metadata:
  author: nextlevelbuilder
  version: "1.0.0"
---

# UI/UX Pro Max: Design Intelligence System

A structured design framework that enforces professional UI engineering, spatial precision, ergonomic accessibility, and comprehensive state handling.

---

## 1. Style Archetype Selection

Before designing a screen, select a single primary design archetype to maintain aesthetic coherence:

| Archetype | Characteristics | Ideal Use Case |
|---|---|---|
| **Dark Utility / Pro** | Deep obsidian `#0a0b0e`, 1px borders `rgba(255,255,255,0.08)`, monospaced data tags, high-density layouts | Developer tools, trading desks, card print portals, analytics dashboards |
| **Bento Grid** | Modular cards of varying spans (col-span-2, row-span-2), rounded-2xl corners, contained visual narratives | Feature showcases, overview dashboards, user profile hubs |
| **Warm Editorial** | Cream/stone backgrounds (`#f9f8f6`), serif headlines, ample whitespace, understated borders | Content-heavy platforms, documentation, luxury products |
| **Modern Minimalist** | High contrast monochrome with 1 surgical accent color, ultra-clean typography, zero unnecessary decoration | SaaS apps, workflow tools, form entry systems |
| **Glass / Frosted** | `backdrop-blur-md`, subtle specular highlights, layered depth | Overlays, modal sheets, floating navigation bars |

---

## 2. Spatial Rhythm & Grid Foundations

### The 8-Point Grid System
All dimensions, margins, paddings, and heights must adhere to an 8pt base grid (with a 4pt micro-step for compact badges and icon gaps):
- **4px (`gap-1`, `p-1`)**: Micro-spacing inside badges, chips, icon-to-label gaps.
- **8px (`gap-2`, `p-2`)**: Standard button internal padding, tight list item gaps.
- **16px (`gap-4`, `p-4`)**: Standard card internal padding, form input spacing.
- **24px (`gap-6`, `p-6`)**: Spacing between card groups or grid columns.
- **32px (`gap-8`, `p-8`)**: Section breaks, header-to-content separation.
- **48px–64px (`py-12`–`py-16`)**: Page hero margins and major zone dividers.

### Typography Scale (Strict Harmony)
Never use arbitrary font sizes. Use a modular typography scale:
- `11px / 12px` (`text-xs`): Badges, timestamps, helper labels, table metadata.
- `14px` (`text-sm`): Secondary copy, form labels, table cells, navigation links.
- `16px` (`text-base`): Standard body text, primary button labels, form inputs.
- `18px / 20px` (`text-lg`): Card headers, modal titles, sub-section headings.
- `24px` (`text-2xl`): Section titles, drawer headings.
- `32px`–`40px` (`text-3xl` / `text-4xl`): Page headers, dashboard KPI numbers.
- `48px+` (`text-5xl`): High-impact display headlines.

---

## 3. The 60-30-10 Color Architecture

To maintain visual balance and prevent chromatic clutter, structure UI colors according to the 60-30-10 ratio:
- **60% Dominant (Canvas / Background):** The canvas background and major negative space (e.g. `#0b0f17` or `#ffffff`).
- **30% Structural (Surfaces & Typography):** Neutral card backgrounds, borders, dividers, secondary surfaces, and primary body text.
- **10% Accent (Call-to-Action & Focal Points):** One high-contrast accent color reserved strictly for primary buttons, active indicator pills, completion badges, and interactive focus states.

---

## 4. State Completeness Contract

Every interactive component or page view must implement all 6 essential UI states:
1. **Default / Idle:** Clear visual affordance indicating interactivity.
2. **Hover / Focus:** Clear visual change on hover and visible focus ring (`focus-visible:ring-2`) for keyboard users.
3. **Active / Pressed:** Physical feedback (e.g. `active:scale-[0.98]`).
4. **Loading / Processing:** Inline spinner or skeleton placeholder with shimmer animation; disable repeated clicks (`disabled:opacity-50 pointer-events-none`).
5. **Empty State:** When no data exists, display an illustrative icon, empathetic descriptive text, and a prominent primary action button to get started.
6. **Error / Invalid State:** Clear red/amber feedback with specific, actionable instructions on how to resolve the error.

---

## 5. Touch & Ergonomic Standards

- **Touch Targets:** Minimum interactive size of `44px × 44px` on mobile/tablet viewports.
- **Form Ergonomics:**
  - Place labels above input fields (not floating inside placeholders that disappear when typed into).
  - Use appropriate `inputMode` on mobile (`numeric` for phone/Aadhaar/PIN, `email` for email).
  - Show real-time inline validation after blur, not aggressive error shouting before the user finishes typing.
- **Thumb Zone Design:** Place primary destructive or confirmation actions within easy thumb reach on mobile screens.
