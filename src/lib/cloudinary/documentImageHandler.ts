/**
 * Accero PrintPortal - Document Image Handler
 * Intercepts document creation/update payloads, converts base64 strings into Cloudinary assets,
 * and attaches Cloudinary metadata subdocuments to MongoDB records.
 */

import { uploadImageToCloudinary } from './upload';
import { getServiceFolderCategory } from './folders';
import { ICloudinaryAssetSubdocument } from '@/models/DocumentRecord';

export interface StagedAssetDeletion {
  publicId: string;
  type: 'upload' | 'authenticated';
  resourceType: 'image' | 'raw' | 'video';
  docType: string;
  field: 'photo' | 'signature' | 'frontImage' | 'backImage';
  replacementPublicId: string;
}

export interface ProcessedDocumentImages {
  data: Record<string, any>;
  frontImage?: string;
  backImage?: string;
  photoMetadata?: ICloudinaryAssetSubdocument;
  signatureMetadata?: ICloudinaryAssetSubdocument;
  frontImageMetadata?: ICloudinaryAssetSubdocument;
  backImageMetadata?: ICloudinaryAssetSubdocument;
  hasUploadedToCloudinary: boolean;
  stagedDeletions: StagedAssetDeletion[];
}

/**
 * Checks if a string is a base64 data URL.
 */
function isBase64Image(val: unknown): val is string {
  return typeof val === 'string' && val.trim().startsWith('data:image/');
}

/**
 * Intercepts incoming document payload and offloads base64 images to Cloudinary.
 */
export async function processDocumentIncomingImages(options: {
  userId: string;
  docType: string;
  data: Record<string, any>;
  frontImage?: string;
  backImage?: string;
  existingPhotoMetadata?: ICloudinaryAssetSubdocument;
  existingSignatureMetadata?: ICloudinaryAssetSubdocument;
  existingFrontMetadata?: ICloudinaryAssetSubdocument;
}): Promise<ProcessedDocumentImages> {
  const { userId, docType, existingPhotoMetadata, existingSignatureMetadata, existingFrontMetadata } = options;
  const dataCopy = { ...options.data };
  let frontImage = options.frontImage;
  let backImage = options.backImage;

  let photoMetadata = existingPhotoMetadata;
  let signatureMetadata = existingSignatureMetadata;
  let frontImageMetadata = existingFrontMetadata;
  let backImageMetadata: ICloudinaryAssetSubdocument | undefined;
  let hasUploadedToCloudinary = false;
  const stagedDeletions: StagedAssetDeletion[] = [];

  // 1. Process Cardholder Photograph
  if (isBase64Image(dataCopy.photoUrl)) {
    try {
      const folder = getServiceFolderCategory(docType);
      const uploadRes = await uploadImageToCloudinary(dataCopy.photoUrl, {
        folder,
        profile: 'documentPhoto',
        isPrivate: true,
        docType,
        userId,
        tags: [docType.toLowerCase(), 'applicant-photo'],
      });

      if (uploadRes.success && uploadRes.metadata) {
        // Stage old photo for cleanup only after MongoDB confirmation
        if (existingPhotoMetadata?.publicId && existingPhotoMetadata.publicId !== uploadRes.metadata.publicId) {
          stagedDeletions.push({
            publicId: existingPhotoMetadata.publicId,
            type: 'authenticated',
            resourceType: 'image',
            docType,
            field: 'photo',
            replacementPublicId: uploadRes.metadata.publicId,
          });
        }

        photoMetadata = uploadRes.metadata as any;
        dataCopy.photoUrl = uploadRes.metadata.secureUrl;
        hasUploadedToCloudinary = true;
      }
    } catch (err) {
      console.warn('[DocImageHandler] Photo upload to Cloudinary failed, retaining fallback:', err);
    }
  }

  // 2. Process Cardholder / Officer Signature
  if (isBase64Image(dataCopy.signatureUrl)) {
    try {
      const uploadRes = await uploadImageToCloudinary(dataCopy.signatureUrl, {
        folder: 'documents/signatures',
        profile: 'signature',
        isPrivate: true,
        docType,
        userId,
        tags: [docType.toLowerCase(), 'signature'],
      });

      if (uploadRes.success && uploadRes.metadata) {
        if (existingSignatureMetadata?.publicId && existingSignatureMetadata.publicId !== uploadRes.metadata.publicId) {
          stagedDeletions.push({
            publicId: existingSignatureMetadata.publicId,
            type: 'authenticated',
            resourceType: 'image',
            docType,
            field: 'signature',
            replacementPublicId: uploadRes.metadata.publicId,
          });
        }

        signatureMetadata = uploadRes.metadata as any;
        dataCopy.signatureUrl = uploadRes.metadata.secureUrl;
        hasUploadedToCloudinary = true;
      }
    } catch (err) {
      console.warn('[DocImageHandler] Signature upload to Cloudinary failed, retaining fallback:', err);
    }
  }

  // 3. Process frontImage (Full card rendered preview / sheet)
  if (isBase64Image(frontImage)) {
    try {
      const uploadRes = await uploadImageToCloudinary(frontImage, {
        folder: 'documents/generated-previews',
        profile: 'temporaryPreview',
        isPrivate: true,
        docType,
        userId,
        tags: [docType.toLowerCase(), 'frontImage'],
      });

      if (uploadRes.success && uploadRes.metadata) {
        if (existingFrontMetadata?.publicId && existingFrontMetadata.publicId !== uploadRes.metadata.publicId) {
          stagedDeletions.push({
            publicId: existingFrontMetadata.publicId,
            type: 'authenticated',
            resourceType: 'image',
            docType,
            field: 'frontImage',
            replacementPublicId: uploadRes.metadata.publicId,
          });
        }

        frontImageMetadata = uploadRes.metadata as any;
        frontImage = uploadRes.metadata.secureUrl;
        hasUploadedToCloudinary = true;
      }
    } catch (err) {
      console.warn('[DocImageHandler] FrontImage upload to Cloudinary failed, retaining fallback:', err);
    }
  }

  // 4. Process backImage
  if (isBase64Image(backImage)) {
    try {
      const uploadRes = await uploadImageToCloudinary(backImage, {
        folder: 'documents/generated-previews',
        profile: 'temporaryPreview',
        isPrivate: true,
        docType,
        userId,
        tags: [docType.toLowerCase(), 'backImage'],
      });

      if (uploadRes.success && uploadRes.metadata) {
        backImageMetadata = uploadRes.metadata as any;
        backImage = uploadRes.metadata.secureUrl;
        hasUploadedToCloudinary = true;
      }
    } catch (err) {
      console.warn('[DocImageHandler] BackImage upload to Cloudinary failed, retaining fallback:', err);
    }
  }

  return {
    data: dataCopy,
    frontImage,
    backImage,
    photoMetadata,
    signatureMetadata,
    frontImageMetadata,
    backImageMetadata,
    hasUploadedToCloudinary,
    stagedDeletions,
  };
}
