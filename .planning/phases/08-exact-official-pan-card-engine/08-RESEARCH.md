# Phase 8 Research: Exact Official PAN Card Engine (NSDL & UTIITSL)

## Executive Summary

Phase 8 modernizes and completely reproduces the official Income Tax Department PAN Card print engine from the legacy PHP system (`printportal/admin/aadhar/pan.php`, `pan2.php`, and `panmanual.php`) into the Next.js App Router architecture.

The legacy implementation relies on high-resolution pre-rendered authentic card backgrounds (`bpana.jpg` for NSDL and `1panaa.jpg` for UTIITSL) with pixel-level coordinate overlays for the applicant photograph, PAN number, applicant name, father's name, date of birth, applicant signature, and dynamic scannable QR code.

This research establishes:
1. Exact mathematical coordinate models mapping legacy pixel coordinates to responsive percentage-based coordinates that scale across 1x, 1.5x, 2x studio zoom and physical 85.60 mm × 53.98 mm ISO/IEC 7810 ID-1 card trays.
2. Dual-template architecture supporting both NSDL (`bpana.jpg`) and UTIITSL (`1panaa.jpg`).
3. Dual-mode output: standard front/back CR80 card tray printing (for PVC card printers like Zebra, Evolis, Magicard, Fargo, Epson L805 ID trays) and legacy side-by-side foldable cutout sheet mode (for A4/photo paper heat lamination).
4. Official Indian e-PAN QR code XML data payload formatting.

---

## 1. Visual Analysis of Legacy Code & Asset Inventory

### 1.1 Source Files in Legacy Repository
- `printportal/admin/aadhar/pan.php`: Legacy procedural PHP script rendering an 800px wide main container with `background: url('bpana.jpg') no-repeat; background-size: 100% auto;`.
- `printportal/newportal/admin/aadharpvc/pan2.php`: Refined coordinate implementation using Arial typography and adjusted positioning for `2pana.jpg` (identical to `bpana.jpg`).
- `printportal/admin/aadhar/bpana.jpg`: High-resolution 1280px × 386px JPEG representing the official NSDL PAN template (Left half: Front, Right half: Back).
- `printportal/admin/aadhar/1panaa.jpg`: High-resolution 1280px × 386px JPEG representing the official UTIITSL e-PAN template (Left half: Front with clean QR box, Right half: Back with Navi Mumbai office address).
- `printportal/admin/panmanual.php`: Database insertion and API fetch handler populating `panauto` table columns: `panno`, `name`, `fathername`, `dob`, `gender`, `image`, `signimage`.

### 1.2 Layout Comparison: NSDL vs UTIITSL
| Feature | NSDL Template (`bpana.jpg`) | UTIITSL Template (`1panaa.jpg`) |
|---|---|---|
| Card Subtitle | स्थायी लेखा संख्या कार्ड / Permanent Account Number Card | ई-स्थायी लेखा संख्या कार्ड / e-Permanent Account Number Card |
| Emblem & Crest | Income Tax Dept Crest (Burgundy) + Ashoka Lion (Blue) | Income Tax Dept Crest (Burgundy) + Ashoka Lion (Blue) |
| QR Code Area | Right side (61.7% X) with sample matrix background | Right side (61.7% X) with clean background for dynamic QR overlay |
| Back Return Office | Income Tax PAN Services Unit, NSDL, Pune - 411 016 | Income Tax PAN Services Unit, UTIITSL, Navi Mumbai - 400 614 |
| Back Helpline | Tel: 91-20-2721 8080, e-mail: tininfo@nsdl.co.in | Navi Mumbai CBD Belapur address in Hindi & English |
| Security Features | Guilloche background, Gandhi watermark, Emblem Hologram | Guilloche background, Gandhi watermark, Emblem Hologram |

---

## 2. Coordinate Space & Micro-Alignment Calculations

