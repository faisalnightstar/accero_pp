import mongoose, { Schema, Document, Model } from 'mongoose';

export type ServiceType = 'PAN' | 'AADHAAR' | 'VOTER' | 'DL' | 'RC' | 'RATION';

export interface IServiceConfig extends Document {
  serviceId: ServiceType;
  displayName: string;
  enabled: boolean;
  fee: number;
  providerPriority: string[];
  maintenanceMode: boolean;
  maintenanceNotice: string;
  retryPolicy: {
    maxRetries: number;
    timeoutMs: number;
  };
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceConfigSchema = new Schema<IServiceConfig>(
  {
    serviceId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    providerPriority: {
      type: [String],
      default: ['NEO', 'SUREPASS', 'MANUAL'],
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceNotice: {
      type: String,
      default: '',
    },
    retryPolicy: {
      maxRetries: { type: Number, default: 2 },
      timeoutMs: { type: Number, default: 8000 },
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const ServiceConfig: Model<IServiceConfig> =
  mongoose.models.ServiceConfig ||
  mongoose.model<IServiceConfig>('ServiceConfig', ServiceConfigSchema);

export default ServiceConfig;
