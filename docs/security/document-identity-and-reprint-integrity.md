# Document Identity Locking & Free Reprint Financial Integrity Specification

## Executive Summary

Accero PrintPortal allows CSC operators and printing centers to format and print ISO/IEC 7810 ID-1 standard (CR80) cards across 7 document categories (PAN, Voter ID, Aadhaar, Driving Licence, Vehicle RC, Ration Card, Farmer ID). When documents are verified via external government gateways (such as NeoAPI or WebAPI.in) or created via manual draft, a fee is deducted from the operator's prepaid wallet ledger.

A critical security audit identified four severe financial integrity and authorization vulnerabilities:
1. **Bug A (Lookup Re-enabling in Edit Mode)**: After a verified lookup was loaded into the Card Studio, entering edit mode or modifying non-identity fields re-enabled the Lookup button, risking redundant lookups or state corruption.
2. **Bug B (Identifier Mutability)**: Users could modify core document identifiers (`epicNumber`, `documentNumber`, `cardIdentifier`, `panNumber`) in the edit form or directly via `POST /api/documents`, hijacking an already-paid verified document session with a new citizen identity.
3. **Bug C (Cross-Document Reprint Abuse)**: Users could change document fields or switch document types (e.g. from Voter ID to PAN) on an existing document record ID, exploiting the `isPaid: true` flag to print unlimited different cards without paying the corresponding print/lookup fee.
4. **Bug D (Free Reprint Authorization Bypass)**: Naive frontend or database checks (such as trusting `printCount > 0` alone) granted permanent ₹0 reprint rights without verifying whether an actual debit transaction existed in `Wallet.transactions` or whether the payment was refunded/reversed.

This document details the root causes, architecture of the strict **Document Identity Lock**, server-side validation invariants, the 8-condition free reprint entitlement engine, frontend UX enforcement, and test verification evidence.

---

## 1. Vulnerability Analysis & Root Causes

### 1.1 Bug A: Lookup Button Re-enabling During Document Editing
* **Vulnerable Mechanism**: In `src/components/studio/StudioSearchBar.tsx` and `src/app/studio/page.tsx`, the search bar state was driven primarily by user input keystrokes. When a verified document was loaded, modifying form fields in `CardForm.tsx` triggered React re-renders without passing a persistent lock state to `StudioSearchBar`.
* **Root Cause**: The search bar had no awareness that the current document canvas was already bound to an authoritative verified record. Any text change re-evaluated `query.trim().length > 0` and re-enabled the search/lookup submit button.

### 1.2 Bug B: Document Identifier Mutability in Edit Mode
* **Vulnerable Mechanism**: In `src/app/api/documents/route.ts` (`POST`), existing documents were looked up by ID:
  ```typescript
  // Prior vulnerable code
  if (record) {
    record.docType = normalizedDocType;
    record.cardIdentifier = cardIdentifier;
    record.documentNumberHash = hash;
    record.data = validated.data;
    await record.save();
  }
  ```
* **Root Cause**: The route unconditionally assigned the incoming `docType`, `cardIdentifier`, and `data` onto the existing MongoDB `DocumentRecord` without checking if `record.isPaid === true` or if the record was generated from a paid third-party API verification (`inputMode === 'API'`). An attacker could send a payload with an altered EPIC or PAN number, overwriting the record while preserving the record's paid status.
* **Frontend Flaw**: In `CardForm.tsx`, fields like `epicNumber`, `panNumber`, `aadhaarNumber`, `dlNumber`, and `registrationNumber` remained editable standard inputs even after an API lookup had succeeded.

### 1.3 Bug C: Cross-Document Switching & Multi-Document Generation
* **Vulnerable Mechanism**: In `src/lib/print/printAuthorization.ts` (`authorizePrint`), when authorizing a print job:
  ```typescript
  // Prior vulnerable code
  const isPaid = await isDocumentAlreadyPaid(userId, cleanDocType, cleanCardId);
  if (isPaid) {
    fee = 0; // Authorized at ₹0 without checking documentId or matching record docType!
  }
  ```
