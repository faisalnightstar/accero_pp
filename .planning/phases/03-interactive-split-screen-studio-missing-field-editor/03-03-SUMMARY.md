---
phase: 03-interactive-split-screen-studio-missing-field-editor
plan: 03
subsystem: studio-persistence
tags: [asset-upload, base64, drag-drop, manual-entry, mongodb-persistence, document-records, dashboard-sync]

# Dependency graph
requires: [03-01, 03-02]
provides:
  - Drag-and-drop photo & signature asset uploader (AssetDropzone.tsx) with client-side base64 conversion and 5MB validation
  - Manual entry blank document workflows with instant reset controls
  - MongoDB document persistence API routes (POST/GET /api/documents, GET/DELETE /api/documents/[id])
  - Interactive save confirmation modal with direct print and dashboard navigation
  - Dashboard recent saved documents table with direct links to Studio rehydration and printing
affects: [phase-4, phase-5]

# Tech tracking
tech-stack:
  added: []
  patterns: [Client-side Base64 File Reader, RESTful MongoDB Document Persistence, URL Query Rehydration (?id=), Safe Optional Chaining]

key-files:
  created:
    - src/components/studio/AssetDropzone.tsx
    - src/app/api/documents/route.ts
    - src/app/api/documents/[id]/route.ts
  modified:
    - src/components/studio/CardForm.tsx
    - src/app/studio/page.tsx
    - src/app/dashboard/page.tsx

key-decisions:
  - "Built client-side image conversion to base64 Data URLs via FileReader, allowing immediate 0ms card preview without server roundtrips"
  - "Secured /api/documents and /api/documents/[id] routes with JWT authentication session guards and Zod payload validation"
  - "Implemented document rehydration in Studio using ?id= query param to load stored cards seamlessly from MongoDB"
  - "Added saved document library table to Dashboard with status pills (Ready to Print vs Missing Fields count) and quick Edit/Print actions"

patterns-established:
  - "Card identifiers are dynamically resolved per document type upon saving if not explicitly set"
  - "Studio wrapped in Suspense boundary to guarantee clean static optimization alongside useSearchParams"
---

# Plan 03-03 Summary: Asset Uploads, Manual Entry, and MongoDB Persistence

Implemented drag-and-drop asset uploaders for cardholder photographs and signatures, full manual entry blank creation, MongoDB document persistence endpoints, and operator dashboard synchronization.

## What was built
- **Asset Dropzone Component (`src/components/studio/AssetDropzone.tsx`)**:
  - Drag-and-drop area with file selection fallback and paste support.
  - Client-side validation: MIME type check (`image/jpeg`, `image/png`, `image/webp`) and 5MB size limit.
  - Converts image to base64 Data URL and delivers immediately to form state for 0ms reactive canvas rendering.
  - Live thumbnail preview with "Change" and "Remove" actions.
- **CardForm Integration (`src/components/studio/CardForm.tsx`)**:
  - Integrated photograph & signature dropzones for PAN and Driving License.
  - Integrated photograph dropzones for Aadhaar and Voter ID.
- **MongoDB Documents API Routes (`src/app/api/documents/route.ts`, `src/app/api/documents/[id]/route.ts`)**:
  - `POST /api/documents`: Validates payload with Zod, creates or updates `DocumentRecord` in MongoDB, returns document ID.
  - `GET /api/documents`: Authenticates session, queries user's saved documents sorted by recency.
  - `GET /api/documents/[id]`: Rehydrates a single document ensuring authenticated ownership.
  - `DELETE /api/documents/[id]`: Removes or archives document records.
- **Studio Manual Entry & Save Flow (`src/app/studio/page.tsx`)**:
  - "New Blank" action clears fields and resets the editor for manual document entry.
  - "Save Document" action commits state to MongoDB and displays a confirmation modal with options: "Stay in Studio", "Print Card", or "Dashboard".
  - URL query rehydration (`?id=<docId>`) fetches existing document records for editing.
- **Operator Dashboard Sync (`src/app/dashboard/page.tsx`)**:
  - Live table displaying user's saved document records with status badges, date, and quick action links ("Edit" in studio and "Print").

## Verification
- `npm run build` compiled 13/13 static routes with zero TypeScript errors or ESLint warnings.
- Tested API endpoints with authenticated curl session: registration, `POST /api/documents` (persisting record `6ab98b3820c83cc2a629d22e`), `GET /api/documents/[id]`, and `GET /api/documents`.
- Verified `/studio`, `/studio?id=...`, and `/dashboard` return HTTP 200 OK.
