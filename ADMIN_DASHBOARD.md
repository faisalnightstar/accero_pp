# Accero PrintPortal — Admin Dashboard Specification & Operations Guide

## 1. Overview & Architecture
The **Accero PrintPortal Admin Dashboard** (`/admin`) is an enterprise-grade administration and operations console engineered for platform administrators and super administrators. It centralizes real-time business health monitoring, operator management, financial ledger oversight, promotional campaign controls, service pricing configurations, payment gateway auditing, and compliance reporting.

### Core Architectural Principles
- **Strict Role-Based Access Control (RBAC):** Accessible exclusively by users with `SUPER_ADMIN` or `ADMIN` roles. Access is guarded at both the edge middleware layer (`src/middleware.ts`) and within each Server Action / API Route handler.
- **Zero Direct Balance Modification:** All wallet balance adjustments are strictly atomic (`$inc`), immutable, and paired with structured ledger records with `balanceBefore` and `balanceAfter`.
- **Financial Maker-Checker Guard:** Financial adjustments exceeding ₹10,000 strictly require `SUPER_ADMIN` authorization. Support agents and support managers are blocked from making wallet modifications.
- **Auditing by Default:** Every administrative action (status changes, wallet credits/debits, pricing updates, team changes) produces an immutable record in `AuditLog`.

---

## 2. Dashboard Sections & Routes

### 2.1 Overview & Metrics (`/admin`)
- **Key Metrics:**
  - Net Reconciled Revenue (Today, This Month, All Time)
  - Active Operator Accounts & Suspended Operators
  - Total Document Processings & PVC Prints
  - Wallet Liability (Aggregate unsettled operator wallet balances)
- **Real-Time Data Feeds:**
  - Dynamic aggregation across `Payment`, `Wallet`, `DocumentRecord`, and `User` MongoDB collections.
  - Service usage breakdown (PAN, Aadhaar, Voter ID, Driving License, Vehicle RC, Ration Card).

### 2.2 Operator Management (`/admin/operators`)
- **Search & Filters:** Search by operator name, email address, phone number, or MongoDB User ID. Filter by status (`active`, `suspended`).
- **Operator Inspector Drawer:**
  - Account identity & registration metadata.
  - Wallet balance and recent transaction stream.
  - Document lookup & PVC print statistics.
  - Linked support tickets history.
- **Administrative Actions:**
  - Status toggle (`active` ↔ `suspended`) with mandatory suspension justification.
  - Operator internal notes.
  - Direct wallet balance adjustment modal.

### 2.3 Wallet & Finance Management (`/admin/finance`)
- **System-Wide Transaction Ledger:**
  - Live queryable transaction ledger across all operator wallets.
  - Filter by transaction type (`credit`, `debit`) and category (`RECHARGE`, `PRINT_FEE`, `REFUND`, `MANUAL_ADJUSTMENT`, `PROMOTIONAL_BONUS`).
  - Search by transaction reference ID or description.
- **Manual UTR Approvals:**
  - Review operator-submitted bank UTR reference numbers.
  - Approve or reject manual UPI deposits with instant, atomic wallet credit.
- **Administrative Wallet Adjustments:**
  - Action types: `credit`, `debit`, `refund`.
  - Requires explicit reference ID, reason, and actor identification.
  - Enforces the ₹10,000 threshold maker-checker policy.

### 2.4 Promotional Campaigns & Recharge Bonuses (`/admin/campaigns`)
- **Promotional Engine:**
  - Manages automated recharge slab bonuses (e.g. Accero Launch Offer: ₹249 slab → ₹50 bonus).
  - Multi-slab computation: Multiples of the slab amount scale proportionally (₹498 → ₹100 bonus).
  - Operator bonus cap (e.g. ₹1,000 maximum per operator).
  - Budget caps: Campaigns automatically deactivate or deplete when total allocated budget is exhausted.
- **Campaign Controls:**
  - Toggle campaign status (`ACTIVE` ↔ `INACTIVE`).
  - Create new campaigns with customizable slab amounts, bonus values, dates, and budgets.

### 2.5 Service Pricing & Maintenance (`/admin/services`)
- **Dynamic Service Pricing:**
  - Manage per-card first-time verification fees for all 6 document types (PAN, Aadhaar, Voter, DL, RC, Ration).
  - Free Lifetime Reprint Guarantee: Subsequent reprints of already verified documents remain ₹0 (free).
- **Maintenance Mode:**
  - Toggle individual services into maintenance mode without taking down the entire portal.
  - Set custom operator-facing maintenance banners and notices.
  - Review fallback provider chain priority (NEO → SUREPASS → MANUAL).

### 2.6 Payment Gateway Auditing (`/admin/payments`)
- **Paytm UPI & Gateway Audit Table:**
  - View all inbound payments with order ID, payment ID, bank transaction ID / UTR, and status (`SUCCESS`, `PENDING`, `FAILED`, `REFUNDED`).
  - Search by order ID, payment ID, or bank reference.
  - Inspect payment details without exposing API keys, merchant secrets, or user passwords.

### 2.7 Financial Reports & CSV Exports (`/admin/reports`)
- **Revenue Summaries:**
  - Reconciled payment volume, live settlement rates, and print volume breakdowns.
- **CSV Data Export:**
  - Export filtered date-range transaction records as an audit-ready CSV file.
  - Sanitized output format suitable for accounting and tax compliance.

### 2.8 Team Access Control (`/admin/team`)
- **Super Administrator Console:**
  - Accessible strictly to `SUPER_ADMIN`.
  - List internal staff accounts with their assigned roles.
  - Create new staff accounts with roles: `support_agent`, `support_manager`, `admin`, `super_admin`.
  - Modify staff roles with privilege escalation prevention.
