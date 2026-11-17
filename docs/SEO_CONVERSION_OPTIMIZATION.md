# Conversion Rate Optimization (CRO) & Product Analytics Strategy
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Scope:** Landing Page CRO, Operator Onboarding Funnel & GA4 Event Tracking  
**Auditor:** Principal CRO Specialist & Next.js Analytics Architect  
**Date:** November 17, 2026  

---

## 1. Executive CRO Objectives

In B2B/SME SaaS catering to Indian cyber cafes and Common Service Centres (CSCs), organic traffic only translates to enterprise value when operators trust the platform enough to **register, fund their prepaid wallet, and execute physical print jobs**.

### Core Funnel Milestones
```
[Organic SERP Landing] 
         │
         ▼
[Registration Started] ──> [Registration Completed] ──> [First Successful Login]
                                                               │
                                                               ▼
[First Wallet Recharge] ──> [First Document Processed] ──> [First Successful Print]
```

---

## 2. Commercial Landing Page CRO Audit & Actionable Enhancements

An audit of the primary commercial landing pages (`/`, `/best-print-portal-for-csc`, `/pricing`, `/services/pan-card-printing`, and `/compare/*-alternative`) identifies six high-impact conversion opportunities:

### A. Above-the-Fold Messaging & Visual Clarity
* **Current State:** Clean typography and branding with hero title and secondary description.
* **CRO Enhancement:**
  - Introduce an interactive **Live CR80 Card Preview Canvas** directly in the hero section that shows an animated before-and-after comparison of a crooked photo being automatically corrected and aligned to an ISO CR80 canvas.
  - Implement dynamic micro-copy above the fold: *"Trusted by 1,200+ CSC VLEs across India • ₹0 Lifetime Re-prints • Instant UPI Wallet Recharge"*.

### B. Mobile Touch Ergonomics (Prioritized Based on GSC Data)
* **GSC Evidence:** Windsor Search Console data revealed that **Mobile devices generated a 33.3% CTR with an average position of #5.67**, compared to 0% CTR on Desktop.
* **CRO Enhancement:**
  - Implement a persistent sticky bottom CTA bar on mobile screens (`<div className="fixed bottom-0 inset-x-0 p-3 bg-slate-900/95 backdrop-blur border-t border-slate-800 z-50 md:hidden">`) featuring a high-contrast button: **"Start Printing Free →"** leading directly to `/register`.
  - Ensure all form fields on mobile have `fontSize: '16px'` to prevent iOS Safari auto-zoom on input focus.

### C. Pricing Transparency & Risk Reversal
* **Current State:** Pricing is transparently detailed on `/pricing`, but service landing pages sometimes leave operators wondering about hidden platform commissions.
* **CRO Enhancement:**
  - Embed a concise **Zero-Risk Margin Guarantee Badge** across all service pages:
    > **The Accero Operator Promise:**
    > 1. ₹0 Monthly Platform Fee — pay only when you print.
    > 2. Instant Wallet Refund — if an external lookup fails, your balance is reversed in <1 second.
    > 3. ₹0 Re-Print Fee — if a card misprints in your physical tray, reprint for free within your session.

### D. Competitor Switcher Trust Signals
* **Target Pages:** All 8 `/compare/*-alternative` routes.
* **CRO Enhancement:**
  - Include an interactive **"Compare Your Current Portal" Calculator**: Operators select their current portal (e.g. eForms99 or FastPrintPortal) and daily print volume (e.g. 20 cards/day), immediately revealing their monthly savings from Accero's zero-reprint guarantee.

---

## 3. Comprehensive GA4 Custom Event Instrumentation Architecture

To measure and optimize every step of the commercial conversion funnel, implement the following 6 standard custom events via `gtag.js` or Google Tag Manager:

### Event 1: `registration_started`
* **Trigger:** User focuses on the first input field of the registration form (`RegisterForm.tsx`).
* **Parameters:**
  ```javascript
  gtag('event', 'registration_started', {
    source_page: window.location.pathname,
    device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
  });
  ```

### Event 2: `registration_completed`
* **Trigger:** Server successfully responds to `POST /api/auth/register` with HTTP 201.
* **Parameters:**
  ```javascript
  gtag('event', 'registration_completed', {
    user_id: data.user.id,
    user_role: data.user.role, // 'operator'
    registration_source: document.referrer,
  });
  ```

