'use server';

import { connectToDatabase } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import {
  assertRole,
  assertFinancialAdjustmentPermission,
  isSuperAdmin,
  isAdmin,
  normalizeRole,
  ROLES,
} from '@/lib/rbac';
import User, { UserRole } from '@/models/User';
import Wallet from '@/models/Wallet';
import Payment from '@/models/Payment';
import DocumentRecord from '@/models/DocumentRecord';
import ManualRechargeRequest from '@/models/ManualRechargeRequest';
import SupportTicket from '@/models/SupportTicket';
import Campaign from '@/models/Campaign';
import ServiceConfig, { ServiceType } from '@/models/ServiceConfig';
import PromoCode from '@/models/PromoCode';
import AuditLog from '@/models/AuditLog';
import { logAuditEvent } from '@/lib/logger/audit';
import { SERVICE_FEES } from '@/lib/wallet/constants';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

/**
 * 2.1 Admin Overview Metrics
 * Aggregates actual operational and business metrics directly from MongoDB.
 * Never generates mock statistics.
 */
export async function getAdminOverviewMetrics() {
  const session = await getSession();
  assertRole(session, ['super_admin', 'admin'], 'view admin overview metrics');
  await connectToDatabase();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Operator Counts
  const [totalOperators, activeOperators, suspendedOperators, newRegistrationsToday, newRegistrationsMonth] =
    await Promise.all([
      User.countDocuments({ role: { $in: ['user', 'operator', 'customer'] } }),
      User.countDocuments({ role: { $in: ['user', 'operator', 'customer'] }, status: 'active' }),
      User.countDocuments({ role: { $in: ['user', 'operator', 'customer'] }, status: 'suspended' }),
      User.countDocuments({
        role: { $in: ['user', 'operator', 'customer'] },
        createdAt: { $gte: todayStart },
      }),
      User.countDocuments({
        role: { $in: ['user', 'operator', 'customer'] },
        createdAt: { $gte: monthStart },
      }),
    ]);

  // 2. Financial Metrics: Total Wallet Liability (Sum of all wallet balances)
  const walletLiabilityAgg = await Wallet.aggregate([
    { $group: { _id: null, totalBalance: { $sum: '$balance' }, totalCredited: { $sum: '$totalCredited' }, totalDebited: { $sum: '$totalDebited' } } },
  ]);
  const totalWalletLiability = walletLiabilityAgg[0]?.totalBalance || 0;
  const totalWalletDeductions = walletLiabilityAgg[0]?.totalDebited || 0;

  // 3. Recharge & Revenue Metrics (Completed Payments)
  const [totalRevenueAgg, todayRevenueAgg, monthRevenueAgg, totalFailedPayments] = await Promise.all([
    Payment.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'PAID', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'PAID', createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.countDocuments({ status: { $in: ['FAILED', 'failed'] } }),
  ]);

  const totalRevenue = totalRevenueAgg[0]?.total || 0;
  const todayRevenue = todayRevenueAgg[0]?.total || 0;
  const monthlyRevenue = monthRevenueAgg[0]?.total || 0;

  // 4. Promotional Bonus Ledger Aggregation
  const bonusAgg = await Wallet.aggregate([
    { $unwind: '$transactions' },
    { $match: { 'transactions.category': 'PROMOTIONAL_BONUS' } },
    { $group: { _id: null, totalBonus: { $sum: '$transactions.amount' } } },
  ]);
  const totalPromotionalBonus = bonusAgg[0]?.totalBonus || 0;

  // 5. Document Lookups & Printing Activity
  const [totalLookups, totalCompleteDocs, printStatsAgg, outstandingTickets, pendingManualUtrs] =
    await Promise.all([
      DocumentRecord.countDocuments({}),
      DocumentRecord.countDocuments({ isComplete: true }),
      DocumentRecord.aggregate([
        {
          $group: {
            _id: null,
            totalPrints: { $sum: '$printCount' },
            reprints: {
              $sum: { $cond: [{ $gt: ['$printCount', 1] }, { $subtract: ['$printCount', 1] }, 0] },
            },
          },
        },
      ]),
      SupportTicket.countDocuments({ status: { $in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED'] } }),
      ManualRechargeRequest.countDocuments({ status: 'PENDING' }),
    ]);

  const totalSuccessfulPrints = printStatsAgg[0]?.totalPrints || 0;
  const totalReprints = printStatsAgg[0]?.reprints || 0;
  const failedLookups = Math.max(0, totalLookups - totalCompleteDocs);

  // 6. 7-Day Revenue & Registration Trend Data
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dailyRevenueTrend = await Payment.aggregate([
    { $match: { status: 'PAID', createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 7. Service Usage Distribution
  const serviceDistribution = await DocumentRecord.aggregate([
    { $group: { _id: '$docType', count: { $sum: 1 }, prints: { $sum: '$printCount' } } },
    { $sort: { count: -1 } },
  ]);

  return {
    operators: {
      total: totalOperators,
      active: activeOperators,
      suspended: suspendedOperators,
      newToday: newRegistrationsToday,
      newMonth: newRegistrationsMonth,
    },
    finance: {
      totalWalletLiability,
      totalRechargeVolume: totalRevenue,
      totalPromotionalBonus,
      totalWalletDeductions,
      totalRevenue,
      todayRevenue,
      monthlyRevenue,
      pendingManualUtrs,
      failedPayments: totalFailedPayments,
    },
    revenue: {
      total: totalRevenue,
      today: todayRevenue,
      thisMonth: monthlyRevenue,
      pending: pendingManualUtrs,
    },
    operations: {
      totalLookups,
      failedLookups,
      totalSuccessfulPrints,
      totalReprints,
      outstandingTickets,
    },
    trends: {
      dailyRevenue: dailyRevenueTrend.map((d) => ({
        date: String(d._id),
        revenue: Number(d.revenue) || 0,
        count: Number(d.count) || 0,
      })),
      serviceUsage: serviceDistribution.map((s) => ({
        service: String(s._id || 'OTHER'),
        lookups: Number(s.count) || 0,
        prints: Number(s.prints) || 0,
      })),
    },
    serviceUsage: serviceDistribution.map((s) => ({
      docType: String(s._id || 'OTHER'),
      count: Number(s.count) || 0,
      prints: Number(s.prints) || 0,
    })),
  };
}

/**
 * 2.2 Operator Management: List Operators with Search & Filters
 */
export async function getAdminOperators(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const session = await getSession();
  assertRole(session, ['super_admin', 'admin'], 'view operator accounts');
  await connectToDatabase();

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const query: Record<string, any> = {
    role: { $in: ['user', 'operator', 'customer'] },
  };

  if (params.status && params.status !== 'all') {
    query.status = params.status;
  }

  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
    ];
    if (mongoose.Types.ObjectId.isValid(s)) {
      query.$or.push({ _id: new mongoose.Types.ObjectId(s) });
    }
  }

  if (params.dateFrom || params.dateTo) {
    query.createdAt = {};
    if (params.dateFrom) query.createdAt.$gte = new Date(params.dateFrom);
    if (params.dateTo) query.createdAt.$lte = new Date(params.dateTo);
  }

  const [operators, total] = await Promise.all([
    User.find(query)
      .select('-passwordHash -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  // Attach Wallet Balances & Total Usage
  const userIds = operators.map((o) => o._id);
  const [wallets, printCounts] = await Promise.all([
    Wallet.find({ userId: { $in: userIds } }).select('userId balance totalCredited totalDebited').lean(),
    DocumentRecord.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', lookups: { $sum: 1 }, prints: { $sum: '$printCount' } } },
    ]),
  ]);

  const walletMap = new Map(wallets.map((w) => [w.userId.toString(), w]));
  const printMap = new Map(printCounts.map((p) => [p._id.toString(), p]));

  const enriched = operators.map((op: any) => {
    const w = walletMap.get(op._id.toString());
    const p = printMap.get(op._id.toString());
    return {
      id: op._id.toString(),
      name: op.name,
      email: op.email,
      phone: op.phone || '',
      role: op.role,
      status: op.status,
      notes: op.notes || '',
      suspendedReason: op.suspendedReason || '',
      walletBalance: w ? Number(w.balance) || 0 : 0,
      totalRechargeAmount: w ? Number(w.totalCredited) || 0 : 0,
      totalDebited: w ? Number(w.totalDebited) || 0 : 0,
      totalLookups: p ? Number(p.lookups) || 0 : 0,
      totalPrints: p ? Number(p.prints) || 0 : 0,
      createdAt: op.createdAt ? new Date(op.createdAt).toISOString() : new Date().toISOString(),
    };
  });

  return {
    operators: enriched,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * 2.2 Operator Profile Details
 * Never exposes citizen document numbers or photos.
 */
export async function getAdminOperatorDetail(operatorId: string) {
  const session = await getSession();
  assertRole(session, ['super_admin', 'admin'], 'view operator profile detail');
  await connectToDatabase();

  const user = await User.findById(operatorId).select('-passwordHash').lean();
  if (!user) {
    throw new Error('Operator not found');
  }

  const [wallet, payments, documentStats, tickets] = await Promise.all([
    Wallet.findOne({ userId: operatorId }).lean(),
    Payment.find({ userId: operatorId }).sort({ createdAt: -1 }).limit(10).lean(),
    DocumentRecord.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(operatorId) } },
      { $group: { _id: '$docType', count: { $sum: 1 }, prints: { $sum: '$printCount' } } },
    ]),
    SupportTicket.find({ operatorId }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  return {
    operator: {
      id: (user._id as any).toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      status: user.status,
      role: user.role,
      notes: (user as any).notes || '',
      suspendedReason: (user as any).suspendedReason || '',
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      lastLoginAt: (user as any).lastLoginAt ? new Date((user as any).lastLoginAt).toISOString() : undefined,
    },
    wallet: wallet
      ? {
          balance: Number(wallet.balance) || 0,
          totalCredited: Number(wallet.totalCredited) || 0,
          totalDebited: Number(wallet.totalDebited) || 0,
          recentTransactions: (wallet.transactions || []).slice(-15).reverse().map((t: any) => ({
            id: (t._id || t.id)?.toString() || '',
            amount: Number(t.amount) || 0,
            type: t.type || 'debit',
            category: t.category || 'DOCUMENT_PRINT',
            referenceId: t.referenceId ? String(t.referenceId) : '',
            description: t.description ? String(t.description) : '',
            balanceBefore: t.balanceBefore !== undefined ? Number(t.balanceBefore) : undefined,
            balanceAfter: Number(t.balanceAfter) || 0,
            createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
          })),
        }
      : { balance: 0, totalCredited: 0, totalDebited: 0, recentTransactions: [] },
    recentPayments: payments.map((p: any) => ({
      paymentId: p.paymentId,
      orderId: p.orderId,
      amount: Number(p.amount) || 0,
      status: p.status,
      upiId: p.upiId || '',
      bankTxnId: p.bankTxnId || '',
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    })),
    serviceUsage: documentStats.map((d: any) => ({
      docType: d._id || 'OTHER',
      lookups: Number(d.count) || 0,
      prints: Number(d.prints) || 0,
    })),
    tickets: tickets.map((t: any) => ({
      ticketId: t.ticketId,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    })),
  };
}

/**
 * 2.2 Operator Status Toggle & Administrative Suspension
 */
export async function updateOperatorStatus(
  operatorId: string,
  status: 'active' | 'suspended',
  reason?: string
) {
  const session = await getSession();
  assertRole(session, ['super_admin', 'admin'], 'modify operator status');
  await connectToDatabase();

  const user = await User.findById(operatorId);
  if (!user) {
    throw new Error('Operator not found');
  }

  const previousStatus = user.status;
  user.status = status;
  if (status === 'suspended') {
    (user as any).suspendedReason = reason || 'Administrative suspension';
  } else {
    (user as any).suspendedReason = '';
  }
  await user.save();

  await logAuditEvent({
    actorId: session!.userId,
    actorEmail: session!.email,
    actorRole: session!.role,
    action: 'OPERATOR_STATUS_CHANGED',
    resourceType: 'OPERATOR',
    resourceId: operatorId,
    details: {
      operatorName: user.name,
      previousStatus,
      newStatus: status,
      reason: reason || '',
    },
    status: 'SUCCESS',
  });

  return { success: true, message: `Operator account marked as ${status}` };
}

/**
 * 2.2 Add Administrative Notes to Operator Record
 */
export async function addOperatorNote(operatorId: string, note: string) {
  const session = await getSession();
  assertRole(session, ['super_admin', 'admin'], 'add administrative note');
  await connectToDatabase();

  const user = await User.findById(operatorId);
  if (!user) throw new Error('Operator not found');

  const timestamp = new Date().toISOString().split('T')[0];
  const formattedNote = `[${timestamp} by ${session!.name} (${session!.role})]: ${note.trim()}`;
  const existingNotes = (user as any).notes || '';
  (user as any).notes = existingNotes ? `${formattedNote}\n${existingNotes}` : formattedNote;
  await user.save();

  await logAuditEvent({
    actorId: session!.userId,
    actorEmail: session!.email,
    actorRole: session!.role,
    action: 'OPERATOR_NOTE_ADDED',
    resourceType: 'OPERATOR',
    resourceId: operatorId,
    details: { note: note.trim() },
    status: 'SUCCESS',
  });

  return { success: true, notes: (user as any).notes };
}

/**
 * 2.3 Financial Management: Administrative Wallet Adjustment
 * CRITICAL FINANCIAL RULES ENFORCED:
 * 1. Atomic balance updates ($inc) with corresponding ledger entry.
 * 2. Hard block on support staff.
 * 3. Maker-checker approval for adjustments > ₹10,000 (Super Admin required).
 * 4. Immutable audit logging.
 */
export async function executeAdministrativeWalletAdjustment(params: {
  operatorId: string;
  amount: number;
  type: 'credit' | 'debit' | 'refund';
  reason: string;
}) {
  const session = await getSession();
  const { operatorId, amount, type, reason } = params;

  if (!operatorId || !amount || amount <= 0 || !reason?.trim()) {
    throw new Error('Invalid adjustment payload: Operator ID, positive amount, and reason required.');
  }

  // Enforce financial permissions (rejects support staff, checks maker-checker limit)
  assertFinancialAdjustmentPermission(session, amount);
  await connectToDatabase();

  const user = await User.findById(operatorId);
  if (!user) throw new Error('Operator not found');

  const wallet = await Wallet.findOne({ userId: operatorId });
  if (!wallet) throw new Error('Operator wallet does not exist');

  if (type === 'debit' && wallet.balance < amount) {
    throw new Error(`Insufficient wallet balance. Current balance is ₹${wallet.balance.toFixed(2)}.`);
  }

  const deltaBalance = type === 'credit' || type === 'refund' ? amount : -amount;
  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore + deltaBalance;

  const adjReferenceId = `ADJ-${Date.now().toString().slice(-8)}`;
  const description = `Admin ${type.toUpperCase()}: ${reason.trim()} (By ${session!.name})`;

  // Atomically update balance and push immutable ledger transaction
  const updatedWallet = await Wallet.findOneAndUpdate(
    { userId: operatorId },
    {
      $inc: {
        balance: deltaBalance,
        totalCredited: deltaBalance > 0 ? deltaBalance : 0,
        totalDebited: deltaBalance < 0 ? Math.abs(deltaBalance) : 0,
      },
      $push: {
        transactions: {
          amount,
          type: type === 'debit' ? 'debit' : 'credit',
          category: type === 'refund' ? 'REFUND' : 'MANUAL_ADJUSTMENT',
          referenceId: adjReferenceId,
          description,
          balanceBefore,
          balanceAfter,
          status: 'COMPLETED',
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  );

  // Immutable Audit Entry
  await logAuditEvent({
    actorId: session!.userId,
    actorEmail: session!.email,
    actorRole: session!.role,
    action: type === 'debit' ? 'WALLET_ADMIN_DEBIT' : type === 'refund' ? 'WALLET_ADMIN_REFUND' : 'WALLET_ADMIN_CREDIT',
    resourceType: 'WALLET',
    resourceId: operatorId,
    details: {
      adjustmentReference: adjReferenceId,
      type,
      amount,
      balanceBefore,
      balanceAfter,
      reason: reason.trim(),
      adminId: session!.userId,
      adminName: session!.name,
    },
    status: 'SUCCESS',
  });

  return {
    success: true,
    referenceId: adjReferenceId,
    newBalance: updatedWallet?.balance,
    message: `Successfully adjusted wallet by ₹${amount} (${type}). New balance: ₹${updatedWallet?.balance.toFixed(2)}`,
  };
}

/**
 * 2.3 Financial Management: Transaction Ledger Query
 */
export async function getAdminFinancialLedger(params: {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  search?: string;
}) {
  const session = await getSession();
  assertRole(session, ['super_admin', 'admin'], 'view financial transactions');
  await connectToDatabase();

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 25));
  const skip = (page - 1) * limit;

  const matchStage: Record<string, any> = {};
  if (params.type && params.type !== 'all') {
    matchStage['transactions.type'] = params.type;
  }
  if (params.category && params.category !== 'all') {
    matchStage['transactions.category'] = params.category;
  }
  if (params.search && params.search.trim()) {
    matchStage['$or'] = [
      { 'transactions.referenceId': { $regex: params.search.trim(), $options: 'i' } },
      { 'transactions.description': { $regex: params.search.trim(), $options: 'i' } },
    ];
  }

  const [results, totalAgg] = await Promise.all([
    Wallet.aggregate([
      { $unwind: '$transactions' },
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'operator',
        },
      },
      { $unwind: { path: '$operator', preserveNullAndEmptyArrays: true } },
      { $sort: { 'transactions.createdAt': -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          id: { $toString: '$transactions._id' },
          operatorId: { $toString: '$userId' },
          operatorName: { $ifNull: ['$operator.name', 'Unknown Operator'] },
          operatorEmail: { $ifNull: ['$operator.email', 'N/A'] },
          amount: '$transactions.amount',
          type: '$transactions.type',
          category: '$transactions.category',
          referenceId: '$transactions.referenceId',
          description: '$transactions.description',
          balanceBefore: '$transactions.balanceBefore',
          balanceAfter: '$transactions.balanceAfter',
          createdAt: '$transactions.createdAt',
        },
      },
    ]),
    Wallet.aggregate([
      { $unwind: '$transactions' },
      { $match: matchStage },
      { $count: 'count' },
    ]),
  ]);

  const total = totalAgg[0]?.count || 0;

  const plainTransactions = results.map((r: any) => ({
    id: (r.id || r._id)?.toString() || '',
    operatorId: r.operatorId ? r.operatorId.toString() : '',
    operatorName: r.operatorName || 'Unknown Operator',
    operatorEmail: r.operatorEmail || 'N/A',
    amount: typeof r.amount === 'number' ? r.amount : Number(r.amount) || 0,
    type: r.type || 'debit',
    category: r.category || 'DOCUMENT_PRINT',
    referenceId: r.referenceId ? String(r.referenceId) : '',
    description: r.description ? String(r.description) : '',
    balanceBefore: r.balanceBefore !== undefined ? Number(r.balanceBefore) : undefined,
    balanceAfter: typeof r.balanceAfter === 'number' ? r.balanceAfter : Number(r.balanceAfter) || 0,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
  }));

  return {
    transactions: plainTransactions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * 2.4 Promotional Campaigns Management
 */
export async function getAdminCampaigns() {
  const session = await getSession();
  assertRole(session, ['super_admin', 'admin'], 'view campaigns');
  await connectToDatabase();

  // Seed default Accero Launch Bonus campaign if no campaign exists
  const count = await Campaign.countDocuments({});
  if (count === 0) {
    const endOfYear = new Date();
    endOfYear.setMonth(endOfYear.getMonth() + 6);
    await Campaign.create({
      name: 'Accero Launch Bonus',
      code: 'LAUNCH_BONUS',
      description: 'Every ₹249 recharge slab receives ₹50 promotional credit.',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: endOfYear,
      minRechargeAmount: 249,
      slabAmount: 249,
      bonusPerSlab: 50,
      maxBonusPerOperator: 1000,
      totalBudget: 100000,
      budgetSpent: 0,
      totalRedemptions: 0,
    });
  }

  // Ensure default promo codes exist in PromoCode collection
  await Promise.all([
    PromoCode.findOneAndUpdate(
      { code: 'LAUNCH_BONUS' },
      {
        code: 'LAUNCH_BONUS',
        campaignName: 'Accero Launch Bonus',
        description: 'Every ₹249 recharge slab receives ₹50 promotional credit.',
        discountType: 'FIXED_BONUS',
        discountValue: 50,
        minimumRechargeAmount: 249,
        maximumBonus: 1000,
        totalBudget: 100000,
        budgetSpent: 0,
        totalRedeemed: 0,
        totalRedemptionLimit: 2000,
        perUserRedemptionLimit: 10,
        firstRechargeOnly: false,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      { upsert: true }
    ),
    PromoCode.findOneAndUpdate(
      { code: 'LAUNCH50' },
      {
        code: 'LAUNCH50',
        campaignName: 'Accero Launch Welcome Offer',
        description: 'Recharge ₹249 and receive ₹50 promotional credit.',
        discountType: 'FIXED_BONUS',
        discountValue: 50,
        minimumRechargeAmount: 249,
        maximumBonus: 50,
        totalBudget: 100000,
        budgetSpent: 0,
        totalRedeemed: 0,
        totalRedemptionLimit: 2000,
        perUserRedemptionLimit: 1,
        firstRechargeOnly: false,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      { upsert: true }
    ),
  ]);

  const campaigns = await Campaign.find({}).sort({ createdAt: -1 }).lean();
  return campaigns.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
    code: c.code,
    description: c.description,
    status: c.status,
    startDate: c.startDate ? new Date(c.startDate).toISOString() : new Date().toISOString(),
    endDate: c.endDate ? new Date(c.endDate).toISOString() : new Date().toISOString(),
    minRechargeAmount: c.minRechargeAmount,
    slabAmount: c.slabAmount,
    bonusPerSlab: c.bonusPerSlab,
    maxBonusPerOperator: c.maxBonusPerOperator,
    totalBudget: c.totalBudget,
    budgetSpent: c.budgetSpent,
    totalRedemptions: c.totalRedemptions,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
  }));
}

export async function createAdminCampaign(data: {
  name: string;
  code: string;
  description: string;
  startDate: string;
  endDate: string;
  minRechargeAmount: number;
  slabAmount: number;
  bonusPerSlab: number;
  maxBonusPerOperator: number;
  totalBudget: number;
}) {
  const session = await getSession();
  assertRole(session, ['super_admin', 'admin'], 'create promotional campaign');
  await connectToDatabase();

  if (!data.name?.trim()) {
    throw new Error('Campaign name is required.');
  }
  if (!data.code?.trim()) {
    throw new Error('Promo code is required.');
  }
  if (!data.description?.trim()) {
    throw new Error('Description is required.');
  }

  const cleanCode = data.code.toUpperCase().trim();
  const existing = await Campaign.findOne({ code: cleanCode });
  if (existing) {
    throw new Error(`Campaign with code "${cleanCode}" already exists.`);
  }

  const campaign = await Campaign.create({
    name: data.name.trim(),
    code: cleanCode,
    description: data.description.trim(),
    status: 'ACTIVE',
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    minRechargeAmount: Number(data.minRechargeAmount) || 249,
    slabAmount: Number(data.slabAmount) || 249,
    bonusPerSlab: Number(data.bonusPerSlab) || 50,
    maxBonusPerOperator: Number(data.maxBonusPerOperator) || 1000,
    totalBudget: Number(data.totalBudget) || 100000,
  });

  // Synchronize campaign into PromoCode collection for wallet top-up modal
  await PromoCode.findOneAndUpdate(
    { code: cleanCode },
    {
      code: cleanCode,
      campaignName: data.name.trim(),
      description: data.description.trim(),
      discountType: 'FIXED_BONUS',
      discountValue: Number(data.bonusPerSlab) || 50,
      minimumRechargeAmount: Number(data.minRechargeAmount) || 249,
      maximumBonus: Number(data.maxBonusPerOperator) || 1000,
      totalBudget: Number(data.totalBudget) || 100000,
      perUserRedemptionLimit: Math.max(
        1,
        Math.floor((Number(data.maxBonusPerOperator) || 1000) / (Number(data.bonusPerSlab) || 50))
      ),
      firstRechargeOnly: false,
      startsAt: new Date(data.startDate),
      expiresAt: new Date(data.endDate),
      isActive: true,
    },
    { upsert: true }
  );

  await logAuditEvent({
    actorId: session!.userId,
    actorEmail: session!.email,
    actorRole: session!.role,
    action: 'CAMPAIGN_CREATED',
    resourceType: 'CAMPAIGN',
    resourceId: (campaign._id as any).toString(),
    details: { code: campaign.code, name: campaign.name },
    status: 'SUCCESS',
  });

  return { success: true, campaignId: (campaign._id as any).toString() };
}

export async function toggleCampaignStatus(campaignId: string, status: 'ACTIVE' | 'INACTIVE') {
  const session = await getSession();
  assertRole(session, ['super_admin', 'admin'], 'toggle campaign status');
  await connectToDatabase();

  const campaign = await Campaign.findByIdAndUpdate(campaignId, { status }, { new: true });
  if (campaign) {
    await PromoCode.findOneAndUpdate(
      { code: campaign.code },
      { isActive: status === 'ACTIVE' }
    );
  }

  await logAuditEvent({
    actorId: session!.userId,
    actorEmail: session!.email,
    actorRole: session!.role,
    action: 'CAMPAIGN_STATUS_CHANGED',
    resourceType: 'CAMPAIGN',
    resourceId: campaignId,
    details: { newStatus: status },
    status: 'SUCCESS',
  });

  return { success: true };
}

/**
 * 2.5 Service Management: Dynamic Pricing & Maintenance
 */
export async function getAdminServices() {
  const session = await getSession();
  assertRole(session, ['super_admin', 'admin'], 'view service configs');
  await connectToDatabase();

  const services: ServiceType[] = ['PAN', 'AADHAAR', 'VOTER', 'DL', 'RC', 'RATION'];
  const configs = await ServiceConfig.find({}).lean();
  const configMap = new Map(configs.map((c) => [c.serviceId, c]));

  // Auto-seed default configs if missing
  const results = [];
  for (const s of services) {
    let conf = configMap.get(s);
    if (!conf) {
      conf = await ServiceConfig.create({
        serviceId: s,
        displayName: `${s} Card Processing`,
        enabled: true,
        fee: SERVICE_FEES[s] || 25,
        providerPriority: ['NEO', 'SUREPASS', 'MANUAL'],
        maintenanceMode: false,
        maintenanceNotice: '',
      });
    }
    results.push({
      id: ((conf as any)._id || s).toString(),
      serviceId: conf.serviceId,
      displayName: conf.displayName,
      enabled: conf.enabled,
      fee: conf.fee,
      providerPriority: conf.providerPriority || ['NEO', 'SUREPASS', 'MANUAL'],
      maintenanceMode: conf.maintenanceMode,
      maintenanceNotice: conf.maintenanceNotice || '',
      updatedAt: conf.updatedAt ? new Date(conf.updatedAt).toISOString() : new Date().toISOString(),
    });
  }

  return results;
}

export async function updateAdminServiceConfig(
  serviceId: ServiceType,
  data: {
    enabled?: boolean;
    fee?: number;
    maintenanceMode?: boolean;
    maintenanceNotice?: string;
  }
) {
  const session = await getSession();
  assertRole(session, ['super_admin', 'admin'], 'modify service configuration');
  await connectToDatabase();

  const conf = await ServiceConfig.findOneAndUpdate(
    { serviceId },
    {
      ...data,
      updatedBy: session!.userId,
    },
    { new: true, upsert: true }
  );

  await logAuditEvent({
    actorId: session!.userId,
    actorEmail: session!.email,
    actorRole: session!.role,
    action: 'SERVICE_CONFIG_UPDATED',
    resourceType: 'SERVICE',
    resourceId: serviceId,
    details: data,
    status: 'SUCCESS',
  });

  return { success: true, serviceId, fee: conf.fee, enabled: conf.enabled };
}

/**
 * 2.6 Payment Gateway Auditing & History
 * Never exposes gateway secrets or passwords.
 */
export async function getAdminPayments(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) {
  const session = await getSession();
  assertRole(session, ['super_admin', 'admin'], 'view payments');
  await connectToDatabase();

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const query: Record<string, any> = {};
  if (params.status && params.status !== 'all') {
    query.status = params.status;
  }
  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    query.$or = [
      { orderId: { $regex: s, $options: 'i' } },
      { paymentId: { $regex: s, $options: 'i' } },
      { bankTxnId: { $regex: s, $options: 'i' } },
      { upiId: { $regex: s, $options: 'i' } },
    ];
  }

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(query),
  ]);

  return {
    payments: payments.map((p: any) => ({
      id: p._id.toString(),
      paymentId: p.paymentId,
      orderId: p.orderId,
      amount: Number(p.amount) || 0,
      status: p.status,
      upiId: p.upiId || '',
      bankTxnId: p.bankTxnId || 'N/A',
      operatorName: p.userId?.name || 'Unknown',
      operatorEmail: p.userId?.email || 'N/A',
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      verifiedAt: p.verifiedAt ? new Date(p.verifiedAt).toISOString() : undefined,
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
 * 2.8 Admin Team & Staff Management
 * Strictly enforces that ONLY Super Admin can manage Super Admin roles.
 */
export async function getAdminTeam() {
  const session = await getSession();
  assertRole(session, ['super_admin', 'admin'], 'view staff team');
  await connectToDatabase();

  const staff = await User.find({
    role: { $in: ['super_admin', 'admin', 'support_manager', 'support_agent'] },
  })
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .lean();

  return staff.map((s: any) => ({
    id: s._id.toString(),
    name: s.name,
    email: s.email,
    phone: s.phone || '',
    role: s.role,
    status: s.status,
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
    lastLoginAt: s.lastLoginAt ? new Date(s.lastLoginAt).toISOString() : undefined,
  }));
}

export async function createTeamMember(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}) {
  const session = await getSession();
  assertRole(session, ['super_admin'], 'create staff members');

  // Super Admin safeguard: Only Super Admin can assign super_admin
  if (data.role === 'super_admin' && !isSuperAdmin(session!.role)) {
    throw new Error('Forbidden: Only an existing Super Admin can create Super Admin accounts.');
  }

  await connectToDatabase();

  const existing = await User.findOne({ email: data.email.toLowerCase().trim() });
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const newUser = await User.create({
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    phone: data.phone.trim(),
    passwordHash,
    role: data.role,
    status: 'active',
  });

  await logAuditEvent({
    actorId: session!.userId,
    actorEmail: session!.email,
    actorRole: session!.role,
    action: 'TEAM_USER_CREATED',
    resourceType: 'TEAM',
    resourceId: (newUser._id as any).toString(),
    details: { email: newUser.email, role: newUser.role },
    status: 'SUCCESS',
  });

  return { success: true, userId: (newUser._id as any).toString() };
}

export async function updateTeamMemberRole(userId: string, newRole: UserRole) {
  const session = await getSession();
  assertRole(session, ['super_admin'], 'update staff roles');

  if (newRole === 'super_admin' && !isSuperAdmin(session!.role)) {
    throw new Error('Forbidden: Only an existing Super Admin can promote accounts to Super Admin.');
  }

  await connectToDatabase();
  const targetUser = await User.findById(userId);
  if (!targetUser) throw new Error('Staff user not found');

  if (targetUser.role === 'super_admin' && !isSuperAdmin(session!.role)) {
    throw new Error('Forbidden: You cannot modify Super Admin privileges.');
  }

  const prevRole = targetUser.role;
  targetUser.role = newRole;
  await targetUser.save();

  await logAuditEvent({
    actorId: session!.userId,
    actorEmail: session!.email,
    actorRole: session!.role,
    action: 'TEAM_ROLE_CHANGED',
    resourceType: 'TEAM',
    resourceId: userId,
    details: { previousRole: prevRole, newRole },
    status: 'SUCCESS',
  });

  return { success: true };
}

/**
 * 2.7 Reports & Analytics: Export Financial Report CSV
 * Generates sanitized CSV string with appropriate authorization.
 */
export async function exportFinancialReportCsv(dateFrom?: string, dateTo?: string) {
  const session = await getSession();
  assertRole(session, ['super_admin', 'admin'], 'export financial reports');
  await connectToDatabase();

  const query: Record<string, any> = {};
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const payments = await Payment.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const rows = [
    ['Order ID', 'Payment ID', 'Operator Name', 'Operator Email', 'Amount (INR)', 'Status', 'Date'],
    ...payments.map((p: any) => [
      p.orderId,
      p.paymentId,
      `"${(p.userId?.name || 'Unknown').replace(/"/g, '""')}"`,
      p.userId?.email || '',
      p.amount,
      p.status,
      new Date(p.createdAt).toISOString(),
    ]),
  ];

  return rows.map((r) => r.join(',')).join('\n');
}
