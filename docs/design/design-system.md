# Accero PrintPortal — Design System Specification

**Version:** 2.0.0  
**Design Direction:** Premium Indian Digital Document Services Platform  
**Target Audience:** Cyber Cafe Operators, CSC VLEs, Printing Shops, Village Digital Service Centers  
**Foundation:** Next.js 15.5.26, React 19, Tailwind CSS 3, TypeScript, Lucide Icons, ISO/IEC 7810 ID-1 standard

---

## 1. Design Philosophy & Aesthetic Identity

Accero PrintPortal bridges high-reliability cloud software with physical precision printing. The visual language conveys:
- **Trust & Authority**: Resolute, government/fintech-grade precision without falsely implying government affiliation.
- **Clarity Under Pressure**: Cyber cafe operators handle high morning footfalls. UI must be legible, immediate, and zero-clutter.
- **Craft & Geometry**: Exacting dimensional awareness reflecting the ISO/IEC 7810 standard (CR80: 85.60 mm × 53.98 mm).
- **Anti-Generic Restraint**: No generic AI tropes (no warm-cream terracotta serifs, no rainbow gradient splashes, no random floating blobs, no excessive glassmorphism).

---

## 2. Color Palette & Design Tokens

### Core Base Palette
| Token Name | Hex Code | Role & Usage |
| :--- | :--- | :--- |
| **Navy Ink (`brand-navy`)** | `#1D3557` | Primary brand authority, headings, high-contrast borders, solid badges. |
| **Imperial Burgundy (`brand-burgundy`)** | `#8B1E2D` | Primary accent, flagship action highlights, security anchors. |
| **Crimson Coral (`brand-crimson`)** | `#E63946` | Interactive hover highlights, active indicators, error / attention accents. |
| **Steel Blue (`brand-steel`)** | `#457B9D` | Secondary information hierarchy, subtle technical callouts, icons. |
| **Warm Gold (`brand-gold`)** | `#F4D35E` | Verification badges, highlight accents, CR80 dimension tags. |
| **Paper Light (`brand-bg`)** | `#F8FAFC` | Page backgrounds, high legibility canvas, contrast separator. |
| **Pure White (`surface`)** | `#FFFFFF` | Card surfaces, modal surfaces, form containers. |

### Semantic Functional Tokens
- **Success / Verified**: `emerald-600` (`#059669`), `emerald-50` background, `emerald-200` border.
- **Warning / Missing Field**: `amber-500` (`#F59E0B`), `amber-50` background, `amber-300` border (The signature "Amber Missing Field" signal).
- **Critical / Error**: `rose-600` (`#E11D48`), `rose-50` background, `rose-200` border.
- **Technical Blueprint**: `slate-900` (`#0F172A`) for terminal cards, code snippets, and printer hardware specs.

---

## 3. Typography & Hierarchy

Accero leverages high-clarity sans-serif typography with native Devanagari script support:
- **Body & UI**: Inter / system-ui (`sans-serif`), engineered for high legibility at 12px–14px.
- **Regional Script**: Google Fonts *Hind* (`font-family: 'Hind', sans-serif`) for crisp Hindi/Devanagari conjuncts on PVC cards.
- **Card Specific Faces**: Helvetica LT Pro Bold (PAN), Comma Serif (Aadhaar), Rockwell (Aadhaar numbers).

### Scale & Weight Ratios
- **Display 1 (Hero Headlines)**: `text-4xl sm:text-5xl lg:text-6xl`, `font-extrabold`, tracking `-0.025em`, leading `1.1`.
- **H2 (Section Titles)**: `text-2xl sm:text-3xl lg:text-4xl`, `font-bold`, tracking `-0.02em`.
- **H3 (Card & Feature Headings)**: `text-lg sm:text-xl`, `font-semibold`, tracking `-0.01em`.
- **Body Text**: `text-sm sm:text-base`, `text-slate-600`, line-height `1.6`, max line length 75 characters.
- **Meta & Labels**: `text-xs font-semibold uppercase tracking-wider text-slate-500`.

---

## 4. Spacing, Elevation & Geometry

### Spacing Scale
- Page container max-width: `max-w-7xl` (1280px) with fluid padding `px-4 sm:px-6 lg:px-8`.
- Section vertical spacing: `py-16 sm:py-20 lg:py-24`.
- Component gap scale: `gap-3` (compact lists), `gap-6` (standard card grids), `gap-8` (major features).

### Elevation & Borders
- **Hairline Precision**: `border border-slate-200/80` for crisp separation against `#F8FAFC`.
- **Subtle Surface Depth**:
  - `shadow-xs`: `0 1px 2px rgba(15, 23, 42, 0.05)`
  - `shadow-sm`: `0 2px 4px rgba(15, 23, 42, 0.06)`
  - `shadow-card`: `0 10px 25px -5px rgba(29, 53, 87, 0.08), 0 8px 10px -6px rgba(29, 53, 87, 0.04)`
  - `shadow-elevated`: `0 20px 35px -10px rgba(29, 53, 87, 0.12)`

### Radii Hierarchy
- Cards: `rounded-2xl` (16px)
- Buttons & Inputs: `rounded-xl` (12px)
- Badges & Pills: `rounded-full` (9999px)
- CR80 Physical Standard: `3.18mm` (exact ISO 7810 corner radius on card canvases)

---

## 5. Standard Component Guidelines

### Buttons (`src/components/ui/Button.tsx`)
1. **Primary**: High-contrast Navy Ink to Burgundy transition (`bg-[#1D3557] hover:bg-[#8B1E2D] text-white`).
2. **Secondary / Accent**: Warm Burgundy (`bg-[#8B1E2D] hover:bg-[#721925] text-white`).
3. **Outline**: Crisp border (`border border-slate-300 hover:border-slate-400 bg-white text-[#1D3557]`).
4. **Ghost**: Clean text button with subtle hover background (`hover:bg-slate-100 text-slate-700`).

### Form Controls (`src/components/ui/Input.tsx`)
- Height: 44px (touch friendly).
- Border: `border-slate-300`, transitions to `border-[#1D3557]` with `ring-2 ring-[#1D3557]/15` on focus.
- Accessible `<label>` elements with required indicators.

### Cards & Grids (`src/components/public/ServiceCard.tsx`)
- High contrast, pure white background `#FFFFFF`.
- Clean top badge with card specification tag.
- Explicit pricing and turnaround indicators.
- Seamless action triggers directly into the studio or detail specs.
