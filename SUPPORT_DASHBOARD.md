# Accero PrintPortal — Customer Support Operations Architecture (SUPPORT_DASHBOARD.md)

## 1. Executive Summary & Purpose

The **Support Dashboard** (`/support`) provides customer support agents and support managers with a task-oriented workspace to triage, investigate, and resolve operator issues rapidly while strictly upholding customer privacy and data minimization standards.

```
                              ┌───────────────────────────────────┐
                              │    /support  (Support Dashboard)  │
                              │    SUPPORT_MANAGER & AGENT Access │
                              └─────────────────┬─────────────────┘
                                                │
         ┌──────────────────────┬───────────────┴───────────────┬──────────────────────┐
         ▼                      ▼                               ▼                      ▼
  /support/tickets     /support/operators           /support/troubleshooting   /support/knowledge-base
  - Triage & Queue     - Masked Contact Details     - E001-E010 Error Catalog  - Standard Procedures
  - Public Replies     - Sanitized Wallet Ledger    - CR80 Tray Alignment      - Free Reprint Policy
  - Internal Notes     - ZERO Citizen Document PII  - Copyable Scripts         - UPI Reconciliation
```

---

## 2. Support Permissions & Access Boundary

| Capability | Support Agent | Support Manager | Platform Admin | Super Admin |
| :--- | :--- | :--- | :--- | :--- |
| **View Ticket Queue** | Yes | Yes | Yes | Yes |
| **Reply to Tickets** | Yes | Yes | Yes | Yes |
| **Add Internal Confidential Notes** | Yes | Yes | Yes | Yes |
| **Assign / Reassign Tickets** | Self Only | Yes (Any Agent) | Yes | Yes |
| **Escalate Ticket to Manager** | Yes | Yes | Yes | Yes |
| **Resolve / Close Tickets** | Yes | Yes | Yes | Yes |
| **Lookup Operator (Masked PII)** | Yes | Yes | Yes | Yes |
| **Access Citizen Documents / Photos** | **DENIED** | **DENIED** | **DENIED** | **DENIED** |
| **Direct Wallet Credit / Debit** | **DENIED** | **DENIED** | Yes (≤ ₹10k) | Yes (Unlimited) |
| **Approve Manual UTR Recharges** | **DENIED** | **DENIED** | Yes | Yes |

---

## 3. Core Modules & Workflows

### 3.1 Support Command Center (`/support`)
- **Queue Overview:** Live count of Open, Assigned, In Progress, Waiting for Operator, Escalated, and Resolved tickets.
- **SLA Breach Monitoring:** Identifies tickets exceeding the 24-hour initial SLA.
- **Agent Workload Distribution:** Live visualization of active ticket assignments per support specialist.
- **Category Volume:** Real-time metrics across billing, printing, hardware, and technical categories.

### 3.2 Ticket Management (`/support/tickets`)
- **Categorization:**
  - `Account/Login Issue`
  - `Wallet Recharge Issue`
  - `Payment Pending`
  - `Wallet Balance Discrepancy`
  - `Document Lookup Failure`
  - `Printing Issue`
  - `Reprint Issue`
  - `Pricing Query`
  - `Promotional Bonus Issue`
  - `Technical Issue`
  - `Other`
- **Priorities:** `LOW`, `NORMAL`, `HIGH`, `URGENT`
- **Statuses:** `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `WAITING_FOR_OPERATOR`, `ESCALATED`, `RESOLVED`, `CLOSED`
- **Threaded Interaction:**
  - *Public Operator Replies:* Emitted to the operator and automatically transitions ticket to `WAITING_FOR_OPERATOR`.
  - *Internal Staff Notes:* Rendered with distinct amber security borders; permanently hidden from operator view.
  - *Escalation Flow:* Prompts agent for mandatory reasoning, sets priority to `URGENT`, and flags for management review.
  - *Resolution Flow:* Captures structured resolution note, marks ticket as `RESOLVED`, and logs resolution timestamp.

### 3.3 Operator Support Profile (`/support/operators`)
- **Masked Contact Lookup:** Search by Operator Name, Email, or Phone.
  - Email: Masked (`r***@example.com`).
  - Phone: Masked (`98*****210` or `+91*****210`).
- **Permitted Operational Data:**
  - Current wallet balance and summary totals.
  - Sanitized ledger entries (amounts, categories, reference IDs, timestamps).
  - Recent payment order IDs, bank UTR references, and verification statuses.
  - Existing ticket history.
- **Strictly Redacted Citizen Data:**
  - Zero access to Aadhaar numbers (UID), PAN numbers, EPIC numbers, Driving License numbers, RC numbers, Ration card numbers.
  - Zero access to citizen portrait photographs, signature files, or SVG/canvas layout definitions.
  - Zero access to user password hashes, JWT secrets, or payment gateway API credentials.

### 3.4 Technical Troubleshooting (`/support/troubleshooting`)
- **Standardized Error Catalog (E001–E010):**
  - `E001`: Upstream government portal API latency / timeout.
  - `E002`: Invalid document format or checksum mismatch.
  - `E003`: Insufficient wallet balance for document first-time verification.
  - `E004`: Payment gateway webhook delay / bank settlement pending.
  - `E005`: 72-hour document temporary cache expired.
  - `E006`: Physical card tray margin offset error.
  - `E007`: Image decoding / portrait asset render failure.
  - `E008`: Duplicate bank UTR submission detected.
  - `E009`: Session token expired / re-login required.
  - `E010`: Database concurrency lock retry exhausted.
- **Hardware Print Tray Cheatsheet:** Calibration specs for Epson L805 and Canon G-Series (Scale: 100% Actual Size, Margins: None, Media: PVC Tray).
- **Copyable Response Scripts:** Verified, customer-friendly explanations ready for one-click clipboard copying.

### 3.5 Internal Knowledge Base (`/support/knowledge-base`)
- **Searchable Index:** Instant keyword searching across standard operating procedures.
- **Standard Policies:**
  - *Free Lifetime Reprint Policy (₹0):* Clarifies that charges apply only to initial verification.
  - *UPI Payment Pending Workflow:* Reconciling 12-digit UTR bank references.
  - *Devanagari Font Rendering:* Troubleshooting Google Fonts (`Hind`, `Roboto`) in regional card canvases.
  - *Promotional Recharge Slabs:* Rules governing the ₹249 + ₹50 launch offer.
