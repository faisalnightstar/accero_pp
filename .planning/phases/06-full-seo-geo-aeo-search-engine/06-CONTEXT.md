# Phase 6: Full SEO, GEO & AEO Search Engine — Context & Decisions

**Phase Goal:** Establish dominant search engine visibility across traditional organic search, hyper-local queries across India, and modern AI answer engines (Perplexity, ChatGPT Search, Gemini) with public SSR service pages, programmatic regional hubs, rich JSON-LD schemas, and dynamic sitemaps.

---

## 1. Locked Decisions

### D-01: Exhaustive All-India Regional GEO Dataset
- **Geographic Coverage:**
  - Comprehensive directory of all **28 Indian states** with **top 5 high-population/economic districts** per state (~140 programmatic district hubs).
  - Multiplied across the 5 document types (`pan`, `aadhaar`, `voter`, `dl`, `rc`) = **700 programmatic local landing combinations**.
- **Dynamic On-Demand Fallback:**
  - Route: `/services/[card]/[state]/[district]`
  - Seeded routes benefit from `generateStaticParams` for blazing fast edge delivery; unseeded or long-tail state/district query strings fallback seamlessly via SSR with auto-capitalized title tags.
- **Localized Content Customization:**
  - Regional page dynamically injects state and district names into H1, meta title, meta description, localized FAQs, and local RTO / Electoral office context.
  - Example: *"PVC Voter ID Card Print in Varanasi, Uttar Pradesh — Official Standard CR80 PVC Format"*.

### D-02: High-Conversion Interactive Hero
- **Above-The-Fold Layout:**
  - Split hero:
    - **Left:** Compelling SEO H1 headline, value props (ISO 7810 CR80 precision, zero missing-data failures, official tray dimensions), and 1-Click Number Lookup input box.
    - **Right:** Live interactive preview of the preformatted card canvas (matching Phase 2 components) with high-DPI front/back toggle.
  - Submitting document ID in the hero navigates directly into `/studio?type=${type}&lookup=${id}`.
- **Conversion Flow:**
  - Direct bridge from organic/local search traffic straight into the interactive Studio without friction.

### D-03: Dual AI Answer Engine Optimization (AEO)
- **Concise AI-Answer Callout Block:**
  - Dedicated on-page TL;DR / Quick Answer summary (40–50 words) formulated to be directly extracted and cited by Perplexity, ChatGPT Search, Claude, and Google SGE.
  - Structured heading: *"Quick Answer: How to print an official PVC [Document] card online"*.
- **Comprehensive JSON-LD Schemas:**
  - `SoftwareApplication`: Defines PrintPortal as a web utility, ISO-compliant card generator, zero government impersonation disclaimer, pricing offers.
  - `FAQPage`: 5 curated high-frequency questions & answers per service.
  - `HowTo`: 4-step structured procedure (1. Enter number or upload details, 2. Auto-fill missing fields, 3. Review live preview, 4. Instant PDF print export).
  - `BreadcrumbList`: Complete hierarchical breadcrumb (`Home > Services > [Document] > [State] > [District]`).

### D-04: Crawl Policy, Dynamic Sitemap & Robots.txt
- **`src/app/robots.ts`:**
  - Allows public routes: `/`, `/services`, `/services/*`.
  - Disallows authenticated/private routes: `/studio*`, `/dashboard*`, `/wallet*`, `/api*`.
  - Points to `https://printportal.vercel.app/sitemap.xml`.
- **`src/app/sitemap.ts`:**
  - Dynamically constructs sitemap including:
    - Base static routes (`/`, `/login`, `/register`).
    - Service catalog (`/services`) and 5 core service landing pages (`/services/pan-card`, `/services/voter-id`, etc.) with Priority `1.0` and daily change frequency.
    - Programmatic regional GEO hubs (`/services/[card]/[state]/[district]`) with Priority `0.8` and weekly change frequency.

---

## 2. URL & Route Architecture

