# Accero PrintPortal — Central Documentation Index & Navigation System

**Repository:** `accero_pp` (Accero PrintPortal Next.js)  
**Maintained By:** Core Engineering & Architecture Team  
**Last System Audit:** November 2026  
**Status:** Authoritative Repository Documentation Map  

---

## 1. Documentation Architecture Overview

The Accero PrintPortal documentation system is organized into distinct, modular functional domains. This separation ensures that **living technical specifications**, **operational runbooks**, **marketing/growth playbooks**, and **historical release audit records** remain clearly delineated and easy to maintain.

```
docs/
├── architecture/         # Core system architecture, database design, financial integrity
├── security/             # Threat models, security audits, RBAC matrices, authentication
├── operations/           # Administrative workflows, support desk, external setup guides
├── document-templates/   # CR80 standard specifications, PDS mappings, card printing
├── design/               # Design system tokens, UI components, public route visual audits
├── pwa/                  # Progressive Web App specifications, service workers, testing
├── cloudinary/           # Media storage pipeline, Sharp image processing, asset audits
├── seo/                  # Living organic search, AEO/GEO strategy, content clusters
│   ├── competitor-intelligence/  # Market intelligence, competitor profiles, gap matrices
│   └── ration-farmer/            # Specialized rural document acquisition strategy
├── reports/              # Historical release gates, audit matrices, verification reports
│   ├── phase2/           # Phase 2 completion reports, GSC validations, baseline audits
│   ├── phase3/           # Phase 3/3.1/3.1.2 release checklists, defect closure matrices
│   └── artifacts/        # External benchmark reports, PDF specifications, historical audits
├── DOCUMENTATION_REORGANIZATION_REPORT.md  # Comprehensive repository audit & migration report
└── ENVIRONMENT_VARIABLE_AUDIT.md           # Environment variable audit & security cleanup report
```

---

## 2. Master Navigation Directory

### 2.1 Core Engineering & Architecture (`docs/architecture/`)
| Document | Title | Description | Audience | Status |
| :--- | :--- | :--- | :--- | :--- |
| [`overview.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/architecture/overview.md) | System Architecture Overview | Full-stack architecture, Next.js 15 App Router, React 19, Vercel Serverless, and module interactions. | Developers, Architects | **Living Spec** |
| [`database-migration.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/architecture/database-migration.md) | Database Migration & Index Strategy | MongoDB 8.x schema design, index performance specifications, and automated migration scripts. | Developers, DBAs | **Living Spec** |
| [`financial-integrity.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/architecture/financial-integrity.md) | Financial Integrity & Transaction Architecture | Balance conservation laws, atomic `$inc` updates, Paytm order lifecycles, and refund invariants. | Developers, Finance | **Living Spec** |
| [`production-readiness.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/architecture/production-readiness.md) | Production Readiness & Milestone Tracker | Engineering gate criteria, 72-hour document caching, print billing, and deployment checklists. | DevOps, Leads | **Active Runbook** |

---

### 2.2 Security, RBAC & Privacy (`docs/security/`)
| Document | Title | Description | Audience | Status |
| :--- | :--- | :--- | :--- | :--- |
| [`security-audit.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/security/security-audit.md) | Security Audit & Vulnerability Remediation | P0-P2 vulnerability remediations, CWE tracking, TLS 1.3 enforcement, and DPDPA compliance. | Security, Developers | **Living Spec** |
| [`rbac-matrix.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/security/rbac-matrix.md) | Security, RBAC & Financial Integrity Audit | 5-tier role hierarchy (Super Admin, Finance Admin, Support Agent, Operator, Customer) and permission guards. | Developers, Admins | **Living Spec** |
| [`user-roles-and-login.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/security/user-roles-and-login.md) | User Roles, Authentication & Login Guide | Authentication architecture, Jose JWT session cookies, credential handling, and redirect flows. | Developers, Support | **Active Runbook** |
| [`../ENVIRONMENT_VARIABLE_AUDIT.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/ENVIRONMENT_VARIABLE_AUDIT.md) | Environment Variable Security & Audit Report | Audit of all 40 env variables, credential scrub, and classification matrix. | DevOps, Security | **Verified Report** |

