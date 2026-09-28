# Phase 5: Wallet & Credits Management — Context & Decisions

**Phase Goal:** Implement a tamper-proof wallet accounting system supporting atomic conditional deductions, tiered document pricing, free re-printing, dual-mode recharge workflows, low-balance warnings, and a dedicated transaction ledger.

---

## 1. Locked Decisions

### D-01: Tiered Pricing Structure & Deduction Trigger
- **External Lookup Pricing:**
  - **PAN Card:** ₹50
  - **Vehicle RC:** ₹35
  - **Driving License (DL):** ₹30
  - **Aadhaar Card:** ₹25
  - **Voter ID (EPIC):** ₹20
- **Manual Entry Pricing:**
  - Standard flat **₹5** per manually drafted card upon final save/print.
- **Deduction Trigger:**
  - Balance is checked **before** lookup; atomic deduction occurs upon **successful document data retrieval**.
  - **Zero Charge on Failure:** If external providers return an error, timeout, or no records found, **₹0** is debited.
- **Free Re-Printing:**
  - Saved documents in `DocumentRecord` (MongoDB) retain a paid record; subsequent views, edits, and re-prints are **100% free of charge**.

### D-02: Atomic Conditional Deductions (`$gte`)
- **Tamper-Proof Concurrency:**
  - Wallet balance deductions must use MongoDB conditional queries:
    ```typescript
    Wallet.findOneAndUpdate(
      { userId, balance: { $gte: requiredFee } },
      { 
        $inc: { balance: -requiredFee, totalDebited: requiredFee },
        $push: { transactions: transactionPayload }
      },
      { new: true }
    );
    ```
  - If `balance < requiredFee`, the query fails atomically, preventing race conditions, concurrent double-spends, and negative balances.
  - Returns structured `INSUFFICIENT_BALANCE` error with required fee and available balance.

### D-03: Dual-Mode Wallet Recharge Modal
- **Quick Preset Packs:**
  - Preset top-up amounts: **₹100**, **₹250**, **₹500**, and **₹1000** (with custom amount input option, minimum ₹10).
- **Mode 1 — Instant Sandbox Top-Up:**
  - 1-click simulated checkout for immediate balance credit (ideal for testing, live demonstrations, and dev environments).
- **Mode 2 — UPI QR Code & UTR Submission:**
  - Displays portal UPI QR code and merchant VPA ID.
  - Allows the user to enter their 12-digit UPI UTR / Transaction Reference number after paying via any UPI app (GPay, PhonePe, Paytm).
  - Automatically records transaction with reference number.

### D-04: UI Indicators & Low-Balance UX
- **Low-Balance Warning Threshold:**
  - Balance < **₹50**: Visual amber warning badge in the navbar balance pill (`border-amber-500/40 bg-amber-500/10 text-amber-400`).
- **Insufficient Balance Blocking:**
  - If a user triggers a lookup or print without sufficient balance for that specific service, action is blocked immediately.
  - An interactive modal appears: *"Insufficient Wallet Balance. This service requires ₹{requiredFee}, but your balance is ₹{currentBalance}. Please top up to proceed."* with a direct CTA to open `RechargeModal`.
- **Global Navbar Balance Pill:**
  - Real-time balance badge in `Navbar.tsx` displaying `₹XX.XX` with wallet icon and click-to-recharge action.
  - Synchronizes balance changes across tabs/actions.

### D-05: Dedicated `/wallet` Management Page
- **Full Route (`/wallet`):**
  - **Summary Metrics Cards:** Available Balance, Total Deposited/Credited, Total Spent/Debited, Total Transactions.
  - **Quick Action:** Prominent "Add Money / Recharge" button launching the `RechargeModal`.
  - **Interactive Transaction Ledger:**
    - Columns: Date & Time, Transaction Type (Credit / Debit), Service / Document Type (PAN, Aadhaar, Voter, DL, RC, Top-up, Manual), Reference ID / Description, Amount, Resulting Balance.
    - Filter tabs: All, Debits (Prints & Lookups), Credits (Top-ups).
    - Search by reference ID or description.

---

## 2. Service Fee Mapping

| Service / Document Type | Action | Fee (₹) | Deducted When | Re-print Fee |
|---|---|---|---|---|
| **PAN Card** | API Lookup | ₹50 | Successful API data returned | Free (₹0) |
| **Vehicle RC** | API Lookup | ₹35 | Successful API data returned | Free (₹0) |
| **Driving License (DL)** | API Lookup | ₹30 | Successful API data returned | Free (₹0) |
| **Aadhaar Card** | API Lookup | ₹25 | Successful API data returned | Free (₹0) |
| **Voter ID (EPIC)** | API Lookup | ₹20 | Successful API data returned | Free (₹0) |
| **Manual Card Entry** | Save / Print | ₹5 | First save / export of manual card | Free (₹0) |
| **Failed Lookup** | Any | ₹0 | Zero charge on error / timeout | N/A |

---

## 3. Data Flow & Transaction Lifecycle

```
[User Action: Lookup / Manual Save]
                 │
                 ▼
[Check Wallet Balance >= Service Fee]
    │                         │
    ├── (No) ─────────────────┴──► [Show Insufficient Balance Modal]
    │                                          │
    │                                          ▼
    │                              [Open RechargeModal (₹100/₹250/etc)]
    │
    ▼ (Yes)
[Execute External Verification API / Save]
    │                         │
    ├── (Failed/Empty) ───────┴──► [Abort Deduction, Charge ₹0, Route to Studio]
    │
    ▼ (Success)
[Atomic Mongo Update: balance: { $gte: fee }]
    │
    ├── (Success) ──► Record IWalletTransaction (docType, referenceId, balanceAfter)
    │                 Update Navbar live balance pill
    │                 Proceed to populate Studio & Save DocumentRecord
    │
    └── (Race Fail) ─► Reject action, notify user of balance change
```

---

## 4. Deferred Scope (v2)
- Automated merchant payment gateway webhooks (Razorpay / Cashfree / PhonePe merchant KYC integration) — tracked under `ENH-03`.
- Institutional invoice generation with GST breakdown.
- Multi-currency support (system strictly operates in INR `₹`).
