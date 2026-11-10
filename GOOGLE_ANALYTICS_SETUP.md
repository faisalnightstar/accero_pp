# Google Analytics 4 & Google Tag Manager Setup Guide
**Accero PrintPortal (https://printportal.accero.app)**

This guide provides step-by-step instructions to configure **Google Tag Manager (GTM)** container `GTM-MKXHQ658` and connect it to a **Google Analytics 4 (GA4)** property for privacy-preserving conversion tracking.

---

## 1. GTM Container Overview

* **Container ID:** `GTM-MKXHQ658`
* **Implementation Pattern:** Native Next.js 15 App Router (`src/components/analytics/GoogleTagManager.tsx`)
* **Environment Variable:** `NEXT_PUBLIC_GTM_ID=GTM-MKXHQ658`
* **DataLayer Engine:** Privacy-sanitized pipeline (`src/lib/analytics/dataLayer.ts`)

---

## 2. GA4 Property Configuration

1. Sign in to [Google Analytics](https://analytics.google.com).
2. Go to **Admin** (gear icon in lower left).
3. Under the Account column, select your account (e.g. `Accero Technologies`).
4. Click **Create Property**:
   * **Property Name:** `Accero PrintPortal (Production)`
   * **Reporting Time Zone:** `India (GMT+05:30)`
   * **Currency:** `Indian Rupee (INR ₹)`
5. Click **Next**, complete business details (Industry: *Computers & Electronics* or *Business & Industrial*), and click **Create**.

---

## 3. GA4 Web Data Stream Setup

1. In the property, go to **Admin > Data Streams > Web**.
2. Click **Add Stream**:
   * **Website URL:** `https://printportal.accero.app`
   * **Stream Name:** `Accero Web Portal (Production)`
   * **Enhanced Measurement:** Enable (Page views, Scrolls, Outbound clicks, Site search).
3. Click **Create Stream**.
4. Note your **Measurement ID** (format: `G-XXXXXXXXXX`).

> [!IMPORTANT]
> Do NOT paste the Measurement ID directly into the Next.js code. It is configured exclusively inside Google Tag Manager to avoid hardcoded IDs and duplicate tags.

---

## 4. GTM Configuration: Google Tag Setup

1. Sign in to [Google Tag Manager](https://tagmanager.google.com) and open container `GTM-MKXHQ658`.
2. **Create a Variable for Measurement ID:**
   * Go to **Variables > User-Defined Variables > New**.
   * Name: `Const - GA4 Measurement ID`.
   * Type: **Constant**.
   * Value: `G-XXXXXXXXXX` (your GA4 Measurement ID).
   * Save.
3. **Create the Google Tag (GA4 Configuration):**
   * Go to **Tags > New**.
   * Name: `GA4 - Google Tag - Base Configuration`.
   * Tag Type: **Google Tag**.
   * Tag ID: `{{Const - GA4 Measurement ID}}`.
   * **Configuration Settings:**
     * `send_page_view`: `false` *(Page views are handled dynamically by Next.js App Router)*.
   * **Triggering:** Select **Initialization - All Pages**.
   * Save.

---

## 5. App Router Page View Tracking (Virtual Page Views)

Because Next.js 15 uses client-side transitions, the application dispatches a sanitized `page_view` event to `window.dataLayer` on every route transition:

1. **Create DataLayer Variables in GTM:**
   * `dlv - page_path`: Variable Type *Data Layer Variable*, Data Layer Variable Name: `page_path`
   * `dlv - page_title`: Variable Type *Data Layer Variable*, Data Layer Variable Name: `page_title`
   * `dlv - page_location`: Variable Type *Data Layer Variable*, Data Layer Variable Name: `page_location`
2. **Create Trigger:**
   * Name: `Custom Event - page_view`
   * Type: **Custom Event**
   * Event Name: `page_view`
3. **Create Page View Tag:**
   * Name: `GA4 - Event - page_view`
   * Type: **Google Analytics: GA4 Event**
   * Measurement ID: `{{Const - GA4 Measurement ID}}`
   * Event Name: `page_view`
   * Event Parameters:
     * `page_path`: `{{dlv - page_path}}`
     * `page_title`: `{{dlv - page_title}}`
     * `page_location`: `{{dlv - page_location}}`
   * Triggering: `Custom Event - page_view`
   * Save.

---

## 6. Custom & Conversion Funnel Events

The application emits 9 specialized business funnel events. Set up tags and triggers for each:

### Supported Funnel Events

| Event Name | Trigger Event | Key Parameters |
|---|---|---|
| `registration_started` | `registration_started` | `method` |
| `registration_completed` | `registration_completed` | `operatorRole` |
| `first_lookup` | `first_lookup` | `docType`, `isManual` |
| `lookup_failed` | `lookup_failed` | `docType`, `errorType` |
| `recharge_started` | `recharge_started` | `paymentMethod`, `rechargeAmount` |
| `recharge_completed` | `recharge_completed` | `paymentMethod`, `rechargeAmount` |
| `print_started` | `print_started` | `docType`, `printFormat` |
| `print_completed` | `print_completed` | `docType`, `printFormat`, `isReprint` |
| `repeat_print` | `repeat_print` | `docType`, `printFormat` |

### Setting up a Generic GA4 Event Tag in GTM:

Instead of creating 9 separate tags, create one unified event tag:

1. **Data Layer Variables:**
   * `dlv - docType` -> `docType`
   * `dlv - paymentMethod` -> `paymentMethod`
   * `dlv - rechargeAmount` -> `rechargeAmount`
   * `dlv - printFormat` -> `printFormat`
   * `dlv - isReprint` -> `isReprint`
   * `dlv - errorType` -> `errorType`
2. **Trigger:**
   * Name: `Custom Events - Conversion Funnel`
   * Type: **Custom Event**
   * Event Name (use regex match): `registration_started|registration_completed|first_lookup|lookup_failed|recharge_started|recharge_completed|print_started|print_completed|repeat_print`
3. **Tag:**
   * Name: `GA4 - Funnel Events`
   * Type: **Google Analytics: GA4 Event**
   * Measurement ID: `{{Const - GA4 Measurement ID}}`
   * Event Name: `{{_event}}`
   * Event Parameters: Add the parameters mapped above.
   * Triggering: `Custom Events - Conversion Funnel`

---

## 7. GA4 Conversion Event Configuration

Once events are received in GA4:
1. In GA4, go to **Admin > Data display > Events**.
2. Locate or mark as key conversion events:
   * `registration_completed` (Account Activation)
   * `recharge_completed` (Payment Funnel Success)
   * `print_completed` (Core Service Monetization)
   * `repeat_print` (Customer Retention)
3. Toggle **Mark as key event** for each.

---

## 8. DebugView & Preview Mode Verification

1. In GTM, click **Preview** in the top-right corner.
2. Enter URL: `https://printportal.accero.app` (or `http://localhost:3000` for local dev).
3. Connect Tag Assistant:
   * Perform route navigation -> Verify `page_view` fires in Tag Assistant.
   * Test registration flow -> Verify `registration_started` and `registration_completed` fire.
   * Test lookup -> Verify `first_lookup` or `lookup_failed` fire.
   * Test recharge modal -> Verify `recharge_started` and `recharge_completed` fire.
   * Test print button -> Verify `print_started` and `print_completed` fire.
4. In GA4, go to **Admin > DebugView**:
   * Confirm all events appear along the real-time timeline.
   * Click on events to verify that parameters are clean and free of PII.

---

## 9. Production Publishing

1. In GTM, click **Submit** (top right).
2. Version Name: `v1.0 - Accero GA4 Base + Conversion Funnel`.
3. Description: `Added Google Tag for GA4, virtual page_view tracker, and privacy-sanitized operator funnel events`.
4. Click **Publish**.

---

## 10. Privacy Guarantees & Non-Transmission Policy

> [!CAUTION]
> Accero PrintPortal processes sensitive government and citizen documents. The following information is strictly blocked at the client engine level (`src/lib/analytics/dataLayer.ts`):
> * **NO** citizen document numbers (Aadhaar, PAN, EPIC, DL, RC, Ration).
> * **NO** citizen names, father names, or dates of birth.
> * **NO** citizen photos, signatures, or rendered canvas base64 data.
> * **NO** wallet balances, remaining balances, or bank details.
> * **NO** authentication tokens, session cookies, or passwords.
> * **NO** sensitive query parameters in URL tracking (`card`, `token`, `id`, `phone`).

---

## 11. Troubleshooting

* **GTM Container Not Found (404 in console):**
  Ensure the container `GTM-MKXHQ658` is published in GTM. An unpublished container returns 404 until its first version is published.
* **Duplicate Page Views:**
  Ensure the base Google Tag has `send_page_view` set to `false`. Next.js handles virtual page views via `AppRouterPageTracker`.
* **Ad Blocker Interference:**
  Users with uBlock Origin or Brave Shields may block `googletagmanager.com`. The application uses non-blocking scripts (`afterInteractive`) and fallback CustomEvents so functionality never breaks.

