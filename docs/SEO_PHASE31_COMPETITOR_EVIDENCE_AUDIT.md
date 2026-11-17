# Competitor Intelligence Evidence Audit & Classification Report
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Scope:** Rigorous Evidence Classification for All 8 Competing Indian Print Portals  
**Auditor:** Principal Technical Auditor & Digital Compliance Analyst  
**Date:** November 17, 2026  

---

## 1. Executive Audit Mandate

In B2B SaaS comparison marketing, publishing unsubstantiated technical or legal claims regarding competitors exposes the business to legal liability, damages brand credibility, and violates Google Search Quality Guidelines (E-E-A-T: Experience, Expertise, Authoritativeness, and Trustworthiness).

The previous document (`docs/SEO_COMPETITOR_INTELLIGENCE.md`) included multiple sweeping assertions regarding:
* Competitor internal PHP versions (e.g. "PHP 7.4 / Apache / Shared cPanel").
* Internal database schemas (e.g. "permanently store citizen Aadhaar in unencrypted MySQL").
* Backend API mechanics (e.g. "unverified third-party scraping APIs").
* Server response times (e.g. "2.5s to 6.0s response times").

### The Evidence Classification Framework
Every commercial claim regarding a competitor must be strictly classified into one of five evidentiary tiers:
1. **`VERIFIED`**: Directly supported by public, reproducible, first-party technical evidence (e.g. public HTTP response headers, publicly visible DOM elements, public schema absence).
2. **`OBSERVED`**: Visible public behavior or user-reported counter experience, but insufficient to prove internal backend architecture.
3. **`UNVERIFIED`**: Inferences based on industry commonality or legacy script templates, lacking specific audit proof for that specific platform.
4. **`OUTDATED`**: Historical evidence that may no longer reflect the competitor's current production stack.
5. **`UNSUPPORTED`**: Speculative assertions with zero reproducible documentation or technical proof.

### Absolute Policy Rule
**No claim classified as `UNVERIFIED` or `UNSUPPORTED` may appear on public indexable pages (`/compare/*-alternative`). Only `VERIFIED` and clearly contextualized `OBSERVED` characteristics are eligible for publication.**

---

## 2. Evidence Audit Matrix Across All 8 Competitors

