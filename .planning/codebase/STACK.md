# Technology Stack

**Analysis Date:** 2026-09-28

## Languages

**Primary:**
- PHP 7.4+ / 8.x - Server-side rendering, API requests (cURL), database interaction, and business logic across legacy (`printportal/admin/`) and modernized backend (`printportal/newportal/`).
- HTML5 / CSS3 - Document presentation, custom card print styling (`@media print`), absolute layout coordinates for PAN/Aadhaar/Voter/DL/RC cards.
- JavaScript (ES5/ES6) - jQuery 3.6+, SweetAlert / SweetAlert2, Dropify, client-side validation, and dynamic DOM manipulation.

**Secondary:**
- SQL (MySQL/MariaDB dialect) - Relational schema migrations and persistent records (`printportal/newportal/FastNexora-PrintPortal.sql`).
- Markdown - System design notes and module documentation (`printportal/design.md`).

## Runtime

**Environment:**
- Apache / Nginx with PHP-FPM (currently configured for Hostinger cloud hosting `srv1988.hstgr.io`).
- Browser execution for print generation via CSS print stylesheets and `window.print()`.

**Package Managers & Dependencies:**
- npm (AdminLTE asset pipeline in `printportal/admin/package.json` with Gulp/Rollup legacy build scripts).
- Composer (`printportal/admin/composer.json` referencing AdminLTE 3.1.0 distribution).

## Frameworks & UI Tooling

**Core:**
- Legacy Procedural PHP (`printportal/admin/`) - Individual PHP script endpoints per card/service.
- AdminLTE 3.1.0 - Admin dashboard theme based on Bootstrap 4.6.0.
- Custom Light Framework (`printportal/newportal/app/`) - Modular PHP architecture with `bootstrap.php`, router helper `Http::route()`, auth services, and rate limiters.

**UI Libraries:**
- Bootstrap 4.6.0 / Bootstrap 5 (in partial refactors).
- FontAwesome 5.15.3 for UI icons.
- SweetAlert & SweetAlert2 for user alerts and confirmations.
- Dropify for drag-and-drop file uploads (photographs and signatures).

**Print & PDF Generation:**
- Browser-native HTML/CSS Print formatting (`window.print()` targeting high-resolution card templates).
- `phpqrcode` library for dynamic QR code generation embedded on cards.
- `simple_html_dom.php` for web scraping and HTML extraction.

## Key Dependencies

**Critical:**
- `mysqli` extension - Direct MySQL database connections.
- `curl` extension - Synchronous external verification requests to government portals and third-party data providers.
- `phpqrcode` (`printportal/admin/aadhar/phpqrcode/`) - Generates inline Aadhaar, Voter, and PAN QR codes.
- `SweetAlert2` - Modal dialogues for wallet deduction warnings and errors.

**Infrastructure:**
- Hostinger Cloud Database (`srv1988.hstgr.io` running MySQL).
- Static card background assets (JPEG/PNG templates for PAN, Aadhaar, Voter, DL, RC).

## Configuration

**Environment:**
- Direct PHP configuration scripts:
  - `printportal/config.php` - Root database connection credentials.
  - `printportal/admin/config.php` - Admin area DB connection.
  - `printportal/newportal/config.php` - Structured app settings.
- Hardcoded API credentials inside service files (e.g. `NEO_API_KEY`, `api_hkb`, `fastnexora` API keys).

**Database:**
- `u859332932_nprintportalDB` on Hostinger.

## Platform Requirements & Migration Target

**Current:**
- LAMP/LEMP stack on shared or VPS hosting (Hostinger).
- Synchronous PHP execution with cURL blocks.

**Target Migration Architecture:**
- **Framework:** Next.js (App Router, React 19 / TypeScript).
- **Deployment:** Vercel (Edge & Serverless execution).
- **Database:** MongoDB (via Mongoose / MongoDB Node driver).
- **SEO/GEO/AEO:** Semantic HTML, JSON-LD structured data, dynamic OpenGraph/Twitter cards, metadata API, fast Core Web Vitals for localized search dominance.

---

*Stack analysis: 2026-09-28*
*Prepared for Next.js & MongoDB migration*
