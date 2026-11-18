# Lookup & Payment Integrity Security Audit

**Accero PrintPortal Financial & Identity Security Specification**  
**Role:** Financial Integrity Auditor & Security Architect  
**Classification:** Internal Audit & Security Standard  
**Status:** Remediated & Verified

---

## 1. Audit Scope & Core Financial Invariants

This audit evaluates the financial ledger integrity, payment proof verification, and cross-document reprint authorization controls across Accero PrintPortal.

### Core Financial Principle
> **A document lookup or card generation is considered "PAID" if and only if an immutable, non-refunded, completed debit transaction is cryptographically and relationally verified within the user's wallet ledger.**

### What Is NEVER Accepted as Payment Proof
Under strict financial integrity rules, the following signals must **NEVER** be used as proof of payment:
* `status: 'SUCCESS'` on a lookup record alone.
* `serviceFee: 20` or any fee value in an audit collection.
* `printCount > 0` on an existing document record.
* Client-supplied boolean flags (e.g. `{ isPaid: true }`).
* Provider gateway response alone.

---

## 2. Vulnerability Remediations & Attack Vector Analysis

### 1. The `printCount > 0` Payment Bypass Loophole (Remediated)
* **Vulnerability Description**: In legacy code within `src/lib/wallet/pricing.ts`, line 260 evaluated:
  ```typescript
  // VULNERABLE LEGACY LOGIC:
  const isRecordPaid =
    record.isPaid === true ||
    record.identityLock?.paymentStatus === 'PAID' ||
    (cleanDocType !== 'VOTER' && typeof record.printCount === 'number' && record.printCount > 0);
  ```
  If an operator had created an unverified draft or imported historical data where `printCount` was incremented, the system erroneously treated the document as fully paid for life, granting free reprints without any wallet deduction.
* **Remediation**: The `printCount` fallback was **completely eliminated**. Payment verification now strictly requires `record.isPaid === true || record.identityLock?.paymentStatus === 'PAID'`, which is subsequently cross-verified against actual debit transactions in `Wallet.transactions`.

---

### 2. Identifier Mutation & Cross-Document Re-use (Prevented)
* **Threat Model**: A user pays ₹20 to verify PAN `ABCDE1234F`. In the studio or via API, the user alters the payload to `XYZPK9999Z` and attempts to print the card for free by referencing the original `documentId`.
* **Enforced Defense**:
  1. **Document Identity Lock**: When a document is saved via API lookup or marked paid, an `identityLock` subdocument is established with `documentType` and `documentIdentifier`.
  2. **Strict Verification**: In `printAuthorization.ts` and `pricing.ts`, both the document type and card identifier must match the locked identity:
     ```typescript
     if (cleanCardId && cleanCardId !== expectedId) {
       return { eligible: false, reason: 'Document identity mismatch between verified record and reprint request' };
     }
     ```
  3. **Mutation Block**: In `POST /api/documents`, any attempt to update an identity-locked document with a differing identifier returns `403 IDENTITY_LOCKED`.

---

### 3. Cross-User Entitlement Stealing (Prevented)
* **Threat Model**: User B discovers the `documentId` or PAN number of User A and requests a ₹0 reprint or accesses the document record.
* **Enforced Defense**:
  1. All database queries for document retrieval, cache lookup, and reprint authorization enforce a **strict tenant boundary**:
     ```typescript
     DocumentRecord.findOne({
       _id: documentObjectId,
       userId: userObjectId, // Tenant boundary
     });
     ```
  2. If User B queries User A's document, the query returns `null`, and the reprint engine reports `Document record not found or not owned by user`.

---

### 4. Deterministic Reference IDs & Duplicate Charge Prevention
* **Threat Model**: Network latency causes an operator to double-click "Verify", or a client retry sends multiple requests for the same PAN within seconds.
* **Enforced Defense**:
  1. **In-Flight Concurrency Deduplication**: Handled in-memory via `inFlightPanLookups` and `inFlightVoterLookups`. Simultaneous promises collapse into a single network execution.
  2. **Deterministic Ledger Reference ID**: Wallet debits use a deterministic key:
     ```typescript
     referenceId = `PAN_LOOKUP:${userId}:${cleanPan}`;
     ```
  3. **Atomic MongoDB Invariant**: The wallet deduction query checks `balance >= fee` and appends the debit atomically. If a retry carries the same reference ID, duplicate charges are rejected.

---

### 5. Silent Gateway Failover Without Double Deductions
* **Threat Model**: WebAPI V1 times out or fails with HTTP 500, triggering automatic fallback to WebAPI V2.
* **Enforced Defense**:
  - Wallet deduction occurs **strictly after** the provider response has been normalized and validated.
  - V1 failure incurs **zero wallet deduction**.
  - Fallback to V2 charges the fee **exactly once**, regardless of how many upstream endpoints were consulted.

---

### 6. Reversal & Refund Detection
* **Threat Model**: An admin issues a manual refund or system refund for a failed lookup, but the customer retains the cached document and attempts free printing.
* **Enforced Defense**:
  - `verifyLegitimateReprintEntitlement` scans the user's wallet transactions for reversals:
    ```typescript
    const isRefunded = userWallet.transactions.some((tx) => {
      if (tx.type === 'credit' && (tx.category === 'VERIFICATION_REFUND' || tx.category === 'REFUND')) {
        if (paymentRef && tx.referenceId?.includes(paymentRef)) return true;
        if (tx.description?.includes(cleanId)) return true;
      }
      return false;
    });
    if (isRefunded) {
      return { eligible: false, reason: 'Original lookup payment was refunded or reversed' };
    }
    ```

---

## 3. Financial Invariant Verification Matrix

| Invariant # | Verification Rule | Enforcement Location | Test Status |
| :--- | :--- | :--- | :--- |
| **INV-01** | Successful lookup debits configured fee exactly once | `pan.service.ts` | **PASS** (Test 1) |
| **INV-02** | Failed lookup incurs ₹0 charge | `pan.service.ts` | **PASS** (Test 2) |
| **INV-03** | Reprints require valid completed debit in ledger | `pricing.ts` | **PASS** (Test 7) |
| **INV-04** | `printCount > 0` never substitutes for wallet debit | `pricing.ts` | **PASS** (Test 9) |
| **INV-05** | Cross-user document reuse rejected | `pricing.ts` | **PASS** (Test 8) |
| **INV-06** | Identifier tampering rejected by identityLock | `documentCache.ts` | **PASS** (Test 6) |
| **INV-07** | Simultaneous requests collapse into 1 network debit | `pan.service.ts` | **PASS** (Test 10) |
| **INV-08** | In-window repeated lookups return ₹0 cache hit | `pan.service.ts` | **PASS** (Test 4) |
| **INV-09** | Reversals and refunds invalidate free reprint entitlement | `pricing.ts` | **PASS** (Pricing Unit) |
| **INV-10** | Deterministic reference prevents double debit on retry | `pricing.ts` | **PASS** (Test 11) |
