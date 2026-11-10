import mongoose, { Schema, Document, Model } from 'mongoose';

export type TicketCategory =
  | 'Account/Login Issue'
  | 'Wallet Recharge Issue'
  | 'Payment Pending'
  | 'Wallet Balance Discrepancy'
  | 'Document Lookup Failure'
  | 'Printing Issue'
  | 'Reprint Issue'
  | 'Pricing Query'
  | 'Promotional Bonus Issue'
  | 'Technical Issue'
  | 'Other';

export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_OPERATOR'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED';

export interface ISupportMessage {
  _id?: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: string;
  message: string;
  attachments?: string[];
  isInternal: boolean;
  createdAt: Date;
}

export interface ISupportInternalNote {
  _id?: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  authorRole: string;
  note: string;
  createdAt: Date;
}

export interface ITicketTransition {
  action: string;
  performedBy: mongoose.Types.ObjectId;
  performerName: string;
  details: string;
  timestamp: Date;
}

export interface ISupportTicket extends Document {
  ticketId: string;
  operatorId: mongoose.Types.ObjectId;
  operatorName: string;
  operatorEmail: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgentId?: mongoose.Types.ObjectId;
  assignedAgentName?: string;
  assignedManagerId?: mongoose.Types.ObjectId;
  description: string;
  messages: ISupportMessage[];
  internalNotes: ISupportInternalNote[];
  history: ITicketTransition[];
  resolution?: {
    resolvedBy?: mongoose.Types.ObjectId;
    resolvedByName?: string;
    resolvedAt?: Date;
    resolutionNote?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

const SupportMessageSchema = new Schema<ISupportMessage>({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  message: { type: String, required: true, trim: true },
  attachments: { type: [String], default: [] },
  isInternal: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const SupportInternalNoteSchema = new Schema<ISupportInternalNote>({
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, required: true },
  note: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const TicketTransitionSchema = new Schema<ITicketTransition>({
  action: { type: String, required: true },
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  performerName: { type: String, required: true },
  details: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    operatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    operatorName: {
      type: String,
      required: true,
      trim: true,
    },
    operatorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: [
        'Account/Login Issue',
        'Wallet Recharge Issue',
        'Payment Pending',
        'Wallet Balance Discrepancy',
        'Document Lookup Failure',
        'Printing Issue',
        'Reprint Issue',
        'Pricing Query',
        'Promotional Bonus Issue',
        'Technical Issue',
        'Other',
      ],
      default: 'Other',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'OPEN',
        'ASSIGNED',
        'IN_PROGRESS',
        'WAITING_FOR_OPERATOR',
        'ESCALATED',
        'RESOLVED',
        'CLOSED',
      ],
      default: 'OPEN',
      index: true,
    },
    assignedAgentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    assignedAgentName: {
      type: String,
      trim: true,
    },
    assignedManagerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    messages: [SupportMessageSchema],
    internalNotes: [SupportInternalNoteSchema],
    history: [TicketTransitionSchema],
    resolution: {
      resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      resolvedByName: { type: String },
      resolvedAt: { type: Date },
      resolutionNote: { type: String },
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

SupportTicketSchema.index({ createdAt: -1 });
SupportTicketSchema.index({ status: 1, priority: 1 });

const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);

export default SupportTicket;
