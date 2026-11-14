# Structured Data & Schema Markup Audit: Ration Card & Farmer ID

**Document Version:** 1.0.0  
**Target Architecture:** Next.js 15.5 App Router (JSON-LD)  
**Standard:** Schema.org & Google Search Central Guidelines  
**Date:** November 14, 2026

---

## 1. Schema Validation & Policy Summary

Accero PrintPortal strictly implements **deterministic, verified structured data**.
- **No Fabricated Review Ratings:** No fake `aggregateRating`, `reviewCount`, or 5.0-star badges that trigger Google Rich Results manual actions.
- **Accurate Operating System & Price:** `operatingSystem` is declared as web browser; pricing matches real utility fees (₹20–₹25).
- **Exact FAQ Alignment:** Every FAQ question and answer in JSON-LD matches the visible DOM text byte-for-byte.

---

## 2. Schema Breakdown by Route

### 2.1 Primary Service Page: `/services/ration-card-printing`
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://printportal.accero.app/#software",
      "name": "Ration Card Printing Software | Online Ration Card PDF – Accero",
      "applicationCategory": "BusinessApplication",
      "applicationSubCategory": "Document Printing & Card Formatting Utility",
      "operatingSystem": "Cross-platform (Web browser: Google Chrome, Mozilla Firefox, Microsoft Edge, Safari)",
      "url": "https://printportal.accero.app",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": "25.00",
        "description": "Transparent pay-as-you-go utility pricing per generated card with 100% free lifetime re-prints."
      },
      "featureList": [
        "Official ISO/IEC 7810 ID-1 Standard CR80 Dimensions (85.60 mm × 53.98 mm)",
        "Dynamic Scheme Palettes for PHH, AAY, BPL, APL, and Non-Subsidized White Cards",
        "Family Beneficiary Micro-Table with Automatic Multi-Page Continuation Pagination",
        "Dual Bilingual Typography with Native Devanagari Regional Script Support",
        "Live Split-Screen Studio Highlighting Missing Fields with Instant Manual Corrections",
        "High-Resolution 300+ DPI Print-Ready Vector PDF for Dual & Single PVC Card Trays"
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://printportal.accero.app/" },
        { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://printportal.accero.app/services" },
        { "@type": "ListItem", "position": 3, "name": "Ration Card", "item": "https://printportal.accero.app/services/ration-card-printing" }
      ]
    },
    {
      "@type": "HowTo",
      "name": "Ration Card Printing Software | Online Ration Card PDF – Accero",
      "step": [
        { "@type": "HowToStep", "name": "Enter Ration Card Number or Choose Blank Mode", "text": "Input the 12-to-20 digit Ration Card number into the lookup search bar or initiate blank manual entry in the studio." },
        { "@type": "HowToStep", "name": "Review Head of Family & Entitlement Category", "text": "Verify the Head of Family name in English and regional script, scheme category (PHH, AAY, BPL), and Fair Price Shop (FPS) dealer code." },
        { "@type": "HowToStep", "name": "Audit Family Beneficiaries & Aadhaar Seeding", "text": "Inspect the family members roster. Easily add, edit, or remove members in real-time with automatic total member count synchronization." },
        { "@type": "HowToStep", "name": "Preview Front & Reverse Canvases Live", "text": "Examine the live 300+ DPI front identity side and reverse beneficiary table. Continuation pagination automatically handles households with more than 5 members." },
        { "@type": "HowToStep", "name": "Download Print-Ready PDF or Direct Tray Print", "text": "Generate an instant vector PDF configured for standard PVC card trays with zero margin drift and exact alignment." }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is a Ration Card?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A Ration Card is an official household identity document issued by state food and civil supplies departments under the National Food Security Act (NFSA)..."
          }
        },
        {
          "@type": "Question",
          "name": "Does Accero PrintPortal issue government Ration Cards?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Accero PrintPortal is an independent commercial document processing and printing platform. It does not issue government Ration Cards..."
          }
        }
      ]
    }
  ]
}
```

---

### 2.2 Primary Service Page: `/services/farmer-id-printing`
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://printportal.accero.app/#software",
      "name": "Farmer ID Card Printing Software | Farmer Registry – Accero",
      "applicationCategory": "BusinessApplication",
      "applicationSubCategory": "Document Printing & Card Formatting Utility",
      "operatingSystem": "Cross-platform (Web browser: Google Chrome, Mozilla Firefox, Microsoft Edge, Safari)",
      "url": "https://printportal.accero.app",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": "20.00",
        "description": "Transparent pay-as-you-go utility pricing per generated card with 100% free lifetime re-prints."
      },
      "featureList": [
        "Official ISO/IEC 7810 ID-1 CR80 Landscape Dimensions (85.60 mm × 53.98 mm)",
        "Authentic AgriStack & State Registry Visual Layout with Dual Emblems",
        "Detailed Landholding Records Table Mapping Khata, Khasra, and Area (Hectares)",
        "Front & Reverse Canvas with 180° Rotated High-Resolution Background Architecture",
        "Dynamic QR Code Generator with Authorized Registry Verification Endpoint",
        "Multi-Lingual Script Support across 12 Indian Languages with Instant Translation"
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://printportal.accero.app/" },
        { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://printportal.accero.app/services" },
        { "@type": "ListItem", "position": 3, "name": "Farmer ID Card", "item": "https://printportal.accero.app/services/farmer-id-printing" }
      ]
    },
    {
      "@type": "HowTo",
      "name": "Farmer ID Card Printing Software | Farmer Registry – Accero",
      "step": [
        { "@type": "HowToStep", "name": "Lookup Farmer Record or Enter Manually", "text": "Input the 11/12-digit Farmer ID or Aadhaar number into the search bar, or select blank manual entry." },
        { "@type": "HowToStep", "name": "Verify Identity, Photo & Address", "text": "Review farmer name in English and regional script, gender, DOB, category, and complete residential address." },
        { "@type": "HowToStep", "name": "Verify Landholding Details", "text": "Inspect the reverse-side landholding table containing Khata number, Khasra number, and land area." },
        { "@type": "HowToStep", "name": "Preview Front & Back Canvases Live", "text": "Examine the live 300+ DPI preformatted canvas with AgriStack branding, Ashoka Crest, and QR code." },
        { "@type": "HowToStep", "name": "Download Print-Ready PDF or Print to Tray", "text": "1-Click generation of a high-DPI vector PDF ready for feeding PVC card blanks into your printer." }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is a Farmer ID?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A Farmer ID is a unique digital identifier assigned to an agricultural landholder under government digital agriculture initiatives..."
          }
        },
        {
          "@type": "Question",
          "name": "What is AgriStack?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AgriStack is the digital public infrastructure initiative by the Ministry of Agriculture and Farmers Welfare..."
          }
        }
      ]
    }
  ]
}
```

---

## 3. Rich Results Verification Criteria
- All `@context` blocks point to `https://schema.org`.
- All URL attributes use absolute canonical HTTPS URLs.
- All schema objects pass validation without warnings or errors.
