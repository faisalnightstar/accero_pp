# ORGANIC CONVERSION & REVENUE ATTRIBUTION REPORT

**Entity:** Accero PrintPortal (`https://printportal.accero.app`)  
**Core Success Metric:** Qualified operator registrations followed by first successful paid prints.  
**Privacy Standard:** 100% Privacy-Conscious & DPDP Act 2023 Compliant. Zero citizen PII, zero document numbers, zero wallet balances transmitted.

---

## 1. THE 8-STAGE OPERATOR ACTIVATION FUNNEL

Accero PrintPortal measures organic search acquisition not merely through vanity pageviews, but through an **8-stage conversion funnel** that tracks an operator from initial search query to repeat physical card printing:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: DISCOVERY & ENTRY                                                                  │
│ Event: homepage_visit / pillar_page_view                                                    │
│ Organic visitor lands on /print-portal, /best-print-portal-for-csc, or /pvc-card-software    │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: COMMERCIAL EVALUATION                                                              │
│ Event: pricing_visit                                                                        │
│ Operator reviews transparent pay-as-you-print rates (₹5 manual, ₹20 lookup, ₹0 reprints)   │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: INTENT TO ONBOARD                                                                  │
│ Event: registration_start                                                                   │
│ Operator opens /(auth)/register form and begins entering business credentials               │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 4: ACCOUNT ACTIVATION                                                                 │
│ Event: registration_complete                                                                │
│ Account created in MongoDB; operator redirected to /dashboard                               │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 5: FIRST VERIFICATION / TRIAL                                                         │
│ Event: first_lookup_success                                                                  │
│ Operator runs a test card query or manual draft; experiences amber missing-field studio     │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 6: MONETIZATION & PAID COMMITMENT                                                     │
│ Event: first_recharge_success                                                               │
│ Operator recharges prepaid balance starting at ₹100 via dynamic UPI QR code                 │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 7: CORE VALUE REALIZATION (PHYSICAL CARD OUTPUT)                                      │
│ Event: first_print_success                                                                  │
│ Operator sends job to printer tray; physical 85.60 mm × 53.98 mm PVC card is produced       │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 8: RETENTION & LIFETIME RE-PRINT USAGE                                                │
│ Event: returning_customer                                                                   │
│ Operator executes repeat print runs or re-prints past customer cards for ₹0 from the vault  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. PRIVACY-CONSCIOUS EVENT SCHEMA & DATA INTEGRITY

The tracking engine is implemented in [`src/lib/analytics/events.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/lib/analytics/events.ts). It enforces strict architectural safeguards to protect citizen privacy and operator data:

### What Is Tracked:
- Event Identifier (`eventType`: e.g. `'registration_complete'`, `'first_print_success'`)
- Clean Page Path (`pagePath`: e.g. `'/register'`, `'/pricing'`)
- High-Level Document Category (`docCategory`: `'pan'`, `'aadhaar'`, `'voter'`, `'dl'`, `'rc'`, `'ration'`, `'manual'`)
- Coarse Device Category (`deviceType`: `'desktop'`, `'mobile'`)
- Timestamp (Epoch ms)

### What Is Strictly Banned & Stripped:
- ❌ **Zero Citizen PII:** No Aadhaar numbers, PAN numbers, EPIC voter IDs, driving license numbers, or RC vehicle numbers.
- ❌ **Zero Names & Addresses:** No customer names, father names, mobile numbers, or residential addresses.
- ❌ **Zero Photo & Biometric Blobs:** No image hashes, face vectors, or signature files.
- ❌ **Zero Financial Amounts:** No wallet balance figures, bank account numbers, or UPI transaction IDs.

---

## 3. CONVERSION FUNNEL BENCHMARKS & REPORTING MATRIX

| Funnel Stage | Event Name | Implementation Location | Baseline Target (Organic Traffic) | Optimization Lever |
|---|---|---|---|---|
| 1. Homepage / Pillar View | `homepage_visit` | `src/app/page.tsx` & `/print-portal` | 100% (Top of Funnel) | Organic CTR from Google Search Console & AI citations |
| 2. Pricing Evaluation | `pricing_visit` | `src/app/pricing/page.tsx` | 35% of Visitors | Clear CTAs in hero sections; transparent ₹0 reprint guarantee |
| 3. Registration Start | `registration_start` | `src/app/(auth)/register/page.tsx` | 15% of Visitors | Low-friction 4-field sign-up form with mobile phone number |
| 4. Registration Complete | `registration_complete` | `src/app/(auth)/register/page.tsx` | 10% of Visitors | Sub-second registration API speed; zero activation fees |
| 5. First Lookup Success | `first_lookup_success` | `src/components/studio/StudioSearchBar.tsx` | 70% of Registered Users | Quick onboarding modal in `/dashboard` pointing directly to Studio |
| 6. First Wallet Top-up | `first_recharge_success` | `src/components/wallet/RechargeModal.tsx` | 45% of Registered Users | Instant dynamic UPI QR scan with minimum ₹100 threshold |
| 7. First Successful Print | `first_print_success` | `src/components/cards/PrintControls.tsx` | 80% of Recharged Users | Pre-calibrated Epson Tray J & Canon ID tray presets |
| 8. Returning Customer | `returning_customer` | Vault & studio repeat usage | > 65% Monthly Retention | Lifetime free re-prints (₹0) from encrypted customer vault |

---

## 4. CONVERSION OPTIMIZATION PLAYBOOK (ACTIONS TAKEN)

1. **Eliminated Registration Friction:** The registration flow requires only 4 basic fields (name, email, phone, password). No upfront GST registration or PAN upload is demanded, allowing operators to sign up in under 30 seconds.
2. **Transparent "Pay-As-You-Print" Positioning:** By removing recurring monthly subscriptions, operators face zero barrier to entry. They can recharge ₹100 via UPI and start printing immediately.
3. **Automated Refund Assurance:** Clearly displaying *"Automated refund if lookup times out"* inside the Studio search bar eliminates the fear of lost balance, directly boosting Stage 5 (`first_lookup_success`).
4. **The Free Reprint Multiplier:** Emphasizing that repeat prints cost ₹0 transforms one-time transactional users into long-term daily power users.

