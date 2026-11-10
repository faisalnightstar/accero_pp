'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import {
  assertRole,
  isSupportStaff,
  isSupportManager,
  maskPhone,
  maskEmail,
} from '@/lib/rbac';
import SupportTicket, {
  ISupportTicket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '@/models/SupportTicket';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Payment from '@/models/Payment';
import DocumentRecord from '@/models/DocumentRecord';
import { logAuditEvent } from '@/lib/logger/audit';
import mongoose from 'mongoose';

/**
 * 3.1 Support Overview Metrics
 */
export async function getSupportOverviewMetrics() {
  const session = await getSession();
  assertRole(
    session,
    ['super_admin', 'admin', 'support_manager', 'support_agent'],
    'view support metrics'
  );
  await connectToDatabase();

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    totalOpen,
    newTickets,
    assignedTickets,
    inProgressTickets,
    escalatedTickets,
    waitingOperatorTickets,
    resolvedTickets,
    closedTickets,
    overdueTickets,
  ] = await Promise.all([
    SupportTicket.countDocuments({ status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED'] } }),
    SupportTicket.countDocuments({ status: 'OPEN' }),
    SupportTicket.countDocuments({ status: 'ASSIGNED' }),
    SupportTicket.countDocuments({ status: 'IN_PROGRESS' }),
    SupportTicket.countDocuments({ status: 'ESCALATED' }),
    SupportTicket.countDocuments({ status: 'WAITING_FOR_OPERATOR' }),
    SupportTicket.countDocuments({ status: 'RESOLVED' }),
    SupportTicket.countDocuments({ status: 'CLOSED' }),
    SupportTicket.countDocuments({
      status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED'] },
      createdAt: { $lt: twentyFourHoursAgo },
    }),
  ]);

  // Agent Workload Distribution
  const workloadAgg = await SupportTicket.aggregate([
    { $match: { status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'ESCALATED'] }, assignedAgentId: { $ne: null } } },
    { $group: { _id: '$assignedAgentName', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Category Breakdown
  const categoryAgg = await SupportTicket.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return {
    tickets: {
      totalOpen,
      new: newTickets,
      assigned: assignedTickets,
      inProgress: inProgressTickets,
      escalated: escalatedTickets,
      waitingOperator: waitingOperatorTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
      overdue: overdueTickets,
    },
    workload: workloadAgg.map((w) => ({ agent: w._id || 'Unassigned', count: w.count })),
    categories: categoryAgg.map((c) => ({ category: c._id || 'General', count: c.count })),
  };
}

/**
 * 3.2 Support Tickets Query with Search & Filters
 */
export async function getSupportTickets(params: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  assignedToMe?: boolean;
}) {
  const session = await getSession();
  assertRole(
    session,
    ['super_admin', 'admin', 'support_manager', 'support_agent'],
    'view support tickets'
  );
  await connectToDatabase();

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const query: Record<string, any> = {};

  if (params.status && params.status !== 'all') {
    query.status = params.status;
  }
  if (params.priority && params.priority !== 'all') {
    query.priority = params.priority;
  }
  if (params.category && params.category !== 'all') {
    query.category = params.category;
  }
  if (params.assignedToMe && session) {
    query.assignedAgentId = new mongoose.Types.ObjectId(session.userId);
  }
  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    query.$or = [
      { ticketId: { $regex: s, $options: 'i' } },
      { subject: { $regex: s, $options: 'i' } },
      { operatorName: { $regex: s, $options: 'i' } },
      { operatorEmail: { $regex: s, $options: 'i' } },
    ];
  }

  const [tickets, total] = await Promise.all([
    SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SupportTicket.countDocuments(query),
  ]);

  return {
    tickets: tickets.map((t: any) => ({
      id: t._id.toString(),
      ticketId: t.ticketId,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      operatorName: t.operatorName,
      operatorEmail: maskEmail(t.operatorEmail),
      assignedAgentName: t.assignedAgentName || 'Unassigned',
      messageCount: (t.messages || []).length,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * 3.2 Support Ticket Detail View
 */
export async function getSupportTicketDetail(ticketId: string) {
  const session = await getSession();
  assertRole(
    session,
    ['super_admin', 'admin', 'support_manager', 'support_agent'],
    'view support ticket details'
  );
  await connectToDatabase();

  const ticket = await SupportTicket.findOne({
    $or: [
      { ticketId },
      ...(mongoose.Types.ObjectId.isValid(ticketId) ? [{ _id: new mongoose.Types.ObjectId(ticketId) }] : []),
    ],
  }).lean();

  if (!ticket) {
    throw new Error('Support ticket not found');
  }

  return {
    id: (ticket._id as any).toString(),
    ticketId: ticket.ticketId,
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    operatorId: ticket.operatorId.toString(),
    operatorName: ticket.operatorName,
    operatorEmail: maskEmail(ticket.operatorEmail),
    assignedAgentId: ticket.assignedAgentId?.toString(),
    assignedAgentName: ticket.assignedAgentName || 'Unassigned',
    description: ticket.description,
    messages: (ticket.messages || []).map((m: any) => ({
      id: m._id.toString(),
      senderName: m.senderName,
      senderRole: m.senderRole,
      message: m.message,
      isInternal: m.isInternal,
      createdAt: m.createdAt,
    })),
    internalNotes: (ticket.internalNotes || []).map((n: any) => ({
      id: n._id.toString(),
      authorName: n.authorName,
      authorRole: n.authorRole,
      note: n.note,
      createdAt: n.createdAt,
    })),
    history: (ticket.history || []).map((h: any) => ({
      action: h.action,
      performerName: h.performerName,
      details: h.details,
      timestamp: h.timestamp,
    })),
    resolution: ticket.resolution,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  };
}

/**
 * 3.2 Create Support Ticket
 */
export async function createSupportTicket(data: {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  operatorId?: string;
  operatorEmail?: string;
}) {
  const session = await getSession();
  if (!session) throw new Error('Authentication required to create support ticket');
  await connectToDatabase();

  let operatorUser = null;
  if (data.operatorId) {
    operatorUser = await User.findById(data.operatorId);
  } else if (data.operatorEmail) {
    operatorUser = await User.findOne({ email: data.operatorEmail.toLowerCase().trim() });
  } else {
    operatorUser = await User.findById(session.userId);
  }

  if (!operatorUser) {
    throw new Error('Operator account could not be resolved for ticket creation.');
  }

  const ticketId = `TCK-${Date.now().toString().slice(-6)}`;

  const newTicket = await SupportTicket.create({
    ticketId,
    operatorId: operatorUser._id,
    operatorName: operatorUser.name,
    operatorEmail: operatorUser.email,
    subject: data.subject.trim(),
    category: data.category,
    priority: data.priority || 'NORMAL',
    status: 'OPEN',
    description: data.description.trim(),
    messages: [
      {
        senderId: session.userId,
        senderName: session.name,
        senderRole: session.role,
        message: data.description.trim(),
        isInternal: false,
        createdAt: new Date(),
      },
    ],
    history: [
      {
        action: 'TICKET_CREATED',
        performedBy: session.userId,
        performerName: session.name,
        details: `Ticket created with priority ${data.priority}`,
        timestamp: new Date(),
      },
    ],
  });

  await logAuditEvent({
    actorId: session.userId,
    actorEmail: session.email,
    actorRole: session.role,
    action: 'SUPPORT_TICKET_CREATED',
    resourceType: 'SUPPORT_TICKET',
    resourceId: ticketId,
    details: { subject: data.subject, category: data.category, priority: data.priority },
    status: 'SUCCESS',
  });

  return { success: true, ticketId };
}

/**
 * 3.2 Add Reply or Internal Note to Ticket
 */
export async function addTicketMessage(ticketId: string, message: string, isInternal: boolean = false) {
  const session = await getSession();
  assertRole(
    session,
    ['super_admin', 'admin', 'support_manager', 'support_agent'],
    'add ticket message'
  );
  await connectToDatabase();

  const ticket = await SupportTicket.findOne({ ticketId });
  if (!ticket) throw new Error('Ticket not found');

  if (isInternal) {
    ticket.internalNotes.push({
      authorId: new mongoose.Types.ObjectId(session!.userId),
      authorName: session!.name,
      authorRole: session!.role,
      note: message.trim(),
      createdAt: new Date(),
    });
  } else {
    ticket.messages.push({
      senderId: new mongoose.Types.ObjectId(session!.userId),
      senderName: session!.name,
      senderRole: session!.role,
      message: message.trim(),
      isInternal: false,
      createdAt: new Date(),
    });
    // Update status to WAITING_FOR_OPERATOR if agent replies
    if (ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED') {
      ticket.status = 'WAITING_FOR_OPERATOR';
    }
  }

  ticket.history.push({
    action: isInternal ? 'INTERNAL_NOTE_ADDED' : 'OPERATOR_REPLY_SENT',
    performedBy: new mongoose.Types.ObjectId(session!.userId),
    performerName: session!.name,
    details: isInternal ? 'Added confidential internal note' : 'Sent reply to operator',
    timestamp: new Date(),
  });

  await ticket.save();

  await logAuditEvent({
    actorId: session!.userId,
    actorEmail: session!.email,
    actorRole: session!.role,
    action: isInternal ? 'SUPPORT_TICKET_INTERNAL_NOTE' : 'SUPPORT_TICKET_REPLIED',
    resourceType: 'SUPPORT_TICKET',
    resourceId: ticketId,
    details: { isInternal },
    status: 'SUCCESS',
  });

  return { success: true };
}

/**
 * 3.2 Assign Ticket to Staff Agent
 */
export async function assignSupportTicket(ticketId: string, agentId: string) {
  const session = await getSession();
  assertRole(
    session,
    ['super_admin', 'admin', 'support_manager'],
    'assign support ticket'
  );
  await connectToDatabase();

  const [ticket, agent] = await Promise.all([
    SupportTicket.findOne({ ticketId }),
    User.findById(agentId),
  ]);

  if (!ticket) throw new Error('Ticket not found');
  if (!agent) throw new Error('Target agent not found');

  ticket.assignedAgentId = agent._id as any;
  ticket.assignedAgentName = agent.name;
  if (ticket.status === 'OPEN') {
    ticket.status = 'ASSIGNED';
  }

  ticket.history.push({
    action: 'TICKET_ASSIGNED',
    performedBy: new mongoose.Types.ObjectId(session!.userId),
    performerName: session!.name,
    details: `Assigned to ${agent.name}`,
    timestamp: new Date(),
  });

  await ticket.save();

  await logAuditEvent({
    actorId: session!.userId,
    actorEmail: session!.email,
    actorRole: session!.role,
    action: 'SUPPORT_TICKET_ASSIGNED',
    resourceType: 'SUPPORT_TICKET',
    resourceId: ticketId,
    details: { assignedTo: agent.name },
    status: 'SUCCESS',
  });

  return { success: true, assignedTo: agent.name };
}

/**
 * 3.2 Escalate Ticket to Support Manager
 */
export async function escalateSupportTicket(ticketId: string, reason: string) {
  const session = await getSession();
  assertRole(
    session,
    ['super_admin', 'admin', 'support_manager', 'support_agent'],
    'escalate ticket'
  );
  await connectToDatabase();

  const ticket = await SupportTicket.findOne({ ticketId });
  if (!ticket) throw new Error('Ticket not found');

  ticket.status = 'ESCALATED';
  ticket.priority = 'URGENT';
  ticket.history.push({
    action: 'TICKET_ESCALATED',
    performedBy: new mongoose.Types.ObjectId(session!.userId),
    performerName: session!.name,
    details: `Escalated: ${reason.trim()}`,
    timestamp: new Date(),
  });

  await ticket.save();

  await logAuditEvent({
    actorId: session!.userId,
    actorEmail: session!.email,
    actorRole: session!.role,
    action: 'SUPPORT_TICKET_ESCALATED',
    resourceType: 'SUPPORT_TICKET',
    resourceId: ticketId,
    details: { reason: reason.trim() },
    status: 'SUCCESS',
  });

  return { success: true };
}

/**
 * 3.2 Resolve Ticket with Resolution Note
 */
export async function resolveSupportTicket(ticketId: string, resolutionNote: string) {
  const session = await getSession();
  assertRole(
    session,
    ['super_admin', 'admin', 'support_manager', 'support_agent'],
    'resolve ticket'
  );
  await connectToDatabase();

  const ticket = await SupportTicket.findOne({ ticketId });
  if (!ticket) throw new Error('Ticket not found');

  ticket.status = 'RESOLVED';
  ticket.resolution = {
    resolvedBy: new mongoose.Types.ObjectId(session!.userId),
    resolvedByName: session!.name,
    resolvedAt: new Date(),
    resolutionNote: resolutionNote.trim(),
  };

  ticket.history.push({
    action: 'TICKET_RESOLVED',
    performedBy: new mongoose.Types.ObjectId(session!.userId),
    performerName: session!.name,
    details: `Resolved: ${resolutionNote.trim()}`,
    timestamp: new Date(),
  });

  await ticket.save();

  await logAuditEvent({
    actorId: session!.userId,
    actorEmail: session!.email,
    actorRole: session!.role,
    action: 'SUPPORT_TICKET_RESOLVED',
    resourceType: 'SUPPORT_TICKET',
    resourceId: ticketId,
    details: { resolutionNote: resolutionNote.trim() },
    status: 'SUCCESS',
  });

  return { success: true };
}

/**
 * 3.3 Operator Support Profile: Search with Data Minimization & PII Masking
 * STRICT PRIVACY REQUIREMENT:
 * NEVER exposes citizen identity documents (Aadhaar, PAN, Voter, DL, RC), photos, or auth credentials.
 */
export async function searchSupportOperators(query: string) {
  const session = await getSession();
  assertRole(
    session,
    ['super_admin', 'admin', 'support_manager', 'support_agent'],
    'search operator profiles'
  );
  if (!query || query.trim().length < 2) return [];
  await connectToDatabase();

  const s = query.trim();
  const searchFilter: Record<string, any> = {
    role: { $in: ['user', 'operator', 'customer'] },
    $or: [
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
    ],
  };

  const operators = await User.find(searchFilter).select('name email phone status createdAt').limit(10).lean();

  return operators.map((o: any) => ({
    id: o._id.toString(),
    name: o.name,
    maskedEmail: maskEmail(o.email),
    maskedPhone: maskPhone(o.phone),
    status: o.status,
    createdAt: o.createdAt,
  }));
}

/**
 * 3.3 Operator Support Profile Detail
 * Returns ONLY operational support data. Zero citizen document details.
 */
export async function getOperatorSupportProfile(operatorId: string) {
  const session = await getSession();
  assertRole(
    session,
    ['super_admin', 'admin', 'support_manager', 'support_agent'],
    'view operator support profile'
  );
  await connectToDatabase();

  const user = await User.findById(operatorId).select('name email phone status createdAt').lean();
  if (!user) throw new Error('Operator account not found');

  const [wallet, payments, tickets] = await Promise.all([
    Wallet.findOne({ userId: operatorId }).select('balance totalCredited totalDebited transactions').lean(),
    Payment.find({ userId: operatorId })
      .select('orderId paymentId amount status upiId bankTxnId createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    SupportTicket.find({ operatorId })
      .select('ticketId subject category priority status createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  // Sanitize ledger: Provide references and amounts, omit citizen data
  const sanitizedTransactions = (wallet?.transactions || [])
    .slice(-10)
    .reverse()
    .map((t) => ({
      amount: t.amount,
      type: t.type,
      category: t.category,
      referenceId: t.referenceId,
      description: t.description,
      createdAt: t.createdAt,
    }));

  return {
    operator: {
      id: (user._id as any).toString(),
      name: user.name,
      maskedEmail: maskEmail(user.email),
      maskedPhone: maskPhone(user.phone),
      status: user.status,
      createdAt: user.createdAt,
    },
    walletSummary: {
      balance: wallet ? wallet.balance : 0,
      totalCredited: wallet ? wallet.totalCredited : 0,
      totalDebited: wallet ? wallet.totalDebited : 0,
      recentTransactions: sanitizedTransactions,
    },
    recentPayments: payments.map((p) => ({
      orderId: p.orderId,
      paymentId: p.paymentId,
      amount: p.amount,
      status: p.status,
      bankTxnId: p.bankTxnId || 'N/A',
      createdAt: p.createdAt,
    })),
    existingTickets: tickets.map((t) => ({
      ticketId: t.ticketId,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      createdAt: t.createdAt,
    })),
  };
}
