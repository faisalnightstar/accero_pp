'use server';

import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Wallet, { IWallet, IWalletTransaction } from '@/models/Wallet';
import ManualRechargeRequest from '@/models/ManualRechargeRequest';
import { getSession, hasAdminRole } from '@/lib/auth';
import {
  getRequiredServiceFee,
  LOW_BALANCE_THRESHOLD,
  normalizeDocType,
} from '@/lib/wallet/pricing';
import {
  createPaytmPaymentOrder,
  verifyAndCreditPaytmPayment,
  CreatePaymentOrderResult,
  VerifyPaymentResult,
} from '@/lib/payment/paytm';
import { logAuditEvent } from '@/lib/logger/audit';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export interface WalletBalanceResult {
  success: boolean;
  balance: number;
  promotionalBalance?: number;
  purchasedBalance?: number;
  totalCredited: number;
  totalDebited: number;
  isLowBalance: boolean;
  error?: string;
}

export interface DeductionResult {
  success: boolean;
  fee: number;
  isFreeReprint: boolean;
  balanceAfter: number;
  error?: string;
  requiredFee?: number;
  currentBalance?: number;
}

export interface RechargeResult {
  success: boolean;
  newBalance: number;
  pending?: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedTransactionsResult {
  success: boolean;
  transactions: Array<{
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    category?: string;
    docType?: string;
    referenceId?: string;
    description: string;
    balanceAfter: number;
    isPromotional?: boolean;
    promoCode?: string;
    createdAt: string;
  }>;
  total: number;
  page: number;
  totalPages: number;
  balance: number;
  error?: string;
}

/**
 * Get current user's wallet balance and summary metrics
 */
export async function getWalletBalance(): Promise<WalletBalanceResult> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return {
        success: false,
        balance: 0,
        totalCredited: 0,
        totalDebited: 0,
        isLowBalance: false,
        error: 'Unauthorized',
      };
    }

    await connectToDatabase();

    let wallet = await Wallet.findOne({
      userId: new mongoose.Types.ObjectId(session.userId),
    });

    if (!wallet) {
      wallet = await Wallet.create({
        userId: new mongoose.Types.ObjectId(session.userId),
        balance: 0,
        currency: 'INR',
        totalCredited: 0,
        totalDebited: 0,
        transactions: [],
      });
    }

    return {
      success: true,
      balance: wallet.balance,
      promotionalBalance: wallet.promotionalBalance || 0,
      purchasedBalance: wallet.purchasedBalance || 0,
      totalCredited: wallet.totalCredited || 0,
      totalDebited: wallet.totalDebited || 0,
      isLowBalance: wallet.balance < LOW_BALANCE_THRESHOLD,
    };
  } catch (err: any) {
    console.error('[Wallet] Error fetching balance:', err);
    return {
      success: false,
      balance: 0,
      totalCredited: 0,
      totalDebited: 0,
      isLowBalance: false,
      error: err.message || 'Failed to fetch wallet balance',
    };
  }
}

/**
 * Checks whether user can afford the required service fee without executing deduction
 */
export async function checkAffordability(
  docType: string,
  cardIdentifier?: string,
  isManual = false
): Promise<{
  success: boolean;
  canAfford: boolean;
  requiredFee: number;
  currentBalance: number;
  isFreeReprint: boolean;
}> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return {
        success: false,
        canAfford: false,
        requiredFee: 0,
        currentBalance: 0,
        isFreeReprint: false,
      };
    }

    await connectToDatabase();

    const { fee, isFreeReprint } = await getRequiredServiceFee(
      session.userId,
      docType,
      cardIdentifier,
      isManual
    );

    if (isFreeReprint || fee === 0) {
      return {
        success: true,
        canAfford: true,
        requiredFee: 0,
        currentBalance: 0,
        isFreeReprint: true,
      };
    }

    const wallet = await Wallet.findOne({
      userId: new mongoose.Types.ObjectId(session.userId),
    });

    const currentBalance = wallet ? wallet.balance : 0;

    return {
      success: true,
      canAfford: currentBalance >= fee,
      requiredFee: fee,
      currentBalance,
      isFreeReprint: false,
    };
  } catch (err) {
    console.error('[Wallet] Error checking affordability:', err);
    return {
      success: false,
      canAfford: false,
      requiredFee: 0,
      currentBalance: 0,
      isFreeReprint: false,
    };
  }
}

