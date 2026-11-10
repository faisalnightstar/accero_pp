# Accero PrintPortal - Financial Integrity & Transaction Architecture Specification

## 1. Executive Summary

Accero PrintPortal operates as a prepaid document processing and printing platform. Its core financial operations include:
1. **Wallet Credits**: User deposits via Payment Gateway (Paytm QR/NetBanking) or Manual Bank Transfers (UTR submission).
2. **Service Debits**: Instant deductions for government API document verification and card rendering (PAN, Aadhaar, Voter, DL, RC, Ration).
3. **Compensating Refunds**: Automated refunds when downstream verification providers fail or time out.

Prior to Phase 2 hardening, the platform exhibited critical vulnerabilities allowing arbitrary client-side balance modification and concurrent double-crediting. This document details the mathematical models, finite-state machines, and atomic database invariants established in Phase 2 to guarantee 100% financial consistency, auditability, and zero data leakage.

---

## 2. Core Invariants & Conservation Laws

### 2.1 The Balance Conservation Law
For every user $u \in U$ at any point in time $t$:
$$\text{WalletBalance}_u(t) = \text{InitialBalance}_u + \sum_{k \in \mathcal{C}_u(t)} \text{CreditAmount}_k - \sum_{m \in \mathcal{D}_u(t)} \text{DebitAmount}_m$$

Where:
- $\mathcal{C}_u(t)$ is the set of all verified and completed credit transactions for user $u$.
- $\mathcal{D}_u(t)$ is the set of all committed debit transactions for user $u$.
- **Non-Negativity Constraint**: At all times $t$, $\text{WalletBalance}_u(t) \ge 0$. Under no circumstance can a debit drive the balance below zero.

### 2.2 Ledger Immutability
- Every change in `balance` is accompanied by an atomic append of a `TransactionEntry` to the user's wallet ledger.
- Wallet ledger entries are write-once, append-only, and contain an immutable `referenceId`, `description`, `type`, `amount`, and `createdAt` timestamp.

---

## 3. Payment Gateway (Paytm) State Machine & Atomic Claiming

### 3.1 State Transition Graph
The payment lifecycle is governed by an explicit Finite State Machine (FSM):

```
       [ Client Init ]
              │
              ▼
          ┌────────┐
          │CREATED │
          └───┬────┘
              │
              ▼
          ┌────────┐
          │PENDING │ ◄────────┐ (Polling / Pending Callback)
          └───┬────┘          │
              │               │
        (Atomic Claim)        │
              │               │
              ▼               │
        ┌───────────┐         │
        │PROCESSING │ ────────┘ (If transient network error)
        └───┬───┬───┘
            │   │
  ┌─────────┘   └─────────┐
  │ (Success)             │ (Failure/Timeout)
  ▼                       ▼
┌──────┐              ┌────────┐
│ PAID │              │ FAILED │
└──────┘              └────────┘
```

### 3.2 Allowed Transitions Table
| Current Status | Target Status | Trigger | Guard Condition |
| :--- | :--- | :--- | :--- |
| `CREATED` | `PENDING` | Order created | Valid order amount within bounds [₹10, ₹50,000] |
| `PENDING` | `PROCESSING` | Gateway callback / poll | Atomic CAS `status: 'PENDING'` |
| `PROCESSING` | `PAID` | Gateway reports `TXN_SUCCESS` | Verified signature + matching merchant MID + matching amount |
| `PROCESSING` | `FAILED` | Gateway reports `TXN_FAILURE` | Gateway failure code |
| `PROCESSING` | `PENDING` | Transient gateway timeout | Re-entrant recovery |
| `PAID` | *Terminal* | None | **NO TRANSITIONS PERMITTED** |
| `FAILED` | *Terminal* | None | **NO TRANSITIONS PERMITTED** |

### 3.3 Atomic Claim Algorithm (Elimination of Race Conditions)
When multiple concurrent verification calls hit `/api/wallet/paytm/verify` or client polling triggers simultaneously, the atomic claim transition prevents double-crediting:

```typescript
// ATOMIC CLAIM: Only one thread can transition PENDING -> PROCESSING
const claimedPayment = await Payment.findOneAndUpdate(
  {
    orderId,
    status: { $in: ['PENDING', 'pending', 'CREATED'] },
  },
  {
    $set: {
      status: 'PROCESSING',
      updatedAt: new Date(),
    },
  },
  { new: true }
);

if (!claimedPayment) {
  // If payment is already PAID, return idempotent success without crediting again
  const current = await Payment.findOne({ orderId });
  if (current?.status === 'PAID') {
    return { success: true, message: 'Payment already processed and credited' };
  }
  return { success: false, message: 'Payment in terminal or concurrent state' };
}
```

If Thread A and Thread B call the verification API simultaneously:
1. Thread A executes `findOneAndUpdate`. It matches `status: 'PENDING'`, updates it to `'PROCESSING'`, and receives the document.
2. Thread B executes `findOneAndUpdate` 1 millisecond later. The filter `{ status: { $in: ['PENDING', 'CREATED'] } }` fails because the document is now `'PROCESSING'`.
3. Thread B receives `null` and is immediately locked out from the credit path.
4. Thread A verifies signature, confirms `TXN_SUCCESS` with Paytm, credits the wallet, appends ledger entry, and commits `PAID`.
5. Subsequent calls by either thread or the user read `PAID` and receive an idempotent confirmation with zero additional credit.

---

## 4. Manual UTR Recharge Architecture

### 4.1 Threat Model: The "Self-Credited UTR" Attack
In legacy implementations, users could enter any arbitrary 12-digit string into a UTR text box and invoke `rechargeWallet(50000, 'UPI_QR', utr)` to gain immediate ₹50,000 real balance.

