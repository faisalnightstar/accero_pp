---
phase: 11-promo-code-coupon-management
plan: 03
status: completed
files_modified:
  - src/components/wallet/RechargeModal.tsx
  - src/app/wallet/page.tsx
  - src/app/api/promo/validate/route.ts
---

## Summary
- Added dedicated Promo Code input section to `RechargeModal.tsx` with uppercase formatting, `[Apply Code]` button, and loading spinner.
- Implemented real-time calculation breakdown displaying Recharge Amount, Promotional Bonus / Instant Discount, and Total Wallet Credit.
- Supported removing or replacing applied promo codes prior to payment generation.
- Displayed promo code rules (minimum recharge requirement, validity dates, eligibility badges).
- Updated Paytm UPI QR generation to automatically reflect discounted payable amounts and applied campaign references.
- Updated `src/app/wallet/page.tsx` to display separate promotional credits indicator within the Available Balance card.
- Created `/api/promo/validate` endpoint for server-side coupon preview queries.

