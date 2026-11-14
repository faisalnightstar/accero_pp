# Ration Card Asset Inventory & Reusability Audit

**Document Version:** 1.0.0  
**Target Platform:** Accero PrintPortal Next.js  
**Assets Location:** `public/assets/ration/`

---

## 1. Executive Summary

During the reconnaissance of the legacy reference projects:
- Reference 1: `/Users/faisal/Documents/E-Book/Farooque/printportal_xyz_public_html 2/`
- Reference 2: `/Users/faisal/Documents/E-Book/Farooque/easyprintportal_in/`

We analyzed all graphic assets, logos, background templates, and stamps used in historical Ration Card printing. The legacy assets exhibited severe limitations:
- Heavy raster compression artifacts (JPEG blockiness on 300 DPI printers).
- Missing bleed and unsafe margins.
- Outdated department insignias.

Accero PrintPortal replaces low-resolution raster graphics with **scalable vector SVGs** and high-resolution 500×500 RGBA logos.

---

## 2. Legacy Asset Evaluation

| Asset Name / Source Path | Format & Resolution | Quality Rating | Issues Discovered | Architectural Decision |
| :--- | :--- | :--- | :--- | :--- |
| `Smart-ration-card-removebg-preview.png` (Ref 1) | PNG, 360 × 240 px, 72 DPI | **POOR** | Low-resolution raster, clipped edges, blurry text in physical print | **Rejected for print canvas.** Extracted logo element only. |
| `logo.png` / NFSA wheat badge (Ref 1) | PNG, 120 × 120 px | **FAIR** | Bitmapped edges, chromatic aberration on thermal dye transfer | **Re-architected as precision vector SVG** (`NfsaWheatEmblem`). |
| National Emblem / Lion Capital (Ref 1 & 2) | PNG, 90 × 140 px | **FAIR** | Distorted *Satyameva Jayate* motto | **Replaced with official vector SVG** (`AshokaEmblem`). |
| ONORC Seal / Logo (Ref 2) | PNG, 100 × 100 px | **FAIR** | Jagged text rendering | **Re-architected as precision vector SVG** (`OnorcBadge`). |

---

## 3. Production Assets in Accero PrintPortal

All assets are located in `public/assets/ration/` and inline SVG components in `src/components/cards/Emblems.tsx`:

### 3.1 Primary Filesystem Assets (`public/assets/ration/`)

| File Path | Dimensions | Format | Usage | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `public/assets/ration/ration-card-logo.png` | 500 × 500 px | RGBA PNG | Department & NFSA Header Logo | Extracted and optimized from high-density source |
| `public/assets/ration/ration-card-front-bg.svg` | 1011 × 638 px (85.6 × 53.98 mm) | Vector SVG | Front-side card background | Micro-textured Guilloche waves, subtle watermark |
| `public/assets/ration/ration-card-back-bg.svg` | 1011 × 638 px (85.6 × 53.98 mm) | Vector SVG | Reverse-side card background | Symmetrical vector security border, table shading |

### 3.2 Dynamic Vector Security Emblems (`src/components/cards/Emblems.tsx`)

| Component Name | Type | Scaling Behavior | Security / Compliance Purpose |
| :--- | :--- | :--- | :--- |
| `AshokaEmblem` | Inline Vector SVG | Fully scalable, fill `#1E293B` | Official National Emblem of India (Lion Capital of Ashoka) |
| `NfsaWheatEmblem` | Inline Vector SVG | Fully scalable, dual-gold accents | National Food Security Act (NFSA) Department seal |
| `OnorcBadge` | Inline Vector SVG | Fully scalable, tricolor ribbon | One Nation One Ration Card interoperability stamp |
| `RationGuillocheSecurity` | Dynamic SVG Pattern | Seamless responsive repeat | Anti-counterfeiting wave pattern with category-matched tint |

---

## 4. DPI & Print Quality Standards

Accero PrintPortal enforces strict standards for physical PVC card output:

```
Physical Card: 85.60 mm × 53.98 mm (CR80 Standard)
Output DPI:    300 DPI minimum
Pixel Matrix:  1011 px × 638 px @ 300 DPI (approx 2022 px × 1276 px @ 600 DPI)
Color Mode:    sRGB with -webkit-print-color-adjust: exact
```

Because all background borders, seals, and typography are rendered as vector primitives or high-density typography, they print with zero pixelation on Fargo, Zebra, Evolis, Magicard, and Canon/Epson card trays.