### 2.1 Geometry & Normalization
The legacy background images are **1280px wide × 386px tall**.
- **Front Side Card:** `x: 0` to `640px` (Aspect ratio: 640 / 386 = 1.658).
- **Back Side Card:** `x: 640` to `1280px` (Aspect ratio: 640 / 386 = 1.658).
- **Physical ISO/IEC 7810 ID-1 standard:** 85.60 mm × 53.98 mm (Aspect ratio: 1.586).
- **Outer Margins:** Both templates include a ~10-14px outer dashed border and a central vertical fold guide (`Fold ---`) at `x: 640px`.

In `pan.php`, the template is rendered inside an `800px` container (`background-size: 100% auto;`).
The scaling factor is:
$$\text{Scale} = \frac{800}{1280} = 0.625$$

### 2.2 Verified Micro-Coordinates (Front Card Coordinate Space)
Relative to the Front Card box ($640\text{px} \times 386\text{px}$):

| Element | Legacy CSS (`pan2.php`) | Native Image ($1280\times386$) | Percentage of Front Card Width ($640$) | Percentage of Front Card Height ($386$) | Dimensions / Typography |
|---|---|---|:---:|:---:|---|
| **Applicant Photo** | `top: 85px; left: 27px;` | `x: 43.2px, y: 136.0px` | **$6.75\%$** | **$35.23\%$** | Width: $15.0\%$ ($96\text{px}$), Height: $24.87\%$ ($96\text{px}$), Border: 1px solid #718096, object-cover |
| **PAN Number** | `top: 102px; left: 142px;` | `x: 227.2px, y: 163.2px` | **$35.50\%$** | **$42.28\%$** | Font: Arial / Monospace, Weight: 700, Color: `#1A202C` / `#30353D`, Tracking: 0.08em |
| **Applicant Name** | `top: 151px; left: 33px;` | `x: 52.8px, y: 241.6px` | **$8.25\%$** | **$62.59\%$** | Font: Arial / Hind, Weight: 600, Color: `#1A202C`, Uppercase |
| **Father's Name** | `top: 181px; left: 34px;` | `x: 54.4px, y: 289.6px` | **$8.50\%$** | **$75.03\%$** | Font: Arial / Hind, Weight: 600, Color: `#1A202C`, Uppercase |
| **Date of Birth** | `top: 218px; left: 33px;` | `x: 52.8px, y: 348.8px` | **$8.25\%$** | **$90.36\%$** | Font: Arial / Monospace, Weight: 600, Format: `DD/MM/YYYY` |
| **Signature Box** | `top: 205px; left: 148px;` | `x: 236.8px, y: 328.0px` | **$37.00\%$** | **$84.97\%$** | Width: $16.25\%$ ($104\text{px}$), Height: $10.36\%$ ($40\text{px}$), Transparent / contain |
| **Dynamic QR Code** | `top: 59px; left: 247px;` | `x: 395.2px, y: 94.4px` | **$61.75\%$** | **$24.46\%$** | Width: $27.50\%$ ($176\text{px}$), Height: $45.60\%$ ($176\text{px}$), Level: M |

---

## 3. Standard Stack

### Libraries to Use
- **Next.js 15+ (App Router)**: Fast Server & Client components, image optimization.
- **`qrcode.react`**: Existing `@/components/cards/CardQrCode` for dynamic scannable SVG QR codes.
- **Tailwind CSS + CSS Modules / Inline Styles**: Absolute percentage coordinate positioning ensuring lossless scalability across screen viewports and print media.
- **`lucide-react`**: UI icons for photo placeholder and action controls.
- **`html2canvas-pro` & `jspdf`**: Client-side single-click PDF and PNG export for ID-1 card dimensions.

---

## 4. Architecture Patterns

