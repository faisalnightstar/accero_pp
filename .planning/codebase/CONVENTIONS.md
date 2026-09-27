# Coding Conventions

**Analysis Date:** 2026-09-28

## Existing Legacy Style & Conventions

### 1. PHP Architecture & Formatting
- **Procedural Scripting:** Most features in `printportal/admin/` are standalone scripts with top-level procedural code, direct `$_POST` / `$_GET` global access, and embedded HTML markup.
- **Variable Scoping:** Variables defined in included files (e.g. `$connection`, `$rw`, `$serviceFee` from `userHeader.php`) implicitly populate global scope in consuming scripts.
- **Database Access:** Direct `mysqli_query` and string concatenation, with occasional `mysqli_real_escape_string` or `mysqli_prepare`.
- **Modern PHP Standards (`printportal/newportal/`):**
  - Strict typing enabled (`declare(strict_types=1);`).
  - Class-based service layer with dependency injection.
  - JSON API responses structured via static helper `Http::success($data, $statusCode)`.

### 2. Frontend & Styling Conventions
- **Palette Standard (from `printportal/design.md`):**
  - Deep Burgundy: `#8B1E2D` (Primary Brand / Header Gradient Start)
  - Crimson Red: `#E63946` (Secondary Brand / Highlight / Alert)
  - Warm Gold: `#F4D35E` (Focus Accent / Highlight Border)
  - Steel Blue: `#457B9D` (Action Button / Focus Ring)
  - Dark Navy: `#1D3557` (Typography / Dark Accent)
  - Light Slate: `#F0F4F8` (Page Background)
  - Clean White: `#FFFFFF` (Card Surface)
- **Typography:** Google Fonts (`Hind`, `Roboto`, `Open Sans`) imported in headers for regional language rendering (Devanagari script support).
- **CSS Card Measurement:** Fixed-pixel containers (`width: 320px`, `height: 500px` or proportional standard CR80 credit card aspect ratio ~ 85.6mm x 53.98mm) designed to fit ID card trays and PVC printers.
- **Print Directives:** `@media print` rules hiding navigation, headers, and backgrounds to ensure clean card output.

### 3. Error Handling & Validation
- **Client Side:** Form submission validation with jQuery/JavaScript alert dialogs or SweetAlert (`Swal.fire({ title: 'Low Balance', ... })`).
- **Server Side:** Variable error suppression (`error_reporting(0)`) in production print endpoints to avoid corrupting image or JSON outputs; `ini_set('display_errors', 1)` in dev scripts.

---

## Target Standards for Next.js & TypeScript Migration

### Code Formatting & Quality
- **TypeScript:** Strict mode enabled (`strict: true` in `tsconfig.json`). No `any` types for document payloads; define strict interfaces for `PanCardData`, `AadhaarCardData`, `VoterCardData`, `DlCardData`, `RcCardData`.
- **Naming Conventions:**
  - `kebab-case` for file and directory names (e.g., `src/components/card-renderer/pan-card.tsx`).
  - `PascalCase` for React components and TypeScript types/interfaces (`PanCard`, `DocumentFormProps`).
  - `camelCase` for functions, hooks, and variables (`fetchVoterDetails`, `useWallet`).
  - `UPPER_SNAKE_CASE` for environment variables and configuration constants (`MONGODB_URI`, `NEO_API_KEY`).
- **State Management:** React hooks (`useState`, `useReducer`, `useOptimistic`) for form editing and dynamic card synchronization.
- **Validation:** Zod schemas for all API payloads and form fields (validating 10-character PAN format, 12-digit Aadhaar format, EPIC format, DL number, vehicle RC number).
- **SEO & Metadata:**
  - Next.js dynamic metadata (`generateMetadata`) on every route.
  - JSON-LD schemas (`Organization`, `WebApplication`, `BreadcrumbList`, `FAQPage`).

---

*Conventions analysis: 2026-09-28*
*Prepared for Next.js & MongoDB migration*
