# Accero PrintPortal

> **Accero PrintPortal** is an independent document-processing and printing platform designed for Common Service Centre (CSC) operators, cyber cafes, digital service centers, and retailers.

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Card Standard](https://img.shields.io/badge/Card_Standard-ISO%2FIEC_7810_ID--1_(CR80)-navy)](https://en.wikipedia.org/wiki/ISO/IEC_7810)
[![PWA Ready](https://img.shields.io/badge/PWA-Cross--Platform%20Ready-8B1E2D?logo=pwa)](docs/pwa/architecture.md)
[![Test Suite](https://img.shields.io/badge/Tests-323%20Passed%20(Vitest)-success?logo=vitest)](tests)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel)](https://vercel.com/)

**Production Website:** [https://printportal.accero.app](https://printportal.accero.app)  
**Status:** Production Ready (v1.0.0) — Commercial SaaS  

*Disclaimer: Accero PrintPortal is an independent commercial utility software platform. It is not affiliated with, authorized by, sponsored by, or endorsed by the Unique Identification Authority of India (UIDAI), the Income Tax Department, the Election Commission of India (ECI), the Ministry of Road Transport and Highways (MoRTH), the Department of Food and Public Distribution, or any Central or State Government authority. All statutory identity documents remain the exclusive property of their respective issuing bodies.*

---

## Table of Contents

- [About Accero PrintPortal](#about-accero-printportal)
- [Key Features](#key-features)
  - [Document Processing Services](#document-processing-services)
  - [Document Management & Studio](#document-management--studio)
  - [Precision Printing & PDF Pipeline](#precision-printing--pdf-pipeline)
  - [Business Operations & Financial Ledger](#business-operations--financial-ledger)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
  - [Architecture Overview](#architecture-overview)
  - [Architecture Flow Diagram](#architecture-flow-diagram)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Seeding](#database-seeding)
  - [Running the Application](#running-the-application)
- [Environment Configuration](#environment-configuration)
- [Testing and Quality Assurance](#testing-and-quality-assurance)
- [Deployment](#deployment)
- [SEO, AEO and GEO Strategy](#seo-aeo-and-geo-strategy)
- [Security and Privacy](#security-and-privacy)
- [Documentation Index](#documentation-index)
- [Contribution and Development Guidelines](#contribution-and-development-guidelines)
- [License and Ownership](#license-and-ownership)

---

## About Accero PrintPortal

### What the Platform Does
Accero PrintPortal provides a high-performance web gateway for commercial printing shops and digital service centers. It transforms raw document lookups or manual data entries into pixel-perfect, ISO/IEC 7810 ID-1 (CR80) standard physical card layouts, enabling instant dual-sided card printing and high-DPI PDF generation.

### Who It Serves
- **CSC Village Level Entrepreneurs (VLEs)** managing rural citizen service delivery.
- **Cyber Cafe Operators** handling morning citizen documentation footfalls.
- **Digital Document Centers & Retail Printing Kiosks** printing PVC ID cards for walk-in clients.
- **Retail Service Agents** requiring structured, error-free document formatting tools.

### The Business Problem Addressed
Legacy print portals in India suffer from chronic structural flaws:
1. **Unstable Upstream Gateways & 502 Crashes:** Legacy single-VPS portals collapse during morning rush hours when citizen footfall is highest.
2. **Blind Print Failures & Ruined Blanks:** External government APIs frequently return partial or empty fields (e.g., missing father's name, missing date of birth). Traditional software prints these truncated payloads directly, ruining expensive physical PVC card blanks.
3. **Wallet Balance Losses:** Legacy scripts deduct user balances without guaranteeing print success and fail to offer automatic compensations when external providers timeout.
4. **Distorted Regional Typography:** Hindi, Tamil, Telugu, and other regional scripts frequently suffer from font overlap, clipped glyphs, or broken Devanagari ligatures when printed from unstandardized templates.

Accero PrintPortal solves these problems through **multi-provider verification failovers**, an **interactive split-screen Studio** with real-time missing field detection, a **72-hour tenant-isolated document cache**, **atomic ACID wallet transactions**, and **native vector typography rendering**.

---

## Key Features

### Document Processing Services
The platform provides preformatted, official-standard card canvases for seven core citizen document categories:

| Document Type | Canvas Implementation | Standard & Format Details |
| :--- | :--- | :--- |
| **PAN Card** | `PanCardCanvas.tsx` | NSDL/UTIITSL format, QR code generator, photo and signature drag-and-drop. |
| **Aadhaar Card** | `AadhaarCardCanvas.tsx` | UIDAI layout standard, optional 12-digit privacy masking, bilingual address formatting, secure QR code. |
| **Voter ID (EPIC)** | `VoterCardCanvas.tsx` | Election Commission format, bilingual headings, state seal, assembly constituency and polling station metadata. |
| **Driving Licence** | `DlCardCanvas.tsx` | State Transport Department layout, vehicle class authorization grid (MCWG, LMV, etc.), badge numbers, issue/expiry dates. |
| **Vehicle RC** | `RcCardCanvas.tsx` | MoRTH smart card specification, simulated IC chip graphic, vehicle technical parameters, fuel type, engine/chassis numbers. |
| **Ration Card** | `RationCardCanvas.tsx` | NFSA standard, state emblem selection, family member roster, FPS shop code, category badges (AAY/PHH). |
| **Farmer ID** | `FarmerCardCanvas.tsx` | AgriStack / State Farmer Registry format, landholding parcel grid (khata, khasra, area), regional language localization. |

### Document Management & Studio
- **API-Based Lookup Cascade:** Orchestrated queries across multiple upstream providers (NeoAPI, AxenAPI, FastNexora) with automatic timeout detection and graceful fallback.
- **Manual Data Entry Mode:** Full manual input forms for operators handling offline documentation or direct customer-provided details.
- **Split-Screen Interactive Studio:** Real-time synchronized editing where form updates immediately reflect on the adjacent live CR80 canvas.
- **Missing-Field Visibility Engine:** Declarative rules (`src/lib/missingFields.ts`) evaluate incoming payloads, highlighting missing fields with amber indicators and calculating a completion score prior to print authorization.
- **72-Hour Tenant-Isolated Cache:** Documents are persisted in MongoDB (`DocumentRecord`) with a 72-hour TTL index. Operators can re-edit, preview, or re-print documents within 72 hours without incurring additional verification fees.

### Precision Printing & PDF Pipeline
- **ISO/IEC 7810 ID-1 Standard:** Canvas containers strictly honor physical card geometry (85.60 mm × 53.98 mm, 3.18 mm rounded corners).
- **High-DPI PDF Export:** Client-side 3x rasterization (`html2canvas`) paired with `jspdf` generates crisp, vector-accurate two-page landscape PDFs (Page 1: Front, Page 2: Back) ready for production printing.
- **High-Resolution PNG Download:** One-click 300+ DPI PNG export for direct image printing.
- **Physical Card Tray Alignment:** Dedicated `@media print` CSS rules isolate the card elements, hide navigation chrome, and space cards precisely for standard dual-card PVC printer trays (e.g., Epson L805).
- **Multilingual Rendering:** Embedded Google Fonts (`Hind`, `Roboto`, `Open Sans`) ensure proper typography rendering across Hindi, Marathi, Tamil, Telugu, Gujarati, Punjabi, Bengali, Kannada, and Malayalam.

### Progressive Web App (PWA) & Cross-Platform Installation
- **Cross-Platform Installability:** Installs as a standalone business desktop/mobile application across Windows 10/11, macOS, Android, and iOS/iPadOS without app store dependencies.
- **W3C Web App Manifest:** Configured via `src/app/manifest.ts` with brand theming (`#8B1E2D`), standalone display mode, adaptive icons, and quick-launch shortcuts (Studio, Dashboard, Wallet).
- **High-Resolution Brand Assets:** Standard, maskable (with 20% safe zones for Android), and Apple touch icons generated from the official Accero emblem.
- **Zero-Trust Caching Engine:** Lightweight custom service worker (`public/sw.js`) precaches the application shell while strictly enforcing **Network-Only** access for all sensitive API endpoints, authentication sessions, and citizen document data.
- **Graceful Offline Fallback:** Dedicated `/offline` route with real-time connectivity status and retry controls, safely pausing financial and lookup transactions when network drops.
- **Platform-Aware Install Prompts:** Smart floating install card (`InstallPrompt.tsx`) with 7-day dismissal cooldown and step-by-step Apple Safari Share Sheet guides for iPhone/iPad operators.
- **Safe Background Updates:** Real-time update detection (`ServiceWorkerRegistration.tsx`) surfaces an unobtrusive "Update Now" alert that avoids disrupting active card editing or payment sessions.

### Business Operations & Financial Ledger
- **Universal Authentication & RBAC:** Single sign-on entry point with 7-day secure JWT cookies. Role-based routing enforces permissions for `super_admin`, `admin`, `support_manager`, `support_agent`, and `operator`.
- **Prepaid Wallet Ledger:** Atomic wallet debits using MongoDB ACID transactions (`runInTransaction`), enforcing the Balance Conservation Law ($Balance \ge 0$).
- **Instant Recharge via Paytm:** Dynamic UPI QR code generation, multi-merchant routing configuration (`PAYTM_ACCOUNTS`), and automated server-to-server transaction status verification.
- **Manual Recharge Workflow:** Operators can submit bank transfer UTR numbers for manual administrative review and credit approval.
- **Promo Code & Coupon System:** Supports percentage and flat wallet discounts, maximum discount caps, usage limits, and campaign expiration tracking.
- **Referral Rewards Program:** Two-tier referral tracking awarding automatic bonus wallet credits upon referee qualification.
- **Customer Support Portal:** Integrated ticketing workflow with priority assignment, message threads, and operator account lookup for support staff.

---

## Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `15.1.7` | Hybrid server/client rendering, API routes, streaming, and metadata APIs. |
| **UI Library** | React | `19.0.0` | Component composition, server actions, and optimistic UI updates. |
| **Language** | TypeScript | `5.7.3` | Strict static typing, document payload contracts, and compile-time safety. |
| **Styling** | Tailwind CSS | `3.4.17` | Utility-first design tokens, high-contrast print layouts, and responsive UI. |
| **Database** | MongoDB Atlas | *Serverless / 7.x+* | Document persistence, transactional ledgers, and 72-hour TTL caching. |
| **ODM** | Mongoose | `9.10.2` | Strongly typed schemas, compound indexes, and ACID transaction sessions. |
| **Authentication** | Jose & Bcryptjs | `6.2.12` / `3.0.3` | Edge-compatible stateless JWT signing/verification and password hashing. |
| **Rate Limiting** | Upstash Redis | `2.2.0` / `1.41.0` | Distributed Edge rate limiting with automatic fallback to MongoDB/memory. |
| **PDF & Canvas** | html2canvas & jsPDF | `1.4.1` / `4.2.1` | Client-side 300+ DPI rasterization and ISO/IEC 7810 ID-1 PDF generation. |
| **Symbology** | qrcode & jsbarcode | `1.5.4` / `3.12.3` | Dynamic QR code and Code 128 barcode generation on identity cards. |
| **Outbound Egress** | Undici & Fixie Proxy | `8.12.4` / `9.1.0` | Fixed IP outbound proxy client for upstream provider IP whitelisting. |
| **Analytics** | Vercel Analytics | `2.0.1` | Real-time Core Web Vitals, speed insights, and user telemetry. |
| **Email Service** | Nodemailer | `10.3.1` | Password reset dispatch and administrative transaction alerts. |
| **Validation** | Zod | `3.24.2` | Runtime request body schema validation and type inference. |
| **Testing** | Vitest | `4.1.12` | Fast unit, integration, and security regression testing suite. |
| **Deployment** | Vercel | *Production* | Serverless function execution, global Edge network, and CI/CD pipeline. |

---

## System Architecture

### Architecture Overview
Accero PrintPortal utilizes Next.js 15 App Router architecture with strict boundary separation:
1. **Edge Middleware (`src/middleware.ts`):** Evaluates incoming requests, injects security headers (HSTS, CSP, X-Frame-Options), verifies JWT tokens using `jose`, and executes role-based redirection.
2. **Server Actions & API Routes:** Handles business logic securely on the server. Wallet operations and print authorizations invoke MongoDB replica set transactions to eliminate race conditions.
3. **Outbound Network Routing Subsystem (`src/lib/network/`):** All external API queries (NeoAPI, AxenAPI, FastNexora, Paytm) are funneled through a centralized network client. When configured, traffic routes through a fixed-IP static proxy (Fixie) with strict destination hostname allowlists preventing Server-Side Request Forgery (SSRF).
4. **Document Cache Subsystem (`src/lib/documents/`):** Implements a database-first lookup strategy. If a document was fetched within 72 hours by the authenticated operator, it is served directly from the MongoDB cache, avoiding redundant external API charges.
5. **Interactive Client Studio:** Renders the split-screen form and card canvas. Canvas components render pure vector SVG and high-resolution typography in the DOM, allowing lossless scaling and instant PDF export.

### Architecture Flow Diagram

```mermaid
flowchart TD
    subgraph Client ["Client Browser (Operator)"]
        UI["Studio / Dashboard UI"]
        Editor["Interactive Split-Screen Editor"]
        Canvas["CR80 Vector Card Canvas"]
        PDF["html2canvas (3x) + jsPDF Engine"]
    end

    subgraph Edge ["Vercel Edge Network"]
        MW["Next.js Middleware (JWT & RBAC Guard)"]
        RL["Upstash Redis Distributed Rate Limiter"]
    end

    subgraph Server ["Next.js Serverless Execution"]
        Actions["Server Actions (/actions)"]
        API["REST Endpoints (/api)"]
        VerifyOrch["Verification Orchestrator"]
        NetClient["Centralized Network Client (Fixie Egress)"]
        WalletEngine["ACID Wallet & Ledger Engine"]
    end

    subgraph External ["External Third-Party Services"]
        Paytm["Paytm Payment Gateway"]
        Neo["NeoAPI (Voter / PAN)"]
        Axen["AxenAPI (Aadhaar / DL / RC)"]
        Nexora["FastNexora API"]
    end

    subgraph Database ["MongoDB Atlas Cluster"]
        Users["users Collection"]
        Wallets["wallets & payments (ACID)"]
        Cache["documentrecords (72h TTL)"]
        Audit["auditlogs Collection"]
    end

    UI -->|Request| MW
    MW -->|Rate Limit Check| RL
    MW -->|Authorized Route| Actions
    MW -->|API Request| API

    Actions -->|Document Lookup| VerifyOrch
    VerifyOrch -->|1. Check Cache| Cache
    VerifyOrch -->|2. On Miss: Egress Query| NetClient
    NetClient -->|Proxied Fixed IP| Neo
    NetClient -->|Proxied Fixed IP| Axen
    NetClient -->|Proxied Fixed IP| Nexora

    Actions -->|Print Authorization| WalletEngine
    WalletEngine -->|Atomic Balance Deduction| Wallets
    WalletEngine -->|Log Action| Audit

    API -->|Recharge Verification| NetClient
    NetClient -->|Verify Order| Paytm

    VerifyOrch -->|Normalized Data| Editor
    Editor -->|Live Data Sync| Canvas
    Canvas -->|1-Click Print / PDF| PDF
```

---

## Project Directory Structure

```
accero_pp/
├── src/
│   ├── actions/               # Next.js Server Actions (admin, wallet, verify, print, promo)
│   ├── app/                   # App Router pages, layouts, templates, and API routes
│   │   ├── (auth)/            # Login, registration, password reset flows
│   │   ├── admin/             # Administrative control center (operators, ledger, team)
│   │   ├── api/               # REST API endpoints (auth, wallet, print, documents, support)
│   │   ├── compare/           # SEO competitor comparison landing pages
│   │   ├── dashboard/         # Authenticated operator dashboard
│   │   ├── services/          # Canonical public document service landing pages
│   │   ├── studio/            # Interactive split-screen card editor & previewer
│   │   ├── support/           # Customer support desk & operator ticket portal
│   │   ├── wallet/            # Wallet ledger, Paytm recharge modal, transaction history
│   │   ├── layout.tsx         # Root application layout & global font imports
│   │   ├── robots.ts          # Programmatic robots.txt configuration
│   │   └── sitemap.ts         # Programmatic XML sitemap generator
│   ├── components/            # Reusable React components
│   │   ├── cards/             # 7 official card canvases (PAN, Aadhaar, Voter, DL, RC, Ration, Farmer)
│   │   ├── studio/            # Studio controls, CardForm, AssetDropzone, MissingFieldBanner
│   │   ├── public/            # Public marketing UI, navigation, hero, FAQ accordions
│   │   ├── ui/                # Core design primitives (buttons, modals, badges, inputs)
│   │   └── wallet/            # Paytm QR recharge modal, transaction tables
│   ├── hooks/                 # Custom React client hooks
│   ├── lib/                   # Core business logic and infrastructure libraries
│   │   ├── documents/         # 72-hour document caching and database-first lookup
│   │   ├── network/           # Centralized outbound client, Fixie proxy, provider registry
│   │   ├── payment/           # Paytm checksum generation and order verification
│   │   ├── print/             # Centralized print authorization & billing logic
│   │   ├── security/          # Upstash rate limiter and input sanitization
│   │   ├── verify/            # Multi-provider verification orchestrator and normalizers
│   │   ├── wallet/            # Pricing SSOT, campaign engine, balance calculations
│   │   ├── auth.ts            # Jose JWT generation, verification, and cookie helpers
│   │   ├── cardExport.ts      # html2canvas 3x rasterizer and jsPDF card export
│   │   ├── missingFields.ts   # Declarative missing field rules and completeness scores
│   │   ├── mongodb.ts         # MongoDB Mongoose connection pooling singleton
│   │   └── rbac.ts            # Role-based access control rules and destination resolvers
│   ├── models/                # Mongoose schema definitions (User, Wallet, Payment, DocumentRecord, etc.)
│   └── types/                 # TypeScript interfaces and type definitions
├── docs/                      # Architectural, SEO, security, and template documentation
│   ├── design/                # Design system tokens and UI redesign reports
│   ├── documentation/         # Documentation audits and structural reports
│   ├── document-templates/    # Technical specifications for card templates
│   ├── seo/                   # SEO, AEO, GEO strategies, audits, and competitor intelligence
│   └── ...                    # Core operational and security guides
├── public/                    # Static image assets, logos, emblems, watermarks, llms.txt
├── scripts/                   # Administrative utility scripts (seed-users.js, data configs)
├── tests/                     # Automated Vitest test suites (31 test files, 305 tests)
├── next.config.ts             # Next.js build configuration, 301 redirects, and image domains
├── package.json               # Project dependencies and operational scripts
├── tailwind.config.ts         # Tailwind CSS theme configuration and design tokens
├── tsconfig.json              # Strict TypeScript compiler configuration
└── vitest.config.mjs          # Vitest testing environment configuration
```

---

## Getting Started

### Prerequisites
- **Node.js:** `v18.18.0` or `v20.x` (LTS recommended).
- **Package Manager:** `npm` (comes bundled with Node.js).
- **Database:** A local MongoDB instance or a free MongoDB Atlas cluster connection string.
- **Git:** Installed on your development machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/accero-technologies/accero_pp.git
   cd accero_pp
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment configuration into a local environment file:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` in your editor and configure your database and JWT secret (see [Environment Configuration](#environment-configuration)).

### Database Seeding
To provision default administrative accounts, initial support users, and service pricing configurations:
```bash
npm run seed:users
```

### Running the Application

- **Start the local development server:**
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Run the automated test suite:**
  ```bash
  npm test
  ```

- **Run static type checking:**
  ```bash
  npx tsc --noEmit
  ```

- **Build for production:**
  ```bash
  npm run build
  ```

- **Start the production server locally:**
  ```bash
  npm start
  ```

---

## Environment Configuration

All environment variables must be declared in `.env.local` for local execution or inside the Vercel Project Settings for production deployments.

> **CRITICAL SECURITY NOTICE:** Never commit `.env` or `.env.local` to version control. Never expose live API keys, Paytm merchant keys, or MongoDB credentials in public repositories.

### Key Environment Variables Overview

| Variable Name | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `MONGODB_URI` | **Yes** | `mongodb+srv://...` | MongoDB connection string (Replica set required for ACID transactions). |
| `JWT_SECRET` | **Yes** | `[32+ character secret]` | Cryptographic key used to sign and verify session JWTs. Generate with `openssl rand -base64 32`. |
| `NODE_ENV` | **Yes** | `development` / `production` | Application execution environment. |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `https://printportal.accero.app` | Base canonical application domain used for metadata, OpenGraph, and callbacks. |
| `PAYTM_MID` | Optional | `YOUR_MERCHANT_ID` | Paytm Merchant ID for live UPI QR payment collection. |
| `PAYTM_MERCHANT_KEY` | Optional | `YOUR_MERCHANT_KEY` | Secret key for generating and verifying Paytm payment checksums. |
| `PAYTM_UPI` | Optional | `paytm.handle@pty` | Display UPI VPA for operator QR top-ups. |
| `UPSTASH_REDIS_REST_URL` | Optional | `https://...upstash.io` | Upstash Redis REST URL for distributed Edge rate limiting. |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | `[Token]` | Upstash Redis REST authentication token. |
| `NEO_API_KEY` | Optional | `[API Key]` | Live upstream API key for Voter ID and PAN document lookups. |
| `AXEN_API_KEY` | Optional | `[API Key]` | Live upstream API key for Aadhaar, DL, and RC lookups. |
| `FASTNEXORA_API_KEY` | Optional | `[API Key]` | Fallback upstream API key for voter records. |
| `FIXIE_URL` | Optional | `http://fixie:...@...usefixie.com:80` | Outbound HTTP/HTTPS proxy URL for static egress IP whitelisting. |
| `ALLOW_SANDBOX_RECHARGE` | **No** | `false` | Development toggle allowing instant wallet top-ups without payment. Must be `false` in production. |
| `ALLOW_MOCK_PROVIDERS` | **No** | `false` | Development toggle enabling synthetic mock document responses. Must be `false` in production. |

---

## Testing and Quality Assurance

Accero PrintPortal maintains a comprehensive automated testing suite built on **Vitest**. The test suite executes in under 2 seconds and validates core security, financial, and architectural invariants without requiring live external network connections.

### Test Execution Command
```bash
npm test
```

### Verified Test Suite Status
```
Test Files  32 passed (32)
     Tests  323 passed (323)
  Duration  ~1.0s
```

### Key Verification Categories
1. **Financial & Ledger Integrity (`tests/payment-atomicity.test.ts`, `tests/wallet-security.test.ts`):** Verifies the Balance Conservation Law, prevents race-condition double-crediting, validates UTR deduplication, and tests atomic rollbacks.
2. **Print Billing & Authorization (`tests/print-billing.test.ts`):** Confirms that card printing correctly authorizes debits across all supported services and rejects requests with insufficient funds.
3. **72-Hour Document Cache (`tests/document-cache.test.ts`):** Validates database-first retrieval, 72-hour expiration calculation, and strict tenant isolation (operators cannot read other operators' cached documents).
4. **Outbound Network Routing & Security (`tests/network-routing.test.ts`, `tests/fixie-outbound.test.ts`):** Enforces fail-closed behavior in production when proxy credentials are missing and tests SSRF prevention against unregistered hosts.
5. **Authentication & RBAC (`tests/jwt-auth.test.ts`, `tests/admin-support-rbac.test.ts`, `tests/auth-redirects.test.ts`):** Confirms that edge middleware routes users to their role-specific dashboards and blocks unauthenticated access to protected routes.
6. **SEO & Search Indexing (`tests/seo/*.test.ts`):** Validates canonical link generation, XML sitemap structure, crawler access rules in `robots.txt`, and Schema.org JSON-LD structured data.

---

## Deployment

The application is engineered for automated serverless deployment on **Vercel**.

### Production Setup
- **Production URL:** `https://printportal.accero.app`
- **Production Branch:** `main`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Node.js Version:** `20.x`

### Deployment Pipeline
1. **Push to `main`:** Commits pushed to the `main` branch trigger Vercel's automated build and preview checks.
2. **Static Asset Tracing:** The configuration in `next.config.ts` uses `outputFileTracingRoot` to optimize serverless function bundle sizes.
3. **Edge Middleware Execution:** Global Edge locations execute `src/middleware.ts` within milliseconds, ensuring sub-50ms TTFB for security validation.
4. **Zero-Downtime Rollbacks:** Every deployment generates an immutable deployment hash. In the event of an upstream outage, instant rollbacks can be executed directly from the Vercel dashboard.

---

## SEO, AEO and GEO Strategy

Accero PrintPortal includes an advanced organic acquisition architecture designed to achieve high visibility across traditional search engines and AI-driven answer engines:

- **Canonical Route Enforcement:** Strict URL normalization via 301 redirects in `next.config.ts` eliminates duplicate content penalties across trailing slashes and parameter variations.
- **Dynamic Structured Data:** Automated injection of Schema.org schemas (`SoftwareApplication`, `Organization`, `FAQPage`, `BreadcrumbList`, `Service`) via `src/components/seo/JsonLd.tsx`.
- **Dynamic OpenGraph Images:** The `/api/og` endpoint generates branded, high-contrast preview images dynamically for social sharing and search snippet previews.
- **Targeted Landing Pages:** High-ranking search landing pages for operators (`/csc-operator-software`, `/print-portal-for-cyber-cafe`, `/pvc-card-printing-software`) and competitor comparison pages (`/compare/*`).
- **Answer Engine Optimization (AEO):** Direct-answer semantic blocks and question-and-answer accordions optimized for Google Featured Snippets and "People Also Ask" extraction.
- **Generative Engine Optimization (GEO):** Structured semantic citations, entity disambiguation (`public/llms.txt`), and fact-dense tables designed to maximize citations in AI engines like ChatGPT, Perplexity, Claude, and Google AI Overviews.

---

## Security and Privacy

Accero PrintPortal implements a defense-in-depth security architecture:

1. **Stateless JWT Sessions:** Issued via Edge-compatible `jose`, signed with SHA-256 HMAC, stored in HTTP-only, `Secure`, `SameSite=Lax` cookies, and validated at the edge.
2. **Defensive Role-Based Access Control (RBAC):** Normalized roles (`super_admin`, `admin`, `support_manager`, `support_agent`, `operator`) enforced both at the middleware boundary and within server actions.
3. **Database Financial Invariants:** Wallet modifications execute inside MongoDB multi-document ACID transactions with strict balance non-negativity checks (`$gte: 0`).
4. **Outbound Proxy Whitelisting (SSRF Defense):** External API integrations run through a centralized client that validates destination hostnames against a strict allowlist. Production environments fail closed if required egress proxy configurations are missing.
5. **Distributed Rate Limiting:** Edge-level rate limiting powered by Upstash Redis isolates abusers by IP address and authenticated user token, preventing denial-of-service and credential stuffing.
6. **Data Minimization & 72-Hour TTL:** Document records in MongoDB automatically expire and are purged by MongoDB's TTL index 72 hours after generation, complying with data minimization and the Digital Personal Data Protection (DPDP) Act.

---

## Documentation Index

This repository includes detailed specifications, research reports, and operational guides. The index below links to all primary documentation:

### 1. Architecture, Database & Engineering
- [Database Migration & Index Strategy Guide](docs/DATABASE_MIGRATION.md) — Production MongoDB index specifications, indexing scripts, and schema evolution.
- [Financial Integrity & Transaction Specification](docs/FINANCIAL_INTEGRITY.md) — Mathematical balance models, atomic ledger invariants, and payment verification.
- [Production Readiness & Milestone Tracker](docs/PRODUCTION_READINESS.md) — Platform launch audit, 72-hour cache verification, and billing engine sign-off.
- [Documentation Audit & Gap Analysis](docs/documentation/documentation-audit.md) — Comprehensive inventory of repository documentation, broken link checks, and maintenance recommendations.

### 2. Operations, Administration & Support
- [Authentication, User Roles & Login Guide](docs/USER_ROLES_AND_LOGIN.md) — Operational manual covering the 5 user roles, login routes, and role-based redirects.
- [Admin Dashboard Specification](ADMIN_DASHBOARD.md) — Administrative workflows, operator management, and financial reporting.
- [Support Dashboard Specification](SUPPORT_DASHBOARD.md) — Customer support workflows, ticket assignment, and operator diagnostics.

### 3. Security, Privacy & Compliance
- [Security Hardening & Remediation Audit](docs/SECURITY_AUDIT.md) — Phase 2 vulnerability remediation report covering P0–P2 CVE/CWE resolutions.
- [Security & RBAC Audit Summary](SECURITY_RBAC_AUDIT.md) — Access control validation and permissions matrix verification.

### 4. Design & Document Templates
- [Design System Specification](docs/design/design-system.md) — Design tokens, color palette (`brand-navy`, `accent-amber`), typography, and CR80 geometry.
- [Public Route Redesign Report](docs/design/public-redesign-report.md) — Visual polish, typography hierarchy, and UI responsiveness review.
- [Public Route UI Audit](docs/design/public-route-audit.md) — Detailed inspection of marketing layouts and mobile viewport responsiveness.
- [Ration Card Template Design Specification](docs/document-templates/ration-card/template-design.md) — CR80 layout dimensions, font weights, and NFSA formatting rules.
- [Ration Card Data Mapping Guide](docs/document-templates/ration-card/data-mapping.md) — State PDS portal data field normalization into card schemas.
- [Ration Card Asset Inventory](docs/document-templates/ration-card/asset-inventory.md) — Emblems, NFSA watermarks, and barcode layout requirements.
- [Ration Card Implementation Report](docs/document-templates/ration-card/implementation-report.md) — Canvas component implementation and print controls review.
- [Ration Card Reference Audit](docs/document-templates/ration-card/reference-audit.md) — Visual benchmark analysis of official physical ration cards across states.

### 5. SEO, AEO & GEO Infrastructure
- [Master SEO Baseline Audit](docs/SEO_AUDIT.md) — Technical and structural search audit across all application routes.
- [Technical SEO Implementation Guide](docs/seo/TECHNICAL_SEO_IMPLEMENTATION.md) — Next.js metadata architecture, OpenGraph generation, and canonical routing.
- [SEO Implementation Milestone Report](docs/seo/SEO_IMPLEMENTATION_REPORT.md) — Comprehensive deployment report for search engine optimization.
- [Answer Engine Optimization (AEO) Strategy](docs/seo/AEO_STRATEGY.md) — Direct-answer targeting for featured snippets and PAA blocks.
- [Generative Engine Optimization (GEO) Strategy](docs/seo/GEO_STRATEGY.md) — Knowledge graph optimization for generative AI and LLM citations.
- [Brand & Entity Disambiguation Strategy](docs/seo/ACCERO_ENTITY_STRATEGY.md) — Non-affiliation statutory disclaimers and knowledge graph authority.
- [Topical Authority Semantic Map](docs/seo/TOPICAL_AUTHORITY_MAP.md) — Keyword clusters and URL mapping across citizen document services.
- [Competitor Visibility Gap Analysis](docs/seo/COMPETITOR_VISIBILITY_GAP.md) — Deficit analysis of legacy portals and strategic counter-positioning.
- [Internal Linking & Anchor Text Audit](docs/seo/INTERNAL_LINKING_AUDIT.md) — Hub-and-spoke link architecture and breadcrumb navigation rules.
- [Google Search Console URL Wave Schedule](docs/URL_INSPECTIONS.md) — Staged 4-wave indexing submission and monitoring schedule.
- [Consolidated SEO, GEO & AEO Audit Report](docs/SEO_GEO_AEO_AUDIT_REPORT.md) — Comprehensive audit summary across technical and generative search vectors.

### 6. Competitor Intelligence & Organic Growth
- [90-Day Organic Growth Roadmap](docs/Growth_Roadmap.md) — 90-day acquisition plan targeting CSC operator search capture.
- [SK Print Portal Organic Acquisition Strategy](docs/seo/competitor-intelligence/skprintportal-organic-acquisition.md) — Detailed counter-positioning playbook against legacy portals.
- [Competitor Content Strategy](docs/seo/competitor-intelligence/competitor-content-strategy.md) — Content blueprints capturing competitor branded search volume.
- [Google Ads & High-Intent Keyword Plan](docs/seo/competitor-intelligence/google-ads-keyword-plan.md) — High-converting commercial search keyword inventory.
- [90-Day Tactical Growth Plan](docs/seo/competitor-intelligence/90-day-growth-plan.md) — Staged execution roadmap for operator community acquisition.

### 7. Rural Document Subsystems (Ration Card & Farmer ID)
- [Ration & Farmer ID SEO/AEO/GEO Strategy](docs/seo/ration-farmer/seo-aeo-geo-strategy.md) — Rural search acquisition strategy for state portal terms.
- [Ration & Farmer ID Competitor Intelligence](docs/seo/ration-farmer/competitor-research.md) — Competitive landscape analysis for rural agricultural and PDS services.
- [Ration & Farmer ID Content Roadmap](docs/seo/ration-farmer/content-roadmap.md) — Content production plan targeting state-wise search queries.
- [Ration & Farmer ID Structured Data Audit](docs/seo/ration-farmer/structured-data-audit.md) — Schema.org markup validation for rural document services.

### 8. Progressive Web App (PWA) & Cross-Platform Distribution
- [PWA Architecture & Lifecycle Specification](docs/pwa/architecture.md) — System design, manifest attributes, and push notification roadmap.
- [Cross-Platform Installation Guide](docs/pwa/installation-guide.md) — Step-by-step setup for Windows 10/11, macOS, Android, and iOS/iPadOS.
- [Service Worker & Tiered Caching Policy](docs/pwa/service-worker-and-caching.md) — Caching rules, never-cache guards, and cache invalidation.
- [Cross-Platform Compatibility & Printing Analysis](docs/pwa/cross-platform-compatibility.md) — Hardware printer access, display modes, and OS limitations.
- [PWA Security, Privacy & DPDP Compliance](docs/pwa/security-and-privacy.md) — Zero-trust caching, shared terminal security, and offline defenses.
- [PWA Quality Assurance & Testing Report](docs/pwa/testing-report.md) — Automated Vitest test suite and static build validation.
- [PWA Implementation & Engineering Report](docs/pwa/implementation-report.md) — Complete implementation milestone report and file inventory.

---

## Contribution and Development Guidelines

To maintain architectural stability and high code quality:

1. **TypeScript Strictness:** Strict mode is enforced. Do not introduce `any` types for document payloads; extend existing interfaces in `src/types/cards.ts`.
2. **Component Reusability:** When authoring card templates, wrap layouts in `Cr80CardContainer` (`src/components/cards/Cr80CardContainer.tsx`) to guarantee standard ISO/IEC 7810 ID-1 physical dimensions.
3. **Financial Safety Invariant:** Never modify wallet balances directly. Always invoke `runInTransaction` via `src/actions/wallet.ts` and verify that the balance non-negativity constraint ($Balance \ge 0$) is maintained.
4. **Network Calls:** Never invoke `fetch` directly for third-party document lookups or payment gateways. Always route requests through the centralized network client (`src/lib/network/provider-client.ts`).
5. **Pre-Commit Verification:** Run the full verification suite before committing changes:
   ```bash
   npm test
   npx tsc --noEmit
   npm run build
   ```

---

## License and Ownership

**Copyright © Accero Technologies. All rights reserved.**

This software and its source code are proprietary and confidential. Unauthorized copying, distribution, modification, public display, reverse engineering, or deployment of this software without express written permission from Accero Technologies is strictly prohibited.
