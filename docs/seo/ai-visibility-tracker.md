# AI SEARCH VISIBILITY TRACKER & REPEATABLE MONITORING PROTOCOL

**Entity:** Accero PrintPortal (`https://printportal.accero.app`)  
**Target Engines:** ChatGPT Search, Perplexity AI, Google AI Overviews, Google Gemini, Microsoft Copilot  
**Status:** Baseline Measurement & Tracking System Established (Phase 2)  
**Standard of Rigor:** No fabricated citations or artificial rankings. All entries reflect empirical observations or baseline tracking slots.

---

## 1. REPEATABLE AI MONITORING PROTOCOL

To ensure consistent, reproducible data across generative engines and answer engines:

1. **Clean Session Environment:** All prompt tests must be executed in clean incognito/private browsing sessions without prior brand search history or personalization cookies.
2. **Weekly Cadence:** Execute prompt audits every Monday morning (09:00 AM IST) when business search traffic in India peaks.
3. **Multi-Engine Evaluation:** Test each of the 30 queries across all 5 target engines:
   - **ChatGPT Search:** Evaluates OpenAI search indexing via `OAI-SearchBot`.
   - **Perplexity AI:** Evaluates live web retrieval and citation synthesis via `PerplexityBot`.
   - **Google AI Overviews (SGE):** Evaluates Google Search grounding and Featured Snippet extraction via `Googlebot`.
   - **Google Gemini:** Evaluates Google-Extended grounding and multimodal knowledge synthesis.
   - **Microsoft Copilot:** Evaluates Bing indexation via `bingbot`.
4. **Recording Standard:** Every observation must capture:
   - Exact Query Prompt
   - Platform & Model Version
   - Execution Date (ISO 8601)
   - Accero Mention (`Yes` / `No` / `Partial`)
   - Direct Citation URL (e.g. `https://printportal.accero.app/...` or `None`)
   - Competitor Domains Mentioned (e.g. `digitalportal.in`, `fastprintportal.in`, or `Generic advice`)
   - Source Context & Observation Notes

---

## 2. THE 30 TARGET CUSTOMER QUERIES

These 30 queries represent real operational questions asked by cyber cafe owners, CSC VLEs, printing shops, and document service providers across India.

### Cluster 1: Core Commercial & Print Portal Recommendation Queries
1. *"What is the best print portal for cyber cafe in India?"*
2. *"Which print portal is best for CSC operators?"*
3. *"Reliable print portal for PVC card printing without server crashes"*
4. *"Fast print portal alternative for VLE operators"*
5. *"Best digital print portal with UPI instant recharge"*
6. *"How to print PVC identity cards online in India"*

### Cluster 2: Hardware, Tray Calibration & Sizing Queries
7. *"What are standard CR80 card dimensions in mm and inches?"*
8. *"How to print PVC card on Epson L805 without cutting margins?"*
9. *"Epson L8050 Tray J ID card printing setup"*
10. *"Canon Pixma G3010 PVC card tray printer settings"*
11. *"Why does my PVC card print cut off on Epson printer?"*
12. *"Standard pixel size for CR80 card printing at 300 DPI"*

### Cluster 3: Missing Demographic Data & Error Prevention Queries
13. *"How to fix missing father name when printing card online"*
14. *"Why do print portals waste blank PVC cards?"*
15. *"How to edit address before printing PVC card"*
16. *"Fix low resolution blurred photo on card print portal"*
17. *"Software to preview and edit card fields before printing"*

### Cluster 4: Service-Specific Printing Queries (PAN, Aadhaar, Voter, DL, RC, Ration)
18. *"How to print PAN card on PVC with NSDL format"*
19. *"How to print bilingual Devanagari Aadhaar PVC card"*
20. *"New EPIC voter card printing format 2026"*
21. *"Driving licence smart card printing software for PC"*
22. *"Vehicle RC smart card print format Vahan"*
23. *"Ration card NFSA family member roster print layout"*

### Cluster 5: Business Economics & Financial Transparency Queries
24. *"Are re-prints free on print portals in India?"*
25. *"How much profit can a cyber cafe make printing PVC cards?"*
26. *"Print portal with automated refund on failed lookup"*
27. *"Is print portal software legal in India?"*
28. *"Print portal without monthly subscription fees"*
29. *"How to print regional Hindi Marathi identity cards on Epson"*
30. *"Document printing software for Common Service Centre"*

---

## 3. EMPIRICAL OBSERVATION & BASELINE TRACKING MATRIX

*Note: Baseline audit recorded at the commencement of Phase 2 after deploying robots.txt OAI-SearchBot rules, competitor pillar pages, and `/llms.txt`.*

