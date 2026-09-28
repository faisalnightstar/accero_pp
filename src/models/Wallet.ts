import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWalletTransaction {
  _id?: mongoose.Types.ObjectId;
  amount: number;
  type: 'credit' | 'debit';
  docType?: 'PAN' | 'AADHAAR' | 'VOTER' | 'DL' | 'RC' | 'TOPUP' | 'MANUAL';
  referenceId?: string;
  description: string;
  balanceAfter: number;
  createdAt: Date;
}

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  totalCredited: number;
  totalDebited: number;
  transactions: IWalletTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    docType: {
      type: String,
      enum: ['PAN', 'AADHAAR', 'VOTER', 'DL', 'RC', 'TOPUP', 'MANUAL'],
    },
    referenceId: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const WalletSchema: Schema<IWallet> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Wallet balance cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    totalCredited: {
      type: Number,
      default: 0,
    },
    totalDebited: {
      type: Number,
      default: 0,
    },
    transactions: [WalletTransactionSchema],
  },
  {
    timestamps: true,
  }
);

export const Wallet: Model<IWallet> =
  mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);

export default Wallet;
