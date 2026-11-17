# Accero PrintPortal — Privacy, Retention & Security Architecture
**Project:** Accero PrintPortal (`https://printportal.accero.app`)  
**Phase:** 3.1.2 Privacy Implementation & Data Governance Report  
**Date:** November 17, 2026  
**Auditor:** Application Security Engineer & Data Privacy Specialist  
**Authoritative Source Code:** `src/models/DocumentRecord.ts`, `src/lib/documents/documentCache.ts`, `src/lib/analytics/events.ts`  

---

## 1. Executive Summary & Marketing Claim Corrections

Earlier marketing drafts contained inaccurate and legally hazardous claims:
* Claimed *"Zero-Storage Architecture"* $\rightarrow$ **Correction:** The system temporarily persists document records to facilitate user previews, missing-data editing, and session-based ₹0 re-prints.
* Claimed *"Application-Level AES-256 GCM Encryption in Code"* $\rightarrow$ **Correction:** Encryption-at-rest is enforced at the cloud storage / database volume layer, and in-transit encryption is enforced via modern TLS 1.3 / HTTPS. The application uses **HMAC-SHA256 for deterministic hash indexing**, not encryption.
* Claimed *"100% Certified DPDPA Compliance"* $\rightarrow$ **Correction:** The codebase implements technical data minimization and automated TTL expiration aligned with DPDPA principles, but statutory compliance requires formal legal review.

All public pages (`/security`, `/privacy-policy`, `/faq`, `/features`, `/compare/*-alternative`) have been updated in code to reflect the true, verified technical implementation.

---

## 2. Technical Document Storage & Retention Mechanics

### 2.1 The 72-Hour Ephemeral Cache
Document records are stored in the MongoDB collection `documentrecords` (`src/models/DocumentRecord.ts`). The retention window is strictly bounded:

```typescript
// src/lib/documents/documentCache.ts
export const CACHE_TTL_HOURS = 72;
export const CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000;
```

When a document record is created or updated, `expiresAt` is calculated deterministically:
$$\text{expiresAt} = \text{Date.now}() + \text{CACHE\_TTL\_MS}$$

### 2.2 Dual-Layer Expiration Enforcement
1. **Database Layer (MongoDB TTL Background Worker):**
   ```typescript
   // src/models/DocumentRecord.ts:132
   DocumentRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
   ```
   MongoDB's background TTL thread periodically scans this index and purges expired documents from disk.
2. **Application Layer (Fail-Safe Code Check):**
   Because MongoDB's background TTL thread runs asynchronously (typically once every 60 seconds), the application enforces a secondary synchronous expiration check:
   ```typescript
   // src/lib/documents/documentCache.ts:113
   export function isDocumentCacheValid(doc: IDocumentRecord | null | undefined): boolean {
     if (!doc || !doc.expiresAt) return false;
     return new Date(doc.expiresAt).getTime() > Date.now();
   }
   ```
   If a document's `expiresAt` timestamp has passed, the application treats it as a cache miss and will never return expired data to the user or API.

### 2.3 Deterministic HMAC-SHA256 Index Hashing
To prevent plaintext identity numbers (Aadhaar, PAN, Voter, DL, RC) from appearing in database query indexes, index lookups are executed using a deterministic one-way HMAC-SHA256 hash:
```typescript
// src/lib/documents/documentCache.ts:96
const hash = crypto
  .createHmac('sha256', secret)
  .update(`${normalizedType}:${normalizedId}`)
  .digest('hex');
```
* **Security Function:** Plaintext identity numbers are not used as primary lookup keys in database queries.
* **Legal Precision:** HMAC-SHA256 is an authentication and hashing algorithm, **not reversible encryption**. It must never be described as encryption in public documentation.

---

## 3. Multi-Tenant Operator Isolation

All document queries strictly enforce tenant scoping:
```typescript
// src/lib/documents/documentCache.ts:147
const query: Record<string, any> = {
  userId: new mongoose.Types.ObjectId(userId),
  docType: normalizedType,
  $or: [{ cardIdentifier: normalizedId }, { documentNumberHash: hash }],
};
```
No operator can retrieve, inspect, or modify another operator's document cache records.

---

## 4. Known Technical Limitations & Operational Realities

1. **MongoDB Asynchronous Purging:**
   MongoDB TTL deletion occurs in background cycles. A document is not wiped from disk at the exact millisecond of expiration, though the application layer blocks access immediately.
2. **Cloud Backups & Snapshots:**
   Routine automated cloud database snapshots (e.g. daily Atlas backups) contain historical database states until the backup retention window elapses. Application-level TTL indexes do not rewrite existing immutable snapshot files.
3. **Upstream Government APIs:**
   When an external lookup query is made to upstream provider endpoints, Accero cannot control or audit how long the upstream provider retains request logs or IP addresses.

---

## 5. Required External Dependencies & Legal Counsel Scope

The following items are outside the scope of software engineering and require formal external review:

1. **Data Fiduciary vs. Data Processor Characterization:**
   Under the Digital Personal Data Protection (DPDP) Act, 2023, whether an operator or Accero is classified as a Data Fiduciary or Data Processor depends on the commercial Terms of Service and contractual processing agreements. Legal counsel must draft and approve these clauses.
2. **Third-Party Provider DPDP Addenda:**
   Agreements with third-party verification providers must incorporate standard statutory data processing clauses prohibiting unauthorized secondary retention.
