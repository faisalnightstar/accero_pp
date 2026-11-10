# Phase 2: Preformatted Vector Card Canvas & Print Engine - Research

**Phase:** 02-preformatted-vector-card-canvas-print-engine
**Domain:** CR80 ISO/IEC 7810 ID-1 Physical Print Specs, Vector Card Canvas Rendering, QR Code Synthesis, Regional Typography, and High-DPI Export (PDF/PNG)
**Researched:** 2026-09-28
**Confidence:** HIGH

---

## 1. Physical Card Specifications & Print Engine

### ISO/IEC 7810 ID-1 (CR80) Standard
- **Dimensions:** 85.60 mm width × 53.98 mm height (3.370 in × 2.125 in).
- **Corner Radius:** 3.18 mm (~12px at 96 DPI screen scale, ~38px at 300 DPI print scale).
- **Aspect Ratio:** 1.5858 (approx 16:10).
- **Target PVC Printers:** Evolis Zenius/Primacy, Zebra ZC300, Fargo HDP5000, Magicard 300, and Epson L805/L850 ID card trays.

### Print Engine CSS Architecture (`@media print`)
- **Key Challenge:** Default browser print preview introduces headers, footers, and margins that shift physical card alignment on PVC printer trays.
- **Solution:** Strict `@page` rule with zero margins and exact physical dimension lock:
  ```css
  @page {
    size: 85.6mm 53.98mm;
    margin: 0;
  }
  @media print {
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: none !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print {
      display: none !important;
    }
    .cr80-card-page {
      width: 85.6mm !important;
      height: 53.98mm !important;
      page-break-after: always;
      page-break-inside: avoid;
      overflow: hidden !important;
      position: relative;
    }
  }
  ```
- **Dual-Mode Printing Support:**
  1. **Direct PVC Tray Mode:** Renders 1 card per page (Front on Page 1, Back on Page 2) matching 85.60 mm × 53.98 mm tray slot.
  2. **A4 Sheet Mode:** Renders Front and Back side-by-side or stacked with cutting alignment guides for paper lamination/pouch printing.

---

## 2. Card Canvas Anatomy & Vector Overlay Specifications

### Document 1: PAN Card (Permanent Account Number)
- **Front Layout:**
  - Header: "INCOME TAX DEPARTMENT / भारत सरकार GOVT. OF INDIA"
  - Emblem: Indian National Emblem (Ashoka Lions) & Government seal
  - Data: Permanent Account Number (large bold tracking), Full Name, Father's Name, Date of Birth (DD/MM/YYYY)
  - Visuals: Cardholder Photo (25mm × 35mm), Cardholder Signature box, High-density QR code (containing PAN verification string)
  - Background: Security guilloche wave pattern with light blue/buff tones
- **Back Layout:**
  - Microtext security lines, Income Tax PAN contact helpline, Barcode strip, Return instructions

### Document 2: Aadhaar Card (UIDAI Standard Format)
- **Front Layout:**
  - Header: Government of India / भारत सरकार & UIDAI Logo
  - Emblem: Ashoka Lions header
  - Data: Cardholder Name in Regional Language (Devanagari/Hind) + English, Date of Birth / जन्म तिथि, Gender (Regional + English), 12-digit Aadhaar Number formatted as `XXXX XXXX 1234` or full
  - Visuals: Enrolment/Download date, Cardholder Photo, UIDAI Tricolor guilloche strip, Tagline: "मेरा आधार, मेरी पहचान"
- **Back Layout:**
  - Data: Address in Regional Language + English, Care Of (C/O or S/O)
  - Visuals: Secure 2D QR Code (UIDAI XML string format `<PrintLetterBarcodeData ... />`), UIDAI helpline `1947`, help@uidai.gov.in, website www.uidai.gov.in

### Document 3: Voter ID Card (Election Commission of India - EPIC)
- **Front Layout:**
  - Header: ELECTION COMMISSION OF INDIA / भारत निर्वाचन आयोग
  - Security Element: Hologram band / emblem
  - Data: EPIC Number (e.g. `ABC0123456`), Elector Name (Regional + English), Father's/Husband's Name (Regional + English), Gender, Age / DOB
  - Visuals: Black and white / color portrait, ECI crest
