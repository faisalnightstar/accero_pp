import mongoose, { Schema, Document, Model } from 'mongoose';

export type DocumentType = 'PAN' | 'AADHAAR' | 'VOTER' | 'DL' | 'RC';
export type InputMode = 'API' | 'MANUAL';

export interface IDocumentRecord extends Document {
  userId?: mongoose.Types.ObjectId;
  docType: DocumentType;
  cardIdentifier: string;
  inputMode: InputMode;
  data: Record<string, any>;
  missingFields: string[];
  isComplete: boolean;
  frontImage?: string;
  backImage?: string;
  printCount: number;
  lastPrintedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentRecordSchema: Schema<IDocumentRecord> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    docType: {
      type: String,
      enum: ['PAN', 'AADHAAR', 'VOTER', 'DL', 'RC'],
      required: true,
      index: true,
    },
    cardIdentifier: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    inputMode: {
      type: String,
      enum: ['API', 'MANUAL'],
      default: 'API',
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    missingFields: {
      type: [String],
      default: [],
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    frontImage: {
      type: String,
    },
    backImage: {
      type: String,
    },
    printCount: {
      type: Number,
      default: 0,
    },
    lastPrintedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast user lookup
DocumentRecordSchema.index({ userId: 1, docType: 1, cardIdentifier: 1 });

export const DocumentRecord: Model<IDocumentRecord> =
  mongoose.models.DocumentRecord ||
  mongoose.model<IDocumentRecord>('DocumentRecord', DocumentRecordSchema);

export default DocumentRecord;
