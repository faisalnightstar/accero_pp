# Phase 1: Foundation & Architecture Setup - Research

**Phase:** 01-foundation-architecture-setup
**Domain:** Next.js 15+ App Router, MongoDB Mongoose Serverless Caching, Tailwind Design Tokens & JWT Auth
**Researched:** 2026-09-28
**Confidence:** HIGH

## Overview & Scope

Phase 1 establishes the root application framework for PrintPortal Next.js. The codebase currently contains a brownfield legacy PHP folder (`printportal/`). The new full-stack Next.js 15+ project must be initialized in the workspace root without overwriting or interfering with legacy assets until card templates are migrated.

## Technical Architecture & Best Practices

### 1. Root Workspace Layout
- Next.js 15 App Router initialized in the root directory:
  - `src/app/` - App router pages, layouts, and route handlers.
  - `src/components/` - Shared UI components and layout blocks.
  - `src/lib/` - MongoDB client connection, auth utilities, and Zod schemas.
  - `src/models/` - Mongoose data models (`User`, `Wallet`).
- Preserves `printportal/` directory for ongoing reference of card template backgrounds and images.

### 2. MongoDB Mongoose Serverless Connection Caching
- **Problem:** Serverless functions create new database connection instances on cold starts, risking connection exhaustion.
- **Pattern:** Global cached connection module in `src/lib/mongodb.ts`:
  ```typescript
  import mongoose from 'mongoose';

  declare global {
    var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
  }

  let cached = global.mongoose;
  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
  }

  export async function connectToDatabase() {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/printportal', {
        bufferCommands: false,
      });
    }
    cached.conn = await cached.promise;
    return cached.conn;
  }
  ```

### 3. Design System & Brand Palette Tokens
- Adopts the exact hex tokens from `printportal/design.md`:
  - `--color-deep-burgundy: #8B1E2D`
  - `--color-crimson: #E63946`
  - `--color-gold: #F4D35E`
  - `--color-steel-blue: #457B9D`
  - `--color-navy: #1D3557`
  - `--color-bg-light: #F0F4F8`
  - `--color-card-surface: #FFFFFF`
- Configured in `tailwind.config.ts` and `src/app/globals.css`.

### 4. Authentication & Protected Routes
- Lightweight JWT authentication using standard HTTP-only cookies (`jose` or `jsonwebtoken` + `bcryptjs`).
- Password hashing with bcrypt (10 rounds).
- Edge-compatible `src/middleware.ts` guarding `/dashboard/*`, `/studio/*`, and `/wallet/*`.

## Validation Architecture

### Automated Verification
- Next.js build validation: `npm run build` exits with code 0.
- Database connectivity test: script or endpoint verifying MongoDB ping.
- Auth lifecycle test: register new user -> receive session cookie -> access protected dashboard -> log out.

---
*Phase 01 research: 2026-09-28*
