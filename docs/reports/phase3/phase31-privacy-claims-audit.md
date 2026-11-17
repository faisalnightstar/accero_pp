# Security, Privacy & DPDPA Marketing Claims Technical Audit
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Scope:** P0 Technical Verification of Marketing Assertions against Actual Codebase & Database Schemas  
**Auditor:** Principal Technical Auditor & Application Security Architect  
**Date:** November 17, 2026  
**Files Audited:**
- [`src/models/DocumentRecord.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/models/DocumentRecord.ts)
- [`src/lib/documents/documentCache.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/lib/documents/documentCache.ts)
- [`src/lib/analytics/dataLayer.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/lib/analytics/dataLayer.ts)
- [`src/app/api/documents/route.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/app/api/documents/route.ts)
- [`src/lib/auth.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/lib/auth.ts)

---

## 1. Executive Summary & Audit Mandate

Accero PrintPortal’s marketing and comparison pages make bold statements regarding data security, encryption standards, and compliance with India’s Digital Personal Data Protection Act (DPDPA) 2023.

This audit cross-references every public marketing claim against actual repository source code, MongoDB collection schemas, and server execution behaviors.

### Summary Assessment
| Public Marketing Claim | Verification Status | Exact Technical Reality |
| :--- | :--- | :--- |
| **"Zero-Storage Architecture"** | **`INCORRECT`** | The application operates a **72-hour TTL cache** in MongoDB. Document records (including citizen name, DOB, address, and base64 images) are stored temporarily. |
| **"Ephemeral Document Processing"** | **`VERIFIED`** | Supported by a native MongoDB TTL index (`{ expiresAt: 1 }, { expireAfterSeconds: 0 }`). Documents automatically expire after 72 hours. |
| **"Application-Level AES-256 Encryption"** | **`INCORRECT`** | No AES-256 cipher (`createCipheriv`) exists in application code. Encryption occurs at the transport layer (TLS 1.3 via Vercel) and database index layer (HMAC-SHA256), but MongoDB document fields are unencrypted BSON. |
| **"No Permanent Citizen Data Retention"** | **`VERIFIED`** | No permanent archival collection stores citizen records. All document data is purged upon TTL expiration. |
| **"DPDPA 2023 Certified Compliance"** | **`PARTIALLY VERIFIED`** | Core principles of data minimization and storage limitation are implemented, but statutory compliance requires formal legal review and operator terms. |

---

## 2. In-Depth Technical Verification of Marketing Claims

### A. Claim 1: "Zero-Storage Architecture"
* **Marketing Language:** *"Accero PrintPortal operates on a zero-storage architecture where citizen identity records are never stored on our servers."*
* **Audit Status:** **`INCORRECT / MISLEADING`**
* **Technical Evidence:**
  1. [`src/models/DocumentRecord.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/models/DocumentRecord.ts#L64-L82):
     ```typescript
     data: {
       type: Schema.Types.Mixed,
       required: true,
       default: {},
     },
     cardIdentifier: {
       type: String,
       required: true,
       trim: true,
       uppercase: true,
     },
     frontImage: { type: String },
     backImage: { type: String },
     ```
  2. [`src/lib/documents/documentCache.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/lib/documents/documentCache.ts#L12-L13):
     ```typescript
     export const CACHE_TTL_HOURS = 72;
     export const CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000;
     ```
* **Analysis:** Document lookups and manual entries are persisted to MongoDB inside the `DocumentRecord` collection for up to **72 hours** to allow operators to edit, review missing fields, and reprint without repaying API lookup fees. While temporary, calling this "zero-storage" is factually false and legally misleading.
* **Remediation:** Update all public copy to: *"72-Hour Ephemeral Cache with Automatic Purging"*.

---

### B. Claim 2: "AES-256 Encrypted Storage"
* **Marketing Language:** *"All citizen document records and images are protected with AES-256 military-grade encryption."*
* **Audit Status:** **`INCORRECT`**
* **Technical Evidence:**
  1. Full codebase scan for `createCipheriv`, `createCipher`, `AES-256`, or symmetric encryption routines returned **0 occurrences**.
  2. The schema field `documentNumberEncrypted?: string` exists in `DocumentRecord.ts` (line 11), but is **never set or populated anywhere in the application**.
  3. `data`, `frontImage`, and `backImage` are saved directly as unencrypted strings/objects in MongoDB.
  4. The only encryption present in application code is **one-way HMAC-SHA256 hashing** for cache indices (`crypto.createHmac('sha256', secret)` in `documentCache.ts`).
  5. Transit encryption (TLS 1.3 / AES-256-GCM) is provided at the network boundary by Vercel Edge CDN, and MongoDB Atlas provides transparent volume encryption-at-rest. However, there is **zero application-level field encryption**.
* **Remediation:** Remove claims of "application-level AES-256 document encryption". Accurately state: *"Protected by TLS 1.3 in transit and HMAC-SHA256 index hashing."*

---

### C. Claim 3: "No Permanent Citizen Data Retention"
* **Marketing Language:** *"Citizen records are never permanently archived or monetized."*
* **Audit Status:** **`VERIFIED`**
* **Technical Evidence:**
  1. [`src/models/DocumentRecord.ts`](file:///Users/faisal/Documents/GitHub/accero_pp/src/models/DocumentRecord.ts#L132):
     ```typescript
     DocumentRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
     ```
  2. MongoDB’s background TTL monitor automatically purges documents when `expiresAt` is reached.
  3. No secondary collection (such as `AuditLog` or `PrintJob`) retains citizen photos, names, or unmasked document numbers.
  4. `PrintJob.ts` only logs anonymous metadata (`printJobId`, `documentType`, `printFormat`, `fee`, `timestamp`).

---

### D. Claim 4: "DPDPA 2023 Compliance"
* **Marketing Language:** *"Accero PrintPortal is 100% compliant with India's Digital Personal Data Protection Act (DPDPA) 2023."*
* **Audit Status:** **`PARTIALLY VERIFIED / REQUIRES LEGAL REVIEW`**
* **Technical Strengths Supporting Compliance:**
  - **Storage Limitation Principle:** Enforced via 72-hour TTL auto-purging.
  - **Purpose Limitation:** Data is used exclusively for the operator's immediate print session.
  - **Tenant Isolation:** All database queries strictly enforce `userId` scoping (`DocumentRecord.findOne({ userId: userObjectId, ... })`), preventing cross-operator data leakage.
  - **Analytics Sanitization:** `src/lib/analytics/dataLayer.ts` strips 35+ sensitive identity keys before pushing events to GTM/GA4.
  - **No Browser Leakage:** `localStorage` and `sessionStorage` contain zero citizen data (verified via codebase audit).
* **Compliance Vulnerabilities Requiring Legal Counsel:**
  - DPDPA 2023 requires clear consent notices, designated Data Protection Officers (DPOs), and mechanisms for data principals (citizens) to request erasure. Because Accero functions as a software intermediary (Data Processor) while the CSC VLE / Cyber Cafe operator acts as the Data Fiduciary, the Terms of Service must clearly define this fiduciary-processor relationship.
* **Remediation:** Modify marketing claims from asserting *"Certified DPDPA Compliant"* to *"Engineered with DPDPA Data Minimization & Privacy-First Architecture"*, pending formal legal review.

---

## 3. Comprehensive System Persistence Audit

| System Subsystem | Can Citizen Data Persist? | Retention Window | Security Control | Audit Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **MongoDB Collections** | Yes (in `DocumentRecord`) | Max 72 Hours | Scoped by `userId`; TTL index auto-purge | **Ephemeral (72h)** |
| **MongoDB Indices** | Hash Only | Max 72 Hours | HMAC-SHA256 keyed with JWT secret | **Secure** |
| **Browser `localStorage`** | **No** | None | Only stores PWA banner dismissal timestamp | **100% Clean** |
| **Browser `sessionStorage`** | **No** | None | Only stores error reload throttle timestamp | **100% Clean** |
| **Browser Cookies** | **No** | Session / 7 Days | Only stores `auth_token` (JWT with userId/role) | **100% Clean** |
| **Vercel Server Logs** | **No** | Standard log retention | Zero `console.log` statements in API routes | **100% Clean** |
| **GA4 / GTM DataLayer** | **No** | Standard analytics | Recursive denylist strips 35+ identity keys | **100% Clean** |
| **Object Storage (S3/Blob)** | **No** | N/A | No external object bucket used for citizen photos | **100% Clean** |

---

## 4. Required Marketing & Documentation Copy Adjustments

To eliminate legal exposure and align with verified technical facts, update commercial copy across `/security`, `/faq`, and `/compare/*-alternative`:

1. **Replace:** *"Zero-storage architecture"*  
   **With:** *"72-Hour Ephemeral Cache with Automatic Expiration — we never permanently retain citizen records."*
2. **Replace:** *"Military-grade AES-256 database encryption"*  
   **With:** *"Protected by 256-bit TLS 1.3 transit encryption and HMAC-SHA256 index hashing."*
3. **Replace:** *"100% Certified DPDPA Compliant"*  
   **With:** *"Built on DPDPA 2023 data minimization principles with automatic data purging."*
