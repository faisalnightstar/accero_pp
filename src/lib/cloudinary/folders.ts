/**
 * Accero PrintPortal - Cloudinary Folder Architecture & Asset Hierarchy
 * Enforces structured multi-tenant and multi-environment folder isolation.
 * 
 * Rules:
 * - Public IDs MUST NEVER contain citizen PII (Aadhaar, PAN, voter number, citizen names).
 * - Opaque cryptographically random UUIDs are assigned to document assets.
 */

import crypto from 'crypto';
import { CloudinaryFolderCategory } from './types';

export const ROOT_NAMESPACE = 'accero';

export function getEnvironmentLane(): string {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') return 'production';
  if (env === 'test') return 'test';
  return 'development';
}

/**
 * Resolves full Cloudinary folder path based on environment and asset category.
 * Example: 'accero/production/documents/photographs'
 */
export function getCloudinaryFolder(category: CloudinaryFolderCategory): string {
  const lane = getEnvironmentLane();
  return `${ROOT_NAMESPACE}/${lane}/${category}`;
}

/**
 * Generates an opaque, secure public_id for an asset.
 * Guarantees zero citizen PII leakage in the URL.
 */
export function generateSecurePublicId(
  category: CloudinaryFolderCategory,
  options?: { prefix?: string; isPrivate?: boolean }
): string {
  const folder = getCloudinaryFolder(category);
  const randomSuffix = crypto.randomUUID();
  const prefix = options?.prefix ? `${options.prefix}_` : '';
  return `${folder}/${prefix}${randomSuffix}`;
}

/**
 * Maps document type to corresponding service folder category.
 */
export function getServiceFolderCategory(docType: string): CloudinaryFolderCategory {
  const dt = docType.toLowerCase().replace(/_/g, '-');
  switch (dt) {
    case 'pan':
      return 'services/pan';
    case 'aadhaar':
      return 'services/aadhaar';
    case 'voter':
      return 'services/voter';
    case 'dl':
    case 'driving-license':
      return 'services/driving-license';
    case 'rc':
    case 'vehicle-rc':
      return 'services/vehicle-rc';
    case 'ration':
    case 'ration-card':
      return 'services/ration-card';
    case 'farmer':
    case 'farmer-id':
      return 'services/farmer-id';
    default:
      return 'documents/uploads';
  }
}
