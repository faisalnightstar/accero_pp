import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { authorizePrint } from '@/lib/print/printAuthorization';
import { SERVICE_FEES } from '@/lib/wallet/constants';
import Wallet from '@/models/Wallet';
import PrintJob from '@/models/PrintJob';
import DocumentRecord from '@/models/DocumentRecord';
import User from '@/models/User';

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue({}),
  connectToDatabase: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/logger/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/models/User', () => ({
  default: {
    findById: vi.fn(),
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

vi.mock('@/models/DocumentRecord', () => ({
  default: {
    updateOne: vi.fn(),
  },
}));

describe('Centralized Print Billing & Print Authorization Engine', () => {
  const userId = '60d5ec49f1b2c82b8c8e1111';
  const userObjectId = new mongoose.Types.ObjectId(userId);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(User.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: userObjectId,
        status: 'active',
        role: 'user',
      }),
    } as any);
  });

  // 1. Service fee retrieval and server-side pricing enforcement
  it('deducts the server-configured fee for PAN (₹50) and rejects frontend fee manipulation', async () => {
    vi.mocked(PrintJob.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const mockWallet = {
      _id: new mongoose.Types.ObjectId(),
      balance: 150,
      totalDebited: 50,
      transactions: [{ amount: 50, balanceBefore: 200, balanceAfter: 150 }],
      save: vi.fn().mockResolvedValue(true),
    };

    vi.mocked(Wallet.findOneAndUpdate).mockResolvedValue(mockWallet as any);
    vi.mocked(PrintJob.create).mockResolvedValue({} as any);
    vi.mocked(DocumentRecord.updateOne).mockResolvedValue({} as any);

    const printJobId = 'pj_test_1111';
    const result = await authorizePrint({
      userId,
      documentType: 'pan',
      cardIdentifier: 'ABCDE1234F',
      printJobId,
      printFormat: 'CR80',
    });

    expect(result.success).toBe(true);
    expect(result.fee).toBe(SERVICE_FEES.PAN); // Server-side enforced ₹50
    expect(result.fee).toBe(50);
    expect(result.remainingBalance).toBe(150);

    // Verify atomic query enforces balance >= 50
    expect(Wallet.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: userObjectId,
        balance: { $gte: 50 },
      }),
      expect.objectContaining({
        $inc: { balance: -50, totalDebited: 50 },
        $push: expect.objectContaining({
          transactions: expect.objectContaining({
            amount: 50,
            type: 'debit',
            category: 'DOCUMENT_PRINT',
            referenceId: printJobId,
          }),
        }),
      }),
      expect.any(Object)
    );

    // PrintJob record created
    expect(PrintJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        printJobId,
        userId: userObjectId,
        documentType: 'PAN',
        fee: 50,
        status: 'AUTHORIZED',
      })
    );
  });

  // 2. Insufficient wallet balance blocks printing
  it('blocks printing and returns INSUFFICIENT_BALANCE when user funds are below the fee', async () => {
    vi.mocked(PrintJob.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    // findOneAndUpdate fails match { balance: { $gte: 50 } }
    vi.mocked(Wallet.findOneAndUpdate).mockResolvedValue(null);

    vi.mocked(Wallet.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ balance: 25 }),
    } as any);

    const result = await authorizePrint({
      userId,
      documentType: 'pan',
      cardIdentifier: 'ABCDE1234F',
      printJobId: 'pj_low_balance',
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('INSUFFICIENT_BALANCE');
    expect(result.requiredFee).toBe(50);
    expect(result.currentBalance).toBe(25);

    // PrintJob MUST NOT be created on failure
    expect(PrintJob.create).not.toHaveBeenCalled();
  });

  // 3. Idempotency: duplicate printJobId returns existing authorization without deducting again
  it('handles duplicate print requests idempotently without deducting money again', async () => {
    const existingJob = {
      printJobId: 'pj_duplicate_999',
      fee: 35,
      status: 'AUTHORIZED',
      transactionId: 'pj_duplicate_999',
    };

    vi.mocked(PrintJob.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(existingJob),
    } as any);

    vi.mocked(Wallet.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ balance: 180 }),
    } as any);

    const result = await authorizePrint({
      userId,
      documentType: 'rc',
      cardIdentifier: 'UP05LD1234',
      printJobId: 'pj_duplicate_999',
    });

    expect(result.success).toBe(true);
    expect(result.fee).toBe(35);
    expect(result.remainingBalance).toBe(180);

    // Crucial: Wallet deduction MUST NOT be called again!
    expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
    expect(PrintJob.create).not.toHaveBeenCalled();
  });

  // 4. Centralized billing across all 6 document services
  it('applies the appropriate service fee across all 6 document types', async () => {
    const services = [
      { type: 'pan', fee: 50 },
      { type: 'rc', fee: 35 },
      { type: 'dl', fee: 30 },
      { type: 'aadhaar', fee: 25 },
      { type: 'ration', fee: 25 },
      { type: 'voter', fee: 20 },
    ];

    for (const s of services) {
      vi.clearAllMocks();
      vi.mocked(User.findById).mockReturnValue({
        lean: vi.fn().mockResolvedValue({ status: 'active' }),
      } as any);

      vi.mocked(PrintJob.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      vi.mocked(Wallet.findOneAndUpdate).mockResolvedValue({
        balance: 500,
        transactions: [{ amount: s.fee, balanceBefore: 500 + s.fee, balanceAfter: 500 }],
        save: vi.fn().mockResolvedValue(true),
      } as any);

      vi.mocked(PrintJob.create).mockResolvedValue({} as any);
      vi.mocked(DocumentRecord.updateOne).mockResolvedValue({} as any);

      const res = await authorizePrint({
        userId,
        documentType: s.type,
        cardIdentifier: `TEST_${s.type.toUpperCase()}`,
        printJobId: `pj_${s.type}_1`,
      });

      expect(res.success).toBe(true);
      expect(res.fee).toBe(s.fee);
    }
  });

  // 5. PDF format export billing
  it('correctly authorizes PDF format exports with printFormat PDF', async () => {
    vi.mocked(PrintJob.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    vi.mocked(Wallet.findOneAndUpdate).mockResolvedValue({
      balance: 100,
      transactions: [{ amount: 30, balanceBefore: 130, balanceAfter: 100 }],
      save: vi.fn().mockResolvedValue(true),
    } as any);

    vi.mocked(PrintJob.create).mockResolvedValue({} as any);
    vi.mocked(DocumentRecord.updateOne).mockResolvedValue({} as any);

    const res = await authorizePrint({
      userId,
      documentType: 'dl',
      cardIdentifier: 'DL-0420110123456',
      printJobId: 'pj_pdf_export_1',
      printFormat: 'PDF',
    });

    expect(res.success).toBe(true);
    expect(res.fee).toBe(30);

    expect(PrintJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        printJobId: 'pj_pdf_export_1',
        printFormat: 'PDF',
        documentType: 'DL',
      })
    );
  });
});