---

### 2.3 Operations & Administration (`docs/operations/`)
| Document | Title | Description | Audience | Status |
| :--- | :--- | :--- | :--- | :--- |
| [`admin-dashboard.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/operations/admin-dashboard.md) | Administrative Operations Architecture | Super Admin console, financial oversight, operator balance adjustments, and promo codes. | Admins, Finance | **Active Runbook** |
| [`support-dashboard.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/operations/support-dashboard.md) | Customer Support Operations Architecture | Tiered ticket management, operator issue resolution, and escalation boundaries. | Support Team | **Active Runbook** |
| [`google-search-console-setup.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/operations/google-search-console-setup.md) | Google Search Console Setup & Verification | Ownership verification, XML sitemap registration, and indexing monitor protocols. | DevOps, Growth | **Active Runbook** |
| [`google-analytics-setup.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/operations/google-analytics-setup.md) | Google Analytics 4 & GTM Setup Guide | GTM web container, GA4 custom dimension mapping, and conversion event contracts. | Growth, Analytics | **Active Runbook** |
| [`fixie-proxy-reference.html`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/operations/fixie-proxy-reference.html) | Fixie Outbound Proxy Architecture | Whitelisted static IP egress routing for external government API providers. | DevOps, Developers | **Reference Asset** |

---

### 2.4 Document Templates & Card Printing (`docs/document-templates/`)
| Document | Title | Description | Audience | Status |
| :--- | :--- | :--- | :--- | :--- |
| [`cr80-standards.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/document-templates/cr80-standards.md) | ISO/IEC 7810 ID-1 (CR80) Standard Spec | Physical dimensions ($85.60\text{ mm} \times 53.98\text{ mm}$), tray offsets, DPI coordinates, and print CSS. | Frontend, Print Tech | **Living Spec** |
| [`ration-card/template-design.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/document-templates/ration-card/template-design.md) | Ration Card Template Design Spec | Layout specifications and color values for state PDS ration card cards. | Designers, Frontend | **Living Spec** |
| [`ration-card/data-mapping.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/document-templates/ration-card/data-mapping.md) | Ration Card Data Mapping Specification | Schema translation from State PDS portals to CR80 template layout. | Developers | **Living Spec** |
| [`ration-card/asset-inventory.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/document-templates/ration-card/asset-inventory.md) | Ration Card Asset Inventory | SVG/PNG assets for national and state emblems, NFSA marks, and barcodes. | Designers | **Active Asset Spec** |
| [`ration-card/reference-audit.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/document-templates/ration-card/reference-audit.md) | Ration Card Reference Audit | Visual analysis of physical ration card formats across Indian states. | Product, QA | **Audit Evidence** |
| [`ration-card/implementation-report.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/document-templates/ration-card/implementation-report.md) | Ration Card Template Implementation Report | Engineering summary for `RationCardCanvas` and print controls. | Developers | **Verified Report** |

---