* **Root Cause**: `authorizePrint` accepted a client-provided `documentType` and `cardIdentifier`. If a client passed `documentId` pointing to an existing paid Voter record, but set `documentType: 'pan'` and `cardIdentifier: 'ABCDE1234F'`, the server did not verify that `docRecord.docType === 'PAN'` or that `docRecord.cardIdentifier === 'ABCDE1234F'`. An operator could pay ₹20 for one Voter lookup and print multiple different cards (PAN ₹50, RC ₹35, DL ₹30) by submitting requests with the same `documentId`.

### 1.4 Bug D: Free Reprint Authorization Invariants
* **Vulnerable Mechanism**: `isDocumentAlreadyPaid` previously evaluated:
  ```typescript
  // Prior vulnerable code
  return (record?.printCount ?? 0) > 0 || record?.isPaid === true;
  ```
* **Root Cause**: Trusting `printCount > 0` or an unverified boolean flag created two critical vulnerabilities:
  1. An attacker could craft or manipulate an unverified draft record to have `printCount: 1` or `isPaid: true` without any real wallet debit ever occurring.
  2. If an API lookup failed and the wallet was auto-refunded via `VERIFICATION_REFUND` (e.g. during a database save failure), the document record could remain cached or present in MongoDB and grant free reprints despite the money being returned to the user's wallet balance.

---

## 2. Architecture: Strict Document Identity Lock

To permanently eliminate identity hijacking and cross-document switching, an immutable **Document Identity Snapshot** (`IDocumentIdentityLock`) is created immediately upon successful API verification or initial document creation.

### 2.1 Identity Lock Schema (`src/models/DocumentRecord.ts`)
```typescript
export interface IDocumentIdentityLock {
  documentType: DocumentType;
  documentIdentifier: string;
  lookupStatus: 'SUCCESS' | 'FAILED' | 'PENDING';
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'MANUAL';
  paymentStatus: 'PAID' | 'UNPAID' | 'FREE_REPRINT';
  reprintEligible: boolean;
  originalLookupTransactionId?: string;
  provider?: string;
  providerReference?: string;
  verifiedAt?: Date;
  ownerId: string;
  lockedAt: Date;
}
```

The snapshot binds:
1. `documentType`: The canonical document category (e.g., `'VOTER'`, `'PAN'`).
2. `documentIdentifier`: The normalized primary document key (e.g., uppercase EPIC `'TMV0654962'`, PAN `'ABCDE1234F'`).
3. `lookupStatus` & `verificationStatus`: Gateway verification status (`'VERIFIED'` vs `'MANUAL'`).
4. `paymentStatus` & `reprintEligible`: Ledger payment status (`'PAID'`).
5. `originalLookupTransactionId`: The deterministic ledger transaction reference ID from `Wallet.transactions` (e.g., `VTR-60d5ec49f1b2c82b8c8e1111-TMV0654962`).
6. `provider`: Source upstream gateway (e.g., `'NeoAPI'`, `'WebAPI.in'`).
7. `ownerId`: The authenticated user ID owning the document record.
8. `lockedAt`: Timestamp of the identity lock creation.

### 2.2 Server-Side Mutation Guards (`src/app/api/documents/route.ts`)
When a client submits an update to an existing document via `POST /api/documents`:
1. **Identity Lock Detection**:
   ```typescript
   isIdentityLocked = Boolean(record.identityLock || record.isPaid || record.inputMode === 'API');
   ```
2. **Document Type Immutability**:
   ```typescript
   if (normalizedDocType !== record.docType.toLowerCase()) {
     return NextResponse.json(
       {
         error: 'IDENTITY_LOCKED',
         message: 'Document identity has changed. Document type is locked for this verified document. Please perform a new authorized lookup.',
       },
       { status: 403 }
     );
   }
   ```
3. **Card Identifier Immutability**:
   ```typescript
   const expectedIdentifier = normalizeDocumentIdentifier(record.docType, record.cardIdentifier);
   if (cardIdentifier !== expectedIdentifier) {
     return NextResponse.json(
       {
         error: 'IDENTITY_LOCKED',
         message: 'Document identity has changed. Document number/EPIC is locked for this verified record. Please perform a new authorized lookup.',
       },
       { status: 403 }
     );
   }
   ```
