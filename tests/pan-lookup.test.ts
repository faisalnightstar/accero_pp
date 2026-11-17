import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import * as auth from '@/lib/auth';
import { verifyDocument } from '@/actions/verify';
import {
  validatePanNumber,
  normalizePanNumber,
  validateProviderResponse,
} from '@/lib/pan/pan.validation';
import {
  normalizePanDate,
  normalizeAadhaarAvailable,
  normalizeWebApiV1Response,
  normalizeWebApiV2Response,
  normalizePanResponse,
} from '@/lib/pan/pan.normalizer';
import {
  fetchPanFromWebAPI,
  executePanLookupStrategy,
  lookupAndBillPan,
  clearInFlightPanLookupsForTesting,
  getPanLookupApiToken,
} from '@/lib/pan/pan.service';
import Wallet from '@/models/Wallet';
import VerificationRequest from '@/models/VerificationRequest';
import DocumentRecord from '@/models/DocumentRecord';
import PanLookupRecord from '@/models/PanLookupRecord';
import ServiceConfig from '@/models/ServiceConfig';
import * as providerClient from '@/lib/network/provider-client';

// Mock auth
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

// Mock MongoDB connection
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue({}),
  connectToDatabase: vi.fn().mockResolvedValue({}),
}));

// Mock audit logger
vi.mock('@/lib/logger/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

// Mock Rate Limiter to avoid Upstash network calls and timeout
vi.mock('@/lib/security/rateLimiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 15,
    resetSeconds: 60,
    retryAfterSeconds: 0,
  }),
}));

// Mock Mongoose models
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

