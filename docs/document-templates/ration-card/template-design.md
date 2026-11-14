# Ration Card Document Template Design Specification

**Document Version:** 1.0.0  
**Target Platform:** Accero PrintPortal Next.js (App Router)  
**Standard Compliance:** ISO/IEC 7810 ID-1 (CR80 Credit Card Format)  
**Output Target:** Thermal Dye-Sublimation PVC Card Printers (Dual-Card Tray & Direct-to-Card)

---

## 1. Physical Specifications & Dimensions

The Accero Ration Card template strictly conforms to the international standard for identity and transaction cards:

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Card Standard** | ISO/IEC 7810 ID-1 (CR80) | Standard PVC card specification |
| **Width** | 85.60 mm | 3.370 inches |
| **Height** | 53.98 mm | 2.125 inches |
| **Corner Radius** | 3.18 mm | 0.125 inches / standard rounded corner |
| **Aspect Ratio** | ~ 1.586 : 1 | Golden ratio approximation for ID-1 |
| **Print Resolution** | 300+ DPI | Scalable vector SVG & high-density typography |
| **Orientation** | Landscape | Front and reverse sides match orientation |
| **Tray Spacing** | 5.00 mm | Precise gutter spacing for dual-card PVC trays |

---

## 2. Visual Hierarchy & Color Psychology

Ration cards in India operate under the **National Food Security Act (NFSA)** and state food civil supplies departments. Visual identification of the cardholder's entitlement category is critical for fair price shop (FPS) dealers and inspection officers.

The Accero Ration Card template incorporates dynamic category-driven color palettes:

### Category Schemes

| Category Code | Description (Hindi / English) | Primary Accent | Secondary Accent | Header Gradient / Border |
| :--- | :--- | :--- | :--- | :--- |
| **PHH** | पात्र गृहस्थी / Priority Household | `#15803d` (Emerald) | `#166534` (Forest) | `from-emerald-700 to-green-900` |
| **AAY** | अंत्योदय अन्न योजना / Antyodaya | `#b45309` (Amber Gold) | `#92400e` (Deep Ochre)| `from-amber-600 to-yellow-800` |
| **BPL** | गरीबी रेखा से नीचे / Below Poverty Line | `#1d4ed8` (Royal Blue) | `#1e40af` (Navy) | `from-blue-700 to-indigo-900` |
| **APL** | गरीबी रेखा से ऊपर / Above Poverty Line | `#c2410c` (Saffron/Rust) | `#9a3412` (Bronze) | `from-orange-700 to-red-900` |
| **WHITE** | गैर-सब्सिडी / Non-Subsidized | `#475569` (Slate) | `#334155` (Charcoal) | `from-slate-700 to-slate-900` |

---

## 3. Typography & Regional Script Rendering

To guarantee maximum legibility on physical thermal print surfaces, the template utilizes a dual-language typographic stack:

- **English Typography:** Inter, Roboto, Arial, sans-serif for numbers, codes, labels, and standard Latin script.
- **Regional Typography:** Hind, Noto Sans Devanagari, Mangal, Nirmala UI for Hindi, Marathi, Bengali, Tamil, Telugu, and other regional scripts.
- **Numbers & Dates:** High-contrast tabular figures (`font-mono`) for Ration Card numbers, Aadhaar masks, FPS codes, and dates to prevent visual ambiguity.

---

## 4. Front-Side Structure & Anatomy

The front face of the card serves as primary identification for the Head of Family (HoF):

```
+-------------------------------------------------------------------------------+
| [Emblem] खाद्य एवं रसद विभाग / Food & Civil Supplies Dept     [NFSA Logo]    |
|          राष्ट्रीय खाद्य सुरक्षा पोर्टल / NFSA Government of India             |
|-------------------------------------------------------------------------------|
|  +---------+   RATION CARD NO: 1045 8892 1432   [CATEGORY: PHH]               |
|  |         |   ------------------------------------------------               |
|  |  PHOTO  |   Head of Family : Sunita Devi (सुनीता देवी)                     |
|  |  (HoF)  |   Father/Husband : Ramesh Kumar (रमेश कुमार)                     |
|  |         |   Family Members : 4 | Gender: Female | Age: 42                  |
|  +---------+   Fair Price Shop: 2049102 - Sharma Gramin Store                 |
|                Gas Connection : Indian Oil Corp (IOCL) - LPG Subsidy          |
|-------------------------------------------------------------------------------|
| [QR CODE]  Card Issue Date: 12/04/2021 | Status: Active | NFSA Beneficiary    |
+-------------------------------------------------------------------------------+
```