4. **Data-Level Identifier Extraction & Tamper Check**:
   Even if the top-level `cardIdentifier` matches, the route extracts the identifier embedded inside `validated.data` (`epicNumber`, `panNumber`, `docsNumber`):
   ```typescript
   const rawDataId = resolveCardIdentifier(record.docType, validated.data);
   const normalizedDataId = normalizeDocumentIdentifier(record.docType, rawDataId);
   if (normalizedDataId && !normalizedDataId.startsWith('UNKNOWN-') && normalizedDataId !== expectedIdentifier) {
     return NextResponse.json(
       {
         error: 'IDENTITY_LOCKED',
         message: 'Document identity has changed. Identifier inside document data does not match verified record. Please perform a new authorized lookup.',
       },
       { status: 403 }
     );
   }
   ```
5. **Permitted Presentation Edits Preserved**:
   Non-identity fields remain fully editable:
   - Vernacular / regional language names (e.g. Hindi Devanagari script: `मो वाहिद` -> `मोहम्मद वाहिद`).
   - Street address and house number corrections (`fullAddress`).
   - Missing fields returned as partial by external APIs.
   - Studio card layout formatting adjustments (QR positioning, photo offsets, canvas alignments).

---

## 3. Print Authorization & Free Reprint Verification Invariants

### 3.1 Eight Mandatory Invariants (`verifyLegitimateReprintEntitlement`)
In `src/lib/wallet/pricing.ts`, before any document is granted ₹0 free reprint authorization, `verifyLegitimateReprintEntitlement` strictly evaluates all eight conditions:

| Condition | Rule | Enforcement Mechanism |
| :--- | :--- | :--- |
| **1. Record Existence & Ownership** | Record must exist in MongoDB and belong to the authenticated user. | `DocumentRecord.findOne({ _id: documentId, userId })`. Rejects 404/403 if not owned by caller. |
| **2. Document Type Match** | Reprint document type must strictly match the verified record's `docType`. | `record.docType.toUpperCase() === cleanDocType.toUpperCase()`. Rejects cross-document type switching. |
| **3. Identifier Match** | Requested identifier must strictly match the verified record's `cardIdentifier`. | `recordIdentifier === cleanId`. Rejects card identifier hijacking. |
| **4. Record Payment Status** | Document must be explicitly marked as paid/verified. | `record.isPaid === true \|\| record.identityLock?.paymentStatus === 'PAID'`. |
| **5. Wallet Ledger Debit Verification** | A corresponding `COMPLETED` debit transaction must exist in the user's `Wallet.transactions`. | Searches `Wallet.transactions` for `type === 'debit' && status === 'COMPLETED'` matching `paymentReferenceId`, `documentId`, or deterministic lookup ref `VTR-{userId}-{epic}`. |
| **6. Absence of Refund/Reversal** | No refund or reversal credit transaction must invalidate the payment. | Searches `Wallet.transactions` for `type === 'credit' && category IN ('VERIFICATION_REFUND', 'REFUND')` referencing the lookup. If refunded, reprint is strictly rejected. |
| **7. Verification Request Completion** | Upstream verification record must confirm completed verification. | Checks `VerificationRequest` for status `COMPLETED`. |
| **8. Authenticated Session Binding** | Free reprint is non-transferable across tenants or users. | Enforced by session token validation in `auth.getSession()` and atomic query filters. |

### 3.2 Server-Side Print Authorization (`src/lib/print/printAuthorization.ts`)
When `authorizePrint` is invoked:
1. **Ownership & Type Guard**:
   ```typescript
   if (documentId) {
     const docRecord = await DocumentRecord.findOne({
       _id: new mongoose.Types.ObjectId(documentId),
       userId: userObjectId,
     });
     if (!docRecord) {
       return { success: false, error: { code: 'INVALID_INPUT', message: 'Document record not found or not owned by user.' } };
     }
     if (docRecord.docType.toUpperCase() !== cleanDocType.toUpperCase()) {
       return { success: false, error: { code: 'INVALID_INPUT', message: 'Document identity has changed. Document type does not match verified record. Please perform a new authorized lookup.' } };
     }
     const expectedId = normalizeDocumentIdentifier(cleanDocType, docRecord.cardIdentifier);
     if (cleanCardId && cleanCardId !== expectedId) {
       return { success: false, error: { code: 'INVALID_INPUT', message: 'Document identity has changed. Card identifier does not match verified record. Please perform a new authorized lookup.' } };
     }
   }
   ```
