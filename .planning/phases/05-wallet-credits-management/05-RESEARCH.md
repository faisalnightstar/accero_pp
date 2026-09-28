# Phase 5: Wallet & Credits Management — Research & Technical Spikes

**Phase:** 05-wallet-credits-management  
**Date:** 2026-09-28  
**Scope:** Tamper-proof wallet ledger, atomic conditional deductions, free re-printing, dual-mode recharge workflows, and UI balance/alert controls.

---

## 1. Concurrency & Atomic Deductions in Serverless MongoDB

### The Problem: Race Conditions & Double-Spends
In a serverless environment like Vercel with Next.js, concurrent client requests (e.g. rapid double-clicking of "Verify" or multiple browser tabs) can lead to double-spending if balances are read and updated in separate steps:
```typescript
// BAD: Prone to race conditions and negative balances
const wallet = await Wallet.findOne({ userId });
if (wallet.balance >= fee) {
  wallet.balance -= fee;
  await wallet.save();
}
```

### The Solution: Atomic Conditional Updates (`$gte` + `$inc`)
MongoDB supports atomic document-level operations without requiring multi-document transactions. By combining query conditions with atomic operators:
```typescript
const updatedWallet = await Wallet.findOneAndUpdate(
  {
    userId: new mongoose.Types.ObjectId(userId),
    balance: { $gte: fee }, // Prevents deduction if balance dropped below fee
  },
  {
    $inc: { 
      balance: -fee,
      totalDebited: fee 
    },
    $push: {
      transactions: {
        amount: fee,
        type: 'debit',
        docType: docType,
        referenceId: cardIdentifier,
        description: description || `${docType} Card Verification Fee`,
        balanceAfter: 0, // Calculated or updated post-operation
        createdAt: new Date(),
      }
    }
  },
  { new: true }
);

if (!updatedWallet) {
  // Query matched 0 documents -> Either wallet doesn't exist or balance < fee
  return { success: false, error: 'INSUFFICIENT_BALANCE' };
}
```
**Benefits:**
- **Zero Lock Contention:** Single-document atomic operation runs in single-digit milliseconds.
- **Serverless-Safe:** Works reliably on standalone MongoDB, replica sets, and Atlas serverless tiers.
- **Strict Negative Guard:** Schema-level `min: 0` plus query-level `{ balance: { $gte: fee } }` guarantees negative balances are impossible.

---

## 2. Document Pricing & Free Re-Print Resolution

### Pricing Matrix
| Document Type | Lookup Type | Fee | Rule |
|---|---|---|---|
| **PAN Card** | API Lookup | ₹50 | Deducted only on successful response |
| **Vehicle RC** | API Lookup | ₹35 | Deducted only on successful response |
| **Driving License (DL)** | API Lookup | ₹30 | Deducted only on successful response |
| **Aadhaar Card** | API Lookup | ₹25 | Deducted only on successful response |
| **Voter ID (EPIC)** | API Lookup | ₹20 | Deducted only on successful response |
| **Manual Card Entry** | Manual Save / Print | ₹5 | Deducted on initial save/export of manually created card |
| **Failed Lookup** | Any | ₹0 | Zero deduction on error or timeout |
| **Any Existing Card** | Re-Print / View | ₹0 | 100% free if already saved in `DocumentRecord` |

### Free Re-Print Detection
Before initiating a deduction or API call, check if the current user has already generated/saved this card:
```typescript
const existingDoc = await DocumentRecord.findOne({
  userId: sessionUser.id,
  docType,
  cardIdentifier: cleanIdentifier,
});

const isAlreadyPaid = Boolean(existingDoc);
const feeToCharge = isAlreadyPaid ? 0 : SERVICE_FEES[docType];
```
If `isAlreadyPaid === true`, no wallet deduction occurs, and the system proceeds directly to view/print.

---

## 3. Dual-Mode Wallet Recharge Architecture

### Requirements
1. **Instant Sandbox Credit (Mode 1):**
   - Direct 1-click top-up with preset packs (₹100, ₹250, ₹500, ₹1000).
   - Atomic `$inc` credit in MongoDB.
   - Transaction recorded with `type: 'credit'`, `docType: 'TOPUP'`, `description: 'Instant Wallet Top-up (Sandbox)'`.
2. **UPI QR Code + UTR Submission (Mode 2):**
   - Dynamic QR generation using installed `qrcode` library:
     `upi://pay?pa=accero@upi&pn=PrintPortal&am={amount}&cu=INR`
   - User scans QR code using any UPI app (GPay, PhonePe, Paytm).
   - User submits 12-digit UTR / Transaction Reference number.
   - Recorded with `referenceId: utrNumber`, `status: 'completed'` / verified.

---

## 4. UI Indicators & Low-Balance Threshold

- **Navbar Live Balance Indicator:**
  - Placed adjacent to profile avatar/navigation.
  - Formatted as `₹{balance.toFixed(2)}`.
  - Condition:
    - Normal: Slate border, white/gold text.
    - Low Balance (`balance < 50`): Amber glowing border, warning badge, pulse effect.
    - Clicking the pill opens the `RechargeModal`.
- **SweetAlert2-Style Insufficient Balance Dialog:**
  - Displayed if user attempts lookup with `balance < fee`.
  - Content: Document type, required fee, current balance, deficit.
  - Primary button: "Recharge Wallet" (launches `RechargeModal`).
  - Secondary button: "Cancel".

---

## 5. Summary of Artifacts to Implement

1. **Plan 05-01: Wallet Ledger, Pricing Engine & Atomic Deductions**
   - Enhance `src/models/Wallet.ts` (ensure `MANUAL` is in docType enum).
   - Create `src/lib/wallet/pricing.ts` (service fee definitions, affordability checks, free re-print resolver).
   - Create `src/actions/wallet.ts` (`getWalletBalance`, `deductWalletFee`, `rechargeWallet`, `getWalletTransactions`).
   - Integrate fee check and deduction into `src/actions/verify.ts` and `src/actions/document.ts`.

2. **Plan 05-02: Recharge Modal, Live Balance Navbar, Studio Insufficient-Balance Guard & `/wallet` Page**
   - Create `src/components/wallet/RechargeModal.tsx` (dual mode: instant sandbox + UPI QR with UTR submission).
   - Create `src/components/wallet/InsufficientBalanceModal.tsx` (SweetAlert-style blocking dialog).
   - Update `src/components/layout/Navbar.tsx` with live balance pill, amber alert threshold (< ₹50), and click-to-recharge.
   - Update `StudioSearchBar.tsx` and `QuickLookupModal.tsx` to handle `INSUFFICIENT_BALANCE` and display service fees.
   - Build `src/app/wallet/page.tsx` (full wallet ledger dashboard with 4 metric cards, filters, and transaction table).
