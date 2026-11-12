'use server';

import { getSession } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';
import {
  getOperatorReferralDashboardData,
  getAdminReferralsList,
  updateAdminReferralStatus,
  getReferralConfig,
  updateAdminReferralConfig,
  getAdminReferralAnalytics,
} from '@/lib/referral/service';

/**
 * Customer Action: Get referral dashboard data for current operator
 */
export async function getOperatorReferralDataAction() {
  const session = await getSession();
  if (!session?.userId) {
    return { success: false, error: 'Unauthorized. Please sign in.' };
  }

  try {
    const data = await getOperatorReferralDashboardData(session.userId);
    return {
      success: true,
      data: JSON.parse(JSON.stringify(data)),
    };
  } catch (error: any) {
    console.error('[ReferralAction] getOperatorReferralDataAction error:', error);
    return { success: false, error: error.message || 'Failed to load referral data.' };
  }
}

/**
 * Admin Action: Get all platform referrals
 */
export async function getAdminReferralsAction(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    throw new Error('Forbidden: Admin access required.');
  }

  try {
    const result = await getAdminReferralsList(params);
    return JSON.parse(JSON.stringify(result));
  } catch (error: any) {
    console.error('[ReferralAction] getAdminReferralsAction error:', error);
    return { success: false, referrals: [], total: 0, error: error.message };
  }
}

/**
 * Admin Action: Update referral status (Approve, Reject, or Reverse)
 */
export async function updateAdminReferralStatusAction(
  referralId: string,
  newStatus: 'REWARDED' | 'REJECTED' | 'REVERSED',
  reason?: string
) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    throw new Error('Forbidden: Admin access required.');
  }

  try {
    const result = await updateAdminReferralStatus(referralId, newStatus, reason, session.userId);
    return result;
  } catch (error: any) {
    console.error('[ReferralAction] updateAdminReferralStatusAction error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Admin Action: Get current referral configuration
 */
export async function getAdminReferralConfigAction() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    throw new Error('Forbidden: Admin access required.');
  }

  try {
    const config = await getReferralConfig();
    return {
      success: true,
      config: {
        rewardPerReferral: config.rewardPerReferral,
        firstRechargeThreshold: config.firstRechargeThreshold,
        welcomeRewardReferred: config.welcomeRewardReferred,
        maxReferralsPerUser: config.maxReferralsPerUser,
        isActive: config.isActive,
        terms: config.terms,
      },
    };
  } catch (error: any) {
    console.error('[ReferralAction] getAdminReferralConfigAction error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin Action: Save referral configuration
 */
export async function saveAdminReferralConfigAction(updates: {
  rewardPerReferral?: number;
  firstRechargeThreshold?: number;
  welcomeRewardReferred?: number;
  maxReferralsPerUser?: number;
  isActive?: boolean;
  terms?: string;
}) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    throw new Error('Forbidden: Admin access required.');
  }

  try {
    const result = await updateAdminReferralConfig(updates, session.userId);
    return {
      success: true,
      config: {
        rewardPerReferral: result.config.rewardPerReferral,
        firstRechargeThreshold: result.config.firstRechargeThreshold,
        welcomeRewardReferred: result.config.welcomeRewardReferred,
        maxReferralsPerUser: result.config.maxReferralsPerUser,
        isActive: result.config.isActive,
        terms: result.config.terms,
      },
    };
  } catch (error: any) {
    console.error('[ReferralAction] saveAdminReferralConfigAction error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Admin Action: Get referral analytics summary
 */
export async function getAdminReferralAnalyticsAction() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    throw new Error('Forbidden: Admin access required.');
  }

  try {
    const analytics = await getAdminReferralAnalytics();
    return { success: true, analytics };
  } catch (error: any) {
    console.error('[ReferralAction] getAdminReferralAnalyticsAction error:', error);
    return { success: false, error: error.message };
  }
}

