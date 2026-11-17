/**
 * Accero PrintPortal - Cloudinary Asset Replacement & Automatic Cleanup Engine
 * 
 * Enforces safe replacement of photographs, signatures, previews, and avatars.
 * Guarantees that:
 * 1. Old assets are NEVER deleted before the new image is validated, compressed, uploaded,
 *    verified on Cloudinary, and persisted in MongoDB.
 * 2. Failures at any stage preserve the working original image intact.
 * 3. Deletion failures do not revert the new image; they are enqueued into AssetCleanupQueue for safe retry.
 * 4. Shared or multiply-referenced assets are NEVER deleted.
 * 5. Deletions are strictly idempotent.
 */

import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import DocumentRecord, { IDocumentRecord, ICloudinaryAssetSubdocument } from '@/models/DocumentRecord';
import User, { IUser } from '@/models/User';
import AssetCleanupQueue, { IAssetCleanupQueue } from '@/models/AssetCleanupQueue';
import { uploadImageToCloudinary } from './upload';
import { deleteImageFromCloudinary, checkAssetExists } from './delete';
import { isAssetReferencedElsewhere } from './assetReferences';
import { CloudinaryFolderCategory, CompressionProfileName } from './types';
import { getServiceFolderCategory } from './folders';

export type AssetCleanupStatus =
  | 'COMPLETED'
  | 'PENDING_RETRY'
  | 'SKIPPED_REFERENCED'
  | 'SKIPPED_SAME_ASSET'
  | 'SKIPPED_NO_PREVIOUS'
  | 'FAILED';

export interface AssetReplacementResult {
  success: boolean;
  replacementStatus: 'SUCCESS' | 'FAILED';
  cleanupStatus: AssetCleanupStatus;
  newAsset?: ICloudinaryAssetSubdocument;
  oldAsset?: {
    publicId?: string;
    assetId?: string;
    deleted: boolean;
    queuedForRetry: boolean;
    reason?: string;
  };
  error?: string;
  cleanupError?: string;
}

export interface ReplaceDocumentAssetParams {
  userId: string | mongoose.Types.ObjectId;
  documentId: string | mongoose.Types.ObjectId;
  assetType: 'photo' | 'signature' | 'frontImage' | 'backImage';
  newImageInput: Buffer | string;
  docType?: string;
  customProfile?: CompressionProfileName;
  customFolder?: CloudinaryFolderCategory;
}

export interface ReplaceUserAvatarParams {
  userId: string | mongoose.Types.ObjectId;
  newImageInput: Buffer | string;
}

/**
 * Enqueues or updates an asset in the durable cleanup retry queue.
 */
export async function enqueueAssetCleanup(params: {
  userId?: string | mongoose.Types.ObjectId;
  documentId?: string | mongoose.Types.ObjectId;
  publicId: string;
  assetId?: string;
  docType?: string;
  deliveryType?: 'upload' | 'authenticated';
  resourceType?: 'image' | 'raw' | 'video';
  lastError?: string;
  reason?: string;
  replacementPublicId?: string;
}): Promise<IAssetCleanupQueue> {
  await connectToDatabase();

  const userObjId = params.userId
    ? (typeof params.userId === 'string' && mongoose.Types.ObjectId.isValid(params.userId)
        ? new mongoose.Types.ObjectId(params.userId)
        : params.userId as mongoose.Types.ObjectId)
    : undefined;

  const docObjId = params.documentId
    ? (typeof params.documentId === 'string' && mongoose.Types.ObjectId.isValid(params.documentId)
        ? new mongoose.Types.ObjectId(params.documentId)
        : params.documentId as mongoose.Types.ObjectId)
    : undefined;

  const existing = await AssetCleanupQueue.findOne({ publicId: params.publicId });

  if (existing) {
    existing.attempts += 1;
    existing.lastAttemptAt = new Date();
    // Exponential backoff: 2^attempts minutes
    const backoffMs = Math.min(Math.pow(2, existing.attempts) * 60 * 1000, 24 * 60 * 60 * 1000);
    existing.nextAttemptAt = new Date(Date.now() + backoffMs);
    if (params.lastError) existing.lastError = params.lastError;
    if (params.replacementPublicId) existing.replacementPublicId = params.replacementPublicId;
    await existing.save();
    return existing;
  }

  const created = await AssetCleanupQueue.create({
    userId: userObjId,
    documentId: docObjId,
    publicId: params.publicId,
    assetId: params.assetId,
    docType: params.docType,
    deliveryType: params.deliveryType || 'authenticated',
    resourceType: params.resourceType || 'image',
    status: 'PENDING',
    attempts: 0,
    maxAttempts: 5,
    nextAttemptAt: new Date(),
    lastError: params.lastError,
    reason: params.reason || 'REPLACED_BY_NEW_ASSET',
    replacementPublicId: params.replacementPublicId,
  });

  return created;
}

