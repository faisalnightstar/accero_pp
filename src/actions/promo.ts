'use server';

import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import PromoCode, { IPromoCode, PromoDiscountType } from '@/models/PromoCode';
import PromoRedemption from '@/models/PromoRedemption';
import User from '@/models/User';
import Payment from '@/models/Payment';
import { getSession } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';
import { validatePromoCode, PromoValidationResult } from '@/lib/promo/service';
import { logAuditEvent } from '@/lib/logger/audit';

export interface PromoCodeInput {
  code: string;
  campaignName: string;
  description?: string;
  discountType: PromoDiscountType;
  discountValue: number;
  minimumRechargeAmount?: number;
  maximumBonus?: number;
  totalRedemptionLimit?: number;
  perUserRedemptionLimit?: number;
  totalBudget?: number;
  applicableUsers?: string[]; // IDs or emails
  referrerId?: string;
  firstRechargeOnly?: boolean;
  startsAt: string;
  expiresAt: string;
  isActive?: boolean;
}

/**
 * Customer Action: Validate promo code and get benefit preview for a recharge amount
 */
export async function validatePromoCodeAction(
  code: string,
  amount: number
): Promise<PromoValidationResult> {
  const session = await getSession();
  if (!session?.userId) {
    return { valid: false, error: 'Please sign in to apply a promo code.' };
  }

  return await validatePromoCode(code, session.userId, amount);
}

/**
 * Admin Action: List all promo codes with optional search & filter
 */
