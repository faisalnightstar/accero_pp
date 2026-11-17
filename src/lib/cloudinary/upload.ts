/**
 * Accero PrintPortal - Secure Server-Side Cloudinary Upload Service
 * Handles authenticated uploads with Sharp preprocessing and PII-shielded folder mapping.
 */

import { Readable } from 'stream';
import { UploadApiResponse, UploadApiOptions } from 'cloudinary';
import { getCloudinary } from './config';
import { generateSecurePublicId, getCloudinaryFolder } from './folders';
import { CloudinaryAssetMetadata, UploadImageOptions, UploadImageResult } from './types';
import { processImage } from '../media/image-processor';
import { validateImageInput } from '../media/image-validation';

/**
 * Uploads an image Buffer or base64 string to Cloudinary with server-side Sharp compression.
 */
export async function uploadImageToCloudinary(
  input: Buffer | string,
  options: UploadImageOptions
): Promise<UploadImageResult> {
  try {
    const cloudinary = getCloudinary();

    // 1. Initial validation
    const validation = validateImageInput(input);
    if (!validation.valid || !validation.buffer) {
      return {
        success: false,
        error: validation.error || 'Invalid image input.',
      };
    }

    // 2. Sharp Preprocessing & Compression
    const processed = await processImage(validation.buffer, options.profile);

    // 3. Folder & Secure Public ID determination
    const folder = getCloudinaryFolder(options.folder);
    const publicId = options.customPublicId || generateSecurePublicId(options.folder, {
      isPrivate: options.isPrivate,
    });

    // 4. Cloudinary Upload Configuration
    const uploadParams: UploadApiOptions = {
      public_id: publicId,
      overwrite: true,
      resource_type: 'image',
      tags: options.tags || ['accero', options.folder],
    };

    // If private/sensitive asset (citizen document photo/signature), mark access_mode accordingly
    if (options.isPrivate) {
      uploadParams.type = 'authenticated'; // Requires signed URL or authenticated API to view
    } else {
      uploadParams.type = 'upload';
    }

    // 5. Execute stream upload
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        uploadParams,
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Empty response received from Cloudinary upload stream.'));
          }
          resolve(result);
        }
      );

      const readable = Readable.from(processed.buffer);
      readable.pipe(stream);
    });

    // 6. Assemble strongly typed metadata
    const metadata: CloudinaryAssetMetadata = {
      provider: 'cloudinary',
      publicId: uploadResult.public_id,
      assetId: uploadResult.asset_id,
      secureUrl: uploadResult.secure_url,
      resourceType: (uploadResult.resource_type as any) || 'image',
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
      folder,
      uploadedAt: new Date(uploadResult.created_at || Date.now()),
      etag: uploadResult.etag,
      version: uploadResult.version,
      accessMode: options.isPrivate ? 'authenticated' : 'public',
    };

    return {
      success: true,
      metadata,
    };
  } catch (error: any) {
    console.error('[CloudinaryUpload] Upload execution failed:', error.message || error);
    return {
      success: false,
      error: error.message || 'Failed to upload asset to Cloudinary.',
    };
  }
}
