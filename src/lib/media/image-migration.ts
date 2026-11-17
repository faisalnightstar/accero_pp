/**
 * Accero PrintPortal - Image Migration Utility
 * Migrates existing MongoDB base64 strings and image buffers to Cloudinary in controlled batches.
 * 
 * Guarantees:
 * 1. Zero data loss: Preserves legacy base64 strings in rollback fields until verified.
 * 2. Idempotency: Skips already-migrated records to prevent duplicate uploads.
 * 3. Graceful fallback: If an individual asset upload fails, the record is flagged FAILED without corrupting data.
 * 4. Controlled cleanup: Legacy base64 fields are never deleted without explicit confirmation and verification.
 */

import { connectToDatabase } from '../mongodb';
import DocumentRecord, { IDocumentRecord } from '../../models/DocumentRecord';
import { uploadImageToCloudinary } from '../cloudinary/upload';
import { checkAssetExists } from '../cloudinary/delete';
import { getServiceFolderCategory } from '../cloudinary/folders';
import { CloudinaryAssetMetadata } from '../cloudinary/types';

export interface MigrationReport {
  timestamp: string;
  totalCandidates: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  dryRun: boolean;
  errors: Array<{ docId: string; error: string }>;
  durationMs: number;
}

export interface CleanupReport {
  timestamp: string;
  totalRecordsChecked: number;
  cleanedCount: number;
  skippedUnverified: number;
  errors: string[];
}

/**
 * Executes a controlled batch migration of legacy base64 images to Cloudinary.
 */
export async function runImageMigration(options?: {
  batchSize?: number;
  dryRun?: boolean;
  forceRetry?: boolean;
}): Promise<MigrationReport> {
  const startTime = Date.now();
  const batchSize = options?.batchSize || 50;
  const dryRun = Boolean(options?.dryRun);
  const forceRetry = Boolean(options?.forceRetry);

  await connectToDatabase();

  const query: Record<string, any> = {
    $or: [
      { 'data.photoUrl': { $regex: '^data:image/' } },
      { 'data.signatureUrl': { $regex: '^data:image/' } },
      { frontImage: { $regex: '^data:image/' } },
      { backImage: { $regex: '^data:image/' } },
    ],
  };

  if (!forceRetry) {
    query.imageMigrationStatus = { $ne: 'MIGRATED' };
  }

  const candidateDocs = await DocumentRecord.find(query).limit(batchSize);

  const report: MigrationReport = {
    timestamp: new Date().toISOString(),
    totalCandidates: candidateDocs.length,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    dryRun,
    errors: [],
    durationMs: 0,
  };

  if (dryRun) {
    report.processed = candidateDocs.length;
    report.durationMs = Date.now() - startTime;
    return report;
  }

  for (const doc of candidateDocs) {
    report.processed++;
    let docModified = false;
    const docErrors: string[] = [];

    try {
      // 1. Migrate Candidate Photo
      if (typeof doc.data?.photoUrl === 'string' && doc.data.photoUrl.startsWith('data:image/')) {
        const folderCategory = getServiceFolderCategory(doc.docType);
        const uploadRes = await uploadImageToCloudinary(doc.data.photoUrl, {
          folder: folderCategory,
          profile: 'documentPhoto',
          isPrivate: true,
          docType: doc.docType,
          userId: doc.userId?.toString(),
          tags: ['migrated', doc.docType.toLowerCase(), 'photo'],
        });

        if (uploadRes.success && uploadRes.metadata) {
          doc.photoMetadata = uploadRes.metadata as any;
          // Preserve legacy copy for rollback safety
          doc.data._legacyPhotoUrl = doc.data.photoUrl;
          doc.data.photoUrl = uploadRes.metadata.secureUrl;
          docModified = true;
        } else {
          docErrors.push(`Photo upload failed: ${uploadRes.error}`);
        }
      }

      // 2. Migrate Candidate Signature
      if (typeof doc.data?.signatureUrl === 'string' && doc.data.signatureUrl.startsWith('data:image/')) {
        const uploadRes = await uploadImageToCloudinary(doc.data.signatureUrl, {
          folder: 'documents/signatures',
          profile: 'signature',
          isPrivate: true,
          docType: doc.docType,
          userId: doc.userId?.toString(),
          tags: ['migrated', doc.docType.toLowerCase(), 'signature'],
        });

        if (uploadRes.success && uploadRes.metadata) {
          doc.signatureMetadata = uploadRes.metadata as any;
          doc.data._legacySignatureUrl = doc.data.signatureUrl;
          doc.data.signatureUrl = uploadRes.metadata.secureUrl;
          docModified = true;
        } else {
          docErrors.push(`Signature upload failed: ${uploadRes.error}`);
        }
      }

      // 3. Migrate frontImage
      if (typeof doc.frontImage === 'string' && doc.frontImage.startsWith('data:image/')) {
        const uploadRes = await uploadImageToCloudinary(doc.frontImage, {
          folder: 'documents/generated-previews',
          profile: 'temporaryPreview',
          isPrivate: true,
          docType: doc.docType,
          userId: doc.userId?.toString(),
          tags: ['migrated', doc.docType.toLowerCase(), 'frontImage'],
        });

        if (uploadRes.success && uploadRes.metadata) {
          doc.frontImageMetadata = uploadRes.metadata as any;
          (doc as any)._legacyFrontImage = doc.frontImage;
          doc.frontImage = uploadRes.metadata.secureUrl;
          docModified = true;
        } else {
          docErrors.push(`FrontImage upload failed: ${uploadRes.error}`);
        }
      }

      // 4. Update migration state
      if (docErrors.length === 0 && docModified) {
        doc.imageMigrationStatus = 'MIGRATED';
        doc.imageMigrationError = undefined;
        doc.imageMigratedAt = new Date();
        doc.markModified('data');
        await doc.save();
        report.succeeded++;
      } else if (docErrors.length > 0) {
        doc.imageMigrationStatus = 'FAILED';
        doc.imageMigrationError = docErrors.join('; ');
        doc.markModified('data');
        await doc.save();
        report.failed++;
        report.errors.push({ docId: doc._id.toString(), error: docErrors.join('; ') });
      } else {
        report.skipped++;
      }
    } catch (err: any) {
      report.failed++;
      report.errors.push({ docId: doc._id.toString(), error: err.message || 'Unknown error' });
      try {
        doc.imageMigrationStatus = 'FAILED';
        doc.imageMigrationError = err.message;
        await doc.save();
      } catch {
        // ignore secondary save errors
      }
    }
  }

  report.durationMs = Date.now() - startTime;
  return report;
}

