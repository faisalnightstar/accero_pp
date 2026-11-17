/**
 * Accero PrintPortal - Cloudinary Asset Deletion & Replacement Utilities
 */

import { getCloudinary } from './config';
import { uploadImageToCloudinary } from './upload';
import { UploadImageOptions, UploadImageResult } from './types';

export interface DeleteResult {
  success: boolean;
  result?: string;
  error?: string;
}

/**
 * Permanently deletes an asset from Cloudinary by its public ID.
 */
export async function deleteImageFromCloudinary(
  publicId: string,
  options?: { resourceType?: 'image' | 'raw' | 'video'; type?: 'upload' | 'authenticated' }
): Promise<DeleteResult> {
  if (!publicId) {
    return { success: false, error: 'publicId is required for deletion.' };
  }

  try {
    const cloudinary = getCloudinary();
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: options?.resourceType || 'image',
      type: options?.type || 'upload',
      invalidate: true, // Invalidate CDN edge caches immediately
    });

    if (res.result === 'ok' || res.result === 'not found') {
      return { success: true, result: res.result };
    }

    return { success: false, result: res.result, error: `Deletion returned status: ${res.result}` };
  } catch (error: any) {
    console.error('[CloudinaryDelete] Asset destruction failed:', error.message || error);
    return { success: false, error: error.message || 'Asset destruction failed.' };
  }
}

/**
 * Checks whether an asset exists in Cloudinary via resource lookup.
 */
export async function checkAssetExists(
  publicId: string,
  options?: { resourceType?: 'image' | 'raw' | 'video'; type?: 'upload' | 'authenticated' }
): Promise<boolean> {
  if (!publicId) return false;

  try {
    const cloudinary = getCloudinary();
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: options?.resourceType || 'image',
      type: options?.type || 'upload',
    });
    return Boolean(resource && resource.public_id);
  } catch (error: any) {
    if (error?.error?.http_code === 404 || error?.http_code === 404) {
      return false;
    }
    console.error('[Cloudinary] Asset existence check error:', error.message || error);
    return false;
  }
}

/**
 * Atomically replaces an asset: uploads new asset, and deletes the old one upon success.
 */
export async function replaceImageInCloudinary(
  oldPublicId: string | undefined,
  newInput: Buffer | string,
  options: UploadImageOptions
): Promise<UploadImageResult> {
  // 1. Upload new asset first to avoid orphaned state if upload fails
  const uploadRes = await uploadImageToCloudinary(newInput, options);
  if (!uploadRes.success || !uploadRes.metadata) {
    return uploadRes;
  }

  // 2. If old asset exists and differs from new one, destroy old asset
  if (oldPublicId && oldPublicId !== uploadRes.metadata.publicId) {
    try {
      await deleteImageFromCloudinary(oldPublicId, {
        type: options.isPrivate ? 'authenticated' : 'upload',
      });
    } catch (err) {
      console.warn('[CloudinaryReplace] Warning: Could not delete prior asset:', oldPublicId, err);
    }
  }

  return uploadRes;
}