export async function getAdminPromoCodesAction(params?: {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  page?: number;
  limit?: number;
}) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    throw new Error('Forbidden: Admin access required.');
  }

  await connectToDatabase();

  const query: any = {};
  if (params?.status === 'active') {
    query.isActive = true;
  } else if (params?.status === 'inactive') {
    query.isActive = false;
  }

  if (params?.search?.trim()) {
    const s = params.search.trim();
    query.$or = [
      { code: { $regex: s, $options: 'i' } },
      { campaignName: { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
    ];
  }

  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 20);
  const skip = (page - 1) * limit;

  const [codes, total] = await Promise.all([
    PromoCode.find(query)
      .populate('createdBy', 'name email')
      .populate('applicableUsers', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PromoCode.countDocuments(query),
  ]);

  return {
    success: true,
    promoCodes: codes.map((c: any) => ({
      id: c._id.toString(),
      code: c.code,
      campaignName: c.campaignName,
      description: c.description || '',
      discountType: c.discountType,
      discountValue: c.discountValue,
      minimumRechargeAmount: c.minimumRechargeAmount || 0,
      maximumBonus: c.maximumBonus || 0,
      totalRedemptionLimit: c.totalRedemptionLimit || 0,
      perUserRedemptionLimit: c.perUserRedemptionLimit || 1,
      totalBudget: c.totalBudget || 0,
      budgetSpent: c.budgetSpent || 0,
      totalRedeemed: c.totalRedeemed || 0,
      applicableUsers: (c.applicableUsers || []).map((u: any) => ({
        id: u._id?.toString() || u.toString(),
        name: u.name || '',
        email: u.email || '',
      })),
      firstRechargeOnly: !!c.firstRechargeOnly,
      startsAt: c.startsAt ? new Date(c.startsAt).toISOString() : '',
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString() : '',
      isActive: c.isActive,
      createdByName: c.createdBy?.name || 'Administrator',
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : '',
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Admin Action: Create new promo code
 */
export async function createPromoCodeAction(data: PromoCodeInput) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { success: false, error: 'Forbidden: Admin access required.' };
  }

  try {
    if (!data.code?.trim()) {
      return { success: false, error: 'Promo code is required.' };
    }
    if (!data.campaignName?.trim()) {
      return { success: false, error: 'Campaign name is required.' };
    }
    if (typeof data.discountValue !== 'number' || data.discountValue < 0) {
      return { success: false, error: 'Valid discount value is required.' };
    }

    await connectToDatabase();

    const cleanCode = data.code.trim().toUpperCase();

    // Check duplicate code
    const existing = await PromoCode.findOne({ code: cleanCode });
    if (existing) {
      return { success: false, error: `Promo code "${cleanCode}" already exists.` };
    }

    // Resolve applicable users (can be emails or ObjectIds)
    let applicableUserIds: mongoose.Types.ObjectId[] = [];
    if (data.applicableUsers && data.applicableUsers.length > 0) {
      for (const entry of data.applicableUsers) {
        const trimmed = entry.trim();
        if (!trimmed) continue;
        if (mongoose.Types.ObjectId.isValid(trimmed)) {
          applicableUserIds.push(new mongoose.Types.ObjectId(trimmed));
        } else if (trimmed.includes('@')) {
          const foundUser = await User.findOne({ email: trimmed.toLowerCase() });
          if (foundUser) {
            applicableUserIds.push(foundUser._id);
          }
        }
      }
    }

    const promo = await PromoCode.create({
      code: cleanCode,
      campaignName: data.campaignName.trim(),
      description: data.description?.trim() || '',
      discountType: data.discountType,
      discountValue: data.discountValue,
      minimumRechargeAmount: Number(data.minimumRechargeAmount) || 0,
      maximumBonus: Number(data.maximumBonus) || 0,
      totalRedemptionLimit: Number(data.totalRedemptionLimit) || 0,
      perUserRedemptionLimit: Math.max(1, Number(data.perUserRedemptionLimit) || 1),
      totalBudget: Number(data.totalBudget) || 0,
      budgetSpent: 0,
      totalRedeemed: 0,
      applicableUsers: applicableUserIds,
      referrerId: data.referrerId && mongoose.Types.ObjectId.isValid(data.referrerId)
        ? new mongoose.Types.ObjectId(data.referrerId)
        : undefined,
      firstRechargeOnly: !!data.firstRechargeOnly,
      startsAt: new Date(data.startsAt),
      expiresAt: new Date(data.expiresAt),
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdBy: new mongoose.Types.ObjectId(session.userId),
    });

    await logAuditEvent({
      actorId: session.userId,
      action: 'PROMO_CODE_CREATED',
      resourceType: 'CAMPAIGN',
      resourceId: promo.code,
      details: { campaignName: promo.campaignName, discountType: promo.discountType },
      status: 'SUCCESS',
    });

    return { success: true, promoCodeId: promo._id.toString() };
  } catch (err: any) {
    console.error('[PromoAction] Error creating promo code:', err);
    return { success: false, error: err.message || 'Failed to create promo code.' };
  }
}

/**
 * Admin Action: Update existing promo code
 */
export async function updatePromoCodeAction(id: string, data: Partial<PromoCodeInput>) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { success: false, error: 'Forbidden: Admin access required.' };
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: 'Invalid promo code ID.' };
    }

    await connectToDatabase();

    const promo = await PromoCode.findById(id);
    if (!promo) {
      return { success: false, error: 'Promo code not found.' };
    }

    if (data.campaignName !== undefined) promo.campaignName = data.campaignName.trim();
    if (data.description !== undefined) promo.description = data.description.trim();
    if (data.discountType !== undefined) promo.discountType = data.discountType;
    if (data.discountValue !== undefined) promo.discountValue = Number(data.discountValue);
    if (data.minimumRechargeAmount !== undefined)
      promo.minimumRechargeAmount = Number(data.minimumRechargeAmount);
    if (data.maximumBonus !== undefined) promo.maximumBonus = Number(data.maximumBonus);
    if (data.totalRedemptionLimit !== undefined)
      promo.totalRedemptionLimit = Number(data.totalRedemptionLimit);
    if (data.perUserRedemptionLimit !== undefined)
      promo.perUserRedemptionLimit = Math.max(1, Number(data.perUserRedemptionLimit));
    if (data.totalBudget !== undefined) promo.totalBudget = Number(data.totalBudget);
    if (data.firstRechargeOnly !== undefined) promo.firstRechargeOnly = !!data.firstRechargeOnly;
    if (data.startsAt !== undefined) promo.startsAt = new Date(data.startsAt);
    if (data.expiresAt !== undefined) promo.expiresAt = new Date(data.expiresAt);
    if (data.isActive !== undefined) promo.isActive = !!data.isActive;

    if (data.applicableUsers !== undefined) {
      const applicableUserIds: mongoose.Types.ObjectId[] = [];
      for (const entry of data.applicableUsers) {
        const trimmed = entry.trim();
        if (!trimmed) continue;
        if (mongoose.Types.ObjectId.isValid(trimmed)) {
          applicableUserIds.push(new mongoose.Types.ObjectId(trimmed));
        } else if (trimmed.includes('@')) {
          const foundUser = await User.findOne({ email: trimmed.toLowerCase() });
          if (foundUser) {
            applicableUserIds.push(foundUser._id);
          }
        }
      }
      promo.applicableUsers = applicableUserIds;
    }

    await promo.save();

    await logAuditEvent({
      actorId: session.userId,
      action: 'PROMO_CODE_UPDATED',
      resourceType: 'CAMPAIGN',
      resourceId: promo.code,
      details: { id },
      status: 'SUCCESS',
    });

    return { success: true };
  } catch (err: any) {
    console.error('[PromoAction] Error updating promo code:', err);
    return { success: false, error: err.message || 'Failed to update promo code.' };
  }
}

/**
 * Admin Action: Toggle active / inactive status
 */
export async function togglePromoCodeStatusAction(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { success: false, error: 'Forbidden: Admin access required.' };
  }

  try {
    await connectToDatabase();
    const updated = await PromoCode.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    if (!updated) {
      return { success: false, error: 'Promo code not found.' };
    }

    await logAuditEvent({
      actorId: session.userId,
      action: 'PROMO_CODE_STATUS_TOGGLED',
      resourceType: 'CAMPAIGN',
      resourceId: updated.code,
      details: { isActive },
      status: 'SUCCESS',
    });

    return { success: true, isActive: updated.isActive };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to toggle status.' };
  }
}