/**
 * Atomically deducts a service fee from the user's wallet
 * Uses MongoDB { balance: { $gte: fee } } to prevent race conditions & negative balances
 */
export async function deductWalletFee(
  docType: string,
  cardIdentifier: string,
  description?: string,
  isManual = false
): Promise<DeductionResult> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return {
        success: false,
        fee: 0,
        isFreeReprint: false,
        balanceAfter: 0,
        error: 'Unauthorized',
      };
    }

    await connectToDatabase();
    const userIdObj = new mongoose.Types.ObjectId(session.userId);

    const { fee, isFreeReprint, docType: cleanDocType } = await getRequiredServiceFee(
      session.userId,
      docType,
      cardIdentifier,
      isManual
    );

    // If document is already generated by this user, re-print is 100% free
    if (isFreeReprint || fee === 0) {
      const currentWallet = await Wallet.findOne({ userId: userIdObj });
      return {
        success: true,
        fee: 0,
        isFreeReprint: true,
        balanceAfter: currentWallet ? currentWallet.balance : 0,
      };
    }

    const cleanId = (cardIdentifier || '').trim().toUpperCase();
    const desc = description || `${cleanDocType} Card Verification Fee`;

    // Atomic conditional deduction
    const updatedWallet = await Wallet.findOneAndUpdate(
      {
        userId: userIdObj,
        balance: { $gte: fee }, // Prevents deduction if balance dropped below fee
      },
      {
        $inc: { balance: -fee, totalDebited: fee },
        $push: {
          transactions: {
            amount: fee,
            type: 'debit',
            docType: cleanDocType as any,
            referenceId: cleanId,
            description: desc,
            balanceAfter: 0,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updatedWallet) {
      const currentWallet = await Wallet.findOne({ userId: userIdObj });
      const currentBal = currentWallet ? currentWallet.balance : 0;

      return {
        success: false,
        fee,
        isFreeReprint: false,
        balanceAfter: currentBal,
        error: 'INSUFFICIENT_BALANCE',
        requiredFee: fee,
        currentBalance: currentBal,
      };
    }

    // Patch the balanceAfter field in the pushed transaction
    if (updatedWallet.transactions && updatedWallet.transactions.length > 0) {
      const lastTx = updatedWallet.transactions[updatedWallet.transactions.length - 1];
      lastTx.balanceAfter = updatedWallet.balance;
      await updatedWallet.save();
    }

    await logAuditEvent({
      actorId: session.userId,
      action: 'WALLET_DEDUCTION_FINALIZED',
      resourceType: 'WALLET',
      resourceId: cleanId,
      details: { docType: cleanDocType, fee, balanceAfter: updatedWallet.balance },
      status: 'SUCCESS',
    });

    return {
      success: true,
      fee,
      isFreeReprint: false,
      balanceAfter: updatedWallet.balance,
    };
  } catch (err: any) {
    console.error('[Wallet] Error executing deduction:', err);
    return {
      success: false,
      fee: 0,
      isFreeReprint: false,
      balanceAfter: 0,
      error: err.message || 'Failed to deduct wallet fee',
    };
  }
}

/**
 * Submits a manual UPI UTR transaction reference for administrator review.
 * NEVER credits the wallet automatically.
 */
export async function submitManualRechargeRequest(
  amount: number,
  utrNumber: string
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, message: '', error: 'Unauthorized. Please sign in.' };
    }

    const rateLimit = await checkRateLimit('MANUAL_RECHARGE', session.userId);
    if (!rateLimit.allowed) {
      return {
        success: false,
        message: '',
        error: `Too many submissions. Please wait ${rateLimit.retryAfterSeconds}s before submitting again.`,
      };
    }

    if (typeof amount !== 'number' || isNaN(amount) || amount < 10) {
      return { success: false, message: '', error: 'Minimum recharge amount is ₹10.' };
    }

    if (amount > 50000) {
      return { success: false, message: '', error: 'Maximum recharge amount is ₹50,000.' };
    }

    const cleanUtr = (utrNumber || '').trim().toUpperCase();
    if (!cleanUtr || cleanUtr.length < 8 || cleanUtr.length > 25) {
      return {
        success: false,
        message: '',
        error: 'Please enter a valid 8-22 character UPI UTR / Transaction reference number.',
      };
    }

    await connectToDatabase();

    // Check if this UTR has already been submitted
    const existing = await ManualRechargeRequest.findOne({ utrNumber: cleanUtr });
    if (existing) {
      return {
        success: false,
        message: '',
        error: 'This UTR reference has already been submitted. Please check with an administrator.',
      };
    }

    await ManualRechargeRequest.create({
      userId: new mongoose.Types.ObjectId(session.userId),
      amount,
      utrNumber: cleanUtr,
      status: 'PENDING',
    });

    await logAuditEvent({
      actorId: session.userId,
      action: 'WALLET_MANUAL_UTR_SUBMITTED',
      resourceType: 'WALLET',
      resourceId: cleanUtr,
      details: { amount, utrNumber: cleanUtr },
      status: 'SUCCESS',
    });

    return {
      success: true,
      message:
        'Your UTR reference has been submitted. Your wallet will be credited once verified by an administrator.',
    };
  } catch (err: any) {
    console.error('[Wallet] Error submitting manual recharge request:', err);
    return {
      success: false,
      message: '',
      error: err.message || 'Failed to submit recharge request.',
    };
  }
}

