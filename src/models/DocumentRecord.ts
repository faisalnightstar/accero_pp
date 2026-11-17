import mongoose, { Schema, Document, Model } from 'mongoose';

export type DocumentType = 'PAN' | 'AADHAAR' | 'VOTER' | 'DL' | 'RC' | 'RATION' | 'FARMER';
export type InputMode = 'API' | 'MANUAL';

export interface ICloudinaryAssetSubdocument {
  provider: 'cloudinary';
  publicId: string;
  assetId?: string;
  secureUrl: string;
  resourceType?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  folder?: string;
  uploadedAt?: Date | string;
  accessMode?: 'public' | 'authenticated';
}

export interface IDocumentRecord extends Document {
  userId?: mongoose.Types.ObjectId;
  docType: DocumentType;
  cardIdentifier: string;
  documentNumberHash?: string;
  documentNumberEncrypted?: string;
  inputMode: InputMode;
  data: Record<string, any>;
  missingFields: string[];
  isComplete: boolean;
  frontImage?: string;
  backImage?: string;
  frontImageMetadata?: ICloudinaryAssetSubdocument;
  backImageMetadata?: ICloudinaryAssetSubdocument;
  photoMetadata?: ICloudinaryAssetSubdocument;
  signatureMetadata?: ICloudinaryAssetSubdocument;
  imageMigrationStatus?: 'UNMIGRATED' | 'MIGRATED' | 'FAILED' | 'SKIPPED';
  imageMigrationError?: string;
  imageMigratedAt?: Date;
  source?: string;
  provider?: string;
  status?: string;
  fetchedAt?: Date;
  expiresAt?: Date;
  isPaid?: boolean;
  paidAt?: Date;
  paymentReferenceId?: string;
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
      enum: ['PAN', 'AADHAAR', 'VOTER', 'DL', 'RC', 'RATION', 'FARMER'],
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
    documentNumberHash: {
      type: String,
      index: true,
    },
    documentNumberEncrypted: {
      type: String,
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
    frontImageMetadata: {
      type: Schema.Types.Mixed,
    },
    backImageMetadata: {
      type: Schema.Types.Mixed,
    },
    photoMetadata: {
      type: Schema.Types.Mixed,
    },
    signatureMetadata: {
      type: Schema.Types.Mixed,
    },
    imageMigrationStatus: {
      type: String,
      enum: ['UNMIGRATED', 'MIGRATED', 'FAILED', 'SKIPPED'],
      default: 'UNMIGRATED',
      index: true,
    },
    imageMigrationError: {
      type: String,
    },
    imageMigratedAt: {
      type: Date,
    },
    source: {
      type: String,
      default: 'API',
    },
    provider: {
      type: String,
    },
    status: {
      type: String,
      default: 'ACTIVE',
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },
    paidAt: {
      type: Date,
    },
    paymentReferenceId: {
      type: String,
      trim: true,
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

// Compound index for fast tenant-scoped lookup
DocumentRecordSchema.index({ userId: 1, docType: 1, cardIdentifier: 1 });
DocumentRecordSchema.index({ userId: 1, docType: 1, documentNumberHash: 1 });
DocumentRecordSchema.index({ userId: 1, expiresAt: 1 });

// TTL index for automatic MongoDB expiration cleanup (asynchronous background worker)
DocumentRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const DocumentRecord: Model<IDocumentRecord> =
  mongoose.models.DocumentRecord ||
  mongoose.model<IDocumentRecord>('DocumentRecord', DocumentRecordSchema);

export default DocumentRecord;
