/**
 * Accero PrintPortal - Image Compression Profiles
 * Defines calibrated Sharp compression, dimension limits, and quality presets.
 */

import { CompressionProfile, CompressionProfileName } from '../cloudinary/types';

export const COMPRESSION_PROFILES: Record<CompressionProfileName, CompressionProfile> = {
  // Profile A: User & Operator Profile Avatars (Square, optimized WebP)
  avatar: {
    name: 'avatar',
    maxWidth: 512,
    maxHeight: 512,
    format: 'webp',
    quality: 80,
    stripMetadata: true,
    normalizeOrientation: true,
    fit: 'cover',
  },

  // Profile B: Marketing Banners & Hero Assets (Crisp high-res WebP)
  marketing: {
    name: 'marketing',
    maxWidth: 1920,
    maxHeight: 1920,
    format: 'webp',
    quality: 82,
    stripMetadata: true,
    normalizeOrientation: true,
    fit: 'inside',
  },

  // Profile C: Blog Content & Article Thumbnails
  blog: {
    name: 'blog',
    maxWidth: 1600,
    maxHeight: 1200,
    format: 'webp',
    quality: 82,
    stripMetadata: true,
    normalizeOrientation: true,
    fit: 'inside',
  },

  // Profile D: Identity Document Photographs & Candidate Portraits (CR80 PVC High-DPI standards)
  // Preserves high-density portrait details for ISO 7810 ID-1 card printing (300+ DPI)
  documentPhoto: {
    name: 'documentPhoto',
    maxWidth: 1200,
    maxHeight: 1500,
    format: 'preserve', // Preserves JPEG/PNG format or converts losslessly to avoid printer banding
    quality: 92, // Near-lossless high fidelity for physical PVC card trays
    stripMetadata: true, // Strips GPS and camera EXIF for citizen privacy
    normalizeOrientation: true, // Automatically rotates smartphone uploads upright
    fit: 'inside',
  },

  // Profile D2: Candidate & Officer Signatures (Preserves transparent PNG / crisp contrast lines)
  signature: {
    name: 'signature',
    maxWidth: 1000,
    maxHeight: 400,
    format: 'preserve', // Preserve PNG transparency when present
    quality: 95,
    stripMetadata: true,
    normalizeOrientation: true,
    fit: 'inside',
    lossless: true,
  },

  // Profile E: Temporary Previews & Verification Canvases
  temporaryPreview: {
    name: 'temporaryPreview',
    maxWidth: 1000,
    maxHeight: 638,
    format: 'webp',
    quality: 78,
    stripMetadata: true,
    normalizeOrientation: true,
    fit: 'inside',
  },
};

export function getCompressionProfile(name?: CompressionProfileName): CompressionProfile {
  if (name && COMPRESSION_PROFILES[name]) {
    return COMPRESSION_PROFILES[name];
  }
  return COMPRESSION_PROFILES.documentPhoto;
}