```
/services                                    -> Services Directory / Catalog
/services/pan-card                           -> Core Service Landing Page: PAN Card
/services/aadhaar-card                       -> Core Service Landing Page: Aadhaar Card
/services/voter-id                           -> Core Service Landing Page: Voter ID
/services/driving-license                    -> Core Service Landing Page: Driving License
/services/vehicle-rc                         -> Core Service Landing Page: Vehicle RC
/services/[card]/[state]/[district]          -> Regional Localized GEO Landing Hub
/robots.txt                                  -> Next.js dynamic robots endpoint
/sitemap.xml                                 -> Next.js dynamic sitemap generator
```

---

## 3. Seed Regional Dataset (All 28 States)

1. **Andhra Pradesh:** Visakhapatnam, Vijayawada, Guntur, Nellore, Kurnool
2. **Arunachal Pradesh:** Itanagar, Tawang, Naharlagun, Pasighat, Ziro
3. **Assam:** Guwahati, Silchar, Dibrugarh, Jorhat, Nagaon
4. **Bihar:** Patna, Gaya, Bhagalpur, Muzaffarpur, Purnia
5. **Chhattisgarh:** Raipur, Bhilai, Bilaspur, Korba, Durg
6. **Goa:** North Goa, South Goa, Panaji, Margao, Vasco da Gama
7. **Gujarat:** Ahmedabad, Surat, Vadodara, Rajkot, Bhavnagar
8. **Haryana:** Gurugram, Faridabad, Panipat, Ambala, Karnal
9. **Himachal Pradesh:** Shimla, Dharamshala, Solan, Mandi, Kullu
10. **Jharkhand:** Ranchi, Jamshedpur, Dhanbad, Bokaro, Deoghar
11. **Karnataka:** Bengaluru, Mysuru, Hubballi, Mangaluru, Belagavi
12. **Kerala:** Thiruvananthapuram, Kochi, Kozhikode, Thrissur, Kollam
13. **Madhya Pradesh:** Bhopal, Indore, Jabalpur, Gwalior, Ujjain
14. **Maharashtra:** Mumbai, Pune, Nagpur, Thane, Nashik
15. **Manipur:** Imphal, Churachandpur, Thoubal, Bishnupur, Ukhrul
16. **Meghalaya:** Shillong, Tura, Jowai, Nongpoh, Baghmara
17. **Mizoram:** Aizawl, Lunglei, Champhai, Serchhip, Kolasib
18. **Nagaland:** Kohima, Dimapur, Mokokchung, Tuensang, Wokha
19. **Odisha:** Bhubaneswar, Cuttack, Rourkela, Berhampur, Sambalpur
20. **Punjab:** Ludhiana, Amritsar, Jalandhar, Patiala, Bathinda
21. **Rajasthan:** Jaipur, Jodhpur, Kota, Bikaner, Udaipur
22. **Sikkim:** Gangtok, Namchi, Geyzing, Mangan, Ravangla
23. **Tamil Nadu:** Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem
24. **Telangana:** Hyderabad, Warangal, Nizamabad, Karimnagar, Khammam
25. **Tripura:** Agartala, Dharmanagar, Udaipur, Kailashahar, Belonia
26. **Uttar Pradesh:** Lucknow, Kanpur, Varanasi, Agra, Prayagraj
27. **Uttarakhand:** Dehradun, Haridwar, Roorkee, Haldwani, Rudrapur
28. **West Bengal:** Kolkata, Howrah, Asansol, Siliguri, Durgapur

---

## 4. Success Criteria

1. All 5 public service landing pages render with SSR, dynamic OpenGraph meta, interactive card preview, and direct Studio search action.
2. Programmatic regional routes (`/services/[card]/[state]/[district]`) render localized content and schemas for any combination.
3. Every public landing page embeds `SoftwareApplication`, `FAQPage`, `HowTo`, and `BreadcrumbList` JSON-LD schemas.
4. `sitemap.xml` generates clean XML with all public services and regional combinations.
5. `robots.txt` disallows private routes while allowing search bots to index service hubs.
