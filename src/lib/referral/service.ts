import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Referral, { IReferral, ReferralStatus } from '@/models/Referral';
import ReferralConfig, { IReferralConfig } from '@/models/ReferralConfig';
import User, { IUser } from '@/models/User';
import Wallet from '@/models/Wallet';
import { logAuditEvent } from '@/lib/logger/audit';

/**
 * Default fallback configuration for referral system
 */
const DEFAULT_CONFIG = {
  rewardPerReferral: 50,
  firstRechargeThreshold: 249,
  welcomeRewardReferred: 50,
  maxReferralsPerUser: 100,
  isActive: true,
  terms:
    'Referral bonus is credited to your wallet once the referred operator completes their first qualifying recharge of ₹249 or more. Non-withdrawable promotional credit valid for official card verification and printing.',
};

/**
 * Retrieve or initialize global referral configuration
 */
export async function getReferralConfig(): Promise<IReferralConfig> {
  await connectToDatabase();
  let config = await ReferralConfig.findOne();
  if (!config) {
    config = await ReferralConfig.create(DEFAULT_CONFIG);
  }
  return config;
}

/**
 * Generates a clean, unique, memorable referral code (e.g., FAISAL500 or AMIT824)
 */
export async function generateUniqueReferralCode(name: string): Promise<string> {
  await connectToDatabase();
  const cleanName = (name || 'OPERATOR')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 6);
  const base = cleanName.length >= 3 ? cleanName : 'ACCR';

  for (let attempt = 0; attempt < 10; attempt++) {
    const randomDigits = Math.floor(100 + Math.random() * 900); // 3-digit number (100-999)
    const code = `${base}${randomDigits}`;
    const exists = await User.findOne({ referralCode: code });
    if (!exists) {
      return code;
    }
  }

  // Fallback with random alphanumeric suffix
  return `${base}${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

/**
 * Ensures user has an assigned referral code
 */
export async function getOrCreateReferralCode(user: IUser | { _id: any; name: string; referralCode?: string }): Promise<string> {
  if (user.referralCode && user.referralCode.trim().length > 0) {
    return user.referralCode.toUpperCase();
  }

  await connectToDatabase();
  const newCode = await generateUniqueReferralCode(user.name);
  await User.findByIdAndUpdate(user._id, { referralCode: newCode });
  return newCode;
}

/**
 * Links a newly registered operator to a referrer using their referral code.
 * Enforces anti-abuse: self-referral prevention, duplicate accounts, referral limits.
 */
export async function processReferralRegistration(
  newUserId: string,
  rawReferralCode: string,
  ip?: string
): Promise<{ success: boolean; referralId?: string; error?: string }> {
  try {
    const code = rawReferralCode?.trim().toUpperCase();
    if (!code) {
      return { success: false, error: 'No referral code provided.' };
    }

    await connectToDatabase();

    const config = await getReferralConfig();
    if (!config.isActive) {
      return { success: false, error: 'Referral program is currently paused.' };
    }

    // 1. Locate referrer
    const referrer = await User.findOne({ referralCode: code });
    if (!referrer) {
      return { success: false, error: 'Invalid referral code.' };
    }

    // 2. Prevent self-referral
    if (referrer._id.toString() === newUserId) {
      return { success: false, error: 'Self-referral is strictly forbidden.' };
    }

    // 3. Check if new user was already referred
    const existingReferral = await Referral.findOne({ referredId: new mongoose.Types.ObjectId(newUserId) });
    if (existingReferral) {
      return { success: false, error: 'This operator account has already been referred.' };
    }

    // 4. Check referrer limit
    const successfulReferralsCount = await Referral.countDocuments({
      referrerId: referrer._id,
      status: { $in: ['PENDING', 'QUALIFIED', 'REWARDED'] },
    });

    if (successfulReferralsCount >= config.maxReferralsPerUser) {
      return {
        success: false,
        error: `Referrer has reached the maximum allowed limit of ${config.maxReferralsPerUser} referrals.`,
      };
    }

    // 5. Create pending referral record
    const referral = await Referral.create({
      referrerId: referrer._id,
      referredId: new mongoose.Types.ObjectId(newUserId),
      referralCode: code,
      status: 'PENDING',
      referrerReward: config.rewardPerReferral,
      referredReward: config.welcomeRewardReferred,
      registrationIp: ip,
    });

    // 6. Update referredBy on the new user
    await User.findByIdAndUpdate(newUserId, {
      referredBy: code,
    });

    await logAuditEvent({
      actorId: new mongoose.Types.ObjectId(newUserId),
      action: 'REFERRAL_REGISTERED',
      resourceType: 'REFERRAL',
      resourceId: referral._id.toString(),
      details: {
        referrerId: referrer._id.toString(),
        referralCode: code,
        referrerReward: config.rewardPerReferral,
        referredReward: config.welcomeRewardReferred,
      },
      status: 'SUCCESS',
    });

    return { success: true, referralId: referral._id.toString() };
  } catch (error: any) {
    console.error('[ReferralService] Registration error:', error);
    return { success: false, error: error.message || 'Failed to process referral registration.' };
  }
}

/**
 * Checks and qualifies referral reward upon successful first qualifying recharge.
 * Atomically credits promotional bonus to Referrer and Referred Operator.
 */
export async function qualifyAndRewardReferral(
  referredUserId: string,
  paymentId: string,
  rechargeAmount: number
): Promise<{ success: boolean; rewarded: boolean; message?: string }> {
  try {
    await connectToDatabase();

    const config = await getReferralConfig();
    if (!config.isActive) {
      return { success: true, rewarded: false, message: 'Referral program inactive.' };
    }

    // Find pending referral
    const referral = await Referral.findOne({
      referredId: new mongoose.Types.ObjectId(referredUserId),
      status: 'PENDING',
    });

    if (!referral) {
      return { success: true, rewarded: false, message: 'No pending referral found.' };
    }

    // Check minimum qualifying recharge amount
    if (rechargeAmount < config.firstRechargeThreshold) {
      return {
        success: true,
        rewarded: false,
        message: `Recharge amount ₹${rechargeAmount} is below qualifying threshold of ₹${config.firstRechargeThreshold}.`,
      };
    }

    // Verify idempotency: ensure this payment hasn't already rewarded this referral
    if (referral.qualifyingPaymentId === paymentId && referral.status === 'REWARDED') {
      return { success: true, rewarded: false, message: 'Payment already rewarded this referral.' };
    }

    // Mark referral as REWARDED
    referral.status = 'REWARDED';
    referral.qualifyingPaymentId = paymentId;
    referral.qualifyingAmount = rechargeAmount;
    referral.qualificationDate = new Date();
    referral.rewardedDate = new Date();
    await referral.save();

    // 1. Credit Referrer Wallet
    const referrerReward = referral.referrerReward || config.rewardPerReferral;
    if (referrerReward > 0) {
      const referrerWallet = await Wallet.findOneAndUpdate(
        { userId: referral.referrerId },
        {
          $inc: {
            balance: referrerReward,
            promotionalBalance: referrerReward,
            totalCredited: referrerReward,
          },
          $push: {
            transactions: {
              amount: referrerReward,
              type: 'credit',
              category: 'REFERRAL_REWARD',
              docType: 'TOPUP',
              referenceId: `REF-${paymentId}`,
              description: `Referral Reward for qualifying recharge (${referral.referralCode})`,
              balanceAfter: 0,
              isPromotional: true,
              createdAt: new Date(),
            },
          },
        },
        { new: true, upsert: true }
      );

      if (referrerWallet && referrerWallet.transactions.length > 0) {
        referrerWallet.transactions[referrerWallet.transactions.length - 1].balanceAfter =
          referrerWallet.balance;
        await referrerWallet.save();
      }

      await logAuditEvent({
        actorId: referral.referrerId,
        action: 'REFERRAL_REWARD_CREDITED',
        resourceType: 'WALLET',
        resourceId: `REF-${paymentId}`,
        details: {
          rewardAmount: referrerReward,
          referredUserId,
          paymentId,
        },
        status: 'SUCCESS',
      });
    }

    // 2. Credit Referred Operator Welcome Bonus if configured
    const welcomeReward = referral.referredReward || config.welcomeRewardReferred;
    if (welcomeReward > 0) {
      const referredWallet = await Wallet.findOneAndUpdate(
        { userId: referral.referredId },
        {
          $inc: {
            balance: welcomeReward,
            promotionalBalance: welcomeReward,
            totalCredited: welcomeReward,
          },
          $push: {
            transactions: {
              amount: welcomeReward,
              type: 'credit',
              category: 'REFERRAL_REWARD',
              docType: 'TOPUP',
              referenceId: `REF-WELCOME-${paymentId}`,
              description: `Welcome Bonus from Referral Program (${referral.referralCode})`,
              balanceAfter: 0,
              isPromotional: true,
              createdAt: new Date(),
            },
          },
        },
        { new: true, upsert: true }
      );

      if (referredWallet && referredWallet.transactions.length > 0) {
        referredWallet.transactions[referredWallet.transactions.length - 1].balanceAfter =
          referredWallet.balance;
        await referredWallet.save();
      }

      await logAuditEvent({
        actorId: referral.referredId,
        action: 'REFERRAL_WELCOME_CREDITED',
        resourceType: 'WALLET',
        resourceId: `REF-WELCOME-${paymentId}`,
        details: {
          rewardAmount: welcomeReward,
          referralCode: referral.referralCode,
          paymentId,
        },
        status: 'SUCCESS',
      });
    }

    return {
      success: true,
      rewarded: true,
      message: `Referral qualified! Credited ₹${referrerReward} to referrer and ₹${welcomeReward} to referred operator.`,
    };
  } catch (error: any) {
    console.error('[ReferralService] qualifyAndRewardReferral error:', error);
    return { success: false, rewarded: false, message: error.message };
  }
}

/**
 * Mask operator name/business name for privacy in user-facing tables
 * e.g., "Rahul Verma" -> "Rahul V***"
 */
function maskOperatorName(name: string): string {
  if (!name) return 'Operator';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].length > 3 ? `${parts[0].slice(0, 3)}***` : parts[0];
  }
  return `${parts[0]} ${parts[1][0]}***`;
}

export interface OperatorReferralDashboardData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalRewardsEarned: number;
  availableRewards: number;
  totalRewardsRedeemed: number;
  config: {
    rewardPerReferral: number;
    firstRechargeThreshold: number;
    welcomeRewardReferred: number;
    maxReferralsPerUser: number;
    terms: string;
  };
  history: Array<{
    id: string;
    operatorName: string;
    registrationDate: string;
    firstRechargeStatus: string;
    reward: number;
    status: ReferralStatus;
  }>;
}

/**
 * Fetch full dashboard data for a logged-in operator
 */
export async function getOperatorReferralDashboardData(
  userId: string,
  originUrl = 'https://printportal.accero.app'
): Promise<OperatorReferralDashboardData> {
  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  const referralCode = await getOrCreateReferralCode(user);
  const config = await getReferralConfig();

  const [referrals, wallet] = await Promise.all([
    Referral.find({ referrerId: new mongoose.Types.ObjectId(userId) })
      .populate('referredId', 'name email phone createdAt')
      .sort({ createdAt: -1 })
      .lean(),
    Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean(),
  ]);

  const totalReferrals = referrals.length;
  let successfulReferrals = 0;
  let pendingReferrals = 0;
  let totalRewardsEarned = 0;

  const history = referrals.map((ref: any) => {
    const isRewarded = ref.status === 'REWARDED';
    if (isRewarded) {
      successfulReferrals += 1;
      totalRewardsEarned += ref.referrerReward || config.rewardPerReferral;
    } else if (ref.status === 'PENDING' || ref.status === 'QUALIFIED') {
      pendingReferrals += 1;
    }

    const referredUser = ref.referredId as any;
    const operatorName = maskOperatorName(referredUser?.name || 'Operator');
    const firstRechargeStatus = isRewarded
      ? `Completed (₹${ref.qualifyingAmount || config.firstRechargeThreshold})`
      : ref.status === 'QUALIFIED'
      ? 'Qualified (Processing)'
      : 'Pending';

    return {
      id: ref._id.toString(),
      operatorName,
      registrationDate: ref.createdAt ? new Date(ref.createdAt).toISOString() : '',
      firstRechargeStatus,
      reward: ref.referrerReward || config.rewardPerReferral,
      status: ref.status as ReferralStatus,
    };
  });

  const availableRewards = wallet ? wallet.promotionalBalance || 0 : 0;
  const totalRewardsRedeemed = Math.max(0, totalRewardsEarned - availableRewards);
  const referralLink = `${originUrl}/register?ref=${encodeURIComponent(referralCode)}`;

  return {
    referralCode,
    referralLink,
    totalReferrals,
    successfulReferrals,
    pendingReferrals,
    totalRewardsEarned,
    availableRewards,
    totalRewardsRedeemed,
    config: {
      rewardPerReferral: config.rewardPerReferral,
      firstRechargeThreshold: config.firstRechargeThreshold,
      welcomeRewardReferred: config.welcomeRewardReferred,
      maxReferralsPerUser: config.maxReferralsPerUser,
      terms: config.terms,
    },
    history,
  };
}

/**
 * Admin: Get paginated list of all platform referrals with search and status filter
 */
export async function getAdminReferralsList(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  await connectToDatabase();

  const query: any = {};
  if (params?.status && params.status !== 'all') {
    query.status = params.status.toUpperCase();
  }

  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 20);
  const skip = (page - 1) * limit;

  let baseQuery = Referral.find(query)
    .populate('referrerId', 'name email phone referralCode')
    .populate('referredId', 'name email phone createdAt')
    .sort({ createdAt: -1 });

  const [allReferrals, total] = await Promise.all([
    baseQuery.skip(skip).limit(limit).lean(),
    Referral.countDocuments(query),
  ]);

  let results = allReferrals.map((r: any) => ({
    id: r._id.toString(),
    referralCode: r.referralCode,
    status: r.status,
    referrer: {
      id: r.referrerId?._id?.toString() || '',
      name: r.referrerId?.name || 'Unknown',
      email: r.referrerId?.email || '',
      phone: r.referrerId?.phone || '',
      referralCode: r.referrerId?.referralCode || r.referralCode,
    },
    referred: {
      id: r.referredId?._id?.toString() || '',
      name: r.referredId?.name || 'Unknown',
      email: r.referredId?.email || '',
      phone: r.referredId?.phone || '',
      registrationDate: r.referredId?.createdAt ? new Date(r.referredId.createdAt).toISOString() : '',
    },
    qualifyingPaymentId: r.qualifyingPaymentId || '',
    qualifyingAmount: r.qualifyingAmount || 0,
    referrerReward: r.referrerReward || 50,
    referredReward: r.referredReward || 50,
    rejectionReason: r.rejectionReason || '',
    notes: r.notes || '',
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : '',
    rewardedDate: r.rewardedDate ? new Date(r.rewardedDate).toISOString() : '',
  }));

  if (params?.search?.trim()) {
    const s = params.search.trim().toLowerCase();
    results = results.filter(
      (item) =>
        item.referralCode.toLowerCase().includes(s) ||
        item.referrer.name.toLowerCase().includes(s) ||
        item.referrer.email.toLowerCase().includes(s) ||
        item.referred.name.toLowerCase().includes(s) ||
        item.referred.email.toLowerCase().includes(s)
    );
  }

  return {
    success: true,
    referrals: results,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Admin: Update referral status (Approve, Reject, or Reverse)
 */
export async function updateAdminReferralStatus(
  referralId: string,
  newStatus: 'REWARDED' | 'REJECTED' | 'REVERSED',
  reason?: string,
  adminId?: string
) {
  await connectToDatabase();

  const referral = await Referral.findById(referralId);
  if (!referral) {
    throw new Error('Referral record not found.');
  }

  const previousStatus = referral.status;
  referral.status = newStatus;
  if (reason) {
    referral.rejectionReason = reason;
  }

  if (newStatus === 'REWARDED') {
    referral.rewardedDate = new Date();
    // Credit Referrer
    await Wallet.findOneAndUpdate(
      { userId: referral.referrerId },
      {
        $inc: {
          balance: referral.referrerReward,
          promotionalBalance: referral.referrerReward,
          totalCredited: referral.referrerReward,
        },
        $push: {
          transactions: {
            amount: referral.referrerReward,
            type: 'credit',
            category: 'REFERRAL_REWARD',
            docType: 'TOPUP',
            referenceId: `REF-ADMIN-${referral._id}`,
            description: `Manual Referral Reward Approval (${referral.referralCode})`,
            balanceAfter: 0,
            isPromotional: true,
            createdAt: new Date(),
          },
        },
      }
    );
  } else if (newStatus === 'REVERSED' && previousStatus === 'REWARDED') {
    // Reverse reward from referrer wallet
    await Wallet.findOneAndUpdate(
      { userId: referral.referrerId },
      {
        $inc: {
          balance: -referral.referrerReward,
          promotionalBalance: -referral.referrerReward,
          totalDebited: referral.referrerReward,
        },
        $push: {
          transactions: {
            amount: referral.referrerReward,
            type: 'debit',
            category: 'PROMO_REVERSAL',
            docType: 'TOPUP',
            referenceId: `REV-${referral._id}`,
            description: `Referral Reward Reversal: ${reason || 'Administrative action'}`,
            balanceAfter: 0,
            isPromotional: true,
            createdAt: new Date(),
          },
        },
      }
    );
  }

  await referral.save();

  await logAuditEvent({
    actorId: adminId ? new mongoose.Types.ObjectId(adminId) : undefined,
    action: 'REFERRAL_STATUS_UPDATED',
    resourceType: 'REFERRAL',
    resourceId: referral._id.toString(),
    details: {
      previousStatus,
      newStatus,
      reason,
    },
    status: 'SUCCESS',
  });

  return { success: true, message: `Referral status updated to ${newStatus}.` };
}

/**
 * Admin: Update Referral Program Global Configuration
 */
export async function updateAdminReferralConfig(
  updates: Partial<IReferralConfig>,
  adminId?: string
) {
  await connectToDatabase();

  const config = await getReferralConfig();
  if (updates.rewardPerReferral !== undefined) config.rewardPerReferral = updates.rewardPerReferral;
  if (updates.firstRechargeThreshold !== undefined)
    config.firstRechargeThreshold = updates.firstRechargeThreshold;
  if (updates.welcomeRewardReferred !== undefined)
    config.welcomeRewardReferred = updates.welcomeRewardReferred;
  if (updates.maxReferralsPerUser !== undefined)
    config.maxReferralsPerUser = updates.maxReferralsPerUser;
  if (updates.isActive !== undefined) config.isActive = updates.isActive;
  if (updates.terms !== undefined) config.terms = updates.terms;
  if (adminId) config.updatedBy = new mongoose.Types.ObjectId(adminId);

  await config.save();

  await logAuditEvent({
    actorId: adminId ? new mongoose.Types.ObjectId(adminId) : undefined,
    action: 'REFERRAL_CONFIG_UPDATED',
    resourceType: 'SETTINGS',
    resourceId: config._id.toString(),
    details: updates,
    status: 'SUCCESS',
  });

  return { success: true, config };
}

/**
 * Admin: Referral Analytics & Metrics
 */
export async function getAdminReferralAnalytics() {
  await connectToDatabase();

  const [
    totalReferrals,
    rewardedReferrals,
    pendingReferrals,
    rejectedReferrals,
    allRewarded,
  ] = await Promise.all([
    Referral.countDocuments({}),
    Referral.countDocuments({ status: 'REWARDED' }),
    Referral.countDocuments({ status: { $in: ['PENDING', 'QUALIFIED'] } }),
    Referral.countDocuments({ status: { $in: ['REJECTED', 'REVERSED'] } }),
    Referral.find({ status: 'REWARDED' }).select('referrerReward qualifyingAmount').lean(),
  ]);

  let totalRewardsPaid = 0;
  let totalAttributedRevenue = 0;

  allRewarded.forEach((r: any) => {
    totalRewardsPaid += r.referrerReward || 50;
    totalAttributedRevenue += r.qualifyingAmount || 0;
  });

  const conversionRate =
    totalReferrals > 0 ? Math.round((rewardedReferrals / totalReferrals) * 100) : 0;

  return {
    totalReferrals,
    rewardedReferrals,
    pendingReferrals,
    rejectedReferrals,
    totalRewardsPaid,
    totalAttributedRevenue,
    conversionRate,
  };
}

