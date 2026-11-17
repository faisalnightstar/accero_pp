# Accero PrintPortal — Administrative Operations Architecture (ADMIN_DASHBOARD.md)

## 1. Executive Summary & Purpose

The **Admin Dashboard** (`/admin`) serves as the central business, operational, and financial command center for **Accero PrintPortal** (`https://printportal.accero.app`). Engineered under strict security, data minimization, and financial integrity principles, it provides authorized platform administrators with high-fidelity control over operator onboarding, revenue accounting, promotional incentives, pricing, and gateway auditing.

```
                              ┌───────────────────────────────────┐
                              │     /admin  (Admin Dashboard)      │
                              │   SUPER_ADMIN & ADMIN Access Only │
                              └─────────────────┬─────────────────┘
                                                │
         ┌──────────────┬───────────────┬───────┴───────┬───────────────┬──────────────┐
         ▼              ▼               ▼               ▼               ▼              ▼
   /admin/operators /admin/finance /admin/campaigns /admin/services /admin/payments /admin/team
   - Status & Notes - Ledger Audit  - ₹249 + ₹50     - Dynamic Fees  - Paytm Gateway - RBAC Control
   - Zero Cit. PII  - UTR Approval  - Budget Caps   - Maint. Mode   - Bank UTR Audit - Super Admin
```

---

## 2. Role-Based Access Control (RBAC) & Route Protection

Administrative routes and server actions are strictly gated by server-side verification:

| Role | Route Access (`/admin/*`) | Financial Adjustments | Team Management | High-Value Limit |
| :--- | :--- | :--- | :--- | :--- |
| **`SUPER_ADMIN`** | Full Unrestricted | Unlimited with Audit Log | Full (Can assign/revoke Super Admins) | No Cap (Bypasses ₹10k limit) |
| **`ADMIN`** | Full Business & Ops | Capped up to ₹10,000 | Can view team; cannot grant Super Admin | ≤ ₹10,000 (Maker-Checker) |
| **`SUPPORT_MANAGER`** | Denied (403 Redirect) | Blocked (Hard Rejection) | Denied | Blocked |
| **`SUPPORT_AGENT`** | Denied (403 Redirect) | Blocked (Hard Rejection) | Denied | Blocked |
| **`OPERATOR / USER`** | Denied (403 Redirect) | Blocked (Hard Rejection) | Denied | Blocked |

*Enforcement Mechanism:* Middleware (`src/middleware.ts`) provides Edge-level perimeter blocking, while Server Actions (`src/actions/admin.ts`) and API routes independently execute `assertRole(session, ['super_admin', 'admin'])`.

---

## 3. Core Modules & Operational Workflows

### 3.1 Overview & Real-Time Metrics (`/admin`)
- **Total Registered Operators & Active Count:** Computed directly from `User.countDocuments({ role: 'operator' })`.
- **Wallet Balance Liability:** Live sum of operator balances (`Wallet.aggregate([ { $group: { _id: null, total: { $sum: '$balance' } } } ])`).
- **Revenue Accounting:** Real-time breakdown of Paytm UPI and approved manual recharge transactions (`today`, `thisMonth`, `total`).
- **Live Service Volume:** Aggregation of processed identity documents across PAN, Aadhaar, Voter, Driving License, RC, and Ration cards.
- **Zero Dummy Data:** All metrics originate from verified MongoDB collection documents; mock counters are strictly disallowed.

### 3.2 Operator Management (`/admin/operators`)
- **Search & Filtering:** Real-time lookup by Name, Email, Phone, or Operator ID.
- **Status Lifecycle:** Administrative activation and suspension with mandatory recorded rationale (`suspendedReason`).
- **Internal Administrative Notes:** Threaded operational notes logged with actor timestamps.
- **Profile Inspector Drawer:** Displays registration history, recharge total, wallet balance, and support ticket history.
- **Data Minimization:** Strictly hides citizen identity documents (Aadhaar numbers, PAN numbers, photos) from operator administrative profiles.

### 3.3 Wallet & Financial Management (`/admin/finance`)
- **Transaction Ledger Query:** Search and filter by reference ID, transaction type (`credit`, `debit`), and category (`RECHARGE`, `SERVICE_FEE`, `REFUND`, `PROMOTIONAL_BONUS`, `MANUAL_ADJUSTMENT`).
- **Manual UTR Reconciliation:** Interactive approval and rejection workflow for direct UPI bank transfer requests (`approveManualRecharge` / `rejectManualRecharge`).
- **Administrative Adjustments:**
  - Standard Admin: May execute adjustments up to ₹10,000 with mandatory justification.
  - Maker-Checker Rule: Adjustments exceeding ₹10,000 require Super Administrator credentials.
  - Immutable Atomic Persistence: Every balance change uses MongoDB `$inc` paired with an immutable `$push` to the wallet transaction ledger and generates a corresponding `AuditLog` entry.

### 3.4 Promotional Campaigns & Recharge Bonuses (`/admin/campaigns`)
- **Engine Rules:** Multi-slab calculation (e.g. ₹249 recharge slab receives ₹50 bonus).
  - ₹249 recharge = ₹249 purchased + ₹50 promotional credit (Total ₹299).
  - ₹498 recharge = ₹498 purchased + ₹100 promotional credit (Total ₹598).
- **Separate Accounting:** Promotional bonuses are tagged with category `PROMOTIONAL_BONUS` and stored separately from cash deposits.
- **Guardrails:** Per-operator bonus cap (default ₹1,000) and campaign-level total budget caps.
- **Idempotency:** Unique reference `BONUS-<orderId>` prevents duplicate bonus issuance.

### 3.5 Service Pricing & Maintenance (`/admin/services`)
- **Dynamic Fee Overrides:** Live configuration of first-time verification fees for PAN, Aadhaar, Voter, DL, Vehicle RC, and Ration Card.
- **Provider Fallback Routing:** Priority chain (`NEO` -> `SUREPASS` -> `MANUAL`) ensuring zero downtime during upstream government portal latency.
- **Maintenance Banner:** Toggles maintenance mode and provides real-time alerts to operators without taking the application offline.
- **Free Lifetime Reprints (₹0):** Service fees apply exclusively to the initial verification; all subsequent print jobs are permanently free.

### 3.6 Payment Auditing (`/admin/payments`)
- **Auditing Grid:** Direct inspection of payment order IDs, Paytm transaction IDs, bank UTR references, amounts, and settlement statuses.
- **Credential Protection:** Secrets, merchant keys, and gateway passwords are never returned or rendered in client components.

### 3.7 Reports & Data Exports (`/admin/reports`)
- **Date Range Querying:** Reconciled revenue, recharge totals, and service processing volume.
- **Sanitized CSV Download:** Server-side CSV generation with field escaping and customer data minimization.

### 3.8 Team & Access Control (`/admin/team`)
- **Super Admin Exclusive:** Only existing Super Administrators can invite, modify, or promote users to `super_admin`.
- **Role Assignment:** Provisioning of `admin`, `support_manager`, and `support_agent` accounts with secure bcrypt hashing (salt rounds: 12).

---

## 4. Financial Integrity Controls

1. **Zero Direct Mutations:** Direct balance updates via `User` or bypassing `Wallet` transactions are forbidden.
2. **Atomic Writes:** All financial operations execute atomically using `$inc` and `$push` on the `Wallet` model.
3. **Idempotent Webhooks:** Paytm callbacks verify `orderId` status before crediting wallet balances.
4. **Audit Trail:** Every administrative action is logged to `AuditLog` with actor ID, IP address, before/after balances, and justification.