/**
 * Safely deletes a previously associated asset from Cloudinary ONLY if:
 * 1. It is not referenced elsewhere by another active record.
 * 2. It is not identical to the new replacement publicId.
 * If deletion fails (timeout or network), automatically enqueues for retry.
 */
export async function executeSafeAssetCleanup(params: {
  publicId: string;
  deliveryType: 'upload' | 'authenticated';
  resourceType?: 'image' | 'raw' | 'video';
  docType?: string;
  userId?: string | mongoose.Types.ObjectId;
  documentId?: string | mongoose.Types.ObjectId;
  replacementPublicId?: string;
  skipReferenceCheck?: boolean;
}): Promise<{
  status: AssetCleanupStatus;
  deleted: boolean;
  queuedForRetry: boolean;
  error?: string;
}> {
  const { publicId, deliveryType, resourceType = 'image', docType, userId, documentId, replacementPublicId } = params;

  if (!publicId) {
    return { status: 'SKIPPED_NO_PREVIOUS', deleted: false, queuedForRetry: false };
  }

  if (replacementPublicId && publicId === replacementPublicId) {
    return { status: 'SKIPPED_SAME_ASSET', deleted: false, queuedForRetry: false };
  }

  // Check reference isolation
  if (!params.skipReferenceCheck) {
    const isShared = await isAssetReferencedElsewhere(publicId, {
      excludingDocumentId: documentId,
      excludingUserId: userId,
    });

    if (isShared) {
      console.warn(`[AssetCleanup] Skipping deletion of publicId ${publicId}: Asset is referenced by another record.`);
      await enqueueAssetCleanup({
        publicId,
        userId,
        documentId,
        docType,
        deliveryType,
        resourceType,
        reason: 'ASSET_REFERENCED_ELSEWHERE',
        replacementPublicId,
      });
      await AssetCleanupQueue.updateOne({ publicId }, { status: 'SKIPPED_REFERENCED' });
      return { status: 'SKIPPED_REFERENCED', deleted: false, queuedForRetry: false };
    }
  }

  // Attempt Cloudinary deletion
  const delRes = await deleteImageFromCloudinary(publicId, {
    type: deliveryType,
    resourceType,
  });

  if (delRes.success) {
    // If it was in the queue, mark it completed
    await AssetCleanupQueue.updateOne(
      { publicId },
      {
        status: 'COMPLETED',
        deletionResult: delRes.result || 'ok',
        lastAttemptAt: new Date(),
      }
    );
    return { status: 'COMPLETED', deleted: true, queuedForRetry: false };
  }

  // Deletion failed (e.g. timeout, rate limit, temporary network error)
  console.warn(`[AssetCleanup] Deletion failed for ${publicId}. Enqueuing for retry:`, delRes.error);
  await enqueueAssetCleanup({
    publicId,
    userId,
    documentId,
    docType,
    deliveryType,
    resourceType,
    lastError: delRes.error,
    reason: 'DELETION_FAILED_RETRY_SCHEDULED',
    replacementPublicId,
  });

  return {
    status: 'PENDING_RETRY',
    deleted: false,
    queuedForRetry: true,
    error: delRes.error,
  };
}

/**
 * Executes full 12-step atomic replacement for document assets (Photo, Signature, Preview).
 */
