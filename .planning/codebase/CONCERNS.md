# Codebase Concerns

**Analysis Date:** 2026-09-28

## Technical Debt & Architectural Gaps

### 1. Incomplete Data Handling on API Fetch
- **Issue:** External government lookup APIs (NeoAPI, AxenAPI, NSDL) frequently return partial records (e.g. missing father's name, missing regional language translation, low-resolution/missing photo, or truncated address).
- **Files Affected:** `printportal/admin/voter_new_print.php`, `printportal/admin/Pan_Advance_Axen2.php`, `printportal/admin/DLFind_Axen.php`.
- **Current Behavior:** The legacy code either writes `null` / empty strings directly to the database or fails the transaction entirely. If saved with missing fields, the card prints with awkward blanks or misaligned text.
- **Migration Fix:** Build an interactive **Data Review & Edit Gateway** in Next.js. When API data arrives:
  1. Detect all missing or incomplete fields required by the card template.
  2. Populate editable form inputs with existing data and visually flag missing fields with warning indicators.
  3. Allow the user to upload missing photos, type missing names/dates, and preview the preformatted card live before committing and saving to MongoDB.

### 2. Monolithic Legacy PHP Files
- **Issue:** Each document type has 3–5 separate, duplicated PHP files for manual entry, API search, list display, edit, and print (e.g., `aadharmanuallist.php`, `aadharmanualnew.php`, `aadharadv1.php`, `aadhar_info_hkb.php`, `aadhar.php`).
- **Impact:** Any change to card layouts or verification keys requires editing dozens of independent scripts.
- **Migration Fix:** Consolidate into modular Next.js components (`CardForm`, `CardCanvas`, `DocumentList`) parameterized by document type (`pan | aadhaar | voter | dl | rc`).

## Security Vulnerabilities & Exposure

### 1. Hardcoded Credentials & API Keys
- **Issue:** Live database credentials, database hosts, and external third-party API keys are committed directly into tracked code files.
- **Files Affected:**
  - `printportal/config.php` (contains live Hostinger database user and password)
  - `printportal/admin/Pan_Advance_Axen2.php` (contains API key)
  - `printportal/admin/voter_new_print.php` (contains NeoAPI key)
  - `printportal/admin/DLFind_Axen.php` (contains AxenAPI key)
- **Immediate Action:** Keep planning documents sanitized of secrets; configure `.env.local` for the upcoming Next.js application and add `.env*` to `.gitignore`.

### 2. SQL Injection & Direct Input Interpolation
- **Issue:** Direct concatenation of `$_GET` and `$_POST` variables into SQL queries (e.g. `mysqli_query($connection, "select * from voterauto where id=".$sid."")`).
- **Impact:** High vulnerability to SQL injection and data breach on legacy endpoints.
- **Migration Fix:** Use MongoDB with Mongoose and schema-level validation, eliminating raw string query concatenation.

### 3. Cross-Site Scripting (XSS) & Unsanitized Outputs
- **Issue:** User-supplied names, addresses, and transaction remarks rendered directly into HTML attributes and JavaScript `alert()` / `Swal.fire()` function calls without proper escaping.
- **Migration Fix:** React's automatic JSX escaping combined with strict input sanitization.

## Performance, Print Precision & Fragility

### 1. CSS Absolute Positioning Fragility on Print
- **Issue:** Cards rely on hardcoded pixel offsets (`top: 140px; left: 220px;`) on top of static raster images. Slight browser font variations or zooming misaligns text relative to printed card boundaries.
- **Migration Fix:** Use high-DPI SVG overlays or CSS Grid/Flexbox with standard physical print units (`mm` / `pt` matching ISO/IEC 7810 ID-1 / CR80 85.60 mm × 53.98 mm) and print-specific CSS rules `@page { size: 85.6mm 53.98mm; margin: 0; }`.

### 2. Blocking Network Requests & Infinite Timeouts
- **Issue:** Several cURL routines use `CURLOPT_TIMEOUT => 0`, which can freeze PHP worker threads if government servers become unresponsive.
- **Migration Fix:** Next.js Route Handlers with `AbortController` and strict 8–10 second timeouts, paired with clear user-facing error fallbacks.

## SEO, GEO, AEO & Search Ranking Gaps

### 1. Zero Search Engine Visibility
- **Current State:** The legacy application is entirely behind authentication or rendered as dynamic PHP scripts with generic title tags (`<title>PDF</title>`, `<title>AdminLTE</title>`). Search engines cannot index features or localized search queries.
- **Target Optimization for Next.js on Vercel:**
  - **SEO (Search Engine Optimization):** High-speed Server-Side Rendered (SSR) public landing pages for each service ("Instant PAN Card Print", "Online PVC Voter Card Format", etc.), with dynamic meta tags, canonical URLs, and sitemaps.
  - **GEO (Geographic Targeting):** Regional state and district landing pages targeting localized search intent across India (e.g. voter card reprint in Bihar, UP, Maharashtra, etc.).
  - **AEO (Answer Engine Optimization):** Structured JSON-LD schemas (`FAQPage`, `HowTo`, `SoftwareApplication`) engineered for Google AI Overviews, Perplexity, and featured snippets.
  - **Vercel Edge Network:** Sub-100ms TTFB across regional Indian edge nodes for top Core Web Vitals rankings.

---

*Concerns analysis: 2026-09-28*
*Prepared for Next.js & MongoDB migration*
