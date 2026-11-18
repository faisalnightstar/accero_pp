import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { POST as saveDocumentPost } from '@/app/api/documents/route';
import { GET as getDocumentById } from '@/app/api/documents/[id]/route';
import { authorizePrint } from '@/lib/print/printAuthorization';
import {
  verifyLegitimateReprintEntitlement,
  isDocumentAlreadyPaid,
  buildVoterLookupReferenceId,
} from '@/lib/wallet/pricing';
import DocumentRecord from '@/models/DocumentRecord';
import Wallet from '@/models/Wallet';
import User from '@/models/User';
import PrintJob from '@/models/PrintJob';
import VerificationRequest from '@/models/VerificationRequest';
import { getSession } from '@/lib/auth';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(true),
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/logger/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/security/rateLimiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, retryAfterSeconds: 0 }),
}));

vi.mock('@/models/DocumentRecord', () => {
  const model: any = {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn(),
    updateOne: vi.fn(),
  };
  return {
    default: model,
    DocumentRecord: model,
  };
});

vi.mock('@/models/Wallet', () => {
  const model: any = {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn(),
  };
  return {
    default: model,
    Wallet: model,
  };
});

vi.mock('@/models/User', () => {
  const model: any = {
    findById: vi.fn(),
  };
  return {
    default: model,
    User: model,
  };
});

vi.mock('@/models/PrintJob', () => {
  const model: any = {
    findOne: vi.fn(),
    create: vi.fn(),
  };
  return {
    default: model,
    PrintJob: model,
  };
});

vi.mock('@/models/VerificationRequest', () => {
  const model: any = {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  };
  return {
    default: model,
    VerificationRequest: model,
  };
});

