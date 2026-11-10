# Accero PrintPortal — Support Dashboard & Customer Operations Guide

## 1. Overview & Architecture
The **Accero PrintPortal Support Dashboard** (`/support`) provides a high-efficiency customer support and technical troubleshooting workspace for support agents, support managers, and administrators. It enables operators to receive rapid assistance regarding wallet deductions, bank UTR verifications, card printing alignment, and missing field adjustments, while upholding strict privacy and security boundaries.

### Core Architectural Principles
- **Role-Based Access Control (RBAC):** Accessible to `SUPPORT_AGENT`, `SUPPORT_MANAGER`, `ADMIN`, and `SUPER_ADMIN`.
- **Strict Customer Privacy & Data Minimization:** Support personnel are granted operational support context while strictly redacting sensitive personal information:
  - Phone numbers are masked (`98*****210`).
  - Email addresses are masked (`r***@example.com`).
  - Citizen identity numbers (Aadhaar, PAN, Voter ID, DL, RC) and portrait photographs are completely excluded from support queries.
- **Financial Barrier:** Support staff cannot modify operator wallet balances or execute manual ledger deductions. Financial adjustments require escalation to an administrator.

---

## 2. Support Dashboard Sections & Routes

### 2.1 Support Overview (`/support`)
- **Queue Metrics:**
  - Active open tickets in pipeline.
  - New / unassigned tickets awaiting triage.
  - In-progress tickets under agent investigation.
  - Overdue tickets exceeding the 24-hour SLA window.
  - Escalated cases requiring supervisor or admin intervention.
- **Operational Analytics:**
  - Support staff workload distribution (assigned tickets per agent).
  - Ticket volume broken down by functional category.

### 2.2 Ticket Queue (`/support/tickets`)
- **Ticket Lifecycle & States:**
  - `OPEN`: Newly submitted ticket awaiting assignment.
  - `ASSIGNED`: Allocated to a specific support agent.
  - `IN_PROGRESS`: Actively undergoing troubleshooting.
  - `WAITING_FOR_OPERATOR`: Pending operator response or bank proof.
  - `ESCALATED`: Routed to support managers or admins.
  - `RESOLVED`: Satisfactorily addressed with documented resolution notes.
  - `CLOSED`: Finalized ticket archived.
- **Interactive Drawer Features:**
  - Real-time conversation thread with operators.
  - Private internal team notes (highlighted with amber badges, invisible to operators).
  - Ticket escalation with reason capture.
  - Ticket resolution modal requiring root cause and outcome summary.

### 2.3 Operator Support Lookup (`/support/operators`)
- **Search Capability:** Find operators by name, email, or phone number.
- **Operator Support Profile:**
  - Account operational health (active vs suspended).
  - High-level wallet overview (current balance, total lifetime recharges, total card spend).
  - Recent sanitized ledger transactions (amounts and references; zero citizen data).
  - Inbound payment history (status, bank UTR).
  - Historical support tickets.

### 2.4 Technical Troubleshooting & Error Catalog (`/support/troubleshooting`)
- **PVC Tray Printer Alignment Cheatsheet:**
  - Guidance for Epson L805/L850 and Canon G-Series tray printers.
  - Scale configuration: Must be set to **100% / Actual Size** (never "Fit to Page").
  - Margins: Must be set to **None** (zero margins).
  - Paper source: Must be set to **CD/DVD Tray** or **PVC Card Tray**.
- **Standardized Error Code Reference:**
  - `E001`: Third-party API timeout (advice: wait 2 mins or use Manual Entry mode).
  - `E002`: Invalid document format / regex check failure.
  - `E003`: Insufficient wallet balance (direct to recharge; promote ₹249 + ₹50 bonus).
  - `E004`: Payment gateway handshake failure (request bank UTR for manual reconciliation).
  - `E005`: Concurrency lock contention (prevent duplicate wallet charging).
  - `E006`: Financial maker-checker limit exceeded (> ₹10,000 requires Super Admin).
  - `E007`: Corrupt or oversized portrait photo (recommend < 2MB JPEG).
  - `E008`: Regional language transliteration font rendering issue.
  - `E009`: Expired 72-hour document temporary cache.
  - `E010`: Unauthorized RBAC route access rejection.

### 2.5 Support Knowledge Base (`/support/knowledge-base`)
- **Interactive SOP Articles:**
  - Standard operating procedures for pending UPI reconciliations.
  - Free Lifetime Reprint Policy (₹0 for previously formatted cards).
  - Live editor split-screen missing field handling (amber warning alerts).
  - Accero Launch Offer bonus slab rules.