export async function replaceDocumentAsset(
  params: ReplaceDocumentAssetParams
): Promise<AssetReplacementResult> {
  const { userId, documentId, assetType, newImageInput } = params;

  await connectToDatabase();

  // Step 1 & 2: Identify document and existing Cloudinary asset
  const doc = await DocumentRecord.findOne({
    _id: documentId,
    userId,
  });

  if (!doc) {
    return {
      success: false,
      replacementStatus: 'FAILED',
      cleanupStatus: 'FAILED',
      error: 'Document not found or unauthorized for the requesting user.',
    };
  }

  const docType = params.docType || doc.docType;
  let existingMeta: ICloudinaryAssetSubdocument | undefined;

  if (assetType === 'photo') {
    existingMeta = doc.photoMetadata;
  } else if (assetType === 'signature') {
    existingMeta = doc.signatureMetadata;
  } else if (assetType === 'frontImage') {
    existingMeta = doc.frontImageMetadata;
  } else if (assetType === 'backImage') {
    existingMeta = doc.backImageMetadata;
  }

  const oldPublicId = existingMeta?.publicId;
  const oldAssetId = existingMeta?.assetId;

  // Resolve target folder and compression profile
  let folder: CloudinaryFolderCategory = params.customFolder || getServiceFolderCategory(docType);
  let profile: CompressionProfileName = params.customProfile || 'documentPhoto';

  if (assetType === 'signature') {
    folder = 'documents/signatures';
    profile = 'signature';
  } else if (assetType === 'frontImage' || assetType === 'backImage') {
    folder = 'documents/generated-previews';
    profile = 'temporaryPreview';
  }

  // Step 3, 4, 5, 6: Validate, Sharp compress, and Upload new image
  const uploadRes = await uploadImageToCloudinary(newImageInput, {
    folder,
    profile,
    isPrivate: true,
    docType,
    userId: userId.toString(),
    tags: [docType.toLowerCase(), assetType, 'replacement'],
  });

  if (!uploadRes.success || !uploadRes.metadata) {
    // CRITICAL DATA SAFETY RULE:
    // If validation, Sharp processing, or Cloudinary upload fails,
    // the existing asset remains 100% UNTOUCHED!
    return {
      success: false,
      replacementStatus: 'FAILED',
      cleanupStatus: 'FAILED',
      error: uploadRes.error || 'Upload to Cloudinary failed.',
      oldAsset: {
        publicId: oldPublicId,
        assetId: oldAssetId,
        deleted: false,
        queuedForRetry: false,
        reason: 'NEW_UPLOAD_FAILED_EXISTING_PRESERVED',
      },
    };
  }

  const newMeta = uploadRes.metadata;

  // Step 7: Application verifies the new asset exists on Cloudinary
  const newExists = await checkAssetExists(newMeta.publicId, { type: 'authenticated' });
  if (!newExists) {
    return {
      success: false,
      replacementStatus: 'FAILED',
      cleanupStatus: 'FAILED',
      error: 'Uploaded asset failed verification on Cloudinary storage.',
      oldAsset: {
        publicId: oldPublicId,
        assetId: oldAssetId,
        deleted: false,
        queuedForRetry: false,
        reason: 'NEW_ASSET_VERIFICATION_FAILED_EXISTING_PRESERVED',
      },
    };
  }

  // Step 8 & 9: Persist to MongoDB
  try {
    if (assetType === 'photo') {
      doc.photoMetadata = newMeta;
      if (doc.data) {
        doc.data.photoUrl = newMeta.secureUrl;
        doc.markModified('data');
      }
    } else if (assetType === 'signature') {
      doc.signatureMetadata = newMeta;
      if (doc.data) {
        doc.data.signatureUrl = newMeta.secureUrl;
        doc.markModified('data');
      }
    } else if (assetType === 'frontImage') {
      doc.frontImageMetadata = newMeta;
      doc.frontImage = newMeta.secureUrl;
    } else if (assetType === 'backImage') {
      doc.backImageMetadata = newMeta;
      doc.backImage = newMeta.secureUrl;
    }

    doc.imageMigrationStatus = 'MIGRATED';
    doc.imageMigratedAt = new Date();
    doc.updatedAt = new Date();

    await doc.save();
  } catch (dbError: any) {
    // CRITICAL DATA SAFETY RULE:
    // If MongoDB persistence fails, NEVER delete the old asset!
    console.error('[AssetReplacement] MongoDB persistence failed:', dbError);
    return {
      success: false,
      replacementStatus: 'FAILED',
      cleanupStatus: 'FAILED',
      error: `Database persistence failed: ${dbError.message || dbError}`,
      oldAsset: {
        publicId: oldPublicId,
        assetId: oldAssetId,
        deleted: false,
        queuedForRetry: false,
        reason: 'DATABASE_SAVE_FAILED_EXISTING_PRESERVED',
      },
    };
  }

  // Step 10 & 11: Only AFTER successful persistence, delete the previous Cloudinary asset
  let cleanupStatus: AssetCleanupStatus = 'SKIPPED_NO_PREVIOUS';
  let oldDeleted = false;
  let oldQueued = false;
  let cleanupErrorMsg: string | undefined;

  if (oldPublicId && oldPublicId !== newMeta.publicId) {
    const cleanRes = await executeSafeAssetCleanup({
      publicId: oldPublicId,
      deliveryType: 'authenticated',
      resourceType: 'image',
      docType,
      userId,
      documentId,
      replacementPublicId: newMeta.publicId,
    });

    cleanupStatus = cleanRes.status;
    oldDeleted = cleanRes.deleted;
    oldQueued = cleanRes.queuedForRetry;
    cleanupErrorMsg = cleanRes.error;
  }

  // Step 12: Return confirmed successful replacement
  return {
    success: true,
    replacementStatus: 'SUCCESS',
    cleanupStatus,
    newAsset: newMeta,
    oldAsset: {
      publicId: oldPublicId,
      assetId: oldAssetId,
      deleted: oldDeleted,
      queuedForRetry: oldQueued,
      reason: oldDeleted ? 'CLEANED_UP_SUCCESSFULLY' : oldQueued ? 'QUEUED_FOR_RETRY' : 'NONE',
    },
    cleanupError: cleanupErrorMsg,
  };
}

