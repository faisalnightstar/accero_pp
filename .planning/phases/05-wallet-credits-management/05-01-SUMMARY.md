# Plan 05-01 Summary: Wallet Ledger, Pricing Engine & Atomic Deductions

**Phase:** 05-wallet-credits-management  
**Plan:** 01  
**Status:** Completed  
**Execution Date:** 2026-09-28  

---

## 1. What Was Built

### Core Wallet Infrastructure & Types
- **Enhanced `src/models/Wallet.ts`:**
  - Expanded `IWalletTransaction` docType enum to support `['PAN', 'AADHAAR', 'VOTER', 'DL', 'RC', 'TOPUP', 'MANUAL']`.
  - Stored `balanceAfter` and indexed `referenceId` for auditable transaction chains.

### Tiered Pricing & Free Re-Print Resolution
- **`src/lib/wallet/pricing.ts`:**
  - Defined official fee mapping matching D-01:
    - **PAN Card:** ₹50
    - **Vehicle RC:** ₹35
    - **Driving License (DL):** ₹30
    - **Aadhaar Card:** ₹25
    - **Voter ID (EPIC):** ₹20
    - **Manual Card Entry:** ₹5
  - Built `isDocumentAlreadyPaid(userId, docType, cardIdentifier)`: Inspects `DocumentRecord` in MongoDB; if previously saved, all future views and re-prints incur ₹0 fee.
  - Built `getRequiredServiceFee(userId, docType, identifier, isManual)`: Evaluates whether an operation is paid, manual, or standard lookup.

### Server Actions for Atomic Wallet Accounting
- **`src/actions/wallet.ts`:**
  - `getWalletBalance()`: Queries user wallet; auto-provisions ₹0 wallet if missing; flags `isLowBalance` (`balance < 50`).
  - `checkAffordability(docType, cardIdentifier, isManual)`: Pre-flight check verifying user can afford the service fee before external API invocation.
  - `deductWalletFee(docType, cardIdentifier, description, isManual)`: Executes atomic conditional query `{ userId, balance: { $gte: fee } }` with `$inc: { balance: -fee, totalDebited: fee }` and transactional push. Prevents race conditions and double charges.
  - `rechargeWallet(amount, method, utrNumber)`: Supports Sandbox instant simulation and UPI QR transaction recording.
  - `getWalletTransactions(page, limit, filter)`: Paginated transaction ledger with credit/debit filtering.

### Integration with Verification & Document Persistence
- **`src/actions/verify.ts`:**
  - Checks authentication session.
  - Resolves required fee; returns `errorMessage: 'INSUFFICIENT_BALANCE'` if balance < fee.
  - Cascades through third-party APIs.
  - Atomically deducts fee only upon **successful** data retrieval. Zero deduction (₹0) on errors or timeouts.
- **`src/app/api/documents/route.ts`:**
  - Automatically assesses the ₹5 manual card creation fee on brand-new manual documents; rejects with `402 Payment Required` if balance is insufficient.

---

## 2. Verification & Validation

- `npx tsc --noEmit` passed with 0 errors across the entire codebase.
- Server Actions enforce server-only execution boundaries (`'use server'`).
- Concurrency protection verified via MongoDB `{ balance: { $gte: fee } }`.

---

## 3. Next Steps

Proceed immediately to **Plan 05-02: User-Facing Wallet Interface & Management Route**:
- Dual-mode `RechargeModal.tsx` (preset packs, sandbox top-up, UPI QR code).
- `InsufficientBalanceModal.tsx` dialog for Studio and Dashboard.
- Live balance indicator pill in `Navbar.tsx` with `< ₹50` amber threshold.
- Full `/wallet` dashboard with summary metric cards and transaction ledger table.
