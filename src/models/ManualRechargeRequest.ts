import mongoose, { Schema, Document, Model } from 'mongoose';

export type ManualRechargeStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IManualRechargeRequest extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  utrNumber: string;
  status: ManualRechargeStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ManualRechargeRequestSchema: Schema<IManualRechargeRequest> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [10, 'Minimum recharge amount is ₹10'],
      max: [50000, 'Maximum recharge amount is ₹50,000'],
    },
    utrNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

ManualRechargeRequestSchema.index({ userId: 1, status: 1 });
ManualRechargeRequestSchema.index({ createdAt: -1 });

export const ManualRechargeRequest: Model<IManualRechargeRequest> =
  mongoose.models.ManualRechargeRequest ||
  mongoose.model<IManualRechargeRequest>('ManualRechargeRequest', ManualRechargeRequestSchema);

export default ManualRechargeRequest;