/**
 * Executes full atomic replacement for operator avatars on the User model.
 */
export async function replaceUserAvatar(
  params: ReplaceUserAvatarParams
): Promise<AssetReplacementResult> {
  const { userId, newImageInput } = params;

  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) {
    return {
      success: false,
      replacementStatus: 'FAILED',
      cleanupStatus: 'FAILED',
      error: 'User not found.',
    };
  }

  const oldPublicId = user.avatarMetadata?.publicId;
  const oldAssetId = user.avatarMetadata?.assetId;

  // Upload new avatar: Profile A (Avatar 512x512 WebP), public delivery
  const uploadRes = await uploadImageToCloudinary(newImageInput, {
    folder: 'users/avatars',
    profile: 'avatar',
    isPrivate: false,
    userId: userId.toString(),
    tags: ['avatar', 'user-profile', 'replacement'],
  });

  if (!uploadRes.success || !uploadRes.metadata) {
    return {
      success: false,
      replacementStatus: 'FAILED',
      cleanupStatus: 'FAILED',
      error: uploadRes.error || 'Avatar upload failed.',
      oldAsset: {
        publicId: oldPublicId,
        assetId: oldAssetId,
        deleted: false,
        queuedForRetry: false,
        reason: 'NEW_AVATAR_UPLOAD_FAILED_EXISTING_PRESERVED',
      },
    };
  }

  const newMeta = uploadRes.metadata;

  // Verify new asset exists on Cloudinary
  const newExists = await checkAssetExists(newMeta.publicId, { type: 'upload' });
  if (!newExists) {
    return {
      success: false,
      replacementStatus: 'FAILED',
      cleanupStatus: 'FAILED',
      error: 'Uploaded avatar failed verification on Cloudinary.',
      oldAsset: {
        publicId: oldPublicId,
        assetId: oldAssetId,
        deleted: false,
        queuedForRetry: false,
        reason: 'AVATAR_VERIFICATION_FAILED_EXISTING_PRESERVED',
      },
    };
  }

  // Persist to User in MongoDB
  try {
    user.avatar = newMeta.secureUrl;
    user.avatarMetadata = newMeta as any;
    await user.save();
  } catch (dbError: any) {
    return {
      success: false,
      replacementStatus: 'FAILED',
      cleanupStatus: 'FAILED',
      error: `Database update failed: ${dbError.message || dbError}`,
      oldAsset: {
        publicId: oldPublicId,
        assetId: oldAssetId,
        deleted: false,
        queuedForRetry: false,
        reason: 'DATABASE_SAVE_FAILED_EXISTING_PRESERVED',
      },
    };
  }

  // Only after successful persistence, clean up old avatar
  let cleanupStatus: AssetCleanupStatus = 'SKIPPED_NO_PREVIOUS';
  let oldDeleted = false;
  let oldQueued = false;
  let cleanupErrorMsg: string | undefined;

  if (oldPublicId && oldPublicId !== newMeta.publicId) {
    const cleanRes = await executeSafeAssetCleanup({
      publicId: oldPublicId,
      deliveryType: 'upload',
      resourceType: 'image',
      userId,
      replacementPublicId: newMeta.publicId,
    });

    cleanupStatus = cleanRes.status;
    oldDeleted = cleanRes.deleted;
    oldQueued = cleanRes.queuedForRetry;
    cleanupErrorMsg = cleanRes.error;
  }

  return {
    success: true,
    replacementStatus: 'SUCCESS',
    cleanupStatus,
    newAsset: newMeta,
    oldAsset: {
      publicId: oldPublicId,
      assetId: oldAssetId,
      deleted: oldDeleted,
      queuedForRetry: oldQueued,
      reason: oldDeleted ? 'CLEANED_UP_SUCCESSFULLY' : oldQueued ? 'QUEUED_FOR_RETRY' : 'NONE',
    },
    cleanupError: cleanupErrorMsg,
  };
}

