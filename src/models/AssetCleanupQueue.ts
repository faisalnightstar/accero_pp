import mongoose, { Schema, Document, Model } from 'mongoose';

export type CleanupStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'SKIPPED_REFERENCED';

export interface IAssetCleanupQueue extends Document {
  userId?: mongoose.Types.ObjectId;
  documentId?: mongoose.Types.ObjectId;
  publicId: string;
  assetId?: string;
  docType?: string;
  resourceType: 'image' | 'raw' | 'video';
  deliveryType: 'upload' | 'authenticated';
  status: CleanupStatus;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  nextAttemptAt?: Date;
  lastError?: string;
  deletionResult?: string;
  reason?: string;
  replacementPublicId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssetCleanupQueueSchema: Schema<IAssetCleanupQueue> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'DocumentRecord',
      index: true,
    },
    publicId: {
      type: String,
      required: true,
      index: true,
    },
    assetId: {
      type: String,
    },
    docType: {
      type: String,
    },
    resourceType: {
      type: String,
      enum: ['image', 'raw', 'video'],
      default: 'image',
    },
    deliveryType: {
      type: String,
      enum: ['upload', 'authenticated'],
      default: 'authenticated',
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED_REFERENCED'],
      default: 'PENDING',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    lastAttemptAt: {
      type: Date,
    },
    nextAttemptAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastError: {
      type: String,
    },
    deletionResult: {
      type: String,
    },
    reason: {
      type: String,
      default: 'REPLACED_BY_NEW_ASSET',
    },
    replacementPublicId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient retry processing
AssetCleanupQueueSchema.index({ status: 1, nextAttemptAt: 1, attempts: 1 });

const AssetCleanupQueue: Model<IAssetCleanupQueue> =
  mongoose.models.AssetCleanupQueue ||
  mongoose.model<IAssetCleanupQueue>('AssetCleanupQueue', AssetCleanupQueueSchema);

export default AssetCleanupQueue;
