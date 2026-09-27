# Testing Patterns

**Analysis Date:** 2026-09-28

## Current Testing Posture (Legacy Codebase)

### 1. Automated Testing Status
- **Unit / Integration Tests:** None present in the legacy PHP codebase (no PHPUnit, Pest, or Jest suites configured).
- **Manual Verification Directory:**
  - `printportal/API_TESTING/` contains ad-hoc test PHP scripts to verify cURL payloads against external third-party endpoints.
  - `printportal/NEOAPI TESTING/` contains diagnostic screenshots capturing API responses from NeoAPI (status codes, JSON structures for Voter and PAN data).
- **Linting & Asset Checks:**
  - `printportal/admin/package.json` contains scripts for `eslint`, `stylelint`, and `lockfile-lint` specifically tailored for AdminLTE assets.

### 2. Manual Test Procedures Currently Practiced
- **Wallet Deduction Test:** Recharging an account, triggering a card print request, and verifying that the MySQL balance column decreases by the configured service fee.
- **Visual Card Inspection:** Opening print preview in browser (Chrome/Edge/Firefox) and executing Print Preview (`Ctrl+P` / `Cmd+P`) to visually inspect margins, font sizes, QR code legibility, and image alignment on photo boxes.
- **API Error Simulation:** Providing invalid card numbers to observe SweetAlert error prompts and verify fallback redirection.

---

## Target Testing Framework for Next.js Migration

### 1. Test Framework Selection
- **Unit & Component Testing:**
  - **Runner:** Vitest with React Testing Library.
  - **Focus:**
    - Form validation logic (Zod schemas for PAN regex `[A-Z]{5}[0-9]{4}[A-Z]`, Aadhaar `\d{12}`, EPIC `[A-Z]{3}\d{7}`).
    - Dynamic field update sync: verifying that editing a missing field in the form updates the preformatted card model in real-time.
    - Currency and wallet transaction math.
- **End-to-End (E2E) & Print Emulation:**
  - **Runner:** Playwright.
  - **Focus:**
    - Testing the manual entry flow: entering data -> viewing card -> editing missing fields -> saving to MongoDB.
    - Testing API fetch flow: mock government API returning partial payload -> form displays with pre-filled and highlighted missing fields -> user fills missing data -> card updates.
    - Emulating print media (`page.emulateMedia({ media: 'print' })`) to guarantee cards fit exactly within standard PVC dimensions without overflow.

### 2. Mocking Strategy
- **External Government APIs:** Mock service worker (MSW) or Playwright route mocks intercepting calls to `/api/verify/*` to simulate:
  1. Complete success payload.
  2. Partial success (missing photo, missing father name, or missing address).
  3. API timeout or third-party server error (500).
- **MongoDB Database:** In-memory MongoDB (`mongodb-memory-server`) for fast, isolated integration tests.

---

*Testing analysis: 2026-09-28*
*Prepared for Next.js & MongoDB migration*
