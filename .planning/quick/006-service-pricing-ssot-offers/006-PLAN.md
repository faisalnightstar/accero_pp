# Quick Task 006: Service Pricing Single Source of Truth, % OFF & Offer Management

## Objective
Establish a unified Single Source of Truth (SSOT) for Service Pricing across Accero PrintPortal, implement automatic and configurable `% OFF` discount handling with promotional offer badges, and provide full admin access to manage pricing and active offers:
- Define a centralized, strongly-typed Service Pricing catalog (`src/lib/wallet/pricing.ts` & `src/lib/wallet/constants.ts`) containing base/original prices, effective fees, discount percentages (`% OFF`), active offer states, and offer badges for all services (PAN, Aadhaar, Voter, DL, RC, Ration, Manual).
- Update Mongoose model `src/models/ServiceConfig.ts` to support `originalFee`, `discountPercent`, `offerActive`, `offerBadge`, and `offerDescription`, plus support for `'MANUAL'` service configuration.
- Enhance Admin actions and API (`src/actions/admin.ts`, `src/app/api/admin/services/route.ts`) to allow viewing, calculating, and saving base fees, % OFF, effective fees, and promotional offer settings, with audit logging.
- Redesign Admin UI in `src/app/admin/services/page.tsx` with controls for Original Price, % OFF slider/input, effective fee auto-sync, Offer Active toggle, Offer Badge input, and quick batch discount actions.
- Update public pricing page `src/app/pricing/page.tsx` to resolve rates dynamically from the SSOT with strike-through original prices, `% OFF` badges, and promotional offer callouts.
- Update Studio UI (`StudioSearchBar.tsx`, `QuickLookupModal.tsx`) and verification actions (`src/actions/verify.ts`) to reflect live fees, original prices, and `% OFF` savings badges.
- Add comprehensive Vitest coverage verifying SSOT resolution, % OFF calculations, fallback safety, and admin offer management.

## Deliverables
1. `src/models/ServiceConfig.ts`: Add `originalFee`, `discountPercent`, `offerActive`, `offerBadge`, `offerDescription` fields and extend `ServiceType` to include `'MANUAL'`.
2. `src/lib/wallet/constants.ts`: Define `DEFAULT_SERVICE_PRICING` as the single source of truth structure for all default rates, keeping `SERVICE_FEES` backward-compatible.
3. `src/lib/wallet/pricing.ts`: Implement `ResolvedServicePricing` with original fee, % OFF, and offer details; add `getPublicServicePricingCatalog()` and calculation helper functions.
4. `src/actions/admin.ts`: Update `getAdminServices()` and `updateAdminServiceConfig()` to manage original fees, % OFF discounts, and offer metadata with audit logging.
5. `src/app/api/admin/services/route.ts`: Support PATCH for all new pricing and offer fields.
6. `src/app/api/services/pricing/route.ts`: Create lightweight public GET endpoint for client components to consume live pricing and offers.
7. `src/actions/verify.ts`: Return original fee, discount percent, and offer status in `getServicePricingAction()`.
8. `src/app/admin/services/page.tsx`: Upgrade admin management interface with % OFF controls, offer toggles, badges, batch discount actions, and interactive savings preview.
9. `src/app/pricing/page.tsx`: Dynamically display rate card from SSOT with strike-through original prices, % OFF badges, and active offer highlights.
10. `src/components/studio/StudioSearchBar.tsx`: Render dynamic % OFF badge alongside service fee.
11. `src/components/dashboard/QuickLookupModal.tsx`: Sync fees with SSOT and display % OFF badges.
12. `src/lib/seo/servicesData.ts`: Synchronize SEO service configurations with SSOT pricing and discount metadata.
13. `tests/service-pricing-ssot.test.ts`: Automated Vitest test suite testing SSOT resolution, discount calculations, offer updates, and fallbacks.

