# Search Performance Baseline & Funnel Analytics Architecture

**Document Version:** 1.0.0  
**Target Platform:** Accero PrintPortal  
**Date:** November 14, 2026

---

## 1. Google Search Console Tracking Framework

To establish a benchmark and measure performance over the next 30, 60, and 90 days, GSC tracking is configured across dedicated query dimensions:

### 1.1 Ration Card Search Clusters
| Cluster Name | Key Query Patterns | Target Canonical URL |
| :--- | :--- | :--- |
| **Ration Card Head Terms** | `ration card print`, `ration card pdf`, `online ration card print` | `/services/ration-card-printing` |
| **CSC Operator Intent** | `ration card printing software for csc`, `csc ration card print portal` | `/ration-card-printing-for-csc` |
| **Cyber Cafe Intent** | `ration card software for cyber cafe`, `pvc ration print cyber cafe` | `/ration-card-printing-for-csc` |
| **Devanagari Regional** | `राशन कार्ड प्रिंट सॉफ्टवेयर`, `पात्र गृहस्थी राशन कार्ड प्रिंट` | `/services/ration-card-printing` |

### 1.2 Farmer ID Search Clusters
| Cluster Name | Key Query Patterns | Target Canonical URL |
| :--- | :--- | :--- |
| **Farmer ID Head Terms** | `farmer id print`, `farmer id card print`, `farmer id pdf download` | `/services/farmer-id-printing` |
| **AgriStack & Registry** | `agristack farmer id`, `farmer registry card`, `digital farmer id` | `/services/farmer-id-printing` |
| **CSC Operator Intent** | `farmer id printing software for csc`, `farmer card printing software` | `/farmer-id-printing-for-csc` |
| **Rajasthan Specific** | `rajasthan farmer id card print`, `rajasthan farmer registry card` | `/farmer-id-printing-for-csc` |
| **Devanagari Regional** | `किसान आईडी कार्ड प्रिंट`, `किसान रजिस्ट्री कार्ड प्रिंट` | `/services/farmer-id-printing` |

---

## 2. End-to-End Operator Acquisition Funnel

The objective of SEO is not vanity impressions; it is converting relevant operators into repeat, paying Accero users:

```
[Google / AI Search Impression]
              │
              ▼ (CTR Target: 3.5% - 6.0%)
[Organic Search Click]
              │
              ▼
[Landing Page View] (/services/* or /*-for-csc)
              │
              ▼ (CTA Click Target: 12% - 18%)
[Registration CTA Click]
              │
              ▼ (Completion Target: > 75%)
[Registration Completed] (/register)
              │
              ▼ (Activation Target: > 45%)
[First Successful Lookup / Draft] (/studio?type=*)
              │
              ▼ (Monetization Target: > 35%)
[First Wallet Recharge] (/wallet/recharge)
              │
              ▼ (Retention Target: > 60%)
[Repeat Paid Usage] (Subsequent card prints)
```

---

## 3. Privacy-Safe Analytics Event Tracking Matrix

All events dispatched to Google Tag Manager (GTM) / GA4 strictly conform to privacy standards. **Citizen PII is never logged**:

| Funnel Stage | Event Name (dataLayer) | Dispatched Parameters | Excluded / Prohibited Data |
| :--- | :--- | :--- | :--- |
| **Page Impression** | `ration_page_view`<br>`farmer_page_view` | `pagePath`, `pageTitle`, `referrer`, `deviceType` | No query strings containing ID numbers |
| **Registration Intent** | `ration_registration_cta_click`<br>`farmer_registration_cta_click` | `sourceSection`, `ctaLabel`, `deviceType` | No personal identifiers |
| **Account Creation** | `ration_registration_completed`<br>`farmer_registration_completed` | `operatorRole` (`csc_vle`, `cyber_cafe`, `retailer`) | No email address, no phone number |
| **First Document Lookup**| `ration_first_lookup_success`<br>`farmer_first_lookup_success` | `docType` (`RATION`, `FARMER`), `inputMode` (`API`, `MANUAL`) | **NO Card Numbers, NO Citizen Names** |
| **First Wallet Recharge**| `ration_first_recharge_success`<br>`farmer_first_recharge_success`| `rechargeAmount` (₹100, ₹250, etc.), `paymentMethod` (`UPI`, `GATEWAY`) | No bank account details, no UPI VPA |
| **Repeat Usage** | `repeat_paid_usage` | `docType`, `isReprint` (true/false) | No document data |

---

## 4. Key Performance Indicators (KPIs) & Review Milestones

| Milestone | Metric Target | Review Cadence |
| :--- | :--- | :--- |
| **Day 30** | 100% Indexing of all 4 newly registered canonical routes | Weekly |
| **Day 60** | Top 10 organic ranking for at least 5 commercial operator queries | Bi-weekly |
| **Day 90** | > 250 registered operator activations via Ration & Farmer organic funnels | Monthly |
| **Ongoing** | Zero manual actions or structured data warnings in GSC | Continuous |
