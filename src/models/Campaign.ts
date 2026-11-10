import mongoose, { Schema, Document, Model } from 'mongoose';

export type CampaignStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'DEPLETED';

export interface ICampaign extends Document {
  name: string;
  code: string;
  description: string;
  status: CampaignStatus;
  startDate: Date;
  endDate: Date;
  minRechargeAmount: number;
  slabAmount: number;
  bonusPerSlab: number;
  maxBonusPerOperator: number;
  totalBudget: number;
  budgetSpent: number;
  totalRedemptions: number;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'EXPIRED', 'DEPLETED'],
      default: 'ACTIVE',
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    minRechargeAmount: {
      type: Number,
      required: true,
      default: 249,
      min: 10,
    },
    slabAmount: {
      type: Number,
      required: true,
      default: 249,
      min: 10,
    },
    bonusPerSlab: {
      type: Number,
      required: true,
      default: 50,
      min: 1,
    },
    maxBonusPerOperator: {
      type: Number,
      required: true,
      default: 1000,
    },
    totalBudget: {
      type: Number,
      required: true,
      default: 100000,
    },
    budgetSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRedemptions: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

CampaignSchema.index({ status: 1, startDate: 1, endDate: 1 });

const Campaign: Model<ICampaign> =
  mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);

export default Campaign;
