import mongoose, { Schema, Document, Model } from 'mongoose';

export type PromoRedemptionStatus = 'APPLIED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface IPromoRedemption extends Document {
  promoCodeId: mongoose.Types.ObjectId;
  code: string;
  operatorId: mongoose.Types.ObjectId;
  paymentId: string;
  rechargeAmount: number;
  bonusAmount: number;
  discountAmount?: number;
  status: PromoRedemptionStatus;
  redeemedAt: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PromoRedemptionSchema = new Schema<IPromoRedemption>(
  {
    promoCodeId: {
      type: Schema.Types.ObjectId,
      ref: 'PromoCode',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    operatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true, // Critical: Enforces strictly 1 redemption per payment order
      index: true,
      trim: true,
    },
    rechargeAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    bonusAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['APPLIED', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'APPLIED',
      index: true,
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user redemption limits & analytics
PromoRedemptionSchema.index({ promoCodeId: 1, operatorId: 1, status: 1 });
PromoRedemptionSchema.index({ operatorId: 1, createdAt: -1 });

const PromoRedemption: Model<IPromoRedemption> =
  mongoose.models.PromoRedemption ||
  mongoose.model<IPromoRedemption>('PromoRedemption', PromoRedemptionSchema);

export default PromoRedemption;

