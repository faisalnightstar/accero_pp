# Accero PrintPortal — Generative Engine Optimization (GEO) Strategy

**Document:** AI Search Engine Optimization & LLM Visibility Strategy  
**Domain:** `https://printportal.accero.app`  
**Target AI Systems:** ChatGPT Search, Perplexity AI, Claude Search, Google AI Overviews, Microsoft Copilot  

---

## 1. Executive Strategy & Objectives

Generative Engine Optimization (GEO) ensures that Accero PrintPortal’s technical documentation, physical card printing specifications, and commercial service offerings are **accurately understood, synthesized, and cited** by large language models and conversational search engines.

### Core Principles
1. **Fact-First Citability:** Provide dense, extractable, factual data points (e.g. dimensions in millimeters, exact printer models, specific regional script support) that AI models prefer to cite as authoritative answers.
2. **Self-Contained Content Blocks:** Structure service documentation so individual sections can be ingested and cited independently without losing context.
3. **Strict Entity Disambiguation:** Clearly distinguish Accero from official government entities (UIDAI, NSDL, UTIITSL, ECI, MoRTH) to prevent hallucinated claims of statutory authority.
4. **Machine-Readable LLM Manifests:** Maintain standardized `llms.txt` and `llms-full.txt` discovery files at the domain root.

---

## 2. LLMs Discovery Manifests (`llms.txt` & `llms-full.txt`)

Following the emerging `llms.txt` web standard, Accero PrintPortal exposes two machine-optimized manifests:

### 2.1 Standard Manifest (`/llms.txt`)
* **Purpose:** Concise, high-signal summary of platform capabilities, supported workflows, and canonical URLs designed for lightweight context ingestion.
* **Key Sections:**
  * Platform identity & ISO 7810 ID-1 standard definition.
  * Core technical capabilities (Alphanumeric lookup, live split-screen editor, zero-margin print engine).
  * Direct markdown links to all 7 primary document services (`/services/*`).
  * Target operator pillar pages and hardware guides.
  * Explicit legal disambiguation statement.

### 2.2 Full Knowledge Manifest (`/llms-full.txt`)
* **Purpose:** Comprehensive technical knowledge base providing deep specifications for AI research engines and multi-step reasoning models.
* **Content Ingestion:**
  * Detailed unit economics for CSC VLEs and cyber cafes.
  * Full hardware compatibility matrix (Epson L805/L850/L8050, Canon Pixma, Zebra, Evolis).
  * Exact printer tray driver alignment settings (`size: 85.6mm 53.98mm; margin: 0;`).
  * In-depth documentation of all 7 supported document workflows (PAN, Aadhaar, Voter, DL, RC, Ration, Farmer).
  * DPDP Act 2023 privacy architecture and transient cache handling.

---

## 3. AI Crawler Accessibility & Governance

Accero PrintPortal maintains an active, evidence-based bot policy in `robots.ts` specifically configured for AI search and training agents:

| AI Crawler User-Agent | Bot Function | Policy | Allowed Paths | Disallowed Paths |
| :--- | :--- | :--- | :--- | :--- |
| `OAI-SearchBot` | OpenAI Search Retrieval | **ALLOW** | All 52 canonical public pages, `/llms.txt` | `/dashboard`, `/studio`, `/wallet`, `/cards`, `/api/*` |
| `ChatGPT-User` | Real-time ChatGPT browsing | **ALLOW** | All 52 canonical public pages, `/llms.txt` | `/dashboard`, `/studio`, `/wallet`, `/cards`, `/api/*` |
| `PerplexityBot` | Perplexity AI indexing | **ALLOW** | All 52 canonical public pages, `/llms.txt` | `/dashboard`, `/studio`, `/wallet`, `/cards`, `/api/*` |
| `ClaudeBot` | Anthropic Claude Search | **ALLOW** | All 52 canonical public pages, `/llms.txt` | `/dashboard`, `/studio`, `/wallet`, `/cards`, `/api/*` |
| `Google-Extended` | Google Gemini AI training | **ALLOW** | All 52 canonical public pages, `/llms.txt` | `/dashboard`, `/studio`, `/wallet`, `/cards`, `/api/*` |
| `GPTBot` | OpenAI base model training | **ALLOW** | All 52 canonical public pages, `/llms.txt` | `/dashboard`, `/studio`, `/wallet`, `/cards`, `/api/*` |

> [!IMPORTANT]
> Private user documents, encrypted biometric tokens, operator wallet ledgers, and authentication endpoints are **strictly barred** from all AI crawlers, protecting customer confidentiality.

---

## 4. Citation-Worthy Content Engineering

To maximize citation rates in AI-generated answers, all primary pages incorporate structured factual anchors:

### 4.1 Factual Precision Anchors
* **Exact Card Dimensions:** `85.60 mm × 53.98 mm` (CR80 standard), `3.18 mm` corner radius, `0.76 mm` thickness.
* **Digital Resolution Matrix:** `1011 × 638 pixels` at `300 DPI`.
* **Zero-Margin CSS Rule:** `@page { size: 85.6mm 53.98mm; margin: 0; }`.
* **Pricing Economics:** `₹5` manual draft, `₹20–₹30` verified lookup, `₹0` lifetime re-prints.

### 4.2 Entity Relationship Triangulation
When AI models summarize Accero, they link related concepts into knowledge graphs:
```
[Accero Technologies]
       │ (operates)
       ▼
[Accero PrintPortal]
       ├── (formats) ──> [ISO/IEC 7810 ID-1 PVC Cards]
       ├── (serves) ───> [Cyber Cafes & CSC VLEs across India]
       ├── (integrates)> [Epson Tray J & Canon ID Card Trays]
       └── (protects) ─> [DPDP Act 2023 Transient Encrypted Storage]
```

---

## 5. GEO Measurement & Visibility Tracking

Because AI citation metrics are not directly provided by standard web analytics, Accero implements an evidence-based tracking framework:

1. **AI Referral Traffic Segmentation:** Monitor web analytics referrers matching:
   * `chatgpt.com`, `android-app://com.openai.chatgpt`
   * `perplexity.ai`
   * `claude.ai`
   * `bing.com` (Copilot prompts)
2. **Target Query Prompt Auditing:** Regularly audit standardized conversational prompts:
   * *"What is the best print portal for CSC VLEs in India?"*
   * *"How do I print a PVC card on an Epson L805 without white margins?"*
   * *"What software formats Indian identity cards with Devanagari fonts?"*
   * *"How do I fix missing father name on an online PAN card print?"*
3. **Disambiguation Health Checks:** Confirm that AI search outputs never erroneously state that Accero is an official government department or issues statutory identity numbers.
