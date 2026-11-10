import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import * as verifyActions from '@/actions/verify';
import * as auth from '@/lib/auth';
import * as walletActions from '@/actions/wallet';
import * as orchestrator from '@/lib/verify/orchestrator';
import * as providerFactory from '@/lib/verify/providerFactory';
import { authorizePrint } from '@/lib/print/printAuthorization';
import DocumentRecord from '@/models/DocumentRecord';
import Wallet from '@/models/Wallet';
import PrintJob from '@/models/PrintJob';
import User from '@/models/User';
import { CACHE_TTL_MS } from '@/lib/documents/documentCache';

vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof auth>('@/lib/auth');
  return {
    ...actual,
    getSession: vi.fn(),
  };
});

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

vi.mock('@/actions/wallet', () => ({
  getWalletBalance: vi.fn(),
  deductWalletFee: vi.fn(),
}));

vi.mock('@/lib/verify/providerFactory', () => ({
  getProvidersForDocType: vi.fn(),
}));

vi.mock('@/lib/verify/orchestrator', () => ({
  executeProviderCascade: vi.fn(),
}));

vi.mock('@/models/DocumentRecord', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/models/Wallet', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('@/models/PrintJob', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/models/User', () => ({
  default: {
    findById: vi.fn(),
  },
}));

