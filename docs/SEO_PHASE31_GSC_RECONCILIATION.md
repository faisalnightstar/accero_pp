# Google Search Console & GA4 Data Reconciliation Report
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Investigation Level:** P0 Critical Data Integrity Audit  
**Auditor:** Principal Technical SEO Engineer & Product Analytics Architect  
**Date:** November 17, 2026  
**Data Sources:** Windsor.ai MCP Search Console Connector (`account: https://printportal.accero.app/`), Windsor.ai GA4 Connector (`account: 557117688`), GSC UI Drill-Down Screenshots (`media_1794868652270_95934a8c.png`, `media_1794868693200_4c5cc19e.png`, `media_1794868728317_68c16d31.png`).

---

## 1. Executive Summary & Root Cause of Reporting Discrepancies

The Phase 3 strategic documents contained multiple conflicting performance claims:
1. *19 total impressions reported in the Growth Strategy vs. 29 impressions on November 15 reported in the Executive Summary.*
2. *1 to 14 daily impression growth reported in the Growth Strategy vs. 1 to 29 daily impression growth reported in the Executive Summary.*
3. *11 actively ranking pages reported in earlier summaries vs. 10 query rows in the Search Console performance table.*
4. *3 mobile impressions with 1 click interpreted as "conclusive proof of high-intent mobile search dominance".*

