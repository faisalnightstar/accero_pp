# Phase 3.1.2.1: Payment Idempotency & Financial Decoupling Report

**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Phase:** 3.1.2.1 — Staging Validation & Production Release Gate  
**Priority:** P0 — Critical  
**Status:** Engineering Implementation Verified & Hardened  

---

## 1. Executive Summary

In Phase 3.1.2.1, the financial ledger and payment verification engine were rigorously audited, hardened, and verified under adversarial concurrency conditions. While Phase 3.1.2 previously introduced client-side `Set<string>` deduplication for Google Analytics purchase events, this report establishes that **backend database idempotency is the authoritative financial source of truth**.

A dedicated test suite (`tests/payment-idempotency.test.ts`) was authored and executed, verifying **8 critical payment lifecycle scenarios**: single-credit execution, repeated callback suppression, concurrent atomic claim locking, parameter tampering rejection, amount mismatch detection, and analytics failure decoupling. All 8 tests passed with zero failures.

---

## 2. End-to-End Payment Lifecycle Architecture

The recharge and revenue tracking flow follows a strict 8-step decoupled sequence:

```
[Operator UI: RechargeModal]
              │
  1. Amount Selected (₹10 - ₹50,000)
              │
              ▼
  2. POST /api/wallet/paytm/create-order
     • Server creates unique Order ID: wallet_{timestamp}_{randomSuffix}
     • Record inserted into MongoDB: status = 'PENDING'
     • Dynamic UPI Intent / QR generated with orderId encoded in &tr=
              │
              ▼
  3. Operator Scans & Pays via UPI / Bank App
              │
              ▼
  4. Client Polls / Callback: POST /api/wallet/paytm/verify
              │
              ▼
  5. Server Authoritative Verification (verifyAndCreditPaytmPayment)
     ┌─────────────────────────────────────────────────────────────┐
     │ A. Idempotency Check: payment.status === 'PAID'?            │
     │    -> Return existing balance immediately (alreadyCredited) │
     │                                                             │
     │ B. Gateway Order Status Query (https://securegw.paytm.in)   │
     │    -> Validates STATUS === 'TXN_SUCCESS'                    │
     │    -> Security Check: Math.abs(paidAmount - expected) < 0.01 │
     │       (Rejects tampered amounts with SECURITY_ALERT)        │
     │                                                             │
     │ C. Atomic Document Lock:                                    │
     │    findOneAndUpdate({ _id, status: 'PENDING' },             │
     │                     { $set: { status: 'PROCESSING' } })     │
     │    -> Concurrency Trap: Only ONE request can claim record   │
     │                                                             │
     │ D. Ledger Redundancy Check:                                 │
     │    Wallet.findOne({ 'transactions.referenceId': orderId })  │
     │    -> Prevents double-credit even if state lock bypassed    │
     │                                                             │
     │ E. Atomic Wallet Credit:                                    │
     │    Wallet.findOneAndUpdate({ $inc: { balance },             │
     │                             $push: { transactions } })      │
     │                                                             │
     │ F. State Finalization:                                      │
     │    payment.status = 'PAID'                                  │
     │    Audit log persisted (WALLET_PAYMENT_VERIFIED)            │
     └─────────────────────────────────────────────────────────────┘
              │
  6. Success Response: { success: true, status: 'paid', newBalance }
              │
              ▼
  7. Client UI Updates (handlePaymentSuccess)
     • Local balance state refreshed
     • Global CustomEvent('wallet-updated') emitted
              │
              ▼
  8. GA4 Purchase Event Dispatched (Analytics.trackPurchase)
     • Deduplicated via client-side Set<string>
     • Sanitized via central dataLayer sanitizer
     • Dispatched to window.dataLayer
```

---

## 3. Backend Source of Truth & Database Idempotency

### 3.1 Payment State Machine
Payment records in the `Payment` collection transition strictly through a unidirectional state machine:

```
[CREATED] ──► [PENDING] ──► [PROCESSING] ──► [PAID] (Terminal)
                 │               ▲
                 ▼               │
              [FAILED] ──────────┘
```