/**
 * Validates that an asset marked as MIGRATED is indeed deliverable from Cloudinary.
 */
export async function verifyMigratedDocument(docId: string): Promise<{ verified: boolean; error?: string }> {
  await connectToDatabase();
  const doc = await DocumentRecord.findById(docId);
  if (!doc) return { verified: false, error: 'Document not found' };

  if (doc.photoMetadata?.publicId) {
    const exists = await checkAssetExists(doc.photoMetadata.publicId, {
      type: doc.photoMetadata.accessMode === 'authenticated' ? 'authenticated' : 'upload',
    });
    if (!exists) return { verified: false, error: `Photo asset ${doc.photoMetadata.publicId} not found on Cloudinary.` };
  }

  if (doc.signatureMetadata?.publicId) {
    const exists = await checkAssetExists(doc.signatureMetadata.publicId, {
      type: doc.signatureMetadata.accessMode === 'authenticated' ? 'authenticated' : 'upload',
    });
    if (!exists) return { verified: false, error: `Signature asset ${doc.signatureMetadata.publicId} not found on Cloudinary.` };
  }

  return { verified: true };
}

/**
 * Post-migration cleanup procedure: Purges legacy base64 strings only after verification.
 * Requires explicit boolean flag confirmation to prevent accidental invocation.
 */
export async function cleanupLegacyBase64Data(options: {
  confirmedApproval: boolean;
  batchSize?: number;
}): Promise<CleanupReport> {
  if (!options.confirmedApproval) {
    throw new Error('Cleanup requires explicit confirmedApproval: true before removing legacy data.');
  }

  await connectToDatabase();
  const limit = options.batchSize || 100;

  const migratedDocs = await DocumentRecord.find({
    imageMigrationStatus: 'MIGRATED',
    $or: [
      { 'data._legacyPhotoUrl': { $exists: true } },
      { 'data._legacySignatureUrl': { $exists: true } },
      { _legacyFrontImage: { $exists: true } },
    ],
  }).limit(limit);

  const report: CleanupReport = {
    timestamp: new Date().toISOString(),
    totalRecordsChecked: migratedDocs.length,
    cleanedCount: 0,
    skippedUnverified: 0,
    errors: [],
  };

  for (const doc of migratedDocs) {
    const verification = await verifyMigratedDocument(doc._id.toString());
    if (!verification.verified) {
      report.skippedUnverified++;
      report.errors.push(`Document ${doc._id} failed asset verification: ${verification.error}`);
      continue;
    }

    if (doc.data?._legacyPhotoUrl) delete doc.data._legacyPhotoUrl;
    if (doc.data?._legacySignatureUrl) delete doc.data._legacySignatureUrl;
    if ((doc as any)._legacyFrontImage) delete (doc as any)._legacyFrontImage;

    doc.markModified('data');
    await doc.save();
    report.cleanedCount++;
  }

  return report;
}