### The Forensic Diagnosis
Our audit of the underlying Windsor API responses revealed that these contradictions stemmed from **two fundamental reporting flaws**:
* **Flaw 1: Conflation of Google Analytics 4 Pageviews with Google Search Console Impressions:**  
  On November 15, 2026, the connected GA4 property recorded **29 screen page views**. The author of the earlier executive summary mistakenly read this GA4 pageview count as "29 GSC impressions on Nov 15". In reality, the Search Console API had only processed data through **November 14, 2026** (reflecting Google's standard 48-to-72-hour reporting lag). On November 14, Search Console recorded **14 daily impressions**.
* **Flaw 2: Conflating Dimension Rows with Unique Entities:**  
  The 10 query rows in the Search Console multi-dimension export represented **9 unique queries**, because the query `kamboj print portal` appeared twice (once for Desktop and once for Mobile). Furthermore, those 10 rows spanned **only 5 unique landing pages**. When querying Search Console by the `page` dimension alone, exactly **6 unique pages** had registered impressions, not 11. The additional 5 pages in previous reports were derived from hypothetical target lists or unverified spot-checks.

---

## 2. Segregated Baseline Metrics (Strictly By Dimension)

Metrics from different reporting dimensions and time windows must never be aggregated into a single blended figure. Below are the verified, unblended datasets extracted directly from the Search Console API for the period **November 9, 2026 – November 14, 2026**.

### A. Daily Search Console Trajectory (Date Dimension Alone)
*Extracted via `fields=date,clicks,impressions,ctr,position`*

| Date | Clicks | Impressions | CTR | Average Position | Audit Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-11-09** | 0.0 | 0.0 | N/A | 0.0 | Verified Zero Baseline |
| **2026-11-10** | 0.0 | 1.0 | 0.00% | 119.0 | Verified Measurement |
| **2026-11-11** | 0.0 | 1.0 | 0.00% | 68.0 | Verified Measurement |
| **2026-11-12** | 1.0 | 2.0 | 50.00% | 2.0 | Verified Measurement (Click on `/`) |
| **2026-11-13** | 0.0 | 1.0 | 0.00% | 6.0 | Verified Measurement |
| **2026-11-14** | 0.0 | 14.0 | 0.00% | 20.9 | Verified Measurement (Impression Spike) |
| **Total / Avg** | **1.0** | **19.0** | **5.26%** | **36.0** | **Strict 6-Day Period Total** |

*Note:* No Search Console data existed for November 15–17 at the time of API extraction due to standard GSC data pipeline latency. Any metric citing Nov 15 GSC impressions is an unverified derivation.

---

### B. Landing Page Performance (Page Dimension Alone)
*Extracted via `fields=page,clicks,impressions,ctr,position`*

| Landing Page URL | Clicks | Impressions | CTR | Average Position | Verified Ranking Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `https://printportal.accero.app/` | 1.0 | 4.0 | 25.00% | 47.75 | Brand & generic category lookups |
| `https://printportal.accero.app/compare/kamboj-print-portal-alternative` | 0.0 | 6.0 | 0.00% | 5.83 | Highest impression competitor alternative |
| `https://printportal.accero.app/print-portal` | 0.0 | 5.0 | 0.00% | 43.60 | Category portal terms |
| `https://printportal.accero.app/services/vehicle-rc-printing` | 0.0 | 2.0 | 0.00% | 8.00 | Chassis / vehicle smart card lookups |
| `https://printportal.accero.app/blog/pvc-card-printer-tray-guide` | 0.0 | 1.0 | 0.00% | 6.00 | Technical tray setup queries |
| `https://printportal.accero.app/compare/skprintportal-alternative` | 0.0 | 1.0 | 0.00% | 24.00 | Competitor alternative queries |
| **Total Across Pages** | **1.0** | **19.0** | **5.26%** | — | **Exactly 6 Verified Landing Pages** |

*Critical Finding:* Only **6 landing pages** have generated verified impressions in Google Search Console to date. Claims that 11 pages are actively ranking are factually unsupported by the raw API data.

---

### C. Search Query Performance (Multi-Dimension Query + Page + Device)
*Extracted via `fields=query,page,device,country,date,clicks,impressions,ctr,position`*

| # | Query | Landing Page | Date | Device | Country | Pos | Imp | Clicks | CTR | Classification |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `utiitsl pan card` | `https://printportal.accero.app/` | 2026-11-10 | Desktop | India | 119.0 | 1.0 | 0.0 | 0.0% | Gov Portal Keyword |
| 2 | `easy print portal` | `https://printportal.accero.app/` | 2026-11-11 | Desktop | India | 68.0 | 1.0 | 0.0 | 0.0% | Generic Category |
| 3 | `chassis number print` | `.../services/vehicle-rc-printing` | 2026-11-14 | Desktop | India | 7.0 | 1.0 | 0.0 | 0.0% | Commercial Transactional |
| 4 | `free print portal` | `.../print-portal` | 2026-11-14 | Desktop | India | 37.0 | 1.0 | 0.0 | 0.0% | Category Head Term |
| 5 | `kamboj pan portal` | `.../compare/kamboj-print-portal-alternative` | 2026-11-14 | Desktop | India | 6.5 | 2.0 | 0.0 | 0.0% | Competitor Navigational |
| 6 | `kamboj print portal` | `.../compare/kamboj-print-portal-alternative` | 2026-11-14 | Desktop | India | 5.0 | 2.0 | 0.0 | 0.0% | Competitor Navigational |
| 7 | `kamboj print portal` | `.../compare/kamboj-print-portal-alternative` | 2026-11-14 | Mobile | India | 6.0 | 1.0 | 0.0 | 0.0% | Competitor Navigational |
| 8 | `printing portal` | `.../print-portal` | 2026-11-14 | Desktop | India | 22.0 | 1.0 | 0.0 | 0.0% | Category Head Term |
| 9 | `robo print portal` | `.../print-portal` | 2026-11-14 | Desktop | India | 60.5 | 2.0 | 0.0 | 0.0% | Unranked Competitor |
| 10 | `s k print portal` | `.../compare/skprintportal-alternative` | 2026-11-14 | Desktop | India | 24.0 | 1.0 | 0.0 | 0.0% | Competitor Navigational |

*Audit Verification:*  
- Exactly **9 unique queries** generated impressions across 10 records.
- The single organic click recorded on November 12 was on the homepage (`/`) for a query anonymized by Google due to privacy thresholds.

---

### D. Device Distribution (Device Dimension Alone)
*Extracted via `fields=device,clicks,impressions,ctr,position`*

| Device Type | Clicks | Impressions | CTR | Average Position | Statistical Validity Assessment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile** | 1.0 | 3.0 | 33.33% | 5.67 | **Sample size (N=3) is too small to declare statistically significant mobile dominance.** It is a positive early indicator, not proof. |
| **Desktop** | 0.0 | 16.0 | 0.00% | 29.56 | Reflects desktop searchers querying broad portal terms at lower rank. |
| **Total** | **1.0** | **19.0** | **5.26%** | **25.79** | Verified Total |

---

### E. Country Distribution (Country Dimension Alone)
*Extracted via `fields=country,clicks,impressions,ctr,position`*

| Country | Clicks | Impressions | CTR | Average Position | Share of Impressions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **India** | 1.0 | 18.0 | 5.56% | 26.89 | **94.74%** |
| **United Kingdom** | 0.0 | 1.0 | 0.00% | 6.00 | **5.26%** |
| **Total** | **1.0** | **19.0** | **5.26%** | — | **100.00%** |

---

## 3. Discrepancy Reconciliation Summary Table

| Metric / Claim | Claim in Phase 3 Docs | Verified Actual Value | Root Cause of Discrepancy |
| :--- | :--- | :--- | :--- |
| **Total GSC Impressions** | 29 impressions on Nov 15 | **19 impressions** (Nov 9–14) | Conflated GA4 screen pageviews (29 views) with GSC search impressions. |
| **Daily Growth Metric** | 1 to 29 daily growth | **1 to 14 daily growth** (Nov 10 to Nov 14) | Substituted GA4 pageviews on Nov 15 for GSC impressions. |
| **Actively Ranking Pages** | 11 pages actively ranking | **6 pages** with impressions | Counted unverified target pages (`eforms99`, `rajprint`, `digitalportal`, `pricing`, `wallet`) alongside verified GSC pages. |
| **Unique Search Queries** | 10 unique queries | **9 unique queries** | `kamboj print portal` appeared twice due to Desktop/Mobile dimension split. |
| **Mobile Intent Claim** | "Mobile search dominance (33% CTR)" | **Preliminary signal only (N=3)** | 3 impressions and 1 click cannot be claimed as statistically conclusive evidence. |

---

## 4. Auditor Guidelines for Future Reporting

1. **Never combine metrics across different API dimensions without cross-reconciliation.** Query-level, page-level, and device-level calls return different aggregations due to Google's anonymization thresholds.
2. **Never cite GA4 pageviews as Search Console impressions.** GA4 measures on-site page visits across all sources; GSC measures SERP impression visibility on Google Search.
3. **Respect GSC Reporting Latency.** GSC data is 48–72 hours behind real-time. Do not fabricate or extrapolate day-of or day-prior figures.
4. **Distinguish "Average Position" from "Actual Keyword Rank".** A page with an average position of 5.8 on 6 impressions may have fluctuated between position 2 and position 12.
