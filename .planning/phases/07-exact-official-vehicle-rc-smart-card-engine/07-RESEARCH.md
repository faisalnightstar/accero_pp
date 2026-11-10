# Phase 7 Research: Exact Official Vehicle RC Smart Card Engine

## Visual Analysis & Layout Engineering

### 1. Dimension & Coordinate Space
- **Card Standard:** ISO/IEC 7810 ID-1 standard dimensions:
  - Width: 85.60 mm
  - Height: 53.98 mm
  - Aspect Ratio: ~1.586
  - Corner Radii: 3.18 mm
- **Screen Rendering Matrix:**
  - Base container 1x: 324px × 204px.
  - Studio preview 1.5x: 486px × 306px.
  - Print resolution: 300+ DPI vector SVG/HTML rendering locked to `@page { size: 85.6mm 53.98mm; margin: 0; }`.

### 2. Front Side Layout Blueprint
```
+-----------------------------------------------------------------------------------+
| [Ashoka Lion]  Indian Union Vehicle Registration Certificate            (NT) (UP) |
|   (on blue)    Issued by Government of Uttar Pradesh                              |
|                                                                                   |
|           Regn No       Date of Regn.   Regn. Validity    Owner                   |
| ◀ [CHIP]  UP05LD1234    22-Oct-2022     22-Oct-2037       Serial (1)              |
|           Chassis No                                                            C |
|           MR123RK21N5K12345                                                     a |
|           Engine/Motor No                                                       r |
|           AR1CH1234567                                                          d |
|           Owner Name                                                              |
| Fuel      ROHIT KHATRI                                                            I |
| PETROL    Son/Daughter/Wife of (In case of Individual Owner)                    s |
| Emission  SUBHASH KHATRI                                                             s |
| Norms     Address                                                               u |
| BHARAT    D-74, BETA 1 , GREATER NOIDA, Gautam Buddha                           e |
| STAGE VI  Nagar -201308                                                         ...
+-----------------------------------------------------------------------------------+
```

### 3. Back Side Layout Blueprint (Form 23A)
```
+-----------------------------------------------------------------------------------+
| (NT) (UP)   Vehicle Class: M-CYCLE/SCOOTER                                        |
|                                                                                   |
| Regn. Number          Maker: TVS MOTOR COMPANY LTD                                |
| UP05LD1234            Model: TVSNTORQ125-SUPER SQUADEDITION                       |
|                       Color: BLACK         /Body Type: 2 WHEELER                  |
| +------------------+  Seating(in all) Capacity: 0                               F |
| |                  |  Unladen Weight (Kg): 0                                    o |
| |   [DENSE 2D QR]  |  Cubic Cap.: 124.8 /Horse Power: 0 /Wheel Base: 0          r |
| |                  |  Financier: BANDHAN BANK LTD                               m |
| +------------------+                                                              |
| Month -Year of Mfg.   Registration Authority:                                   2 |
| 9/2022                Noida, Uttar Pradesh                                      3 |
| No of Cylinders: 0                                                              A |
+-----------------------------------------------------------------------------------+
```

### 4. Color Palette & Typography Specifications
- **Background Gradient:** `linear-gradient(135deg, #E0F2FE 0%, #FFFFFF 45%, #F0F9FF 100%)`.
- **Primary Text:** Dark Charcoal / Black (`#0F172A` / `#000000`) for maximum legibility on physical PVC printers.
- **Microchip Contact SVG:**
  - Gold gradient: `linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)`.
  - Circuit traces: Dark golden brown (`#92400E`).
  - Arrow Pointer: Solid royal blue (`#2563EB`) facing `◀`.
- **Badges:**
  - `NT`: Filled sky-cyan circle (`#38BDF8`), bold text `#000000`.
  - State (`UP`): Filled vibrant orange circle (`#F59E0B`), bold text `#000000`.
- **Circled Serial Number:** Clean circular badge with thin border around `1` or `①`.
- **Rotated Text:**
  - CSS: `writing-mode: vertical-rl; transform: rotate(180deg);` or `absolute right-1 text-[7px] text-gray-700 tracking-wider`.

### 5. Smart Derivation Utilities
- When `registrationNumber` is entered (e.g. `UP05LD1234`):
  - State code: first 2 characters (`UP`).
  - State name: mapped from `INDIAN_REGIONS` (e.g. `UP` -> `Uttar Pradesh`).
  - State Issued Text: `Issued by Government of Uttar Pradesh`.
  - Transport Type: Default `NT` (Non-Transport).
