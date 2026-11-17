# Accero PrintPortal - Database Migration & Index Strategy Guide

This document defines the production database index specifications, migration scripts, and schema evolution rules for MongoDB / Atlas powering Accero PrintPortal.

---

## 1. Overview of Indexing Architecture

To support high-concurrency wallet operations, idempotent payment gateway processing, 72-hour document caching, print billing authorization, and audit query compliance, the following indexes are required across core collections:

1. **`payments`**: Unique constraints on gateway and internal order identifiers to enforce strict idempotency.
2. **`wallets`**: Unique constraint on `userId` to guarantee one ledger per user; transaction history indexing.
3. **`printjobs`**: Unique constraint on `printJobId` to enforce strict print billing idempotency.
4. **`documentrecords`**: TTL index on `expiresAt` for automatic cleanup after 72 hours; compound indexes on `(userId, docType, cardIdentifier)` and `(userId, docType, documentNumberHash)` for tenant-isolated database-first lookup.
5. **`manualrechargerequests`**: Status indexing for admin review queue filtering.
6. **`ratelimits`**: TTL index on `expiresAt` for automatic cleanup of stale rate-limit counters.
7. **`auditlogs`**: Compound index on `(actorId, createdAt)` and `(action, createdAt)` for compliance and security forensics.

---

## 2. Mongo Shell Migration Script (`migrate-indexes.js`)

You can execute the following script in `mongosh` connected to your staging or production MongoDB replica set:

```javascript
/**
 * Accero PrintPortal - Production Index Creation Script
 * Database: printportal (or target database specified in connection URI)
 */

const db = db.getSiblingDB('printportal');

print('=== Starting Accero PrintPortal Index Migration ===');

// 1. Payments Collection
print('Creating indexes for: payments');
db.payments.createIndex({ orderId: 1 }, { unique: true, name: 'uniq_payments_orderId' });
db.payments.createIndex({ paymentId: 1 }, { unique: true, sparse: true, name: 'uniq_payments_paymentId' });
db.payments.createIndex({ userId: 1, createdAt: -1 }, { name: 'idx_payments_userId_createdAt' });
db.payments.createIndex({ status: 1 }, { name: 'idx_payments_status' });

// 2. Wallets Collection
print('Creating indexes for: wallets');
db.wallets.createIndex({ userId: 1 }, { unique: true, name: 'uniq_wallets_userId' });
db.wallets.createIndex({ 'transactions.createdAt': -1 }, { name: 'idx_wallets_tx_createdAt' });
db.wallets.createIndex({ 'transactions.referenceId': 1 }, { sparse: true, name: 'idx_wallets_tx_referenceId' });

// 3. PrintJobs Collection (Print Billing & Idempotency)
print('Creating indexes for: printjobs');
db.printjobs.createIndex({ printJobId: 1 }, { unique: true, name: 'uniq_printjobs_printJobId' });
db.printjobs.createIndex({ userId: 1, createdAt: -1 }, { name: 'idx_printjobs_userId_createdAt' });
db.printjobs.createIndex({ documentId: 1 }, { sparse: true, name: 'idx_printjobs_documentId' });
db.printjobs.createIndex({ userId: 1, documentType: 1, cardIdentifier: 1 }, { name: 'idx_printjobs_user_doc' });

// 4. DocumentRecords Collection (72-Hour Cache & Fast Lookup)
print('Creating indexes for: documentrecords');
db.documentrecords.createIndex({ userId: 1, docType: 1, cardIdentifier: 1 }, { name: 'idx_doc_user_type_id' });
db.documentrecords.createIndex({ userId: 1, docType: 1, documentNumberHash: 1 }, { name: 'idx_doc_user_type_hash' });
db.documentrecords.createIndex({ userId: 1, expiresAt: 1 }, { name: 'idx_doc_user_expiresAt' });
// Automatic TTL cleanup: documents expire automatically when expiresAt timestamp is reached
db.documentrecords.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'ttl_documentrecords_expiresAt' });

// 5. Manual Recharge Requests Collection
print('Creating indexes for: manualrechargerequests');
db.manualrechargerequests.createIndex({ status: 1, createdAt: -1 }, { name: 'idx_manualrecharge_status_createdAt' });
db.manualrechargerequests.createIndex({ userId: 1, createdAt: -1 }, { name: 'idx_manualrecharge_userId_createdAt' });
db.manualrechargerequests.createIndex({ utrNumber: 1 }, { name: 'idx_manualrecharge_utrNumber' });

// 6. Rate Limits Collection (TTL Index)
print('Creating indexes for: ratelimits');
db.ratelimits.createIndex({ identifier: 1, action: 1 }, { unique: true, name: 'uniq_ratelimit_id_action' });
db.ratelimits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'ttl_ratelimits_expiresAt' });

// 7. Security Audit Logs Collection
print('Creating indexes for: auditlogs');
db.auditlogs.createIndex({ actorId: 1, createdAt: -1 }, { name: 'idx_audit_actor_created' });
db.auditlogs.createIndex({ action: 1, createdAt: -1 }, { name: 'idx_audit_action_created' });
db.auditlogs.createIndex({ resourceId: 1, createdAt: -1 }, { name: 'idx_audit_resource_created' });
db.auditlogs.createIndex({ createdAt: -1 }, { name: 'idx_audit_created' });

// 8. Users Collection
print('Creating indexes for: users');
db.users.createIndex({ email: 1 }, { unique: true, name: 'uniq_users_email' });
db.users.createIndex({ phone: 1 }, { sparse: true, name: 'idx_users_phone' });
db.users.createIndex({ role: 1 }, { name: 'idx_users_role' });

print('=== Accero PrintPortal Index Migration Completed Successfully ===');
```

