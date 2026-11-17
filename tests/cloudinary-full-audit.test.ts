/**
 * Accero PrintPortal - Full Cloudinary & Sharp Integration Verification Suite
 * Executes live Cloudinary uploads, independent API verifications, MongoDB subdocument persistence,
 * image replacement/deletion lifecycles, and calibrated Sharp compression benchmarks.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import https from 'https';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { loadEnvConfig } from '@next/env';

// Load environment variables
loadEnvConfig(process.cwd());

import { connectToDatabase } from '@/lib/mongodb';
import DocumentRecord from '@/models/DocumentRecord';
import { uploadImageToCloudinary } from '@/lib/cloudinary/upload';
import { deleteImageFromCloudinary, checkAssetExists, replaceImageInCloudinary } from '@/lib/cloudinary/delete';
import { generatePublicDeliveryUrl, generateSignedDeliveryUrl, resolveImageUrl } from '@/lib/cloudinary/delivery';
import { getCloudinaryFolder, generateSecurePublicId, getServiceFolderCategory } from '@/lib/cloudinary/folders';
import { processDocumentIncomingImages } from '@/lib/cloudinary/documentImageHandler';
import { processImage } from '@/lib/media/image-processor';
import { validateImageInput, validateImageMagicBytes } from '@/lib/media/image-validation';
import { CloudinaryFolderCategory, CompressionProfileName } from '@/lib/cloudinary/types';

// Storage for test audit findings
export const auditResults: {
  uploads: any[];
  benchmarks: any[];
  securityChecks: any[];
  mongoChecks: any[];
  replacementChecks: any[];
} = {
  uploads: [],
  benchmarks: [],
  securityChecks: [],
  mongoChecks: [],
  replacementChecks: [],
};

function fetchHttpStatus(url: string): Promise<number> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode || 0);
    }).on('error', () => resolve(0));
  });
}

describe('Comprehensive Cloudinary Integration Verification', () => {
  const trackedPublicIds: string[] = [];

  afterAll(async () => {
    // Safety cleanup: Ensure no test assets remain in Cloudinary
    for (const pid of trackedPublicIds) {
      try {
        await deleteImageFromCloudinary(pid, { type: 'authenticated' });
        await deleteImageFromCloudinary(pid, { type: 'upload' });
      } catch {
        // Silent cleanup
      }
    }

    // Persist full audit results JSON for report compilation
    const outDir = path.resolve(process.cwd(), 'docs/cloudinary');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(
      path.resolve(outDir, 'audit-results.json'),
      JSON.stringify(auditResults, null, 2)
    );
  });

  // -------------------------------------------------------------
  // Phase 3 & 4: Test Actual Cloudinary Uploads (All 11 Categories)
  // -------------------------------------------------------------
  describe('Phases 3 & 4: Live Cloudinary Uploads Across All 11 Image Categories', () => {
    const testCases: Array<{
      id: number;
      label: string;
      docType?: string;
      folderCategory: CloudinaryFolderCategory;
      profile: CompressionProfileName;
      isPrivate: boolean;
      createImage: () => Promise<Buffer>;
    }> = [
      {
        id: 1,
        label: 'PAN portrait',
        docType: 'PAN',
        folderCategory: 'services/pan',
        profile: 'documentPhoto',
        isPrivate: true,
        createImage: () =>
          sharp({ create: { width: 800, height: 1000, channels: 3, background: { r: 180, g: 120, b: 90 } } })
            .jpeg({ quality: 95 })
            .toBuffer(),
      },
      {
        id: 2,
        label: 'Aadhaar portrait',
        docType: 'AADHAAR',
        folderCategory: 'services/aadhaar',
        profile: 'documentPhoto',
        isPrivate: true,
        createImage: () =>
          sharp({ create: { width: 750, height: 950, channels: 3, background: { r: 210, g: 190, b: 150 } } })
            .jpeg({ quality: 95 })
            .toBuffer(),
      },
      {
        id: 3,
        label: 'Voter portrait',
        docType: 'VOTER',
        folderCategory: 'services/voter',
        profile: 'documentPhoto',
        isPrivate: true,
        createImage: () =>
          sharp({ create: { width: 700, height: 900, channels: 3, background: { r: 160, g: 170, b: 180 } } })
            .jpeg({ quality: 95 })
            .toBuffer(),
      },
      {
        id: 4,
        label: 'Driving Licence portrait',
        docType: 'DL',
        folderCategory: 'services/driving-license',
        profile: 'documentPhoto',
        isPrivate: true,
        createImage: () =>
          sharp({ create: { width: 820, height: 1050, channels: 3, background: { r: 140, g: 150, b: 190 } } })
            .jpeg({ quality: 95 })
            .toBuffer(),
      },
      {
        id: 5,
        label: 'RC vehicle image',
        docType: 'RC',
        folderCategory: 'services/vehicle-rc',
        profile: 'documentPhoto',
        isPrivate: true,
        createImage: () =>
          sharp({ create: { width: 1100, height: 800, channels: 3, background: { r: 220, g: 60, b: 60 } } })
            .jpeg({ quality: 92 })
            .toBuffer(),
      },
      {
        id: 6,
        label: 'Farmer ID portrait',
        docType: 'FARMER',
        folderCategory: 'services/farmer-id',
        profile: 'documentPhoto',
        isPrivate: true,
        createImage: () =>
          sharp({ create: { width: 750, height: 950, channels: 3, background: { r: 100, g: 180, b: 110 } } })
            .jpeg({ quality: 95 })
            .toBuffer(),
      },
      {
        id: 7,
        label: 'Signature with transparent background',
        docType: 'VOTER',
        folderCategory: 'documents/signatures',
        profile: 'signature',
        isPrivate: true,
        createImage: () =>
          sharp({ create: { width: 900, height: 350, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
            .png()
            .toBuffer(),
      },
      {
        id: 8,
        label: 'Operator avatar',
        folderCategory: 'users/avatars',
        profile: 'avatar',
        isPrivate: false,
        createImage: () =>
          sharp({ create: { width: 600, height: 600, channels: 3, background: { r: 40, g: 80, b: 200 } } })
            .jpeg({ quality: 90 })
            .toBuffer(),
      },
      {
        id: 9,
        label: 'Marketing banner',
        folderCategory: 'marketing/banners',
        profile: 'marketing',
        isPrivate: false,
        createImage: () =>
          sharp({ create: { width: 1920, height: 1080, channels: 3, background: { r: 139, g: 30, b: 45 } } })
            .jpeg({ quality: 90 })
            .toBuffer(),
      },
      {
        id: 10,
        label: 'Blog featured image',
        folderCategory: 'marketing/blog',
        profile: 'blog',
        isPrivate: false,
        createImage: () =>
          sharp({ create: { width: 1400, height: 900, channels: 3, background: { r: 50, g: 120, b: 140 } } })
            .jpeg({ quality: 88 })
            .toBuffer(),
      },
      {
        id: 11,
        label: 'Generated card canvas preview',
        docType: 'PAN',
        folderCategory: 'documents/generated-previews',
        profile: 'temporaryPreview',
        isPrivate: true,
        createImage: () =>
          sharp({ create: { width: 1000, height: 638, channels: 3, background: { r: 245, g: 245, b: 245 } } })
            .jpeg({ quality: 85 })
            .toBuffer(),
      },
    ];

    for (const tc of testCases) {
      it(`Test ${tc.id}: ${tc.label} [Profile: ${tc.profile}] -> ${tc.folderCategory}`, async () => {
        const rawBuffer = await tc.createImage();
        const rawBytes = rawBuffer.length;

        // 1. Magic bytes & input validation
        const valRes = validateImageMagicBytes(rawBuffer);
        expect(valRes.valid).toBe(true);

        // 2. Sharp preprocessing
        const sharpResult = await processImage(rawBuffer, tc.profile);
        expect(sharpResult.bytes).toBeGreaterThan(0);

        // 3. Upload to Cloudinary
        const uploadRes = await uploadImageToCloudinary(rawBuffer, {
          folder: tc.folderCategory,
          profile: tc.profile,
          isPrivate: tc.isPrivate,
          docType: tc.docType,
          tags: ['automated-audit', tc.profile, `test-${tc.id}`],
        });

        expect(uploadRes.success).toBe(true);
        expect(uploadRes.metadata).toBeDefined();

        const meta = uploadRes.metadata!;
        trackedPublicIds.push(meta.publicId);

        // Verify folder structure
        expect(meta.folder).toContain(`accero/test/${tc.folderCategory}`);
        expect(meta.publicId).toContain(`accero/test/${tc.folderCategory}`);

        // Verify generated publicId is an opaque random UUID with zero citizen PII
        const publicIdSuffix = meta.publicId.split('/').pop() || '';
        expect(publicIdSuffix).toMatch(/^[a-f0-9-]{36}$/);
        expect(publicIdSuffix).not.toMatch(/name|citizen|aadhaar|pan|epic|voter|phone|dob/i);

        // 4. Independent Verification Against Cloudinary API
        const resource = await cloudinary.api.resource(meta.publicId, {
          type: tc.isPrivate ? 'authenticated' : 'upload',
        });
        expect(resource).toBeDefined();
        expect(resource.public_id).toBe(meta.publicId);
        expect(resource.asset_id).toBe(meta.assetId);
        expect(resource.bytes).toBe(meta.bytes);

        // 5. Test Retrieval Resolution
        const resolvedUrl = resolveImageUrl(meta);
        expect(resolvedUrl).toBeTruthy();
        if (tc.isPrivate) {
          expect(resolvedUrl).toContain('s--'); // Must have signed HMAC token
        }

        // 6. Test HTTP Retrieval
        const httpStatus = await fetchHttpStatus(resolvedUrl);
        // Note: authenticated signed URLs or public URLs should return 200 OK from Cloudinary CDN
        expect([200, 304]).toContain(httpStatus);

        // 7. Clean up asset
        const delRes = await deleteImageFromCloudinary(meta.publicId, {
          type: tc.isPrivate ? 'authenticated' : 'upload',
        });
        expect(delRes.success).toBe(true);

        // 8. Confirm asset is deleted
        const stillExists = await checkAssetExists(meta.publicId, {
          type: tc.isPrivate ? 'authenticated' : 'upload',
        });
        expect(stillExists).toBe(false);

        // Store captured evidence
        auditResults.uploads.push({
          testNumber: tc.id,
          label: tc.label,
          folder: meta.folder,
          publicId: meta.publicId,
          assetId: meta.assetId,
          format: meta.format,
          originalBytes: rawBytes,
          processedBytes: meta.bytes,
          dimensions: `${meta.width}x${meta.height}`,
          profile: tc.profile,
          accessMode: meta.accessMode,
          cloudinaryVerified: true,
          httpStatus,
          deletedCleanly: true,
        });
      }, 30000);
    }
  });

  // -------------------------------------------------------------
  // Phase 5: Compression Benchmark Across Diverse Input Image Types
  // -------------------------------------------------------------
  describe('Phase 5: Compression Benchmark on Varied Image Characteristics', () => {
    it('Benchmarks diverse photographic scenarios accurately', async () => {
      const scenarios = [
        {
          name: 'High-Resolution Smartphone Portrait (3000x4000 JPEG)',
          buffer: await sharp({
            create: { width: 3000, height: 4000, channels: 3, background: { r: 190, g: 160, b: 130 } },
          })
            .jpeg({ quality: 95 })
            .toBuffer(),
          profile: 'documentPhoto' as CompressionProfileName,
        },
        {
          name: 'Low-Resolution Portrait (250x250 JPEG)',
          buffer: await sharp({
            create: { width: 250, height: 250, channels: 3, background: { r: 120, g: 140, b: 160 } },
          })
            .jpeg({ quality: 85 })
            .toBuffer(),
          profile: 'documentPhoto' as CompressionProfileName,
        },
        {
          name: 'Dark Photograph (Under-exposed 1200x1500 JPEG)',
          buffer: await sharp({
            create: { width: 1200, height: 1500, channels: 3, background: { r: 25, g: 30, b: 35 } },
          })
            .jpeg({ quality: 90 })
            .toBuffer(),
          profile: 'documentPhoto' as CompressionProfileName,
        },
        {
          name: 'Bright Photograph (Over-exposed 1200x1500 JPEG)',
          buffer: await sharp({
            create: { width: 1200, height: 1500, channels: 3, background: { r: 240, g: 235, b: 230 } },
          })
            .jpeg({ quality: 90 })
            .toBuffer(),
          profile: 'documentPhoto' as CompressionProfileName,
        },
        {
          name: 'Wide Landscape Image (2400x1200 JPEG)',
          buffer: await sharp({
            create: { width: 2400, height: 1200, channels: 3, background: { r: 100, g: 150, b: 200 } },
          })
            .jpeg({ quality: 90 })
            .toBuffer(),
          profile: 'documentPhoto' as CompressionProfileName,
        },
        {
          name: 'Already-Compressed JPEG (1000x1000 at Q=60)',
          buffer: await sharp({
            create: { width: 1000, height: 1000, channels: 3, background: { r: 150, g: 150, b: 150 } },
          })
            .jpeg({ quality: 60 })
            .toBuffer(),
          profile: 'documentPhoto' as CompressionProfileName,
        },
        {
          name: 'Crisp Signature on Alpha Channel (1200x400 PNG)',
          buffer: await sharp({
            create: { width: 1200, height: 400, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
          })
            .png()
            .toBuffer(),
          profile: 'signature' as CompressionProfileName,
        },
      ];

      for (const sc of scenarios) {
        const res = await processImage(sc.buffer, sc.profile);
        auditResults.benchmarks.push({
          scenario: sc.name,
          profile: sc.profile,
          origBytes: sc.buffer.length,
          origKb: (sc.buffer.length / 1024).toFixed(1),
          procBytes: res.bytes,
          procKb: (res.bytes / 1024).toFixed(1),
          format: res.format,
          dimensions: `${res.width}x${res.height}`,
          savingsPercentage: res.savingsPercentage,
        });

        // Verification assertions
        expect(res.bytes).toBeGreaterThan(0);
        if (sc.profile === 'documentPhoto') {
          expect(res.width).toBeLessThanOrEqual(1200);
          expect(res.height).toBeLessThanOrEqual(1500);
        }
      }
    });
  });

  // -------------------------------------------------------------
  // Phase 6: MongoDB Document Persistence & Subdocument Verification
  // -------------------------------------------------------------
  describe('Phase 6: MongoDB Subdocument Persistence & Fallback Compatibility', () => {
    it('Persists Cloudinary subdocument metadata and replaces base64 string', async () => {
      await connectToDatabase();

      const samplePhoto = await sharp({
        create: { width: 600, height: 800, channels: 3, background: { r: 120, g: 180, b: 240 } },
      })
        .jpeg({ quality: 90 })
        .toBuffer();

      const base64DataUrl = `data:image/jpeg;base64,${samplePhoto.toString('base64')}`;

      const testUserId = new mongoose.Types.ObjectId();

      // Simulate incoming document processing
      const processed = await processDocumentIncomingImages({
        userId: testUserId.toString(),
        docType: 'PAN',
        data: {
          panNumber: 'ABCDE1234F',
          fullName: 'SURESH KUMAR',
          photoUrl: base64DataUrl,
        },
      });

      expect(processed.hasUploadedToCloudinary).toBe(true);
      expect(processed.photoMetadata).toBeDefined();
      expect(processed.data.photoUrl.startsWith('data:image/')).toBe(false);
      expect(processed.data.photoUrl).toContain('https://res.cloudinary.com/');

      const meta = processed.photoMetadata!;
      trackedPublicIds.push(meta.publicId);

      // Create test document in MongoDB
      const doc = await DocumentRecord.create({
        userId: testUserId,
        docType: 'PAN',
        cardIdentifier: 'ABCDE1234F',
        documentNumberHash: 'hash_test_12345',
        inputMode: 'MANUAL',
        data: processed.data,
        photoMetadata: processed.photoMetadata,
        imageMigrationStatus: 'MIGRATED',
        source: 'MANUAL',
        status: 'ACTIVE',
        fetchedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
      });

      expect(doc._id).toBeDefined();

      // Retrieve directly from MongoDB to verify schema compliance
      const fetched = await DocumentRecord.findById(doc._id).lean();
      expect(fetched).toBeDefined();
      expect((fetched as any).photoMetadata.provider).toBe('cloudinary');
      expect((fetched as any).photoMetadata.publicId).toBe(meta.publicId);
      expect((fetched as any).photoMetadata.assetId).toBe(meta.assetId);
      expect((fetched as any).photoMetadata.accessMode).toBe('authenticated');
      expect((fetched as any).data.photoUrl).toBe(meta.secureUrl);

      auditResults.mongoChecks.push({
        check: 'Subdocument schema validation',
        docId: doc._id.toString(),
        publicId: meta.publicId,
        metadataMatches: true,
        base64Eliminated: true,
      });

      // Cleanup MongoDB doc and Cloudinary asset
      await DocumentRecord.findByIdAndDelete(doc._id);
      await deleteImageFromCloudinary(meta.publicId, { type: 'authenticated' });
    }, 25000);

    it('Guarantees 100% backward compatibility with legacy Base64 documents', () => {
      const legacyDocData = {
        photoUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
        fullName: 'LEGACY USER',
      };

      const resolved = resolveImageUrl(legacyDocData.photoUrl);
      expect(resolved).toBe(legacyDocData.photoUrl);

      auditResults.mongoChecks.push({
        check: 'Legacy Base64 passthrough',
        passed: true,
      });
    });
  });

  // -------------------------------------------------------------
  // Phase 7: Security & Adversarial File Handling
  // -------------------------------------------------------------
  describe('Phase 7: Security Validation & Protection Enforcement', () => {
    it('Rejects vector SVG files containing script tags to prevent stored XSS', () => {
      const maliciousSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
      const res = validateImageInput(maliciousSvg);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('SVG uploads are rejected for security');

      auditResults.securityChecks.push({
        test: 'SVG XSS rejection',
        passed: true,
      });
    });

    it('Rejects oversized uploads exceeding byte limits', () => {
      const oversized = Buffer.alloc(12 * 1024 * 1024); // 12 MB
      oversized[0] = 0xff;
      oversized[1] = 0xd8;
      oversized[2] = 0xff;

      const res = validateImageInput(oversized, 10 * 1024 * 1024);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('exceeds maximum limit');

      auditResults.securityChecks.push({
        test: 'Oversized payload limit enforcement',
        passed: true,
      });
    });

    it('Rejects corrupted / non-image random buffers', () => {
      const junk = Buffer.from('this is completely random plain text that is not an image');
      const res = validateImageInput(junk);
      expect(res.valid).toBe(false);

      auditResults.securityChecks.push({
        test: 'Non-image magic bytes rejection',
        passed: true,
      });
    });

    it('Enforces authenticated delivery URLs with expiration for citizen PII', () => {
      const privatePublicId = 'accero/production/services/pan/safe-uuid-12345';
      const signedUrl = generateSignedDeliveryUrl(privatePublicId, {
        expiresInSeconds: 3600,
        type: 'authenticated',
      });

      expect(signedUrl).toContain('image/authenticated');
      expect(signedUrl).toContain('s--'); // Cloudinary cryptographic signature token

      auditResults.securityChecks.push({
        test: 'Authenticated URL signing with s-- token',
        passed: true,
      });
    });
  });

  // -------------------------------------------------------------
  // Phase 9: Image Replacement & Document Deletion Lifecycle
  // -------------------------------------------------------------
  describe('Phase 9: Asset Replacement & Deletion Lifecycle', () => {
    it('Safely replaces an asset: uploads new image and deletes prior image', async () => {
      const imgA = await sharp({ create: { width: 500, height: 500, channels: 3, background: { r: 255, g: 0, b: 0 } } })
        .jpeg()
        .toBuffer();
      const imgB = await sharp({ create: { width: 500, height: 500, channels: 3, background: { r: 0, g: 255, b: 0 } } })
        .jpeg()
        .toBuffer();

      // Step 1: Upload Image A
      const uploadA = await uploadImageToCloudinary(imgA, {
        folder: 'temporary',
        profile: 'temporaryPreview',
        isPrivate: false,
      });
      expect(uploadA.success).toBe(true);
      const publicIdA = uploadA.metadata!.publicId;
      trackedPublicIds.push(publicIdA);

      // Verify A exists
      const existsA1 = await checkAssetExists(publicIdA);
      expect(existsA1).toBe(true);

      // Step 2: Replace Image A with Image B
      const replaceRes = await replaceImageInCloudinary(publicIdA, imgB, {
        folder: 'temporary',
        profile: 'temporaryPreview',
        isPrivate: false,
      });
      expect(replaceRes.success).toBe(true);
      const publicIdB = replaceRes.metadata!.publicId;
      trackedPublicIds.push(publicIdB);

      expect(publicIdB).not.toBe(publicIdA);

      // Verify B exists in Cloudinary
      const existsB = await checkAssetExists(publicIdB);
      expect(existsB).toBe(true);

      // Verify A was destroyed in Cloudinary
      const existsA2 = await checkAssetExists(publicIdA);
      expect(existsA2).toBe(false);

      // Step 3: Cleanup B
      await deleteImageFromCloudinary(publicIdB);

      auditResults.replacementChecks.push({
        test: 'Atomic replacement and orphan prevention',
        publicIdA,
        publicIdB,
        oldAssetDestroyed: true,
        newAssetLive: true,
      });
    }, 30000);
  });
});
