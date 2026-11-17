# Accero Commercial Conversion Funnel & Drop-Off Measurement Framework
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Scope:** 8-Stage Operator Acquisition & Monetization Funnel Specification  
**Auditor:** Principal Growth Analyst & Product Analytics Engineer  
**Date:** November 17, 2026  

---

## 1. Funnel Architecture Overview

To generate compounding organic revenue, Accero PrintPortal tracks operators through an **8-Stage Linear Funnel**. Each transition is tied to a verified technical event with defined drop-off benchmarks:

```
[ Stage 1: Organic Landing Session ]
                 │
                 ▼ (Target: 12% Click-Through to Signup)
[ Stage 2: Registration Started ]
                 │
                 ▼ (Target: 70% Form Completion)
[ Stage 3: Registration Completed ]
                 │
                 ▼ (Target: 90% Immediate Auth)
[ Stage 4: First Successful Login ]
                 │
                 ▼ (Target: 45% Activation within 48h)
[ Stage 5: First Wallet Recharge (Purchase) ]
                 │
                 ▼ (Target: 85% Studio Utilization)
[ Stage 6: First Document Processed ]
                 │
                 ▼ (Target: 95% Print Trigger)
[ Stage 7: First Print Initiated ]
                 │
                 ▼ (Target: 90% Output Confirmation)
[ Stage 8: First Successful Print Confirmed ]
```

---

## 2. Stage-by-Stage Technical Specification

### Stage 1: Organic Landing Session
* **Definition:** A user session originating from Google Organic Search landing on any of the 52 public indexable pages.
* **Tracking Metric:** `session_start` with `traffic_source = google` and `medium = organic`.
* **Primary Conversion Goal:** User clicks a primary CTA button (`"Get Started"`, `"Register Free"`, or `"Compare Your Portal"`).
* **Expected Drop-Off:** 85%–90% bounce/browse rate on educational guides; 65%–75% bounce rate on commercial landing pages.
* **Key Metric:** Landing-to-Signup-Start Conversion Rate (Target: **> 10%** on commercial pages).

### Stage 2: Registration Started
* **Definition:** User navigates to `/register` and focuses on the first input field (`phone` or `centerName`).
* **Technical Trigger:** Client event `registration_started` dispatched via `src/lib/analytics/events.ts`.
* **Payload:** `{ sourcePage: document.referrer, deviceType: 'mobile' | 'desktop' }`.
* **Drop-Off Mechanism:** Abandonment caused by excessive required fields, password friction, or lack of trust signals.
* **Target Completion Rate:** **> 70%**.

### Stage 3: Registration Completed
* **Definition:** User submits the registration form and the backend creates a new tenant user account (`POST /api/auth/register` returns HTTP 201).
* **Technical Trigger:** `registration_completed`.
* **Payload:** `{ role: 'operator', userId: user._id }`.
* **Drop-Off Mechanism:** Validation errors (duplicate mobile number, weak password).

### Stage 4: First Successful Login
* **Definition:** Newly registered operator logs into the dashboard (`/dashboard` or `/studio`) for the first time.
* **Technical Trigger:** `login_success` with `{ isFirstLogin: true }`.
* **Target Immediate Auth Rate:** **> 90%** (facilitated by automatic session establishment on registration).

### Stage 5: First Wallet Recharge (Core Monetization Event)
* **Definition:** Operator adds funds to their prepaid ledger via Paytm / UPI gateway.
* **Source of Truth:** Server-side verification via `POST /api/wallet/paytm/verify` recording `status: 'SUCCESS'`.
* **Technical Trigger:** Native GA4 `purchase` event and custom `wallet_recharged`.
* **Payload:**
  ```javascript
  {
    transaction_id: orderId,
    value: amount, // e.g. 100.00, 500.00
    currency: 'INR',
    items: [{ item_id: 'prepaid_wallet', item_name: 'Wallet Recharge', price: amount }]
  }
  ```
* **Drop-Off Benchmark:** Industry baseline is ~30% activation. Accero targets **> 45%** activation by offering a transparent ₹0 reprint guarantee and small minimum top-ups (₹50–₹100).

### Stage 6: First Document Processed
* **Definition:** Operator enters a document number (PAN, Aadhaar, Voter, DL, RC, Ration, Farmer) and renders a formatted card on the split-screen studio canvas.
* **Technical Trigger:** `document_processed` with `{ docType, entryMethod: 'lookup' | 'manual', missingFieldsCount }`.
* **Drop-Off Benchmark:** Target **> 85%** of funded operators process a document within 24 hours of first recharge.

### Stage 7: First Print Initiated
* **Definition:** Operator clicks the primary "Print Card" button, the server action `authorizePrintAction` deducts/verifies the fee, and `window.print()` triggers the browser print dialog.
* **Technical Trigger:** `print_initiated` with `{ docType, printFormat: 'CR80', isReprint: false, fee: 10 }`.
* **Drop-Off Benchmark:** Target **> 95%** from document processed to print initiation.

### Stage 8: First Successful Print Confirmed
* **Definition:** Operator confirms in the post-print UI toast or prompt that the physical card tray printed correctly without jams or misprints.
* **Technical Trigger:** `print_success_confirmed` with `{ docType, printerTray: 'epson_tray' | 'canon_tray' | 'generic' }`.
* **Measurement Significance:** Confirms true end-to-end product utility and physical hardware alignment.

---

## 3. Drop-Off Diagnostics & Remediation Matrix

| Funnel Transition | Typical Drop-Off Cause | High-Leverage CRO Remediation |
| :--- | :--- | :--- |
| **Stage 1 $\rightarrow$ 2 (Landing to Signup)** | Unclear pricing or fear of monthly recurring software fees. | Embed explicit ₹0 platform fee badge and instant live preview canvas. |
| **Stage 2 $\rightarrow$ 3 (Signup to Complete)** | Long forms requiring email verification or business licenses. | Limit registration to 3 fields: Mobile Phone, Center Name, Password. |
| **Stage 4 $\rightarrow$ 5 (Login to First Recharge)** | High minimum recharge threshold (e.g. ₹500 or ₹1,000). | Support ₹50 and ₹100 micro-topups via instant UPI QR codes. |
| **Stage 6 $\rightarrow$ 7 (Preview to Print)** | Operator fears losing balance if printer jams or card clips. | Emphasize the **₹0 Session Re-Print Guarantee** directly next to the Print button. |
| **Stage 7 $\rightarrow$ 8 (Print to Physical Output)** | Physical printer driver margin mismatch (1mm white edge). | Provide one-click printer presets (Epson L8050 / Canon G570) in the print dialog. |

---

## 4. GA4 Exploration Funnel Setup Instructions

To visualize this funnel inside Google Analytics 4:
1. Navigate to **Explore** $\rightarrow$ **Funnel Exploration**.
2. Set Technique to **Open Funnel** (allows operators who bookmarked direct routes to enter).
3. Configure the 8 sequential steps using the verified event names above.
4. Segment by **Session Default Channel Group = Organic Search** and **Device Category**.
5. Set the completion window to **30 Days**.