---

## 3. Legacy Document Records Backfill Script (`backfill-legacy-documents.js`)

For legacy `documentrecords` that were created prior to the 72-hour caching and hashing engine:
- If `fetchedAt` is missing, backfill using `createdAt`.
- For legacy records without a known verified timestamp, do NOT mark them as freshly verified; set `expiresAt` to `new Date(0)` (expired) so the next user lookup triggers a fresh provider verification without destroying their saved layouts.
- Populate `documentNumberHash` for fast HMAC lookup.

```javascript
/**
 * Accero PrintPortal - Legacy Document Records Migration
 * Usage: mongosh <connection_string> backfill-legacy-documents.js
 */
const crypto = require('crypto');
const db = db.getSiblingDB('printportal');

const secret = process.env.JWT_SECRET || 'accero_secure_cache_salt_fallback_min_32';

print('Starting legacy document record backfill...');
let updated = 0;

const cursor = db.documentrecords.find({
  $or: [
    { expiresAt: { $exists: false } },
    { documentNumberHash: { $exists: false } },
  ],
});

while (cursor.hasNext()) {
  const doc = cursor.next();
  const docType = (doc.docType || 'PAN').toUpperCase();
  const cardId = (doc.cardIdentifier || '').trim().toUpperCase();

  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${docType}:${cardId}`)
    .digest('hex');

  const updateFields = {
    documentNumberHash: hash,
  };

  if (!doc.fetchedAt) {
    updateFields.fetchedAt = doc.createdAt || new Date();
  }

  // Legacy records without an explicit verified timestamp are set as expired
  // to avoid serving stale unverified data as fresh.
  if (!doc.expiresAt) {
    updateFields.expiresAt = new Date(0);
    updateFields.status = 'ACTIVE';
  }

  db.documentrecords.updateOne({ _id: doc._id }, { $set: updateFields });
  updated++;
}

print(`Backfill completed. Updated ${updated} document records.`);
```

---

## 4. Schema Verification & Backward Compatibility

### Document Records Collection
- **`expiresAt`**: Standardized to `fetchedAt + 72 hours`. Application-level queries explicitly filter `expiresAt: { $gt: new Date() }`.
- **`docType`**: Supports `'PAN' | 'AADHAAR' | 'VOTER' | 'DL' | 'RC' | 'RATION'`.
- **Zero Data Loss**: Existing manual and API-generated card records are fully preserved.

### Print Jobs Collection
- **`printJobId`**: Every print operation generates a client-side UUID `pj_<uuid>`. Retries return the existing authorization record idempotently.
- **Financial Balance Invariant**: `balance >= fee` enforced atomically on the `wallets` collection.
