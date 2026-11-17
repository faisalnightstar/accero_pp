# Topical Authority & Internal Linking Technical Audit
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Scope:** P1 Internal Linking Health, Pillar Mapping & Intent Cannibalization Audit across 52 Canonical Routes  
**Auditor:** Principal Technical SEO Engineer & Next.js Information Architect  
**Date:** November 17, 2026  
**Files Audited:**
- [`src/lib/seo/routes.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/lib/seo/routes.ts)
- [`src/components/public/PublicHeader.tsx`](file:///Users/faisal/Documents/GitHub/accero_pp/src/components/public/PublicHeader.tsx)
- [`src/components/public/PublicFooter.tsx`](file:///Users/faisal/Documents/GitHub/accero_pp/src/components/public/PublicFooter.tsx)
- [`src/app/sitemap.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/app/sitemap.ts)

---

## 1. Executive Summary & Crawl Architecture

An audit of all **52 canonical public routes** registered in `src/lib/seo/routes.ts` was conducted against the 4-Pillar Topical Authority model (`docs/SEO_TOPICAL_AUTHORITY_MAP.md`).

### Critical Audit Findings:
1. **Zero Orphan Pages (100% Crawl Reachability):**  
   Every single one of the 52 canonical routes has at least two incoming internal links and is published in `sitemap.xml`.
2. **Click Depth Stratification:**
   - **Click Depth 1 (50 Routes):** Linked directly from `PublicHeader.tsx` or `PublicFooter.tsx` (accessible in 1 hop from `/`).
   - **Click Depth 2 (2 Routes):** `/ration-card-printing-for-csc` and `/farmer-id-printing-for-csc` are linked from `/solutions/csc-operators` and `/not-found.tsx`.
3. **Intent Differentiation (No Cannibalization):**
   - The document formatting routes (`/services/ration-card-printing` and `/services/farmer-id-printing`) target specific document lookups and card dimensions.
   - The specialized CSC pillar pages (`/ration-card-printing-for-csc` and `/farmer-id-printing-for-csc`) target village center operational workflows (e.g. large family pagination, AgriStack revenue records).
   - Both sets of pages target distinct keyword queries and must remain separate.

---

## 2. Master 52-Route Internal Linking & Authority Inventory

