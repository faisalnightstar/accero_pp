# Phase 7 Plan 01 Summary: Official Form 23A Vehicle RC Schema & Vector Canvases

## Objectives Achieved
1. **Extended Data Schema (`src/types/cards.ts`)**:
   - Upgraded `RcCardData` interface with all official Form 23A attributes:
     - `stateIssued`, `stateCode`, `transportType`, `ownerSerial`, `regnValidity`, `cardIssueDate`
     - `maker`, `model`, `bodyType`, `cubicCapacity`, `horsePower`, `wheelBase`, `monthYearOfMfg`, `noOfCylinders`
     - `financier`, `registeringAuthority`, `qrPayload`
   - Added `STATE_CODE_TO_NAME` mapping covering all Indian states and Union Territories.
   - Implemented `getRcDerivedValues` smart derivation helper to auto-compute state, authority, and transport types from registration number prefixes with Uttar Pradesh defaults.
2. **Specialized Emblem & Graphic Components (`src/components/cards/Emblems.tsx`)**:
   - `RcSmartChipWithPointer`: 8-contact gold smart card microchip with realistic circuit traces and royal blue directional arrow pointer (`◀`).
   - `RcCircleBadge`: Circular badge pill rendering `NT` (Cyan circle) and state code (Orange circle).
   - `RcAshokaCrest`: Lion Capital of Ashoka with a light-blue curved crest background accent.
3. **Pixel-Perfect Vector Canvas Overhaul (`src/components/cards/RcCardCanvas.tsx`)**:
   - **Front Canvas**:
     - Background: Subtle sky gradient (`bg-gradient-to-br from-[#E0F2FE] via-white to-[#F0F9FF]`) with standard 3.18mm rounded corners.
     - Header: Lion Capital crest, `Indian Union Vehicle Registration Certificate`, `Issued by Government of [State]`, and dual `NT`/state circular badges.
     - Left Column: `RcSmartChipWithPointer`, `Fuel: PETROL`, `Emission Norms: BHARAT STAGE VI`.
     - Right Column: 6-row label/value hierarchy (Regn No, Date of Regn., Regn. Validity, Owner Serial ①, Chassis No, Engine No, Owner Name, Father Name, Address).
     - Rotated right border label: `Card Issue Date  (DD-MM-YYYY)`.
   - **Back Canvas (Form 23A)**:
     - Header: Dual circular badges (`NT` and state code) with `Vehicle Class:` header.
     - Left Column: `Regn. Number`, dense square 2D QR code, `Month -Year of Mfg.`, `No of Cylinders`.
     - Right Column: Maker, Model, Color / Body Type, Seating Capacity, Unladen Weight, Cubic Cap. / Horse Power / Wheel Base, Financier, Registration Authority.
     - Rotated right border label: `Form 23A`.

## Verification
- `npx tsc --noEmit` exited with code 0.
- Dev server verified via HTTP 200 on `/services/vehicle-rc`.
- Vector canvas HTML rendered with exact header and field structure.