/**
 * Top up user's wallet with security verification.
 * In production: Sandbox is strictly blocked. Manual UTR creates a pending request.
 */
export async function rechargeWallet(
  amount: number,
  method: 'SANDBOX' | 'UPI_QR',
  utrNumber?: string
): Promise<RechargeResult> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, newBalance: 0, error: 'Unauthorized' };
    }

    if (typeof amount !== 'number' || isNaN(amount) || amount < 10) {
      return { success: false, newBalance: 0, error: 'Minimum recharge amount is ₹10.' };
    }

    if (method === 'UPI_QR') {
      if (!utrNumber?.trim()) {
        return {
          success: false,
          newBalance: 0,
          error: 'Please provide a valid UPI UTR reference number.',
        };
      }
      const res = await submitManualRechargeRequest(amount, utrNumber);
      if (!res.success) {
        return { success: false, newBalance: 0, error: res.error };
      }
      const currentBal = await getWalletBalance();
      return {
        success: true,
        newBalance: currentBal.balance,
        pending: true,
        message: res.message,
      };
    }

    // SANDBOX Security Guard:
    // Strictly forbidden in production environments
    const isSandboxAllowed =
      process.env.NODE_ENV === 'development' &&
      process.env.ALLOW_SANDBOX_RECHARGE === 'true';

    if (!isSandboxAllowed) {
      await logAuditEvent({
        actorId: session.userId,
        action: 'SECURITY_SANDBOX_BLOCKED',
        resourceType: 'WALLET',
        details: { attemptedAmount: amount },
        status: 'WARNING',
      });

      return {
        success: false,
        newBalance: 0,
        error:
          'Sandbox instant simulation is disabled in this environment. Please use official Paytm UPI QR payment.',
      };
    }

    // Development only simulation
    await connectToDatabase();
    const userIdObj = new mongoose.Types.ObjectId(session.userId);
    const ref = `SANDBOX-DEV-${Date.now()}`;

    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId: userIdObj },
      {
        $inc: { balance: amount, totalCredited: amount },
        $push: {
          transactions: {
            amount,
            type: 'credit',
            docType: 'TOPUP',
            referenceId: ref,
            description: `Dev Sandbox Test Credit (₹${amount})`,
            balanceAfter: 0,
            createdAt: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    if (updatedWallet.transactions && updatedWallet.transactions.length > 0) {
      const lastTx = updatedWallet.transactions[updatedWallet.transactions.length - 1];
      lastTx.balanceAfter = updatedWallet.balance;
      await updatedWallet.save();
    }

    return {
      success: true,
      newBalance: updatedWallet.balance,
    };
  } catch (err: any) {
    console.error('[Wallet] Error recharging wallet:', err);
    return {
      success: false,
      newBalance: 0,
      error: err.message || 'Failed to recharge wallet',
    };
  }
}

/**
 * Administrator: Retrieves pending manual UTR recharge requests
 */
export async function getPendingManualRecharges(): Promise<{
  success: boolean;
  requests: any[];
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session || !hasAdminRole(session.role)) {
      return { success: false, requests: [], error: 'Forbidden: Admin access required.' };
    }

    await connectToDatabase();
    const requests = await ManualRechargeRequest.find({ status: 'PENDING' })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      requests: requests.map((r: any) => ({
        _id: r._id.toString(),
        id: r._id.toString(),
        amount: Number(r.amount) || 0,
        utrNumber: r.utrNumber,
        status: r.status,
        user: {
          name: r.userId?.name || 'Unknown',
          email: r.userId?.email || '',
          phone: r.userId?.phone || '',
        },
        userName: r.userId?.name || 'Unknown',
        userEmail: r.userId?.email || '',
        userPhone: r.userId?.phone || '',
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      })),
    };
  } catch (err: any) {
    return { success: false, requests: [], error: err.message };
  }
}

