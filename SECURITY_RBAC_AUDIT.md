# Accero PrintPortal — Security & RBAC Architecture Audit

## 1. Role-Based Access Control (RBAC) Specification

Accero PrintPortal enforces a hierarchical, multi-tiered Role-Based Access Control architecture across edge middleware, API routes, and Server Actions.

### 1.1 Role Hierarchy

```
                    ┌────────────────────────┐
                    │      SUPER_ADMIN       │
                    │ (Full System Control,  │
                    │ Team Admin, Limitless) │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │         ADMIN          │
                    │ (Finances, Campaigns,  │
                    │ Pricing, Adj < ₹10k)   │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │    SUPPORT_MANAGER     │
                    │ (Triage, Escalations,  │
                    │  Workload Assignment)  │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │     SUPPORT_AGENT      │
                    │ (Ticket Resolution,    │
                    │ Masked Operator Profile)
                    └───────────┬────────────┘
                                │
         ┌──────────────────────┴──────────────────────┐
         ▼                                             ▼
┌──────────────────┐                         ┌──────────────────┐
│     OPERATOR     │                         │   CUSTOMER/USER  │
│ (Studio, Print)  │                         │ (Standard User)  │
└──────────────────┘                         └──────────────────┘
```

### 1.2 Permissions Matrix

| Functional Capability | `SUPER_ADMIN` | `ADMIN` | `SUPPORT_MANAGER` | `SUPPORT_AGENT` | `OPERATOR` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Access Admin Dashboard (`/admin/*`) | Yes | Yes | No | No | No |
| View Financial Ledger & Reports | Yes | Yes | No | No | No |
| Wallet Adjustments (&lt;= ₹10,000) | Yes | Yes | No | No | No |
| Wallet Adjustments (&gt; ₹10,000) | Yes | **No (Blocked)** | No | No | No |
| Promotional Campaign Creation & Toggle | Yes | Yes | No | No | No |
| Service Pricing & Maintenance Mode | Yes | Yes | No | No | No |
| Manage Staff Accounts & Super Admins | Yes | **No (Blocked)** | No | No | No |
| Access Support Dashboard (`/support/*`) | Yes | Yes | Yes | Yes | No |
| View / Reply / Resolve Tickets | Yes | Yes | Yes | Yes | No |
| Escalate Support Tickets | Yes | Yes | Yes | Yes | No |
| Assign Tickets & Manage Workload | Yes | Yes | Yes | No | No |
| Search Operators (Masked PII) | Yes | Yes | Yes | Yes | No |
| View Citizen Document Data (PAN/UIDAI) | No | No | No | No | **Only Own** |

---

## 2. Financial Integrity & Maker-Checker Policy

### 2.1 Ledger Invariance
- Direct balance updates without ledger records are strictly prohibited.
- Every financial adjustment executes atomically via MongoDB `$inc` accompanied by `$push` on the wallet transaction ledger.
- Each transaction record captures:
  - `amount`: Absolute numeric value.
  - `type`: `credit` or `debit`.
  - `category`: `RECHARGE`, `PRINT_FEE`, `REFUND`, `MANUAL_ADJUSTMENT`, `PROMOTIONAL_BONUS`.
  - `balanceBefore` & `balanceAfter`: Snapshots for tamper-evident reconciliation.
  - `referenceId`: Unique transaction or adjustment code.

### 2.2 Support Exclusion & High-Value Ceiling
- `assertFinancialAdjustmentPermission(session, amount)` enforces:
  1. Instant rejection with 403 Forbidden if the actor has a support role (`support_agent` or `support_manager`).
  2. Instant rejection with 403 Forbidden if an `admin` attempts an adjustment exceeding ₹10,000 without `SUPER_ADMIN` credentials.

---

## 3. Data Minimization & Privacy Protection (DPDP Conformance)

### 3.1 PII Masking Implementation
In compliance with data protection best practices, customer identities exposed in support interfaces are minimized:
- **Phone Numbers:** `maskPhone()` masks all characters except country code/prefix and final 3 digits (e.g. `98*****210`, `+91*****210`).
- **Email Addresses:** `maskEmail()` masks username portion preserving only the initial character (e.g. `r***@domain.com`).
- **Identity Identifiers:** `maskIdentifier()` conceals all digits except the final 4 characters (e.g. `********9012`).

### 3.2 Total Citizen Document Isolation
Support queries (`searchSupportOperators`, `getOperatorSupportProfile`, `getSupportTickets`) strictly exclude citizen identity documents:
- Zero Aadhaar numbers, PAN numbers, Voter IDs, or Driving License strings are queried or returned.
- Zero portrait photographs or signature images are exposed to support staff.

---

## 4. Immutable Audit Logging

Every critical system event is logged via `logAuditEvent()` in `AuditLog` with:
- `actorId`, `actorEmail`, and `actorRole`.
- `action`: Specific audit action enum (e.g. `WALLET_ADMIN_CREDIT`, `OPERATOR_STATUS_CHANGED`, `CAMPAIGN_CREATED`, `SERVICE_CONFIG_UPDATED`, `TEAM_USER_CREATED`, `SUPPORT_TICKET_ESCALATED`).
- `resourceType`: High-level domain (`AUTH`, `WALLET`, `PAYMENT`, `DOCUMENT`, `SECURITY`, `PRINT_JOB`, `OPERATOR`, `CAMPAIGN`, `SERVICE`, `SUPPORT_TICKET`, `TEAM`, `REPORT`).
- `details`: Contextual event payload with sensitive credentials and passwords automatically redacted via `sanitizeDetails()`.

---

## 5. Automated Verification Results

- **Vitest RBAC & Campaign Suite:** 19/19 tests passing (`tests/admin-support-rbac.test.ts`).
- **Complete Test Suite:** 97/97 tests passing across all 13 test files.
- **TypeScript Compiler:** 0 errors reported by `npx tsc --noEmit`.
- **Next.js Production Build:** Successful compilation and optimization with code 0 (`npm run build`).