- **PENDING:** Order initialized; waiting for operator payment.
- **PROCESSING:** Gateway confirmed `TXN_SUCCESS`. Exactly one server thread claims the order via atomic `findOneAndUpdate`.
- **PAID:** Wallet balance successfully incremented; reference ID written to transaction ledger. Once in `PAID` state, all subsequent calls return immediately without modifying balances.

### 3.2 Security Hardening: Amount Mismatch Detection
In `src/lib/payment/paytm.ts`, an explicit amount validation check was introduced to eliminate parameter tampering or payment skew:
```typescript
if (
  paytmResult.amount !== undefined &&
  Math.abs(paytmResult.amount - payment.amount) > 0.01
) {
  payment.status = 'FAILED';
  payment.gatewayResponse = {
    ...paytmResult.raw,
    securityAlert: `Amount mismatch: expected ₹${payment.amount}, gateway returned ₹${paytmResult.amount}`,
  };
  await payment.save();

  await logAuditEvent({
    actorId: payment.userId,
    action: 'WALLET_PAYMENT_AMOUNT_MISMATCH',
    resourceType: 'PAYMENT',
    resourceId: payment.orderId,
    details: {
      expectedAmount: payment.amount,
      reportedAmount: paytmResult.amount,
    },
    status: 'WARNING',
  });

  return {
    success: false,
    status: 'failed',
    error: `Payment verification failed: paid amount (₹${paytmResult.amount}) does not match expected order amount (₹${payment.amount}).`,
  };
}
```

---

## 4. Test Evidence & Empirical Results

The test suite `tests/payment-idempotency.test.ts` was executed under Vitest. All 8 tests passed in 6ms.

| Test Case | Scenario Description | Expected Behavior | Actual Result |
| :--- | :--- | :--- | :--- |
| **Test 1** | Repeated verification calls for same order ID | Balance increments on Call 1; Call 2 returns `alreadyCredited: true` with zero balance change | **PASS (₹100 -> ₹350, never ₹600)** |
| **Test 2** | Simultaneous racing callbacks (Promise.all) | Exactly one thread claims `PROCESSING`; second thread detects completed payment; 1 credit total | **PASS (1 credit, 0 double-credits)** |
| **Test 3** | Empty or missing `orderId` | Rejected immediately with HTTP 400 equivalent | **PASS** |
| **Test 4** | Non-existent or spoofed order ID | Rejected with `Payment record not found` | **PASS** |
| **Test 5** | Gateway reports `TXN_FAILURE` (Code 227) | Marked `FAILED`, error returned, zero wallet balance increment | **PASS** |
| **Test 6** | Gateway reports amount mismatch (paid ₹1 vs expected ₹500) | Marked `FAILED`, audit security warning logged, zero wallet credit | **PASS** |
| **Test 7** | Client-side purchase deduplication | First call dispatches to dataLayer; duplicate call suppressed by in-memory transaction Set | **PASS** |
| **Test 8** | Analytics delivery failure decoupling | Deletion of `window` / dataLayer does not block backend payment verification or wallet credit | **PASS** |

---

## 5. Decoupling of Financial Commit from Analytics Delivery

The architecture strictly decouples the financial transaction layer from the analytics telemetry layer:
1. **Server Verification is Authoritative:** The wallet balance is committed to MongoDB in step 5 before any response is sent to the client.
2. **Client Failure Non-Impact:** If the client crashes, closes the tab, has an adblocker blocking GTM, or encounters a network partition after step 5, the wallet credit has **already safely occurred in the database**.
3. **No Phantom Revenue:** The client never dispatches a `purchase` event before receiving `{ success: true, status: 'paid' }` from the server. Failed, pending, or fraudulent orders never trigger GA4 revenue tracking.

---

## 6. Remaining Risks & Staging Requirements

- **Live Gateway Signatures:** Verification of live cryptographic HMAC checksums generated by Paytm's production private keys requires active merchant credentials (`PAYTM_MID` and `PAYTM_MERCHANT_KEY`).
- **External Dependency Classification:** PENDING STAGING CREDENTIALS. In staging/production environments, live bank callbacks must be validated with the actual gateway merchant account.