/**
 * Retries all pending and backoff-ready deletions in the AssetCleanupQueue.
 */
export async function processAssetCleanupQueue(batchSize = 20): Promise<{
  processed: number;
  completed: number;
  failed: number;
  skipped: number;
}> {
  await connectToDatabase();

  const now = new Date();
  const queueItems = await AssetCleanupQueue.find({
    status: { $in: ['PENDING', 'FAILED'] },
    nextAttemptAt: { $lte: now },
    attempts: { $lt: 5 },
  })
    .limit(batchSize)
    .sort({ nextAttemptAt: 1 });

  let completed = 0;
  let failed = 0;
  let skipped = 0;

  for (const item of queueItems) {
    item.status = 'PROCESSING';
    item.attempts += 1;
    item.lastAttemptAt = new Date();
    await item.save();

    // Check reference protection
    const isShared = await isAssetReferencedElsewhere(item.publicId, {
      excludingDocumentId: item.documentId,
      excludingUserId: item.userId,
    });

    if (isShared) {
      item.status = 'SKIPPED_REFERENCED';
      item.lastError = 'Asset is actively referenced by another record.';
      await item.save();
      skipped += 1;
      continue;
    }

    const delRes = await deleteImageFromCloudinary(item.publicId, {
      type: item.deliveryType,
      resourceType: item.resourceType,
    });

    if (delRes.success) {
      item.status = 'COMPLETED';
      item.deletionResult = delRes.result || 'ok';
      await item.save();
      completed += 1;
    } else {
      const backoffMs = Math.min(Math.pow(2, item.attempts) * 60 * 1000, 24 * 60 * 60 * 1000);
      item.nextAttemptAt = new Date(Date.now() + backoffMs);
      item.lastError = delRes.error;
      item.status = item.attempts >= item.maxAttempts ? 'FAILED' : 'PENDING';
      await item.save();
      failed += 1;
    }
  }

  return {
    processed: queueItems.length,
    completed,
    failed,
    skipped,
  };
}
