import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'EXPIRED'
  | 'REFUNDED'
  // Legacy lowercase for backward compatibility
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired';

export interface IPayment extends Document {
  paymentId: string;
  orderId: string;
  userId: mongoose.Types.ObjectId;
  amount: number;
  upiId: string;
  paytmMid: string;
  accountIndex: number;
  status: PaymentStatus;
  upiUrl: string;
  bankTxnId?: string;
  gatewayResponse?: any;
  promoCode?: string;
  promoCodeId?: mongoose.Types.ObjectId;
  bonusAmount?: number;
  discountAmount?: number;
  processingStartedAt?: Date;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    orderId: {
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
    amount: {
      type: Number,
      required: true,
      min: [10, 'Minimum payment amount is ₹10'],
      max: [50000, 'Maximum payment amount is ₹50,000'],
    },
    upiId: {
      type: String,
      required: true,
      trim: true,
    },
    paytmMid: {
      type: String,
      required: true,
      trim: true,
    },
    accountIndex: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: [
        'CREATED',
        'PENDING',
        'PROCESSING',
        'PAID',
        'FAILED',
        'EXPIRED',
        'REFUNDED',
        'pending',
        'paid',
        'failed',
        'expired',
      ],
      default: 'PENDING',
      index: true,
    },
    upiUrl: {
      type: String,
      required: true,
    },
    bankTxnId: {
      type: String,
      trim: true,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
    },
    promoCode: {
      type: String,
      uppercase: true,
      trim: true,
    },
    promoCodeId: {
      type: Schema.Types.ObjectId,
      ref: 'PromoCode',
    },
    bonusAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    processingStartedAt: {
      type: Date,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ userId: 1, createdAt: -1 });

// Prevent model recompilation in Next.js hot reload
const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
