# ISO/IEC 7810 ID-1 (CR80) Standard & Card Canvas Architecture

**Author:** Technical Documentation Architect & Engineering Review  
**Status:** Living Engineering Specification  
**Last Updated:** November 2026  
**Target Specification:** ISO/IEC 7810 ID-1 standard dimensions  

---

## 1. Physical Specifications & Standards

All PVC card templates rendered by Accero PrintPortal conform strictly to the international **ISO/IEC 7810 ID-1 standard** (commonly referred to as the **CR80** card format). This standard governs standard identification cards, driving licences, health cards, credit cards, and PVC identity badges worldwide.

### Standard Dimensions

$$\text{Width} = 85.60\text{ mm} \quad (\approx 3.370\text{ inches})$$
$$\text{Height} = 53.98\text{ mm} \quad (\approx 2.125\text{ inches})$$
$$\text{Thickness} = 0.76\text{ mm} \quad (\approx 30\text{ mil} \pm 10\%)$$
$$\text{Corner Radius} = 3.18\text{ mm} \quad (\approx 0.125\text{ inches})$$
$$\text{Aspect Ratio} \approx 1.5858 : 1$$

---

## 2. Digital Coordinate Mapping & DPI Resolutions

For digital rendering, screen previews, and physical thermal-transfer / dye-sublimation PVC printing, dimensions must map accurately to pixel resolutions without subpixel distortion.

| Resolution | Width (px) | Height (px) | Corner Radius (px) | Application |
| :--- | :--- | :--- | :--- | :--- |
| **Screen Preview (CSS)** | `323.5px` | `204px` | `12px` | Interactive studio live split-screen editor |
| **High-Density Preview (2x)** | `647px` | `408px` | `24px` | Retina / 4K workstation displays |
| **300 DPI (Standard Print)** | `1011px` | `638px` | `38px` | Inkjet card tray printing (Epson L805, Canon G-series) |
| **600 DPI (Direct-to-Card)** | `2022px` | `1275px` | `75px` | Dye-sublimation PVC badge printers (Evolis, Zebra, Fargo) |

---

## 3. Printer Tray Calibration & Geometry

CSC operators and cyber cafes primarily utilize desktop photo printers fitted with specialized dual-card plastic PVC printing trays (e.g. Epson L805, L850, L8050, Canon Pixma G570).

### Physical Tray Layout
- **Two-Up Tray Layout:** Trays hold two ID-1 cards simultaneously: Card A (Front) and Card B (Back).
- **Physical Gap:** Standard trays enforce a $15\text{ mm}$ to $20\text{ mm}$ inter-card margin along the horizontal or vertical feed axis.
- **Top Margin:** A physical offset ($18.5\text{ mm}$ to $24\text{ mm}$) prevents print heads from colliding with the tray retaining clips.

### Browser `@media print` CSS Architecture

```css
@media print {
  /* Suppress browser headers, footers, margins */
  @page {
    size: A4 portrait;
    margin: 0;
  }

  body {
    background: transparent !important;
    margin: 0 !important;
    padding: 0 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Hide navigation, studio controls, buttons */
  .no-print, header, nav, aside, footer {
    display: none !important;
  }

  /* Printable Canvas Isolation */
  .printable-card-container {
    display: block !important;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }

  .cr80-card-front, .cr80-card-back {
    width: 85.60mm !important;
    height: 53.98mm !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
```

---

## 4. Supported Document Card Canvases

Accero PrintPortal includes custom-engineered canvas components for each supported Indian document standard:

| Document Type | Canvas Component | Dual-Sided | Key Barcode / QR Standard | Security Elements |
| :--- | :--- | :--- | :--- | :--- |
| **PAN Card** | `PanCardCanvas.tsx` | Front Only / Both | QR Code (`qrcode`) | National Emblem, Hologram placeholder, ITD watermark |
| **Aadhaar** | `AadhaarCardCanvas.tsx` | Front + Back | Secure 2D QR Code | Ashoka Pillar, Guilloche background pattern, UIDAI micro-text |
| **Voter ID (EPIC)** | `VoterCardCanvas.tsx` | Front + Back | Code-128 Barcode + QR | Election Commission hologram, Part/SL numbers, Regional translation |
| **Driving Licence** | `DlCardCanvas.tsx` | Front + Back | PDF417 / 2D QR | MoRTH chip outline, Vehicle class badges, Issue authority seal |
| **Vehicle RC** | `RcCardCanvas.tsx` | Front + Back | Code-128 Barcode + QR | Parivahan emblem, Hypothecation flag, Fuel / Euro emission badge |
| **Ration Card** | `RationCardCanvas.tsx` | Front + Back | NFSA 2D QR Code | State PDS emblem, FPS Code, Family member allocation grid |
| **Farmer ID** | `FarmerCardCanvas.tsx` | Front + Back | Land Registry QR | PM-Kisan verification mark, Land holding metrics, KCC badge |

---

## 5. High-Resolution Vector & Raster PDF Export Pipeline

In addition to browser-native printing (`window.print()`), Accero supports direct PDF download for archiving or remote printer sharing:

1. **DOM Canvas Isolation:** Selected card container is rendered into an off-screen viewport container at a scale factor of $3.0\times$ using `html2canvas`.
2. **Color Correction & Font Smoothing:** Canvas utilizes anti-aliased font rendering and Devanagari script glyph alignment.
3. **jsPDF Document Composition:**
   - PDF is initialized with exact millimeter units:
     ```typescript
     import jsPDF from 'jspdf';
     const doc = new jsPDF({
       orientation: 'landscape',
       unit: 'mm',
       format: [85.60, 53.98]
     });
     ```
   - Scaled image buffer is inserted at $(0, 0, 85.60, 53.98)$ without quality loss.
4. **File Naming & Security:** Exported files are named using sanitized alphanumeric document IDs (e.g. `PAN_ABCDE1234F_CR80.pdf`) and are delivered directly to the operator's local device without persistent server disk exposure.

---

## 6. Related Specifications & Resources

- [Ration Card Template Design](file:///Users/faisal/Documents/GitHub/accero_pp/docs/document-templates/ration-card/template-design.md)
- [Ration Card Data Mapping](file:///Users/faisal/Documents/GitHub/accero_pp/docs/document-templates/ration-card/data-mapping.md)
- [Design System & Visual Tokens](file:///Users/faisal/Documents/GitHub/accero_pp/docs/design/design-system.md)
- [System Architecture Overview](file:///Users/faisal/Documents/GitHub/accero_pp/docs/architecture/overview.md)
