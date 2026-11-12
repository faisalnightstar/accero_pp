import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import PromoCode, { IPromoCode, PromoDiscountType } from '@/models/PromoCode';
import PromoRedemption, { IPromoRedemption } from '@/models/PromoRedemption';
import Payment from '@/models/Payment';
import Wallet from '@/models/Wallet';
import Campaign from '@/models/Campaign';
import { logAuditEvent } from '@/lib/logger/audit';

export interface PromoCalculation {
  rechargeAmount: number;
  bonusAmount: number;
  discountAmount: number;
  payableAmount: number;
  totalCredit: number;
}

export interface PromoValidationResult {
  valid: boolean;
  error?: string;
  promoCode?: {
    id: string;
    code: string;
    campaignName: string;
    description?: string;
    discountType: PromoDiscountType;
    discountValue: number;
    minimumRechargeAmount: number;
    maximumBonus?: number;
    expiresAt: string;
  };
  calculation?: PromoCalculation;
}

/**
 * Calculates promo bonus, discount, payable amount, and total wallet credit based on discountType.
 */
export function calculatePromoBenefit(
  promo: IPromoCode,
  rechargeAmount: number
): PromoCalculation {
  const amount = Math.max(0, rechargeAmount);
  let bonusAmount = 0;
  let discountAmount = 0;
  let payableAmount = amount;

  switch (promo.discountType) {
    case 'FIXED_BONUS': {
      // Slab-based bonus support (e.g. ₹50 per ₹249 slab unit)
      const slab =
        promo.minimumRechargeAmount && promo.minimumRechargeAmount > 0
          ? promo.minimumRechargeAmount
          : 0;
      if (slab > 0 && amount >= slab * 2) {
        const slabCount = Math.floor(amount / slab);
        bonusAmount = slabCount * promo.discountValue;
      } else {
        bonusAmount = promo.discountValue;
      }

      if (promo.maximumBonus && promo.maximumBonus > 0) {
        bonusAmount = Math.min(bonusAmount, promo.maximumBonus);
      }
      payableAmount = amount;
      break;
    }

    case 'PERCENTAGE_BONUS': {
      const calculated = (amount * promo.discountValue) / 100;
      bonusAmount = promo.maximumBonus && promo.maximumBonus > 0
        ? Math.min(calculated, promo.maximumBonus)
        : calculated;
      bonusAmount = Math.round(bonusAmount * 100) / 100;
      payableAmount = amount;
      break;
    }

    case 'FIXED_DISCOUNT': {
      // User pays less, but wallet receives full recharge credit (difference is promotional)
      discountAmount = Math.min(promo.discountValue, amount);
      payableAmount = Math.max(1, amount - discountAmount);
      bonusAmount = discountAmount;
      break;
    }

    case 'FIRST_RECHARGE':
    case 'USER_SPECIFIC':
    case 'REFERRAL':
    default: {
      bonusAmount = promo.discountValue;
      if (promo.maximumBonus && promo.maximumBonus > 0) {
        bonusAmount = Math.min(bonusAmount, promo.maximumBonus);
      }
      payableAmount = amount;
      break;
    }
  }

  const totalCredit = amount + (promo.discountType === 'FIXED_DISCOUNT' ? 0 : bonusAmount);

  return {
    rechargeAmount: amount,
    bonusAmount,
    discountAmount,
    payableAmount,
    totalCredit,
  };
}

/**
 * Server-side validation of promo code eligibility and benefit calculation.
 * Never trust client validation.
 */
