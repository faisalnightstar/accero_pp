---
phase: 11-promo-code-coupon-management
plan: 02
status: completed
files_modified:
  - src/lib/payment/paytm.ts
  - src/actions/wallet.ts
---

## Summary
- Integrated promo code validation into `createPaytmPaymentOrder`: validates promo code on the server, calculates payable amount and bonus benefit, attaches promo code to payment record, and creates an `APPLIED` redemption record.
- Integrated bonus crediting into `verifyAndCreditPaytmPayment`: atomically transitions redemption to `COMPLETED` upon `TXN_SUCCESS`, updates promo code metrics (`totalRedeemed`, `budgetSpent`), and credits wallet with separate ledger entries (`WALLET_TOPUP` for purchased credit and `PROMO_BONUS` for promotional bonus).
- Prevented unauthorized double crediting via atomic idempotency checks and unique `paymentId` indexes.
- Handled payment failure gracefully by calling `failPromoRedemption` to mark redemptions `FAILED` without crediting bonuses or altering campaign metrics.