### Key Front-Side Elements:
1. **Header Block:**
   - National Ashoka Lion Capital Emblem with *Satyameva Jayate*.
   - Bilingual department branding (Hindi + English).
   - Official Department of Food & Public Distribution / NFSA crest.
2. **Category Indicator Ribbon:**
   - High-visibility badge with category code (`PHH`, `AAY`, `BPL`, `APL`, `WHITE`).
   - Micro-print security border.
3. **Head of Family Photograph:**
   - Aspect ratio 3:4 (22 mm × 28 mm physical size on card).
   - High-contrast border with subtle inner bevel.
4. **Primary Metadata:**
   - Prominent 12-digit Ration Card Number in grouped monospace chunks (`XXXX XXXX XXXX`).
   - Head of Family Name in English and Regional script.
   - Father / Husband Name in English and Regional script.
   - Total registered beneficiary member count.
   - Fair Price Shop (FPS) dealer code and shop name.
   - Domestic LPG / Gas connection status.
5. **Security & Verification Footer:**
   - Dynamic 2D QR Code containing encrypted verification URL and payload (`RC:104588921432|HOF:Sunita Devi|FPS:2049102|CAT:PHH|MEM:4`).
   - One Nation One Ration Card (ONORC) interoperability compliance seal.
   - Subtle anti-counterfeiting guilloche wavy micro-lines.

---

## 5. Reverse-Side Structure & Continuation Pagination

The reverse face details the household residence and lists registered family members entitled to grain rations:

```
+-------------------------------------------------------------------------------+
| [Wheat] पारिवारिक सदस्यों का विवरण / FAMILY BENEFICIARY MEMBERS     [ONORC]   |
|-------------------------------------------------------------------------------|
| S.No | Member Name        | Aadhaar Status | Relation | Age | Gender          |
|-------------------------------------------------------------------------------|
|  01  | Sunita Devi        | *******1042    | Self/HoF | 42  | Female          |
|  02  | Ramesh Kumar       | *******9821    | Husband  | 45  | Male            |
|  03  | Priya Kumari       | *******4412    | Daughter | 18  | Female          |
|  04  | Amit Kumar         | *******6733    | Son      | 14  | Male            |
|-------------------------------------------------------------------------------|
| Full Residential Address:                                                     |
| H.No 142, Ward No. 4, Village Rampur, Tehsil Sadar, Varanasi, UP - 221001    |
| FPS Code: 2049102 | Sub-District: Sadar | District: Varanasi | State: UP      |
| Helpline: 1967 / 1800-1800-150 | nfsa.gov.in                                  |
+-------------------------------------------------------------------------------+
```

### Continuation Pagination Strategy for Large Families (> 5 Members):
A fundamental flaw of legacy PHP implementations (`ration_card.php`) was dropping or visually clipping family members when the count exceeded 4 or 5.

Accero PrintPortal solves this permanently through **Continuation Pagination**:
1. **Primary Reverse Card (Page 1):**
   - Displays members 1 to 5.
   - Displays complete household address, administrative jurisdiction, and helpline footer.
2. **Continuation Card (Page 2+):**
   - When `members.length > 5`, the canvas generates continuation cards (`memberPage = 2`).
   - Continuation cards carry a dedicated sub-header: `ADDITIONAL BENEFICIARIES (Page 2 of 2)`.
   - In `sheet` print mode, continuation cards are positioned into consecutive tray slots (`continuation-tray-p2`), ensuring the print operator gets a complete physical multi-card set without missing a single family beneficiary.

---

## 6. Print Stylesheet & Tray Alignment

The print styling uses exact CSS units (`mm`) to prevent browser scaling inconsistencies:

```css
@media print {
  @page {
    size: A4 portrait;
    margin: 10mm 15mm;
  }
  
  .print-card-cr80 {
    width: 85.60mm !important;
    height: 53.98mm !important;
    border-radius: 3.18mm !important;
    overflow: hidden !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .print-dual-tray {
    display: flex !important;
    flex-direction: row !important;
    gap: 5.00mm !important;
    justify-content: center !important;
    align-items: center !important;
  }
}
```

This guarantees 1:1 physical card tray placement across Epson, Canon, Magicard, Fargo, and Zebra card printers.
