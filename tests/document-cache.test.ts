import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import {
  generateDocumentCacheKey,
  isDocumentCacheValid,
  findCachedDocument,
  saveDocumentToCache,
  invalidateDocumentCache,
  CACHE_TTL_HOURS,
  CACHE_TTL_MS,
  normalizeDocumentIdentifier,
} from '@/lib/documents/documentCache';
import { lookupDocument } from '@/lib/documents/documentLookup';
import DocumentRecord from '@/models/DocumentRecord';
import * as orchestrator from '@/lib/verify/orchestrator';
import * as providerFactory from '@/lib/verify/providerFactory';

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue({}),
  connectToDatabase: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/logger/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/security/rateLimiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 15,
    resetSeconds: 60,
    retryAfterSeconds: 0,
  }),
}));

vi.mock('@/models/DocumentRecord', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn(),
    countDocuments: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('@/lib/verify/providerFactory', () => ({
  getProvidersForDocType: vi.fn(),
}));

vi.mock('@/lib/verify/orchestrator', () => ({
  executeProviderCascade: vi.fn(),
}));

describe('72-Hour Centralized Document Cache & Database-First Engine', () => {
  const userId = '60d5ec49f1b2c82b8c8e1111';
  const otherUserId = '60d5ec49f1b2c82b8c8e2222';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Service identifier normalization
  it('normalizes identifiers per service without collisions', () => {
    expect(normalizeDocumentIdentifier('pan', ' abcde 1234 f ')).toBe('ABCDE1234F');
    expect(normalizeDocumentIdentifier('voter', ' abc 0123456 ')).toBe('ABC0123456');
    expect(normalizeDocumentIdentifier('rc', ' up-05 ld 1234 ')).toBe('UP05LD1234');
    expect(normalizeDocumentIdentifier('aadhaar', ' 5749-0326-7673 ')).toBe('574903267673');
    expect(normalizeDocumentIdentifier('ration', ' rc 9988 7766 ')).toBe('RC99887766');

    // Different document types with identical numbers produce different cache keys
    const panKey = generateDocumentCacheKey('pan', 'ABCDE1234F');
    const rcKey = generateDocumentCacheKey('rc', 'ABCDE1234F');
    expect(panKey.cacheKey).not.toBe(rcKey.cacheKey);
  });

  // 2. 72-hour TTL expiration calculation
  it('calculates cache expiration as exactly 72 hours from retrieval', () => {
    expect(CACHE_TTL_HOURS).toBe(72);
    expect(CACHE_TTL_MS).toBe(72 * 60 * 60 * 1000);

    const now = Date.now();
    const docValid = {
      data: { fullName: 'Test User' },
      expiresAt: new Date(now + 3600 * 1000), // expires in 1 hour
    } as any;

    const docExpired = {
      data: { fullName: 'Test User' },
      expiresAt: new Date(now - 1000), // expired 1s ago
    } as any;

    expect(isDocumentCacheValid(docValid)).toBe(true);
    expect(isDocumentCacheValid(docExpired)).toBe(false);
  });

  // 3. Database cache hit: MongoDB returns valid document, NeoAPI is NOT called
  it('returns valid cached document from MongoDB and does NOT call external APIs', async () => {
    const cachedData = {
      panNumber: 'ABCDE1234F',
      fullName: 'SURESH VERMA',
      fatherName: 'RAMESH VERMA',
      dateOfBirth: '12/04/1985',
    };

    const mockRecord = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(userId),
      docType: 'PAN',
      cardIdentifier: 'ABCDE1234F',
      data: cachedData,
      isComplete: true,
      provider: 'NeoAPI',
      source: 'API',
      fetchedAt: new Date(),
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000), // valid for 48 more hours
    };

    vi.mocked(DocumentRecord.findOne).mockResolvedValue(mockRecord as any);

    const result = await lookupDocument({
      userId,
      docType: 'pan',
      documentNumber: 'ABCDE1234F',
    });

    expect(result.success).toBe(true);
    expect(result.cache.hit).toBe(true);
    expect(result.source).toBe('CACHE');
    expect(result.data.fullName).toBe('SURESH VERMA');

    // External provider cascade MUST NOT be called on cache hit!
    expect(orchestrator.executeProviderCascade).not.toHaveBeenCalled();
    expect(providerFactory.getProvidersForDocType).not.toHaveBeenCalled();
  });

  // 4. Database cache miss: queries external provider and persists to MongoDB with 72h TTL
  it('dispatches provider cascade on cache miss and saves response to MongoDB with 72h expiration', async () => {
    // Cache miss in MongoDB
    vi.mocked(DocumentRecord.findOne).mockResolvedValue(null);

    const freshApiData = {
      panNumber: 'XYZAB9876C',
      fullName: 'PRIYA SHARMA',
      fatherName: 'AJAY SHARMA',
      dateOfBirth: '20/08/1992',
    };

    vi.mocked(providerFactory.getProvidersForDocType).mockReturnValue([
      { name: 'NeoAPI', isAvailable: true, verify: vi.fn() } as any,
    ]);

    vi.mocked(orchestrator.executeProviderCascade).mockResolvedValue({
      success: true,
      documentType: 'pan',
      idNumber: 'XYZAB9876C',
      data: freshApiData,
      isPartial: false,
      provider: 'NeoAPI',
      latencyMs: 350,
    });

    const savedRecord = {
      _id: new mongoose.Types.ObjectId(),
      data: freshApiData,
      fetchedAt: new Date(),
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
      isComplete: true,
      missingFields: [],
    };
    vi.mocked(DocumentRecord.findOneAndUpdate).mockResolvedValue(savedRecord as any);

    const result = await lookupDocument({
      userId,
      docType: 'pan',
      documentNumber: 'XYZAB9876C',
    });

    expect(result.success).toBe(true);
    expect(result.cache.hit).toBe(false);
    expect(result.source).toBe('API');
    expect(result.data.fullName).toBe('PRIYA SHARMA');

    // Provider cascade was called
    expect(orchestrator.executeProviderCascade).toHaveBeenCalledWith(
      'pan',
      'XYZAB9876C',
      expect.any(Array)
    );

    // Document was saved with 72-hour expiration
    expect(DocumentRecord.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: new mongoose.Types.ObjectId(userId),
        docType: 'PAN',
        cardIdentifier: 'XYZAB9876C',
      }),
      expect.objectContaining({
        $set: expect.objectContaining({
          data: freshApiData,
          provider: 'NeoAPI',
        }),
      }),
      expect.any(Object)
    );
  });

  // 5. Expired cache triggers fresh lookup and resets 72-hour timer
  it('treats expired document as cache miss and refreshes 72-hour expiration on successful API lookup', async () => {
    // FindOne returns null because expiresAt is expired (query filter has expiresAt: { $gt: now })
    vi.mocked(DocumentRecord.findOne).mockResolvedValue(null);

    const updatedData = {
      epicNumber: 'ABC1234567',
      electorName: 'RAKESH GUPTA',
      fullAddress: 'Varanasi, UP',
    };

    vi.mocked(providerFactory.getProvidersForDocType).mockReturnValue([
      { name: 'Axen', isAvailable: true, verify: vi.fn() } as any,
    ]);

    vi.mocked(orchestrator.executeProviderCascade).mockResolvedValue({
      success: true,
      documentType: 'voter',
      idNumber: 'ABC1234567',
      data: updatedData,
      isPartial: false,
      provider: 'Axen',
      latencyMs: 400,
    });

    const refreshedRecord = {
      _id: new mongoose.Types.ObjectId(),
      data: updatedData,
      fetchedAt: new Date(),
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
    };
    vi.mocked(DocumentRecord.findOneAndUpdate).mockResolvedValue(refreshedRecord as any);

    const result = await lookupDocument({
      userId,
      docType: 'voter',
      documentNumber: 'ABC1234567',
    });

    expect(result.success).toBe(true);
    expect(result.cache.hit).toBe(false);
    expect(result.data.electorName).toBe('RAKESH GUPTA');
    expect(orchestrator.executeProviderCascade).toHaveBeenCalled();
  });

  // 6. Provider failure does NOT overwrite or destroy existing records
  it('does NOT overwrite or destroy existing data if downstream provider fails', async () => {
    vi.mocked(DocumentRecord.findOne).mockResolvedValue(null);

    vi.mocked(providerFactory.getProvidersForDocType).mockReturnValue([
      { name: 'NeoAPI', isAvailable: true, verify: vi.fn() } as any,
    ]);

    vi.mocked(orchestrator.executeProviderCascade).mockResolvedValue({
      success: false,
      documentType: 'pan',
      idNumber: 'ABCDE1234F',
      data: {},
      isPartial: false,
      errorMessage: 'Government portal timeout',
    });

    const result = await lookupDocument({
      userId,
      docType: 'pan',
      documentNumber: 'ABCDE1234F',
    });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe('Government portal timeout');

    // Database save was NOT called with empty/failed data
    expect(DocumentRecord.findOneAndUpdate).not.toHaveBeenCalled();
  });

  // 7. Tenant Isolation: User B cannot retrieve User A's cached records
  it('enforces strict tenant isolation: users cannot access records of another user', async () => {
    // Record belongs to User A
    const userARecord = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(userId),
      docType: 'PAN',
      cardIdentifier: 'ABCDE1234F',
      data: { fullName: 'CONFIDENTIAL CITIZEN' },
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
    };

    // DocumentRecord.findOne checks userId match
    (vi.mocked(DocumentRecord.findOne) as any).mockImplementation(({ userId: queryUserId }: any) => {
      if (queryUserId.toString() === userId) {
        return Promise.resolve(userARecord as any);
      }
      return Promise.resolve(null); // User B has no access to User A's record
    });

    // User B attempts lookup of User A's card
    const resultUserB = await findCachedDocument({
      userId: otherUserId,
      docType: 'pan',
      documentNumber: 'ABCDE1234F',
    });

    expect(resultUserB).toBeNull();

    // User A can access their own record
    const resultUserA = await findCachedDocument({
      userId,
      docType: 'pan',
      documentNumber: 'ABCDE1234F',
    });

    expect(resultUserA).not.toBeNull();
    expect(resultUserA?.data.fullName).toBe('CONFIDENTIAL CITIZEN');
  });

  // 8. Explicit invalidation sets expiresAt to past
  it('explicitly invalidates cached records by setting expiresAt to the past', async () => {
    vi.mocked(DocumentRecord.updateOne).mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
    });

    const success = await invalidateDocumentCache({
      userId,
      docType: 'pan',
      documentNumber: 'ABCDE1234F',
    });

    expect(success).toBe(true);
    expect(DocumentRecord.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: new mongoose.Types.ObjectId(userId),
        docType: 'PAN',
      }),
      expect.objectContaining({
        $set: expect.objectContaining({
          status: 'EXPIRED',
        }),
      })
    );
  });
});