2. **Entitlement Check**:
   Calls `verifyLegitimateReprintEntitlement`. If eligible, sets `fee = 0` and proceeds without wallet debit. If not eligible and wallet balance is sufficient, deducts the configured service fee (e.g. ₹20 for Voter, ₹50 for PAN, ₹30 for DL).
3. **Idempotency**:
   Atomic checks on `printJobId` prevent duplicate deductions under concurrent print requests.

---

## 4. Frontend & Studio UX Enforcement

### 4.1 Search Bar Disabling (`src/components/studio/StudioSearchBar.tsx`)
When a verified document is loaded into the Card Studio:
* `isIdentityLocked` prop is passed as `true`.
* The search input input field is set to `disabled` and `readOnly`.
* The Captcha trigger button is disabled.
* The "Lookup" action button is permanently disabled with a lock icon and label:
  ```tsx
  <button disabled className="bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed">
    <Lock className="w-3.5 h-3.5" />
    <span>Lookup Disabled</span>
  </button>
  ```
* The search bar displays an authoritative status banner:
  > **Locked Document**: `Voter record already verified via API. (₹0 — Already paid / Free reprint)`
* Direct form submission (`handleFetch`) aborts immediately if `isIdentityLocked` is true.

### 4.2 Card Form Identity Field Locking (`src/components/studio/CardForm.tsx`)
In the studio editor form:
* Helper `isIdentityKey(fieldName)` checks for primary identifiers (`epicNumber`, `panNumber`, `aadhaarNumber`, `dlNumber`, `registrationNumber`, `rationCardNumber`, `farmerId`).
* When `isIdentityLocked` is active:
  - Identity fields are rendered with `readOnly`, `disabled`, background styling (`bg-slate-100 dark:bg-slate-900/50`), and a lock icon.
  - A pill badge is rendered: `Verified Identity (Locked)`.
  - Non-identity fields (names, dates, addresses, regional translations, assembly names) remain interactive and editable.

### 4.3 Studio Canvas Context Hygiene (`src/app/studio/page.tsx`)
* **Tab Switching (`handleTabChange`)**: When switching between tabs (e.g., from Voter ID to PAN), `currentDocId` and `identityLock` are strictly reset to `null`. This prevents Voter ID identity locks or database record IDs from bleeding into a PAN or Aadhaar canvas.
* **New Blank Document (`handleNewBlank`)**: Clears `currentDocId` and `identityLock`, unlocking all fields for fresh manual drafting or a new lookup.
* **Status Bar (`Section 9`)**: Renders a dedicated verification banner displaying:
  - `Verification Status: Verified via API` (or `Manual Entry`)
  - `Payment Status: Already paid`
  - `Reprint Fee: ₹0 (Free reprint)`
  - `Lookup Status: Disabled (Document locked)`

---

## 5. Files Modified

| File Path | Nature of Changes |
| :--- | :--- |
| `src/models/DocumentRecord.ts` | Added `IDocumentIdentityLock` interface and `identityLock` schema field. |
| `src/lib/wallet/pricing.ts` | Implemented `verifyLegitimateReprintEntitlement` enforcing the 8 invariants, wallet ledger debit verification, and refund invalidation check. |
| `src/lib/print/printAuthorization.ts` | Added server-side record ownership, document type matching, and card identifier verification; integrated `verifyLegitimateReprintEntitlement`. |
| `src/app/api/documents/route.ts` | Enforced strict immutability on `docType`, `cardIdentifier`, and internal data identifiers for locked/verified records with HTTP 403 `IDENTITY_LOCKED`. |
| `src/app/api/documents/[id]/route.ts` | Returns `isIdentityLocked: true`, `isPaid: true`, and authoritative `identityLock` snapshot on document load. |
| `src/lib/verify/types.ts` | Added `isIdentityLocked`, `identityLock`, and `paymentReferenceId` to `VerificationResult`. |
| `src/lib/documents/voterLookup.ts` | Returns identity lock snapshots on cache hits, new paid lookups, and concurrent in-flight deduplications. |
| `src/lib/documents/documentCache.ts` | Persists `identityLock` snapshot alongside `isPaid` and `paymentReferenceId` in `saveDocumentToCache`. |
| `src/actions/verify.ts` | Injected `isIdentityLocked` and `identityLock` snapshot on successful verification completions. |
| `src/components/studio/StudioSearchBar.tsx` | Disabled search input, captcha button, and lookup button when `isIdentityLocked` is active; rendered locked notification banner. |
| `src/components/studio/CardForm.tsx` | Locked primary identity fields (`readOnly`, `disabled`, badge) while keeping presentation fields editable. |
| `src/app/studio/page.tsx` | Maintained `identityLock` state; passed `isIdentityLocked` to child components; wiped context on tab switch and new blank document; added verification status banner. |
| `tests/document-identity-lock.test.ts` | Created comprehensive 19-scenario unit and integration test suite covering Bugs A–D. |