/**
 * Administrator: Approves a manual UTR request and atomically credits the user's wallet
 */
export async function approveManualRecharge(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session || !hasAdminRole(session.role)) {
      return { success: false, error: 'Forbidden: Admin access required.' };
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return { success: false, error: 'Invalid request ID format' };
    }

    await connectToDatabase();

    const claimed = await ManualRechargeRequest.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(requestId), status: 'PENDING' },
      {
        $set: {
          status: 'APPROVED',
          reviewedBy: new mongoose.Types.ObjectId(session.userId),
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!claimed) {
      return { success: false, error: 'Request not found or already processed.' };
    }

    const ref = `MANUAL-UTR-${claimed.utrNumber}`;

    // Atomically credit user's wallet
    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId: claimed.userId },
      {
        $inc: { balance: claimed.amount, totalCredited: claimed.amount },
        $push: {
          transactions: {
            amount: claimed.amount,
            type: 'credit',
            docType: 'TOPUP',
            referenceId: ref,
            description: `Admin Approved Top-up (UTR: ${claimed.utrNumber})`,
            balanceAfter: 0,
            createdAt: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    if (updatedWallet && updatedWallet.transactions.length > 0) {
      const lastTx = updatedWallet.transactions[updatedWallet.transactions.length - 1];
      lastTx.balanceAfter = updatedWallet.balance;
      await updatedWallet.save();
    }

    await logAuditEvent({
      actorId: session.userId,
      action: 'WALLET_MANUAL_UTR_APPROVED',
      resourceType: 'WALLET',
      resourceId: claimed.utrNumber,
      details: {
        targetUserId: claimed.userId.toString(),
        amount: claimed.amount,
        utrNumber: claimed.utrNumber,
      },
      status: 'SUCCESS',
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Wallet] Error approving manual recharge:', err);
    return { success: false, error: err.message || 'Failed to approve recharge' };
  }
}

/**
 * Administrator: Rejects a manual UTR request
 */
export async function rejectManualRecharge(
  requestId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session || !hasAdminRole(session.role)) {
      return { success: false, error: 'Forbidden: Admin access required.' };
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return { success: false, error: 'Invalid request ID format' };
    }

    await connectToDatabase();

    const updated = await ManualRechargeRequest.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(requestId), status: 'PENDING' },
      {
        $set: {
          status: 'REJECTED',
          reviewedBy: new mongoose.Types.ObjectId(session.userId),
          reviewedAt: new Date(),
          rejectionReason: (reason || 'Invalid or unverified UTR').trim(),
        },
      },
      { new: true }
    );

    if (!updated) {
      return { success: false, error: 'Request not found or already processed.' };
    }

    await logAuditEvent({
      actorId: session.userId,
      action: 'WALLET_MANUAL_UTR_REJECTED',
      resourceType: 'WALLET',
      resourceId: updated.utrNumber,
      details: {
        targetUserId: updated.userId.toString(),
        amount: updated.amount,
        reason,
      },
      status: 'SUCCESS',
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Wallet] Error rejecting manual recharge:', err);
    return { success: false, error: err.message || 'Failed to reject recharge' };
  }
}

