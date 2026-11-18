import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { lookupAndBillVoter } from '@/lib/documents/voterLookup';
import * as orchestrator from '@/lib/verify/orchestrator';
import * as voterOrchestrator from '@/lib/verify/voterOrchestrator';
import * as pricingModule from '@/lib/wallet/pricing';
import * as cacheModule from '@/lib/documents/documentCache';
import { circuitBreaker } from '@/lib/reliability/circuitBreaker';
import Wallet from '@/models/Wallet';
import VerificationRequest from '@/models/VerificationRequest';

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
    create: vi.fn(),
  },
}));

vi.mock('@/models/Wallet', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock('@/models/VerificationRequest', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

describe('Voter Multi-Provider Wallet Billing Integrity & Idempotency', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const testEpic = 'ABC1234567';
  let executeProviderCascadeSpy: any;
  let executeVoterLookupWithCaptchaSpy: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    circuitBreaker.resetAll();

    executeProviderCascadeSpy = vi.spyOn(orchestrator, 'executeProviderCascade');
    executeVoterLookupWithCaptchaSpy = vi.spyOn(voterOrchestrator, 'executeVoterLookupWithCaptcha');

    // Default: no existing cached doc
    vi.spyOn(cacheModule, 'findCachedDocument').mockResolvedValue(null);
    vi.spyOn(cacheModule, 'findExistingDocumentRecord').mockResolvedValue(null);
    vi.spyOn(cacheModule, 'saveDocumentToCache').mockImplementation(async (params: any) => ({
      _id: new mongoose.Types.ObjectId(),
      data: params.data,
      isPaid: true,
      isComplete: true,
      provider: params.provider,
    } as any));

    // Default: pricing enabled, ₹20 fee
    vi.spyOn(pricingModule, 'getConfiguredServicePricing').mockResolvedValue({
      serviceId: 'VOTER',
      displayName: 'Voter Card Processing',
      fee: 20,
      originalFee: 20,
      discountPercent: 0,
      offerActive: false,
      offerBadge: '',
      enabled: true,
      maintenanceMode: false,
      maintenanceNotice: '',
      timeoutMs: 8000,
      providerPriority: ['neoapi', 'webapi_in'],
    });

    // Default: not already paid
    vi.spyOn(pricingModule, 'hasPaidVoterLookupEntitlement').mockResolvedValue(false);

    // Default: Wallet with ₹100 balance
    (Wallet.findOne as any) = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(userId),
        balance: 100,
        transactions: [],
      }),
    });

    (Wallet.findOneAndUpdate as any) = vi.fn().mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(userId),
      balance: 80,
      transactions: [
        {
          _id: new mongoose.Types.ObjectId(),
          type: 'debit',
          amount: 20,
          category: 'VERIFICATION',
          referenceId: `vtr_pay_${userId}_${testEpic}`,
          balanceBefore: 100,
          balanceAfter: 80,
        },
      ],
      save: vi.fn().mockResolvedValue(true),
    });

    (Wallet.updateOne as any) = vi.fn().mockResolvedValue({ acknowledged: true, modifiedCount: 1 });
    (VerificationRequest.findOneAndUpdate as any) = vi.fn().mockResolvedValue({});
    (VerificationRequest.findOne as any) = vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    circuitBreaker.resetAll();
  });

  const sampleVoterData = {
    epicNumber: testEpic,
    electorName: 'SUNIL KUMAR',
    electorNameRegional: 'सुनील कुमार',
    relationName: 'RAMESH KUMAR',
    assemblyConstituency: '123 - LUCKNOW',
  };

  it('charges configured fee (₹20) exactly once when primary provider succeeds', async () => {
    executeProviderCascadeSpy.mockResolvedValueOnce({
      success: true,
      documentType: 'voter',
      idNumber: testEpic,
      data: sampleVoterData,
      provider: 'NeoAPI',
      providerVersion: 'v1',
      fallbackUsed: false,
      isPartial: false,
      latencyMs: 150,
    });

    const result = await lookupAndBillVoter({ userId, epicNumber: testEpic });

    expect(result.success).toBe(true);
    expect(result.feeDeducted).toBe(20);
    expect(result.provider).toBe('NeoAPI');
    expect(Wallet.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(cacheModule.saveDocumentToCache).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        docType: 'VOTER',
        documentNumber: testEpic,
        isPaid: true,
      })
    );
  });

  it('charges configured fee exactly once when primary fails and secondary (WebAPI.in) succeeds', async () => {
    executeProviderCascadeSpy.mockResolvedValueOnce({
      success: true,
      documentType: 'voter',
      idNumber: testEpic,
      data: sampleVoterData,
      provider: 'WebAPI.in',
      fallbackUsed: true,
      isPartial: false,
      latencyMs: 320,
    });

    const result = await lookupAndBillVoter({ userId, epicNumber: testEpic });

    expect(result.success).toBe(true);
    expect(result.feeDeducted).toBe(20);
    expect(result.provider).toBe('WebAPI.in');
    // Wallet must be debited exactly once!
    expect(Wallet.findOneAndUpdate).toHaveBeenCalledTimes(1);
  });

  it('deducts ₹0 and saves NO record when all providers fail', async () => {
    executeProviderCascadeSpy.mockResolvedValueOnce({
      success: false,
      documentType: 'voter',
      idNumber: testEpic,
      data: {},
      provider: 'WebAPI.in',
      isPartial: false,
      errorCode: 'LOOKUP_FAILED',
      errorMessage: 'All providers failed',
      latencyMs: 500,
    });

    const result = await lookupAndBillVoter({ userId, epicNumber: testEpic });

    expect(result.success).toBe(false);
    expect(result.feeDeducted).toBe(0);
    expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
    expect(cacheModule.saveDocumentToCache).not.toHaveBeenCalled();
  });

  it('deducts ₹0 and skips external API call on 72h MongoDB cache hit', async () => {
    vi.spyOn(cacheModule, 'findCachedDocument').mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      data: sampleVoterData,
      provider: 'NeoAPI',
      isComplete: true,
      expiresAt: new Date(Date.now() + 100000),
      fetchedAt: new Date(),
    } as any);

    const result = await lookupAndBillVoter({ userId, epicNumber: testEpic });

    expect(result.success).toBe(true);
    expect(result.feeDeducted).toBe(0);
    expect(result.isFreeReprint).toBe(true);
    expect(executeProviderCascadeSpy).not.toHaveBeenCalled();
    expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('deducts ₹0 when citizen document already has paid entitlement (re-verify or print)', async () => {
    vi.spyOn(pricingModule, 'hasPaidVoterLookupEntitlement').mockResolvedValueOnce(true);

    executeProviderCascadeSpy.mockResolvedValueOnce({
      success: true,
      documentType: 'voter',
      idNumber: testEpic,
      data: sampleVoterData,
      provider: 'WebAPI.in',
      isPartial: false,
      latencyMs: 120,
    });

    const result = await lookupAndBillVoter({ userId, epicNumber: testEpic });

    expect(result.success).toBe(true);
    expect(result.feeDeducted).toBe(0);
    expect(result.isFreeReprint).toBe(true);
    // Already paid -> no second deduction
    expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('rejects with INSUFFICIENT_BALANCE before saving or debiting when wallet balance is low', async () => {
    (Wallet.findOne as any) = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(userId),
        balance: 5, // Fee is 20
        transactions: [],
      }),
    });

    executeProviderCascadeSpy.mockResolvedValueOnce({
      success: true,
      documentType: 'voter',
      idNumber: testEpic,
      data: sampleVoterData,
      provider: 'NeoAPI',
      isPartial: false,
      latencyMs: 100,
    });

    const result = await lookupAndBillVoter({ userId, epicNumber: testEpic });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('INSUFFICIENT_BALANCE');
    expect(result.feeDeducted).toBe(0);
    expect(result.requiredFee).toBe(20);
    expect(result.currentBalance).toBe(5);
    expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
    expect(cacheModule.saveDocumentToCache).not.toHaveBeenCalled();
  });

  it('bills captcha-based lookup correctly on success', async () => {
    executeVoterLookupWithCaptchaSpy.mockResolvedValueOnce({
      success: true,
      documentType: 'voter',
      idNumber: testEpic,
      data: sampleVoterData,
      provider: 'WebAPI.in',
      isPartial: false,
      latencyMs: 210,
    });

    const result = await lookupAndBillVoter({
      userId,
      epicNumber: testEpic,
      captchaId: 'CAPTCHA_123',
      captchaAnswer: 'XYZABC',
      stateCd: 'S24',
    });

    expect(result.success).toBe(true);
    expect(result.feeDeducted).toBe(20);
    expect(result.provider).toBe('WebAPI.in');
    expect(executeVoterLookupWithCaptchaSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        epicNumber: testEpic,
        captchaId: 'CAPTCHA_123',
        captchaAnswer: 'XYZABC',
        stateCd: 'S24',
      })
    );
    expect(Wallet.findOneAndUpdate).toHaveBeenCalledTimes(1);
  });
});