- **Back Layout:**
  - Data: Assembly Constituency No & Name (e.g. `14 - GOVINDGANJ`), Part No & Name (e.g. `257 - PRATHMIK VIDYALAY...`), Full Address (Regional + English)
  - Visuals: ECI Barcode / QR Code, Electoral Registration Officer digital signature & issue date

### Document 4: Driving License (Parivahan Standard Format)
- **Front Layout:**
  - Header: UNION OF INDIA / STATE NAME (e.g. UTTAR PRADESH), TRANSPORT DEPARTMENT
  - Chip: Smart Card gold chip graphic
  - Data: DL Number, Issue Date, Validity (Non-Transport & Transport), Cardholder Name, Son/Daughter/Wife of, Date of Birth, Blood Group, Address
  - Vehicle Authorization Badges: MCWG (Motorcycle with Gear), LMV (Light Motor Vehicle), HMV, etc.
  - Visuals: Driver Photograph, Driver Signature
- **Back Layout:**
  - Vehicle Category classification table with endorsement dates, Issuing Authority seal, Barcode / QR Code, Emergency contact details

### Document 5: Vehicle Registration Certificate (Form 23 - RC)
- **Front Layout:**
  - Header: FORM 23 / CERTIFICATE OF REGISTRATION, INDIAN UNION VEHICLE REGISTRATION
  - Data: Registration Number (e.g. `UP05LD1234`), Registration Date, Chassis Number, Engine Number, Owner Full Name, S/W/D of, Current Residential Address, Vehicle Class (Motor Car / Scooter), Maker/Model
- **Back Layout:**
  - Data: Fuel Type (Petrol/Diesel/CNG/EV), Emission Norm (BS IV/VI), Seating Capacity, Unladen/Laden Weight, Hypothecated To (Financier Bank if any), Fitness Valid Upto, Tax Paid Upto, Issuing Authority seal & QR code

---

## 3. Dynamic QR Code Synthesis (`qrcode` package)
- **Engine:** Client-side generation using `qrcode` library to generate vector SVG or high-res base64 data URLs without third-party API dependencies (zero latency, offline capability).
- **Encoding Formats:**
  - **PAN:** `PAN: <panNo> | Name: <name> | Father: <fatherName> | DOB: <dob>`
  - **Aadhaar:** Standard UIDAI XML block `<PrintLetterBarcodeData uid="..." name="..." gender="..." dob="..." co="..." house="..." street="..." dist="..." state="..." pc="..." />`
  - **Voter ID:** ECI verification link `https://electoralsearch.eci.gov.in/?epic=<epicNo>`
  - **DL / RC:** Parivahan verification string or JSON payload.

---

## 4. Regional Typography & Font Rendering
- **Fonts Required:**
  - English: `Inter` / `Roboto` (system and modern look)
  - Devanagari (Hindi, Marathi, etc.): `Noto Sans Devanagari` / `Hind`
  - Bengali / Assamese: `Noto Sans Bengali`
  - Telugu: `Noto Sans Telugu`
  - Tamil: `Noto Sans Tamil`
  - Gujarati: `Noto Sans Gujarati`
  - Kannada: `Noto Sans Kannada`
- **Implementation:** Imported through `next/font/google` with optimal font-display and preloading to eliminate FOUT (Flash of Unstyled Text) during card rendering and print spooling.

---

## 5. 1-Click High-DPI PDF & PNG Export Architecture
- **Libraries:**
  - `jspdf`: Pure client-side PDF construction with custom CR80 page dimensions `[85.60, 53.98]` in millimeters.
  - `html2canvas`: High-DPI DOM canvas rasterization. By setting `scale: 4` (or `window.devicePixelRatio * 3`), the rendered canvas achieves 300+ DPI resolution for crisp print outputs.
- **Workflow:**
  1. Capture `.cr80-card-front` and `.cr80-card-back` DOM nodes.
  2. Rasterize via `html2canvas` at 300+ DPI.
  3. Create PDF: `new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.60, 53.98] })`.
  4. Page 1: Add Front image `(0, 0, 85.60, 53.98)`.
  5. Page 2: `doc.addPage([85.60, 53.98], 'landscape')` and add Back image.
  6. Save as `<document_type>_<id_number>.pdf`.
  7. PNG Export: Direct download of Front / Back images with 1-click.
