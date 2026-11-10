# Phase 7 Context: Exact Official Vehicle RC Smart Card Engine

## Purpose & User Intent
The user specifically requested to create a Vehicle Registration Certificate (RC) card matching **exactly with the original official government card**:
- "Create Vehicle RC matching exactly with original like govement card. Match everything color, font, text and image placement, backgound color"
- The user provided a high-resolution reference image showing both Front and Back of an official Indian Union Vehicle Registration Certificate (Form 23A) issued by Government of Uttar Pradesh.

## Visual Design Reference Analysis

### Front Side Architecture
1. **Background**:
   - Subtle cyan/sky-blue gradient (`bg-gradient-to-br from-[#E0F2FE] via-white to-[#F0F9FF]`) with clean rounded card boundary (3.18mm radius).
   - Circular light-blue crest backing behind the National Emblem of India in the top left.
2. **Top Header**:
   - Emblem: Black/dark-grey Lion Capital of Ashoka with "सत्यमेव जयते" banner.
   - Text Line 1: `Indian Union Vehicle Registration Certificate` (Dark charcoal, semi-bold sans-serif).
   - Text Line 2: `Issued by Government of [State]` (e.g. `Issued by Government of Uttar Pradesh`).
   - Top-Right Badges:
     - Left circle badge: Filled cyan (`#38BDF8`) with bold black text `NT` (Non-Transport).
     - Right circle badge: Filled orange/amber (`#F59E0B`) with bold black text `UP` (or dynamic state code).
3. **Smart Card Microchip**:
   - Standard 8-contact gold smart card chip with realistic circuit traces.
   - Directional Pointer: Solid royal blue triangle arrow (`◀`) placed to the left of the chip.
4. **Data Hierarchy (Right of Chip)**:
   - Row 1: `Regn No` | `Date of Regn.` | `Regn. Validity` | `Owner Serial` (Circled number `①`).
   - Row 2: `Chassis No` (e.g. `MR123RK21N5K12345`).
   - Row 3: `Engine/Motor No` (e.g. `AR1CH1234567`).
   - Row 4: `Owner Name` (e.g. `ROHIT KHATRI`).
   - Row 5: `Son/Daughter/Wife of (In case of Individual Owner)` (e.g. `SUBHASH KHATRI`).
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

## Confirmed Implementation Decisions

### 1. Dynamic State Theming with Smart Defaults
- **Decision:** Auto-derive the state name, state badge code (`UP`, `DL`, `MH`, etc.), and default authority from the first two characters of the registration number, defaulting to Uttar Pradesh (`UP`) matching the reference image.
- **Outcome:** Provides 100% authentic parity with UP cards while giving nationwide adaptability for any Indian vehicle registration.

### 2. Exact Literal Fallbacks for Technical Specs
- **Decision:** Display literal "0" or "NA" when technical specifications (Cylinders, BHP, Wheelbase, Unladen Weight) are 0 or unprovided, exactly matching official government Form 23A print behavior.
- **Outcome:** Zero blank/broken layouts; strictly conforms to Parivahan smart card print convention.

### 3. Grouped Studio Form Layout
- **Decision:** Group the 20+ Form 23A fields in `src/components/studio/CardForm.tsx` into clean sections:
  1. Registration & Badges (`registrationNumber`, `registrationDate`, `regnValidity`, `ownerSerial`, `stateCode`, `transportType`)
  2. Vehicle Identification (`chassisNumber`, `engineNumber`, `vehicleClass`, `maker`, `model`, `bodyType`, `color`)
  3. Owner Particulars (`ownerName`, `sonWifeDaughterOf`, `address`)
  4. Technical Specifications (`fuelType`, `emissionNorm`, `seatingCapacity`, `unladenWeight`, `cubicCapacity`, `horsePower`, `wheelBase`, `monthYearOfMfg`, `noOfCylinders`)
  5. Financial & Administration (`financier`, `registeringAuthority`, `cardIssueDate`)
- **Outcome:** High-efficiency, zero-clutter editing workflow with real-time two-way synchronization.

## Canonical References
- Schema: [`src/types/cards.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/types/cards.ts)
- Canvas: [`src/components/cards/RcCardCanvas.tsx`](file:///Users/faisal/Documents/GitHub/accero_pp/src/components/cards/RcCardCanvas.tsx)
- Emblems: [`src/components/cards/Emblems.tsx`](file:///Users/faisal/Documents/GitHub/accero_pp/src/components/cards/Emblems.tsx)
- Container: [`src/components/cards/Cr80CardContainer.tsx`](file:///Users/faisal/Documents/GitHub/accero_pp/src/components/cards/Cr80CardContainer.tsx)
- Studio Form: [`src/components/studio/CardForm.tsx`](file:///Users/faisal/Documents/GitHub/accero_pp/src/components/studio/CardForm.tsx)
- SEO & Sample Data: [`src/lib/seo/servicesData.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/lib/seo/servicesData.ts)
