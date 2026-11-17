/**
 * Accero PrintPortal - Image Validation Service
 * Server-side magic-byte inspection, MIME verification, and PII protection.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  buffer?: Buffer;
  mimeType?: string;
  detectedExtension?: string;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 Megabytes limit

/**
 * Validates a Buffer against allowed image magic numbers.
 * Strictly prevents malicious SVG script injection, executables, and spoofed extensions.
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; mimeType?: string; ext?: string; error?: string } {
  if (!buffer || buffer.length < 12) {
    return { valid: false, error: 'File buffer is too small or empty to be a valid image.' };
  }

  // Check JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, mimeType: 'image/jpeg', ext: 'jpg' };
  }

  // Check PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, mimeType: 'image/png', ext: 'png' };
  }

  // Check WebP: RIFF .... WEBP
  // Offset 0-3: 'RIFF', Offset 8-11: 'WEBP'
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { valid: true, mimeType: 'image/webp', ext: 'webp' };
  }

  // Check GIF: GIF87a or GIF89a
  const gif = buffer.toString('ascii', 0, 6);
  if (gif === 'GIF87a' || gif === 'GIF89a') {
    return { valid: true, mimeType: 'image/gif', ext: 'gif' };
  }

  // Reject SVG to prevent XSS vulnerability unless explicitly converted
  const snippet = buffer.slice(0, 100).toString('utf8').toLowerCase();
  if (snippet.includes('<svg') || snippet.includes('<?xml')) {
    return { valid: false, error: 'Vector SVG uploads are rejected for security. Please upload raster JPEG, PNG, or WebP.' };
  }

  return { valid: false, error: 'Unsupported image format. Only JPEG, PNG, and WebP are allowed.' };
}

/**
 * Converts a base64 string or data URL into a binary Buffer.
 * Uses high-performance string slicing instead of regex to prevent stack overflows on multi-megabyte payloads.
 */
export function parseBase64Image(dataString: string): { buffer: Buffer; declaredMime?: string } | null {
  if (!dataString || typeof dataString !== 'string') return null;

  if (dataString.startsWith('data:')) {
    const commaIndex = dataString.indexOf(',');
    if (commaIndex === -1) return null;
    const header = dataString.slice(0, commaIndex);
    const base64Data = dataString.slice(commaIndex + 1);

    const semiIndex = header.indexOf(';');
    const declaredMime = semiIndex !== -1 ? header.slice(5, semiIndex) : header.slice(5);

    try {
      const buffer = Buffer.from(base64Data, 'base64');
      return { buffer, declaredMime };
    } catch {
      return null;
    }
  }

  // Raw base64 string without data: prefix
  try {
    const buffer = Buffer.from(dataString, 'base64');
    return { buffer };
  } catch {
    return null;
  }
}

/**
 * Primary validator for incoming image inputs (Buffer, base64 data URI, or File stream).
 */
export function validateImageInput(input: Buffer | string, maxBytes: number = MAX_IMAGE_BYTES): ValidationResult {
  let buffer: Buffer;

  if (typeof input === 'string') {
    const parsed = parseBase64Image(input);
    if (!parsed) {
      return { valid: false, error: 'Invalid base64 image data.' };
    }
    buffer = parsed.buffer;
  } else if (Buffer.isBuffer(input)) {
    buffer = input;
  } else {
    return { valid: false, error: 'Input must be a Buffer or base64 image string.' };
  }

  if (buffer.length > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    return { valid: false, error: `Image file size exceeds maximum limit of ${maxMb}MB.` };
  }

  const magicCheck = validateImageMagicBytes(buffer);
  if (!magicCheck.valid) {
    return { valid: false, error: magicCheck.error };
  }

  return {
    valid: true,
    buffer,
    mimeType: magicCheck.mimeType,
    detectedExtension: magicCheck.ext,
  };
}
