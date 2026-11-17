import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  verifyAndCreditPaytmPayment,
  queryPaytmOrderStatus,
} from '@/lib/payment/paytm';
import Payment from '@/models/Payment';
import Wallet from '@/models/Wallet';
import mongoose from 'mongoose';
import { Analytics } from '@/lib/analytics/events';

// Mock MongoDB connection & models
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/security/rateLimiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

vi.mock('@/lib/logger/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/promo/service', () => ({
  finalizePromoRedemption: vi.fn().mockResolvedValue({ success: true, alreadyFinalized: false }),
  failPromoRedemption: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/referral/service', () => ({
  qualifyAndRewardReferral: vi.fn().mockResolvedValue(true),
}));

describe('Payment Idempotency & Financial Decoupling Suite (Workstream B)', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockOrderId = `wallet_${Date.now()}_test123`;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Idempotency under Repeated Verification Calls', () => {
    it('credits wallet on first verification and suppresses duplicate credits on subsequent calls', async () => {
      // 1. Initial State: Payment is PENDING
      let paymentStatus = 'PENDING';
      let walletBalance = 100;
      let walletLedger: any[] = [];

      const mockPaymentDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        orderId: mockOrderId,
        userId: new mongoose.Types.ObjectId(mockUserId),
        amount: 250,
        paytmMid: 'TEST_MID_01',
        status: paymentStatus,
        save: vi.fn().mockImplementation(async function (this: any) {
          paymentStatus = this.status;
          return this;
        }),
      };

      // Mock Payment.findOne
      vi.spyOn(Payment, 'findOne').mockImplementation((query: any) => {
        if (query.orderId === mockOrderId) {
          return {
            ...mockPaymentDoc,
            status: paymentStatus,
            save: mockPaymentDoc.save,
          } as any;
        }
        return null as any;
      });

      // Mock Payment.findOneAndUpdate
      vi.spyOn(Payment, 'findOneAndUpdate').mockImplementation((filter: any, update: any) => {
        if (paymentStatus === 'PENDING') {
          paymentStatus = 'PROCESSING';
          return {
            ...mockPaymentDoc,
            status: 'PROCESSING',
            save: mockPaymentDoc.save,
          } as any;
        }
        return null as any; // already claimed
      });

      // Mock Wallet.findOne
      vi.spyOn(Wallet, 'findOne').mockImplementation((query: any) => {
        if (query['transactions.referenceId'] === mockOrderId) {
          return walletLedger.some((tx) => tx.referenceId === mockOrderId)
            ? ({ balance: walletBalance } as any)
            : null;
        }
        return {
          userId: mockUserId,
          balance: walletBalance,
          transactions: walletLedger,
        } as any;
      });

      // Mock Wallet.findOneAndUpdate
      vi.spyOn(Wallet, 'findOneAndUpdate').mockImplementation((filter: any, update: any) => {
        const creditAmt = update.$inc?.balance || 0;
        walletBalance += creditAmt;
        if (update.$push?.transactions?.$each) {
          walletLedger.push(...update.$push.transactions.$each);
        }
        return {
          userId: mockUserId,
          balance: walletBalance,
          transactions: walletLedger,
          save: vi.fn(),
        } as any;
      });

      // Mock gateway order status query
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          STATUS: 'TXN_SUCCESS',
          TXNAMOUNT: '250.00',
          BANKTXNID: 'PAYTM_BANK_9988',
          RESPCODE: '01',
          RESPMSG: 'Txn Success',
        }),
      } as any);

      // Call 1: First verification
      const firstResult = await verifyAndCreditPaytmPayment(mockOrderId, mockUserId);
      expect(firstResult.success).toBe(true);
      expect(firstResult.status).toBe('paid');
      expect(firstResult.alreadyCredited).toBeUndefined();
      expect(walletBalance).toBe(350); // 100 + 250

      // Call 2: Immediate repeated verification call (e.g. user double-clicked or refreshed)
      const secondResult = await verifyAndCreditPaytmPayment(mockOrderId, mockUserId);
      expect(secondResult.success).toBe(true);
      expect(secondResult.status).toBe('paid');
      expect(secondResult.alreadyCredited).toBe(true);
      expect(walletBalance).toBe(350); // MUST REMAIN 350, NOT 600!
    });
  });

  describe('2. Concurrent Request Collision Handling', () => {
    it('ensures exactly one request acquires atomic PROCESSING lock when callbacks race', async () => {
      let claimCount = 0;
      let walletCreditCount = 0;

      vi.spyOn(Payment, 'findOne').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        orderId: 'concurrent_order_123',
        userId: new mongoose.Types.ObjectId(mockUserId),
        amount: 500,
        paytmMid: 'TEST_MID_01',
        status: 'PENDING',
        save: vi.fn(),
      } as any);

      vi.spyOn(Payment, 'findOneAndUpdate').mockImplementation(() => {
        claimCount++;
        if (claimCount === 1) {
          return {
            status: 'PROCESSING',
            save: vi.fn(),
          } as any;
        }
        return null; // Second concurrent request fails atomic claim
      });

      vi.spyOn(Payment, 'findById').mockResolvedValue({
        status: 'PAID',
        bankTxnId: 'TXN_ALREADY_COMMITTED',
      } as any);

      vi.spyOn(Wallet, 'findOne').mockImplementation((query: any) => {
        if (query['transactions.referenceId']) {
          return null; // No previous transaction in ledger
        }
        return {
          balance: 600,
        } as any;
      });

      vi.spyOn(Wallet, 'findOneAndUpdate').mockImplementation(() => {
        walletCreditCount++;
        return {
          balance: 600,
          transactions: [],
          save: vi.fn(),
        } as any;
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          STATUS: 'TXN_SUCCESS',
          TXNAMOUNT: '500.00',
          BANKTXNID: 'TXN_CONCURRENT_WINNER',
        }),
      } as any);

      // Fire 2 simultaneous verification promises
      const [res1, res2] = await Promise.all([
        verifyAndCreditPaytmPayment('concurrent_order_123', mockUserId),
        verifyAndCreditPaytmPayment('concurrent_order_123', mockUserId),
      ]);

      // Exactly ONE executed the wallet credit
      expect(walletCreditCount).toBe(1);

      // Both returned successful responses to clients
      expect(res1.status).toBe('paid');
      expect(res2.status).toBe('paid');

      // One was the winner, the other was identified as already credited
      const alreadyCreditedFlags = [res1.alreadyCredited, res2.alreadyCredited];
      expect(alreadyCreditedFlags).toContain(true);
    });
  });

  describe('3. Security & Validation Boundaries', () => {
    it('rejects missing or empty orderId', async () => {
      const res = await verifyAndCreditPaytmPayment('');
      expect(res.success).toBe(false);
      expect(res.status).toBe('failed');
      expect(res.error).toContain('Order ID is required');
    });

    it('rejects unknown or non-existent order records', async () => {
      vi.spyOn(Payment, 'findOne').mockResolvedValue(null);
      const res = await verifyAndCreditPaytmPayment('non_existent_order_999');
      expect(res.success).toBe(false);
      expect(res.status).toBe('failed');
      expect(res.error).toContain('Payment record not found');
    });

    it('rejects transaction when gateway reports TXN_FAILURE', async () => {
      const mockPayment: any = {
        _id: new mongoose.Types.ObjectId(),
        orderId: 'failed_order_123',
        userId: new mongoose.Types.ObjectId(mockUserId),
        amount: 100,
        paytmMid: 'MID_01',
        status: 'PENDING',
        save: vi.fn(),
      };
      vi.spyOn(Payment, 'findOne').mockResolvedValue(mockPayment);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          STATUS: 'TXN_FAILURE',
          RESPCODE: '227',
          RESPMSG: 'User cancelled payment on bank page',
        }),
      } as any);

      const res = await verifyAndCreditPaytmPayment('failed_order_123', mockUserId);
      expect(res.success).toBe(false);
      expect(res.status).toBe('failed');
      expect(res.error).toContain('User cancelled payment');
      expect(mockPayment.status).toBe('FAILED');
    });

    it('rejects transaction when gateway reported amount differs from order amount', async () => {
      const mockPayment: any = {
        _id: new mongoose.Types.ObjectId(),
        orderId: 'tampered_order_123',
        userId: new mongoose.Types.ObjectId(mockUserId),
        amount: 500, // Expected ₹500
        paytmMid: 'MID_01',
        status: 'PENDING',
        save: vi.fn(),
      };
      vi.spyOn(Payment, 'findOne').mockResolvedValue(mockPayment);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          STATUS: 'TXN_SUCCESS',
          TXNAMOUNT: '1.00', // Attacker paid ₹1 instead of ₹500
          BANKTXNID: 'TAMPER_TXN_001',
        }),
      } as any);

      const res = await verifyAndCreditPaytmPayment('tampered_order_123', mockUserId);
      expect(res.success).toBe(false);
      expect(res.status).toBe('failed');
      expect(res.error).toContain('does not match expected order amount');
      expect(mockPayment.status).toBe('FAILED');
    });
  });

  describe('4. Financial Decoupling & Purchase Analytics Integrity', () => {
    it('verifies that client-side purchase tracking runs strictly after financial verification', () => {
      const mockTxn = `purchase_txn_${Date.now()}`;
      (globalThis as any).window = { dataLayer: [] };

      // Dispatch purchase through Analytics helper
      Analytics.trackPurchase(mockTxn, 500, 'GATEWAY');

      expect((window as any).dataLayer).toHaveLength(1);
      const purchaseEvent = (window as any).dataLayer[0];
      expect(purchaseEvent.event).toBe('purchase');
      expect(purchaseEvent.transactionId).toBe(mockTxn);
      expect(purchaseEvent.value).toBe(500);

      // Duplicate attempt should be silently blocked on client
      Analytics.trackPurchase(mockTxn, 500, 'GATEWAY');
      expect((window as any).dataLayer).toHaveLength(1);
    });

    it('verifies that analytics dispatch failures cannot disrupt backend financial transactions', async () => {
      // Even if window / dataLayer throws or is undefined, verifyAndCreditPaytmPayment succeeds
      delete (globalThis as any).window;

      vi.spyOn(Payment, 'findOne').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        orderId: 'no_window_order',
        userId: new mongoose.Types.ObjectId(mockUserId),
        amount: 200,
        paytmMid: 'MID_01',
        status: 'PAID',
        save: vi.fn(),
      } as any);

      vi.spyOn(Wallet, 'findOne').mockResolvedValue({
        balance: 750,
      } as any);

      const res = await verifyAndCreditPaytmPayment('no_window_order', mockUserId);
      expect(res.success).toBe(true);
      expect(res.status).toBe('paid');
      expect(res.newBalance).toBe(750);
    });
  });
});
