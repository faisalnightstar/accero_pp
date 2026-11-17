/**
 * Accero PrintPortal - Cloudinary Server Configuration
 * Server-only module configuring the official Cloudinary Node SDK.
 * 
 * SECURITY RULES:
 * 1. This file MUST NEVER be imported or bundled into client components.
 * 2. API secret and key must never be sent to the browser or logged.
 */

import { v2 as cloudinary } from 'cloudinary';

if (typeof window !== 'undefined') {
  throw new Error('[SECURITY ERROR] src/lib/cloudinary/config.ts can only be imported in server-side code.');
}

let isConfigured = false;

function extractCleanCloudName(val?: string): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (trimmed.includes('cloudinary://')) {
    try {
      const urlStr = trimmed.includes('=') ? trimmed.split('=')[1] : trimmed;
      const parsed = new URL(urlStr);
      return parsed.hostname || '';
    } catch {
      const match = trimmed.match(/@([a-zA-Z0-9_-]+)/);
      return match ? match[1] : '';
    }
  }
  return trimmed.replace(/^(?:CLOUDINARY_CLOUD_NAME=|NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=)/, '').trim();
}

export function configureCloudinary(): typeof cloudinary {
  const cloudName = extractCleanCloudName(process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  // 1. Prioritize explicit cloudName, apiKey, and apiSecret
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey.trim(),
      api_secret: apiSecret.trim(),
      secure: true,
    });
    isConfigured = true;
    return cloudinary;
  }

  // 2. Fall back to CLOUDINARY_URL
  if (cloudinaryUrl) {
    cloudinary.config({
      cloudinary_url: cloudinaryUrl.includes('=') ? cloudinaryUrl.split('=')[1].trim() : cloudinaryUrl.trim(),
      secure: true,
    });
    isConfigured = true;
    return cloudinary;
  }

  if (isConfigured) {
    return cloudinary;
  }

  // If in build or test mode without full credentials, configure with dummy to prevent crash
  if (process.env.NODE_ENV === 'test') {
    cloudinary.config({
      cloud_name: cloudName || 'test_cloud',
      api_key: apiKey || 'test_key',
      api_secret: apiSecret || 'test_secret',
      secure: true,
    });
    return cloudinary;
  }

  console.warn('[Cloudinary] Missing credentials in environment. Media upload features will fail.');
  return cloudinary;
}

export function getCloudinary(): typeof cloudinary {
  return configureCloudinary();
}

/**
 * Returns the non-sensitive public Cloud Name safely.
 */
export function getCloudinaryCloudName(): string {
  if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    const cleaned = extractCleanCloudName(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    if (cleaned) return cleaned;
  }
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    const cleaned = extractCleanCloudName(process.env.CLOUDINARY_CLOUD_NAME);
    if (cleaned) return cleaned;
  }
  if (process.env.CLOUDINARY_URL) {
    return extractCleanCloudName(process.env.CLOUDINARY_URL);
  }
  return '';
}

/**
 * Checks whether Cloudinary credentials are fully configured and usable.
 */
export function isCloudinaryConfigured(): boolean {
  if (process.env.CLOUDINARY_URL) return true;
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export default cloudinary;
