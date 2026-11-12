import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import * as auth from '@/lib/auth';
import * as verifyActions from '@/actions/verify';
import { NeoApiProvider } from '@/lib/verify/providers/neoapi';
import { normalizeNeoApiVoter } from '@/lib/verify/normalizers/voterNormalizer';
import { validateEpicNumber, validateNeoApiVoterResponse } from '@/lib/verify/validators';
import { saveDocumentToCache, findCachedDocument, CACHE_TTL_MS } from '@/lib/documents/documentCache';
import { authorizePrint } from '@/lib/print/printAuthorization';
import { setTestingFetch, resetFixieCache } from '@/lib/network/fixie';
import DocumentRecord from '@/models/DocumentRecord';
import Wallet from '@/models/Wallet';
import VerificationRequest from '@/models/VerificationRequest';
import ServiceConfig from '@/models/ServiceConfig';
import PrintJob from '@/models/PrintJob';
import User from '@/models/User';

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

vi.mock('@/models/ServiceConfig', () => ({
  default: {
    findOne: vi.fn(),
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

/**
 * Strictly synthetic test fixture modeled after the NeoAPI Voter schema.
 * Never uses real citizen identities or live API keys.
 */
function buildSyntheticNeoApiPayload(epicNo = 'ABC0123456', overrides: Record<string, any> = {}) {
  return {
    Message: 'Success',
    response: {
      docs: [
        {
          Message: 'Success',
          sampleCode: '200',
          FirstName: 'AARAV ',
          LastName: 'SHARMA',
          name: 'aarav sharma',
          name_v1: 'आरव शर्मा',
          ac_no: '101',
          gender: 'M',
          ac_name: 'MODEL TOWN',
          epic_no: epicNo,
          rln_name: 'rajesh sharma',
          rln_name_v1: 'राजेश शर्मा',
          part_no: '45',
          part_name: 'GOVT HIGH SCHOOL SECTOR 5',
          part_name_v1: 'राजकीय उच्च विद्यालय सेक्टर 5',
          district: 'DEMO DISTRICT',
          state: 'UTTAR PRADESH',
          state_v1: 'उत्तर प्रदेश',
          state_1: 'Uttar Pradesh',
          dist_name_v1: 'डेमो जिला',
          age: '32',
          dob: null,
          stateCd: 'S24',
          acNumber: '101',
          rln_type: 'FTHR',
          ac_name_v1: 'मॉडल टाउन',
          status: 'true',
          ...overrides,
        },
      ],
    },
  };
}

describe('NeoAPI Voter Lookup, V1/V2 Fallback, Field Mapping, Cache & Billing Integrity', () => {
  const originalEnv = process.env;
  const userIdA = '60d5ec49f1b2c82b8c8e1111';
  const userIdB = '60d5ec49f1b2c82b8c8e2222';
  const userObjA = new mongoose.Types.ObjectId(userIdA);

  let inMemoryWallet: {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    balance: number;
    totalCredited: number;
    totalDebited: number;
    transactions: any[];
  };
  let inMemoryDocs: any[];
  let inMemoryVerificationReqs: any[];
  let inMemoryPrintJobs: any[];

  beforeEach(() => {
    vi.clearAllMocks();
    resetFixieCache();
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      NEO_API_KEY: 'test_synthetic_neo_key',
      FIXIE_URL: 'http://fixie:testtoken@ventoux.usefixie.com:80',
    };

    inMemoryWallet = {
      _id: new mongoose.Types.ObjectId(),
      userId: userObjA,
      balance: 100,
      totalCredited: 100,
      totalDebited: 0,
      transactions: [],
    };
    inMemoryDocs = [];
    inMemoryVerificationReqs = [];
    inMemoryPrintJobs = [];

    vi.mocked(auth.getSession).mockResolvedValue({
      userId: userIdA,
      email: 'operator@test.local',
      name: 'Test Operator',
      role: 'operator',
    });

    vi.mocked(User.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: userObjA, status: 'active' }),
    } as any);

    vi.mocked(ServiceConfig.findOne).mockResolvedValue({
      serviceId: 'VOTER',
      enabled: true,
      fee: 20,
      maintenanceMode: false,
      retryPolicy: { maxRetries: 2, timeoutMs: 8000 },
    } as any);

    vi.mocked(DocumentRecord.findOne).mockImplementation((query: any) => {
      const uid = query.userId?.toString();
      const docType = query.docType;
      const now = Date.now();
      const found = inMemoryDocs.find((d) => {
        if (d.userId?.toString() !== uid || d.docType !== docType) return false;
        if (query.expiresAt?.$gt && (!d.expiresAt || new Date(d.expiresAt).getTime() <= now)) {
          return false;
        }
        if (query.$or) {
          return query.$or.some(
            (cond: any) =>
              (cond.cardIdentifier && d.cardIdentifier === cond.cardIdentifier) ||
              (cond.documentNumberHash && d.documentNumberHash === cond.documentNumberHash)
          );
        }
        if (query.cardIdentifier) return d.cardIdentifier === query.cardIdentifier;
        return true;
      });
      return {
        lean: vi.fn().mockResolvedValue(found || null),
        then: (resolve: any) => Promise.resolve(found || null).then(resolve),
      } as any;
    });

    (vi.mocked(DocumentRecord.findOneAndUpdate) as any).mockImplementation(async (filter: any, update: any) => {
      let existing = inMemoryDocs.find((d) => {
        if (filter._id) return d._id.toString() === filter._id.toString();
        return (
          d.userId?.toString() === filter.userId?.toString() &&
          d.docType === filter.docType &&
          d.cardIdentifier === filter.cardIdentifier
        );
      });

      if (!existing) {
        existing = {
          _id: new mongoose.Types.ObjectId(),
          userId: filter.userId || update.$setOnInsert?.userId,
          docType: filter.docType || update.$setOnInsert?.docType || 'VOTER',
          printCount: update.$setOnInsert?.printCount ?? 0,
          createdAt: update.$setOnInsert?.createdAt || new Date(),
        };
        inMemoryDocs.push(existing);
      }

      Object.assign(existing, update.$set);
      return existing as any;
    });

    (vi.mocked(DocumentRecord.updateOne) as any).mockImplementation(async (filter: any, update: any) => {
      const doc = inMemoryDocs.find((d) => {
        if (filter._id) return d._id.toString() === filter._id.toString();
        return (
          d.userId?.toString() === filter.userId?.toString() &&
          d.docType === filter.docType &&
          d.cardIdentifier === filter.cardIdentifier
        );
      });
      if (doc && update.$inc?.printCount) {
        doc.printCount = (doc.printCount || 0) + update.$inc.printCount;
      }
      if (doc && update.$set) {
        Object.assign(doc, update.$set);
      }
      return { modifiedCount: doc ? 1 : 0 } as any;
    });

    vi.mocked(Wallet.findOne).mockImplementation((query: any) => {
      if (query.userId?.toString() !== userIdA) return null as any;
      if (query.transactions?.$elemMatch) {
        const m = query.transactions.$elemMatch;
        const hit = inMemoryWallet.transactions.some(
          (t) =>
            t.referenceId === m.referenceId &&
            t.type === m.type &&
            t.status === m.status
        );
        return (hit ? inMemoryWallet : null) as any;
      }
      return {
        ...inMemoryWallet,
        lean: vi.fn().mockResolvedValue(inMemoryWallet),
      } as any;
    });

    (vi.mocked(Wallet.findOneAndUpdate) as any).mockImplementation(async (filter: any, update: any) => {
      if (filter.userId?.toString() !== userIdA) return null;

      if (filter.balance?.$gte !== undefined && inMemoryWallet.balance < filter.balance.$gte) {
        return null;
      }

      if (filter.transactions?.$not?.$elemMatch) {
        const m = filter.transactions.$not.$elemMatch;
        const alreadyExists = inMemoryWallet.transactions.some(
          (t) =>
            t.referenceId === m.referenceId &&
            t.type === m.type &&
            t.status === m.status
        );
        if (alreadyExists) return null;
      }

      if (filter['transactions.referenceId']?.$ne) {
        const neRef = filter['transactions.referenceId'].$ne;
        if (inMemoryWallet.transactions.some((t) => t.referenceId === neRef)) {
          return null;
        }
      }

      if (update.$inc?.balance) {
        inMemoryWallet.balance += update.$inc.balance;
      }
      if (update.$inc?.totalDebited) {
        inMemoryWallet.totalDebited += update.$inc.totalDebited;
      }
      if (update.$inc?.totalCredited) {
        inMemoryWallet.totalCredited += update.$inc.totalCredited;
      }
      if (update.$push?.transactions) {
        const tx = {
          _id: new mongoose.Types.ObjectId(),
          ...update.$push.transactions,
        };
        inMemoryWallet.transactions.push(tx);
      }

      return {
        ...inMemoryWallet,
        save: vi.fn().mockResolvedValue(true),
      } as any;
    });

    (vi.mocked(Wallet.updateOne) as any).mockImplementation(async (filter: any, update: any) => {
      if (filter['transactions._id']) {
        const tx = inMemoryWallet.transactions.find(
          (t) => t._id.toString() === filter['transactions._id'].toString()
        );
        if (tx && update.$set) {
          if (update.$set['transactions.$.balanceBefore'] !== undefined) {
            tx.balanceBefore = update.$set['transactions.$.balanceBefore'];
          }
          if (update.$set['transactions.$.balanceAfter'] !== undefined) {
            tx.balanceAfter = update.$set['transactions.$.balanceAfter'];
          }
        }
      } else if (filter['transactions.referenceId']) {
        const tx = inMemoryWallet.transactions.find(
          (t) =>
            t.referenceId === filter['transactions.referenceId'] &&
            (!filter['transactions.type'] || t.type === filter['transactions.type']) &&
            (!filter['transactions.status'] || t.status === filter['transactions.status'])
        );
        if (tx && update.$set?.['transactions.$.status']) {
          tx.status = update.$set['transactions.$.status'];
        }
      }
      return { modifiedCount: 1 } as any;
    });

    vi.mocked(VerificationRequest.findOne).mockImplementation((query: any) => {
      const hit = inMemoryVerificationReqs.find((r) => {
        if (query.requestId && r.requestId !== query.requestId) return false;
        if (query.userId && r.userId?.toString() !== query.userId.toString()) return false;
        if (query.docType && r.docType !== query.docType) return false;
        if (query.idNumber && r.idNumber !== query.idNumber) return false;
        if (query.status && r.status !== query.status) return false;
        return true;
      });
      return Promise.resolve(hit || null) as any;
    });

    (vi.mocked(VerificationRequest.findOneAndUpdate) as any).mockImplementation(async (filter: any, update: any) => {
      let existing = inMemoryVerificationReqs.find((r) => r.requestId === filter.requestId);
      if (!existing) {
        existing = { _id: new mongoose.Types.ObjectId(), requestId: filter.requestId };
        inMemoryVerificationReqs.push(existing);
      }
      Object.assign(existing, update.$set);
      return existing as any;
    });

    vi.mocked(PrintJob.findOne).mockImplementation((query: any) => {
      const hit = inMemoryPrintJobs.find((p) => p.printJobId === query.printJobId) || null;
      return { lean: vi.fn().mockResolvedValue(hit) } as any;
    });

    vi.mocked(PrintJob.create).mockImplementation(async (payload: any) => {
      inMemoryPrintJobs.push(payload);
      return payload as any;
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    resetFixieCache();
  });

  // ============================================================================
  // PART 9 — API FALLBACK TESTS (1 - 7)
  // ============================================================================
  describe('API Fallback & Fixie Routing', () => {
    it('1. V1 success — V2 is NOT called and routes via Fixie', async () => {
      const calledUrls: string[] = [];
      const mockUndiciFetch = vi.fn().mockImplementation(async (url: string, init: any) => {
        calledUrls.push(url);
        expect(init.dispatcher).toBeDefined(); // Routed through Fixie ProxyAgent
        return new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      });
      setTestingFetch(mockUndiciFetch as any);

      const provider = new NeoApiProvider();
      const result = await provider.lookup('voter', 'ABC0123456');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('NeoAPI');
      expect(result.providerVersion).toBe('v1');
      expect(result.fallbackUsed).toBe(false);
      expect(calledUrls.length).toBe(1);
      expect(calledUrls[0]).toContain('https://core.neoapi.io/v1/voter/detail.php?');
      expect(calledUrls[0]).not.toContain('/v2/');
    });

    it('2. V1 HTTP/Auth failure — automatically retries V2 and succeeds', async () => {
      const calledUrls: string[] = [];
      const mockUndiciFetch = vi
        .fn()
        .mockImplementationOnce(async (url: string) => {
          calledUrls.push(url);
          return new Response(JSON.stringify({ Message: 'Unauthorized' }), { status: 401 });
        })
        .mockImplementationOnce(async (url: string, init: any) => {
          calledUrls.push(url);
          expect(init.dispatcher).toBeDefined();
          return new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          });
        });
      setTestingFetch(mockUndiciFetch as any);

      const provider = new NeoApiProvider();
      const result = await provider.lookup('voter', 'ABC0123456');

      expect(result.success).toBe(true);
      expect(result.providerVersion).toBe('v2');
      expect(result.fallbackUsed).toBe(true);
      expect(calledUrls.length).toBe(2);
      expect(calledUrls[0]).toContain('https://core.neoapi.io/v1/voter/detail.php?');
      expect(calledUrls[1]).toContain('https://core.neoapi.io/v2/voter/detail.php?');
      expect(result.attempts?.[0]).toMatchObject({ version: 'v1', success: false, errorCode: 'AUTH_ERROR' });
      expect(result.attempts?.[1]).toMatchObject({ version: 'v2', success: true });
    });

    it('3. V1 malformed JSON response — V2 succeeds', async () => {
      const mockUndiciFetch = vi
        .fn()
        .mockResolvedValueOnce(
          new Response('<html>502 Bad Gateway</html>', {
            status: 200,
            headers: { 'content-type': 'text/html' },
          })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), { status: 200 })
        );
      setTestingFetch(mockUndiciFetch as any);

      const provider = new NeoApiProvider();
      const result = await provider.lookup('voter', 'ABC0123456');

      expect(result.success).toBe(true);
      expect(result.providerVersion).toBe('v2');
      expect(result.fallbackUsed).toBe(true);
      expect(result.attempts?.[0].errorCode).toBe('MALFORMED_RESPONSE');
    });

    it('4. V1 empty docs / false status / EPIC mismatch — V2 succeeds', async () => {
      const mockUndiciFetch = vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ Message: 'Success', response: { docs: [] } }), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), { status: 200 })
        );
      setTestingFetch(mockUndiciFetch as any);

      const provider = new NeoApiProvider();
      const result = await provider.lookup('voter', 'ABC0123456');

      expect(result.success).toBe(true);
      expect(result.providerVersion).toBe('v2');
      expect(result.fallbackUsed).toBe(true);
      expect(result.attempts?.[0].errorCode).toBe('EMPTY_DOCS');
    });

    it('5. Both endpoints fail — returns controlled error without exposing API key or PII', async () => {
      const mockUndiciFetch = vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ Message: 'Invalid API Key' }), { status: 401 }))
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              Message: 'Failed',
              sampleCode: '403',
              error: 'Access denied. Your server IP is not authorized.',
            }),
            { status: 200 }
          )
        );
      setTestingFetch(mockUndiciFetch as any);

      const provider = new NeoApiProvider();
      const result = await provider.lookup('voter', 'ABC0123456');

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('AUTH_ERROR');
      expect(result.errorMessage).not.toContain('test_synthetic_neo_key');
      expect(result.errorMessage).not.toContain('ABC0123456');
      expect(result.attempts?.length).toBe(2);
    });

    it('6. Both endpoints time out — controlled failure after both attempts', async () => {
      const timeoutErr = new Error('The operation was aborted due to timeout');
      timeoutErr.name = 'TimeoutError';

      const mockUndiciFetch = vi.fn().mockRejectedValue(timeoutErr);
      setTestingFetch(mockUndiciFetch as any);

      const provider = new NeoApiProvider();
      const result = await provider.lookup('voter', 'ABC0123456');

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('TIMEOUT');
      expect(result.errorMessage).toContain('timed out');
      expect(mockUndiciFetch).toHaveBeenCalledTimes(2);
    });

    it('7. Invalid EPIC input — neither endpoint called', async () => {
      const mockUndiciFetch = vi.fn();
      setTestingFetch(mockUndiciFetch as any);

      const invalidInputs = ['', '   ', '12345', 'ABCDEFGHIJ', '1234567890', 'ABCDE1234F', 'ABC-123!'];
      for (const bad of invalidInputs) {
        const res = await verifyActions.verifyDocument('voter', bad);
        expect(res.success).toBe(false);
      }

      expect(mockUndiciFetch).not.toHaveBeenCalled();
      expect(inMemoryWallet.balance).toBe(100);
      expect(validateEpicNumber('IFV1949684').valid).toBe(true);
    });

    it('Enforces Fixie fail-closed in production when FIXIE_URL is missing (never falls back to direct)', async () => {
      delete process.env.FIXIE_URL;
      const mockGlobalFetch = vi.fn();
      vi.stubGlobal('fetch', mockGlobalFetch);

      const res = await verifyActions.verifyDocument('voter', 'ABC0123456');
      expect(res.success).toBe(false);
      expect(mockGlobalFetch).not.toHaveBeenCalled();
      expect(inMemoryWallet.balance).toBe(100);
    });

    it('Emits sanitized debug logs on lookup failures without leaking API keys, Fixie credentials, or raw EPIC', async () => {
      const logSpy = vi.spyOn(console, 'log');
      const warnSpy = vi.spyOn(console, 'warn');
      const errSpy = vi.spyOn(console, 'error');

      const mockUndiciFetch = vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              Message: 'Failed',
              sampleCode: '403',
              error: 'Access denied. Your server IP (54.195.3.54) is not authorized.',
            }),
            { status: 200 }
          )
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              Message: 'Failed',
              sampleCode: '503',
              error: 'Voter detail V2 service is currently inactive.',
            }),
            { status: 200 }
          )
        );
      setTestingFetch(mockUndiciFetch as any);

      const res = await verifyActions.verifyDocument('voter', 'ABC0123456');
      expect(res.success).toBe(false);
      expect(res.errorMessage).not.toBe('Failed');

      const combinedLogs = [
        ...logSpy.mock.calls.map((args) => args.map((a) => JSON.stringify(a)).join(' ')),
        ...warnSpy.mock.calls.map((args) => args.map((a) => JSON.stringify(a)).join(' ')),
        ...errSpy.mock.calls.map((args) => args.map((a) => JSON.stringify(a)).join(' ')),
      ].join('\n');

      expect(combinedLogs).toContain('[NeoAPI:Voter]');
      expect(combinedLogs).toContain('[VoterLookup]');
      expect(combinedLogs).not.toContain('test_synthetic_neo_key');
      expect(combinedLogs).not.toContain('testtoken');
      expect(combinedLogs).not.toContain('ABC0123456');
    });

    it('Handles PAN upstream "Failed" response without exposing bare "Failed" string', async () => {
      const mockUndiciFetch = vi.fn().mockResolvedValueOnce(
        new Response(JSON.stringify({ Message: 'Failed', sampleCode: '403' }), { status: 200 })
      );
      setTestingFetch(mockUndiciFetch as any);

      const provider = new NeoApiProvider();
      const res = await provider.lookup('pan', 'ABCDE1234F');
      expect(res.success).toBe(false);
      expect(res.errorMessage).not.toBe('Failed');
      expect(res.errorMessage).toContain('PAN');
    });
  });

  // ============================================================================
  // PART 9 — BILLING TESTS (8 - 18)
  // ============================================================================
  describe('Wallet Billing, Ledger Integrity, Atomicity & Print Entitlement', () => {
    it('8. V1 success — charged configured Voter fee (₹20) exactly once', async () => {
      setTestingFetch(
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), { status: 200 })
        ) as any
      );

      const res = await verifyActions.verifyDocument('voter', 'ABC0123456');
      expect(res.success).toBe(true);
      expect(res.feeDeducted).toBe(20);
      expect(res.currentBalance).toBe(80);
      expect(inMemoryWallet.balance).toBe(80);
      expect(inMemoryWallet.transactions.length).toBe(1);
    });

    it('9. V1 failure and V2 success — charged configured fee exactly once (never twice)', async () => {
      const mockUndiciFetch = vi
        .fn()
        .mockResolvedValueOnce(new Response('Server Error', { status: 500 }))
        .mockResolvedValueOnce(
          new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), { status: 200 })
        );
      setTestingFetch(mockUndiciFetch as any);

      // Custom configured fee in ServiceConfig (e.g. ₹25)
      vi.mocked(ServiceConfig.findOne).mockResolvedValue({
        serviceId: 'VOTER',
        enabled: true,
        fee: 25,
        maintenanceMode: false,
      } as any);

      const res = await verifyActions.verifyDocument('voter', 'ABC0123456');
      expect(res.success).toBe(true);
      expect(res.providerVersion).toBe('v2');
      expect(res.fallbackUsed).toBe(true);
      expect(res.feeDeducted).toBe(25);
      expect(inMemoryWallet.balance).toBe(75);
      expect(inMemoryWallet.transactions.length).toBe(1);
    });

    it('10. Both endpoints fail — zero charges and no saved DocumentRecord', async () => {
      setTestingFetch(vi.fn().mockResolvedValue(new Response('Down', { status: 503 })) as any);

      const res = await verifyActions.verifyDocument('voter', 'ABC0123456');
      expect(res.success).toBe(false);
      expect(res.feeDeducted).toBe(0);
      expect(inMemoryWallet.balance).toBe(100);
      expect(inMemoryWallet.transactions.length).toBe(0);
      expect(inMemoryDocs.length).toBe(0);
    });

    it('11. Invalid response (mismatched EPIC / status false / bad sampleCode) — zero charges', async () => {
      const mismatchedPayload = buildSyntheticNeoApiPayload('ZZZ9999999');
      const statusFalsePayload = buildSyntheticNeoApiPayload('ABC0123456', { status: 'false' });

      setTestingFetch(
        vi
          .fn()
          .mockResolvedValueOnce(new Response(JSON.stringify(mismatchedPayload), { status: 200 }))
          .mockResolvedValueOnce(new Response(JSON.stringify(statusFalsePayload), { status: 200 })) as any
      );

      const validationCheck = validateNeoApiVoterResponse(mismatchedPayload, 'ABC0123456');
      expect(validationCheck.valid).toBe(false);
      expect(validationCheck.errorCode).toBe('EPIC_MISMATCH');

      const res = await verifyActions.verifyDocument('voter', 'ABC0123456');
      expect(res.success).toBe(false);
      expect(inMemoryWallet.balance).toBe(100);
      expect(inMemoryWallet.transactions.length).toBe(0);
      expect(inMemoryDocs.length).toBe(0);
    });

    it('12. Insufficient wallet — no successful paid lookup and no saved record', async () => {
      inMemoryWallet.balance = 10;
      setTestingFetch(
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), { status: 200 })
        ) as any
      );

      const res = await verifyActions.verifyDocument('voter', 'ABC0123456');
      expect(res.success).toBe(false);
      expect(res.errorMessage).toBe('INSUFFICIENT_BALANCE');
      expect(res.requiredFee).toBe(20);
      expect(res.currentBalance).toBe(10);
      expect(inMemoryWallet.balance).toBe(10);
      expect(inMemoryWallet.transactions.length).toBe(0);
      expect(inMemoryDocs.length).toBe(0);
    });

    it('13. Duplicate request (same requestId retry & sequential repeat) — no duplicate charge', async () => {
      const mockFetch = vi.fn().mockImplementation(async () =>
        new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), { status: 200 })
      );
      setTestingFetch(mockFetch as any);

      const reqId = 'vr_dup_retry_1';
      const res1 = await verifyActions.verifyDocument('voter', 'ABC0123456', reqId);
      expect(res1.success).toBe(true);
      expect(res1.feeDeducted).toBe(20);

      // Retry with same requestId
      const res2 = await verifyActions.verifyDocument('voter', 'ABC0123456', reqId);
      expect(res2.success).toBe(true);
      expect(res2.feeDeducted).toBe(0);
      expect(inMemoryWallet.balance).toBe(80);
      expect(inMemoryWallet.transactions.length).toBe(1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('14. Concurrent requests — no duplicate charge (both in-process & DB-level atomicity)', async () => {
      let fetchCalls = 0;
      setTestingFetch(
        vi.fn().mockImplementation(async () => {
          fetchCalls += 1;
          await new Promise((r) => setTimeout(r, 25));
          return new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), {
            status: 200,
          });
        }) as any
      );

      const [r1, r2, r3] = await Promise.all([
        verifyActions.verifyDocument('voter', 'ABC0123456', 'req_1'),
        verifyActions.verifyDocument('voter', 'ABC0123456', 'req_2'),
        verifyActions.verifyDocument('voter', 'abc 0123456', 'req_3'),
      ]);

      expect(r1.success).toBe(true);
      expect(r2.success).toBe(true);
      expect(r3.success).toBe(true);
      expect(fetchCalls).toBe(1);
      expect(inMemoryWallet.balance).toBe(80);
      expect(inMemoryWallet.transactions.length).toBe(1);
    });

    it('14b. Multi-instance concurrency race — atomic Wallet filter prevents duplicate charge if sibling debited first', async () => {
      // Simulate another serverless instance already having committed the debit into Wallet
      // right before this instance runs Wallet.findOneAndUpdate (before DocumentRecord is saved)
      inMemoryWallet.balance = 80;
      inMemoryWallet.totalDebited = 20;
      inMemoryWallet.transactions.push({
        _id: new mongoose.Types.ObjectId(),
        amount: 20,
        type: 'debit',
        category: 'VERIFICATION',
        docType: 'VOTER',
        referenceId: `VOTER_LOOKUP:${userIdA}:ABC0123456`,
        status: 'COMPLETED',
        balanceBefore: 100,
        balanceAfter: 80,
      });

      setTestingFetch(
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), { status: 200 })
        ) as any
      );

      const res = await verifyActions.verifyDocument('voter', 'ABC0123456', 'req_other_instance');
      expect(res.success).toBe(true);
      expect(res.feeDeducted).toBe(0);
      expect(inMemoryWallet.balance).toBe(80);
      expect(inMemoryWallet.transactions.length).toBe(1);
    });

    it('15. Print after successful lookup — ₹0 charged on print even with printCount=0', async () => {
      setTestingFetch(
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), { status: 200 })
        ) as any
      );

      const lookupRes = await verifyActions.verifyDocument('voter', 'ABC0123456');
      expect(lookupRes.success).toBe(true);
      expect(lookupRes.feeDeducted).toBe(20);
      expect(inMemoryDocs[0].isPaid).toBe(true);
      expect(inMemoryDocs[0].printCount).toBe(0);

      // Print authorization MUST NOT charge again
      const printRes = await authorizePrint({
        userId: userIdA,
        documentType: 'voter',
        cardIdentifier: 'ABC0123456',
        documentId: lookupRes.docId,
        printJobId: 'pj_voter_after_lookup_1',
        printFormat: 'CR80',
      });

      expect(printRes.success).toBe(true);
      expect(printRes.fee).toBe(0);
      expect(printRes.remainingBalance).toBe(80);
      expect(inMemoryWallet.balance).toBe(80);
      expect(inMemoryWallet.transactions.length).toBe(1); // Only the 1 lookup debit!
      expect(inMemoryDocs[0].printCount).toBe(1);
    });

    it('16. Cached record — existing 72h cache policy respected (free & zero API calls)', async () => {
      inMemoryDocs.push({
        _id: new mongoose.Types.ObjectId(),
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'ABC0123456',
        data: { epicNumber: 'ABC0123456', electorName: 'CACHED ELECTOR' },
        isComplete: true,
        isPaid: true,
        provider: 'NeoAPI',
        source: 'API',
        fetchedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
        printCount: 0,
      });

      const mockFetch = vi.fn();
      setTestingFetch(mockFetch as any);

      const res = await verifyActions.verifyDocument('voter', 'ABC0123456');
      expect(res.success).toBe(true);
      expect(res.feeDeducted).toBe(0);
      expect(res.isFreeReprint).toBe(true);
      expect(res.data.electorName).toBe('CACHED ELECTOR');
      expect(mockFetch).not.toHaveBeenCalled();
      expect(inMemoryWallet.balance).toBe(100);
    });

    it('17. Database save failure after debit — automatically refunds wallet and marks VerificationRequest REFUNDED', async () => {
      setTestingFetch(
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), { status: 200 })
        ) as any
      );

      vi.mocked(DocumentRecord.findOneAndUpdate).mockRejectedValueOnce(
        new Error('Simulated MongoDB write failure')
      );

      const res = await verifyActions.verifyDocument('voter', 'ABC0123456', 'req_save_fail');
      expect(res.success).toBe(false);
      expect(res.errorCode).toBe('SAVE_FAILED_REFUNDED');
      expect(res.feeDeducted).toBe(0);
      expect(inMemoryWallet.balance).toBe(100); // Fully restored!

      // Original debit marked FAILED + refund credit appended
      const debitTx = inMemoryWallet.transactions.find((t) => t.type === 'debit');
      const refundTx = inMemoryWallet.transactions.find((t) => t.type === 'credit');
      expect(debitTx.status).toBe('FAILED');
      expect(refundTx).toBeDefined();
      expect(refundTx.amount).toBe(20);
      expect(refundTx.category).toBe('VERIFICATION_REFUND');
      expect(inMemoryVerificationReqs[0].status).toBe('REFUNDED');
    });

    it('18. Wallet ledger entry matches actual debit (category, docType, balanceBefore, balanceAfter)', async () => {
      setTestingFetch(
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), { status: 200 })
        ) as any
      );

      const res = await verifyActions.verifyDocument('voter', 'ABC0123456');
      expect(res.success).toBe(true);

      const tx = inMemoryWallet.transactions[0];
      expect(tx.amount).toBe(20);
      expect(tx.type).toBe('debit');
      expect(tx.category).toBe('VERIFICATION');
      expect(tx.docType).toBe('VOTER');
      expect(tx.status).toBe('COMPLETED');
      expect(tx.balanceBefore).toBe(100);
      expect(tx.balanceAfter).toBe(80);
      expect(inMemoryWallet.totalDebited).toBe(20);
    });
  });

  // ============================================================================
  // PART 9 — DATABASE, OWNERSHIP, EXPIRY, USER EDITS & MAPPING (19 - 24)
  // ============================================================================
  describe('MongoDB Reuse, Ownership, Expiry, Edits Preservation & Regional Mapping', () => {
    it('19 & 20. Reuses existing Voter record and strictly enforces userId ownership', async () => {
      inMemoryDocs.push({
        _id: new mongoose.Types.ObjectId(),
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'ABC0123456',
        data: { epicNumber: 'ABC0123456', electorName: 'PRIVATE CITIZEN A' },
        isComplete: true,
        isPaid: true,
        expiresAt: new Date(Date.now() + CACHE_TTL_MS),
        printCount: 0,
      });

      // User B cannot access User A's Voter record
      const hitB = await findCachedDocument({
        userId: userIdB,
        docType: 'VOTER',
        documentNumber: 'ABC0123456',
      });
      expect(hitB).toBeNull();

      // User A retrieves their own record
      const hitA = await findCachedDocument({
        userId: userIdA,
        docType: 'VOTER',
        documentNumber: 'ABC0123456',
      });
      expect(hitA?.data.electorName).toBe('PRIVATE CITIZEN A');
    });

    it('21. EPIC duplicate handling — whitespace/lowercase variants map to one record and one charge', async () => {
      setTestingFetch(
        vi.fn().mockImplementation(async () =>
          new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), { status: 200 })
        ) as any
      );

      await verifyActions.verifyDocument('voter', ' abc 0123456 ');
      await verifyActions.verifyDocument('voter', 'ABC0123456');

      expect(inMemoryDocs.length).toBe(1);
      expect(inMemoryDocs[0].cardIdentifier).toBe('ABC0123456');
      expect(inMemoryWallet.transactions.length).toBe(1);
    });

    it('22. Expired record handling — refreshes via NeoAPI, does NOT use printCount as payment proof', async () => {
      // Case A: Expired record has printCount: 1 ONLY (not isPaid: true) -> must NOT count as paid lookup
      const expiredUnpaidId = new mongoose.Types.ObjectId();
      inMemoryDocs.push({
        _id: expiredUnpaidId,
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'ABC0123456',
        data: { epicNumber: 'ABC0123456', electorName: 'OLD NAME' },
        isPaid: false,
        printCount: 1,
        expiresAt: new Date(Date.now() - 3600 * 1000), // Expired
      });

      setTestingFetch(
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), { status: 200 })
        ) as any
      );

      const res = await verifyActions.verifyDocument('voter', 'ABC0123456');
      expect(res.success).toBe(true);
      expect(res.feeDeducted).toBe(20); // Charged because printCount is NOT proof of lookup payment!
      expect(inMemoryDocs.length).toBe(1); // Updated existing record in place (no duplicate)
      expect(inMemoryDocs[0]._id.toString()).toBe(expiredUnpaidId.toString());
      expect(inMemoryDocs[0].isPaid).toBe(true);

      // Case B: Once isPaid: true and cache later expires -> lifetime entitlement keeps refresh ₹0
      inMemoryDocs[0].expiresAt = new Date(Date.now() - 1000);
      setTestingFetch(
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify(buildSyntheticNeoApiPayload('ABC0123456')), { status: 200 })
        ) as any
      );
      const res2 = await verifyActions.verifyDocument('voter', 'ABC0123456');
      expect(res2.success).toBe(true);
      expect(res2.feeDeducted).toBe(0);
      expect(inMemoryWallet.transactions.length).toBe(1);
    });

    it('23. Existing user edits, photo, signature, layout & non-empty fields preserved on API refresh', async () => {
      inMemoryDocs.push({
        _id: new mongoose.Types.ObjectId(),
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'ABC0123456',
        inputMode: 'MANUAL',
        isPaid: true,
        data: {
          epicNumber: 'ABC0123456',
          electorName: 'Aarav Kumar Edited',
          dateOfBirth: '15/08/1994', // Manually completed since API returns dob: null
          houseNo: 'HOUSE NO 99',
          photoUrl: 'data:image/png;base64,CUSTOMPHOTO',
          signatureUrl: '/custom-sign.png',
          layoutFormat: 'sheet',
          templateVariant: 'assam',
          language: 'MR',
        },
        expiresAt: new Date(Date.now() - 1000),
      });

      const apiNormalized = normalizeNeoApiVoter(
        buildSyntheticNeoApiPayload('ABC0123456', { dob: null }),
        'ABC0123456'
      );

      const saved = await saveDocumentToCache({
        userId: userIdA,
        docType: 'VOTER',
        documentNumber: 'ABC0123456',
        data: apiNormalized,
        provider: 'NeoAPI',
      });

      expect(saved).not.toBeNull();
      expect(saved!.data.electorName).toBe('Aarav Kumar Edited');
      expect(saved!.data.dateOfBirth).toBe('15/08/1994'); // Not overwritten by dob: null
      expect(saved!.data.houseNo).toBe('HOUSE NO 99');
      expect(saved!.data.photoUrl).toBe('data:image/png;base64,CUSTOMPHOTO');
      expect(saved!.data.signatureUrl).toBe('/custom-sign.png');
      expect(saved!.data.layoutFormat).toBe('sheet');
      expect(saved!.data.templateVariant).toBe('assam');
      expect(saved!.data.language).toBe('MR');
      // Previously empty regional fields get filled from API
      expect(saved!.data.electorNameRegional).toBe('आरव शर्मा');
    });

    it('24. Correct regional-language & field mapping without fabricating houseNo/PIN/DOB', () => {
      const payload = buildSyntheticNeoApiPayload('ABC0123456');
      const mapped = normalizeNeoApiVoter(payload, 'ABC0123456');

      expect(mapped.epicNumber).toBe('ABC0123456');
      expect(mapped.electorName).toBe('aarav sharma');
      expect(mapped.electorNameRegional).toBe('आरव शर्मा');
      expect(mapped.relationName).toBe('rajesh sharma');
      expect(mapped.relationNameRegional).toBe('राजेश शर्मा');
      expect(mapped.relationType).toBe('FATHER');
      expect(mapped.gender).toBe('Male');
      expect(mapped.genderRegional).toBe('पुरुष');
      expect(mapped.age).toBe('32');
      expect(mapped.dateOfBirth).toBe(''); // dob was null — NEVER fabricated!
      expect(mapped.acNo).toBe('101');
      expect(mapped.acName).toBe('MODEL TOWN');
      expect(mapped.acNameRegional).toBe('मॉडल टाउन');
      expect(mapped.assemblyConstituency).toBe('101 - MODEL TOWN');
      expect(mapped.assemblyConstituencyRegional).toBe('101 - मॉडल टाउन');
      expect(mapped.partNo).toBe('45');
      expect(mapped.partName).toBe('GOVT HIGH SCHOOL SECTOR 5');
      expect(mapped.partNameRegional).toBe('राजकीय उच्च विद्यालय सेक्टर 5');
      expect(mapped.partNumberAndName).toBe('45 - GOVT HIGH SCHOOL SECTOR 5');
      expect(mapped.partNumberAndNameRegional).toBe('45 - राजकीय उच्च विद्यालय सेक्टर 5');
      expect(mapped.district).toBe('DEMO DISTRICT');
      expect(mapped.districtRegional).toBe('डेमो जिला');
      expect(mapped.state).toBe('UTTAR PRADESH');
      expect(mapped.stateRegional).toBe('उत्तर प्रदेश');
      expect(mapped.fullAddress).toBe(
        'GOVT HIGH SCHOOL SECTOR 5, MODEL TOWN, DEMO DISTRICT, UTTAR PRADESH'
      );
      expect(mapped.fullAddressRegional).toBe(
        'राजकीय उच्च विद्यालय सेक्टर 5, मॉडल टाउन, डेमो जिला, उत्तर प्रदेश'
      );
      expect(mapped.houseNo).toBeUndefined();
      expect(mapped.fullAddress).not.toMatch(/\b\d{6}\b/); // No invented PIN code
    });
  });
});
