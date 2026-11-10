import mongoose, { Schema, Document, Model } from 'mongoose';

export type PromoDiscountType =
  | 'FIXED_BONUS'
  | 'PERCENTAGE_BONUS'
  | 'FIXED_DISCOUNT'
  | 'FIRST_RECHARGE'
  | 'USER_SPECIFIC'
  | 'REFERRAL';

export interface IPromoCode extends Document {
  code: string;
  campaignName: string;
  description?: string;
  discountType: PromoDiscountType;
  discountValue: number;
  minimumRechargeAmount: number;
  maximumBonus?: number;
  totalRedemptionLimit?: number;
  perUserRedemptionLimit: number;
  totalBudget?: number;
  budgetSpent: number;
  totalRedeemed: number;
  applicableUsers?: mongoose.Types.ObjectId[];
  referrerId?: mongoose.Types.ObjectId;
  firstRechargeOnly: boolean;
  startsAt: Date;
  expiresAt: Date;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: [true, 'Promo code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    campaignName: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    discountType: {
      type: String,
      enum: [
        'FIXED_BONUS',
        'PERCENTAGE_BONUS',
        'FIXED_DISCOUNT',
        'FIRST_RECHARGE',
        'USER_SPECIFIC',
        'REFERRAL',
      ],
      required: true,
      default: 'FIXED_BONUS',
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount/bonus value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    minimumRechargeAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum recharge amount cannot be negative'],
    },
    maximumBonus: {
      type: Number,
      default: 0,
      min: [0, 'Maximum bonus cannot be negative'],
    },
    totalRedemptionLimit: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },
    perUserRedemptionLimit: {
      type: Number,
      default: 1,
      min: [1, 'Per user redemption limit must be at least 1'],
    },
    totalBudget: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },
    budgetSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRedeemed: {
      type: Number,
      default: 0,
      min: 0,
    },
    applicableUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    firstRechargeOnly: {
      type: Boolean,
      default: false,
    },
    startsAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful compound indexes
PromoCodeSchema.index({ isActive: 1, startsAt: 1, expiresAt: 1 });

const PromoCode: Model<IPromoCode> =
  mongoose.models.PromoCode || mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema);

export default PromoCode;

