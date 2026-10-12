# Plan 08-01 Summary: PAN Asset Pipeline, Schema Extension & Canvas Overhaul

## Executed Tasks
1. **Asset Pipeline:**
   - Extracted high-resolution assets into `public/assets/pan/`:
     - `nsdl-front.jpg` ($640 \times 386$, 104 KB)
     - `nsdl-back.jpg` ($640 \times 386$, 103 KB)
     - `nsdl-sheet.jpg` ($1280 \times 386$, 207 KB)
     - `uti-front.jpg` ($640 \times 386$, 82 KB)
     - `uti-back.jpg` ($640 \times 386$, 84 KB)
     - `uti-sheet.jpg` ($1280 \times 386$, 165 KB)
2. **Schema Extension & QR Formatter:**
   - Updated `PanCardData` in `src/types/cards.ts` with `templateVariant?: 'nsdl' | 'utiitsl'`, `gender?: 'MALE' | 'FEMALE' | 'OTHER'`, and `layoutFormat?: 'cr80' | 'sheet'`.
   - Exported `getPanQrXmlString()` to generate official Income Tax / UIDAI XML barcode payload `<PrintLetterBarcodeData uid="..." .../>`.
3. **Overhauled PanCardCanvas:**
   - Implemented `PanCardCanvas.tsx` supporting `side === 'front'`, `side === 'back'`, and `side === 'sheet'`.
   - Mapped all fields to verified responsive percentage micro-coordinates from `pan.php` / `pan2.php`.
   - Configured exact CSS print color preservation (`printColorAdjust: 'exact'`).

## Verification
- Verified image files and resolutions in `public/assets/pan/`.
- Verified TypeScript types compile cleanly with `npx tsc --noEmit`.
