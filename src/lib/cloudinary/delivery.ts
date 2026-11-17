/**
 * Accero PrintPortal - Cloudinary Delivery & Signed URL Generation
 * Implements public CDN URL generation and time-bounded signed URLs for private citizen PII.
 */

import { getCloudinary, getCloudinaryCloudName } from './config';
import { CloudinaryAssetMetadata } from './types';

export interface DeliveryUrlOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: number | 'auto';
  format?: string | 'auto';
  signUrl?: boolean;
  expiresInSeconds?: number;
  type?: 'upload' | 'authenticated';
}

/**
 * Generates an optimized public CDN URL for non-sensitive assets (marketing, blog, public badges).
 */
export function generatePublicDeliveryUrl(
  publicId: string,
  options?: DeliveryUrlOptions
): string {
  if (!publicId) return '';
  const cloudinary = getCloudinary();

  return cloudinary.url(publicId, {
    secure: true,
    resource_type: 'image',
    type: 'upload',
    fetch_format: options?.format || 'auto',
    quality: options?.quality || 'auto',
    width: options?.width,
    height: options?.height,
    crop: options?.crop,
  });
}

/**
 * Generates an authenticated signed URL with optional expiration for private identity documents.
 * Protects citizen portraits and signatures from unauthorized scraping and search engine indexing.
 */
export function generateSignedDeliveryUrl(
  publicId: string,
  options?: DeliveryUrlOptions
): string {
  if (!publicId) return '';
  const cloudinary = getCloudinary();

  const type = options?.type || 'authenticated';
  const urlOptions: Record<string, any> = {
    secure: true,
    resource_type: 'image',
    type,
    sign_url: true,
    fetch_format: options?.format || 'auto',
    quality: options?.quality || 'auto',
    width: options?.width,
    height: options?.height,
    crop: options?.crop,
  };

  // If token-based auth key is explicitly configured, apply expiring auth_token
  if (options?.expiresInSeconds && process.env.CLOUDINARY_AUTH_TOKEN_KEY) {
    urlOptions.auth_token = {
      key: process.env.CLOUDINARY_AUTH_TOKEN_KEY,
      duration: options.expiresInSeconds,
    };
  }

  return cloudinary.url(publicId, urlOptions);
}

/**
 * Seamless resolution helper: handles legacy base64 data URLs, relative paths,
 * full Cloudinary URLs, and raw public IDs with 100% backward compatibility.
 */
export function resolveImageUrl(
  imageRef: string | CloudinaryAssetMetadata | undefined | null,
  options?: { isPrivate?: boolean; expiresInSeconds?: number }
): string {
  if (!imageRef) return '';

  // 1. If passed an asset metadata object
  if (typeof imageRef === 'object' && imageRef.provider === 'cloudinary') {
    if (imageRef.accessMode === 'authenticated' || options?.isPrivate) {
      return generateSignedDeliveryUrl(imageRef.publicId, {
        expiresInSeconds: options?.expiresInSeconds || 3600, // 1 hour default
        type: 'authenticated',
      });
    }
    return imageRef.secureUrl || generatePublicDeliveryUrl(imageRef.publicId);
  }

  // 2. If already a string
  if (typeof imageRef === 'string') {
    const trimmed = imageRef.trim();

    // Legacy Base64 data URL - return directly without modification
    if (trimmed.startsWith('data:image/')) {
      return trimmed;
    }

    // Relative web asset path or full URL
    if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    // Raw Cloudinary public ID
    if (options?.isPrivate) {
      return generateSignedDeliveryUrl(trimmed, {
        expiresInSeconds: options?.expiresInSeconds || 3600,
        type: 'authenticated',
      });
    }

    return generatePublicDeliveryUrl(trimmed);
  }

  return '';
}