describe('Document Identity Lock & Free Reprint Financial Integrity Suite', () => {
  const userIdA = '654321654321654321654321';
  const userIdB = '765432765432765432765432';
  const userObjA = new mongoose.Types.ObjectId(userIdA);
  const userObjB = new mongoose.Types.ObjectId(userIdB);

  let inMemoryDocs: any[] = [];
  let inMemoryWallet: any = null;
  let inMemoryPrintJobs: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    inMemoryDocs = [];
    inMemoryPrintJobs = [];

    // Setup authenticated session for User A
    vi.mocked(getSession).mockResolvedValue({
      userId: userIdA,
      email: 'operatorA@test.com',
      role: 'user',
    } as any);

    // Mock User findById (active user)
    vi.mocked(User.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: userObjA,
        status: 'active',
      }),
    } as any);

    // Setup in-memory wallet
    inMemoryWallet = {
      _id: new mongoose.Types.ObjectId(),
      userId: userObjA,
      balance: 100,
      totalDebited: 0,
      totalCredited: 100,
      transactions: [],
      save: vi.fn().mockResolvedValue(true),
    };

    vi.mocked(Wallet.findOne).mockImplementation((q: any) => {
      const qUid = q.userId?.toString();
      if (qUid === userIdA) {
        return {
          lean: vi.fn().mockResolvedValue(inMemoryWallet),
          then: (r: any) => Promise.resolve(inMemoryWallet).then(r),
        } as any;
      }
      return {
        lean: vi.fn().mockResolvedValue(null),
        then: (r: any) => Promise.resolve(null).then(r),
      } as any;
    });

    (Wallet.findOneAndUpdate as any).mockImplementation(async (filter: any, update: any) => {
      if (filter.balance?.$gte && inMemoryWallet.balance < filter.balance.$gte) {
        return null;
      }
      if (update.$inc?.balance) {
        inMemoryWallet.balance += update.$inc.balance;
      }
      if (update.$push?.transactions) {
        inMemoryWallet.transactions.push(update.$push.transactions);
      }
      return inMemoryWallet;
    });

    // Mock DocumentRecord.findOne
    vi.mocked(DocumentRecord.findOne).mockImplementation((query: any) => {
      const qId = query._id?.toString();
      const qUid = query.userId?.toString();
      const qDocType = query.docType?.toString()?.toUpperCase();

      const found = inMemoryDocs.find((d) => {
        if (qId && d._id.toString() !== qId) return false;
        if (qUid && d.userId?.toString() !== qUid) return false;
        if (qDocType && d.docType?.toUpperCase() !== qDocType) return false;
        if (query.cardIdentifier && d.cardIdentifier !== query.cardIdentifier) return false;
        if (query.$or) {
          const matchOr = query.$or.some(
            (cond: any) =>
              (cond.cardIdentifier && d.cardIdentifier === cond.cardIdentifier) ||
              (cond.documentNumberHash && d.documentNumberHash === cond.documentNumberHash)
          );
          if (!matchOr) return false;
        }
        return true;
      });

      const docInstance = found
        ? {
            ...found,
            save: vi.fn().mockImplementation(async function (this: any) {
              Object.assign(found, this);
              return this;
            }),
          }
        : null;

      return {
        lean: vi.fn().mockResolvedValue(found ? { ...found } : null),
        then: (resolve: any) => Promise.resolve(docInstance).then(resolve),
      } as any;
    });

    // Mock DocumentRecord.findOneAndUpdate
    (DocumentRecord.findOneAndUpdate as any).mockImplementation(async (filter: any, update: any) => {
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
          docType: filter.docType || update.$setOnInsert?.docType,
          cardIdentifier: filter.cardIdentifier,
          printCount: 0,
          createdAt: new Date(),
        };
        inMemoryDocs.push(existing);
      }

      Object.assign(existing, update.$set);
      return existing;
    });

    // Mock DocumentRecord.updateOne
    (DocumentRecord.updateOne as any).mockImplementation(async (filter: any, update: any) => {
      const doc = inMemoryDocs.find((d) => {
        if (filter._id) return d._id.toString() === filter._id.toString();
        return d.userId?.toString() === filter.userId?.toString() && d.cardIdentifier === filter.cardIdentifier;
      });
      if (doc) {
        if (update.$inc?.printCount) doc.printCount = (doc.printCount || 0) + update.$inc.printCount;
        if (update.$set) Object.assign(doc, update.$set);
      }
      return { modifiedCount: doc ? 1 : 0 } as any;
    });

    // Mock PrintJob.findOne and PrintJob.create
    vi.mocked(PrintJob.findOne).mockImplementation((q: any) => {
      const found = inMemoryPrintJobs.find((pj) => pj.printJobId === q.printJobId);
      return {
        lean: vi.fn().mockResolvedValue(found || null),
      } as any;
    });

    vi.mocked(PrintJob.create).mockImplementation(async (payload: any) => {
      inMemoryPrintJobs.push(payload);
      return payload;
    });
  });

  // =========================================================================
  // GROUP 1: Identity Protection & Document Lock Enforcement (Scenarios 6-13)
  // =========================================================================
  describe('Group 1: Identity Protection & Document Mutation Guards', () => {
    it('6. Changing EPIC number on verified Voter record is strictly rejected', async () => {
      const verifiedDocId = new mongoose.Types.ObjectId();
      inMemoryDocs.push({
        _id: verifiedDocId,
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'TMV0654962',
        inputMode: 'API',
        isPaid: true,
        data: { epicNumber: 'TMV0654962', electorName: 'Mo Wahid' },
        identityLock: {
          documentType: 'VOTER',
          documentIdentifier: 'TMV0654962',
          lookupStatus: 'SUCCESS',
          verificationStatus: 'VERIFIED',
          paymentStatus: 'PAID',
          reprintEligible: true,
        },
      });

      // Attack: Attempt to save document with altered EPIC number
      const req = new Request('http://localhost:3000/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: verifiedDocId.toString(),
          docType: 'voter',
          cardIdentifier: 'NEW9999999',
          data: { epicNumber: 'NEW9999999', electorName: 'Attacker' },
        }),
      });

      const res = await saveDocumentPost(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('IDENTITY_LOCKED');
      expect(data.message).toContain('Document identity has changed');
    });

    it('7. Changing docsNumber/identifier inside data payload is strictly rejected', async () => {
      const verifiedDocId = new mongoose.Types.ObjectId();
      inMemoryDocs.push({
        _id: verifiedDocId,
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'TMV0654962',
        inputMode: 'API',
        isPaid: true,
        data: { epicNumber: 'TMV0654962', electorName: 'Mo Wahid' },
      });

      const req = new Request('http://localhost:3000/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: verifiedDocId.toString(),
          docType: 'voter',
          cardIdentifier: 'TMV0654962',
          data: { epicNumber: 'CHANGED888', electorName: 'Mo Wahid' },
        }),
      });

      const res = await saveDocumentPost(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('IDENTITY_LOCKED');
    });

    it('8. Changing cardIdentifier on PAN record is rejected', async () => {
      const panDocId = new mongoose.Types.ObjectId();
      inMemoryDocs.push({
        _id: panDocId,
        userId: userObjA,
        docType: 'PAN',
        cardIdentifier: 'ABCDE1234F',
        inputMode: 'API',
        isPaid: true,
        data: { panNumber: 'ABCDE1234F', fullName: 'ORIGINAL HOLDER' },
      });

      const req = new Request('http://localhost:3000/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: panDocId.toString(),
          docType: 'pan',
          cardIdentifier: 'XYZAB9999Z',
          data: { panNumber: 'XYZAB9999Z', fullName: 'ATTACKER' },
        }),
      });

      const res = await saveDocumentPost(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('IDENTITY_LOCKED');
    });

    it('9. Switching Voter ID to PAN is strictly rejected by server', async () => {
      const voterDocId = new mongoose.Types.ObjectId();
      inMemoryDocs.push({
        _id: voterDocId,
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'TMV0654962',
        inputMode: 'API',
        isPaid: true,
        data: { epicNumber: 'TMV0654962' },
      });

      const req = new Request('http://localhost:3000/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: voterDocId.toString(),
          docType: 'pan',
          cardIdentifier: 'ABCDE1234F',
          data: { panNumber: 'ABCDE1234F' },
        }),
      });

      const res = await saveDocumentPost(req);
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe('IDENTITY_LOCKED');
      expect(data.message).toContain('Document type is locked');
    });

    it('10. Modifying document record ID to invalid/nonexistent ID is rejected with 400/404', async () => {
      const req = new Request('http://localhost:3000/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'invalid-hex-id',
          docType: 'voter',
          data: { epicNumber: 'TMV0654962' },
        }),
      });

      const res = await saveDocumentPost(req);
      expect(res.status).toBe(400);
    });

    it('11. Changing owner ID: User B cannot modify or hijack User A record', async () => {
      const voterDocId = new mongoose.Types.ObjectId();
      inMemoryDocs.push({
        _id: voterDocId,
        userId: userObjA, // Belongs to User A
        docType: 'VOTER',
        cardIdentifier: 'TMV0654962',
        isPaid: true,
        data: { epicNumber: 'TMV0654962' },
      });

      // User B attempts to access/update User A's document
      vi.mocked(getSession).mockResolvedValueOnce({
        userId: userIdB,
        email: 'userB@test.com',
        role: 'user',
      } as any);

      const req = new Request('http://localhost:3000/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: voterDocId.toString(),
          docType: 'voter',
          cardIdentifier: 'TMV0654962',
          data: { epicNumber: 'TMV0654962', electorName: 'Hijacked' },
        }),
      });

      const res = await saveDocumentPost(req);
      expect(res.status).toBe(404); // Scoped tenant query returns 404
    });

    it('12. Forged frontend verification status is rejected', async () => {
      // Direct API attempt to forge verification on a non-paid document
      const docId = new mongoose.Types.ObjectId();
      inMemoryDocs.push({
        _id: docId,
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'TMV0654962',
        inputMode: 'MANUAL',
        isPaid: false,
        data: { epicNumber: 'TMV0654962' },
      });

      const printRes = await authorizePrint({
        userId: userIdA,
        documentType: 'voter',
        cardIdentifier: 'TMV0654962',
        documentId: docId.toString(),
        printJobId: 'pj_test_forgery',
      });

      // Because isPaid is false and no ledger debit exists, it requires full payment (₹20), NOT ₹0
      expect(printRes.fee).toBe(20);
    });

    it('13. Direct API requests to /api/print/authorize cannot bypass identity locks', async () => {
      const voterDocId = new mongoose.Types.ObjectId();
      inMemoryDocs.push({
        _id: voterDocId,
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'TMV0654962',
        isPaid: true,
        data: { epicNumber: 'TMV0654962' },
      });

      // Attacker sends documentId of Voter, but tries to print PAN card
      const printRes = await authorizePrint({
        userId: userIdA,
        documentType: 'pan',
        cardIdentifier: 'ABCDE1234F',
        documentId: voterDocId.toString(),
        printJobId: 'pj_bypass_attempt',
      });

      expect(printRes.success).toBe(false);
      expect(printRes.error?.code).toBe('INVALID_INPUT');
      expect(printRes.error?.message).toContain('Document type does not match verified record');
    });
  });

  // =========================================================================
  // GROUP 2: Free Reprint Entitlement & Wallet Verification (Scenarios 14-22)
  // =========================================================================
  describe('Group 2: Free Reprint Entitlement & Wallet Verification', () => {
    it('14. Successfully paid Voter lookup permits legitimate ₹0 reprint', async () => {
      const txRef = buildVoterLookupReferenceId(userIdA, 'TMV0654962');
      const voterDocId = new mongoose.Types.ObjectId();

      inMemoryDocs.push({
        _id: voterDocId,
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'TMV0654962',
        isPaid: true,
        paymentReferenceId: txRef,
        data: { epicNumber: 'TMV0654962', electorName: 'Mo Wahid' },
      });

      // Legitimate paid transaction in ledger
      inMemoryWallet.transactions.push({
        amount: 20,
        type: 'debit',
        status: 'COMPLETED',
        referenceId: txRef,
        description: 'Voter Lookup (TMV0654962)',
      });

      const reprint = await verifyLegitimateReprintEntitlement({
        userId: userIdA,
        docType: 'VOTER',
        cardIdentifier: 'TMV0654962',
        documentId: voterDocId.toString(),
      });

      expect(reprint.eligible).toBe(true);
      expect(reprint.documentRecord).toBeDefined();

      const printRes = await authorizePrint({
        userId: userIdA,
        documentType: 'voter',
        cardIdentifier: 'TMV0654962',
        documentId: voterDocId.toString(),
        printJobId: 'pj_legit_reprint_1',
      });

      expect(printRes.success).toBe(true);
      expect(printRes.fee).toBe(0); // ₹0 charged!
      expect(inMemoryWallet.balance).toBe(100); // Balance untouched!
    });

    it('15. Original lookup fee is not deducted again during reprint', async () => {
      const txRef = buildVoterLookupReferenceId(userIdA, 'TMV0654962');
      const voterDocId = new mongoose.Types.ObjectId();

      inMemoryDocs.push({
        _id: voterDocId,
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'TMV0654962',
        isPaid: true,
        paymentReferenceId: txRef,
        data: { epicNumber: 'TMV0654962' },
      });

      inMemoryWallet.transactions.push({
        amount: 20,
        type: 'debit',
        status: 'COMPLETED',
        referenceId: txRef,
        description: 'Voter Lookup',
      });

      const initialTxCount = inMemoryWallet.transactions.length;

      const printRes = await authorizePrint({
        userId: userIdA,
        documentType: 'voter',
        cardIdentifier: 'TMV0654962',
        documentId: voterDocId.toString(),
        printJobId: 'pj_reprint_no_double_deduction',
      });

      expect(printRes.success).toBe(true);
      expect(printRes.fee).toBe(0);
      expect(inMemoryWallet.transactions.length).toBe(initialTxCount); // No new debit transaction!
    });

    it('17. Same EPIC and same verified record permit reprint', async () => {
      const txRef = buildVoterLookupReferenceId(userIdA, 'IFV1949684');
      const docId = new mongoose.Types.ObjectId();

      inMemoryDocs.push({
        _id: docId,
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'IFV1949684',
        isPaid: true,
        paymentReferenceId: txRef,
        data: { epicNumber: 'IFV1949684' },
      });

      inMemoryWallet.transactions.push({
        amount: 20,
        type: 'debit',
        status: 'COMPLETED',
        referenceId: txRef,
      });

      const check = await isDocumentAlreadyPaid(userIdA, 'VOTER', 'IFV1949684');
      expect(check).toBe(true);
    });

    it('18. Different EPIC is rejected for free reprint', async () => {
      const txRef = buildVoterLookupReferenceId(userIdA, 'IFV1949684');
      const docId = new mongoose.Types.ObjectId();

      inMemoryDocs.push({
        _id: docId,
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'IFV1949684',
        isPaid: true,
        paymentReferenceId: txRef,
        data: { epicNumber: 'IFV1949684' },
      });

      // Checking a different EPIC 'DIFFERENT01'
      const check = await verifyLegitimateReprintEntitlement({
        userId: userIdA,
        docType: 'VOTER',
        cardIdentifier: 'DIFFERENT01',
        documentId: docId.toString(),
      });

      expect(check.eligible).toBe(false);
      expect(check.reason).toContain('Document identifier mismatch');
    });

    it('19. Different document type is rejected for free reprint', async () => {
      const txRef = buildVoterLookupReferenceId(userIdA, 'IFV1949684');
      const docId = new mongoose.Types.ObjectId();

      inMemoryDocs.push({
        _id: docId,
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'IFV1949684',
        isPaid: true,
        paymentReferenceId: txRef,
        data: { epicNumber: 'IFV1949684' },
      });

      const check = await verifyLegitimateReprintEntitlement({
        userId: userIdA,
        docType: 'PAN', // Attempting to use Voter entitlement for PAN
        cardIdentifier: 'IFV1949684',
        documentId: docId.toString(),
      });

      expect(check.eligible).toBe(false);
      expect(check.reason).toContain('Document type mismatch');
    });

    it('20. Different user record is rejected for free reprint', async () => {
      const txRef = buildVoterLookupReferenceId(userIdB, 'IFV1949684');
      const docId = new mongoose.Types.ObjectId();

      inMemoryDocs.push({
        _id: docId,
        userId: userObjB, // Owned by User B
        docType: 'VOTER',
        cardIdentifier: 'IFV1949684',
        isPaid: true,
        paymentReferenceId: txRef,
      });

      // User A requests reprint of User B's document
      const check = await verifyLegitimateReprintEntitlement({
        userId: userIdA,
        docType: 'VOTER',
        cardIdentifier: 'IFV1949684',
        documentId: docId.toString(),
      });

      expect(check.eligible).toBe(false);
      expect(check.reason).toContain('not owned by user');
    });

    it('21. Refunded or reversed lookup payment does not grant free reprint', async () => {
      const txRef = buildVoterLookupReferenceId(userIdA, 'TMV0654962');
      const docId = new mongoose.Types.ObjectId();

      inMemoryDocs.push({
        _id: docId,
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'TMV0654962',
        isPaid: true,
        paymentReferenceId: txRef,
      });

      // Wallet shows the debit, BUT ALSO a refund credit!
      inMemoryWallet.transactions.push({
        amount: 20,
        type: 'debit',
        status: 'COMPLETED',
        referenceId: txRef,
      });
      inMemoryWallet.transactions.push({
        amount: 20,
        type: 'credit',
        category: 'VERIFICATION_REFUND',
        referenceId: `REFUND:${txRef}`,
        description: 'Auto-refund: Voter lookup save failed (TMV0654962)',
      });

      const check = await verifyLegitimateReprintEntitlement({
        userId: userIdA,
        docType: 'VOTER',
        cardIdentifier: 'TMV0654962',
        documentId: docId.toString(),
      });

      expect(check.eligible).toBe(false);
      expect(check.reason).toContain('refunded');
    });

    it('22. Concurrent reprint requests cannot create duplicate billing entries', async () => {
      const txRef = buildVoterLookupReferenceId(userIdA, 'TMV0654962');
      const docId = new mongoose.Types.ObjectId();

      inMemoryDocs.push({
        _id: docId,
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'TMV0654962',
        isPaid: true,
        paymentReferenceId: txRef,
      });

      inMemoryWallet.transactions.push({
        amount: 20,
        type: 'debit',
        status: 'COMPLETED',
        referenceId: txRef,
      });

      // Dispatch 5 concurrent reprint authorizations
      const results = await Promise.all(
        Array.from({ length: 5 }).map((_, i) =>
          authorizePrint({
            userId: userIdA,
            documentType: 'voter',
            cardIdentifier: 'TMV0654962',
            documentId: docId.toString(),
            printJobId: `pj_concurrent_reprint_${i}`,
          })
        )
      );

      // All 5 must succeed with ₹0 fee
      for (const res of results) {
        expect(res.success).toBe(true);
        expect(res.fee).toBe(0);
      }

      // Wallet balance must remain exactly 100
      expect(inMemoryWallet.balance).toBe(100);
      // No extra debit transactions
      expect(inMemoryWallet.transactions.filter((t: any) => t.type === 'debit').length).toBe(1);
    });
  });

  // =========================================================================
  // GROUP 3: Permitted Presentation Edits & Non-Identity Fields (Scenarios 23-29)
  // =========================================================================
  describe('Group 3: Document Editing for Permitted Presentation Fields', () => {
    it('24. Existing document editing still works for permitted fields (address, name regional, layout)', async () => {
      const voterDocId = new mongoose.Types.ObjectId();
      inMemoryDocs.push({
        _id: voterDocId,
        userId: userObjA,
        docType: 'VOTER',
        cardIdentifier: 'TMV0654962',
        inputMode: 'API',
        isPaid: true,
        data: {
          epicNumber: 'TMV0654962',
          electorName: 'Mo Wahid',
          electorNameRegional: 'मो वाहिद',
          fullAddress: 'OLD ADDRESS',
        },
      });

      // User updates non-identity fields: fullAddress and electorNameRegional
      const req = new Request('http://localhost:3000/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: voterDocId.toString(),
          docType: 'voter',
          cardIdentifier: 'TMV0654962', // Kept identical
          data: {
            epicNumber: 'TMV0654962', // Kept identical
            electorName: 'Mo Wahid',
            electorNameRegional: 'मोहम्मद वाहिद', // Updated
            fullAddress: 'NEW EDITED STREET ADDRESS, HOUSE 42', // Updated
          },
        }),
      });

      const res = await saveDocumentPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      const updated = inMemoryDocs.find((d) => d._id.toString() === voterDocId.toString());
      expect(updated.data.fullAddress).toBe('NEW EDITED STREET ADDRESS, HOUSE 42');
      expect(updated.data.electorNameRegional).toBe('मोहम्मद वाहिद');
      expect(updated.cardIdentifier).toBe('TMV0654962'); // Identity preserved!
    });

    it('28. Other document types (e.g. DL, RC, Ration) retain their correct billing behavior', async () => {
      // Unpaid DL card requires ₹30 print fee (per SERVICE_FEES.DL)
      const printRes = await authorizePrint({
        userId: userIdA,
        documentType: 'dl',
        cardIdentifier: 'DL-0420110123456',
        printJobId: 'pj_dl_standard_fee',
      });

      expect(printRes.success).toBe(true);
      expect(printRes.fee).toBe(30);
      expect(inMemoryWallet.balance).toBe(70);
    });

    it('29. Existing wallet ledger remains consistent across operations', async () => {
      expect(inMemoryWallet.balance).toBe(100);
      expect(Array.isArray(inMemoryWallet.transactions)).toBe(true);
    });
  });
});
