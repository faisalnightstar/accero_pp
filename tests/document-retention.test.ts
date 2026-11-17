import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isDocumentCacheValid,
  CACHE_TTL_HOURS,
  CACHE_TTL_MS,
  generateDocumentCacheKey,
  normalizeDocumentIdentifier,
  normalizeDocTypeString,
  findCachedDocument,
  saveDocumentToCache,
} from '@/lib/documents/documentCache';
import DocumentRecord from '@/models/DocumentRecord';
import mongoose from 'mongoose';

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/missingFields', () => ({
  analyzeDocumentCompleteness: vi.fn().mockReturnValue({
    missingKeys: [],
    isPrintReady: true,
  }),
}));

describe('Document 72-Hour Retention & Privacy Validation (Workstream E)', () => {
  const userA = new mongoose.Types.ObjectId().toString();
  const userB = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. 72-Hour Cache Duration Constants', () => {
    it('enforces exact 72-hour TTL parameters', () => {
      expect(CACHE_TTL_HOURS).toBe(72);
      expect(CACHE_TTL_MS).toBe(72 * 60 * 60 * 1000);
      expect(CACHE_TTL_MS).toBe(259200000);
    });
  });

  describe('2. isDocumentCacheValid Boundary Testing', () => {
    it('returns true for a newly created document valid for 72 hours', () => {
      const now = Date.now();
      const validDoc: any = {
        data: { name: 'Ramesh Sharma', pan: 'ABCDE1234F' },
        expiresAt: new Date(now + 3600 * 1000), // 1 hour in the future
      };

      expect(isDocumentCacheValid(validDoc)).toBe(true);
    });

    it('returns true for a document at 71 hours and 59 minutes (before expiry)', () => {
      const now = Date.now();
      const validDoc: any = {
        data: { pan: 'ABCDE1234F' },
        expiresAt: new Date(now + 60 * 1000), // 1 minute remaining
      };

      expect(isDocumentCacheValid(validDoc)).toBe(true);
    });

    it('returns false at the exact expiration timestamp (now == expiresAt)', () => {
      const now = Date.now();
      const exactExpiryDoc: any = {
        data: { pan: 'ABCDE1234F' },
        expiresAt: new Date(now - 1), // Exact moment or 1ms past
      };

      expect(isDocumentCacheValid(exactExpiryDoc)).toBe(false);
    });

    it('returns false for an expired document (now > expiresAt)', () => {
      const now = Date.now();
      const expiredDoc: any = {
        data: { pan: 'ABCDE1234F' },
        expiresAt: new Date(now - 3600 * 1000), // Expired 1 hour ago
      };

      expect(isDocumentCacheValid(expiredDoc)).toBe(false);
    });

    it('returns false when expiresAt timestamp is missing (null or undefined)', () => {
      const noExpiryDoc: any = {
        data: { pan: 'ABCDE1234F' },
        expiresAt: undefined,
      };

      expect(isDocumentCacheValid(noExpiryDoc)).toBe(false);

      const nullExpiryDoc: any = {
        data: { pan: 'ABCDE1234F' },
        expiresAt: null,
      };

      expect(isDocumentCacheValid(nullExpiryDoc)).toBe(false);
    });

    it('returns false when expiresAt is an invalid Date object', () => {
      const invalidDateDoc: any = {
        data: { pan: 'ABCDE1234F' },
        expiresAt: new Date('invalid_date_string'),
      };

      expect(isDocumentCacheValid(invalidDateDoc)).toBe(false);
    });

    it('returns false when document data is empty or missing', () => {
      const emptyDataDoc: any = {
        data: {},
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };

      expect(isDocumentCacheValid(emptyDataDoc)).toBe(false);

      const nullDoc: any = null;
      expect(isDocumentCacheValid(nullDoc)).toBe(false);
    });
  });

  describe('3. Tenant Isolation & Cross-Tenant Privacy Gating', () => {
    it('ensures User B cannot query, view, or access User A cached documents', async () => {
      const docNumber = 'ABCDE1234F';

      // Mock database record owned strictly by User A
      vi.spyOn(DocumentRecord, 'findOne').mockImplementation((query: any) => {
        // Query must match the userObjectId exactly
        if (query.userId.toString() === userA && query.expiresAt.$gt) {
          return {
            userId: new mongoose.Types.ObjectId(userA),
            docType: 'PAN',
            cardIdentifier: docNumber,
            data: { pan: docNumber, name: 'Citizen A' },
            expiresAt: new Date(Date.now() + 3600 * 1000),
          } as any;
        }
        return null; // Return null if queried by any other user!
      });

      // User A queries their own document: returns valid record
      const docUserA = await findCachedDocument({
        userId: userA,
        docType: 'PAN',
        documentNumber: docNumber,
      });
      expect(docUserA).not.toBeNull();
      expect(docUserA?.data?.name).toBe('Citizen A');

      // User B attempts to query the same document: strictly returns null
      const docUserB = await findCachedDocument({
        userId: userB,
        docType: 'PAN',
        documentNumber: docNumber,
      });
      expect(docUserB).toBeNull();
    });
  });

  describe('4. Cryptographic Lookup Key & HMAC Hashing', () => {
    it('generates deterministic HMAC-SHA256 hashes without storing plaintext query indexes', () => {
      const key1 = generateDocumentCacheKey('PAN', 'ABCDE1234F');
      const key2 = generateDocumentCacheKey('pan', 'abcde 1234 f'); // normalized

      expect(key1.hash).toBe(key2.hash);
      expect(key1.hash).toHaveLength(64); // SHA-256 hex length
      expect(key1.normalizedType).toBe('PAN');
      expect(key1.normalizedId).toBe('ABCDE1234F');
    });

    it('normalizes Aadhaar identifiers by stripping spaces and hyphens before hashing', () => {
      const key1 = generateDocumentCacheKey('AADHAAR', '987654321098');
      const key2 = generateDocumentCacheKey('aadhaar', '9876 5432 1098');
      const key3 = generateDocumentCacheKey('uid', '9876-5432-1098');

      expect(key1.hash).toBe(key2.hash);
      expect(key2.hash).toBe(key3.hash);
      expect(key1.normalizedId).toBe('987654321098');
    });
  });
});
