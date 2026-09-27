---
phase: 01-foundation-architecture-setup
plan: 02
subsystem: database
tags: [mongodb, mongoose, serverless, schemas, health-check]

# Dependency graph
requires:
  - phase: 01-foundation-architecture-setup
    provides: Next.js 15 App Router and TypeScript compilation framework (plan 01-01)
provides:
  - Serverless cached MongoDB Mongoose connection utility
  - User model with password hashing field and role controls
  - Wallet model with embedded transaction ledger
  - DocumentRecord model supporting PAN, Aadhaar, Voter, DL, RC with flexible payload and missing field tracking
  - Health check endpoint (/api/health) reporting connection states
affects: [01-03, phase-3, phase-4, phase-5]

# Tech tracking
tech-stack:
  added: [mongoose]
  patterns: [Global Mongoose connection caching for Vercel serverless functions, Compound indexes, Flexible mixed document schema]

key-files:
  created:
    - src/lib/mongodb.ts
    - src/models/User.ts
    - src/models/Wallet.ts
    - src/models/DocumentRecord.ts
    - src/app/api/health/route.ts
    - .env.example

key-decisions:
  - "Used globalThis.mongooseCache to preserve active connection pool across serverless cold starts and prevent connection leaks on Vercel"
  - "Modeled DocumentRecord with Schema.Types.Mixed to cleanly preserve both API payloads (matching pdf.html) and custom user field edits without rigid schema migrations"
  - "Configured compound index { userId: 1, docType: 1, cardIdentifier: 1 } for fast document lookups"

patterns-established:
  - "Database connection cached in src/lib/mongodb.ts and imported by server actions/models"
  - "Mongoose models instantiated using mongoose.models[Name] || mongoose.model() to prevent recompilation collisions"
---

# Plan 01-02 Summary: MongoDB Serverless Layer & Core Schemas

Successfully implemented the MongoDB Mongoose persistence layer with serverless connection caching, core schemas (User, Wallet, DocumentRecord), and health check endpoint.

## What was built
- **Serverless Connection Manager**: `src/lib/mongodb.ts` implements global connection caching to prevent connection exhaustion in Vercel serverless execution.
- **User Schema**: `src/models/User.ts` includes email validation, mobile number validation, and role management ('user' | 'admin').
- **Wallet Schema**: `src/models/Wallet.ts` defines account balances with an embedded transaction audit ledger for credits and debits.
- **DocumentRecord Schema**: `src/models/DocumentRecord.ts` supports all 5 document types (`PAN`, `AADHAAR`, `VOTER`, `DL`, `RC`) with flexible data storage, missing field tracking (`missingFields: string[]`), and completeness flags.
- **API Health Check**: `src/app/api/health/route.ts` provides dynamic latency and MongoDB connectivity status.

## Verification
- `npm run build` compiled all routes, including dynamic route `/api/health`, in 1.8s with 0 errors.