### Event 3: `login_success`
* **Trigger:** Operator successfully authenticates via `POST /api/auth/login`.
* **Parameters:**
  ```javascript
  gtag('event', 'login_success', {
    user_id: data.user.id,
    login_method: 'credentials',
    is_first_login: data.isFirstLogin || false,
  });
  ```

### Event 4: `wallet_recharged`
* **Trigger:** Successful verification of Paytm / UPI payment callback in `/api/wallet/paytm/verify`.
* **Parameters:**
  ```javascript
  gtag('event', 'wallet_recharged', {
    transaction_id: orderId,
    value: amount, // e.g. 500.00
    currency: 'INR',
    payment_method: 'UPI',
    is_first_recharge: isFirstRecharge,
  });
  ```

### Event 5: `document_processed`
* **Trigger:** Operator initiates a document lookup or manual entry and renders the preview canvas in Split-Screen Studio.
* **Parameters:**
  ```javascript
  gtag('event', 'document_processed', {
    card_type: 'pan' | 'aadhaar' | 'voter' | 'dl' | 'rc' | 'ration' | 'farmer_id',
    entry_method: 'lookup' | 'manual',
    missing_fields_count: missingFields.length,
    processing_time_ms: renderLatency,
  });
  ```

### Event 6: `print_executed`
* **Trigger:** Operator clicks the primary "Print Card (CR80)" button, triggering browser print dialog (`window.print()`).
* **Parameters:**
  ```javascript
  gtag('event', 'print_executed', {
    card_type: cardType,
    printer_tray_target: 'epson_tray' | 'canon_tray' | 'generic',
    is_reprint: isReprint || false,
    cost_deducted: isReprint ? 0 : serviceFee,
    currency: 'INR',
  });
  ```

---

## 4. Implementation Code Snippet: Unified Analytics Client Utility

Create [`src/lib/analytics/events.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/lib/analytics/events.ts) to provide type-safe tracking across client components:

```typescript
/**
 * Type-safe Product Analytics Event Dispatcher
 * Accero PrintPortal (https://printportal.accero.app)
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      send_to: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    });
  }
};

export const AnalyticsEvents = {
  registrationStarted: (sourcePage: string) =>
    trackEvent('registration_started', { source_page: sourcePage }),

  registrationCompleted: (userId: string, role: string) =>
    trackEvent('registration_completed', { user_id: userId, user_role: role }),

  loginSuccess: (userId: string, isFirstLogin: boolean) =>
    trackEvent('login_success', { user_id: userId, is_first_login: isFirstLogin }),

  walletRecharged: (orderId: string, amount: number, isFirst: boolean) =>
    trackEvent('wallet_recharged', {
      transaction_id: orderId,
      value: amount,
      currency: 'INR',
      is_first_recharge: isFirst,
    }),

  documentProcessed: (cardType: string, entryMethod: 'lookup' | 'manual', missingCount: number) =>
    trackEvent('document_processed', {
      card_type: cardType,
      entry_method: entryMethod,
      missing_fields_count: missingCount,
    }),

  printExecuted: (cardType: string, isReprint: boolean, fee: number) =>
    trackEvent('print_executed', {
      card_type: cardType,
      is_reprint: isReprint,
      cost_deducted: fee,
      currency: 'INR',
    }),
};
```

---

## 5. CRO Experimentation & Hypothesis Backlog

| Test ID | Location | Hypothesis | Primary Metric | Secondary Metric |
| :--- | :--- | :--- | :--- | :--- |
| **CRO-1** | Homepage Hero | Adding a 10-second looping video of an Epson L805 printing a live CR80 card will increase registration conversion by 25%. | `registration_started` rate | Video completion rate |
| **CRO-2** | Mobile Sticky Bar | Adding persistent bottom CTA "Register Free →" will double mobile visitor signup conversion. | Mobile `registration_completed` | Scroll depth |
| **CRO-3** | Registration Page | Reducing registration fields from 5 to 3 (Phone, Password, Center Name) will reduce signup abandonment by 35%. | Signup completion rate | Time to first login |
| **CRO-4** | First Wallet Modal | Displaying a "First Recharge Bonus: Add ₹500, Get ₹50 Free" callout will increase day-1 wallet funding rate by 40%. | `wallet_recharged` rate | Average initial deposit value |
| **CRO-5** | Competitor Pages | Adding a "Switching from [Competitor]? Upload screenshot for instant ₹50 credit" banner will lift competitor page conversion. | Switcher registration rate | Wallet recharge frequency |
