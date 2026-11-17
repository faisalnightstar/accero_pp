# ACCERO PRINTPORTAL - PRODUCTION SEO DEPLOYMENT CHECKLIST

**Target Domain:** `https://printportal.accero.app`  
**Execution Phase:** Production Launch Readiness  

---

## 1. PRE-DEPLOYMENT TECHNICAL VERIFICATION

- [x] **Canonical Domain Standardized:** All URLs in code, metadata, schemas, and sitemaps resolve to `https://printportal.accero.app`.
- [x] **Zero Fabricated Reviews:** Cleansed `src/lib/seo/schemaGenerator.ts`; removed fake `AggregateRating` (4.9 / 1850 reviews).
- [x] **Doorway Pages Removed:** Deprecated 725 thin programmatic regional doorway URLs; converted to safe 308 redirects with `noindex, follow`.
- [x] **Dynamic OpenGraph Route Built:** Operational `/api/og` endpoint generating branded 1200x630 social preview cards.
- [x] **Private Route Shields:** Applied strict `robots: { index: false, follow: false }` metadata layouts to `/dashboard`, `/studio`, `/wallet`, `/cards`, and `(auth)`.
- [x] **XML Sitemap Cleaned:** Verified `src/app/sitemap.ts` contains all 28 core public marketing and educational routes with stable timestamps.
- [x] **Robots.txt Updated:** Allowed public marketing, educational guides, `/llms.txt`; disallowed `/dashboard`, `/studio`, `/wallet`, `/cards`, `/admin`, `/api`.
- [x] **Broken Navbar Links Fixed:** Replaced broken `/cards` link with public `/features`; fixed anchor references.
- [x] **TypeScript & Next.js Build Verified:** `npx tsc --noEmit` passed with 0 errors; `npm run build` generated 61 static pages cleanly.
- [x] **Unit Test Suite Verified:** All 39 Vitest unit tests passed.

---

## 2. GOOGLE SEARCH CONSOLE (GSC) ONBOARDING GUIDE

### Step 1: Property Addition
1. Log in to [Google Search Console](https://search.google.com/search-console).
2. Choose **Domain Property** and enter: `accero.app` (or URL Prefix: `https://printportal.accero.app`).
3. If using Domain property, add the DNS TXT verification record at your DNS registrar (Cloudflare / Hostinger / Namecheap):
   ```
   Host: @
   Type: TXT
   Value: google-site-verification=<your-unique-token>
   ```
4. If using URL Prefix, you can configure the verification meta tag or HTML file.

### Step 2: Sitemap Submission
1. In the left sidebar, click **Sitemaps**.
2. Enter the sitemap path: `sitemap.xml`.
3. Submit and verify status displays: **Success** with ~28 discovered pages.

### Step 3: URL Inspection & Verification
1. Run URL Inspection for the root: `https://printportal.accero.app`.
2. Confirm Google can fetch the page, view Schema.org Organization and WebSite markup, and detect mobile responsiveness.

---

## 3. BING WEBMASTER TOOLS ONBOARDING GUIDE

1. Log in to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Click **Import from Google Search Console** for 1-click verification of `https://printportal.accero.app`.
3. Navigate to **Sitemaps** and submit: `https://printportal.accero.app/sitemap.xml`.
4. Inspect robots.txt under **Tools > Robots.txt Tester** to confirm `/dashboard`, `/studio`, and `/api` are blocked while `/features` and `/services` are allowed.

---

## 4. GOOGLE ANALYTICS 4 (GA4) PRIVACY-CONSCIOUS CONFIGURATION

### A. Environment Variable Setup
In production on Vercel:
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### B. Critical Privacy Guardrails
Accero PrintPortal processes identity documents. **Never collect or pass sensitive data into analytics:**
- **STRICTLY PROHIBITED:** Aadhaar numbers, PAN strings, EPIC numbers, DL numbers, customer full names, customer photos, wallet balances.
- **PERMITTED CONVERSION EVENTS:**
  - `page_view` (path only; sanitize query params if present)
  - `sign_up_start`
  - `sign_up_complete`
  - `login_complete`
  - `lookup_initiated` (event parameter: `doc_type: "pan" | "voter" | "dl" | "rc" | "ration" | "aadhaar"`)
  - `card_print_executed` (event parameter: `doc_type`)
  - `wallet_recharge_initiated` (event parameter: `tier_amount`)
  - `contact_form_submitted`

---

## 5. EXTERNAL LAUNCH DEPENDENCIES SUMMARY

| Item | Responsible Party | Notes |
|---|---|---|
| Production DNS A/CNAME Record | Domain Administrator | Point `printportal.accero.app` to Vercel IP `76.76.21.21`. |
| Production Environment Variables | Vercel Project Admin | Set `NEXT_PUBLIC_APP_URL=https://printportal.accero.app` and `MONGODB_URI`. |
| GSC DNS Verification | Webmaster | Add Google verification TXT record to DNS. |
| Paytm Production Gateway | Financial Admin | Confirm live merchant keys before accepting operator deposits. |

