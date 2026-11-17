# Google Search Console Setup & Verification Guide
**Accero PrintPortal (https://printportal.accero.app)**

This document details the configuration, verification, sitemap indexing, and search health monitoring procedure for **Google Search Console (GSC)**.

---

## 1. HTML Verification Procedure

Google Search Console ownership verification is implemented via static HTML file verification.

### File Specifications
* **Filename:** `google83ee5457f4c0bef8.html`
* **Local Location:** `public/google83ee5457f4c0bef8.html`
* **File Content:**
  ```text
  google-site-verification: google83ee5457f4c0bef8.html
  ```
* **Production Live Verification URL:**
  [https://printportal.accero.app/google83ee5457f4c0bef8.html](https://printportal.accero.app/google83ee5457f4c0bef8.html)

### HTTP & Routing Guarantees
1. **HTTP 200 OK:** Served statically by Next.js from `public/`.
2. **Exact Content Match:** Matches Google’s expected verification string verbatim.
3. **No Redirects:** Excluded from authentication guards and middleware rewrites.
4. **No Index Restrictions:** Served with standard headers without blocking verification crawlers.

---

## 2. Step-by-Step Ownership Verification in GSC

> [!IMPORTANT]
> The verification file is deployed in code, but **manual confirmation in Google Search Console is required** to finalize property ownership. Do not claim ownership is verified until Google confirms it in the console.

1. Open [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** (top-left dropdown).
3. Select **URL prefix**:
   * Enter: `https://printportal.accero.app`
   * Click **Continue**.
4. In the verification methods dialogue, select **HTML file**:
   * Confirm the filename is `google83ee5457f4c0bef8.html`.
5. Click **Verify**.
6. Google will fetch `https://printportal.accero.app/google83ee5457f4c0bef8.html` and confirm ownership.

---

## 3. Sitemap Submission

Once ownership is verified:
1. In Search Console, navigate to **Indexing > Sitemaps** in the left sidebar.
2. In the "Add a new sitemap" input box, enter:
   ```text
   sitemap.xml
   ```
   (Full URL: `https://printportal.accero.app/sitemap.xml`)
3. Click **Submit**.
4. Confirm status changes to **Success** and the number of discovered URLs matches the generated static routes.

---

## 4. Priority Indexing Inspection Routine

Use the **URL Inspection Tool** (top search bar in Search Console) to verify canonical consistency and request indexing for priority pages:

### Priority Commercial & Competitor Intent Pages

1. **Homepage:** `https://printportal.accero.app/`
2. **Pricing:** `https://printportal.accero.app/pricing`
3. **Print Portal Gateway:** `https://printportal.accero.app/print-portal`
4. **CSC Operators:** `https://printportal.accero.app/best-print-portal-for-csc`
5. **Cyber Cafes:** `https://printportal.accero.app/print-portal-for-cyber-cafe`
6. **Retailers:** `https://printportal.accero.app/print-portal-for-retailers`
7. **PVC Card Software:** `https://printportal.accero.app/pvc-card-printing-software`
8. **CSC Software:** `https://printportal.accero.app/csc-operator-software`
9. **Document Processing Platform:** `https://printportal.accero.app/document-processing-platform`

### Core Document Service Pages
1. `https://printportal.accero.app/services/pan-card-printing`
2. `https://printportal.accero.app/services/aadhaar-document-management`
3. `https://printportal.accero.app/services/voter-id-printing`
4. `https://printportal.accero.app/services/driving-licence-printing`
5. `https://printportal.accero.app/services/vehicle-rc-printing`
6. `https://printportal.accero.app/services/ration-card-printing`

### Inspection Checklist per URL
* **URL is on Google:** Check for green checkmark.
* **Page fetch:** Successful.
* **Indexing allowed?:** Yes.
* **User-declared canonical:** Matches `https://printportal.accero.app/...`
* **Google-selected canonical:** Matches user-declared canonical.
* **Mobile Usability:** Page is usable on mobile.

---

## 5. Index Coverage & Exclusion Monitoring

In **Indexing > Pages**, monitor the index status weekly:

### Desired States
* **Indexed Pages:** Should encompass all public commercial, service, and blog routes.
* **Excluded Pages (Intentional Disallows):**
  The following private route prefixes are intentionally blocked via `robots.txt` and must NOT appear under "Indexed":
  * `/dashboard/*`
  * `/studio/*`
  * `/wallet/*`
  * `/admin/*`
  * `/cards/*`
  * `/api/*`

### Health Flags to Address
* **Crawled - currently not indexed:** Review internal linking and content depth.
* **Discovered - currently not indexed:** Ensure sitemap priority and internal linking.
* **Soft 404:** Ensure no dynamic error pages return HTTP 200.

---

## 6. Core Web Vitals & Experience Monitoring

In **Experience > Core Web Vitals**:
* **LCP (Largest Contentful Paint):** Target `< 2.5s` (Optimized via SVG emblems and CSS-based PVC canvases).
* **INP (Interaction to Next Paint):** Target `< 200ms` (Optimized via React 19 concurrent state).
* **CLS (Cumulative Layout Shift):** Target `< 0.1` (Zero layout shift with fixed-ratio CR80 containers).

---

## 7. Weekly Search Performance Reporting Routine

Perform this weekly check under **Performance > Search results**:

1. **Date Filter:** Compare *Last 28 days* vs *Previous period*.
2. **Key Metrics to Track:**
   * Total Clicks
   * Total Impressions
   * Average CTR
   * Average Position
3. **Top Search Queries to Review:**
   * High-intent commercial queries: `"csc pvc card print portal"`, `"cyber cafe print portal"`, `"cr80 pvc print gateway"`.
   * Queries with high impressions and position 5–15 (immediate optimization candidates).
4. **Top Pages:**
   * Verify top ranking pages correspond to target competitor-intent landing pages.

