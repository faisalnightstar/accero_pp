# Accero PrintPortal — Internal Linking & Site Architecture Audit

**Document:** Internal Link Graph Analysis & Topical Flow Architecture  
**Domain:** `https://printportal.accero.app`  

---

## 1. Hub-and-Spoke Pillar Architecture

Accero PrintPortal utilizes a strict **Hub-and-Spoke Topology** that distributes PageRank and topical relevance smoothly from high-authority pillar pages down to granular service templates and educational guides, and channels user conversion signals back up to the commercial gateway:

```
                      ┌──────────────────────────────────────┐
                      │              Homepage                │
                      │   https://printportal.accero.app/    │
                      └──────────────────┬───────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
│ Pillar: Print Portal │      │ Pillar: CSC VLE      │      │ Pillar: Hardware     │
│   /print-portal      │      │ /best-print-portal.. │      │ /pvc-card-printing.. │
└──────────┬───────────┘      └──────────┬───────────┘      └──────────┬───────────┘
           │                             │                             │
           └─────────────────────────────┼─────────────────────────────┘
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │     Core Service Templates (7)       │
                      │  - /services/pan-card-printing       │
                      │  - /services/voter-id-printing       │
                      │  - /services/aadhaar-document-mgmt   │
                      │  - /services/driving-licence-print   │
                      │  - /services/vehicle-rc-printing     │
                      │  - /services/ration-card-printing    │
                      │  - /services/farmer-id-printing      │
                      └──────────────────┬───────────────────┘
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │   Educational & Technical Guides     │
                      │  - /blog/cr80-card-dimensions-guide  │
                      │  - /blog/pvc-card-printer-tray-guide │
                      │  - /blog/how-to-fix-missing-fields   │
                      │  - /blog/multilingual-printing-guide │
                      └──────────────────────────────────────┘
```

---

## 2. Anchor Text Governance & Accessibility Rules

To comply with Google Search Central guidelines and WCAG 2.2 accessibility standards, Accero PrintPortal implements strict anchor text rules:

1. **Zero Generic Anchors:** Anchor text such as *"Learn more"*, *"Click here"*, *"Read more"*, or bare *"Link"* is strictly prohibited.
2. **Contextual, Descriptive Phrasing:** Anchors clearly describe the destination topic and document entity:
   * *Compliant:* `<Link href="/features/document-lookup" aria-label="Learn more about document lookup and manual entry"><span>Explore document lookup</span></Link>`
   * *Compliant:* `<Link href="/services/pan-card-printing"><span>Format Official PAN Cards</span></Link>`
   * *Compliant:* `<Link href="/blog/cr80-card-dimensions-guide"><span>CR80 Card Dimensions Specification</span></Link>`
3. **Automated Enforcement:** Verified via automated Vitest test suites (`tests/pagespeed-fixes.test.ts` and `tests/seo/internal-links.test.ts`).

---

## 3. Breadcrumb Navigation Architecture

Every service, pillar, blog, and informational page includes visible and machine-readable breadcrumb navigation:

### Visual Implementation
Rendered via the reusable `Breadcrumbs` component ([src/components/seo/Breadcrumbs.tsx](file:///Users/faisal/Documents/GitHub/accero_pp/src/components/seo/Breadcrumbs.tsx)):
* Home &rarr; Category &rarr; Current Page
* Clear visual hierarchy with accessible delimiters (`/`).
* Visually distinguishable active crumb (`aria-current="page"`).

### Schema Implementation
Mirrored synchronously into JSON-LD `BreadcrumbList` via `generateBreadcrumbSchema()`:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://printportal.accero.app"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Services",
      "item": "https://printportal.accero.app/services"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "PAN Card Printing",
      "item": "https://printportal.accero.app/services/pan-card-printing"
    }
  ]
}
```

---

## 4. Crawl Depth & Orphan Page Audit

An audit across all 52 public indexable routes confirms **Zero Orphan Pages**:
* **Maximum Crawl Depth:** 3 clicks from the homepage (`/` &rarr; `/services` &rarr; `/services/[card]` &rarr; `/services/[card]/[state]/[district]`).
* **Header Navigation:** Houses direct links to commercial hubs (`/services`, `/pricing`, `/about`, `/contact`, `/faq`).
* **Comprehensive Footer ([src/components/public/PublicFooter.tsx](file:///Users/faisal/Documents/GitHub/accero_pp/src/components/public/PublicFooter.tsx)):** Houses structured crawlable links to all 52 public canonical URLs grouped by Document Services, Platform & Technology, Solutions by Operator, and Trust & Legal.
