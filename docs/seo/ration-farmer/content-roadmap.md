# Content Strategy & Editorial Roadmap: Ration Card & Farmer ID

**Document Version:** 1.0.0  
**Target Platform:** Accero PrintPortal  
**Date:** November 14, 2026

---

## 1. Editorial Principles & Publication Governance

To avoid publishing thin, repetitive, or cannibalizing content, all content assets adhere to strict quality rules:
1. **Distinct Search Intent:** No two articles or pages may target the same primary keyword query.
2. **Actionable Utility:** Every educational guide must include actual operator procedures, printer tray specifications, or layout diagrams.
3. **Transparent Authority:** Every article cites official government registries (NFSA, AgriStack) and states Accero’s role as an independent software utility.
4. **Natural Conversion Links:** High-intent contextual links connect informational guides to the relevant service page (`/services/*`) and Card Studio (`/studio?type=*`).

---

## 2. Ration Card Content Cluster

```
                               ┌──────────────────────────────────────────────┐
                               │       /services/ration-card-printing         │
                               │      (Primary Commercial Service Hub)        │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       │                                                             │
                       ▼                                                             ▼
       ┌───────────────────────────────┐                             ┌───────────────────────────────┐
       │  /ration-card-printing-for-csc│                             │ /blog/how-to-print-ration-card│
       │    (Audience B2B Pillar)      │                             │     (Cornerstone How-To)      │
       └───────────────┬───────────────┘                             └───────────────┬───────────────┘
                       │                                                             │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
┌─────────────────────────────────────────────┐               ┌─────────────────────────────────────────────┐
│/blog/ration-card-family-member-details-guide│               │      /blog/pvc-card-printer-tray-guide      │
│  (Continuation Pagination & Roster Rules)   │               │     (Epson & Canon Tray J Calibration)      │
└─────────────────────────────────────────────┘               └─────────────────────────────────────────────┘
```

### Planned Ration Card Editorial Releases
| Article Title & Slug | Primary Search Query | Content Focus | Target Release |
| :--- | :--- | :--- | :--- |
| **How to Print a Ration Card on PVC (Guide)**<br>`/blog/how-to-print-ration-card` | *How to print a Ration Card?* | Complete walkthrough: lookup, missing data audit, tray printer setup, and lamination vs PVC. | Week 1 (Active) |
| **Ration Card Family Member Details Guide**<br>`/blog/ration-card-family-member-details-guide` | *Ration Card family member details printing* | Deep dive into NFSA member rosters, Aadhaar seeding indicators, and multi-page continuation for >5 members. | Week 2 |
| **NFSA Ration Card Scheme Palettes Explained**<br>`/blog/nfsa-ration-card-schemes-guide` | *PHH vs AAY Ration Card color* | Detailed guide explaining PHH (Green), AAY (Yellow/Amber), BPL (Blue), APL (Orange), and White card differences. | Week 3 |

---

## 3. Farmer ID & AgriStack Content Cluster

```
                               ┌──────────────────────────────────────────────┐
                               │         /services/farmer-id-printing         │
                               │       (Primary Commercial Service Hub)       │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       │                                                             │
                       ▼                                                             ▼
       ┌───────────────────────────────┐                             ┌───────────────────────────────┐
       │  /farmer-id-printing-for-csc  │                             │  /blog/what-is-farmer-registry│
       │    (Audience B2B Pillar)      │                             │   (National Policy & AEO)     │
       └───────────────┬───────────────┘                             └───────────────┬───────────────┘
                       │                                                             │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
┌─────────────────────────────────────────────┐               ┌─────────────────────────────────────────────┐
│        /blog/agristack-farmer-id-guide      │               │   /blog/rajasthan-farmer-registry-guide     │
│   (Digital Agriculture Ecosystem Overview)  │               │   (RJFR Land Table & Khata/Khasra Guide)    │
└─────────────────────────────────────────────┘               └─────────────────────────────────────────────┘
```

### Planned Farmer ID Editorial Releases
| Article Title & Slug | Primary Search Query | Content Focus | Target Release |
| :--- | :--- | :--- | :--- |
| **What Is Farmer Registry? (AgriStack Explained)**<br>`/blog/what-is-farmer-registry` | *What is Farmer Registry?* | Explanation of the digital agriculture mission, dynamic farmer profiles, and benefits. | Week 1 (Active) |
| **AgriStack Farmer ID Card Printing Guide**<br>`/blog/agristack-farmer-id-guide` | *AgriStack Farmer ID print* | Guide on formatting AgriStack IDs onto CR80 plastic cards with QR code verification. | Week 2 |
| **Rajasthan Farmer Registry Card Complete Guide**<br>`/blog/rajasthan-farmer-registry-guide` | *Rajasthan Farmer ID Card Print* | Specific technical breakdown of RJFR (`rjfr.agristack.gov.in`), Khata/Khasra tables, and area units. | Week 3 |
| **How to Print Land Records on Smart Cards**<br>`/blog/land-records-smart-card-printing` | *Khasra Khata smart card print* | Technical guide on rendering tabular revenue records cleanly without text overlap. | Week 4 |

---

## 4. State-Specific Template Rollout Pipeline

As individual state revenue and agriculture departments issue physical card guidelines under AgriStack, Accero will expand the template library in a controlled manner:

| State / Department | Current Status | Target Template Release |
| :--- | :--- | :--- |
| **Rajasthan (RJFR)** | ✅ **Fully Implemented & Verified** (`rjfr.agristack.gov.in`) | Production Ready |
| **Uttar Pradesh (AgriStack Pilot)** | Architectural Reconnaissance / Awaiting Physical Format | Phase 2 Rollout |
| **Madhya Pradesh (MP Kisan)** | Schema Specification under Review | Phase 2 Rollout |
| **Maharashtra (MahaDBT Farmer ID)** | Preliminary Asset Evaluation | Phase 3 Rollout |

> **Editorial Policy:** Never claim support for a state-specific template before the canvas, data mapping, and print tray tests are complete in code.