### Pattern 1: Asset Preparation & Serving
Place high-resolution card assets under `public/assets/pan/`:
- `public/assets/pan/nsdl-front.jpg`: Cropped front card ($640 \times 386$) for CR80 card printers.
- `public/assets/pan/nsdl-back.jpg`: Cropped back card ($640 \times 386$) with NSDL Pune address & hologram.
- `public/assets/pan/nsdl-sheet.jpg`: Full side-by-side ($1280 \times 386$) sheet with central fold line.
- `public/assets/pan/uti-front.jpg`: Cropped front card ($640 \times 386$) for UTIITSL.
- `public/assets/pan/uti-back.jpg`: Cropped back card ($640 \times 386$) with UTIITSL Navi Mumbai address & hologram.
- `public/assets/pan/uti-sheet.jpg`: Full side-by-side ($1280 \times 386$) sheet for UTIITSL.

### Pattern 2: Component Architecture (`PanCardCanvas.tsx`)
```tsx
export interface PanCardCanvasProps {
  data: PanCardData;
  side?: 'front' | 'back' | 'sheet';
  variant?: 'nsdl' | 'utiitsl';
  className?: string;
}
```
1. **`side === 'front'`**: Renders a single standard CR80 card using `nsdl-front.jpg` or `uti-front.jpg` as the background, overlaying the photograph, PAN number, applicant name, father's name, DOB, signature, and dynamic QR code at the verified percentage coordinates.
2. **`side === 'back'`**: Renders a single standard CR80 card using `nsdl-back.jpg` or `uti-back.jpg`, featuring the official return instructions, contact details, and security hologram.
3. **`side === 'sheet'`**: Renders the exact replica of `pan.php` — both front and back cards side-by-side with the center dashed fold guide and outer cut borders.

### Pattern 3: Split-Screen Studio Integration
In `src/app/studio/page.tsx` and `useCardStudio.ts`:
- Add template selector toggle: **NSDL (Standard)** vs **UTIITSL (e-PAN)**.
- Add print format toggle: **CR80 Individual Trays (Front & Back)** vs **Side-by-Side Foldable Sheet**.
- Synchronize form inputs with real-time card preview.

---

## 5. Don't Hand-Roll

1. **Do NOT hand-roll QR Code rendering:** Use existing `<CardQrCode>` which generates clean vector SVGs with error correction level M.
2. **Do NOT use fixed pixel offsets (`left: 142px`):** Hardcoded pixels break when the card is scaled between studio previews ($486\text{px} \times 306\text{px}$) and physical print trays ($85.60\text{mm} \times 53.98\text{mm}$). Use percentage coordinates ($35.5\%$, $42.3\%$).
3. **Do NOT hand-roll PDF generation:** Use existing `jspdf` + `html2canvas-pro` pipeline with calibrated DPI and 85.6mm × 53.98mm dimensions.

---

## 6. Common Pitfalls

1. **Print Background Omission:**
   - Browsers often omit CSS background images during printing by default.
   - **Solution:** Apply `print-color-adjust: exact; -webkit-print-color-adjust: exact;` on container elements, and support both `<img>` underlay and `background-image` layers.
2. **QR Code Overflow:**
   - Overly verbose QR strings can create dense matrices that are difficult for low-end phone cameras to read when printed at 25mm × 25mm.
   - **Solution:** Use standard compact XML format: `<PrintLetterBarcodeData uid="${panNumber}" name="${name}" dob="${dob}" gender="${gender || 'M'}" co="${fatherName}"/>`.
3. **DPI Drift on Physical PVC Trays:**
   - Ensure the outer tray container enforces `@page { size: 85.6mm 53.98mm; margin: 0; }` for tray mode, and standard A4 with proper margins for sheet mode.

---

## 7. Code Examples

