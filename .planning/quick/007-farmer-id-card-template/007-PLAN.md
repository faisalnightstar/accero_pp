# Quick Task 007: Farmer ID Card — Front & Back Print Template

## Objective
Implement a new, production-grade Farmer ID Card printing template in Accero PrintPortal based on the official AgriStack / Rajasthan Farmer Registry reference images:
- Front side: Farmer identity information, photo frame, regional & English names, gender, DOB, caste, area, privacy-masked Aadhaar, scannable QR code, prominent green Farmer ID, and vertical approval date.
- Back side: Address section, dynamic landholding records table (Khata, Khasra, Area with full precision), helpline, website, vertical download date, and department header.
- Background Assets:
  - Front background: Supplied blank background asset `public/assets/farmer/farmer-card.png`.
  - Back background: Generate `public/assets/farmer/farmer-card-back.png` by rotating the original background image exactly 180 degrees using lossless pixel rotation, maintaining identical dimensions (1576 × 998 px), textures, and foliage without distortion.
- Format: ISO/IEC 7810 ID-1 (CR80 standard: 85.60 mm × 53.98 mm, landscape) with full preview, flip, dual-card print tray calibration, and PDF/PNG export compatibility.
- Architecture: Strongly-typed data contract `FarmerCardData` in `src/types/cards.ts`, dynamic normalization layer `mapToFarmerCardData`, card studio integration, and full Vitest automated test suite.

## Deliverables
1. `public/assets/farmer/farmer-card-back.png`: 180-degree rotated lossless background image (1576 × 998 px).
2. `public/assets/farmer/farmer-card-front.png`: Front background asset referencing original 1576 × 998 px image.
3. `src/types/cards.ts`: Add `FarmerLandRecord` and `FarmerCardData` interfaces, `formatFarmerId`, `maskAadhaar`, and `mapToFarmerCardData` helpers. Update `DocumentType` to include `'farmer'`.
4. `src/components/cards/FarmerCardCanvas.tsx`: High-resolution, pixel-perfect front and back canvas component implementing AgriStack / Rajasthan Farmer Registry layout.
5. `src/app/cards/page.tsx`: Add Farmer ID tab to showcase page with realistic Rajasthan sample data, dual preview, flip mode, and print authorization.
6. `src/hooks/useCardStudio.ts`: Add `farmer` mock data and blank template.
7. `src/components/studio/CardForm.tsx` & `StudioSearchBar.tsx`: Add field controls and search configuration for Farmer ID documents.
8. `src/lib/missingFields.ts`: Add missing field validation rules for Farmer ID.
9. `src/lib/wallet/constants.ts` & `src/lib/wallet/pricing.ts`: Register `'FARMER'` service pricing.
10. `tests/farmer-card.test.ts`: Vitest test suite covering background asset dimensions and rotation, data mapping, land table precision, and canvas rendering.

