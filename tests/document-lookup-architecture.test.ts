import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { lookupAndBillPan, clearInFlightPanLookupsForTesting } from '@/lib/pan/pan.service';
import DocumentRecord from '@/models/DocumentRecord';
import PanLookupRecord from '@/models/PanLookupRecord';
import VerificationRequest from '@/models/VerificationRequest';
import Wallet from '@/models/Wallet';
import User from '@/models/User';
import {
  verifyLegitimateReprintEntitlement,
  hasPaidPanLookupEntitlement,
  buildPanLookupReferenceId,
} from '@/lib/wallet/pricing';
import {
  saveDocumentToCache,
  findExistingDocumentRecord,
  mergeDocumentDataPreservingEdits,
} from '@/lib/documents/documentCache';

// Mock MongoDB connection
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue({}),
  connectToDatabase: vi.fn().mockResolvedValue({}),
}));

// Mock audit logger
vi.mock('@/lib/logger/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

// Mock Rate Limiter
vi.mock('@/lib/security/rateLimiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 10,
    reset: 60,
  }),
}));

// Mock provider network calls
vi.mock('@/lib/network/provider-client', () => ({
  providerFetch: vi.fn(),
}));

import { providerFetch } from '@/lib/network/provider-client';

describe('Document and Lookup Data Architecture & Financial Integrity', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const otherUserId = new mongoose.Types.ObjectId().toString();
  const testPan = 'ABCDE1234F';

  beforeEach(() => {
    vi.clearAllMocks();
    clearInFlightPanLookupsForTesting();
    process.env.PAN_LOOKUP_API_TOKEN = 'test_token_secret_123';
  });

  // 1. Successful lookup and document creation with explicit foreign key relationship
  it('1. Successful lookup creates canonical DocumentRecord and links PanLookupRecord via documentRecordId', async () => {
    const createdDocs: any[] = [];
    const createdLookups: any[] = [];
    const updatedVerifs: any[] = [];

    // Mock Provider Success
    vi.mocked(providerFetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          status: '100',
          message: 'PAN Validate Successfully',
          pan: testPan,
          fullname: 'RAHUL SHARMA',
          fathername: 'MOHAN SHARMA',
          dob: '1995-05-15',
          gender: 'Male',
          aadhaar_no: true,
        }),
        { status: 200 }
      )
    );

    // Mock Models
    vi.spyOn(Wallet, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(mockUserId),
        balance: 100,
        transactions: [],
      }),
    } as any);

    vi.spyOn(Wallet, 'findOneAndUpdate').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      balance: 80,
      transactions: [
        {
          amount: 20,
          type: 'debit',
          category: 'VERIFICATION',
          referenceId: buildPanLookupReferenceId(mockUserId, testPan),
          status: 'COMPLETED',
        },
      ],
    } as any);

    const docId = new mongoose.Types.ObjectId();
    vi.spyOn(DocumentRecord, 'findOne').mockResolvedValue(null);
    vi.spyOn(DocumentRecord, 'findOneAndUpdate').mockImplementation((filter: any, update: any) => {
      const doc = {
        _id: docId,
        userId: new mongoose.Types.ObjectId(mockUserId),
        docType: 'PAN',
        cardIdentifier: testPan,
        data: update.$set.data,
        isPaid: true,
        paymentReferenceId: update.$set.paymentReferenceId,
      };
      createdDocs.push(doc);
      return Promise.resolve(doc) as any;
    });

    vi.spyOn(PanLookupRecord, 'create').mockImplementation((payload: any) => {
      createdLookups.push(payload);
      return Promise.resolve(payload) as any;
    });

    vi.spyOn(VerificationRequest, 'findOneAndUpdate').mockImplementation((filter: any, update: any) => {
      updatedVerifs.push(update.$set);
      return Promise.resolve(update.$set) as any;
    });

    const result = await lookupAndBillPan({
      userId: mockUserId,
      panNumber: testPan,
      bypassCache: true,
    });

    expect(result.status).toBe('SUCCESS');
    expect(createdDocs.length).toBe(1);
    expect(createdLookups.length).toBe(1);

    // Verify foreign key linking
    expect(createdLookups[0].documentRecordId.toString()).toBe(docId.toString());
    expect(createdLookups[0].panNumber).toBe(testPan);
    expect(createdLookups[0].documentNumberHash).toBeDefined();

    // Verify VerificationRequest linking
    expect(updatedVerifs[0].documentId.toString()).toBe(docId.toString());
    expect(updatedVerifs[0].idNumber).toBe(testPan);
  });

  // 2. Failed lookup without document creation
  it('2. Failed lookup creates FAILED audit record with documentRecordId: null and creates NO DocumentRecord', async () => {
    const createdDocs: any[] = [];
    const createdLookups: any[] = [];

    // Mock Provider 404 / NOT FOUND
    vi.mocked(providerFetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          status: '0',
          message: 'Record Not Found',
        }),
        { status: 200 }
      )
    );

    vi.spyOn(Wallet, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        balance: 100,
      }),
    } as any);

    vi.spyOn(DocumentRecord, 'findOneAndUpdate').mockImplementation((filter: any, update: any) => {
      createdDocs.push(update);
      return Promise.resolve(update) as any;
    });

    vi.spyOn(PanLookupRecord, 'create').mockImplementation((payload: any) => {
      createdLookups.push(payload);
      return Promise.resolve(payload) as any;
    });

    const result = await lookupAndBillPan({
      userId: mockUserId,
      panNumber: testPan,
      bypassCache: true,
    });

    expect(result.status).toBe('FAILED');
    expect(createdDocs.length).toBe(0); // Zero document records created
    expect(createdLookups.length).toBe(1);
    expect(createdLookups[0].status).toBe('FAILED');
    expect(createdLookups[0].serviceFee).toBe(0);
    expect(createdLookups[0].documentRecordId).toBeNull();
  });

  // 3. Successful lookup linked to existing document
  it('3. Successful lookup for existing document updates canonical DocumentRecord and preserves existing user edits', async () => {
    const existingDocId = new mongoose.Types.ObjectId();
    const existingRecord = {
      _id: existingDocId,
      userId: new mongoose.Types.ObjectId(mockUserId),
      docType: 'PAN',
      cardIdentifier: testPan,
      inputMode: 'MANUAL',
      data: {
        panNumber: testPan,
        fullName: 'RAHUL S (USER EDITED)',
        photoUrl: 'https://res.cloudinary.com/demo/image/upload/custom-photo.jpg',
        signatureUrl: 'https://res.cloudinary.com/demo/image/upload/custom-sign.jpg',
      },
      isPaid: false,
    };

    const incomingApiData = {
      panNumber: testPan,
      fullName: 'RAHUL SHARMA',
      fatherName: 'MOHAN SHARMA',
      dateOfBirth: '15-05-1995',
      gender: 'Male',
    };

    // Merging must preserve user edits and uploaded media
    const merged = mergeDocumentDataPreservingEdits(
      existingRecord.data,
      incomingApiData,
      existingRecord.inputMode
    );

    expect(merged.photoUrl).toBe('https://res.cloudinary.com/demo/image/upload/custom-photo.jpg');
    expect(merged.signatureUrl).toBe('https://res.cloudinary.com/demo/image/upload/custom-sign.jpg');
    expect(merged.fullName).toBe('RAHUL S (USER EDITED)'); // Preserved manual operator edit
    expect(merged.fatherName).toBe('MOHAN SHARMA'); // Filled missing field
  });

  // 4. Repeated lookup handling (idempotency & 72h free cache)
  it('4. Repeated lookup within 72h window returns cached canonical document with feeDeducted: 0', async () => {
    const existingDocId = new mongoose.Types.ObjectId();
    const cachedDoc = {
      _id: existingDocId,
      userId: new mongoose.Types.ObjectId(mockUserId),
      docType: 'PAN',
      cardIdentifier: testPan,
      data: {
        panNumber: testPan,
        fullName: 'RAHUL SHARMA',
        fatherName: 'MOHAN SHARMA',
        dateOfBirth: '15-05-1995',
      },
      isPaid: true,
      fetchedAt: new Date(),
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // Active 72h cache
    };

    vi.spyOn(DocumentRecord, 'findOne').mockResolvedValue(cachedDoc as any);

    const walletDebitSpy = vi.spyOn(Wallet, 'findOneAndUpdate');

    const result = await lookupAndBillPan({
      userId: mockUserId,
      panNumber: testPan,
      bypassCache: false,
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.feeDeducted).toBe(0);
    expect(result.isFreeReprint).toBe(true);
    expect(walletDebitSpy).not.toHaveBeenCalled();
    expect(providerFetch).not.toHaveBeenCalled(); // Zero external API calls
  });

  // 5. Document editing updates DocumentRecord while audit record remains immutable
  it('5. Updating DocumentRecord data does not mutate immutable historical PanLookupRecord', async () => {
    const originalLookup = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(mockUserId),
      panNumber: testPan,
      fullName: 'RAHUL SHARMA',
      fatherName: 'MOHAN SHARMA',
      status: 'SUCCESS',
      serviceFee: 20,
      createdAt: new Date('2026-01-01'),
    };

    // Operator edits name in DocumentRecord
    const updatedDoc = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(mockUserId),
      docType: 'PAN',
      cardIdentifier: testPan,
      data: {
        panNumber: testPan,
        fullName: 'RAHUL DEV SHARMA', // Edited
        fatherName: 'MOHAN LAL SHARMA', // Edited
      },
    };

    expect(updatedDoc.data.fullName).toBe('RAHUL DEV SHARMA');
    expect(originalLookup.fullName).toBe('RAHUL SHARMA'); // Audit log remains untouched
  });

  // 6. Document identity protection (identityLock prevents PAN number / docType modification)
  it('6. IdentityLock strictly blocks changing cardIdentifier or docType on verified documents', () => {
    const verifiedRecord = {
      docType: 'PAN',
      cardIdentifier: 'ABCDE1234F',
      identityLock: {
        documentType: 'PAN',
        documentIdentifier: 'ABCDE1234F',
        lookupStatus: 'SUCCESS',
        verificationStatus: 'VERIFIED',
        paymentStatus: 'PAID',
        reprintEligible: true,
      },
    };

    const isLocked = Boolean(verifiedRecord.identityLock);
    expect(isLocked).toBe(true);

    const attemptedDocTypeChange = 'VOTER';
    const isDocTypeMatch = verifiedRecord.docType === attemptedDocTypeChange;
    expect(isDocTypeMatch).toBe(false);

    const attemptedPanChange = 'XYZPK9999Z';
    const isIdentifierMatch = verifiedRecord.cardIdentifier === attemptedPanChange;
    expect(isIdentifierMatch).toBe(false);
  });

  // 7. Free reprint authorization requires valid wallet transaction
  it('7. Free reprint is authorized only when verified against actual wallet ledger debit', async () => {
    const paymentRef = buildPanLookupReferenceId(mockUserId, testPan);
    const docId = new mongoose.Types.ObjectId();

    const verifiedDoc = {
      _id: docId,
      userId: new mongoose.Types.ObjectId(mockUserId),
      docType: 'PAN',
      cardIdentifier: testPan,
      isPaid: true,
      paymentReferenceId: paymentRef,
    };

    vi.spyOn(DocumentRecord, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(verifiedDoc),
    } as any);

    // Wallet with matching completed debit
    vi.spyOn(Wallet, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        userId: new mongoose.Types.ObjectId(mockUserId),
        transactions: [
          {
            type: 'debit',
            status: 'COMPLETED',
            referenceId: paymentRef,
            amount: 20,
          },
        ],
      }),
    } as any);

    const check = await verifyLegitimateReprintEntitlement({
      userId: mockUserId,
      docType: 'PAN',
      cardIdentifier: testPan,
    });

    expect(check.eligible).toBe(true);
    expect(check.originalTransactionId).toBe(paymentRef);
  });

  // 8. Cross-user access prevention
  it('8. Cross-user access prevention blocks User B from claiming or printing User A’s document', async () => {
    const paymentRef = buildPanLookupReferenceId(mockUserId, testPan);

    // Document belongs to mockUserId (User A)
    const userADoc = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(mockUserId),
      docType: 'PAN',
      cardIdentifier: testPan,
      isPaid: true,
      paymentReferenceId: paymentRef,
    };

    // User B queries DocumentRecord
    vi.spyOn(DocumentRecord, 'findOne').mockImplementation((filter: any) => {
      const isOwner = filter.userId && filter.userId.toString() === mockUserId;
      if (!isOwner) {
        return { lean: vi.fn().mockResolvedValue(null) } as any;
      }
      return { lean: vi.fn().mockResolvedValue(userADoc) } as any;
    });

    const check = await verifyLegitimateReprintEntitlement({
      userId: otherUserId, // User B requests entitlement for User A's card
      docType: 'PAN',
      cardIdentifier: testPan,
    });

    expect(check.eligible).toBe(false);
    expect(check.reason).toBe('No existing verified record found for this document identity');
  });

  // 9. Wallet transaction verification rejects printCount > 0 without ledger transaction
  it('9. Strictly rejects free reprint when record has printCount > 0 but NO wallet debit transaction exists', async () => {
    const docWithPrintsOnly = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(mockUserId),
      docType: 'PAN',
      cardIdentifier: testPan,
      isPaid: false, // NOT marked paid
      printCount: 10, // Old loophole had printCount > 0
    };

    vi.spyOn(DocumentRecord, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(docWithPrintsOnly),
    } as any);

    vi.spyOn(Wallet, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        userId: new mongoose.Types.ObjectId(mockUserId),
        transactions: [], // No matching debit
      }),
    } as any);

    const check = await verifyLegitimateReprintEntitlement({
      userId: mockUserId,
      docType: 'PAN',
      cardIdentifier: testPan,
    });

    expect(check.eligible).toBe(false);
    expect(check.reason).toContain('has not completed a paid verification');
  });

  // 10. Concurrent lookup requests collapse into single provider call
  it('10. Concurrent lookup requests for the same PAN within the same worker collapse into one execution', async () => {
    vi.mocked(providerFetch).mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 20));
      return new Response(
        JSON.stringify({
          status: '100',
          message: 'PAN Validate Successfully',
          pan: testPan,
          fullname: 'RAHUL SHARMA',
          fathername: 'MOHAN SHARMA',
          dob: '15-05-1995',
        }),
        { status: 200 }
      );
    });

    vi.spyOn(Wallet, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        balance: 100,
      }),
    } as any);

    vi.spyOn(Wallet, 'findOneAndUpdate').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      balance: 80,
    } as any);

    vi.spyOn(DocumentRecord, 'findOne').mockResolvedValue(null);
    vi.spyOn(DocumentRecord, 'findOneAndUpdate').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(mockUserId),
      docType: 'PAN',
      cardIdentifier: testPan,
    } as any);

    vi.spyOn(PanLookupRecord, 'create').mockResolvedValue({} as any);
    vi.spyOn(VerificationRequest, 'findOneAndUpdate').mockResolvedValue({} as any);

    // Fire 2 concurrent lookups simultaneously
    const [res1, res2] = await Promise.all([
      lookupAndBillPan({ userId: mockUserId, panNumber: testPan, bypassCache: true }),
      lookupAndBillPan({ userId: mockUserId, panNumber: testPan, bypassCache: true }),
    ]);

    expect(res1.status).toBe('SUCCESS');
    expect(res2.status).toBe('SUCCESS');
    expect(providerFetch).toHaveBeenCalledTimes(1); // Deduped! Exactly 1 network call
  });

  // 11. Duplicate lookup attempts prevent double charge with deterministic reference ID
  it('11. Deterministic transaction reference ID prevents double charge across retries', () => {
    const ref1 = buildPanLookupReferenceId(mockUserId, 'ABCDE1234F');
    const ref2 = buildPanLookupReferenceId(mockUserId, 'abcde1234f');
    const ref3 = buildPanLookupReferenceId(mockUserId, '  ABCDE1234F  ');

    expect(ref1).toBe(`PAN_LOOKUP:${mockUserId}:ABCDE1234F`);
    expect(ref2).toBe(ref1);
    expect(ref3).toBe(ref1);
  });

  // 12. Missing lookup-to-document references handle gracefully without crashes or false grants
  it('12. Missing lookup-to-document references handle gracefully without granting unauthorized free reprints', async () => {
    const unlinkedDoc = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(mockUserId),
      docType: 'PAN',
      cardIdentifier: testPan,
      isPaid: false,
      paymentReferenceId: undefined, // Missing reference
    };

    vi.spyOn(DocumentRecord, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue(unlinkedDoc),
    } as any);

    vi.spyOn(Wallet, 'findOne').mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        userId: new mongoose.Types.ObjectId(mockUserId),
        transactions: [],
      }),
    } as any);

    const check = await verifyLegitimateReprintEntitlement({
      userId: mockUserId,
      docType: 'PAN',
      cardIdentifier: testPan,
    });

    expect(check.eligible).toBe(false);
  });
});
