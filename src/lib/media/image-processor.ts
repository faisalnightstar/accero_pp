/**
 * Accero PrintPortal - Centralized Sharp Image Preprocessing & Compression Engine
 * High-performance server-side preprocessing for image uploads before Cloudinary persistence.
 */

import sharp from 'sharp';
import { CompressionProfile, CompressionProfileName, ProcessedImageResult } from '../cloudinary/types';
import { getCompressionProfile } from './compression-profiles';
import { validateImageInput } from './image-validation';

export async function processImage(
  input: Buffer | string,
  profileName?: CompressionProfileName,
  customOverrides?: Partial<CompressionProfile>
): Promise<ProcessedImageResult> {
  // Step 1: Validate input and extract verified buffer
  const validation = validateImageInput(input);
  if (!validation.valid || !validation.buffer) {
    throw new Error(validation.error || 'Invalid image input for processing.');
  }

  const originalBuffer = validation.buffer;
  const originalBytes = originalBuffer.length;
  const profile = { ...getCompressionProfile(profileName), ...customOverrides };

  // Step 2: Initialize Sharp pipeline with orientation normalization
  let pipeline = sharp(originalBuffer);

  if (profile.normalizeOrientation) {
    // Automatically orient image based on EXIF tag and strip orientation tag
    pipeline = pipeline.rotate();
  }

  // Step 3: Inspect original dimensions
  const metadata = await pipeline.metadata();
  const origWidth = metadata.width || 0;
  const origHeight = metadata.height || 0;

  // Step 4: Apply conditional resizing (never enlarge smaller images)
  if (
    (profile.maxWidth && origWidth > profile.maxWidth) ||
    (profile.maxHeight && origHeight > profile.maxHeight)
  ) {
    pipeline = pipeline.resize({
      width: profile.maxWidth,
      height: profile.maxHeight,
      fit: profile.fit || 'inside',
      withoutEnlargement: true,
    });
  }

  // Step 5: Format negotiation and compression
  let targetFormat = profile.format;
  if (targetFormat === 'preserve') {
    // Retain detected input format (png, jpeg, webp)
    targetFormat = (metadata.format as 'webp' | 'jpeg' | 'png') || 'jpeg';
  }

  switch (targetFormat) {
    case 'webp':
      pipeline = pipeline.webp({
        quality: profile.quality || 80,
        lossless: profile.lossless || false,
        effort: 4,
      });
      break;

    case 'png':
      pipeline = pipeline.png({
        compressionLevel: 8,
        adaptiveFiltering: true,
      });
      break;

    case 'jpeg':
    default:
      pipeline = pipeline.jpeg({
        quality: profile.quality || 85,
        mozjpeg: true,
      });
      break;
  }

  // Step 6: Execute pipeline (EXIF GPS & camera metadata are stripped by default unless withMetadata is called)
  const outputBuffer = await pipeline.toBuffer();
  const finalMetadata = await sharp(outputBuffer).metadata();

  const finalBytes = outputBuffer.length;
  const savings = Math.max(0, ((originalBytes - finalBytes) / originalBytes) * 100);

  return {
    buffer: outputBuffer,
    format: targetFormat,
    width: finalMetadata.width || origWidth,
    height: finalMetadata.height || origHeight,
    bytes: finalBytes,
    originalBytes,
    savingsPercentage: Number(savings.toFixed(2)),
  };
}
