# Quick Task 007 Summary: Farmer ID Card — Front & Back Print Template

## Completed Work
1. **Background Asset Processing & Derivation**:
   - Original front background asset: `public/assets/farmer/farmer-card.png` (1576 × 998 px).
   - Reusable front background: `public/assets/farmer/farmer-card-front.png` (1576 × 998 px).
   - Reusable back background: `public/assets/farmer/farmer-card-back.png` (1576 × 998 px) and `farmer-card-back.jpeg` generated via exact 180-degree lossless coordinate transposition (`im.transpose(Image.Transpose.ROTATE_180)`), ensuring identical aspect ratio, texture preservation, and orientation invariance.
   - Official AgriStack transparent header asset: `public/assets/farmer/farmer-card-logo.png` (905 × 276 px) and `public/assets/farmer/agristack-logo.svg`.
2. **Data Mapping & Type System**:
   - Extended `DocumentType` in `src/types/cards.ts` to include `'farmer'`.
   - Defined `FarmerLandRecord` (khata, khasra, area) and `FarmerCardData` interfaces.
   - Implemented helper functions:
     - `formatFarmerId`: formats 11-digit or 12-digit IDs into standard `4256 177 6703` grouping.
     - `maskAadhaarNumber`: masks 12-digit Aadhaar for privacy compliance (`XXXXXXXX9250` or `XXXX XXXX 9250`).
     - `formatFarmerAddress`: formats father/spouse, locality, village, tehsil, district, state, and pin into a clean comma-separated line.
     - `mapToFarmerCardData`: normalizes raw API payloads from legacy AgriStack endpoints or external providers into `FarmerCardData`, preserving exact land area precision (`0.000833`).
3. **Farmer Card Canvas Component**:
   - Created `src/components/cards/FarmerCardCanvas.tsx` for ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm, landscape).
   - **Front Side**:
     - Official AgriStack logo (left), department heading "भारत सरकार / Government of India" (center), and Ashoka Lion Capital emblem with Satyameva Jayate (right).
     - Vertical left margin text: `Approval Date: {data.approvalDate}`.
     - Left photo frame with aspect ratio preservation and graceful missing photo silhouette.
     - Structured two-column farmer info table (Regional Name, English Name, Gender, DOB, Caste, Area, Aadhaar).
     - Scannable dynamic QR code via `<CardQrCode>`.
     - Prominent bold green `Farmer ID : {formattedId}` above gold separator line.
     - Centered `Rajasthan Farmer Registry` footer banner.
   - **Back Side**:
     - 180-degree rotated background asset (`farmer-card-back.png`).
     - Strictly upright, non-rotated foreground layout.
     - Vertical left margin text: `Download Date: {data.downloadDate}`.
     - Ministry header: "Ministry of Agri & Farmers Welfare".
     - Full address section with automatic word wrapping.
     - Dynamic landholding information table with headers `Khata | Khasra | Area`, supporting multiple parcels and preserving decimal precision.
     - Bottom footer with toll-free helpline `1800-180-1551` and official website `www.rjfr.agristack.gov.in`.
   - **Sheet Mode**:
     - Side-by-side dual card layout for sheet printing and dual PVC card tray calibration.
4. **Multi-Lingual Regional Translation & Auto-Translate Engine**:
   - Created `src/lib/farmerLanguages.ts`: comprehensive dictionary supporting 12 major Indian languages (`HI`, `EN`, `PA`, `GU`, `MR`, `TA`, `TE`, `KN`, `BN`, `OR`, `ML`, `AS`).
   - Implemented `translateFarmerText`: Google Translate GTX client integration for real-time translation of dynamic name and text payloads into any regional script.
   - Built **Auto-Translate** capabilities in `src/components/studio/CardForm.tsx`:
     - Global **Auto-Translate** button with `Sparkles` icon next to the language selector.
     - Auto-translation trigger on regional language dropdown change.
     - Inline **Auto-Translate** button on `Farmer Name (Regional / Hindi)` and blur auto-translation from English name.
     - Inline **Auto-Fill** buttons for `Department Header (Regional)` and `Ministry Header (Regional)` from the official registry dictionary.
     - Auto-mapping of localized gender (`genderRegional`, e.g. `पुरुष`, `ஆண்`, `ਪੁਰਸ਼`, etc.).
   - Live language selector pills integrated into the Cards preview (`src/app/cards/page.tsx`) and Studio CardForm (`src/components/studio/CardForm.tsx`).
5. **Mongoose Wallet Schema Validation Fix**:
   - Resolved `Wallet validation failed: transactions.X.docType: 'FARMER' is not a valid enum value for path 'docType'`.
   - Updated `src/models/Wallet.ts` to include `'FARMER'` in both `IWalletTransaction.docType` type union and `WalletTransactionSchema.docType.enum`.
   - Added schema validation tests to ensure zero regressions in billing/deductions.
6. **Platform Integration**:
   - Integrated into Cards Showcase (`src/app/cards/page.tsx`) with realistic Rajasthan Farmer Registry sample data, front/back switching, zoom, language switcher, and dual tray printing.
   - Integrated into Card Studio (`src/app/studio/page.tsx`, `useCardStudio.ts`, `CardForm.tsx`, `StudioSearchBar.tsx`).
   - Added completeness rules in `src/lib/missingFields.ts`.
   - Registered `'FARMER'` service pricing in `src/lib/wallet/constants.ts` (₹25 with 50% OFF promotional badge).
   - Added mock provider support in `src/lib/verify/providers/mock.ts`.
7. **Quality Assurance & Verification**:
   - Created and expanded `tests/farmer-card.test.ts` to 17 tests covering background rotation, data mapping, land precision, completeness, service pricing, 12-language dictionary configs, and Mongoose Wallet transaction enum validation.
   - Ran all 24 test suites across the application (260 tests passing, 0 failing).
   - Verified TypeScript compilation (`npx tsc --noEmit` passed with 0 errors).
   - Completed Next.js production build (`npm run build` passed with code 0).

