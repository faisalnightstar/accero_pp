# Architecture Research

**Domain:** Full-Stack Next.js 15+ & MongoDB Document Portal
**Researched:** 2026-09-28
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (Browser)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌───────────────────────────────────────────┐  │
│  │ Public Landing & SEO   │  │ Split-Screen Card Studio                  │  │
│  │ (SSR Pages, GEO Pages, │  │ ├─ Form & Missing Field Editor (Left)     │  │
│  │ JSON-LD Structured UI) │  │ └─ Live CR80 Card Canvas Preview (Right)  │  │
│  └───────────┬────────────┘  └─────────────────────┬─────────────────────┘  │
│              │                                     │                        │
├──────────────┴─────────────────────────────────────┴────────────────────────┤
│                       APPLICATION & ROUTE LAYER (Next.js)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌───────────────────────┐  ┌────────────────┐  │
│  │ Server Actions         │  │ API Route Handlers    │  │ Auth & Guard   │  │
│  │ (Form validation,      │  │ (/api/verify/pan,     │  │ (NextAuth/JWT, │  │
│  │ document updates)      │  │  /api/wallet/topup)   │  │  RBAC)         │  │
│  └───────────┬────────────┘  └───────────┬───────────┘  └───────┬────────┘  │
│              │                           │                      │           │
├──────────────┴───────────────────────────┴──────────────────────┴───────────┤
│                         SERVICES & INTEGRATION LAYER                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌───────────────────────┐  ┌────────────────┐  │
│  │ Verification Router    │  │ Wallet Service        │  │ Print Engine   │  │
│  │ (NeoAPI, AxenAPI,      │  │ (Atomic deductions,   │  │ (CSS @media,   │  │
│  │  Fallback Orchestrator)│  │  Recharge ledger)     │  │  jsPDF, SVG)   │  │
│  └───────────┬────────────┘  └───────────┬───────────┘  └───────┬────────┘  │
│              │                           │                      │           │
├──────────────┴───────────────────────────┴──────────────────────┴───────────┤
│                             DATA LAYER (MongoDB)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌───────────────────────┐  ┌────────────────┐  │
│  │ User & Wallet Store    │  │ Document Record Store │  │ SEO/GEO Store  │  │
│  │ (Balance, roles, logs) │  │ (Snapshots, edits)    │  │ (State/cities) │  │
│  └────────────────────────┘  └───────────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

1. **Client Split-Screen Card Studio:**
   - React state management maintaining dynamic card document model.
   - Synchronous two-way data binding: typing in any form input instantly updates the visual text coordinates on the card canvas.
   - Missing fields highlighted with visual indicators and validation badges until satisfied.
2. **Next.js App Router (Server Actions & Route Handlers):**
   - Server-side execution of third-party API cURL requests (eliminating CORS and securing API keys).
   - Validation with Zod before saving into MongoDB.
3. **Services & Integration Layer:**
   - Provider failover logic: attempts primary provider (e.g. NeoAPI), falls back to secondary provider (FastNexora), and if data is incomplete, marks fields as `isMissing: true`.
   - Atomic wallet deductions using MongoDB transactions (`session.withTransaction`) to guarantee that credits are only charged upon successful verification/print setup.
4. **Data Layer (MongoDB):**
   - Collections: `users`, `wallets`, `walletTransactions`, `documents`, `cardTemplates`.

## Data Flow: Missing Field Resolution & Print

1. **User enters Card Number** (e.g., PAN `ABCDE1234F`).
2. **Server Action calls Provider API**:
   - Provider returns: `name: "RAHUL KUMAR"`, `pan: "ABCDE1234F"`, `dob: "12/05/1990"`.
   - Father's name and signature image are missing from API response.
3. **Missing Field Detection**:
   - System flags `fatherName` and `signature` as missing.
4. **Split-Screen Studio Loads**:
   - Left Pane displays populated form fields with green checks, and highlights `Father's Name` and `Signature` with yellow warning rings.
   - Right Pane displays the preformatted PAN card with available data rendered, and dashed placeholder guides over the missing areas.
5. **User Edits Missing Data**:
   - User types father's name and uploads signature.
   - Card canvas updates in real time.
6. **Save & Print**:
   - Complete document snapshot is saved to MongoDB.
   - User triggers `@media print` or downloads high-DPI PDF.

---
*Architecture research: 2026-09-28*