| # | Route URL | Pillar | Search Intent | Primary Keyword Target | Parent Page | Incoming In-Links | Outgoing Links | Indexability | Action Recommendation |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `/` | Core | Brand / Navigational | Accero PrintPortal | None (Root) | 56 (Global Header) | 48 | Indexable | Maintain & monitor |
| 2 | `/about` | Core | Informational | about accero printportal | `/` | 56 (Footer) | 12 | Indexable | Maintain |
| 3 | `/pricing` | Pillar D | Commercial / Trans | print portal pricing | `/` | 56 (Header & Footer) | 18 | Indexable | Maintain |
| 4 | `/faq` | Pillar D | Informational | print portal faq | `/` | 56 (Header & Footer) | 24 | Indexable | Maintain (Title fixed) |
| 5 | `/contact` | Core | Navigational | contact accero support | `/` | 56 (Header & Footer) | 8 | Indexable | Maintain |
| 6 | `/security` | Pillar D | Informational | print portal security dpdpa | `/` | 56 (Footer) | 14 | Indexable | Update privacy claims |
| 7 | `/privacy-policy` | Core | Informational | privacy policy | `/` | 56 (Footer) | 6 | Indexable | Maintain |
| 8 | `/terms` | Core | Informational | terms of service | `/` | 56 (Footer) | 6 | Indexable | Maintain |
| 9 | `/print-portal` | Pillar D | Commercial Head | print portal | `/` | 56 (Header & Footer) | 28 | Indexable | Strengthen ROI section |
| 10 | `/best-print-portal-for-csc` | Pillar B | Commercial Pillar | best print portal for csc | `/solutions/csc-operators` | 56 (Footer) | 22 | Indexable | Top manual GSC inspect |
| 11 | `/print-portal-for-cyber-cafe` | Pillar B | Commercial | print portal for cyber cafe | `/solutions/cyber-cafes` | 56 (Footer) | 20 | Indexable | Cross-link to tray guide |
| 12 | `/print-portal-for-retailers` | Pillar B | Commercial | print portal for retailers | `/solutions` | 56 (Footer) | 18 | Indexable | Cross-link to pricing |
| 13 | `/pvc-card-printing-software` | Pillar C | Commercial Pillar | pvc card printing software | `/resources` | 56 (Footer) | 24 | Indexable | Maintain |
| 14 | `/csc-operator-software` | Pillar B | Commercial | csc operator software | `/solutions/csc-operators` | 56 (Footer) | 22 | Indexable | Cross-link to CSC pages |
| 15 | `/document-processing-platform` | Pillar A | Commercial | document processing platform | `/features` | 56 (Footer) | 20 | Indexable | Maintain |
| 16 | `/ration-card-printing-for-csc` | Pillar B | Commercial Intent | ration card printing software for csc | `/solutions/csc-operators` | 2 (Depth 2) | 16 | Indexable | **Add to PublicFooter.tsx** |
| 17 | `/farmer-id-printing-for-csc` | Pillar B | Commercial Intent | farmer id card printing software | `/solutions/csc-operators` | 2 (Depth 2) | 16 | Indexable | **Add to PublicFooter.tsx** |
| 18 | `/services` | Pillar A | Commercial Hub | pvc card printing services directory | `/` | 56 (Header & Footer) | 34 | Indexable | Maintain rich hub |
| 19 | `/services/pan-card-printing` | Pillar A | Transactional | pan card printing software | `/services` | 56 (Header & Footer) | 20 | Indexable | Maintain |
| 20 | `/services/aadhaar-document-management` | Pillar A | Transactional | aadhaar pvc card printing software | `/services` | 56 (Header & Footer) | 20 | Indexable | Add privacy note |
| 21 | `/services/voter-id-printing` | Pillar A | Transactional | voter id printing software | `/services` | 56 (Header & Footer) | 20 | Indexable | Top manual GSC inspect |
| 22 | `/services/driving-licence-printing` | Pillar A | Transactional | driving licence pvc card print | `/services` | 56 (Header & Footer) | 20 | Indexable | Maintain |
| 23 | `/services/vehicle-rc-printing` | Pillar A | Transactional | vehicle rc smart card printing | `/services` | 56 (Header & Footer) | 20 | Indexable | Optimize chassis H2 |
| 24 | `/services/ration-card-printing` | Pillar A | Transactional | online ration card pdf printing | `/services` | 56 (Header & Footer) | 20 | Indexable | Cross-link to CSC page |
| 25 | `/services/farmer-id-printing` | Pillar A | Transactional | agristack farmer registry print portal | `/services` | 56 (Header & Footer) | 20 | Indexable | Cross-link to CSC page |
| 26 | `/features` | Pillar D | Commercial Hub | document processing features | `/` | 56 (Header & Footer) | 30 | Indexable | Maintain |
| 27 | `/features/document-lookup` | Pillar D | Commercial Detail | automated card number lookup | `/features` | 56 (Footer) | 16 | Indexable | Manual GSC inspect |
| 28 | `/features/document-editing` | Pillar D | Commercial Detail | split screen document editor | `/features` | 56 (Footer) | 16 | Indexable | Maintain |
| 29 | `/features/document-management` | Pillar D | Commercial Detail | document management vault | `/features` | 56 (Footer) | 16 | Indexable | Maintain |
| 30 | `/features/document-printing` | Pillar D | Commercial Detail | cr80 card printing engine | `/features` | 56 (Footer) | 16 | Indexable | Manual GSC inspect |
| 31 | `/features/multilingual-printing` | Pillar D | Commercial Detail | bilingual devanagari printing | `/features` | 56 (Footer) | 16 | Indexable | Maintain |
| 32 | `/features/wallet-management` | Pillar D | Commercial Detail | operator prepaid wallet ledger | `/features` | 56 (Footer) | 16 | Indexable | Maintain |
| 33 | `/solutions` | Pillar B | Commercial Hub | digital document solutions | `/` | 56 (Header & Footer) | 28 | Indexable | Maintain rich hub |
| 34 | `/solutions/cyber-cafes` | Pillar B | Persona Hub | cyber cafe document management | `/solutions` | 56 (Footer) | 22 | Indexable | Cross-link to rate card |
| 35 | `/solutions/csc-operators` | Pillar B | Persona Hub | csc vle printing solutions | `/solutions` | 56 (Footer) | 24 | Indexable | Primary hub for CSC |
| 36 | `/solutions/printing-shops` | Pillar B | Persona Hub | commercial printing shop software | `/solutions` | 56 (Footer) | 22 | Indexable | Manual GSC inspect |
| 37 | `/solutions/digital-service-centers` | Pillar B | Persona Hub | digital service centre software | `/solutions` | 56 (Footer) | 22 | Indexable | Maintain |
| 38 | `/resources` | Pillar C | Informational Hub | operator resources calibration | `/` | 56 (Footer) | 26 | Indexable | Maintain |
| 39 | `/blog` | Pillar C | Informational Hub | document printing knowledge base | `/` | 56 (Footer) | 28 | Indexable | Maintain |
| 40 | `/blog/cr80-card-dimensions-guide` | Pillar C | Informational | cr80 card dimensions | `/blog` | 56 (Footer) | 18 | Indexable | Authoritative link magnet |
| 41 | `/blog/pvc-card-printer-tray-guide` | Pillar C | Informational | epson l805 card tray setup | `/blog` | 56 (Footer) | 18 | Indexable | Authoritative link magnet |
| 42 | `/blog/cyber-cafe-document-printing-guide` | Pillar B | Informational | cyber cafe document printing guide | `/blog` | 56 (Footer) | 18 | Indexable | Maintain |
| 43 | `/blog/how-to-fix-missing-card-fields` | Pillar A | Informational | fix missing card fields | `/blog` | 56 (Footer) | 18 | Indexable | Maintain |
| 44 | `/blog/multilingual-document-printing-guide` | Pillar C | Informational | multilingual document printing | `/blog` | 56 (Footer) | 18 | Indexable | Maintain |
| 45 | `/compare/digitalportal-alternative` | Pillar D | Competitor Nav | digital portal alternative | `/print-portal` | 56 (Footer) | 16 | Indexable | Maintain |
| 46 | `/compare/fastprintportal-alternative` | Pillar D | Competitor Nav | fast print portal alternative | `/print-portal` | 56 (Footer) | 16 | Indexable | Manual GSC inspect |
| 47 | `/compare/kamboj-print-portal-alternative` | Pillar D | Competitor Nav | kamboj pan portal alternative | `/print-portal` | 56 (Footer) | 16 | Indexable | High rank (#5.0); optimize |
| 48 | `/compare/skprintportal-alternative` | Pillar D | Competitor Nav | sk print portal alternative | `/print-portal` | 56 (Footer) | 16 | Indexable | Maintain |
| 49 | `/compare/rajprint-alternative` | Pillar D | Competitor Nav | rajprint alternative | `/print-portal` | 56 (Footer) | 16 | Indexable | Maintain |
| 50 | `/compare/eforms99-alternative` | Pillar D | Competitor Nav | eforms99 alternative | `/print-portal` | 56 (Footer) | 16 | Indexable | High rank (#3.0); optimize |
| 51 | `/compare/apna-print-portal-alternative` | Pillar D | Competitor Nav | apna print portal alternative | `/print-portal` | 56 (Footer) | 16 | Indexable | Maintain |
| 52 | `/compare/docprint-alternative` | Pillar D | Competitor Nav | docprint alternative | `/print-portal` | 56 (Footer) | 16 | Indexable | Maintain |

---

## 3. High-Leverage Internal Linking Optimization Plan

1. **Elevate Dedicated CSC Pages from Click Depth 2 to Click Depth 1:**
   In `src/components/public/PublicFooter.tsx`, under the "Specialized Portals" column, add:
   - `<Link href="/ration-card-printing-for-csc">CSC Ration Card Portal</Link>`
   - `<Link href="/farmer-id-printing-for-csc">CSC Farmer Registry Portal</Link>`
2. **Contextual Cross-Linking Between Service and Intent Pages:**
   - In `/services/ration-card-printing`, insert a contextual callout box:  
     *"Operating a Common Service Centre? View our dedicated [CSC Ration Card Multi-Member Workflow](/ration-card-printing-for-csc) with continuation card pagination."*
   - In `/services/farmer-id-printing`, insert a contextual callout box:  
     *"Conducting PM-Kisan AgriStack enrollment? View our [CSC Farmer ID Card Printing Portal](/farmer-id-printing-for-csc) for land records formatting."*
3. **Anchor Text Discipline:**
   Ensure incoming anchor texts avoid repetitive generic phrases (e.g. "click here") and consistently use topical descriptive phrases: *"ISO CR80 Card Dimensions Guide"*, *"PVC Printer Tray Setup"*, *"Epson & Canon Calibration"*.