/**
 * Fetch paginated transaction history for the user's wallet
 */
export async function getWalletTransactions(
  page = 1,
  limit = 15,
  filter: 'all' | 'credit' | 'debit' = 'all'
): Promise<PaginatedTransactionsResult> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return {
        success: false,
        transactions: [],
        total: 0,
        page: 1,
        totalPages: 0,
        balance: 0,
        error: 'Unauthorized',
      };
    }

    await connectToDatabase();
    const userIdObj = new mongoose.Types.ObjectId(session.userId);

    const wallet = await Wallet.findOne({ userId: userIdObj });
    if (!wallet || !wallet.transactions || wallet.transactions.length === 0) {
      return {
        success: true,
        transactions: [],
        total: 0,
        page: 1,
        totalPages: 0,
        balance: wallet ? wallet.balance : 0,
      };
    }

    // Filter transactions
    let txs = [...wallet.transactions];
    if (filter === 'credit') {
      txs = txs.filter((t) => t.type === 'credit');
    } else if (filter === 'debit') {
      txs = txs.filter((t) => t.type === 'debit');
    }

    // Sort descending by date
    txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = txs.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedTxs = txs.slice(startIndex, startIndex + limit);

    const formatted = paginatedTxs.map((t) => ({
      id: t._id?.toString() || `${t.createdAt.getTime()}-${Math.random()}`,
      amount: t.amount,
      type: t.type,
      category: t.category,
      docType: t.docType,
      referenceId: t.referenceId,
      description: t.description,
      balanceAfter: t.balanceAfter,
      isPromotional: t.isPromotional,
      promoCode: t.promoCode,
      createdAt: t.createdAt.toISOString(),
    }));

    return {
      success: true,
      transactions: formatted,
      total,
      page,
      totalPages,
      balance: wallet.balance,
    };
  } catch (err: any) {
    console.error('[Wallet] Error fetching transactions:', err);
    return {
      success: false,
      transactions: [],
      total: 0,
      page: 1,
      totalPages: 0,
      balance: 0,
      error: err.message || 'Failed to fetch transactions',
    };
  }
}

/**
 * Initiates an official Paytm Dynamic UPI Payment Order with QR Code
 */
export async function createPaytmOrderAction(
  amount: number,
  preferredAccountIndex?: number,
  promoCode?: string
): Promise<CreatePaymentOrderResult> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: 'Unauthorized. Please log in.' };
    }

    return await createPaytmPaymentOrder(
      session.userId,
      amount,
      preferredAccountIndex,
      promoCode
    );
  } catch (err: any) {
    console.error('[Wallet] Error in createPaytmOrderAction:', err);
    return { success: false, error: err.message || 'Failed to create payment order' };
  }
}

/**
 * Verifies a Paytm Payment Order and automatically credits the user wallet if successful
 */
export async function verifyPaytmOrderAction(
  orderId: string
): Promise<VerifyPaymentResult> {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, status: 'failed', error: 'Unauthorized. Please log in.' };
    }

    return await verifyAndCreditPaytmPayment(orderId, session.userId);
  } catch (err: any) {
    console.error('[Wallet] Error in verifyPaytmOrderAction:', err);
    return { success: false, status: 'failed', error: err.message || 'Failed to verify payment' };
  }
}
