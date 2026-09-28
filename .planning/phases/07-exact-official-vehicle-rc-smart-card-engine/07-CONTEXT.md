# Phase 7 Context: Exact Official Vehicle RC Smart Card Engine

## Purpose & User Intent
The user specifically requested to create a Vehicle Registration Certificate (RC) card matching **exactly with the original official government card**:
- "Create Vehicle RC matching exactly with original like govement card. Match everything color, font, text and image placement, backgound color"
- The user provided a high-resolution reference image showing both Front and Back of an official Indian Union Vehicle Registration Certificate (Form 23A) issued by Government of Uttar Pradesh.

## Visual Design Reference Analysis

### Front Side Architecture
1. **Background**:
   - Subtle cyan/sky-blue gradient (`#E0F2FE` fading into pure `#FFFFFF`) with smooth rounded card boundaries.
   - Circular light-blue crest backing behind the National Emblem of India in the top left.
2. **Top Header**:
   - Emblem: Black/dark-grey Lion Capital of Ashoka with "सत्यमेव जयते" banner.
   - Text Line 1: `Indian Union Vehicle Registration Certificate` (Dark charcoal, semi-bold sans-serif).
   - Text Line 2: `Issued by Government of [State]` (e.g. `Issued by Government of Uttar Pradesh`).
   - Top-Right Badges:
     - Left circle badge: Filled cyan (`#38BDF8`) with bold black text `NT` (Non-Transport).
     - Right circle badge: Filled orange/amber (`#F59E0B`) with bold black text `UP` (State Code).
3. **Smart Card Microchip**:
   - Standard 8-contact gold smart card chip with realistic circuit traces.
   - Directional Pointer: Solid blue triangle arrow (`◀`) facing left towards the edge.
4. **Data Hierarchy (Right of Chip)**:
   - Row 1: `Regn No` | `Date of Regn.` | `Regn. Validity` | `Owner Serial` (Circled number `①`).
   - Row 2: `Chassis No` (e.g. `MD626AK35N3K13433`).
   - Row 3: `Engine/Motor No` (e.g. `AK3KN3704338`).
   - Row 4: `Owner Name` (e.g. `ABU FAISAL`).
   - Row 5: `Son/Daughter/Wife of (In case of Individual Owner)` (e.g. `OBAIDULLA`).
   - Row 6: `Address` (e.g. `D-74, BETA 1 , GREATER NOIDA, Gautam Buddha Nagar -201308`).
5. **Left Margin (Below Chip)**:
   - `Fuel` (`PETROL`).
   - `Emission Norms` (`BHARAT STAGE VI`).
6. **Right Border (Rotated Text)**:
   - Rotated 90° text along right border: `Card Issue Date  (30-08-2026)`.

### Back Side Architecture (Form 23A)
1. **Top Header**:
   - Left: Dual circular badges (`NT` cyan circle and `UP` orange circle).
   - Right: `Vehicle Class:  M-CYCLE/SCOOTER` (Bold black header).
2. **Left Column**:
   - `Regn. Number` (Bold, above QR code).
   - Large dense square 2D QR code (Parivahan Vahan verification link).
   - `Month -Year of Mfg.` (e.g. `9/2022`).
   - `No of Cylinders: 0`.
3. **Right Column (Vehicle Specs)**:
   - `Maker:` (`TVS MOTOR COMPANY LTD`).
   - `Model:` (`TVSNTORQ125-SUPER SQUADEDITION`).
   - `Color:` (`BLACK`) & `/Body Type:` (`2 WHEELER`).
   - `Seating(in all) Capacity` (`0` or `2`).
   - `Unladen Weight (Kg)` (`0` or `118`).
   - `Cubic Cap.` (`124.8`) / `Horse Power (BHP/Kw)` (`0`) / `Wheel Base (mm)` (`0`).
   - `Financier` (`BANDHAN BANK LTD`).
   - `Registration Authority` (`Noida, Uttar Pradesh`).
4. **Far Right Border**:
   - Rotated 90° text along right border: `Form 23A`.

## Decisions & Architecture
- **D-01 (Type Extension)**: Extend `RcCardData` in `src/types/cards.ts` to support all detailed Form 23A fields with smart defaults and auto-derivation from registration number (e.g. `UP16...` automatically resolves state to Uttar Pradesh, state code to `UP`, transport type to `NT`).
- **D-02 (Canvas Fidelity)**: Overhaul `RcCardCanvas.tsx` to render the exact pixel-perfect Front and Back vector canvases matching all colors, fonts, badge pills, chip with pointer, QR positioning, and rotated text.
- **D-03 (Studio Integration)**: Update `CardForm.tsx` to expose all Form 23A parameters organized logically (Header, Vehicle Specs, Engine/Chassis, Owner Details, Administration).
- **D-04 (Sample Data & SEO)**: Update sample data across `servicesData.ts` and Studio defaults to reflect realistic official Form 23A specs.