---

## 6. Test Suite Coverage & Verification Results

The complete test suite was executed and verified against both unit mocks and end-to-end workflows:

```bash
npx vitest run tests/document-identity-lock.test.ts tests/voter-neoapi-workflow.test.ts tests/circuit-breaker-health.test.ts tests/webapi-in-provider.test.ts tests/voter-multi-provider-failover.test.ts tests/voter-wallet-integrity.test.ts tests/provider-safety.test.ts tests/voter-webapi-normalizer.test.ts tests/print-billing.test.ts tests/verification-deduction.test.ts tests/service-pricing-ssot.test.ts
```

### Results Summary
* **Total Test Suites**: 11 passed (11 total)
* **Total Tests**: 116 passed (116 total)
* **Duration**: 726 ms

#### Group 1: Identity Protection & Document Mutation Guards (Passed)
* `Changing EPIC number on verified Voter record is strictly rejected (HTTP 403 IDENTITY_LOCKED)`
* `Changing docsNumber/identifier inside data payload is strictly rejected (HTTP 403 IDENTITY_LOCKED)`
* `Changing cardIdentifier on PAN record is rejected (HTTP 403 IDENTITY_LOCKED)`
* `Switching Voter ID to PAN is strictly rejected by server (HTTP 403 IDENTITY_LOCKED)`
* `Modifying document record ID to invalid/nonexistent ID is rejected with 400/404`
* `Changing owner ID: User B cannot modify or hijack User A record (HTTP 404 / Unauthorized)`
* `Forged frontend verification status is rejected`
* `Direct API requests to /api/print/authorize cannot bypass identity locks`

#### Group 2: Free Reprint Entitlement & Wallet Verification (Passed)
* `Successfully paid Voter lookup permits legitimate ₹0 reprint`
* `Original lookup fee is not deducted again during reprint`
* `Same EPIC and same verified record permit reprint`
* `Different EPIC is rejected for free reprint`
* `Different document type is rejected for free reprint`
* `Different user record is rejected for free reprint`
* `Refunded or reversed lookup payment does not grant free reprint`
* `Concurrent reprint requests cannot create duplicate billing entries`

#### Group 3: Document Editing for Permitted Presentation Fields (Passed)
* `Existing document editing still works for permitted fields (address, regional name, formatting)`
* `Other document types (DL ₹30, RC ₹35, PAN ₹50) retain correct billing behavior`
* `Existing wallet ledger remains consistent across all operations`

### Next.js Production Build
```bash
npm run build
```
* **Status**: `✓ Compiled successfully in 5.7s`
* **Type Validation**: Zero TypeScript errors (`✓ Linting and checking validity of types`)
* **Page Generation**: All 83 static & dynamic routes generated and optimized (`✓ Generating static pages (83/83)`)

---

## 7. Security Best Practices & Maintenance Notes

1. **Defense in Depth**: Frontend UI controls (disabled buttons, read-only inputs) provide immediate visual feedback to the operator, but the server (`POST /api/documents` and `POST /api/print/authorize`) is the authoritative gatekeeper. Direct cURL, Postman, or script requests cannot bypass the identity lock.
2. **Ledger Integrity**: Free reprints depend strictly on the existence of an immutable `COMPLETED` debit transaction in `Wallet.transactions`. Never rely on mutable flags like `printCount` or `isPaid` without verifying the underlying ledger entry.
3. **Refund Awareness**: If an administrative or automated refund credit (`VERIFICATION_REFUND` or `REFUND`) is issued for a lookup, `verifyLegitimateReprintEntitlement` immediately revokes free reprint eligibility, preventing users from getting free cards after having their money refunded.
4. **Tenant Isolation**: MongoDB queries must always include `userId` filter constraints (`userObjectId`). Cross-tenant document access or reprint entitlement transfer is impossible.