### 2.5 Progressive Web App (`docs/pwa/`)
| Document | Title | Description | Audience | Status |
| :--- | :--- | :--- | :--- | :--- |
| [`architecture.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/pwa/architecture.md) | PWA Architecture Specification | Manifest configuration, standalone lifecycle, install triggers, and icon suites. | Developers | **Living Spec** |
| [`service-worker-and-caching.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/pwa/service-worker-and-caching.md) | Service Worker & Zero-Trust Caching | App shell caching, static assets, and zero-trust exclusion of private PII endpoints. | Developers, Security | **Living Spec** |
| [`cross-platform-compatibility.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/pwa/cross-platform-compatibility.md) | Cross-Platform Compatibility Guide | Platform-specific install and display behaviors across Windows, macOS, Android, iOS. | Developers, QA | **Living Spec** |
| [`installation-guide.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/pwa/installation-guide.md) | Operator PWA Installation Guide | Step-by-step instructions for installing Accero on desktop and mobile devices. | Operators, Support | **Active Runbook** |
| [`security-and-privacy.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/pwa/security-and-privacy.md) | PWA Security & Privacy Architecture | PII isolation, shared kiosk safety, and cache invalidation policies. | Security, Developers | **Living Spec** |
| [`testing-report.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/pwa/testing-report.md) | PWA Quality Assurance & Testing Report | Test results across Vitest suites, Lighthouse PWA audits, and device verifications. | QA, DevOps | **Verified Report** |
| [`implementation-report.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/pwa/implementation-report.md) | PWA Engineering Implementation Report | Architectural delivery notes, file matrices, and production rollout status. | Engineering Leads | **Verified Report** |

---

### 2.6 Cloudinary Media Architecture (`docs/cloudinary/`)
| Document | Title | Description | Audience | Status |
| :--- | :--- | :--- | :--- | :--- |
| [`architecture.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/cloudinary/architecture.md) | Cloudinary Media Architecture Spec | Sharp image transformation, portrait cropping, signed URLs, and asset lifecycle. | Developers | **Living Spec** |
| [`operations.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/cloudinary/operations.md) | Cloudinary Operations & Runbook | Production credentials, storage quotas, rate limits, and monitoring protocols. | DevOps, Admins | **Active Runbook** |
| [`migration-guide.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/cloudinary/migration-guide.md) | Base64 to Cloudinary Migration Guide | Migration pathway from legacy base64 MongoDB storage to remote CDN assets. | Developers, DBAs | **Active Runbook** |
| [`verification-report.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/cloudinary/verification-report.md) | Cloudinary Pipeline Verification Report | Verification evidence from `tests/cloudinary-full-audit.test.ts` and API checks. | QA, Leads | **Verified Report** |
| [`social.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/cloudinary/social.md) | Social Asset Integration | OpenGraph and Twitter card image delivery via Cloudinary CDN. | Marketing, Growth | **Active Spec** |

---

