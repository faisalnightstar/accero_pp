import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import {
  calculatePromoBenefit,
  validatePromoCode,
  createAppliedRedemption,
  finalizePromoRedemption,
  failPromoRedemption,
} from '@/lib/promo/service';
import * as paytmModule from '@/lib/payment/paytm';
import PromoCode from '@/models/PromoCode';
import PromoRedemption from '@/models/PromoRedemption';
import Payment from '@/models/Payment';
import Wallet from '@/models/Wallet';

// Mock mongodb connection
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue({}),
  connectToDatabase: vi.fn().mockResolvedValue({}),
}));

// Mock Audit logging
vi.mock('@/lib/logger/audit', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

// Mock rate limiter
vi.mock('@/lib/security/rateLimiter', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 10,
    resetSeconds: 60,
    retryAfterSeconds: 0,
  }),
}));

// Mock Mongoose models
vi.mock('@/models/PromoCode', () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock('@/models/Campaign', () => ({
  default: {
    findOne: vi.fn().mockResolvedValue(null),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('@/models/PromoRedemption', () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
    distinct: vi.fn(),
  },
}));

vi.mock('@/models/Payment', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock('@/models/Wallet', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn(),
  },
}));

describe('11.8 Promo Code & Coupon Management System Test Suite', () => {
  const dummyUserId = new mongoose.Types.ObjectId().toString();
  const dummyPromoId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Valid Promo Code (FIXED_BONUS, PERCENTAGE_BONUS, FIXED_DISCOUNT)
  describe('1. Valid Promo Codes & Benefit Calculations', () => {
    it('calculates FIXED_BONUS correctly (₹249 recharge + ₹50 bonus = ₹299 wallet credit)', async () => {
      const mockPromo: any = {
        _id: dummyPromoId,
        code: 'LAUNCH50',
        campaignName: 'Launch Blitz',
        discountType: 'FIXED_BONUS',
        discountValue: 50,
        minimumRechargeAmount: 249,
        maximumBonus: 0,
        perUserRedemptionLimit: 1,
        totalBudget: 100000,
        budgetSpent: 500,
        totalRedeemed: 10,
        startsAt: new Date(Date.now() - 86400000),
        expiresAt: new Date(Date.now() + 86400000 * 30),
        isActive: true,
      };

      (PromoCode.findOne as any).mockResolvedValue(mockPromo);
      (Payment.countDocuments as any).mockResolvedValue(0);
      (PromoRedemption.countDocuments as any).mockResolvedValue(0);

      const res = await validatePromoCode('LAUNCH50', dummyUserId, 249);
      expect(res.valid).toBe(true);
      expect(res.calculation?.bonusAmount).toBe(50);
      expect(res.calculation?.payableAmount).toBe(249);
      expect(res.calculation?.totalCredit).toBe(299);
    });

    it('calculates PERCENTAGE_BONUS correctly with maximumBonus cap', () => {
      const mockPromo: any = {
        discountType: 'PERCENTAGE_BONUS',
        discountValue: 10, // 10%
        maximumBonus: 100, // Capped at ₹100
      };

      // 10% of ₹500 is ₹50 (below cap)
      const res1 = calculatePromoBenefit(mockPromo, 500);
      expect(res1.bonusAmount).toBe(50);
      expect(res1.totalCredit).toBe(550);

      // 10% of ₹2000 is ₹200 (capped at ₹100)
      const res2 = calculatePromoBenefit(mockPromo, 2000);
      expect(res2.bonusAmount).toBe(100);
      expect(res2.totalCredit).toBe(2100);
    });

    it('calculates FIXED_DISCOUNT correctly (reduces payable amount, credits full value to wallet)', () => {
      const mockPromo: any = {
        discountType: 'FIXED_DISCOUNT',
        discountValue: 50,
      };

      // Recharge ₹249 with ₹50 discount -> User pays ₹199, wallet receives ₹249
      const res = calculatePromoBenefit(mockPromo, 249);
      expect(res.discountAmount).toBe(50);
      expect(res.payableAmount).toBe(199);
      expect(res.totalCredit).toBe(249);
    });
  });

  // 2. Invalid Promo Code
  describe('2. Invalid Promo Code', () => {
    it('rejects non-existent promo codes', async () => {
      (PromoCode.findOne as any).mockResolvedValue(null);

      const res = await validatePromoCode('DOESNOTEXIST', dummyUserId, 249);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/does not exist/i);
    });
  });

  // 3. Expired Promo Code
  describe('3. Expired Promo Code', () => {
    it('rejects expired promo codes', async () => {
      const mockPromo: any = {
        _id: dummyPromoId,
        code: 'EXPIRED100',
        isActive: true,
        startsAt: new Date(Date.now() - 86400000 * 30),
        expiresAt: new Date(Date.now() - 86400000), // Expired yesterday
      };

      (PromoCode.findOne as any).mockResolvedValue(mockPromo);

      const res = await validatePromoCode('EXPIRED100', dummyUserId, 249);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/expired/i);
    });
  });

  // 4. Inactive Promo Code
  describe('4. Inactive Promo Code', () => {
    it('rejects deactivated promo codes', async () => {
      const mockPromo: any = {
        _id: dummyPromoId,
        code: 'INACTIVE50',
        isActive: false,
        startsAt: new Date(Date.now() - 86400000),
        expiresAt: new Date(Date.now() + 86400000),
      };

      (PromoCode.findOne as any).mockResolvedValue(mockPromo);

      const res = await validatePromoCode('INACTIVE50', dummyUserId, 249);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/inactive/i);
    });
  });

  // 5. Insufficient Recharge Amount
  describe('5. Insufficient Recharge Amount', () => {
    it('rejects when recharge amount is below minimum requirement', async () => {
      const mockPromo: any = {
        _id: dummyPromoId,
        code: 'MIN500',
        isActive: true,
        startsAt: new Date(Date.now() - 86400000),
        expiresAt: new Date(Date.now() + 86400000),
        minimumRechargeAmount: 500,
      };

      (PromoCode.findOne as any).mockResolvedValue(mockPromo);

      const res = await validatePromoCode('MIN500', dummyUserId, 249);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/Minimum recharge of ₹500 is required/i);
    });
  });

  // 6. Duplicate Redemption on Same Payment
  describe('6. Duplicate Redemption Protection', () => {
    it('prevents creating duplicate redemptions for the same payment order', async () => {
      const existingRedemption: any = {
        _id: new mongoose.Types.ObjectId(),
        paymentId: 'wallet_order_duplicate_123',
        status: 'APPLIED',
      };

      (PromoRedemption.findOne as any).mockResolvedValue(existingRedemption);

      const res = await createAppliedRedemption(
        dummyPromoId,
        'TESTCODE',
        dummyUserId,
        'wallet_order_duplicate_123',
        249,
        50
      );

      // Returns existing record without calling PromoRedemption.create again
      expect(res).toBe(existingRedemption);
      expect(PromoRedemption.create).not.toHaveBeenCalled();
    });
  });

  // 7. First-Recharge Restrictions
  describe('7. First-Recharge Restrictions', () => {
    it('rejects FIRST_RECHARGE code if user already has prior completed recharges', async () => {
      const mockPromo: any = {
        _id: dummyPromoId,
        code: 'FIRSTTIMEONLY',
        firstRechargeOnly: true,
        isActive: true,
        startsAt: new Date(Date.now() - 86400000),
        expiresAt: new Date(Date.now() + 86400000),
      };

      (PromoCode.findOne as any).mockResolvedValue(mockPromo);
      // User has 1 previous paid payment
      (Payment.countDocuments as any).mockResolvedValue(1);

      const res = await validatePromoCode('FIRSTTIMEONLY', dummyUserId, 249);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/first successful recharge/i);
    });
  });

  // 8. Per-User Redemption Limits
  describe('8. Per-User Redemption Limits', () => {
    it('rejects when user has already reached perUserRedemptionLimit', async () => {
      const mockPromo: any = {
        _id: dummyPromoId,
        code: 'ONETIMEONLY',
        perUserRedemptionLimit: 1,
        isActive: true,
        startsAt: new Date(Date.now() - 86400000),
        expiresAt: new Date(Date.now() + 86400000),
      };

      (PromoCode.findOne as any).mockResolvedValue(mockPromo);
      (Payment.countDocuments as any).mockResolvedValue(0);
      // User already has 1 completed redemption
      (PromoRedemption.countDocuments as any).mockResolvedValue(1);

      const res = await validatePromoCode('ONETIMEONLY', dummyUserId, 249);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/maximum redemption limit/i);
    });
  });

  // 9. Campaign Budget Exhaustion
  describe('9. Campaign Budget Exhaustion', () => {
    it('rejects when total campaign budget is exhausted', async () => {
      const mockPromo: any = {
        _id: dummyPromoId,
        code: 'BUDGETEXHAUSTED',
        discountType: 'FIXED_BONUS',
        discountValue: 50,
        totalBudget: 1000,
        budgetSpent: 980, // Only ₹20 left, but bonus is ₹50
        perUserRedemptionLimit: 5,
        isActive: true,
        startsAt: new Date(Date.now() - 86400000),
        expiresAt: new Date(Date.now() + 86400000),
      };

      (PromoCode.findOne as any).mockResolvedValue(mockPromo);
      (Payment.countDocuments as any).mockResolvedValue(0);
      (PromoRedemption.countDocuments as any).mockResolvedValue(0);

      const res = await validatePromoCode('BUDGETEXHAUSTED', dummyUserId, 249);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/budget has been exhausted/i);
    });
  });

  // 10. Concurrent Redemption Requests
  describe('10. Concurrent Redemption Requests & Atomic Lock', () => {
    it('guarantees only one thread can transition redemption to COMPLETED', async () => {
      const mockRedemption: any = {
        _id: new mongoose.Types.ObjectId(),
        paymentId: 'concurrent_order_123',
        status: 'APPLIED',
        bonusAmount: 50,
        promoCodeId: dummyPromoId,
        operatorId: new mongoose.Types.ObjectId(dummyUserId),
      };

      (PromoRedemption.findOne as any).mockResolvedValue(mockRedemption);

      // Simulate thread 1 succeeding
      (PromoRedemption.findOneAndUpdate as any).mockResolvedValueOnce({
        ...mockRedemption,
        status: 'COMPLETED',
      });
      // Simulate thread 2 failing (returns null because status was already changed from APPLIED)
      (PromoRedemption.findOneAndUpdate as any).mockResolvedValueOnce(null);
      (PromoRedemption.findById as any).mockResolvedValue({
        ...mockRedemption,
        status: 'COMPLETED',
      });

      const [thread1, thread2] = await Promise.all([
        finalizePromoRedemption('concurrent_order_123'),
        finalizePromoRedemption('concurrent_order_123'),
      ]);

      expect(thread1.success).toBe(true);
      expect(thread1.alreadyFinalized).toBeFalsy();

      expect(thread2.success).toBe(true);
      expect(thread2.alreadyFinalized).toBe(true);

      // PromoCode stats incremented only once
      expect(PromoCode.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    });
  });

  // 11. Failed Payment Handling
  describe('11. Failed Payment Handling', () => {
    it('marks redemption as FAILED and never credits bonus when payment fails', async () => {
      (PromoRedemption.findOneAndUpdate as any).mockResolvedValue({
        paymentId: 'failed_order_123',
        status: 'FAILED',
      });

      await failPromoRedemption('failed_order_123', 'Insufficient bank balance');

      expect(PromoRedemption.findOneAndUpdate).toHaveBeenCalledWith(
        { paymentId: 'failed_order_123', status: 'APPLIED' },
        expect.objectContaining({
          $set: expect.objectContaining({ status: 'FAILED' }),
        })
      );

      // Wallet and promo code metrics never touched
      expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
      expect(PromoCode.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  // 12. Duplicate Payment Webhook & Verify Idempotency
  describe('12. Duplicate Payment Webhook Idempotency', () => {
    it('does not re-credit wallet or re-increment metrics on duplicate verification calls', async () => {
      const mockPayment: any = {
        _id: new mongoose.Types.ObjectId(),
        orderId: 'dup_webhook_order_789',
        userId: new mongoose.Types.ObjectId(dummyUserId),
        amount: 249,
        status: 'PAID', // Already marked PAID
        bankTxnId: 'BANK_TXN_EXISTING',
      };

      (Payment.findOne as any).mockResolvedValue(mockPayment);
      (Wallet.findOne as any).mockResolvedValue({ balance: 500 });

      const res = await paytmModule.verifyAndCreditPaytmPayment('dup_webhook_order_789');

      expect(res.success).toBe(true);
      expect(res.status).toBe('paid');
      expect(res.alreadyCredited).toBe(true);

      // Neither Wallet nor PromoRedemption updated
      expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
      expect(PromoRedemption.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  // 13. Promotional Ledger Integrity & Balance Separation
  describe('13. Promotional Ledger Integrity', () => {
    it('records separate ledger entries for standard recharge and promotional bonus', async () => {
      process.env.PAYTM_MID = 'TEST_MID_1';
      process.env.PAYTM_UPI = 'merchant@pty';

      const mockPayment: any = {
        _id: new mongoose.Types.ObjectId(),
        orderId: 'promo_credit_order_999',
        userId: new mongoose.Types.ObjectId(dummyUserId),
        amount: 249,
        upiId: 'merchant@pty',
        paytmMid: 'TEST_MID_1',
        status: 'PENDING',
        promoCode: 'LAUNCH50',
        bonusAmount: 50,
        save: vi.fn().mockResolvedValue(true),
      };

      (Payment.findOne as any).mockResolvedValue(mockPayment);
      (Payment.findOneAndUpdate as any).mockResolvedValue({
        ...mockPayment,
        status: 'PROCESSING',
      });

      // Mock fetch for Paytm gateway API
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          STATUS: 'TXN_SUCCESS',
          TXNAMOUNT: '249.00',
          BANKTXNID: 'TXN_TEST_12345',
        }),
      } as any);

      // Mock finalizePromoRedemption
      (PromoRedemption.findOne as any).mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        paymentId: 'promo_credit_order_999',
        status: 'APPLIED',
        bonusAmount: 50,
      });
      (PromoRedemption.findOneAndUpdate as any).mockResolvedValue({
        status: 'COMPLETED',
        bonusAmount: 50,
        promoCodeId: dummyPromoId,
        operatorId: new mongoose.Types.ObjectId(dummyUserId),
      });

      (Wallet.findOne as any).mockResolvedValue(null);
      (Wallet.findOneAndUpdate as any).mockResolvedValue({
        balance: 299,
        promotionalBalance: 50,
        purchasedBalance: 249,
        transactions: [
          { amount: 249, type: 'credit', category: 'WALLET_TOPUP', isPromotional: false },
          { amount: 50, type: 'credit', category: 'PROMO_BONUS', isPromotional: true },
        ],
        save: vi.fn().mockResolvedValue(true),
      });

      const res = await paytmModule.verifyAndCreditPaytmPayment('promo_credit_order_999');

      expect(res.success).toBe(true);
      expect(res.bonusAmount).toBe(50);
      expect(res.totalCredit).toBe(299);
      expect(res.newBalance).toBe(299);
      expect(res.promotionalBalance).toBe(50);
      expect(res.purchasedBalance).toBe(249);

      // Verify Wallet was updated with distinct promotionalBalance and purchasedBalance
      expect(Wallet.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: mockPayment.userId },
        expect.objectContaining({
          $inc: {
            balance: 299,
            totalCredited: 299,
            purchasedBalance: 249,
            promotionalBalance: 50,
          },
          $push: {
            transactions: {
              $each: expect.arrayContaining([
                expect.objectContaining({
                  amount: 249,
                  category: 'WALLET_TOPUP',
                  isPromotional: false,
                }),
                expect.objectContaining({
                  amount: 50,
                  category: 'PROMO_BONUS',
                  isPromotional: true,
                  promoCode: 'LAUNCH50',
                }),
              ]),
            },
          },
        }),
        expect.any(Object)
      );

      global.fetch = originalFetch;
    });
  });
});
