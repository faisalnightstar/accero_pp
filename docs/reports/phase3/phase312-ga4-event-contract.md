# Accero PrintPortal — GA4 & GTM Event Contract Specification
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Phase:** 3.1.2 Event Tracking Specification  
**Version:** 2.0 (Authoritative Implementation Contract)  
**Date:** November 17, 2026  
**Implementation Source:** `src/lib/analytics/events.ts`, `src/lib/analytics/dataLayer.ts`  

---

## 1. Governance & Data Protection Architecture

All events dispatched to Google Tag Manager (`GTM-MKXHQ658`) and Google Analytics 4 (`G-7D58N45Q5N`) must strictly adhere to the following principles:

1. **Zero Citizen PII:** Never transmit Aadhaar numbers, PAN numbers, Voter ID / EPIC numbers, Ration card numbers, Farmer ID numbers, Driving Licence numbers, Vehicle Registration numbers, citizen full names, father names, dates of birth, residential addresses, or citizen photograph/signature binary blobs.
2. **Zero Financial Credentials:** Never transmit raw wallet balances, bank account numbers, IFSC codes, or UPI Virtual Payment Addresses (VPAs).
3. **Recursive Payload Sanitization:** Every event payload passes through `sanitizeMetadata()` before reaching `window.dataLayer`, dropping forbidden keys and redacting regex-matched identity numbers (`[REDACTED_PII]`).
4. **Idempotent Revenue Tracking:** E-commerce `purchase` events use in-memory session deduplication keyed on `transactionId` to prevent double-counting caused by React component re-renders or browser back/forward navigation.

---

## 2. Canonical GA4 Event Inventory (10 Core Events)

### Event 1: `registration_started`
* **Trigger:** User actively submits the account creation form (clicks "Create Account" on `/register`).
* **Source of Truth:** Client form submission handler (`RegisterForm.tsx:handleSubmit`).
* **Allowed Parameters:** `pagePath: string` (e.g. `'/register'`).
* **Forbidden Parameters:** `name`, `email`, `phone`, `password`, `referralCode`.
* **Idempotency:** Fires once per form submit attempt. Does not fire on input focus or page load.
* **Test Case:** `tests/analytics-events.test.ts` (Event 1).

### Event 2: `registration_completed`
* **Trigger:** Server returns HTTP 200 with new account creation confirmation.
* **Source of Truth:** Server API response `/api/auth/register` (`res.ok === true`).
* **Allowed Parameters:** `pagePath: string`.
* **Forbidden Parameters:** `userId`, `email`, `name`, `authToken`.
* **Idempotency:** Dispatched once per successful account creation before redirect.
* **Test Case:** `tests/analytics-events.test.ts` (Event 2).

### Event 3: `login_completed`
* **Trigger:** User successfully authenticates credentials.
* **Source of Truth:** Server API response `/api/auth/login` (`res.ok === true`).
* **Allowed Parameters:** `operatorRole: 'cyber_cafe' | 'csc_vle' | 'retailer' | 'print_shop' | 'other'`.
* **Forbidden Parameters:** `email`, `password`, `userId`, `jwt`.
* **Idempotency:** Dispatched once upon valid session cookie issuance.
* **Test Case:** `tests/analytics-events.test.ts` (Event 3).

### Event 4: `wallet_recharge_initiated`
* **Trigger:** User selects a top-up amount and clicks to generate a payment order.
* **Source of Truth:** Client UI in `RechargeModal.tsx` initiating `/api/wallet/paytm/create-order`.
* **Allowed Parameters:** `rechargeAmount: number`, `paymentMethod: 'GATEWAY' | 'UPI'`.
* **Forbidden Parameters:** Bank details, VPA, account numbers.
* **Idempotency:** Dispatched once per order creation request.
* **Test Case:** `tests/analytics-events.test.ts` (Event 4).

### Event 5: `purchase` (Standard GA4 E-Commerce Revenue Event)
* **Trigger:** Payment gateway webhook / verification succeeds server-side, and prepaid balance credit is committed.
* **Source of Truth:** Server API `/api/wallet/paytm/verify` returning `status: 'success'`.
* **Allowed Parameters:**
  - `transactionId: string` (Paytm Order ID / Bank Reference)
  - `value: number` (Recharge amount in INR)
  - `currency: 'INR'`
  - `paymentMethod: string`
  - `items: [{ item_id: 'wallet_topup', item_name: 'Prepaid Wallet Topup', price: number, quantity: 1 }]`
