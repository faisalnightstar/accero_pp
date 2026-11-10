import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'support_manager'
  | 'support_agent'
  | 'operator'
  | 'customer'
  | 'user';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  walletId?: mongoose.Types.ObjectId;
  status: 'active' | 'suspended';
  notes?: string;
  suspendedReason?: string;
  lastLoginAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: [
        'super_admin',
        'admin',
        'support_manager',
        'support_agent',
        'operator',
        'customer',
        'user',
      ],
      default: 'user',
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    notes: {
      type: String,
      default: '',
    },
    suspendedReason: {
      type: String,
      default: '',
    },
    lastLoginAt: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
