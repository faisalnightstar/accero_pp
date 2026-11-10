# Accero PrintPortal — Security, RBAC & Financial Integrity Audit (SECURITY_RBAC_AUDIT.md)

## 1. Security Architecture & Threat Model

Accero PrintPortal processes sensitive citizen identity records and transactional financial balances. The security architecture adheres to defense-in-depth principles:

1. **Perimeter Layer:** Edge middleware (`src/middleware.ts`) inspects signed session cookies and enforces role boundaries before request dispatch.
2. **Application Layer:** Server actions (`src/actions/admin.ts`, `src/actions/support.ts`) execute independent authorization assertions (`assertRole`, `assertFinancialAdjustmentPermission`).
3. **Data Layer:** MongoDB atomic operators (`$inc`, `$push`) and strict Mongoose schemas guarantee financial consistency and prevent balance drift.
4. **Audit Layer:** Centralized, immutable event logging records all state changes without logging secrets or citizen identity details.

---

## 2. Comprehensive RBAC Permission Matrix

| Capability / Resource | Super Admin | Admin | Support Manager | Support Agent | Operator / User |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Access Admin Dashboard (`/admin/*`)** | ALLOW | ALLOW | DENY | DENY | DENY |
| **Access Support Dashboard (`/support/*`)** | ALLOW | ALLOW | ALLOW | ALLOW | DENY |
| **View Operator Contact Information** | Full | Full | Masked | Masked | Self Only |
| **View Citizen Document Payloads** | DENIED | DENIED | DENIED | DENIED | Self Only (72h) |
| **Administrative Wallet Credit/Debit** | Unlimited | ≤ ₹10,000 | DENIED | DENIED | DENIED |
| **High-Value Adjustment (> ₹10,000)** | ALLOW | DENIED | DENIED | DENIED | DENIED |
| **Approve / Reject Manual UTRs** | ALLOW | ALLOW | DENIED | DENIED | DENIED |
| **Create / Modify Promotional Campaigns** | ALLOW | ALLOW | DENIED | DENIED | DENIED |
| **Update Service Pricing & Maintenance** | ALLOW | ALLOW | DENIED | DENIED | DENIED |
| **Assign Support Tickets** | ALLOW | ALLOW | ALLOW | Self Only | DENIED |
| **Escalate Support Tickets** | ALLOW | ALLOW | ALLOW | ALLOW | DENIED |
| **Create / Promote Super Admin Accounts** | ALLOW | DENIED | DENIED | DENIED | DENIED |
| **Provision Admin / Support Staff** | ALLOW | DENIED | DENIED | DENIED | DENIED |

---

## 3. Financial Integrity Controls

### Rule 1: Zero Direct Wallet Balance Mutations
Direct modifications of `wallet.balance` or `user.balance` outside of ledger-backed operations are strictly prohibited. All balance alterations must execute via `executeAdministrativeWalletAdjustment` or verified payment webhooks.

### Rule 2: Atomic Balance Updates & Ledger Consistency
Balance adjustments utilize MongoDB atomic `$inc` operators accompanied by an atomic `$push` of an immutable transaction object containing:
- `amount`
- `type` (`credit` | `debit`)
- `category` (`MANUAL_ADJUSTMENT`, `REFUND`, `RECHARGE`, `SERVICE_FEE`, `PROMOTIONAL_BONUS`)
- `referenceId` (Unique traceable string)
- `balanceBefore` and `balanceAfter`
- `createdAt`

### Rule 3: Maker-Checker Policy for High-Value Adjustments
To eliminate single-operator rogue adjustments, adjustments exceeding **₹10,000** require explicit `super_admin` role credentials. Standard administrators attempting adjustments above this threshold receive a hard rejection (`403 Forbidden`).

### Rule 4: Idempotent Payment & Bonus Crediting
Recharge credits and promotional bonuses enforce strict idempotency:
- Paytm callback checks payment status against database before crediting.
- Promotional launch bonus (`calculatePromotionalBonus`) queries `transactions.referenceId: BONUS-<orderId>` to guarantee a bonus cannot be credited more than once per payment.

---

## 4. Customer Privacy & Data Minimization

In compliance with Indian data protection principles (DPDP Act) and identity guidelines:
1. **Support Masking:**
   - Phone numbers: Masked via `maskPhone()` (e.g. `98*****210` or `+91*****210`).
   - Email addresses: Masked via `maskEmail()` (e.g. `r***@example.com`).
2. **Citizen Identity Data Isolation:**
   - Support agents are strictly blocked from retrieving citizen Aadhaar numbers, PAN numbers, Voter IDs, Driving License numbers, RC numbers, or Ration card details.
   - Support profiles query ONLY operational metadata (`wallet`, `payments`, `tickets`), omitting document records.
3. **Secret Redaction in Audit Logs:**
   - The `sanitizeDetails()` utility in `src/lib/logger/audit.ts` automatically redacts passwords, JWT tokens, merchant keys, API keys, and citizen identity numbers before persistence.

---

## 5. Centralized Audit Logging Architecture

All significant operational and security events generate an immutable `AuditLog` entry:

```typescript
{
  actorId: ObjectId("..."),
  actorEmail: "admin@accero.app",
  actorRole: "super_admin",
  action: "WALLET_ADMIN_CREDIT",
  resourceType: "WALLET",
  resourceId: "6798a...",
  details: {
    adjustmentReference: "ADJ-88291029",
    type: "credit",
    amount: 500,
    balanceBefore: 120,
    balanceAfter: 620,
    reason: "Bank UTR reconciliation verified"
  },
  ip: "203.0.113.195",
  status: "SUCCESS",
  createdAt: ISODate("2026-11-10T06:45:00.000Z")
}
```

Audit records are append-only and cannot be updated or deleted through standard application endpoints.

---

## 6. Verification & Test Evidence

The RBAC and security architecture is validated through automated test coverage in `tests/admin-support-rbac.test.ts`:

- **Role Hierarchy & Normalization:** Confirms canonical resolution of roles across legacy formats.
- **Permission Matrix Enforcement:** Verifies endpoint blocks for unauthorized roles.
- **Financial Adjustment Integrity:** Validates blocking of support agents and enforcing the ₹10,000 Super Admin threshold.
- **PII Masking Integrity:** Validates phone, email, and identifier sanitization.
- **Promotional Slab Calculations:** Verifies multi-slab bonuses, operator caps (₹1,000), and budget exhaustion handling.

*Test Suite Execution:* 13 test files, 97 passing tests, 0 failures.
