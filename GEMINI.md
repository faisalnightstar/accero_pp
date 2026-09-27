<!-- GSD:project-start source:PROJECT.md -->
## Project

**PrintPortal Next.js (Document Print & Verification Gateway)**

PrintPortal Next.js is a high-performance web portal built with Next.js (App Router) and MongoDB, engineered for deployment on Vercel. It enables users to quickly format and print official-standard preformatted PVC cards (PAN, Aadhaar, Voter ID, Driving License, and Vehicle RC) via automatic card number lookup or manual data entry. It provides a real-time split-screen interactive editor that flags missing fields returned by external APIs, allowing users to update and complete the data before rendering and printing pixel-perfect cards.

**Core Value:** Effortless, pixel-perfect card printing with zero missing-data failures — allowing users to seamlessly review, edit, and fill missing fields in real-time on preformatted card canvases.

### Constraints

- **Tech Stack**: Next.js App Router (TypeScript), MongoDB (Mongoose), Vanilla CSS / Tailwind for custom design system, deployed on Vercel.
- **Card Precision**: Output must conform to ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm) for seamless physical card tray printing.
- **API Reliability**: External government lookup endpoints are prone to latency and intermittent downtimes; system must never block or crash on partial data.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- PHP 7.4+ / 8.x - Server-side rendering, API requests (cURL), database interaction, and business logic across legacy (`printportal/admin/`) and modernized backend (`printportal/newportal/`).
- HTML5 / CSS3 - Document presentation, custom card print styling (`@media print`), absolute layout coordinates for PAN/Aadhaar/Voter/DL/RC cards.
- JavaScript (ES5/ES6) - jQuery 3.6+, SweetAlert / SweetAlert2, Dropify, client-side validation, and dynamic DOM manipulation.
- SQL (MySQL/MariaDB dialect) - Relational schema migrations and persistent records (`printportal/newportal/FastNexora-PrintPortal.sql`).
- Markdown - System design notes and module documentation (`printportal/design.md`).
## Runtime
- Apache / Nginx with PHP-FPM (currently configured for Hostinger cloud hosting `srv1988.hstgr.io`).
- Browser execution for print generation via CSS print stylesheets and `window.print()`.
- npm (AdminLTE asset pipeline in `printportal/admin/package.json` with Gulp/Rollup legacy build scripts).
- Composer (`printportal/admin/composer.json` referencing AdminLTE 3.1.0 distribution).
## Frameworks & UI Tooling
- Legacy Procedural PHP (`printportal/admin/`) - Individual PHP script endpoints per card/service.
- AdminLTE 3.1.0 - Admin dashboard theme based on Bootstrap 4.6.0.
- Custom Light Framework (`printportal/newportal/app/`) - Modular PHP architecture with `bootstrap.php`, router helper `Http::route()`, auth services, and rate limiters.
- Bootstrap 4.6.0 / Bootstrap 5 (in partial refactors).
- FontAwesome 5.15.3 for UI icons.
- SweetAlert & SweetAlert2 for user alerts and confirmations.
- Dropify for drag-and-drop file uploads (photographs and signatures).
- Browser-native HTML/CSS Print formatting (`window.print()` targeting high-resolution card templates).
- `phpqrcode` library for dynamic QR code generation embedded on cards.
- `simple_html_dom.php` for web scraping and HTML extraction.
## Key Dependencies
- `mysqli` extension - Direct MySQL database connections.
- `curl` extension - Synchronous external verification requests to government portals and third-party data providers.
- `phpqrcode` (`printportal/admin/aadhar/phpqrcode/`) - Generates inline Aadhaar, Voter, and PAN QR codes.
- `SweetAlert2` - Modal dialogues for wallet deduction warnings and errors.
- Hostinger Cloud Database (`srv1988.hstgr.io` running MySQL).
- Static card background assets (JPEG/PNG templates for PAN, Aadhaar, Voter, DL, RC).
## Configuration
- Direct PHP configuration scripts:
- Hardcoded API credentials inside service files (e.g. `NEO_API_KEY`, `api_hkb`, `fastnexora` API keys).
- `u859332932_nprintportalDB` on Hostinger.
## Platform Requirements & Migration Target
- LAMP/LEMP stack on shared or VPS hosting (Hostinger).
- Synchronous PHP execution with cURL blocks.
- **Framework:** Next.js (App Router, React 19 / TypeScript).
- **Deployment:** Vercel (Edge & Serverless execution).
- **Database:** MongoDB (via Mongoose / MongoDB Node driver).
- **SEO/GEO/AEO:** Semantic HTML, JSON-LD structured data, dynamic OpenGraph/Twitter cards, metadata API, fast Core Web Vitals for localized search dominance.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Existing Legacy Style & Conventions
### 1. PHP Architecture & Formatting
- **Procedural Scripting:** Most features in `printportal/admin/` are standalone scripts with top-level procedural code, direct `$_POST` / `$_GET` global access, and embedded HTML markup.
- **Variable Scoping:** Variables defined in included files (e.g. `$connection`, `$rw`, `$serviceFee` from `userHeader.php`) implicitly populate global scope in consuming scripts.
- **Database Access:** Direct `mysqli_query` and string concatenation, with occasional `mysqli_real_escape_string` or `mysqli_prepare`.
- **Modern PHP Standards (`printportal/newportal/`):**
### 2. Frontend & Styling Conventions
- **Palette Standard (from `printportal/design.md`):**
- **Typography:** Google Fonts (`Hind`, `Roboto`, `Open Sans`) imported in headers for regional language rendering (Devanagari script support).
- **CSS Card Measurement:** Fixed-pixel containers (`width: 320px`, `height: 500px` or proportional standard CR80 credit card aspect ratio ~ 85.6mm x 53.98mm) designed to fit ID card trays and PVC printers.
- **Print Directives:** `@media print` rules hiding navigation, headers, and backgrounds to ensure clean card output.
### 3. Error Handling & Validation
- **Client Side:** Form submission validation with jQuery/JavaScript alert dialogs or SweetAlert (`Swal.fire({ title: 'Low Balance', ... })`).
- **Server Side:** Variable error suppression (`error_reporting(0)`) in production print endpoints to avoid corrupting image or JSON outputs; `ini_set('display_errors', 1)` in dev scripts.
## Target Standards for Next.js & TypeScript Migration
### Code Formatting & Quality
- **TypeScript:** Strict mode enabled (`strict: true` in `tsconfig.json`). No `any` types for document payloads; define strict interfaces for `PanCardData`, `AadhaarCardData`, `VoterCardData`, `DlCardData`, `RcCardData`.
- **Naming Conventions:**
- **State Management:** React hooks (`useState`, `useReducer`, `useOptimistic`) for form editing and dynamic card synchronization.
- **Validation:** Zod schemas for all API payloads and form fields (validating 10-character PAN format, 12-digit Aadhaar format, EPIC format, DL number, vehicle RC number).
- **SEO & Metadata:**
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- **Legacy Admin (`printportal/admin/`):** Page-controller pattern where individual `.php` scripts handle authentication guards, wallet balance checks, third-party API cURL requests, database queries, and HTML view rendering in single files.
- **New Portal Prototype (`printportal/newportal/`):** Front-controller and service-oriented pattern with centralized bootstrap (`app/bootstrap.php`), HTTP request routing (`Http::route()`), token-based authentication, and service catalogues.
- **Synchronous Execution:** External government API queries and scraping run synchronously during HTTP requests.
- **Physical Card Reproduction:** Direct pixel-positioned CSS overlays on top of pre-rendered card templates (JPEG/PNG backgrounds) formatted for instant physical card printing (`@media print`).
- **Transactional Wallet Accounting:** Per-card print deductions from user balances.
## Layers
### 1. Presentation & Print Layer
- **Purpose:** Render dashboard UI and pixel-perfect printable PVC cards (CR80 card standard).
- **Contains:**
- **Dependencies:** Google Fonts (Hind, Roboto, Open Sans), FontAwesome, SweetAlert2.
### 2. Controller & Request Handling Layer
- **Purpose:** Validate user input, check route guards and sessions, orchestrate API calls.
- **Contains:**
### 3. Integration & Third-Party Service Layer
- **Purpose:** Communicate with external data providers and verification services.
- **Contains:**
### 4. Data Access Layer
- **Purpose:** Persist user accounts, card records, wallet ledger, and portal settings.
- **Contains:**
## Data Flow
### ID Number Lookup & Card Print Flow
```
```
### Manual Data Entry Flow (Fallback & Direct)
```
```
## Migration Target Architecture (Next.js & MongoDB)
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.agent/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
