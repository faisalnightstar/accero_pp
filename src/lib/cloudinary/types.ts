/**
 * Accero PrintPortal - Cloudinary Asset & Storage Type Definitions
 * Strict TypeScript types for image uploads, Cloudinary metadata, folder trees, and compression.
 */

export type EnvironmentLane = 'production' | 'development' | 'test';

export interface CloudinaryAssetMetadata {
  provider: 'cloudinary';
  publicId: string;
  assetId?: string;
  secureUrl: string;
  resourceType: 'image' | 'raw' | 'video' | 'auto';
  format: string;
  bytes: number;
  width: number;
  height: number;
  folder: string;
  uploadedAt: Date | string;
  originalFilename?: string;
  etag?: string;
  version?: number;
  accessMode?: 'public' | 'authenticated';
}

export type CloudinaryFolderCategory =
  | 'users/profiles'
  | 'users/avatars'
  | 'services/pan'
  | 'services/aadhaar'
  | 'services/voter'
  | 'services/driving-license'
  | 'services/vehicle-rc'
  | 'services/ration-card'
  | 'services/farmer-id'
  | 'documents/uploads'
  | 'documents/photographs'
  | 'documents/signatures'
  | 'documents/generated-previews'
  | 'marketing/banners'
  | 'marketing/blog'
  | 'marketing/thumbnails'
  | 'marketing/illustrations'
  | 'temporary';

export type CompressionProfileName =
  | 'avatar'
  | 'marketing'
  | 'blog'
  | 'documentPhoto'
  | 'signature'
  | 'temporaryPreview';

export interface CompressionProfile {
  name: CompressionProfileName;
  maxWidth: number;
  maxHeight: number;
  format: 'webp' | 'jpeg' | 'png' | 'preserve';
  quality: number;
  stripMetadata: boolean;
  normalizeOrientation: boolean;
  fit?: 'cover' | 'contain' | 'inside' | 'outside';
  lossless?: boolean;
}

export interface ProcessedImageResult {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  bytes: number;
  originalBytes: number;
  savingsPercentage: number;
}

export interface UploadImageOptions {
  folder: CloudinaryFolderCategory;
  profile?: CompressionProfileName;
  customPublicId?: string;
  tags?: string[];
  isPrivate?: boolean;
  userId?: string;
  docType?: string;
}

export interface UploadImageResult {
  success: boolean;
  metadata?: CloudinaryAssetMetadata;
  error?: string;
}
