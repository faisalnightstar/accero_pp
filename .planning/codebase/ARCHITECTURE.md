# Architecture

**Analysis Date:** 2026-09-28

## Pattern Overview

**Current Pattern:** Hybrid Legacy Procedural PHP with Embedded Views and Partial Modular Refactor.
- **Legacy Admin (`printportal/admin/`):** Page-controller pattern where individual `.php` scripts handle authentication guards, wallet balance checks, third-party API cURL requests, database queries, and HTML view rendering in single files.
- **New Portal Prototype (`printportal/newportal/`):** Front-controller and service-oriented pattern with centralized bootstrap (`app/bootstrap.php`), HTTP request routing (`Http::route()`), token-based authentication, and service catalogues.

**Key Characteristics:**
- **Synchronous Execution:** External government API queries and scraping run synchronously during HTTP requests.
- **Physical Card Reproduction:** Direct pixel-positioned CSS overlays on top of pre-rendered card templates (JPEG/PNG backgrounds) formatted for instant physical card printing (`@media print`).
- **Transactional Wallet Accounting:** Per-card print deductions from user balances.

## Layers

### 1. Presentation & Print Layer
- **Purpose:** Render dashboard UI and pixel-perfect printable PVC cards (CR80 card standard).
- **Contains:**
  - Responsive dashboards using AdminLTE 3 / Bootstrap 4.
  - Form interfaces for manual data entry and ID lookups.
  - Print preview templates (`printportal/admin/aadhar/aadhar.php`, `printportal/admin/voter/voter.php`, `printportal/admin/Pan_Advance_Axen2.php`, `printportal/admin/rc_get_chip_print_new.php`).
  - Specialized card CSS files (`Pan_Advance_Axen2.css`, `dlprint-form.css`, `dlmlist.css`, `aadhar.css`).
- **Dependencies:** Google Fonts (Hind, Roboto, Open Sans), FontAwesome, SweetAlert2.

### 2. Controller & Request Handling Layer
- **Purpose:** Validate user input, check route guards and sessions, orchestrate API calls.
- **Contains:**
  - Route guards (`route_guard.php`, `session.php`).
  - Request dispatchers (`printportal/newportal/api/index.php`, `printportal/admin/api.php`).
  - Action scripts for PDF generation and downloading (`action_rc_pdf.php`, `action_DL_Instant_pdf.php`).

### 3. Integration & Third-Party Service Layer
- **Purpose:** Communicate with external data providers and verification services.
- **Contains:**
  - cURL wrappers communicating with NeoAPI, AxenAPI, and FastNexora.
  - Cookie and captcha solvers for government verification portals.
  - QR Code generation engines (`phpqrcode`).

### 4. Data Access Layer
- **Purpose:** Persist user accounts, card records, wallet ledger, and portal settings.
- **Contains:**
  - Direct MySQL queries (`mysqli_query`, `mysqli_prepare`).
  - Database schema tables (`users`, `voterauto`, `aadharauto`, `panauto`, `dlprint`, `rc_vehical`, `wallet`).

## Data Flow

### ID Number Lookup & Card Print Flow

```
[User Browser]
       │
       ▼  1. Submits ID Number (e.g. PAN, EPIC, Aadhaar, DL, RC)
[Route Guard & Wallet Check]
       │  2. Validates session and checks if wallet balance >= service fee
       ├── (Insufficient) ──► Displays SweetAlert recharge prompt
       │
       ▼  3. (Sufficient) Dispatches cURL to Third-Party API (NeoAPI/AxenAPI)
[External Verification API]
       │
       ▼  4. Returns demographic data payload & photo URL/Base64
[Database Insertion]
       │  5. Writes record to MySQL and debits wallet balance
       │
       ▼  6. Redirects to Print Preview Page
[Print Card Preview]
       │  7. Merges demographic text, photo, and generated QR code over card template
       ▼  8. User prints or exports PDF via browser print dialog
```

### Manual Data Entry Flow (Fallback & Direct)

```
[User Browser]
       │
       ▼  1. Fills form (Name, Father's Name, DOB, Address, Photo upload, Signature)
[Form Validation]
       │  2. Validates fields and processes image uploads (Dropify / multipart)
       ▼  3. Deducts manual print fee and saves to manual tables (`aadharmanual`, etc.)
[Card Generator]
       ▼  4. Dynamically renders front and back card layouts with custom fonts
```

## Migration Target Architecture (Next.js & MongoDB)

The target architecture replaces this legacy structure with a modern, reactive, and scalable stack:

1. **Next.js App Router (Full-Stack React 19):**
   - **Frontend:** Server Components for ultra-fast initial load and SEO indexability; Client Components for interactive form editing and live card preview.
   - **Backend:** Next.js Route Handlers (`src/app/api/...`) and Server Actions for secure, server-side data operations.
2. **MongoDB with Mongoose:**
   - Flexible document schema that naturally accommodates variable document fields (handling missing fields seamlessly).
3. **Interactive Pre-Formatted Card Previewer:**
   - Real-time side-by-side view: Edit form on the left, live visual card canvas on the right.
   - Missing fields highlighted in the editor; updating a missing field updates the card canvas immediately.
   - Clean export to PDF / High-res SVG / CSS Print.
4. **SEO, GEO, AEO Optimization:**
   - Server-Side Rendered landing pages, structured data (JSON-LD), localized metadata for cities/states (GEO), and answer engine optimization (AEO) FAQs.

---

*Architecture analysis: 2026-09-28*
*Prepared for Next.js & MongoDB migration*
