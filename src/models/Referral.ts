import mongoose, { Schema, Document, Model } from 'mongoose';

export type ReferralStatus =
  | 'PENDING'
  | 'QUALIFIED'
  | 'REWARDED'
  | 'REJECTED'
  | 'REVERSED';

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  referredId: mongoose.Types.ObjectId;
  referralCode: string;
  status: ReferralStatus;
  qualifyingPaymentId?: string;
  qualifyingAmount?: number;
  referrerReward: number;
  referredReward: number;
  qualificationDate?: Date;
  rewardedDate?: Date;
  rejectionReason?: string;
  notes?: string;
  registrationIp?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referredId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Prevents multiple referrals for the same user
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'QUALIFIED', 'REWARDED', 'REJECTED', 'REVERSED'],
      default: 'PENDING',
      index: true,
    },
    qualifyingPaymentId: {
      type: String,
      trim: true,
      index: true,
    },
    qualifyingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    referrerReward: {
      type: Number,
      default: 50,
      min: 0,
    },
    referredReward: {
      type: Number,
      default: 50,
      min: 0,
    },
    qualificationDate: {
      type: Date,
    },
    rewardedDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    registrationIp: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

ReferralSchema.index({ referrerId: 1, status: 1 });
ReferralSchema.index({ referrerId: 1, createdAt: -1 });

export const Referral: Model<IReferral> =
  mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);

export default Referral;

