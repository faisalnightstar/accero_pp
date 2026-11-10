import { connectToDatabase } from '@/lib/mongodb';
import Campaign, { ICampaign } from '@/models/Campaign';
import Wallet from '@/models/Wallet';
import mongoose from 'mongoose';

export interface CampaignBonusResult {
  campaignId?: string;
  campaignCode?: string;
  bonusAmount: number;
  reason?: string;
}

export interface PureCampaignRules {
  minRechargeAmount: number;
  slabAmount: number;
  bonusPerSlab: number;
  maxBonusPerOperator: number;
  totalBudget: number;
  budgetSpent: number;
}

/**
 * Pure calculation helper for determining promotional bonus credits.
 */
export function calculateCampaignBonus(
  campaign: PureCampaignRules,
  rechargeAmount: number,
  operatorPriorBonus: number = 0
): { eligible: boolean; bonusAmount: number; slabsEarned: number; reason?: string } {
  const remainingBudget = Math.max(0, campaign.totalBudget - campaign.budgetSpent);
  if (remainingBudget <= 0) {
    return { eligible: false, bonusAmount: 0, slabsEarned: 0, reason: 'Promotional campaign budget depleted' };
  }

  if (rechargeAmount < campaign.minRechargeAmount) {
    return {
      eligible: false,
      bonusAmount: 0,
      slabsEarned: 0,
      reason: `Recharge amount below minimum eligibility of ₹${campaign.minRechargeAmount}`,
    };
  }

  const slabsEarned = Math.floor(rechargeAmount / campaign.slabAmount);
  if (slabsEarned <= 0) {
    return { eligible: false, bonusAmount: 0, slabsEarned: 0, reason: 'Recharge does not meet minimum slab threshold' };
  }

  let calculatedBonus = slabsEarned * campaign.bonusPerSlab;

  const remainingOperatorCap = Math.max(
    0,
    campaign.maxBonusPerOperator - operatorPriorBonus
  );
  calculatedBonus = Math.min(calculatedBonus, remainingOperatorCap);
  calculatedBonus = Math.min(calculatedBonus, remainingBudget);

  if (calculatedBonus <= 0) {
    return {
      eligible: false,
      bonusAmount: 0,
      slabsEarned,
      reason: 'Operator maximum promotional bonus limit reached',
    };
  }

  return { eligible: true, bonusAmount: calculatedBonus, slabsEarned };
}

/**
 * Calculates promotional bonus credits for a given recharge amount.
 * Applies strict business rules:
 * 1. Checks active campaign validity (date window, budget).
 * 2. Multi-slab computation (e.g. ₹249 slab -> ₹50 bonus).
 * 3. Idempotency safeguard (never grants bonus twice for the same payment reference).
 * 4. Per-operator maximum bonus threshold.
 */
export async function calculatePromotionalBonus(
  userId: string | mongoose.Types.ObjectId,
  rechargeAmount: number,
  orderId: string
): Promise<CampaignBonusResult> {
  await connectToDatabase();

  const now = new Date();
  const activeCampaign = await Campaign.findOne({
    status: 'ACTIVE',
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  if (!activeCampaign) {
    return { bonusAmount: 0, reason: 'No active promotional campaign found' };
  }

  // Check if bonus has already been credited for this specific orderId
  const existingWallet = await Wallet.findOne({
    userId,
    'transactions.referenceId': `BONUS-${orderId}`,
  });

  if (existingWallet) {
    return {
      bonusAmount: 0,
      reason: `Promotional bonus already credited for order ${orderId}`,
    };
  }

  // Check total bonus already claimed by this operator under this campaign
  const operatorWallet = await Wallet.findOne({ userId });
  let operatorPriorBonus = 0;
  if (operatorWallet?.transactions) {
    operatorPriorBonus = operatorWallet.transactions
      .filter(
        (t) =>
          t.category === 'PROMOTIONAL_BONUS' &&
          t.description?.includes(activeCampaign.code)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  const calc = calculateCampaignBonus(activeCampaign, rechargeAmount, operatorPriorBonus);

  if (!calc.eligible || calc.bonusAmount <= 0) {
    // If depleted, mark as DEPLETED
    if (activeCampaign.totalBudget - activeCampaign.budgetSpent <= 0) {
      await Campaign.findByIdAndUpdate(activeCampaign._id, { status: 'DEPLETED' });
    }
    return { bonusAmount: 0, reason: calc.reason };
  }

  return {
    campaignId: (activeCampaign._id as any).toString(),
    campaignCode: activeCampaign.code,
    bonusAmount: calc.bonusAmount,
  };
}

/**
 * Commits the promotional bonus deduction to the campaign record
 */
export async function recordCampaignRedemption(
  campaignCode: string,
  bonusAmount: number
): Promise<void> {
  if (bonusAmount <= 0) return;

  await connectToDatabase();
  await Campaign.findOneAndUpdate(
    { code: campaignCode },
    {
      $inc: {
        budgetSpent: bonusAmount,
        totalRedemptions: 1,
      },
    }
  );
}