### 2.7 Design System & Frontend Audits (`docs/design/`)
| Document | Title | Description | Audience | Status |
| :--- | :--- | :--- | :--- | :--- |
| [`design-system.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/design/design-system.md) | Design System & Token Specifications | Brand colors (`brand-navy`, `accent-amber`), typography, buttons, and layout grids. | Frontend, Designers | **Living Spec** |
| [`public-route-audit.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/design/public-route-audit.md) | Public Route Visual & A11y Audit | Responsive UI and accessibility review across 77 public marketing pages. | Frontend, QA | **Audit Evidence** |
| [`public-redesign-report.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/design/public-redesign-report.md) | Public Route Redesign Report | Implementation details for typography pairings, micro-interactions, and visual polish. | Frontend | **Verified Report** |

---

### 2.8 Living SEO, AEO & GEO Strategy (`docs/seo/`)
| Document | Title | Description | Audience | Status |
| :--- | :--- | :--- | :--- | :--- |
| [`seo-strategy.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/seo-strategy.md) | Master SEO & Organic Growth Strategy | Core positioning, keyword targeting, semantic clusters, and crawl budget control. | Growth, Marketing | **Living Strategy** |
| [`aeo-geo-strategy.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/aeo-geo-strategy.md) | Answer & Generative Engine Strategy | Optimization protocols for ChatGPT, Perplexity, Claude, Gemini, and Google SGE. | Growth, Marketing | **Living Strategy** |
| [`entity-identity.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/entity-identity.md) | Entity Identity & Knowledge Graph | Schema.org entity definitions, brand signals, and statutory disclaimer compliance. | Growth, Legal | **Living Spec** |
| [`structured-data.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/structured-data.md) | Structured Data & Schema Markup Spec | JSON-LD schema definitions (`SoftwareApplication`, `Organization`, `FAQPage`, etc.). | Developers, Growth | **Living Spec** |
| [`technical-seo.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/technical-seo.md) | Technical SEO Implementation Spec | Canonical generation, dynamic sitemaps, robots.txt, and metadata factories. | Developers | **Living Spec** |
| [`internal-linking.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/internal-linking.md) | Internal Linking Architecture | Hub-and-spoke link graph, PageRank distribution, and anchor text governance. | Growth, Content | **Living Strategy** |
| [`topical-authority-map.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/topical-authority-map.md) | Topical Authority Map & Clustering | Core semantic clusters and URL mapping across Indian document services. | Growth, Content | **Living Strategy** |
| [`content-strategy.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/content-strategy.md) | Competitor-Driven Content Strategy | Content pillar specifications, comparison pages, and competitor interception frameworks. | Content, Marketing | **Living Strategy** |
| [`conversion-optimization.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/conversion-optimization.md) | Conversion Rate Optimization (CRO) | Funnel optimization, user activation touchpoints, and analytics telemetry. | Growth, Product | **Living Strategy** |
| [`backlink-strategy.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/backlink-strategy.md) | White-Hat Backlink & Digital PR Strategy | High-authority backlink acquisition, industry directories, and digital PR. | Marketing | **Living Strategy** |
| [`content-calendar.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/content-calendar.md) | 90-Day Editorial Content Calendar | Multi-week release schedule for guides, comparisons, and blog pillars. | Content Team | **Active Plan** |
| [`ai-visibility-tracker.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/ai-visibility-tracker.md) | AI Search Visibility Tracker | Systematic monitoring protocol for AI search engines (Perplexity, ChatGPT, Copilot). | Growth | **Active Protocol** |

#### Subsystem: Competitor Intelligence (`docs/seo/competitor-intelligence/`)
- Contains 25 dedicated files covering competitive feature matrices, keyword clusters, brand profiles, and paid/organic intercept strategies:
  - [`competitor-analysis.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/competitor-intelligence/competitor-analysis.md)
  - [`competitor-feature-matrix.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/competitor-intelligence/competitor-feature-matrix.md)
  - [`competitor-keyword-gap.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/competitor-intelligence/competitor-keyword-gap.md)
  - [`competitive-positioning.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/competitor-intelligence/competitive-positioning.md)
  - [`90-day-growth-roadmap.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/seo/competitor-intelligence/90-day-growth-roadmap.md)
  - Complete keyword inventories and comparison page content audits.

#### Subsystem: Ration Card & Farmer ID SEO (`docs/seo/ration-farmer/`)
- Contains 9 targeted strategic documents for dominating rural CSC search intent:
  - Rural keyword clusters, state PDS search intent maps, and structured data audits.

---

### 2.9 Historical Reports, Audits & Release Gates (`docs/reports/`)

