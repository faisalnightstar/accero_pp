import mongoose, { Schema, Document, Model } from 'mongoose';

export type PrintJobStatus = 'AUTHORIZED' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PrintFormat = 'CR80' | 'SHEET' | 'PDF';

export interface IPrintJob extends Document {
  printJobId: string;
  userId: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId;
  documentType: string;
  cardIdentifier: string;
  fee: number;
  status: PrintJobStatus;
  printFormat: PrintFormat;
  transactionId?: string;
  metadata?: Record<string, any>;
  authorizedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PrintJobSchema: Schema<IPrintJob> = new Schema(
  {
    printJobId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'DocumentRecord',
      index: true,
    },
    documentType: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    cardIdentifier: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['AUTHORIZED', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'AUTHORIZED',
      index: true,
    },
    printFormat: {
      type: String,
      enum: ['CR80', 'SHEET', 'PDF'],
      default: 'CR80',
    },
    transactionId: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    authorizedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
PrintJobSchema.index({ userId: 1, createdAt: -1 });
PrintJobSchema.index({ userId: 1, documentType: 1, cardIdentifier: 1 });

export const PrintJob: Model<IPrintJob> =
  mongoose.models.PrintJob || mongoose.model<IPrintJob>('PrintJob', PrintJobSchema);

export default PrintJob;

