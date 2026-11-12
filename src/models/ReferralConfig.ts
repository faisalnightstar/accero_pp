import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferralConfig extends Document {
  rewardPerReferral: number;
  firstRechargeThreshold: number;
  welcomeRewardReferred: number;
  maxReferralsPerUser: number;
  isActive: boolean;
  terms: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralConfigSchema = new Schema<IReferralConfig>(
  {
    rewardPerReferral: {
      type: Number,
      required: true,
      default: 50,
      min: [0, 'Reward cannot be negative'],
    },
    firstRechargeThreshold: {
      type: Number,
      required: true,
      default: 249,
      min: [10, 'Minimum first recharge threshold is ₹10'],
    },
    welcomeRewardReferred: {
      type: Number,
      required: true,
      default: 50,
      min: [0, 'Welcome reward cannot be negative'],
    },
    maxReferralsPerUser: {
      type: Number,
      required: true,
      default: 100,
      min: [1, 'Must allow at least 1 referral'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    terms: {
      type: String,
      default:
        'Referral bonus is credited to your wallet once the referred operator completes their first qualifying recharge of ₹249 or more. Non-withdrawable promotional credit valid for official card verification and printing.',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const ReferralConfig: Model<IReferralConfig> =
  mongoose.models.ReferralConfig ||
  mongoose.model<IReferralConfig>('ReferralConfig', ReferralConfigSchema);

export default ReferralConfig;

