import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPanLookupRecord extends Document {
  userId: mongoose.Types.ObjectId;
  documentRecordId?: mongoose.Types.ObjectId | null;
  docType: 'PAN';
  panNumber: string;
  documentNumberHash?: string | null;
  fullName: string | null;
  fatherName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  aadhaarNumberAvailable: boolean | null;
  providerVersion: 'v1' | 'v2';
  status: 'SUCCESS' | 'FAILED';
  serviceFee: number;
  walletTransactionRef?: string | null;
  requestTimestamp: Date;
  providerResponseRef?: string | null;
  errorMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PanLookupRecordSchema = new Schema<IPanLookupRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentRecordId: {
      type: Schema.Types.ObjectId,
      ref: 'DocumentRecord',
      default: null,
      index: true,
    },
    docType: {
      type: String,
      default: 'PAN',
      uppercase: true,
      trim: true,
    },
    panNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    documentNumberHash: {
      type: String,
      default: null,
      index: true,
    },
    fullName: {
      type: String,
      default: null,
      trim: true,
    },
    fatherName: {
      type: String,
      default: null,
      trim: true,
    },
    dateOfBirth: {
      type: String,
      default: null,
      trim: true,
    },
    gender: {
      type: String,
      default: null,
      trim: true,
    },
    aadhaarNumberAvailable: {
      type: Boolean,
      default: null,
    },
    providerVersion: {
      type: String,
      enum: ['v1', 'v2'],
      required: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      required: true,
      index: true,
    },
    serviceFee: {
      type: Number,
      required: true,
      min: 0,
    },
    walletTransactionRef: {
      type: String,
      default: null,
      trim: true,
    },
    requestTimestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    providerResponseRef: {
      type: String,
      default: null,
      trim: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user query and deduplication
PanLookupRecordSchema.index({ userId: 1, panNumber: 1, createdAt: -1 });
PanLookupRecordSchema.index({ userId: 1, documentRecordId: 1 });
PanLookupRecordSchema.index({ documentRecordId: 1 });

export const PanLookupRecord: Model<IPanLookupRecord> =
  mongoose.models.PanLookupRecord ||
  mongoose.model<IPanLookupRecord>('PanLookupRecord', PanLookupRecordSchema);

export default PanLookupRecord;
