# Stack Research

**Domain:** Document Verification & PVC Card Print Portal (Next.js & MongoDB)
**Researched:** 2026-09-28
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x | Full-Stack Web Framework (App Router) | Best-in-class React Server Components (RSC) for instantaneous page loads, built-in SEO metadata API, Edge & Serverless Route Handlers, seamless Vercel deployment. |
| React | 19.x | UI Library | Native server actions, `useActionState`, and high-performance client component reactivity for live card synchronization. |
| TypeScript | 5.x | Programming Language | Ensures end-to-end type safety across API responses, form schemas, and card coordinate systems. |
| MongoDB / Mongoose | 8.x | Database & ODM | Dynamic schemaless document modeling ideal for accommodating variable government data fields, missing attributes, and audit logs. |
| Tailwind CSS | 4.x / 3.4+ | Styling System | Rapid utility-first styling with custom CSS variables matching the established color palette (`#8B1E2D`, `#E63946`, `#F4D35E`, etc.). |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 3.x | Runtime Schema Validation | Validate API payloads, card number regexes (PAN, Aadhaar, EPIC, DL, RC), and form inputs. |
| Lucide React | Latest | UI Iconography | Crisp, lightweight SVG icons for navigation, alerts, and document badges. |
| qrcode | 1.5+ | QR Code Generation | Client & server-side generation of high-density QR codes for Aadhaar and Voter cards. |
| jspdf / html2canvas | Latest | PDF & Canvas Generation | Client-side export to high-DPI PDF and raster PNG matching exact PVC card millimeters. |
| next-auth / Jose | Latest | Authentication & Sessions | Secure JWT-based session management without PHP session cookie vulnerabilities. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vitest | Fast Unit & Component Testing | Rapid test execution for validation schemas and live preview state math. |
| Playwright | End-to-End & Print Media Testing | Emulates `@media print` to guarantee no visual overflows or margin drift. |
| Biome / ESLint | Code Linting & Formatting | Enforce strict TypeScript conventions and clean component imports. |

## Installation Command

```bash
npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install mongoose zod lucide-react qrcode @types/qrcode jspdf
npm install -D vitest @vitejs/plugin-react
```

## What NOT to Use and Why

- **Do NOT use legacy procedural PHP or Apache sessions:** Fragile, vulnerable to injection, non-reactive, and impossible to host on modern serverless edge networks.
- **Do NOT use client-side iframe print hacks:** Inconsistent across browsers. Use CSS `@page { size: 85.6mm 53.98mm; margin: 0; }` with dedicated print portals.
- **Do NOT use raw MySQL string queries:** Prone to SQL injection and schema rigidity when card fields change.

---
*Stack research: 2026-09-28*