export async function validatePromoCode(
  rawCode: string,
  userId: string,
  amount: number,
  excludePaymentId?: string
): Promise<PromoValidationResult> {
  try {
    if (!rawCode || typeof rawCode !== 'string') {
      return { valid: false, error: 'Please enter a promo code.' };
    }

    const cleanCode = rawCode.trim().toUpperCase();
    if (cleanCode.length < 2 || cleanCode.length > 30) {
      return { valid: false, error: 'Invalid promo code format.' };
    }

    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return { valid: false, error: 'Please specify a valid recharge amount.' };
    }

    await connectToDatabase();

    // 1. Check code exists in PromoCode
    let promo = await PromoCode.findOne({ code: cleanCode });

    // Fallback: Check Campaign model (e.g., LAUNCH_BONUS, LAUNCH50 created in admin campaigns)
    if (!promo) {
      const campaign = await Campaign.findOne({ code: cleanCode });
      if (campaign) {
        promo = await PromoCode.findOneAndUpdate(
          { code: cleanCode },
          {
            code: campaign.code,
            campaignName: campaign.name,
            description: campaign.description || '',
            discountType: 'FIXED_BONUS',
            discountValue: campaign.bonusPerSlab || 50,
            minimumRechargeAmount: campaign.minRechargeAmount || 249,
            maximumBonus: campaign.maxBonusPerOperator || 1000,
            totalBudget: campaign.totalBudget || 100000,
            budgetSpent: campaign.budgetSpent || 0,
            totalRedeemed: campaign.totalRedemptions || 0,
            totalRedemptionLimit: 10000,
            perUserRedemptionLimit: Math.max(
              1,
              Math.floor((campaign.maxBonusPerOperator || 1000) / (campaign.bonusPerSlab || 50))
            ),
            firstRechargeOnly: false,
            startsAt: campaign.startDate || new Date(),
            expiresAt: campaign.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            isActive: campaign.status === 'ACTIVE',
          },
          { upsert: true, returnDocument: 'after' }
        );
      }
    }

    // Default Seed Fallback: Ensure LAUNCH50 and LAUNCH_BONUS are always supported out of the box
    if (!promo && (cleanCode === 'LAUNCH50' || cleanCode === 'LAUNCH_BONUS')) {
      const isSlab = cleanCode === 'LAUNCH_BONUS';
      promo = await PromoCode.findOneAndUpdate(
        { code: cleanCode },
        {
          code: cleanCode,
          campaignName: isSlab ? 'Accero Launch Bonus' : 'Accero Launch Welcome Offer',
          description: isSlab
            ? 'Every ₹249 recharge slab receives ₹50 promotional credit.'
            : 'Recharge ₹249 and receive ₹50 promotional credit.',
          discountType: 'FIXED_BONUS',
          discountValue: 50,
          minimumRechargeAmount: 249,
          maximumBonus: isSlab ? 1000 : 50,
          totalBudget: 100000,
          budgetSpent: 0,
          totalRedeemed: 0,
          totalRedemptionLimit: 2000,
          perUserRedemptionLimit: isSlab ? 10 : 1,
          firstRechargeOnly: false,
          startsAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    if (!promo) {
      return { valid: false, error: 'Promo code does not exist.' };
    }

    // 2. Check active status
    if (!promo.isActive) {
      return { valid: false, error: 'This promo code is currently inactive.' };
    }

    // 3. Check campaign validity window
    const now = new Date();
    if (now < new Date(promo.startsAt)) {
      return {
        valid: false,
        error: `This promo code campaign begins on ${new Date(promo.startsAt).toLocaleDateString('en-IN')}.`,
      };
    }
    if (now > new Date(promo.expiresAt)) {
      return {
        valid: false,
        error: `This promo code expired on ${new Date(promo.expiresAt).toLocaleDateString('en-IN')}.`,
      };
    }

    // 4. Check minimum recharge amount
    if (promo.minimumRechargeAmount > 0 && amount < promo.minimumRechargeAmount) {
      return {
        valid: false,
        error: `Minimum recharge of ₹${promo.minimumRechargeAmount.toLocaleString('en-IN')} is required for code ${promo.code}.`,
      };
    }

    const userObjId = new mongoose.Types.ObjectId(userId);

    // 5. Check user eligibility (applicableUsers or USER_SPECIFIC)
    if (promo.applicableUsers && promo.applicableUsers.length > 0) {
      const isEligible = promo.applicableUsers.some(
        (id) => id.toString() === userObjId.toString()
      );
      if (!isEligible) {
        return {
          valid: false,
          error: 'Your account is not eligible for this specific promo code.',
        };
      }
    } else if (promo.discountType === 'USER_SPECIFIC') {
      return {
        valid: false,
        error: 'This promo code is restricted to designated operators only.',
      };
    }

    // 6. Check first recharge restrictions
    if (promo.firstRechargeOnly || promo.discountType === 'FIRST_RECHARGE') {
      const priorPaidCount = await Payment.countDocuments({
        userId: userObjId,
        status: { $in: ['PAID', 'paid'] },
      });

      if (priorPaidCount > 0) {
        return {
          valid: false,
          error: 'This promo code is exclusively reserved for your first successful recharge.',
        };
      }
    }

    // 7. Check per-user redemption limit
    const userRedemptionQuery: any = {
      promoCodeId: promo._id,
      operatorId: userObjId,
      status: 'COMPLETED',
    };
    if (excludePaymentId) {
      userRedemptionQuery.paymentId = { $ne: excludePaymentId };
    }

    const userRedemptions = await PromoRedemption.countDocuments(userRedemptionQuery);
    if (userRedemptions >= promo.perUserRedemptionLimit) {
      return {
        valid: false,
        error: `You have reached the maximum redemption limit (${promo.perUserRedemptionLimit}) for this code.`,
      };
    }

    // 8. Check campaign redemption limit
    if (promo.totalRedemptionLimit && promo.totalRedemptionLimit > 0) {
      if (promo.totalRedeemed >= promo.totalRedemptionLimit) {
        return {
          valid: false,
          error: 'This promo code has reached its maximum total redemptions limit.',
        };
      }
    }

    // 9. Calculate benefit
    const calculation = calculatePromoBenefit(promo, amount);

    // 10. Check campaign budget exhaustion
    if (promo.totalBudget && promo.totalBudget > 0) {
      if (promo.budgetSpent + calculation.bonusAmount > promo.totalBudget) {
        return {
          valid: false,
          error: 'Campaign promotional budget has been exhausted.',
        };
      }
    }

    return {
      valid: true,
      promoCode: {
        id: promo._id.toString(),
        code: promo.code,
        campaignName: promo.campaignName,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        minimumRechargeAmount: promo.minimumRechargeAmount,
        maximumBonus: promo.maximumBonus,
        expiresAt: promo.expiresAt.toISOString(),
      },
      calculation,
    };
  } catch (err: any) {
    console.error('[PromoService] Error validating promo code:', err);
    return {
      valid: false,
      error: err.message || 'Failed to validate promo code. Please try again.',
    };
  }
}

/**
 * Creates an APPLIED redemption record linked to an initiated payment order.
 * Ensures the promo code cannot be redeemed concurrently for the same payment.
 */
export async function createAppliedRedemption(
  promoCodeId: string | mongoose.Types.ObjectId,
  code: string,
  operatorId: string | mongoose.Types.ObjectId,
  paymentId: string,
  rechargeAmount: number,
  bonusAmount: number,
  discountAmount = 0
): Promise<IPromoRedemption | null> {
  await connectToDatabase();

  const existing = await PromoRedemption.findOne({ paymentId });
  if (existing) {
    return existing;
  }

  const redemption = await PromoRedemption.create({
    promoCodeId: new mongoose.Types.ObjectId(promoCodeId),
    code: code.trim().toUpperCase(),
    operatorId: new mongoose.Types.ObjectId(operatorId),
    paymentId: paymentId.trim(),
    rechargeAmount,
    bonusAmount,
    discountAmount,
    status: 'APPLIED',
    redeemedAt: new Date(),
  });

  return redemption;
}

/**
 * Atomically marks PromoRedemption as COMPLETED and increments campaign metrics.
 * Ensures absolute idempotency: will only execute once per payment order.
 */
export async function finalizePromoRedemption(
  paymentId: string
): Promise<{ success: boolean; bonusAmount: number; alreadyFinalized?: boolean }> {
  await connectToDatabase();

  const redemption = await PromoRedemption.findOne({ paymentId: paymentId.trim() });
  if (!redemption) {
    return { success: false, bonusAmount: 0 };
  }

  if (redemption.status === 'COMPLETED') {
    return { success: true, bonusAmount: redemption.bonusAmount, alreadyFinalized: true };
  }

  // Atomically claim COMPLETED status
  const updatedRedemption = await PromoRedemption.findOneAndUpdate(
    { _id: redemption._id, status: 'APPLIED' },
    { $set: { status: 'COMPLETED', redeemedAt: new Date() } },
    { returnDocument: 'after' }
  );

  if (!updatedRedemption) {
    // Another concurrent thread completed it
    const recheck = await PromoRedemption.findById(redemption._id);
    return {
      success: recheck?.status === 'COMPLETED',
      bonusAmount: redemption.bonusAmount,
      alreadyFinalized: true,
    };
  }

  // Increment totalRedeemed and budgetSpent in PromoCode model
  await PromoCode.findByIdAndUpdate(updatedRedemption.promoCodeId, {
    $inc: {
      totalRedeemed: 1,
      budgetSpent: updatedRedemption.bonusAmount,
    },
  });

  // Also update Campaign model if corresponding campaign exists
  await Campaign.findOneAndUpdate(
    { code: updatedRedemption.code },
    {
      $inc: {
        totalRedemptions: 1,
        budgetSpent: updatedRedemption.bonusAmount,
      },
    }
  );

  await logAuditEvent({
    actorId: updatedRedemption.operatorId.toString(),
    action: 'PROMO_CODE_REDEEMED',
    resourceType: 'PAYMENT',
    resourceId: paymentId,
    details: {
      code: updatedRedemption.code,
      bonusAmount: updatedRedemption.bonusAmount,
      rechargeAmount: updatedRedemption.rechargeAmount,
    },
    status: 'SUCCESS',
  });

  return { success: true, bonusAmount: updatedRedemption.bonusAmount };
}

/**
 * Marks PromoRedemption as FAILED if payment failed or was cancelled.
 */
export async function failPromoRedemption(
  paymentId: string,
  reason?: string
): Promise<void> {
  await connectToDatabase();

  await PromoRedemption.findOneAndUpdate(
    { paymentId: paymentId.trim(), status: 'APPLIED' },
    {
      $set: {
        status: 'FAILED',
        metadata: { failureReason: reason || 'Payment cancelled or failed' },
      },
    }
  );
}

