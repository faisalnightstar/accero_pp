import mongoose, { Schema, Document, Model } from 'mongoose';

export type AuditAction =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_REGISTER'
  | 'AUTH_LOGOUT'
  | 'AUTH_PASSWORD_RESET_REQUEST'
  | 'AUTH_PASSWORD_RESET_SUCCESS'
  | 'WALLET_ORDER_CREATED'
  | 'WALLET_PAYMENT_VERIFIED'
  | 'WALLET_PAYMENT_DUPLICATE_ATTEMPT'
  | 'WALLET_DEDUCTION_RESERVED'
  | 'WALLET_DEDUCTION_FINALIZED'
  | 'WALLET_DEDUCTION_REFUNDED'
  | 'WALLET_MANUAL_UTR_SUBMITTED'
  | 'WALLET_MANUAL_UTR_APPROVED'
  | 'WALLET_MANUAL_UTR_REJECTED'
  | 'WALLET_ADMIN_CREDIT'
  | 'WALLET_ADMIN_DEBIT'
  | 'WALLET_ADMIN_REFUND'
  | 'OPERATOR_STATUS_CHANGED'
  | 'OPERATOR_NOTE_ADDED'
  | 'CAMPAIGN_CREATED'
  | 'CAMPAIGN_UPDATED'
  | 'CAMPAIGN_STATUS_CHANGED'
  | 'SERVICE_CONFIG_UPDATED'
  | 'TEAM_USER_CREATED'
  | 'TEAM_ROLE_CHANGED'
  | 'TEAM_STATUS_CHANGED'
  | 'SUPPORT_TICKET_CREATED'
  | 'SUPPORT_TICKET_ASSIGNED'
  | 'SUPPORT_TICKET_REPLIED'
  | 'SUPPORT_TICKET_INTERNAL_NOTE'
  | 'SUPPORT_TICKET_ESCALATED'
  | 'SUPPORT_TICKET_RESOLVED'
  | 'SUPPORT_TICKET_CLOSED'
  | 'DOCUMENT_CACHE_HIT'
  | 'DOCUMENT_API_FETCH_SUCCESS'
  | 'DOCUMENT_PRINT_AUTHORIZED'
  | 'SECURITY_RATE_LIMITED'
  | 'SECURITY_UNAUTHORIZED_ACCESS'
  | 'SECURITY_SANDBOX_BLOCKED'
  | 'PROMO_CODE_CREATED'
  | 'PROMO_CODE_UPDATED'
  | 'PROMO_CODE_STATUS_TOGGLED'
  | 'PROMO_CODE_DELETED'
  | 'PROMO_CODE_REDEEMED'
  | 'REFERRAL_REGISTERED'
  | 'REFERRAL_REWARD_CREDITED'
  | 'REFERRAL_WELCOME_CREDITED'
  | 'REFERRAL_STATUS_UPDATED'
  | 'REFERRAL_CONFIG_UPDATED';

export type AuditResourceType =
  | 'AUTH'
  | 'WALLET'
  | 'PAYMENT'
  | 'DOCUMENT'
  | 'SECURITY'
  | 'PRINT_JOB'
  | 'OPERATOR'
  | 'CAMPAIGN'
  | 'SERVICE'
  | 'SUPPORT_TICKET'
  | 'TEAM'
  | 'REPORT'
  | 'PROMO'
  | 'REFERRAL'
  | 'SETTINGS';

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  actorEmail?: string;
  actorRole?: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  details: Record<string, any>;
  ip?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING';
  createdAt: Date;
}

const AuditLogSchema: Schema<IAuditLog> = new Schema(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    actorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    actorRole: {
      type: String,
      trim: true,
      default: 'user',
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      enum: [
        'AUTH',
        'WALLET',
        'PAYMENT',
        'DOCUMENT',
        'SECURITY',
        'PRINT_JOB',
        'OPERATOR',
        'CAMPAIGN',
        'SERVICE',
        'SUPPORT_TICKET',
        'TEAM',
        'REPORT',
        'PROMO',
      ],
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      trim: true,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'WARNING'],
      default: 'SUCCESS',
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound indexes for audit querying and security analysis
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;