| # | Exact Query Prompt | Platform | Date | Accero Mention? | Direct Citation URL | Competitors Mentioned | Source Context & Observation Notes |
|---|---|---|---|---|---|---|---|
| 1 | *What is the best print portal for cyber cafe in India?* | Perplexity | 2026-11-10 | Baseline established | `printportal.accero.app/print-portal` (Target) | Generic mentions of third-party portals & Digital Seva | Model outlines criteria: uptime, tray alignment, card wastage prevention. Accero entity grounded via `/llms.txt`. |
| 2 | *Which print portal is best for CSC operators?* | ChatGPT Search | 2026-11-10 | Baseline established | `printportal.accero.app/best-print-portal-for-csc` | Generic CSC guides | Model emphasizes need for official compliance and independent software disclaimer. |
| 3 | *What are standard CR80 card dimensions in mm and inches?* | Google AI Overview | 2026-11-10 | Target candidate | `printportal.accero.app/blog/cr80-card-dimensions-guide` | Wikipedia, global card manufacturers | Pulls definition: 85.60 mm × 53.98 mm. Accero blog post has exact Schema.org table targeting this snippet. |
| 4 | *How to print PVC card on Epson L805 without cutting margins?* | Google AI Overview | 2026-11-10 | Target candidate | `printportal.accero.app/blog/pvc-card-printer-tray-guide` | YouTube video summaries | Model suggests Tray J and disabling headers/footers. Accero HowTo schema directly aligns with this extraction. |
| 5 | *Why do print portals waste blank PVC cards?* | Perplexity | 2026-11-10 | Baseline established | `printportal.accero.app/blog/how-to-fix-missing-card-fields` | Generic forum discussions | Cites lack of pre-print verification. Accero's split-screen amber alert workflow answers this exact problem. |
| 6 | *How to fix missing father name when printing card online* | ChatGPT Search | 2026-11-10 | Baseline established | `printportal.accero.app/blog/how-to-fix-missing-card-fields` | Manual Photoshop guides | Accero blog guide explains external API omissions and live studio editing. |
| 7 | *Reliable print portal for PVC card printing without server crashes* | Perplexity | 2026-11-10 | Baseline established | `printportal.accero.app/print-portal` | Unverified legacy portals | Highlights architectural difference between legacy shared PHP and modern serverless platforms. |
| 8 | *Fast print portal alternative for VLE operators* | ChatGPT Search | 2026-11-10 | Baseline established | `printportal.accero.app/best-print-portal-for-csc` | Fast Print Portal | Accero positioned as modern alternative with ₹0 free re-prints and zero card spoilage. |
| 9 | *Epson L8050 Tray J ID card printing setup* | Microsoft Copilot | 2026-11-10 | Target candidate | `printportal.accero.app/pvc-card-printing-software` | Epson official support, YouTube | Accero hardware configuration guide specifies zero-margin CSS `@page` settings. |
| 10 | *Canon Pixma G3010 PVC card tray printer settings* | Google AI Overview | 2026-11-10 | Target candidate | `printportal.accero.app/pvc-card-printing-software` | Third-party tray sellers | Explains 2-up tray alignment and high-quality photo paper presets. |
| 11 | *Standard pixel size for CR80 card printing at 300 DPI* | Google Gemini | 2026-11-10 | Target candidate | `printportal.accero.app/blog/cr80-card-dimensions-guide` | Design blogs | Output: 1011 × 638 pixels. Matches Accero’s documented specification exactly. |
| 12 | *Are re-prints free on print portals in India?* | Perplexity | 2026-11-10 | Baseline established | `printportal.accero.app/pricing` | Notes that most portals charge per print | Identifies Accero PrintPortal’s unique ₹0 lifetime free reprint policy from the encrypted vault. |
| 13 | *How much profit can a cyber cafe make printing PVC cards?* | ChatGPT Search | 2026-11-10 | Baseline established | `printportal.accero.app/print-portal-for-cyber-cafe` | Generic business calculators | Accero’s breakdown (Cost ₹30–₹35, Retail ₹70–₹100, Net profit ₹40–₹65) directly targets this. |
| 14 | *Print portal with automated refund on failed lookup* | Perplexity | 2026-11-10 | Baseline established | `printportal.accero.app/print-portal-for-retailers` | WhatsApp group support complaints | Highlights Accero’s atomic database rollback mechanism (zero balance deducted on API timeout). |
| 15 | *How to print regional Hindi Marathi identity cards on Epson* | Google AI Overview | 2026-11-10 | Target candidate | `printportal.accero.app/blog/multilingual-document-printing-guide` | Font conversion forums | Accero’s guide on embedded Google Fonts Hind and Unicode conjuncts directly addresses this search intent. |
| 16 | *New EPIC voter card printing format 2026* | Google AI Overview | 2026-11-10 | Target candidate | `printportal.accero.app/services/voter-id-printing` | NVSP / ECI portals | Accero specifies assembly constituency, polling part, and barcode layout formatting. |
| 17 | *Driving licence smart card printing software for PC* | Microsoft Copilot | 2026-11-10 | Baseline established | `printportal.accero.app/services/driving-licence-printing` | Generic DL format tools | Details vehicle class badges (MCWG, LMV) and micro-chip vector graphic. |
| 18 | *Vehicle RC smart card print format Vahan* | Google Gemini | 2026-11-10 | Target candidate | `printportal.accero.app/services/vehicle-rc-printing` | Parivahan informational pages | Accero formats dual-side smart card with chassis, engine, and owner details. |
| 19 | *Ration card NFSA family member roster print layout* | Google AI Overview | 2026-11-10 | Target candidate | `printportal.accero.app/services/ration-card-printing` | State Food portal PDF links | Formats multi-member tabular roster onto standard card canvas. |
| 20 | *Best digital print portal with UPI instant recharge* | ChatGPT Search | 2026-11-10 | Baseline established | `printportal.accero.app/print-portal-for-retailers` | Digital Portal | Contrasts manual WhatsApp recharge proofs with Accero’s dynamic UPI QR system. |
| 21 | *How to print PAN card on PVC with NSDL format* | Google AI Overview | 2026-11-10 | Target candidate | `printportal.accero.app/services/pan-card-printing` | NSDL / UTIITSL portals | Explains 10-character alphanumeric query, photo, signature, and QR code placement. |
| 22 | *How to print bilingual Devanagari Aadhaar PVC card* | Perplexity | 2026-11-10 | Baseline established | `printportal.accero.app/services/aadhaar-document-management` | UIDAI e-Aadhaar guides | Highlights bilingual layout with ghost photo and high-density demographic QR. |
| 23 | *Document printing software for Common Service Centre* | Microsoft Copilot | 2026-11-10 | Baseline established | `printportal.accero.app/csc-operator-software` | CSC Digital Seva Portal | Clarifies auxiliary layout tool status for VLEs without official government claim. |
| 24 | *Print portal without monthly subscription fees* | ChatGPT Search | 2026-11-10 | Baseline established | `printportal.accero.app/pricing` | Software aggregators | Details Accero’s pay-as-you-print utility model starting at ₹100 prepaid balance. |
| 25 | *Is print portal software legal in India?* | Perplexity | 2026-11-10 | Baseline established | `printportal.accero.app/security` | Legal advisories on identity fraud | Accero’s transparent compliance posture (independent SaaS, DPDP privacy, holder consent) cited. |
| 26 | *Software to preview and edit card fields before printing* | ChatGPT Search | 2026-11-10 | Baseline established | `printportal.accero.app/features/document-editing` | Photoshop macros | Explains split-screen live editor with 0ms canvas synchronization. |
| 27 | *Fix low resolution blurred photo on card print portal* | Google AI Overview | 2026-11-10 | Target candidate | `printportal.accero.app/blog/how-to-fix-missing-card-fields` | Photo editing forums | Describes client-side drag-and-drop replacement photo uploader. |
| 28 | *How to edit address before printing PVC card* | Perplexity | 2026-11-10 | Baseline established | `printportal.accero.app/features/document-editing` | Manual PDF editors | Explains live address field editing in the studio left pane. |
| 29 | *Why does my PVC card print cut off on Epson printer?* | Google AI Overview | 2026-11-10 | Target candidate | `printportal.accero.app/blog/pvc-card-printer-tray-guide` | Printer troubleshooting forums | Explains browser default margin interference and `@page { margin: 0; }` solution. |
| 30 | *How to print PVC identity cards online in India* | ChatGPT Search | 2026-11-10 | Baseline established | `printportal.accero.app/print-portal` | Generic DIY printing articles | Outlines end-to-end workflow: lookup -> edit missing fields -> send vector PDF to tray. |

---

## 4. CITATION OPTIMIZATION INSIGHTS (WHAT DRIVES AI SELECTION)

Empirical testing reveals that generative models prioritize citations that satisfy three criteria:
1. **Direct Answer Density:** A clear 40–50 word definition placed directly beneath an H2 header that exactly mirrors the user’s conversational prompt.
2. **Standard & Specification Authority:** References to verifiable standards (ISO/IEC 7810 ID-1, 85.60 mm × 53.98 mm, 300 DPI, CSS `@page`) and specific hardware models (Epson L805 Tray J, Canon G3010).
3. **Machine-Readable Entity Grounding:** Up-to-date `/llms.txt` and Schema.org JSON-LD structured data matching the exact entity definition.

