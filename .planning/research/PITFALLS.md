# Pitfalls Research

**Domain:** Document Verification & PVC Card Print Portal
**Researched:** 2026-09-28
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Physical Print Coordinate Drift on PVC Printers

**What goes wrong:**
When users press Print (`Ctrl+P`), text or barcodes print slightly shifted or cut off on physical PVC cards, wasting expensive blank plastic cards.

**Why it happens:**
Standard browsers apply default print margins (0.4 inches) and scale documents based on the connected printer's default paper size (A4 / Letter) rather than standard CR80 card dimensions (85.60 mm × 53.98 mm).

**How to avoid:**
1. Explicitly declare physical dimensions in CSS:
   ```css
   @page {
     size: 85.6mm 53.98mm;
     margin: 0;
   }
   ```
2. Provide a 1-click "Download Print-Ready PDF" option (using jsPDF with exact millimeter dimensions) in addition to browser print, giving operators predictable results regardless of browser settings.

**Warning signs:**
Print preview shows headers, footers, or blank margins around the card.

---

### Pitfall 2: Blocking or Crashing on Third-Party API Outages & Missing Fields

**What goes wrong:**
External government and third-party lookup APIs (NeoAPI, AxenAPI) frequently change endpoints, suffer latency, or return partial JSON with missing keys, resulting in unhandled exceptions or blank cards.

**Why it happens:**
Assuming external APIs return complete, uniform data every time.

**How to avoid:**
1. Enforce strict Zod schema parsing with `.optional()` and default fallbacks.
2. Build the split-screen live preview explicitly around missing-field detection, so partial data is treated as an ordinary workflow rather than an error condition.

**Warning signs:**
`TypeError: Cannot read properties of undefined` during card compilation.

---

### Pitfall 3: MongoDB Connection Exhaustion in Vercel Serverless Functions

**What goes wrong:**
In serverless environments like Vercel, each API route invocation can spawn a new container, creating new MongoDB connection pools and exhausting database connection limits.

**Why it happens:**
Calling `mongoose.connect()` inside Route Handlers without global connection caching.

**How to avoid:**
Use the standard Next.js cached connection pattern (`global.mongoose = { conn: null, promise: null }`).

**Warning signs:**
MongoDB Atlas alerts showing 100% max connection pool utilization during traffic spikes.

---

### Pitfall 4: Exposing Vendor API Keys in Next.js Client Bundles

**What goes wrong:**
Prefixing secret vendor keys (e.g. `NEO_API_KEY`) with `NEXT_PUBLIC_`, exposing paid credentials to anyone inspecting network requests in browser DevTools.

**Why it happens:**
Calling external verification APIs directly from client-side `fetch()` calls.

**How to avoid:**
Keep all third-party API keys purely server-side. All verification calls must execute inside Next.js Server Actions or server-only Route Handlers (`src/app/api/verify/...`).

---

### Pitfall 5: Wallet Race Conditions & Double Deductions

**What goes wrong:**
Users rapidly clicking "Generate Card" or opening multiple browser tabs trigger concurrent requests that either double-charge their wallet or allow overdrafting a zero balance.

**Why it happens:**
Non-atomic read-then-write operations (`if (balance >= fee) balance -= fee`).

**How to avoid:**
Use MongoDB atomic updates with balance condition checks:
`findOneAndUpdate({ _id: userId, balance: { $gte: serviceFee } }, { $inc: { balance: -serviceFee } })`.

---
*Pitfalls research: 2026-09-28*