### A. eForms99
* **Live Route:** [`/compare/eforms99-alternative`](https://printportal.accero.app/compare/eforms99-alternative)

| Claim in Docs | Classification | Evidence Source & Verification Method | Confidence | Public Eligibility | Remediation Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **"Thin public landing pages lacking structured data"** | **`VERIFIED`** | Public DOM inspection of eForms99 homepage; absence of `SoftwareApplication` or `FAQPage` JSON-LD schemas. | High | **ELIGIBLE** | Safe to cite public SEO and schema differences. |
| **"Generates static multi-page PDF rather than live editable canvas"** | **`OBSERVED`** | Publicly demonstrated user workflow; form output downloads as static PDF. | High | **ELIGIBLE** | Position as Accero's split-screen canvas advantage. |
| **"Server response times fluctuate between 2.5s and 6.0s"** | **`UNVERIFIED`** | No timestamped HTTP latency benchmarks across multiple geographies; unverified assertion. | Low | **INELIGIBLE** | Remove specific latency claims; focus on Accero's verified Edge TTFB (<200ms). |
| **"Permanently stores citizen records unencrypted"** | **`UNSUPPORTED`** | No authorized security audit of eForms99 databases exists. Unauthorized probing is illegal. | Zero | **STRICTLY INELIGIBLE** | **Must be removed immediately** from comparison copy. State Accero's own ephemeral caching instead. |

---

### B. FastPrintPortal
* **Live Route:** [`/compare/fastprintportal-alternative`](https://printportal.accero.app/compare/fastprintportal-alternative)

| Claim in Docs | Classification | Evidence Source & Verification Method | Confidence | Public Eligibility | Remediation Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **"Gated behind login wall with minimal public indexable content"** | **`VERIFIED`** | Public URL inspection shows login redirect for all primary functional paths; robots.txt inspection. | High | **ELIGIBLE** | Legitimate comparative SEO differentiator. |
| **"Manual UPI QR code screenshot upload for wallet recharge"** | **`OBSERVED`** | Public onboarding instructions and operator UI show manual UTR / slip submission. | Medium | **ELIGIBLE** | Frame around Accero's automated gateway integration. |
| **"Unreliable wallet deduction with no refund on API error"** | **`UNVERIFIED`** | Anecdotal operator feedback; lacks formal audit of transaction logs. | Low | **INELIGIBLE** | Rephrase to highlight Accero’s transparent ledger and instant refund guarantee. |

---

### C. Kamboj PAN Portal
* **Live Route:** [`/compare/kamboj-print-portal-alternative`](https://printportal.accero.app/compare/kamboj-print-portal-alternative)

| Claim in Docs | Classification | Evidence Source & Verification Method | Confidence | Public Eligibility | Remediation Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **"Focuses almost exclusively on PAN card services"** | **`VERIFIED`** | Public service catalog inspection; portal branding and visible navigation. | High | **ELIGIBLE** | Safe to contrast with Accero's multi-document catalog. |
| **"Lacks native in-browser photo & signature cropping"** | **`OBSERVED`** | Public user workflow requires pre-cropped image uploads (200x200 / 400x200). | High | **ELIGIBLE** | Accero’s built-in drag-and-drop studio is a clear product contrast. |
| **"Operates on unmaintained PHP scripts with security vulnerabilities"** | **`UNSUPPORTED`** | No verified code inspection or authorized vulnerability disclosure exists. | Zero | **STRICTLY INELIGIBLE** | **Must be removed.** Describe Accero’s modern Next.js/TypeScript architecture without attacking competitor code. |

---

### D. RajPrint Portal
* **Live Route:** [`/compare/rajprint-alternative`](https://printportal.accero.app/compare/rajprint-alternative)

| Claim in Docs | Classification | Evidence Source & Verification Method | Confidence | Public Eligibility | Remediation Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **"Specialized in Rajasthan civil document formats (Jan Aadhaar)"** | **`VERIFIED`** | Public site branding and service options targeting Rajasthan VLEs. | High | **ELIGIBLE** | Valid commercial positioning fact. |
| **"Lacks nationwide multilingual typography engine"** | **`OBSERVED`** | Portal layout does not offer dynamic multi-state language rendering. | Medium | **ELIGIBLE** | Contrast with Accero’s nationwide Devanagari and regional font support. |

---

### E. Digital Portal
* **Live Route:** [`/compare/digitalportal-alternative`](https://printportal.accero.app/compare/digitalportal-alternative)

| Claim in Docs | Classification | Evidence Source & Verification Method | Confidence | Public Eligibility | Remediation Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **"Combines bill payments, mobile recharge, and document printing"** | **`VERIFIED`** | Public feature listing and service directory. | High | **ELIGIBLE** | Valid product positioning differentiator. |
| **"Slow dashboard loading caused by multi-service bloat"** | **`UNVERIFIED`** | Subjective quality claim without standardized Lighthouse/Core Web Vitals comparisons. | Low | **INELIGIBLE** | Avoid qualitative assertions; highlight Accero’s focused print studio speed. |

---

### F. SK Print Portal
* **Live Route:** [`/compare/skprintportal-alternative`](https://printportal.accero.app/compare/skprintportal-alternative)

| Claim in Docs | Classification | Evidence Source & Verification Method | Confidence | Public Eligibility | Remediation Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **"Single-user login model without staff permission tiers"** | **`OBSERVED`** | Visible account settings lack multi-operator Role-Based Access Control (RBAC). | Medium | **ELIGIBLE** | Contrast with Accero's Admin vs Operator team roles. |
| **"Database unencrypted and non-compliant with DPDPA"** | **`UNSUPPORTED`** | Unsubstantiated legal and architectural accusation. | Zero | **STRICTLY INELIGIBLE** | **Remove completely.** Highlight Accero’s own data minimization principles instead. |

---

### G. Apna Print Portal
* **Live Route:** [`/compare/apna-print-portal-alternative`](https://printportal.accero.app/compare/apna-print-portal-alternative)

| Claim in Docs | Classification | Evidence Source & Verification Method | Confidence | Public Eligibility | Remediation Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **"Community-focused print portal with aggressive referral marketing"** | **`OBSERVED`** | Public referral landing pages and promoter codes visible on web and social forums. | High | **ELIGIBLE** | Valid market observation. |
| **"Relies on unverified scraping APIs prone to multi-day downtime"** | **`UNVERIFIED`** | External API integration mechanics cannot be verified from public observation alone. | Low | **INELIGIBLE** | Rephrase to highlight Accero’s graceful manual entry fallback. |

---

### H. DocPrint
* **Live Route:** [`/compare/docprint-alternative`](https://printportal.accero.app/compare/docprint-alternative)

| Claim in Docs | Classification | Evidence Source & Verification Method | Confidence | Public Eligibility | Remediation Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **"Cloud document utility emphasizing PDF storage"** | **`VERIFIED`** | Public positioning and marketing copy. | High | **ELIGIBLE** | Valid factual description. |
| **"Server-side rendering introduces 8–15 second latency"** | **`UNVERIFIED`** | Unmeasured latency claim lacking reproducible testing methodology. | Low | **INELIGIBLE** | Highlight Accero’s client-side canvas rendering without alleging competitor slowness. |

---

## 3. Mandatory Copy Guidelines for Comparison Landing Pages

To maintain highest editorial and legal standards across `/compare/*-alternative`:

1. **Focus on Accero's Own Verified Capabilities:**
   - Instead of *"Competitor X fails to encrypt data"*, write: *"Accero PrintPortal utilizes automated 72-hour TTL cache expiration, HMAC-SHA256 index hashing, and TLS 1.3 transit encryption to minimize data persistence."*
   - Instead of *"Competitor Y crashes during peak hours"*, write: *"Accero PrintPortal is deployed on Vercel Edge CDN with globally distributed serverless execution, delivering sub-200ms page response times across India."*
2. **Use Clear Attribution for Observed Characteristics:**
   - Use phrasing such as *"Unlike platforms that require manual UTR entry..."* or *"While single-purpose PAN portals focus primarily on NSDL forms, Accero supports 7 distinct civil documents under one wallet."*
3. **Always Include the Statutory Non-Affiliation Disclaimer:**
   Every competitor page must retain the standard disclaimer:  
   *All product names, trademarks, and registered trademarks mentioned are the property of their respective owners. Comparison points reflect public platform features and user workflows as of the observation date.*