/**
 * Admin Action: Delete unused promo code.
 * Fails if code has any recorded redemptions to protect financial audit trails.
 */
export async function deletePromoCodeAction(id: string) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return { success: false, error: 'Forbidden: Admin access required.' };
  }

  try {
    await connectToDatabase();
    const promo = await PromoCode.findById(id);
    if (!promo) {
      return { success: false, error: 'Promo code not found.' };
    }

    // Check if code has been redeemed
    if (promo.totalRedeemed > 0) {
      return {
        success: false,
        error: `Cannot delete promo code "${promo.code}" because it has already been redeemed ${promo.totalRedeemed} times. Deactivate it instead.`,
      };
    }

    const redemptionCount = await PromoRedemption.countDocuments({ promoCodeId: promo._id });
    if (redemptionCount > 0) {
      return {
        success: false,
        error: `Cannot delete promo code "${promo.code}" because redemptions exist in the database. Deactivate it instead.`,
      };
    }

    await PromoCode.findByIdAndDelete(id);

    await logAuditEvent({
      actorId: session.userId,
      action: 'PROMO_CODE_DELETED',
      resourceType: 'CAMPAIGN',
      resourceId: promo.code,
      details: { id },
      status: 'SUCCESS',
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete promo code.' };
  }
}

/**
 * Admin Action: View redemption history
 */
export async function getPromoRedemptionsAction(params?: {
  promoCodeId?: string;
  page?: number;
  limit?: number;
}) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    throw new Error('Forbidden: Admin access required.');
  }

  await connectToDatabase();

  const query: any = {};
  if (params?.promoCodeId && mongoose.Types.ObjectId.isValid(params.promoCodeId)) {
    query.promoCodeId = new mongoose.Types.ObjectId(params.promoCodeId);
  }

  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 20);
  const skip = (page - 1) * limit;

  const [redemptions, total] = await Promise.all([
    PromoRedemption.find(query)
      .populate('operatorId', 'name email phone')
      .populate('promoCodeId', 'code campaignName discountType')
      .sort({ redeemedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PromoRedemption.countDocuments(query),
  ]);

  return {
    success: true,
    redemptions: redemptions.map((r: any) => ({
      id: r._id.toString(),
      code: r.code,
      campaignName: r.promoCodeId?.campaignName || 'Campaign',
      operatorName: r.operatorId?.name || 'Operator',
      operatorEmail: r.operatorId?.email || '',
      operatorPhone: r.operatorId?.phone || '',
      paymentId: r.paymentId,
      rechargeAmount: r.rechargeAmount,
      bonusAmount: r.bonusAmount,
      discountAmount: r.discountAmount || 0,
      status: r.status,
      redeemedAt: r.redeemedAt ? new Date(r.redeemedAt).toISOString() : '',
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Admin Action: Campaign Analytics Summary
 */
export async function getPromoAnalyticsAction() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    throw new Error('Forbidden: Admin access required.');
  }

  await connectToDatabase();

  const [
    totalPromoCodes,
    activePromoCodes,
    completedRedemptions,
    totalAppliedCount,
    distinctOperators,
  ] = await Promise.all([
    PromoCode.countDocuments({}),
    PromoCode.countDocuments({ isActive: true }),
    PromoRedemption.find({ status: 'COMPLETED' }).lean(),
    PromoRedemption.countDocuments({}),
    PromoRedemption.distinct('operatorId', { status: 'COMPLETED' }),
  ]);

  let totalExpenditure = 0;
  let totalAttributedRevenue = 0;
  const operatorRedemptionCounts: Record<string, number> = {};

  completedRedemptions.forEach((r) => {
    totalExpenditure += r.bonusAmount || 0;
    totalAttributedRevenue += r.rechargeAmount || 0;
    const opId = r.operatorId.toString();
    operatorRedemptionCounts[opId] = (operatorRedemptionCounts[opId] || 0) + 1;
  });

  const repeatOperatorsCount = Object.values(operatorRedemptionCounts).filter(
    (c) => c >= 2
  ).length;

  const repeatRechargeRate =
    distinctOperators.length > 0
      ? Math.round((repeatOperatorsCount / distinctOperators.length) * 100)
      : 0;

  const conversionRate =
    totalAppliedCount > 0
      ? Math.round((completedRedemptions.length / totalAppliedCount) * 100)
      : 0;

  return {
    success: true,
    analytics: {
      totalPromoCodes,
      activePromoCodes,
      totalRedemptions: completedRedemptions.length,
      totalPromotionalExpenditure: totalExpenditure,
      totalAttributedRevenue,
      newOperatorsAcquired: distinctOperators.length,
      repeatRechargeRate,
      conversionRate,
    },
  };
}

