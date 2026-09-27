---
phase: 01-foundation-architecture-setup
plan: 01
subsystem: ui
tags: [nextjs, react19, tailwind, typescript, layout, brand-tokens]

# Dependency graph
requires: []
provides:
  - Next.js 15+ App Router root architecture with React 19 and TypeScript
  - Tailwind brand palette tokens (#8B1E2D, #E63946, #F4D35E, #457B9D, #1D3557)
  - Card print CSS rules for ISO 7810 CR80 card dimensions
  - Responsive public root layout, Navbar, and Footer
affects: [01-02, 01-03, phase-2, phase-3]

# Tech tracking
tech-stack:
  added: [next, react, react-dom, tailwindcss, lucide-react, clsx, tailwind-merge, zod]
  patterns: [Next.js 15 App Router, Brand CSS Variables, CR80 @page print media queries]

key-files:
  created:
    - package.json
    - tsconfig.json
    - next.config.ts
    - postcss.config.mjs
    - tailwind.config.ts
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/components/layout/Navbar.tsx
    - src/components/layout/Footer.tsx

key-decisions:
  - "Initialized Next.js in workspace root while safely keeping legacy printportal directory for asset extraction"
  - "Configured outputFileTracingRoot to guarantee lockfile resolution in multi-repo directory layout"
  - "Implemented CSS print media rules locked to standard CR80 85.6mm x 53.98mm card dimensions"

patterns-established:
  - "Brand color variables defined in :root and mapped in Tailwind theme extension"
  - "Layout architecture with shared Navbar and Footer, excluding print containers via .no-print"
---

# Plan 01-01 Summary: Project Foundation & Layout

Initialized Next.js 15+ App Router application with TypeScript and Tailwind CSS in the workspace root. Successfully established brand color tokens, print styles, and responsive navigation.

## What was built
- **Next.js 15 Full-Stack Setup**: Clean build configured in root with strict TypeScript mode and `@/*` path mapping.
- **Brand Palette Tokens**: CSS custom properties and Tailwind utilities integrating `#8B1E2D` (Burgundy), `#E63946` (Crimson), `#F4D35E` (Gold), `#457B9D` (Steel Blue), and `#1D3557` (Navy).
- **Public Discovery UI**: Sticky backdrop-blur Navbar with navigation links and login triggers, hero section with service badges, and CR80 PVC tray print compliance footer.
- **Print Optimization**: `@media print` rules enforcing zero-margin standard CR80 card bounds.

## Verification
- `npm run build` compiled 4/4 static pages in 2.7s with zero errors or TypeScript warnings.