### 4.2 Two-Phase Asynchronous Settlement
Phase 2 completely severed automatic wallet crediting from manual UTR inputs. Manual recharge now operates as a formal two-phase settlement workflow:

```
[ Customer ]                     [ Server / Database ]                [ Admin Dashboard ]
     │                                    │                                    │
     │── Submit UTR & Amount ────────────►│                                    │
     │   (e.g., ₹500, UTR: 412345678901)   │                                    │
     │                                    │── Insert ManualRechargeRequest ───►│
     │                                    │   (status: PENDING)                │
     │                                    │   (Wallet balance: UNCHANGED)      │
     │◄── "Verification Pending" ─────────│                                    │
     │                                    │                                    │
     │                                    │                        Admin Reviews Bank
     │                                    │                        Statement & UTR
     │                                    │                                    │
     │                                    │◄── POST /api/admin/manual-recharge─│
     │                                    │    (action: APPROVE, adminId)      │
     │                                    │                                    │
     │                             [ ACID Transaction ]                        │
     │                             1. Claim PENDING -> APPROVED                │
     │                             2. $inc: { balance: amount }                │
     │                             3. Append Ledger with ref: UTR              │
     │                             4. Log Security Audit Trail                 │
     │                                    │                                    │
     │◄── Real Balance Updated ───────────│── 200 OK ─────────────────────────►│
```

### 4.3 Validation & Anti-Tamper Rules
1. **Amount Bounds**: Strictly clamped between ₹10 and ₹50,000. Fractional paise clamped to 2 decimal places.
2. **UTR Format Enforcement**: Regex `^[A-Za-z0-9]{10,22}$`. Pure whitespace or non-standard characters rejected upfront.
3. **Duplicate Submission Detection**: Prevents submitting pending requests with existing unresolved UTRs.
4. **RBAC Guard**: Only users with roles `admin` or `super_admin` can trigger the approval action. Customer or operator tokens are rejected with HTTP 403 Forbidden.

---

## 5. Verification Fee Deduction: Reservation & Compensating Refunds

### 5.1 The "Free Extraction via Race Condition" Vulnerability
Legacy systems executed the third-party government lookup *first*, and only attempted to deduct the fee *after* the data arrived.
- If an attacker initiated two simultaneous lookups with a balance of ₹20 (fee ₹20 each):
  1. Lookup 1 starts (balance = ₹20).
  2. Lookup 2 starts (balance = ₹20).
  3. Lookup 1 completes -> Deducts ₹20 (balance = ₹0).
  4. Lookup 2 completes -> Attempted deduction fails, but the client already received the identity record!

### 5.2 Upfront Atomic Reservation Protocol
Phase 2 mandates that no third-party network call may be dispatched before the fee is reserved.

```typescript
// Step 1: Upfront Atomic Reservation
const updatedWallet = await Wallet.findOneAndUpdate(
  {
    userId,
    balance: { $gte: requiredFee }, // Invariant: must have sufficient balance
  },
  {
    $inc: {
      balance: -requiredFee,
      totalDebited: requiredFee,
    },
    $push: {
      transactions: {
        type: 'DEBIT',
        amount: requiredFee,
        description: `Reserved fee for ${docType.toUpperCase()} verification`,
        referenceId: requestId,
        createdAt: new Date(),
      },
    },
  },
  { new: true }
);

if (!updatedWallet) {
  return { success: false, error: 'Insufficient wallet balance' };
}
```

### 5.3 Compensating Refund Protocol
If the downstream provider (NeoAPI, Axen, FastNexora) times out, encounters a network drop, or returns an error:

```typescript
// Step 2: Idempotent Compensating Refund
const refundClaim = await VerificationRequest.findOneAndUpdate(
  {
    requestId,
    status: 'RESERVED',
  },
  {
    $set: {
      status: 'REFUNDED',
      error: providerError,
    },
  }
);

if (refundClaim) {
  await Wallet.findOneAndUpdate(
    { userId },
    {
      $inc: {
        balance: requiredFee,
        totalCredited: requiredFee,
      },
      $push: {
        transactions: {
          type: 'CREDIT',
          amount: requiredFee,
          description: `Refund: ${docType.toUpperCase()} lookup failed`,
          referenceId: `REFUND_${requestId}`,
          createdAt: new Date(),
        },
      },
    }
  );
}
```

This guarantees:
- **Zero Free Lookups**: The fee is held in escrow before external requests go out.
- **Fair Accounting**: If government servers are offline, user funds are instantaneously restored with an audit entry.
- **Repeat Reprint Exemption**: If a user requests a reprint of a previously processed card they already paid for, `fee = 0` is applied.

---

## 6. Financial Verification Matrix

| Invariant / Control | Test Suite | Result |
| :--- | :--- | :--- |
| Amount Bounds Enforcement (₹10 - ₹50,000) | `tests/payment-atomicity.test.ts` | **PASSED** |
| Unique orderId & paymentId Constraints | `tests/payment-atomicity.test.ts` | **PASSED** |
| Concurrent Gateway Polling Race Protection | `tests/payment-atomicity.test.ts` | **PASSED** |
| Sandbox Blocked in Production Mode | `tests/wallet-security.test.ts` | **PASSED** |
| Manual UTR Zero-Auto-Credit Enforcement | `tests/wallet-security.test.ts` | **PASSED** |
| Insufficient Balance Prevention ($balance \ge fee$) | `tests/verification-deduction.test.ts` | **PASSED** |
| Upfront Reservation & Compensating Refund | `tests/verification-deduction.test.ts` | **PASSED** |
| Free Re-print of Existing User Document | `tests/verification-deduction.test.ts` | **PASSED** |