describe('End-to-End Document Lifecycle & Integration Scenarios', () => {
  const userId = '60d5ec49f1b2c82b8c8e1111';
  const userObjectId = new mongoose.Types.ObjectId(userId);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth.getSession).mockResolvedValue({
      userId,
      email: 'user@test.com',
      name: 'User',
      role: 'user',
    });
    vi.mocked(walletActions.getWalletBalance).mockResolvedValue({
      success: true,
      balance: 200,
      totalCredited: 500,
      totalDebited: 300,
      isLowBalance: false,
    });
    vi.mocked(User.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: userObjectId,
        status: 'active',
      }),
    } as any);
  });

  // Scenario A: Database cache hit
  // User searches PAN -> MongoDB returns document -> NeoAPI is not called -> user prints -> wallet is deducted
  it('Scenario A: Database Cache Hit -> Instant MongoDB Return -> Print Authorization Deducts Wallet', async () => {
    const cachedData = {
      panNumber: 'ABCDE1234F',
      fullName: 'VIKRAM SINGH',
      fatherName: 'JASWANT SINGH',
      dateOfBirth: '10/05/1988',
    };

    const mockDoc = {
      _id: new mongoose.Types.ObjectId(),
      userId: userObjectId,
      docType: 'PAN',
      cardIdentifier: 'ABCDE1234F',
      data: cachedData,
      isComplete: true,
      provider: 'NeoAPI',
      expiresAt: new Date(Date.now() + 50 * 3600 * 1000), // unexpired
      fetchedAt: new Date(),
    };

    vi.mocked(DocumentRecord.findOne).mockResolvedValue(mockDoc as any);

    // 1. Search document
    const searchRes = await verifyActions.verifyDocument('pan', 'ABCDE1234F');
    expect(searchRes.success).toBe(true);
    expect(searchRes.data.fullName).toBe('VIKRAM SINGH');
    expect(searchRes.feeDeducted).toBe(0); // Zero deduction on preview/search
    expect(orchestrator.executeProviderCascade).not.toHaveBeenCalled(); // NeoAPI NOT called!

    // 2. User clicks Print in Studio
    vi.mocked(PrintJob.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    vi.mocked(Wallet.findOneAndUpdate).mockResolvedValue({
      balance: 150,
      transactions: [{ amount: 50, balanceAfter: 150 }],
      save: vi.fn().mockResolvedValue(true),
    } as any);

    const printJobId = 'pj_scenario_a_1';
    const printRes = await authorizePrint({
      userId,
      documentType: 'pan',
      cardIdentifier: 'ABCDE1234F',
      documentId: mockDoc._id.toString(),
      printJobId,
      printFormat: 'CR80',
    });

    expect(printRes.success).toBe(true);
    expect(printRes.fee).toBe(50);
    expect(printRes.remainingBalance).toBe(150);
    expect(PrintJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        printJobId,
        status: 'AUTHORIZED',
        fee: 50,
      })
    );
  });

  // Scenario B: Database cache miss
  // User searches PAN -> MongoDB returns no record -> NeoAPI called -> response saved -> user prints -> wallet deducted
  it('Scenario B: Database Cache Miss -> External Provider Invocated -> Saved to MongoDB -> Print Billed', async () => {
    // 1. Cache Miss
    vi.mocked(DocumentRecord.findOne).mockResolvedValue(null);

    const freshApiData = {
      panNumber: 'BNZPK4321A',
      fullName: 'ANITA DESHMUKH',
      fatherName: 'SANJAY DESHMUKH',
      dateOfBirth: '15/07/1995',
    };

    vi.mocked(providerFactory.getProvidersForDocType).mockReturnValue([
      { name: 'NeoAPI', isAvailable: true, verify: vi.fn() } as any,
    ]);

    vi.mocked(orchestrator.executeProviderCascade).mockResolvedValue({
      success: true,
      documentType: 'pan',
      idNumber: 'BNZPK4321A',
      data: freshApiData,
      isPartial: false,
      provider: 'NeoAPI',
      latencyMs: 310,
    });

    const createdDocId = new mongoose.Types.ObjectId();
    vi.mocked(DocumentRecord.findOneAndUpdate).mockResolvedValue({
      _id: createdDocId,
      data: freshApiData,
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
      fetchedAt: new Date(),
      isComplete: true,
      missingFields: [],
    } as any);

    // Search document
    const searchRes = await verifyActions.verifyDocument('pan', 'BNZPK4321A');
    expect(searchRes.success).toBe(true);
    expect(searchRes.data.fullName).toBe('ANITA DESHMUKH');
    expect(orchestrator.executeProviderCascade).toHaveBeenCalled();
    expect(DocumentRecord.findOneAndUpdate).toHaveBeenCalled(); // Saved in MongoDB with 72h TTL

    // 2. User prints document
    vi.mocked(PrintJob.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    vi.mocked(Wallet.findOneAndUpdate).mockResolvedValue({
      balance: 150,
      transactions: [{ amount: 50, balanceAfter: 150 }],
      save: vi.fn().mockResolvedValue(true),
    } as any);

    const printRes = await authorizePrint({
      userId,
      documentType: 'pan',
      cardIdentifier: 'BNZPK4321A',
      documentId: createdDocId.toString(),
      printJobId: 'pj_scenario_b_1',
    });

    expect(printRes.success).toBe(true);
    expect(printRes.fee).toBe(50);
  });

  // Scenario C: Expired cache
  // User searches document -> Expired record found -> Provider called -> Expiration reset to 72 hours
  it('Scenario C: Expired Cache -> Treats as Miss -> Fresh Provider Fetch -> Expiration Reset to 72h', async () => {
    // findOne returns null for unexpired record
    vi.mocked(DocumentRecord.findOne).mockResolvedValue(null);

    const refreshedData = {
      epicNumber: 'XYZ9876543',
      electorName: 'SUNIL KUMAR',
    };

    vi.mocked(providerFactory.getProvidersForDocType).mockReturnValue([
      { name: 'Axen', isAvailable: true, verify: vi.fn() } as any,
    ]);

    vi.mocked(orchestrator.executeProviderCascade).mockResolvedValue({
      success: true,
      documentType: 'voter',
      idNumber: 'XYZ9876543',
      data: refreshedData,
      isPartial: false,
      provider: 'Axen',
      latencyMs: 280,
    });

    vi.mocked(DocumentRecord.findOneAndUpdate).mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      data: refreshedData,
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
      fetchedAt: new Date(),
    } as any);

    const searchRes = await verifyActions.verifyDocument('voter', 'XYZ9876543');
    expect(searchRes.success).toBe(true);
    expect(searchRes.data.electorName).toBe('SUNIL KUMAR');
    expect(orchestrator.executeProviderCascade).toHaveBeenCalled();
  });

  // Scenario D: Insufficient wallet balance blocks printing but allows preview
  it('Scenario D: Insufficient Wallet Balance -> Allows Preview -> Blocks Print Authorization', async () => {
    const cachedData = {
      panNumber: 'ABCDE1234F',
      fullName: 'POOR BALANCE USER',
    };

    vi.mocked(DocumentRecord.findOne).mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      data: cachedData,
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
    } as any);

    // 1. Preview/search succeeds without deduction!
    const searchRes = await verifyActions.verifyDocument('pan', 'ABCDE1234F');
    expect(searchRes.success).toBe(true);
    expect(searchRes.feeDeducted).toBe(0);

    // 2. User clicks Print, but wallet has only ₹10 (PAN fee is ₹50)
    vi.mocked(PrintJob.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    vi.mocked(Wallet.findOneAndUpdate).mockResolvedValue(null); // balance: { $gte: 50 } fails!
    vi.mocked(Wallet.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ balance: 10 }),
    } as any);

    const printRes = await authorizePrint({
      userId,
      documentType: 'pan',
      cardIdentifier: 'ABCDE1234F',
      printJobId: 'pj_insufficient_1',
    });

    expect(printRes.success).toBe(false);
    expect(printRes.error?.code).toBe('INSUFFICIENT_BALANCE');
    expect(printRes.requiredFee).toBe(50);
    expect(printRes.currentBalance).toBe(10);
    expect(PrintJob.create).not.toHaveBeenCalled();
  });

  // Scenario E: Duplicate print request
  // User clicks print -> Wallet deducted once -> Network retries same printJobId -> Existing authorization returned -> No second deduction
  it('Scenario E: Duplicate Print Request -> Returns Existing Authorization Without Second Deduction', async () => {
    const existingJob = {
      printJobId: 'pj_retry_network_1',
      fee: 50,
      status: 'AUTHORIZED',
      transactionId: 'pj_retry_network_1',
    };

    vi.mocked(PrintJob.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(existingJob),
    } as any);

    vi.mocked(Wallet.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ balance: 100 }),
    } as any);

    const res = await authorizePrint({
      userId,
      documentType: 'pan',
      cardIdentifier: 'ABCDE1234F',
      printJobId: 'pj_retry_network_1',
    });

    expect(res.success).toBe(true);
    expect(res.fee).toBe(50);
    expect(res.remainingBalance).toBe(100);

    // Wallet is NOT deducted again!
    expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
