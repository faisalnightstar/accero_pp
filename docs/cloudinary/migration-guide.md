# Accero PrintPortal — Image Migration & Data Transition Guide

## 1. Existing Legacy Storage Architecture

In the legacy architecture:
- Operator cardholder portraits and signatures were read by `FileReader.readAsDataURL()` as multi-megabyte base64 strings (`data:image/jpeg;base64,...`).
- These strings were directly persisted in MongoDB documents under `DocumentRecord.data.photoUrl`, `DocumentRecord.data.signatureUrl`, `DocumentRecord.frontImage`, and `DocumentRecord.backImage`.
- **Impact:** MongoDB BSON documents frequently inflated to 2MB–8MB each, leading to high RAM utilization, slow index operations, and bloated network payloads during studio card lookups.

---

## 2. Target Modern Storage Architecture

Under the new architecture:
- Binary buffers and base64 strings are completely eliminated from MongoDB persistence for new uploads.
- The `DocumentRecord` schema holds:
  - `data.photoUrl`: Points to the Cloudinary CDN URL (`https://res.cloudinary.com/...`).
  - `photoMetadata`: Typed subdocument with Cloudinary asset details:
    ```json
    {
      "provider": "cloudinary",
      "publicId": "accero/production/services/pan/d4a3b8e2-...",
      "assetId": "9b12c8...",
      "secureUrl": "https://res.cloudinary.com/...",
      "resourceType": "image",
      "format": "jpg",
      "bytes": 4500,
      "width": 1000,
      "height": 1000,
      "folder": "accero/production/services/pan",
      "uploadedAt": "2026-11-17T07:15:00.000Z",
      "accessMode": "authenticated"
    }
    ```
- **Backward Compatibility:** All existing documents with base64 strings continue to render without interruption through `resolveImageUrl()` and `CloudinaryImage.tsx`.

---

## 3. Migration Procedure

The migration utility is located at:
`src/lib/media/image-migration.ts`

### Migration Principles
1. **Zero Downtime:** Operates asynchronously in background batches without locking active collections.
2. **Idempotency:** Only records with `imageMigrationStatus !== 'MIGRATED'` are queried. Re-running the script skips already-migrated records.
3. **Data Loss Prevention:** The original base64 string is temporarily preserved in `data._legacyPhotoUrl`, `data._legacySignatureUrl`, and `_legacyFrontImage` until post-migration verification passes.
4. **Retry Mechanism:** If a network failure occurs, `imageMigrationStatus` is flagged `FAILED` with `imageMigrationError` detailing the reason, allowing targeted retries.

### Running the Migration

To run a dry run (evaluates candidates without modifying the database):
```typescript
import { runImageMigration } from '@/lib/media/image-migration';

const report = await runImageMigration({
  batchSize: 50,
  dryRun: true,
});
console.log(report);
```

To execute a live batch migration:
```typescript
import { runImageMigration } from '@/lib/media/image-migration';

const report = await runImageMigration({
  batchSize: 50,
  dryRun: false,
  forceRetry: false,
});
console.log(report);
```

---

## 4. Verification and Rollback

### Asset Verification
Before any cleanup, the utility validates asset existence on Cloudinary:
```typescript
import { verifyMigratedDocument } from '@/lib/media/image-migration';

const check = await verifyMigratedDocument(docId);
if (!check.verified) {
  console.error('Asset missing or inaccessible:', check.error);
}
```

### Rollback Procedure
If a migration batch needs to be rolled back to the legacy state:
```typescript
import DocumentRecord from '@/models/DocumentRecord';

await DocumentRecord.updateMany(
  { 'data._legacyPhotoUrl': { $exists: true } },
  [
    {
      $set: {
        'data.photoUrl': '$data._legacyPhotoUrl',
        imageMigrationStatus: 'UNMIGRATED',
      },
    },
    {
      $unset: ['photoMetadata', 'data._legacyPhotoUrl'],
    },
  ]
);
```

---

## 5. Controlled Post-Migration Cleanup

> [!CAUTION]
> Legacy base64 strings must NEVER be deleted automatically without explicit approval and verified asset accessibility.

Once all migrated documents have been verified over a 14-day production observation window, run the cleanup procedure:
```typescript
import { cleanupLegacyBase64Data } from '@/lib/media/image-migration';

const cleanupReport = await cleanupLegacyBase64Data({
  confirmedApproval: true,
  batchSize: 100,
});
console.log(cleanupReport);
```
This purges `_legacyPhotoUrl`, `_legacySignatureUrl`, and `_legacyFrontImage`, liberating gigabytes of database storage while maintaining zero broken images.
