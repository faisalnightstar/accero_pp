import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import {
  generateUniqueReferralCode,
  getOrCreateReferralCode,
  processReferralRegistration,
  qualifyAndRewardReferral,
  getOperatorReferralDashboardData,
  updateAdminReferralStatus,
} from '@/lib/referral/service';
import User from '@/models/User';
import Referral from '@/models/Referral';
import ReferralConfig from '@/models/ReferralConfig';
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

// Mock Mongoose models
vi.mock('@/models/User', () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock('@/models/Referral', () => ({
  default: {
    findOne: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    countDocuments: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock('@/models/ReferralConfig', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/models/Wallet', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

describe('Customer Referral & Rewards System Test Suite', () => {
  const dummyReferrerId = new mongoose.Types.ObjectId();
  const dummyReferredId = new mongoose.Types.ObjectId();
  const dummyReferralCode = 'RAMESH500';

  const defaultMockConfig: any = {
    rewardPerReferral: 50,
    firstRechargeThreshold: 249,
    welcomeRewardReferred: 50,
    maxReferralsPerUser: 100,
    isActive: true,
    terms: 'Test terms',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (ReferralConfig.findOne as any).mockResolvedValue({ ...defaultMockConfig });
  });

  describe('1. Referral Code Generation & Assignment', () => {
    it('generates a clean, uppercase alphanumeric referral code from user name', async () => {
      (User.findOne as any).mockResolvedValue(null);
      const code = await generateUniqueReferralCode('Faisal Khan');
      expect(code).toMatch(/^FAISAL\d{3}$/);
    });

    it('returns existing referral code if user already has one assigned', async () => {
      const existingUser: any = {
        _id: dummyReferrerId,
        name: 'Ramesh',
        referralCode: 'EXISTING123',
      };
      const code = await getOrCreateReferralCode(existingUser);
      expect(code).toBe('EXISTING123');
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('generates and assigns new code if user does not have one', async () => {
      const userWithoutCode: any = {
        _id: dummyReferrerId,
        name: 'Amit',
      };
      (User.findOne as any).mockResolvedValue(null);
      (User.findByIdAndUpdate as any).mockResolvedValue(true);

      const code = await getOrCreateReferralCode(userWithoutCode);
      expect(code).toMatch(/^AMIT\d{3}$/);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        dummyReferrerId,
        expect.objectContaining({ referralCode: code })
      );
    });
  });

  describe('2. Referral Registration & Anti-Abuse Controls', () => {
    it('successfully creates pending referral when valid code is provided', async () => {
      (User.findOne as any).mockResolvedValue({
        _id: dummyReferrerId,
        referralCode: dummyReferralCode,
      });
      (Referral.findOne as any).mockResolvedValue(null);
      (Referral.countDocuments as any).mockResolvedValue(5);
      (Referral.create as any).mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        referrerId: dummyReferrerId,
        referredId: dummyReferredId,
        referralCode: dummyReferralCode,
        status: 'PENDING',
      });

      const res = await processReferralRegistration(
        dummyReferredId.toString(),
        dummyReferralCode,
        '192.168.1.1'
      );

      expect(res.success).toBe(true);
      expect(Referral.create).toHaveBeenCalledWith(
        expect.objectContaining({
          referrerId: dummyReferrerId,
          referredId: dummyReferredId,
          referralCode: dummyReferralCode,
          status: 'PENDING',
          referrerReward: 50,
          referredReward: 50,
        })
      );
    });

    it('strictly prevents self-referrals', async () => {
      (User.findOne as any).mockResolvedValue({
        _id: dummyReferrerId,
        referralCode: dummyReferralCode,
      });

      const res = await processReferralRegistration(
        dummyReferrerId.toString(), // Same user!
        dummyReferralCode
      );

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Self-referral is strictly forbidden/i);
      expect(Referral.create).not.toHaveBeenCalled();
    });

    it('rejects invalid or non-existent referral codes', async () => {
      (User.findOne as any).mockResolvedValue(null);

      const res = await processReferralRegistration(dummyReferredId.toString(), 'INVALID999');

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Invalid referral code/i);
    });

    it('rejects duplicate referral if operator account was already referred', async () => {
      (User.findOne as any).mockResolvedValue({
        _id: dummyReferrerId,
        referralCode: dummyReferralCode,
      });
      (Referral.findOne as any).mockResolvedValue({ _id: new mongoose.Types.ObjectId() });

      const res = await processReferralRegistration(dummyReferredId.toString(), dummyReferralCode);

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/already been referred/i);
    });

    it('enforces maximum referrals per user limit', async () => {
      (User.findOne as any).mockResolvedValue({
        _id: dummyReferrerId,
        referralCode: dummyReferralCode,
      });
      (Referral.findOne as any).mockResolvedValue(null);
      (Referral.countDocuments as any).mockResolvedValue(100); // Max limit reached

      const res = await processReferralRegistration(dummyReferredId.toString(), dummyReferralCode);

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/maximum allowed limit of 100/i);
    });

    it('rejects referral registration when program is inactive', async () => {
      (ReferralConfig.findOne as any).mockResolvedValue({
        ...defaultMockConfig,
        isActive: false,
      });

      const res = await processReferralRegistration(dummyReferredId.toString(), dummyReferralCode);

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/currently paused/i);
    });
  });

  describe('3. First Recharge Qualification & Dual Reward Distribution', () => {
    it('does not qualify referral if recharge amount is below qualifying threshold', async () => {
      const mockReferral: any = {
        _id: new mongoose.Types.ObjectId(),
        referredId: dummyReferredId,
        status: 'PENDING',
        save: vi.fn(),
      };
      (Referral.findOne as any).mockResolvedValue(mockReferral);

      // Recharging ₹100 when threshold is ₹249
      const res = await qualifyAndRewardReferral(
        dummyReferredId.toString(),
        'order_12345',
        100
      );

      expect(res.success).toBe(true);
      expect(res.rewarded).toBe(false);
      expect(res.message).toMatch(/below qualifying threshold/i);
      expect(mockReferral.save).not.toHaveBeenCalled();
      expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it('qualifies referral and credits dual rewards on qualifying recharge (₹249+)', async () => {
      const mockReferral: any = {
        _id: new mongoose.Types.ObjectId(),
        referrerId: dummyReferrerId,
        referredId: dummyReferredId,
        referralCode: dummyReferralCode,
        status: 'PENDING',
        referrerReward: 50,
        referredReward: 50,
        save: vi.fn().mockResolvedValue(true),
      };
      (Referral.findOne as any).mockResolvedValue(mockReferral);

      const mockReferrerWallet: any = {
        balance: 150,
        promotionalBalance: 50,
        transactions: [{ amount: 50, balanceAfter: 0 }],
        save: vi.fn().mockResolvedValue(true),
      };
      const mockReferredWallet: any = {
        balance: 299,
        promotionalBalance: 50,
        transactions: [{ amount: 50, balanceAfter: 0 }],
        save: vi.fn().mockResolvedValue(true),
      };

      (Wallet.findOneAndUpdate as any)
        .mockResolvedValueOnce(mockReferrerWallet)
        .mockResolvedValueOnce(mockReferredWallet);

      const res = await qualifyAndRewardReferral(
        dummyReferredId.toString(),
        'order_qualify_999',
        249
      );

      expect(res.success).toBe(true);
      expect(res.rewarded).toBe(true);
      expect(mockReferral.status).toBe('REWARDED');
      expect(mockReferral.qualifyingPaymentId).toBe('order_qualify_999');
      expect(mockReferral.save).toHaveBeenCalled();

      // Check wallet updates for referrer & referred operator
      expect(Wallet.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: dummyReferrerId },
        expect.objectContaining({
          $inc: { balance: 50, promotionalBalance: 50, totalCredited: 50 },
        }),
        expect.anything()
      );
      expect(Wallet.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: dummyReferredId },
        expect.objectContaining({
          $inc: { balance: 50, promotionalBalance: 50, totalCredited: 50 },
        }),
        expect.anything()
      );
    });

    it('guarantees idempotency: does not reward already rewarded referral on duplicate calls', async () => {
      // Pending referral query returns null because it was already rewarded
      (Referral.findOne as any).mockResolvedValue(null);

      const res = await qualifyAndRewardReferral(
        dummyReferredId.toString(),
        'order_qualify_999',
        249
      );

      expect(res.success).toBe(true);
      expect(res.rewarded).toBe(false);
      expect(Wallet.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('4. Operator Dashboard & Name Masking', () => {
    it('masks referred operator names for privacy and computes accurate metrics', async () => {
      const mockUser: any = {
        _id: dummyReferrerId,
        name: 'Faisal Khan',
        referralCode: 'FAISAL500',
      };
      (User.findById as any).mockResolvedValue(mockUser);

      const mockReferrals = [
        {
          _id: new mongoose.Types.ObjectId(),
          referredId: { name: 'Rahul Digital Services', email: 'rahul@test.com', createdAt: new Date() },
          status: 'REWARDED',
          referrerReward: 50,
          qualifyingAmount: 249,
          createdAt: new Date(),
        },
        {
          _id: new mongoose.Types.ObjectId(),
          referredId: { name: 'Amit Kumar', email: 'amit@test.com', createdAt: new Date() },
          status: 'PENDING',
          referrerReward: 50,
          createdAt: new Date(),
        },
      ];

      (Referral.find as any).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue(mockReferrals),
          }),
        }),
      });

      (Wallet.findOne as any).mockReturnValue({
        lean: vi.fn().mockResolvedValue({ balance: 50, promotionalBalance: 50 }),
      });

      const res = await getOperatorReferralDashboardData(dummyReferrerId.toString());

      expect(res.totalReferrals).toBe(2);
      expect(res.successfulReferrals).toBe(1);
      expect(res.pendingReferrals).toBe(1);
      expect(res.totalRewardsEarned).toBe(50);
      expect(res.availableRewards).toBe(50);

      // Check name masking
      expect(res.history[0].operatorName).toBe('Rahul D***');
      expect(res.history[1].operatorName).toBe('Amit K***');
    });
  });

  describe('5. Admin Management & Status Transitions', () => {
    it('allows admin to manually approve a pending referral', async () => {
      const mockReferral: any = {
        _id: new mongoose.Types.ObjectId(),
        referrerId: dummyReferrerId,
        referralCode: dummyReferralCode,
        status: 'PENDING',
        referrerReward: 50,
        save: vi.fn().mockResolvedValue(true),
      };
      (Referral.findById as any).mockResolvedValue(mockReferral);
      (Wallet.findOneAndUpdate as any).mockResolvedValue({ balance: 100 });

      const res = await updateAdminReferralStatus(
        mockReferral._id.toString(),
        'REWARDED',
        'Verified manual order'
      );

      expect(res.success).toBe(true);
      expect(mockReferral.status).toBe('REWARDED');
      expect(Wallet.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: dummyReferrerId },
        expect.objectContaining({
          $inc: { balance: 50, promotionalBalance: 50, totalCredited: 50 },
        })
      );
    });

    it('allows admin to reverse a rewarded referral and debits referrer wallet', async () => {
      const mockReferral: any = {
        _id: new mongoose.Types.ObjectId(),
        referrerId: dummyReferrerId,
        status: 'REWARDED',
        referrerReward: 50,
        save: vi.fn().mockResolvedValue(true),
      };
      (Referral.findById as any).mockResolvedValue(mockReferral);
      (Wallet.findOneAndUpdate as any).mockResolvedValue({ balance: 50 });

      const res = await updateAdminReferralStatus(
        mockReferral._id.toString(),
        'REVERSED',
        'Customer refunded qualifying payment'
      );

      expect(res.success).toBe(true);
      expect(mockReferral.status).toBe('REVERSED');
      expect(Wallet.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: dummyReferrerId },
        expect.objectContaining({
          $inc: { balance: -50, promotionalBalance: -50, totalDebited: 50 },
        })
      );
    });
  });
});

