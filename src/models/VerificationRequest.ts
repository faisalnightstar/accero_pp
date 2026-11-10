import mongoose, { Schema, Document, Model } from 'mongoose';

export type VerificationRequestStatus = 'RESERVED' | 'COMPLETED' | 'REFUNDED' | 'FAILED';

export interface IVerificationRequest extends Document {
  requestId: string;
  userId: mongoose.Types.ObjectId;
  docType: string;
  idNumber: string;
  fee: number;
  status: VerificationRequestStatus;
  provider?: string;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationRequestSchema: Schema<IVerificationRequest> = new Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    docType: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    idNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['RESERVED', 'COMPLETED', 'REFUNDED', 'FAILED'],
      default: 'RESERVED',
      index: true,
    },
    provider: {
      type: String,
      trim: true,
    },
    refundReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

VerificationRequestSchema.index({ userId: 1, createdAt: -1 });

export const VerificationRequest: Model<IVerificationRequest> =
  mongoose.models.VerificationRequest ||
  mongoose.model<IVerificationRequest>('VerificationRequest', VerificationRequestSchema);

export default VerificationRequest;

