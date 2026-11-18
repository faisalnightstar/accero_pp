# Lookup Record Migration Plan & Execution Report

**Accero PrintPortal Database Migration Specification**  
**Database:** MongoDB Atlas (`accero_pp`)  
**Script:** `scripts/migrate-lookup-relationships.js`  
**Execution Date:** 2026-11-18  
**Status:** Executed & Verified

---

## 1. Migration Overview & Safety Objectives

The migration establishes explicit foreign key relationships (`documentRecordId`) between legacy `panlookuprecords` and canonical `documentrecords`, backfilling deterministic HMAC-SHA256 hashes (`documentNumberHash`) and standardizing document discriminators (`docType: 'PAN'`).

### Core Safety Directives
1. **Zero Collection Deletions**: Under no circumstances was any collection dropped.
2. **Zero Document Deletions**: Every historical lookup and document record was preserved.
3. **Dry-Run Preflight**: All operations were tested in dry-run mode prior to write authorization.
4. **Instant Reversibility**: A native `--rollback` flag exists to revert foreign key linking if required.
5. **No Data Overwrites**: Customer-edited values in `documentrecords` were strictly protected.

---

## 2. Pre-Migration Live Database Audit (Atlas `accero_pp`)

An empirical inspection of the production database prior to migration revealed the following counts:

| Collection | Pre-Migration Count | Status | Notes |
| :--- | :--- | :--- | :--- |
| `panlookuprecords` | **7** | Audited | 5 FAILED attempts, 2 SUCCESS attempts. All 7 had `docRecordId: MISSING`. |
| `documentrecords` | **15** | Canonical | 7 PAN documents, including matching records for `AGQPF8064M` and `BYRPT6403J`. |
| `verificationrequests` | **4** | Audited | 2 Voter records had `docId`; 2 PAN records had `docId: MISSING`. |
| `wallets` | **8** | Verified | Contains matching `PAN_LOOKUP` debit transactions. |
| `printjobs` | **31** | Unchanged | Physical card print audit records. |

### Record-Level Findings:
```
[panlookuprecords]
- 6afc8e051a1b51d38de4a199 | PAN: AGQPF8064M | status: FAILED  | fee: 0  | txRef: null                                       | docRecordId: MISSING
- 6afc8e721a1b51d38de4a1b9 | PAN: AGQPF8064M | status: FAILED  | fee: 0  | txRef: null                                       | docRecordId: MISSING
- 6afc8ecc1a1b51d38de4a1d9 | PAN: AGQPF8064M | status: FAILED  | fee: 0  | txRef: null                                       | docRecordId: MISSING
- 6afc8ed81a1b51d38de4a1da | PAN: AGQPF8064M | status: FAILED  | fee: 0  | txRef: null                                       | docRecordId: MISSING
- 6afc904d1a1b51d38de4a219 | PAN: AGQPF8064M | status: FAILED  | fee: 0  | txRef: null                                       | docRecordId: MISSING
- 6afc96b02352ef522cb99e9b | PAN: AGQPF8064M | status: SUCCESS | fee: 0  | txRef: PAN_LOOKUP:6abaa8e7c4ceea0172ba72d5:...   | docRecordId: MISSING
- 6afc97bc2352ef522cb99ebf | PAN: BYRPT6403J | status: SUCCESS | fee: 10 | txRef: PAN_LOOKUP:6abaa8e7c4ceea0172ba72d5:...   | docRecordId: MISSING
```

---

## 3. Migration Procedure & CLI Interface

The migration engine was authored as an idempotent, fail-safe script located at `scripts/migrate-lookup-relationships.js`.

### Commands
```bash
# 1. Preflight dry-run (read-only inspection)
node scripts/migrate-lookup-relationships.js --dry-run

# 2. Live write execution
node scripts/migrate-lookup-relationships.js --execute

# 3. Emergency rollback (if needed)
node scripts/migrate-lookup-relationships.js --rollback
```

### Action Logic
1. **Successful Lookups (`status: 'SUCCESS'`)**:
   - Queries `documentrecords` for matching `{ userId: lookup.userId, docType: 'PAN', cardIdentifier: lookup.panNumber }`.
   - Validates associated wallet ledger debit transaction.
   - Sets `documentRecordId = doc._id`, `docType = 'PAN'`, and `documentNumberHash = HMAC(PAN)`.
   - Simultaneously updates matching `verificationrequests` with `documentId = doc._id`.
2. **Failed Lookups (`status: 'FAILED'`)**:
   - Sets `documentRecordId = null`, `docType = 'PAN'`, and `documentNumberHash = HMAC(PAN)`.
   - Guarantees no phantom document records are synthesized.

---

## 4. Execution Logs & Outcome

### Dry-Run Output:
```
========================================================================
Accero PrintPortal - Database Audit & Relationship Migration
Mode: DRY-RUN (INSPECTION ONLY)
========================================================================

Found 7 records in panlookuprecords to analyze.

Migration Analysis Summary:
 - Total Records:               7
 - Successful Lookups to Link:  2
 - Already Linked:              0
 - Failed Lookups (Audited):    5
 - Orphaned Lookups (No Doc):   0
 - Verified Wallet Debits:      2
 - Missing Wallet Debits:       0

Action Plan:
 [FAILED] AGQPF8064M (ID: 6afc8e051a1b51d38de4a199) -> Action: SET_HASH_ONLY (DocId: N/A)
 [FAILED] AGQPF8064M (ID: 6afc8e721a1b51d38de4a1b9) -> Action: SET_HASH_ONLY (DocId: N/A)
 [FAILED] AGQPF8064M (ID: 6afc8ecc1a1b51d38de4a1d9) -> Action: SET_HASH_ONLY (DocId: N/A)
 [FAILED] AGQPF8064M (ID: 6afc8ed81a1b51d38de4a1da) -> Action: SET_HASH_ONLY (DocId: N/A)
 [FAILED] AGQPF8064M (ID: 6afc904d1a1b51d38de4a219) -> Action: SET_HASH_ONLY (DocId: N/A)
 [SUCCESS] AGQPF8064M (ID: 6afc96b02352ef522cb99e9b) -> Action: LINK_DOCUMENT_RECORD (DocId: 6aef96dcac8f892d63b3acd4)
 [SUCCESS] BYRPT6403J (ID: 6afc97bc2352ef522cb99ebf) -> Action: LINK_DOCUMENT_RECORD (DocId: 6afc97bc45b32d3c1a72c7ca)
```

### Live Execution Output:
```
========================================================================
Accero PrintPortal - Database Audit & Relationship Migration
Mode: EXECUTE (LIVE WRITES)
========================================================================

Found 7 records in panlookuprecords to analyze.
...
[Execute] Applying updates to MongoDB Atlas...
[Execute] Migration successfully committed to database!
```

### Post-Migration Verification:
A follow-up dry-run confirmed that **100% of successful lookup records are now linked** (`Already Linked: 2`), with 0 unlinked records and 0 orphans.

---

## 5. Rollback Plan

If a rollback is required for operational reasons:
1. Run:
   ```bash
   node scripts/migrate-lookup-relationships.js --rollback
   ```
2. The script executes:
   ```javascript
   await panColl.updateMany(
     { documentRecordId: { $ne: null } },
     { $unset: { documentRecordId: '', documentNumberHash: '' } }
   );
   ```
3. Application code continues functioning safely due to null-safe accessors (`record.documentRecordId || null`).