#### Phase 2 Historical Reports (`docs/reports/phase2/`)
- [`seo-phase2-completion.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/reports/phase2/seo-phase2-completion.md) — Technical audit reconciliation and completion sign-off.
- [`seo-growth-report.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/reports/phase2/seo-growth-report.md) — Production architecture and route verification evidence.
- [`seo-performance-report.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/reports/phase2/seo-performance-report.md) — Before/after performance benchmarks and static pre-rendering metrics.
- [`public-route-indexing-audit.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/reports/phase2/public-route-indexing-audit.md) — Complete 77-route indexing and canonical audit.
- [`organic-conversion-report.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/reports/phase2/organic-conversion-report.md) — 8-stage operator activation funnel attribution.
- [`seo-deployment-checklist.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/reports/phase2/seo-deployment-checklist.md) — Pre-deployment verification gate.
- [`search-console-report-template.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/reports/phase2/search-console-report-template.md) — GSC reporting templates.
- [`seo-master-audit.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/reports/phase2/seo-master-audit.md) — Early-stage comprehensive baseline audit.
- [`seo-geo-aeo-audit-report.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/reports/phase2/seo-geo-aeo-audit-report.md) — Second-stage multi-engine audit.
- [`url-inspections.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/reports/phase2/url-inspections.md) — Live GSC URL inspection evidence.
- [`seo-baseline-audit.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/reports/phase2/seo-baseline-audit.md) — Route-by-route audit baseline.
- [`seo-implementation-report.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/reports/phase2/seo-implementation-report.md) — Engineering milestone delivery notes.
- [`production-seo-verification.md`](file:///Users/faisal/Documents/GitHub/accero_pp/docs/reports/phase2/production-seo-verification.md) — Production sitemap, robots, and edge verification.

#### Phase 3 / 3.1 / 3.1.2 / 3.1.2.1 Audit & Validation Matrix (`docs/reports/phase3/`)
- Contains 33 release reports, defect closure matrices, PII adversarial test records, and financial idempotency validations across Phase 3 milestones:
  - `phase3-executive-summary.md`
  - `phase3-growth-strategy.md`
  - `phase31-executive-summary.md`
  - `phase31-implementation-report.md`
  - `phase31-cro-audit.md`
  - `phase31-ga4-audit.md`
  - `phase31-gsc-reconciliation.md`
  - `phase31-internal-linking-audit.md`
  - `phase31-keyword-validation.md`
  - `phase31-privacy-claims-audit.md`
  - `phase31-technical-regression-audit.md`
  - `phase31-backlink-execution-plan.md`
  - `phase31-competitor-evidence-audit.md`
  - `phase31-content-briefs.md`
  - `phase31-conversion-funnel.md`
  - `phase312-defect-closure-matrix.md`
  - `phase312-final-release-checklist.md`
  - `phase312-ga4-event-contract.md`
  - `phase312-implementation-report.md`
  - `phase312-privacy-implementation.md`
  - `phase3121-payment-idempotency-report.md`
  - `phase3121-pii-security-report.md`
  - `phase3121-production-release-checklist.md`
  - `phase3121-security-claims-verification.md`
  - `phase3121-staging-release-matrix.md`
  - `phase3121-staging-validation-report.md`
  - `second-stage-verification.md`
  - `indexing-investigation.md`
  - `indexing-remediation-plan.md`
  - `indexing-technical-findings.md`
  - Associated validated baseline and audit CSVs.

#### Historical Benchmark Artifacts (`docs/reports/artifacts/`)
- `pagespeed-insights.html` — Full HTML performance report.
- `accero-pvc-card-printing-gateway-spec.pdf` — Original card gateway PDF specification.
- `growth-roadmap.md` — Early conceptual growth notes.
- `documentation-audit-initial.md` — Initial documentation gap analysis.

---

## 3. Documentation Standards & Contribution Rules

To maintain long-term repository hygiene, contributors must adhere to these documentation standards:

### 3.1 File Naming Conventions
- Always use **lowercase kebab-case** for documentation files: `example-feature-spec.md`.
- Never use spaces, uppercase characters, or mixed snake/camel casing in filenames.
- Group documentation by functional domain into existing directories. Avoid creating single-file directories.

### 3.2 Document Lifecycle Statuses
Every document must specify one of the following lifecycle statuses in its header:
- **Living Spec:** Authoritative technical specification describing current, active system implementation.
- **Active Runbook:** Operational procedure or step-by-step guide used for ongoing operations.
- **Active Plan / Strategy:** Strategic roadmap or calendar guiding future releases.
- **Verified Report:** Historical record of completed testing, audits, or engineering delivery.
- **Historical Audit / Gate:** Permanent audit record of a past milestone or staging release.
- **Archived:** Preserved for historical context; superseded by newer documentation.

### 3.3 Standard Markdown Document Template

```markdown
# [Document Title]

**Author:** [Author / Team Name]  
**Status:** [Living Spec | Active Runbook | Verified Report | Historical Audit]  
**Last Updated:** [Month Year]  
**Related Specs:** [[Link to Spec 1](file:///path/to/spec.md)]  

---

## 1. Executive Summary & Purpose
[Concise summary of what this document covers and why it exists.]

## 2. Technical Architecture / Implementation
[Core technical details, diagrams, code references, schemas, or mathematical invariants.]

## 3. Operational Protocols / Workflows
[Step-by-step actions, commands, or execution details.]

## 4. Verification & Testing
[Evidence of automated tests, manual testing, or acceptance criteria.]

## 5. Cross-References
[Links to related code files, models, and documentation.]
```
