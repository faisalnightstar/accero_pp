# Internal Linking Architecture Map: Ration Card & Farmer ID

**Document Version:** 1.0.0  
**Target Platform:** Accero PrintPortal  
**Date:** November 14, 2026

---

## 1. Internal Link Architecture & Graph Topology

Accero uses a **Hub-and-Spoke Mesh Topology** designed to distribute link equity from high-authority pillar pages (`/`, `/print-portal`, `/services`) down to specialized service and audience landing pages:

```
                               ┌──────────────────────────────────────────────┐
                               │                 Homepage (/)                 │
                               │          Header & Footer Navigation          │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┼──────────────────────────────┐
                       │                              │                              │
                       ▼                              ▼                              ▼
        ┌─────────────────────────────┐┌─────────────────────────────┐┌─────────────────────────────┐
        │        /print-portal        ││          /services          ││  /best-print-portal-for-csc │
        │     (Core SaaS Pillar)      ││     (Services Directory)    ││    (Audience Authority Hub) │
        └──────────────┬──────────────┘└──────────────┬──────────────┘└──────────────┬──────────────┘
                       │                              │                              │
                       └──────────────────────┬───────┴──────────────────────────────┘
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       │                                             │
                       ▼                                             ▼
        ┌─────────────────────────────┐               ┌─────────────────────────────┐
        │/services/ration-card-print. │               │/services/farmer-id-printing │
        │ (Primary Service Canonical) │               │ (Primary Service Canonical) │
        └──────────────┬──────────────┘               └──────────────┬──────────────┘
                       │                                             │
                       ▼                                             ▼
        ┌─────────────────────────────┐               ┌─────────────────────────────┐
        │/ration-card-printing-for-csc│               │ /farmer-id-printing-for-csc │
        │  (CSC & Cyber Cafe Audience)│               │  (CSC & Cyber Cafe Audience)│
        └─────────────────────────────┘               └─────────────────────────────┘
```

---

## 2. Inbound & Outbound Link Registry

### 2.1 Ration Card Inbound Link Sources
| Source Page | Anchor Text | Placement Location | Target URL |
| :--- | :--- | :--- | :--- |
| **Homepage (`/`)** | "Ration Card Print" | Services Showcase Grid | `/services/ration-card-printing` |
| **Global Header** | "Ration Card Print" | Mega Menu (`serviceItems`) | `/services/ration-card-printing` |
| **Global Footer** | "Ration Card Print" | Services Column | `/services/ration-card-printing` |
| **Print Portal Pillar (`/print-portal`)** | "Ration Card Printing" | Supported Document Pipelines | `/services/ration-card-printing` |
| **Services Directory (`/services`)** | "Ration Card" | Dynamic Service Grid | `/services/ration-card-printing` |
| **CSC Solutions (`/solutions/csc-operators`)**| "Ration Card for CSC" | CTA & Related Services Bar | `/ration-card-printing-for-csc` |
| **Ration Card Audience Page** | "View Service Specifications" | Hero Section | `/services/ration-card-printing` |
| **Ration Card Service Page** | "Open Ration Card Studio" | Hero Search Action | `/studio?type=ration` |

### 2.2 Farmer ID Inbound Link Sources
| Source Page | Anchor Text | Placement Location | Target URL |
| :--- | :--- | :--- | :--- |
| **Homepage (`/`)** | "Farmer ID (AgriStack)" | Services Showcase Grid | `/services/farmer-id-printing` |
| **Global Header** | "Farmer ID (AgriStack)" | Mega Menu (`serviceItems`) | `/services/farmer-id-printing` |
| **Global Footer** | "Farmer ID (AgriStack)" | Services Column | `/services/farmer-id-printing` |
| **Print Portal Pillar (`/print-portal`)** | "Farmer ID (AgriStack)" | Supported Document Pipelines | `/services/farmer-id-printing` |
| **Services Directory (`/services`)** | "Farmer ID Card" | Dynamic Service Grid | `/services/farmer-id-printing` |
| **CSC Solutions (`/solutions/csc-operators`)**| "Farmer ID for CSC" | CTA & Related Services Bar | `/farmer-id-printing-for-csc` |
| **Farmer ID Audience Page** | "View Service Specifications" | Hero Section | `/services/farmer-id-printing` |
| **Farmer ID Service Page** | "Open Farmer Card Studio" | Hero Search Action | `/studio?type=farmer` |

---

## 3. Anchor Text Best Practices

1. **Descriptive & Conversational Anchors:**  
   - ✅ *Good:* "format NFSA Ration Cards using Accero PrintPortal"
   - ✅ *Good:* "view Rajasthan Farmer Registry specifications"
   - ❌ *Avoid:* "click here", "read more", "link"
2. **Avoid Keyword Stuffing:**  
   - Mix brand-anchored phrases ("Accero Ration Card Studio") with descriptive terms ("PVC smart card printing").
3. **Breadcrumb Anchoring:**  
   - Ensure clean navigational chains: `Home > Services > Ration Card Printing Software` and `Home > Solutions > Farmer ID Printing for CSC`.
