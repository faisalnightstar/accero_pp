---
name: design-taste-frontend
description: Injects high-taste art direction, editorial typography, tactile styling, and anti-slop aesthetics into frontend code. Overrides generic AI design defaults with authentic visual identity, refined micro-borders, elegant palette sophistication, and bespoke layout composition. Use when designing premium landing pages, bespoke web apps, showcase interfaces, and high-impact design systems.
license: MIT
metadata:
  author: Leonxlnx
  version: "1.0.0"
---

# Design Taste Frontend: The Anti-Slop Aesthetic Engine

A curated design methodology engineered to eliminate generic AI frontend tropes and produce distinctive, memorable web interfaces with editorial taste and craftsmanship.

---

## 1. The Anti-Slop Manifest

Most AI-generated frontends suffer from predictable visual clichés:
- ❌ Centered headline over 3 lines with a purple gradient on the last word.
- ❌ Floating pill badge with a star icon above the headline.
- ❌ A 3-column card grid with generic colored circle icons.
- ❌ Generic system font stacks (default Inter / Arial without weight contrast).
- ❌ Heavy, blurry drop-shadows (`box-shadow: 0 10px 30px rgba(0,0,0,0.1)`).

**The Taste Standard:** Every interface must feel intentionally art-directed, grounded in physical craftsmanship, and tailored to its specific problem domain.

---

## 2. Art Direction Frameworks

Select a distinct aesthetic direction based on the product’s identity:

### Direction A: Editorial Swiss / Modern Minimal
- **Typography:** Refined sans-serif (`Geist`, `Plus Jakarta Sans`, `Space Grotesk`) or an authoritative display serif (`Instrument Serif`, `Newsreader`).
- **Composition:** Heavy use of asymmetric whitespace, numbered technical markers (`[01]`, `[02]`), micro-labels, hairline borders.
- **Palette:** Warm monochrome (`#0f0f11`, `#1c1c20`, `#faf8f5`) with crisp black/white contrast.

### Direction B: Dark Monolith / Developer Craft
- **Typography:** Clean geometric sans paired with a razor-sharp monospace (`JetBrains Mono`, `Geist Mono`).
- **Tactility:** Razor 1px borders (`border-white/[0.08]`), inner top specular highlights (`inset 0 1px 0 rgba(255, 255, 255, 0.1)`), subtle radial dark gradients (`bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]`).
- **Color Accent:** High-saturation singular neon spark (Electric Emerald `#10b981`, Cyber Amber `#f59e0b`, or Cyan `#06b6d4`).

### Direction C: Tactile Industrial / Bauhaus
- **Structure:** Visible grid dividers, dense metadata rows, uppercase micro-headers with expanded tracking (`tracking-widest text-[10px]`).
- **Surfaces:** Matte backgrounds with slight grain, high contrast data blocks, status pill indicators with solid pulsing dots.

---

## 3. Typographic Pairings & Hierarchy

Avoid font monotony. Pair type with purpose:

| Headline Font | Body / UI Font | Monospace / Metadata | Vibe |
|---|---|---|---|
| **Instrument Serif** | **Inter / Geist** | **JetBrains Mono** | High-end editorial, luxury, publication |
| **Space Grotesk** | **Plus Jakarta Sans** | **Geist Mono** | Modern fintech, Web3, creative tech |
| **Geist (Black / Heavy)** | **Geist (Regular)** | **Geist Mono** | Hyper-clean developer tools, SaaS, utility |
| **Cabinet Grotesk** | **Satoshi** | **IBM Plex Mono** | Bold consumer, lifestyle, high energy |

### Typographic Execution Rules
- Display titles must have negative tracking (`tracking-[-0.03em]`) and tight line height (`leading-[1.1]`).
- Micro-labels, badge tags, and timestamps should be uppercase, small (`text-[11px]`), with expanded tracking (`tracking-wider`).
- Data numbers (balances, IDs, counters) should use tabular numbers (`tabular-nums font-mono`) to prevent layout shifting.

---

## 4. Tactile Craftsmanship & Border Styling

Elevate surfaces using physical, tactile cues rather than fuzzy blur:

```css
/* Tactile Card with Top Specular Highlight */
.card-tactile {
  background: #121316;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
    0 4px 16px -2px rgba(0, 0, 0, 0.4);
  border-radius: 12px;
}
```

- **Hairline Dividers:** Use `border-t border-white/[0.06]` or `border-neutral-200/60` for clean separation.
- **Glass / Depth:** Use backdrop blur with restraint (`backdrop-blur-md bg-black/40 border border-white/10`).
- **Button Tactility:** Provide a subtle top border highlight and an inset shadow that depresses slightly on click:
  `active:translate-y-[0.5px] active:shadow-inner`.

---

## 5. Composition & Asymmetric Layouts

- **Bespoke Hero Sections:** Instead of a generic centered title, place the primary interactive tool or visual preview front-and-center (e.g. an interactive live card canvas on one side and precision editing controls on the other).
- **Metadata Framing:** Frame important containers with structural metadata headers (e.g. `[CANVAS_01]`, status badges, zoom controls, coordinate tags).
- **Break the Monotony:** Vary container dimensions, use sticky viewports for preview sections, and integrate clean keyboard shortcut chips (`kbd: ⌘P`).