* **Forbidden Parameters:** Merchant keys, transaction secrets, citizen identifiers.
* **Idempotency:** Deduplicated by `transactionId` in `processedTransactionIds` set. Never fires twice for the same order.
* **Test Case:** `tests/analytics-events.test.ts` (Purchase Deduplication Test).

### Event 6: `document_processing_started`
* **Trigger:** An operator retrieves or enters a document record into the split-screen studio.
* **Source of Truth:** Client studio canvas mounting or manual document form creation.
* **Allowed Parameters:** `docCategory: string`, `isManual: boolean`, `missingCount: number`.
* **Forbidden Parameters:** Full document numbers, citizen names, photos.
* **Idempotency:** Fires once per document studio load.
* **Test Case:** `tests/analytics-events.test.ts` (Event 6).

### Event 7: `print_initiated`
* **Trigger:** Server authorizes wallet deduction or verifies ₹0 reprint eligibility, and application issues `window.print()`.
* **Source of Truth:** Successful response from `authorizePrintAction()` in `actions/print.ts`.
* **Allowed Parameters:** `docType: string`, `printFormat: 'CR80' | 'A4' | 'PDF'`, `isReprint: boolean`, `fee: number`.
* **Forbidden Parameters:** Card identifiers, citizen names.
* **Idempotency:** Dispatched immediately prior to browser print dialog invocation.
* **Test Case:** `tests/analytics-events.test.ts` (Print Workflow Semantics Test).

### Event 8: `print_dialog_closed`
* **Trigger:** Browser print dialog returns control to the application window.
* **Source of Truth:** Completion of `window.print()` synchronous block or `onafterprint` event.
* **Allowed Parameters:** `docType: string`, `printFormat: string`, `isReprint: boolean`.
* **Forbidden Parameters:** None.
* **Distinction:** Represents browser dialog dismissal or printer dispatch; **does NOT claim verified physical card output**.
* **Test Case:** `tests/analytics-events.test.ts` (Print Dialog Return Test).

### Event 9: `print_success_confirmed`
* **Trigger:** Operator explicitly clicks "Print Verified" or confirms satisfactory physical card output.
* **Source of Truth:** Operator UI confirmation interaction.
* **Allowed Parameters:** `docType: string`, `printerTray: 'epson_tray' | 'canon_tray' | 'generic'`.
* **Forbidden Parameters:** Citizen names, demographic data.
* **Idempotency:** Fires once per operator-confirmed physical print.
* **Test Case:** `tests/analytics-events.test.ts` (Print Success Confirmation Test).

### Event 10: `refund_completed`
* **Trigger:** Server executes an automated wallet balance reversal for an eligible failed external query.
* **Source of Truth:** Server-side atomic transaction reversal.
* **Allowed Parameters:** `value: number`, `currency: 'INR'`, `errorType: string`.
* **Forbidden Parameters:** Account numbers, user IDs.
* **Idempotency:** Dispatched once per successful balance refund.
* **Test Case:** `tests/analytics-events.test.ts` (Event 10).

---

## 3. PII Sanitization Logic

```typescript
// Denylisted Key Pattern Regex
const FORBIDDEN_KEY_PATTERNS = [
  /aadhaar/i, /aadhar/i, /\buid\b/i, /pan/i, /epic/i, /voter/i,
  /ration/i, /farmer/i, /citizen/i, /father/i, /fullname/i,
  /(?<!item_)\bname\b/i, /\bdob\b/i, /birth/i, /address/i,
  /mobile/i, /phone/i, /email/i, /password/i, /secret/i,
  /token/i, /apikey/i, /vpa/i, /account_?num/i,
];

// Sensitive String Value Patterns (Auto-Redacted to '[REDACTED_PII]')
const SENSITIVE_VALUE_PATTERNS = [
  /^\d{12}$/,                  // 12-digit Aadhaar
  /^\d{4}\s\d{4}\s\d{4}$/,      // Spaced Aadhaar
  /^[A-Z]{5}[0-9]{4}[A-Z]$/,    // 10-char PAN
  /^[A-Z]{3}[0-9]{7}$/,        // EPIC Voter ID
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Email address
  /^[6-9]\d{9}$/,              // 10-digit Indian Mobile
];
```
