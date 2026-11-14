# Accero PrintPortal — Entity Identity & Knowledge Graph Strategy

**Document:** Brand Entity Definition & Knowledge Graph Mapping  
**Entity Name:** Accero PrintPortal  
**Parent Entity:** Accero Technologies  
**Primary Domain:** `https://printportal.accero.app`  

---

## 1. Brand Entity Architecture & Definitions

Search engines (Google Knowledge Graph, Bing Entity Graph) and AI models construct entity graphs using verifiable attributes, domain authority, and structured citations.

### Canonical Entity Profile
* **Brand Name:** Accero PrintPortal
* **Legal Corporate Entity:** Accero Technologies
* **Entity Type:** Commercial Software Application (`schema.org/SoftwareApplication`), Organization (`schema.org/Organization`)
* **Primary URL:** `https://printportal.accero.app`
* **Canonical Logo:** `https://printportal.accero.app/assets/logo.png`
* **Primary Category:** Document Processing & Card Printing SaaS
* **Industry Sector:** Digital Service Center Software / Common Service Centre (CSC) Productivity Tools
* **Operational Geographic Region:** Republic of India (`schema.org/Country: India`)
* **Official Support Email:** `support@accero.app`
* **Verified Social Profiles:**
  * Twitter / X: `https://twitter.com/acceroapp`
  * GitHub: `https://github.com/accero-app`
  * LinkedIn: `https://linkedin.com/company/accero`

---

## 2. Entity Disambiguation & Statutory Boundary Policy

Because Accero PrintPortal processes document templates related to statutory Indian documents, **clear, strict entity disambiguation** is mandated to avoid search engine confusion, copyright disputes, or deceptive practices penalties:

### 2.1 Explicit Non-Affiliation Disclaimers
Accero PrintPortal explicitly declares on every public page footer, sitemap entry, and structured schema:
1. **Not a Government Portal:** Accero PrintPortal is an independent commercial software platform developed by Accero Technologies.
2. **No Official Partnership:** Accero is **NOT** affiliated with, authorized by, endorsed by, or an official representative of:
   * Unique Identification Authority of India (UIDAI)
   * National Securities Depository Limited (NSDL)
   * UTI Infrastructure Technology And Services Limited (UTIITSL)
   * Election Commission of India (ECI)
   * Ministry of Road Transport and Highways (MoRTH / Parivahan)
   * Department of Food & Public Distribution (NFSA)
   * Ministry of Agriculture & Farmers Welfare (AgriStack / PM-Kisan)
3. **No Credential Issuance:** Accero PrintPortal does **NOT** issue government identity numbers, generate legal citizenship documents, or enroll citizens in state programs. It is strictly a **formatting, layout alignment, and physical card printing utility**.

---

## 3. Knowledge Graph Entity Relational Map

```
┌────────────────────────────────────────────────────────┐
│ Organization: Accero Technologies                       │
│ URL: https://printportal.accero.app/#organization       │
└──────────────────────────┬─────────────────────────────┘
                           │ (operates & develops)
                           ▼
┌────────────────────────────────────────────────────────┐
│ SoftwareApplication: Accero PrintPortal                │
│ URL: https://printportal.accero.app/#software           │
│ Standard: ISO/IEC 7810 ID-1 (CR80: 85.60 × 53.98 mm)   │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
     (provides workflows)         (serves operators)
               │                           │
               ▼                           ▼
┌───────────────────────────────┐ ┌──────────────────────┐
│ Service Offerings:            │ │ Target Audiences:    │
│ - PAN Card Printing           │ │ - CSC VLEs           │
│ - Aadhaar Document Management │ │ - Cyber Cafes        │
│ - Voter ID (EPIC) Printing    │ │ - Printing Shops     │
│ - Driving Licence Printing    │ │ - Retail Kiosks      │
│ - Vehicle RC Smart Card       │ └──────────────────────┘
│ - Ration Card Printing        │
│ - Farmer Registry Card        │
└───────────────────────────────┘
```

---

## 4. JSON-LD Graph Linkage Standards

All pages connect schemas via stable `@id` URI anchors:
* **Organization Anchor:** `https://printportal.accero.app/#organization`
* **WebSite Anchor:** `https://printportal.accero.app/#website`
* **SoftwareApplication Anchor:** `https://printportal.accero.app/#software`

When individual service pages output a `Service` or `Article` schema, they reference `provider: { '@id': 'https://printportal.accero.app/#organization' }` and `publisher: { '@id': 'https://printportal.accero.app/#organization' }`, preventing entity fragmentation across the domain.
