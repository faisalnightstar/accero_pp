/**
 * Accero PrintPortal - Cloudinary Asset Reference & Ownership Verification
 * Prevents premature deletion of assets that may be referenced across multiple records.
 */

import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import DocumentRecord from '@/models/DocumentRecord';
import User from '@/models/User';

export interface ReferenceCheckOptions {
  excludingDocumentId?: string | mongoose.Types.ObjectId;
  excludingUserId?: string | mongoose.Types.ObjectId;
}

/**
 * Checks whether a given Cloudinary publicId is still referenced by any document or user record
 * other than the record currently being modified.
 */
export async function isAssetReferencedElsewhere(
  publicId: string,
  options?: ReferenceCheckOptions
): Promise<boolean> {
  if (!publicId) return false;

  await connectToDatabase();

  const docFilter: Record<string, any> = {
    $or: [
      { 'photoMetadata.publicId': publicId },
      { 'signatureMetadata.publicId': publicId },
      { 'frontImageMetadata.publicId': publicId },
      { 'backImageMetadata.publicId': publicId },
    ],
  };

  if (options?.excludingDocumentId) {
    const excId = typeof options.excludingDocumentId === 'string'
      ? new mongoose.Types.ObjectId(options.excludingDocumentId)
      : options.excludingDocumentId;
    docFilter._id = { $ne: excId };
  }

  const referencingDoc = await DocumentRecord.findOne(docFilter).select('_id docType cardIdentifier').lean();
  if (referencingDoc) {
    return true;
  }

  const userFilter: Record<string, any> = {
    'avatarMetadata.publicId': publicId,
  };

  if (options?.excludingUserId) {
    const excUserId = typeof options.excludingUserId === 'string'
      ? new mongoose.Types.ObjectId(options.excludingUserId)
      : options.excludingUserId;
    userFilter._id = { $ne: excUserId };
  }

  const referencingUser = await User.findOne(userFilter).select('_id email').lean();
  if (referencingUser) {
    return true;
  }

  return false;
}

/**
 * Returns total count of all records (documents and users) referencing this publicId.
 */
export async function getAssetReferenceCount(publicId: string): Promise<number> {
  if (!publicId) return 0;

  await connectToDatabase();

  const docCount = await DocumentRecord.countDocuments({
    $or: [
      { 'photoMetadata.publicId': publicId },
      { 'signatureMetadata.publicId': publicId },
      { 'frontImageMetadata.publicId': publicId },
      { 'backImageMetadata.publicId': publicId },
    ],
  });

  const userCount = await User.countDocuments({
    'avatarMetadata.publicId': publicId,
  });

  return docCount + userCount;
}
