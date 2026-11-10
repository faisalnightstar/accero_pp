---
phase: 11-promo-code-coupon-management
plan: 01
status: completed
files_modified:
  - src/models/PromoCode.ts
  - src/models/PromoRedemption.ts
  - src/models/Wallet.ts
  - src/models/Payment.ts
  - src/lib/promo/service.ts
  - src/actions/promo.ts
---

## Summary
- Established `PromoCode` model with support for all 6 discount types (`FIXED_BONUS`, `PERCENTAGE_BONUS`, `FIXED_DISCOUNT`, `FIRST_RECHARGE`, `USER_SPECIFIC`, `REFERRAL`), redemption limits, budget limits, user restrictions, and validity windows.
- Established `PromoRedemption` model with unique index on `paymentId` enforcing strictly 1 redemption per payment order, status lifecycle (`APPLIED`, `COMPLETED`, `FAILED`, `CANCELLED`), and compound indexes for fast per-user redemption limit lookups.
- Enhanced `Wallet` model with separate `promotionalBalance` and `purchasedBalance`, and updated `IWalletTransaction` to track `isPromotional`, `promoCode`, and `promoCodeId`.
- Enhanced `Payment` model with `promoCode`, `promoCodeId`, `bonusAmount`, and `discountAmount`.
- Implemented `validatePromoCode` server-side validation service checking code existence, active status, validity window, min recharge amount, operator eligibility, first-recharge restrictions, per-user limits, campaign limits, and budget exhaustion.
- Implemented `src/actions/promo.ts` with customer validation actions, admin CRUD actions, redemption query actions, and analytics aggregations.