vi.mock('@/models/DocumentRecord', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/models/PanLookupRecord', () => ({
  default: {
    find: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/models/ServiceConfig', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

function makeMongooseQuery(val: any) {
  return {
    then: (resolve: any, reject?: any) => Promise.resolve(val).then(resolve, reject),
    lean: () => Promise.resolve(val),
  };
}

describe('PAN Verification & Lookup System', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    clearInFlightPanLookupsForTesting();
    process.env = { ...originalEnv };
    process.env.PAN_LOOKUP_API_TOKEN = 'test_token_secret_123';
    (DocumentRecord.findOne as any).mockReturnValue(makeMongooseQuery(null));
    (ServiceConfig.findOne as any).mockReturnValue(
      makeMongooseQuery({
        serviceId: 'PAN',
        fee: 20,
        originalFee: 50,
        discountPercent: 60,
        offerActive: true,
        enabled: true,
        maintenanceMode: false,
      })
    );
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // =========================================================================
  // 1. INPUT VALIDATION & NORMALIZATION
  // =========================================================================
  describe('PAN Input Validation & Normalization', () => {
    it('normalizes PAN input: trims whitespace and converts to uppercase', () => {
      expect(normalizePanNumber('  mjppk9654q  ')).toBe('MJPPK9654Q');
      expect(normalizePanNumber('qjLpK9500h')).toBe('QJLPK9500H');
    });

    it('accepts valid 10-character PAN formats (5 uppercase letters, 4 digits, 1 uppercase letter)', () => {
      expect(validatePanNumber('MJPPK9654Q').valid).toBe(true);
      expect(validatePanNumber('QJLPK9500H').valid).toBe(true);
      expect(validatePanNumber('ABCDE1234F').valid).toBe(true);
    });

    it('rejects empty, short, or overly long PAN numbers', () => {
      const emptyRes = validatePanNumber('');
      expect(emptyRes.valid).toBe(false);
      expect(emptyRes.errorCode).toBe('INVALID_PAN');

      const shortRes = validatePanNumber('ABC12');
      expect(shortRes.valid).toBe(false);

      const longRes = validatePanNumber('MJPPK9654Q123');
      expect(longRes.valid).toBe(false);
    });

    it('rejects numbers with digits or symbols in letter positions', () => {
      // First 5 must be letters
      expect(validatePanNumber('123456789A').valid).toBe(false);
      expect(validatePanNumber('MJ1PK9654Q').valid).toBe(false);

      // Characters 6-9 must be digits
      expect(validatePanNumber('MJPPKABCDQ').valid).toBe(false);

      // 10th character must be a letter
      expect(validatePanNumber('MJPPK96541').valid).toBe(false);

      // Special characters rejected
      expect(validatePanNumber('MJPPK9654!').valid).toBe(false);
    });

    it('resolves API token from PAN_LOOKUP_API_TOKEN or fallback WEBAPI_TOKEN', () => {
      // 1. Primary PAN_LOOKUP_API_TOKEN
      delete process.env.WEBAPI_TOKEN;
      process.env.PAN_LOOKUP_API_TOKEN = 'token_primary';
      expect(getPanLookupApiToken()).toBe('token_primary');

      // 2. Fallback WEBAPI_TOKEN
      delete process.env.PAN_LOOKUP_API_TOKEN;
      process.env.WEBAPI_TOKEN = 'token_fallback';
      expect(getPanLookupApiToken()).toBe('token_fallback');

      // 3. Neither configured throws
      delete process.env.PAN_LOOKUP_API_TOKEN;
      delete process.env.WEBAPI_TOKEN;
      expect(() => getPanLookupApiToken()).toThrow();
    });
  });

  // =========================================================================
  // 2. RESPONSE VALIDATION (Success vs Failure Detection)
  // =========================================================================
  describe('Provider Response Validation (validateProviderResponse)', () => {
    it('validates a successful V1 JSON response with status 100 and matching PAN', () => {
      const v1Sample = {
        status: '100',
        message: 'PAN Validate Successfully',
        pan: 'MJPPK9654Q',
        fullname: 'DEEPAK KUMAR',
        fathername: 'SURENDRA RAM',
        dob: '2004-08-07',
        gender: 'Male',
        aadhaar_no: false,
      };

      const res = validateProviderResponse(v1Sample, 'MJPPK9654Q');
      expect(res.valid).toBe(true);
      expect(res.raw?.status).toBe('100');
    });

    it('validates a successful V2 JSON response with status 100 and matching PAN', () => {
      const v2Sample = {
        status: '100',
        message: 'PAN Validate Successfully',
        pan: 'QJLPK9500H',
        fullname: 'SHIV',
        fathername: 'JAGAT',
        dob: '20-08-1900',
      };

      const res = validateProviderResponse(v2Sample, 'QJLPK9500H');
      expect(res.valid).toBe(true);
      expect(res.raw?.status).toBe('100');
    });

    it('rejects provider response when status is not 100 (e.g. status "0" or "NOT_FOUND")', () => {
      const failedResponse = {
        status: '0',
        message: 'Invalid PAN Number or Record Not Found',
      };

      const res = validateProviderResponse(failedResponse, 'MJPPK9654Q');
      expect(res.valid).toBe(false);
      expect(res.errorCode).toBe('NOT_FOUND');
    });

    it('rejects provider response when returned PAN does not match requested PAN', () => {
      const mismatchedResponse = {
        status: '100',
        message: 'PAN Validate Successfully',
        pan: 'OTHER1234X',
        fullname: 'Mismatched User',
      };

      const res = validateProviderResponse(mismatchedResponse, 'MJPPK9654Q');
      expect(res.valid).toBe(false);
      expect(res.errorCode).toBe('PAN_MISMATCH');
    });

    it('detects invalid API token / provider authentication failure', () => {
      const tokenErrorResponse = {
        status: '0',
        message: 'Invalid Token or Token Expired',
      };

      const res = validateProviderResponse(tokenErrorResponse, 'MJPPK9654Q');
      expect(res.valid).toBe(false);
      expect(res.errorCode).toBe('AUTH_ERROR');
    });

    it('rejects non-object or malformed responses', () => {
      expect(validateProviderResponse(null, 'MJPPK9654Q').valid).toBe(false);
      expect(validateProviderResponse('string response', 'MJPPK9654Q').valid).toBe(false);
    });
  });

  // =========================================================================
  // 3. RESPONSE NORMALIZATION & DATE PARSING
  // =========================================================================
  describe('Response Normalization (API V1 & V2 Models)', () => {
    it('normalizes API V1 structure: converts YYYY-MM-DD to DD-MM-YYYY, extracts gender and aadhaar_no', () => {
      const v1Sample = {
        status: '100',
        message: 'PAN Validate Successfully',
        pan: 'MJPPK9654Q',
        fullname: 'DEEPAK KUMAR',
        fathername: 'SURENDRA RAM',
        dob: '2004-08-07',
        gender: 'Male',
        aadhaar_no: false,
      };

      const normalized = normalizeWebApiV1Response(v1Sample, 'MJPPK9654Q');
      expect(normalized.pan).toBe('MJPPK9654Q');
      expect(normalized.fullName).toBe('DEEPAK KUMAR');
      expect(normalized.fatherName).toBe('SURENDRA RAM');
      // YYYY-MM-DD (2004-08-07) converted to DD-MM-YYYY (07-08-2004)
      expect(normalized.dateOfBirth).toBe('07-08-2004');
      expect(normalized.gender).toBe('Male');
      expect(normalized.aadhaarNumberAvailable).toBe(false);
      expect(normalized.providerVersion).toBe('v1');
      expect(normalized.status).toBe('SUCCESS');
    });

    it('normalizes API V2 structure: preserves DD-MM-YYYY, returns null for missing gender and aadhaar', () => {
      const v2Sample = {
        status: '100',
        message: 'PAN Validate Successfully',
        pan: 'QJLPK9500H',
        fullname: 'SHIV',
        fathername: 'JAGAT',
        dob: '20-08-1900',
      };

      const normalized = normalizeWebApiV2Response(v2Sample, 'QJLPK9500H');
      expect(normalized.pan).toBe('QJLPK9500H');
      expect(normalized.fullName).toBe('SHIV');
      expect(normalized.fatherName).toBe('JAGAT');
      // Historical date 20-08-1900 preserved exactly
      expect(normalized.dateOfBirth).toBe('20-08-1900');
      // V2 does NOT return gender or aadhaar_no; must be null, never fabricated
      expect(normalized.gender).toBeNull();
      expect(normalized.aadhaarNumberAvailable).toBeNull();
      expect(normalized.providerVersion).toBe('v2');
      expect(normalized.status).toBe('SUCCESS');
    });

    it('handles date normalization for various formats without crashing', () => {
      // YYYY-MM-DD
      expect(normalizePanDate('1995-12-25')).toBe('25-12-1995');
      // DD-MM-YYYY
      expect(normalizePanDate('15-08-1947')).toBe('15-08-1947');
      // DD/MM/YYYY
      expect(normalizePanDate('01/01/2000')).toBe('01-01-2000');
      // Preserves historical date 20-08-1900
      expect(normalizePanDate('20-08-1900')).toBe('20-08-1900');
      // Null / empty
      expect(normalizePanDate(null)).toBeNull();
      expect(normalizePanDate('')).toBeNull();
    });

    it('normalizes aadhaar_no boolean flag accurately', () => {
      expect(normalizeAadhaarAvailable(false)).toBe(false);
      expect(normalizeAadhaarAvailable(true)).toBe(true);
      expect(normalizeAadhaarAvailable('false')).toBe(false);
      expect(normalizeAadhaarAvailable('true')).toBe(true);
      expect(normalizeAadhaarAvailable('1')).toBe(true);
      expect(normalizeAadhaarAvailable('0')).toBe(false);
      expect(normalizeAadhaarAvailable(undefined)).toBeNull();
      expect(normalizeAadhaarAvailable(null)).toBeNull();
    });
  });

  // =========================================================================
  // 4. STRATEGY EXECUTION & AUTOMATIC FALLBACK
  // =========================================================================
  describe('Strategy Execution & Automatic Failover (V1 -> V2)', () => {
    it('executes V1 primary strategy when requested', async () => {
      const mockV1Response = {
        status: '100',
        message: 'PAN Validate Successfully',
        pan: 'MJPPK9654Q',
        fullname: 'DEEPAK KUMAR',
        fathername: 'SURENDRA RAM',
        dob: '2004-08-07',
        gender: 'Male',
        aadhaar_no: false,
      };

      vi.spyOn(providerClient, 'providerFetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockV1Response), { status: 200 })
      );

      const res = await executePanLookupStrategy('MJPPK9654Q', 'v1');
      expect(res.success).toBe(true);
      expect(res.version).toBe('v1');
      expect(res.fallbackUsed).toBe(false);
      expect((res.raw as any)?.fullname).toBe('DEEPAK KUMAR');
    });

    it('executes V2 direct strategy when requested', async () => {
      const mockV2Response = {
        status: '100',
        message: 'PAN Validate Successfully',
        pan: 'QJLPK9500H',
        fullname: 'SHIV',
        fathername: 'JAGAT',
        dob: '20-08-1900',
      };

      vi.spyOn(providerClient, 'providerFetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockV2Response), { status: 200 })
      );

      const res = await executePanLookupStrategy('QJLPK9500H', 'v2');
      expect(res.success).toBe(true);
      expect(res.version).toBe('v2');
      expect(res.fallbackUsed).toBe(false);
      expect((res.raw as any)?.fullname).toBe('SHIV');
    });

    it('falls back automatically from V1 to V2 when V1 fails in fallback strategy', async () => {
      // V1 returns failure / not found
      const mockV1Failure = {
        status: '0',
        message: 'Record Not Found in V1',
      };

      // V2 returns success
      const mockV2Success = {
        status: '100',
        message: 'PAN Validate Successfully',
        pan: 'QJLPK9500H',
        fullname: 'SHIV',
        fathername: 'JAGAT',
        dob: '20-08-1900',
      };

      const fetchSpy = vi.spyOn(providerClient, 'providerFetch');
      fetchSpy
        .mockResolvedValueOnce(new Response(JSON.stringify(mockV1Failure), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(mockV2Success), { status: 200 }));

      const res = await executePanLookupStrategy('QJLPK9500H', 'fallback');
      expect(res.success).toBe(true);
      expect(res.version).toBe('v2');
      expect(res.fallbackUsed).toBe(true);
      expect((res.raw as any)?.fullname).toBe('SHIV');
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('returns failure when both V1 and V2 fail in fallback strategy without crashing', async () => {
      const mockV1Failure = { status: '0', message: 'V1 Error' };
      const mockV2Failure = { status: '0', message: 'V2 Error' };

      const fetchSpy = vi.spyOn(providerClient, 'providerFetch');
      fetchSpy
        .mockResolvedValueOnce(new Response(JSON.stringify(mockV1Failure), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(mockV2Failure), { status: 200 }));

      const res = await executePanLookupStrategy('ABCDE1234F', 'fallback');
      expect(res.success).toBe(false);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('handles provider timeout gracefully', async () => {
      vi.spyOn(providerClient, 'providerFetch').mockRejectedValueOnce(
        new Error('Request timeout after 15000ms')
      );

      const res = await fetchPanFromWebAPI('MJPPK9654Q', 'v1');
      expect(res.success).toBe(false);
      expect(res.errorCode).toBe('TIMEOUT');
    });
  });

  // =========================================================================
  // 5. WALLET INTEGRATION & ATOMICITY
  // =========================================================================
  describe('Wallet Integration, Idempotency & Zero-Charge on Failure', () => {
    const syntheticUserId = new mongoose.Types.ObjectId().toString();

    it('rejects lookup before provider call if wallet balance is insufficient', async () => {
      // Mock wallet with low balance (₹10 vs ₹20 required)
      (Wallet.findOne as any).mockReturnValue(
        makeMongooseQuery({
          userId: syntheticUserId,
          balance: 10,
        })
      );

      (DocumentRecord.findOne as any).mockReturnValue(makeMongooseQuery(null));

      const providerFetchSpy = vi.spyOn(providerClient, 'providerFetch');

      const result = await lookupAndBillPan({
        userId: syntheticUserId,
        panNumber: 'MJPPK9654Q',
      });

      expect(result.status).toBe('FAILED');
      expect(result.errorCode).toBe('INSUFFICIENT_BALANCE');
      expect(result.feeDeducted).toBe(0);
      // Provider must NEVER be called if balance check fails
      expect(providerFetchSpy).not.toHaveBeenCalled();
    });

    it('deducts configured fee exactly once on successful external lookup and saves cache', async () => {
      // Mock wallet with sufficient balance
      (Wallet.findOne as any).mockReturnValue(
        makeMongooseQuery({
          userId: syntheticUserId,
          balance: 100,
        })
      );

      (DocumentRecord.findOne as any).mockReturnValue(makeMongooseQuery(null));

      (Wallet.findOneAndUpdate as any).mockResolvedValue({
        userId: syntheticUserId,
        balance: 80,
      });

      (DocumentRecord.findOneAndUpdate as any).mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
      });

      const mockV1Response = {
        status: '100',
        message: 'PAN Validate Successfully',
        pan: 'MJPPK9654Q',
        fullname: 'DEEPAK KUMAR',
        fathername: 'SURENDRA RAM',
        dob: '2004-08-07',
        gender: 'Male',
        aadhaar_no: false,
      };

      vi.spyOn(providerClient, 'providerFetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockV1Response), { status: 200 })
      );

      const result = await lookupAndBillPan({
        userId: syntheticUserId,
        panNumber: 'MJPPK9654Q',
      });

      expect(result.status).toBe('SUCCESS');
      expect(result.fullName).toBe('DEEPAK KUMAR');
      expect(result.feeDeducted).toBe(20);
      expect(result.currentBalance).toBe(80);

      // Verify wallet deduction call
      expect(Wallet.findOneAndUpdate).toHaveBeenCalledTimes(1);
      const updateArgs = (Wallet.findOneAndUpdate as any).mock.calls[0];
      expect(updateArgs[0].balance).toEqual({ $gte: 20 });
      expect(updateArgs[1].$inc.balance).toBe(-20);
    });

    it('does NOT charge wallet when provider returns failure or record not found', async () => {
      (Wallet.findOne as any).mockReturnValue(
        makeMongooseQuery({
          userId: syntheticUserId,
          balance: 100,
        })
      );

      (DocumentRecord.findOne as any).mockReturnValue(makeMongooseQuery(null));

      const mockV1NotFound = {
        status: '0',
        message: 'No record found for PAN',
      };
      const mockV2NotFound = {
        status: '0',
        message: 'No record found in V2',
      };

      vi.spyOn(providerClient, 'providerFetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(mockV1NotFound), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(mockV2NotFound), { status: 200 }));

      const result = await lookupAndBillPan({
        userId: syntheticUserId,
        panNumber: 'ABCDE1234F',
      });

      expect(result.status).toBe('FAILED');
      expect(result.feeDeducted).toBe(0);
      // Wallet update must NOT be called on failure
      expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('charges only once during V1 to V2 fallback (no duplicate charges)', async () => {
      (Wallet.findOne as any).mockReturnValue(
        makeMongooseQuery({
          userId: syntheticUserId,
          balance: 100,
        })
      );

      (DocumentRecord.findOne as any).mockReturnValue(makeMongooseQuery(null));

      (Wallet.findOneAndUpdate as any).mockResolvedValue({
        userId: syntheticUserId,
        balance: 80,
      });

      (DocumentRecord.findOneAndUpdate as any).mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
      });

      // V1 fails, V2 succeeds
      const mockV1Fail = { status: '0', message: 'Fail' };
      const mockV2Success = {
        status: '100',
        message: 'PAN Validate Successfully',
        pan: 'QJLPK9500H',
        fullname: 'SHIV',
        fathername: 'JAGAT',
        dob: '20-08-1900',
      };

      vi.spyOn(providerClient, 'providerFetch')
        .mockResolvedValueOnce(new Response(JSON.stringify(mockV1Fail), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(mockV2Success), { status: 200 }));

      const result = await lookupAndBillPan({
        userId: syntheticUserId,
        panNumber: 'QJLPK9500H',
      });

      expect(result.status).toBe('SUCCESS');
      expect(result.providerVersion).toBe('v2');
      expect(result.fallbackUsed).toBe(true);
      expect(result.feeDeducted).toBe(20);
      // EXACTLY ONE wallet deduction call despite fallback!
      expect(Wallet.findOneAndUpdate).toHaveBeenCalledTimes(1);
    });

    it('returns free reprint (₹0 deduction) when valid 72h MongoDB cache exists', async () => {
      (Wallet.findOne as any).mockReturnValue(
        makeMongooseQuery({
          userId: syntheticUserId,
          balance: 100,
        })
      );

      // Valid cached record in MongoDB
      (DocumentRecord.findOne as any).mockReturnValue(
        makeMongooseQuery({
          _id: new mongoose.Types.ObjectId(),
          userId: syntheticUserId,
          docType: 'PAN',
          documentNumber: 'MJPPK9654Q',
          data: {
            panNumber: 'MJPPK9654Q',
            fullName: 'DEEPAK KUMAR',
            fatherName: 'SURENDRA RAM',
            dateOfBirth: '07-08-2004',
            gender: 'Male',
            aadhaarNumberAvailable: false,
          },
          provider: 'WebAPI (V1)',
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000), // Valid for 24h more
          createdAt: new Date(),
        })
      );

      const providerFetchSpy = vi.spyOn(providerClient, 'providerFetch');

      const result = await lookupAndBillPan({
        userId: syntheticUserId,
        panNumber: 'MJPPK9654Q',
      });

      expect(result.status).toBe('SUCCESS');
      expect(result.fullName).toBe('DEEPAK KUMAR');
      expect(result.feeDeducted).toBe(0);
      expect(result.isFreeReprint).toBe(true);
      // Provider not called on cache hit
      expect(providerFetchSpy).not.toHaveBeenCalled();
      // No wallet charge on cache hit
      expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 6. SERVER ACTION INTEGRATION (verifyDocument)
  // =========================================================================
  describe('Server Action Integration (verifyDocument)', () => {
    it('rejects unauthenticated user session', async () => {
      (auth.getSession as any).mockResolvedValue(null);

      const result = await verifyDocument('pan', 'MJPPK9654Q');
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('sign in');
    });

    it('rejects invalid PAN format through Server Action', async () => {
      (auth.getSession as any).mockResolvedValue({ userId: 'user_123' });

      const result = await verifyDocument('pan', 'INVALID12');
      expect(result.success).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });

    it('returns successful VerificationResult with PanCardData mapping', async () => {
      const syntheticUserId = new mongoose.Types.ObjectId().toString();
      (auth.getSession as any).mockResolvedValue({ userId: syntheticUserId });

      (Wallet.findOne as any).mockReturnValue(
        makeMongooseQuery({
          userId: syntheticUserId,
          balance: 100,
        })
      );

      (DocumentRecord.findOne as any).mockReturnValue(makeMongooseQuery(null));

      (Wallet.findOneAndUpdate as any).mockResolvedValue({
        userId: syntheticUserId,
        balance: 80,
      });

      (DocumentRecord.findOneAndUpdate as any).mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
      });

      const mockV1Response = {
        status: '100',
        message: 'PAN Validate Successfully',
        pan: 'MJPPK9654Q',
        fullname: 'DEEPAK KUMAR',
        fathername: 'SURENDRA RAM',
        dob: '2004-08-07',
        gender: 'Male',
        aadhaar_no: false,
      };

      vi.spyOn(providerClient, 'providerFetch').mockResolvedValueOnce(
        new Response(JSON.stringify(mockV1Response), { status: 200 })
      );

      const res = await verifyDocument('pan', 'MJPPK9654Q');
      expect(res.success).toBe(true);
      expect(res.documentType).toBe('pan');
      expect(res.idNumber).toBe('MJPPK9654Q');
      expect(res.data.fullName).toBe('DEEPAK KUMAR');
      expect(res.data.fatherName).toBe('SURENDRA RAM');
      expect(res.data.dateOfBirth).toBe('07-08-2004');
      expect(res.data.gender).toBe('MALE');
      expect(res.data.qrData).toBeDefined();
      expect(res.feeDeducted).toBe(20);
    });
  });
});