### 7.1 XML QR String Generator
```typescript
export function getPanQrXmlString(data: PanCardData): string {
  if (data.qrData) return data.qrData;
  const panno = (data.panNumber || 'ABCDE1234F').toUpperCase();
  const name = (data.fullName || '').toUpperCase();
  const father = (data.fatherName || '').toUpperCase();
  const dob = data.dateOfBirth || '';
  const gender = data.gender || 'MALE';
  return `<?xml version="1.0" encoding="UTF-8"?><PrintLetterBarcodeData uid="${panno}" name="${name}" dob="${dob}" gender="${gender === 'FEMALE' ? 'F' : 'M'}" co="${father}"/>`;
}
```

### 7.2 Percentage Overlay Layout Pattern
```tsx
<div className="relative w-full h-full overflow-hidden select-none">
  {/* Official Background Template */}
  <img
    src={bgUrl}
    alt="PAN Card Template"
    className="absolute inset-0 w-full h-full object-fill pointer-events-none"
  />

  {/* Photo */}
  <div
    className="absolute overflow-hidden rounded-[1px] border border-[#718096]/80 bg-white"
    style={{ left: '6.75%', top: '35.23%', width: '15.0%', height: '24.87%' }}
  >
    {data.photoUrl ? (
      <img src={data.photoUrl} alt="Applicant" className="w-full h-full object-cover" />
    ) : (
      <UserPlaceholder />
    )}
  </div>

  {/* PAN Number */}
  <div
    className="absolute font-mono font-bold text-[#1A202C] tracking-wider leading-none"
    style={{ left: '35.5%', top: '42.28%', fontSize: 'calc(100% * 0.048)' }}
  >
    {data.panNumber}
  </div>

  {/* Name */}
  <div
    className="absolute font-sans font-bold uppercase text-[#1A202C] truncate leading-none"
    style={{ left: '8.25%', top: '62.59%', width: '48%', fontSize: 'calc(100% * 0.038)' }}
  >
    {data.fullName}
  </div>

  {/* Father's Name */}
  <div
    className="absolute font-sans font-bold uppercase text-[#1A202C] truncate leading-none"
    style={{ left: '8.50%', top: '75.03%', width: '48%', fontSize: 'calc(100% * 0.038)' }}
  >
    {data.fatherName}
  </div>

  {/* DOB */}
  <div
    className="absolute font-mono font-bold text-[#1A202C] leading-none"
    style={{ left: '8.25%', top: '90.36%', fontSize: 'calc(100% * 0.038)' }}
  >
    {data.dateOfBirth}
  </div>

  {/* Signature */}
  <div
    className="absolute overflow-hidden flex items-center justify-center"
    style={{ left: '37.0%', top: '84.97%', width: '16.25%', height: '10.36%' }}
  >
    {data.signatureUrl && (
      <img src={data.signatureUrl} alt="Signature" className="max-w-full max-h-full object-contain" />
    )}
  </div>

  {/* Scannable Dynamic QR Code */}
  <div
    className="absolute flex items-center justify-center"
    style={{ left: '61.75%', top: '24.46%', width: '27.5%', height: '45.6%' }}
  >
    <CardQrCode value={qrString} size={110} level="M" />
  </div>
</div>
```

---

## 8. Requirements Mapping & Success Criteria for Phase 8

- **PAN-01**: Asset preparation pipeline extracting high-res NSDL and UTIITSL front, back, and full sheet templates into `public/assets/pan/`.
- **PAN-02**: Extended `PanCardData` schema supporting `templateVariant?: 'nsdl' | 'utiitsl'`, `gender`, and `layoutFormat?: 'cr80' | 'sheet'`.
- **PAN-03**: Pixel-perfect `PanCardCanvas.tsx` matching legacy `pan.php` / `pan2.php` micro-coordinates with percentage responsiveness and crisp typography.
- **PAN-04**: Dynamic official XML QR barcode generator (`<PrintLetterBarcodeData ...>`).
- **PAN-05**: Interactive Split-Screen Studio integration: live switching between NSDL and UTIITSL variants, foldable sheet vs CR80 tray modes, with real-time form two-way sync and 1-click PDF/PNG downloads.
