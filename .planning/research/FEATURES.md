# Feature Research

**Domain:** Document Verification & PVC Card Print Portal
**Researched:** 2026-09-28
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these makes the product feel incomplete or broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| ID Number Lookup | Users need quick auto-population from PAN, EPIC, Aadhaar, DL, or RC numbers. | MEDIUM | Connects to third-party verification APIs with timeout handling. |
| Manual Data Entry Fallback | Required when government API is down, record is outdated, or API returns partial data. | MEDIUM | Standard form with photo, signature, and demographic inputs. |
| Standard CR80 Card Dimensions | PVC ID card printers (Evolis, Zebra, Fargo) expect 85.60 mm × 53.98 mm physical sizing. | HIGH | CSS `@media print` with exact millimeter coordinates. |
| Dynamic QR Code Rendering | Modern PAN, Aadhaar, and Voter cards require verifiable QR codes on front/back. | LOW | Generated via client/server QR library with encrypted or standard URL payload. |
| User Wallet & Transaction Ledger | Cyber café and CSC operators need credit top-up and audit trails for each card printed. | MEDIUM | Atomic balance deductions stored in MongoDB ledger with rollback on failure. |
| High-Resolution PDF Download | Users frequently save a printable PDF file before feeding cards into printer trays. | MEDIUM | Client/server PDF generation with embedded vector text and regional fonts. |

### Differentiators (Competitive Advantage)

Features that set this portal apart from legacy competitors.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Split-Screen Live Preview & Missing Field Highlighter | Solves the primary pain point of legacy tools: API missing fields are immediately flagged and editable in real time alongside the live card canvas. | HIGH | Dual-pane responsive layout: editable form inputs on the left, reactive SVG/HTML card on the right. |
| Comprehensive SEO + Programmatic GEO Pages | Ranks organically for hyper-local queries (e.g., "print PVC voter card in Patna", "instant duplicate PAN card Lucknow"). | MEDIUM | Dynamic Next.js SSR routes (`/services/[card]/[state]/[city]`) generating hundreds of indexable landing pages. |
| Answer Engine Optimization (AEO) | Captures conversational AI queries on ChatGPT Search, Perplexity, and Google AI Overviews. | LOW | Full JSON-LD structured data (`FAQPage`, `HowTo`, `SoftwareApplication`, `LocalBusiness`). |
| Multi-Provider API Failover | If one API provider (e.g. NeoAPI) fails or times out, system fails over or gracefully offers manual completion. | MEDIUM | Resilient provider router pattern in Next.js Server Actions. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create technical debt, legal risks, or operational bottlenecks.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|--------------|-----------------|-------------|
| Physical Card Printing & Courier Delivery | Users ask if cards can be mailed to home. | Requires shipping logistics, warehousing, courier integrations, and massive customer support overhead. | Focus purely on instant digital/print-ready generation for local operators and individual PVC card printers. |
| Client-Side Government Scraping | Direct browser scraping to avoid API fees. | High risk of CORS failures, IP bans, CAPTCHA breakages, and legal exposure. | Use authorized B2B third-party API aggregators with server-side rate-limited endpoints. |
| Forcing Strict Modal Wizards | Multi-step modals where user cannot see card until step 4. | High abandonment rate when a single field is missing or ambiguous. | Split-screen live preview where any field can be edited in place and previewed immediately. |

---
*Feature research: 2026-09-28*
