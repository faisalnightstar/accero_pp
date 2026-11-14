# Quick Task 008: Ration Card — Front & Back Print Template & Studio Integration

## Objective
Implement a production-grade National Food Security Act (NFSA) / Department of Food & Civil Supplies **Smart Ration Card** printing template and studio workflow in Accero PrintPortal:
- Conforms strictly to **ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm, landscape)** for PVC card tray printing.
- Front side: National / State food department header, National Emblem of India (Ashoka Crest), ONORC / NFSA crest, prominent Ration Card Number, dynamic Scheme/Category badge (AAY, PHH, BPL, APL, WHITE), Head of Family photo & bilingual name, Father/Spouse name, Fair Price Shop (FPS) code & name, gas connection status, total member count, and scannable QR verification code.
- Back side: Family Members micro-table (Sl No, Member Name, Relationship, Gender, Age, Aadhaar Seeding status), full bilingual address, FPS jurisdiction, NFSA legal notice, and 1967 toll-free helpline.
- Sheet mode: Side-by-side dual card tray print format (Front on Left, Back on Right) with exact print-color-adjust and tray margin calibration.
- Full Card Studio integration: Split-screen live preview, Zero Missing-Data Engine, interactive family member manager (add, edit, remove members with auto memberCount sync), photo upload, and instant search bar lookup.
- Card Showcase integration: Dedicated Ration Card tab in `/cards` with flip mode, dual preview, and print authorization.
- Automated tests: Comprehensive Vitest test suite (`tests/ration-card.test.ts`).

## Deliverables
1. `.planning/quick/008-ration-card-template/008-PLAN.md`: Implementation specification.
2. `src/types/cards.ts`: Expand `RationCardData` and `RationFamilyMember` data contracts, add `formatRationCardNumber` and `mapToRationCardData` helpers.
3. `src/components/cards/RationCardCanvas.tsx`: High-resolution, pixel-perfect front, back, and sheet canvas component with authentic NFSA/State food security styling.
4. `src/components/cards/Emblems.tsx`: Add vector `NfsaWheatEmblem` and `OnorcBadge` for authentic government food scheme branding.
5. `src/lib/missingFields.ts`: Add Ration Card completeness evaluation rules and zero-missing-data checks.
6. `src/hooks/useCardStudio.ts`: Provide rich initial mock data and blank template for `'ration'`.
7. `src/components/studio/CardForm.tsx`: Add Ration Card form section with interactive family member manager, category selector, FPS details, and photo upload.
8. `src/components/studio/StudioSearchBar.tsx`: Add Ration Card search resolver and placeholder.
9. `src/app/cards/page.tsx`: Add Ration Card tab to showcase page with realistic NFSA sample data and dual preview.
10. `tests/ration-card.test.ts`: Vitest automated test suite covering data mapping, family members table, category colors, missing field scoring, and service pricing.
