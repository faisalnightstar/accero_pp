import crypto from 'crypto';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import connectToDatabase from '@/lib/mongodb';
import Payment, { IPayment, PaymentStatus } from '@/models/Payment';
import Wallet from '@/models/Wallet';
import {
  validatePromoCode,
  createAppliedRedemption,
  finalizePromoRedemption,
  failPromoRedemption,
} from '@/lib/promo/service';
import { qualifyAndRewardReferral } from '@/lib/referral/service';
import { logAuditEvent } from '@/lib/logger/audit';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export interface PaytmAccountConfig {
  index: number;
  mid: string;
  upi: string;
  name: string;
}

/**
 * Returns all configured Paytm merchant accounts from environment variables.
 * Never hardcodes fallback merchant credentials.
 */
export function getPaytmAccounts(): PaytmAccountConfig[] {
  const accounts: PaytmAccountConfig[] = [];

  const mid1 = (process.env.PAYTM_MID || process.env.MID1)?.trim();
  const upi1 = (process.env.PAYTM_UPI || process.env.UPI1)?.trim();
  if (mid1 && upi1) {
    accounts.push({
      index: 1,
      mid: mid1,
      upi: upi1,
      name: 'Primary Merchant',
    });
  }

  const mid2 = (process.env.PAYTM_MID2 || process.env.MID2)?.trim();
  const upi2 = (process.env.PAYTM_UPI2 || process.env.UPI2)?.trim();
  if (mid2 && upi2) {
    accounts.push({
      index: 2,
      mid: mid2,
      upi: upi2,
      name: 'Secondary Merchant',
    });
  }

  return accounts;
}

let lastSelectedIndex = 0;
export function selectPaytmAccount(preferredIndex?: number): PaytmAccountConfig {
  const accounts = getPaytmAccounts();
  if (accounts.length === 0) {
    throw new Error(
      'Paytm payment gateway is not configured. Please set PAYTM_MID and PAYTM_UPI in environment variables.'
    );
  }

  if (preferredIndex) {
    const found = accounts.find((a) => a.index === preferredIndex);
    if (found) return found;
  }

  const selected = accounts[lastSelectedIndex % accounts.length];
  lastSelectedIndex = (lastSelectedIndex + 1) % accounts.length;
  return selected;
}

export interface CreatePaymentOrderResult {
  success: boolean;
  orderId?: string;
  paymentId?: string;
  amount?: number;
  payableAmount?: number;
  bonusAmount?: number;
  discountAmount?: number;
  promoCode?: string;
  upiId?: string;
  mid?: string;
  accountIndex?: number;
  upiUrl?: string;
  qrDataUrl?: string;
  error?: string;
}

/**
 * Creates a unique payment order and generates dynamic UPI QR code
 */
export async function createPaytmPaymentOrder(
  userId: string,
  amount: number,
  preferredAccountIndex?: number,
  promoCode?: string
): Promise<CreatePaymentOrderResult> {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required to initiate payment' };
    }

    // Rate Limit: 10 payment orders per minute per user
    const rateLimit = await checkRateLimit('PAYMENT_CREATE', userId);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Too many payment requests. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
      };
    }

    if (typeof amount !== 'number' || isNaN(amount) || amount < 10) {
      return { success: false, error: 'Minimum recharge amount is ₹10.' };
    }

    if (amount > 50000) {
      return { success: false, error: 'Maximum recharge limit per transaction is ₹50,000.' };
    }

    await connectToDatabase();

    let appliedPromo: any = null;
    let payableAmount = amount;
    let bonusAmount = 0;
    let discountAmount = 0;

    if (promoCode && promoCode.trim()) {
      const validation = await validatePromoCode(promoCode, userId, amount);
      if (!validation.valid || !validation.promoCode || !validation.calculation) {
        return {
          success: false,
          error: validation.error || 'Invalid promo code',
        };
      }
      appliedPromo = validation.promoCode;
      payableAmount = validation.calculation.payableAmount;
      bonusAmount = validation.calculation.bonusAmount;
      discountAmount = validation.calculation.discountAmount;
    }

    const account = selectPaytmAccount(preferredAccountIndex);

    // Cryptographically secure unique order ID and payment reference
    const paymentId = `pay_${crypto.randomUUID()}`;
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(3).toString('hex');
    const orderId = `wallet_${timestamp}_${randomSuffix}`;

    const merchantName = 'PrintPortal Gateway';
    const upiUrl = `upi://pay?pa=${account.upi}&pn=${encodeURIComponent(
      merchantName
    )}&am=${payableAmount.toFixed(2)}&cu=INR&tr=${orderId}&tn=${encodeURIComponent(
      appliedPromo ? `Wallet Topup + ${appliedPromo.code}` : 'Wallet Recharge'
    )}`;

    // High-resolution dynamic QR code
    const qrDataUrl = await QRCode.toDataURL(upiUrl, {
      width: 400,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    // Record pending payment in MongoDB
    await Payment.create({
      paymentId,
      orderId,
      userId: new mongoose.Types.ObjectId(userId),
      amount: payableAmount,
      upiId: account.upi,
      paytmMid: account.mid,
      accountIndex: account.index,
      status: 'PENDING',
      upiUrl,
      promoCode: appliedPromo?.code,
      promoCodeId: appliedPromo?.id ? new mongoose.Types.ObjectId(appliedPromo.id) : undefined,
      bonusAmount,
      discountAmount,
    });

    // Create APPLIED redemption linked to this orderId
    if (appliedPromo) {
      await createAppliedRedemption(
        appliedPromo.id,
        appliedPromo.code,
        userId,
        orderId,
        amount,
        bonusAmount,
        discountAmount
      );
    }

    await logAuditEvent({
      actorId: userId,
      action: 'WALLET_ORDER_CREATED',
      resourceType: 'PAYMENT',
      resourceId: orderId,
      details: {
        amount,
        payableAmount,
        bonusAmount,
        discountAmount,
        promoCode: appliedPromo?.code,
        upiId: account.upi,
        accountIndex: account.index,
      },
      status: 'SUCCESS',
    });

    return {
      success: true,
      orderId,
      paymentId,
      amount,
      payableAmount,
      bonusAmount,
      discountAmount,
      promoCode: appliedPromo?.code,
      upiId: account.upi,
      mid: account.mid,
      accountIndex: account.index,
      upiUrl,
      qrDataUrl,
    };
  } catch (err: any) {
    console.error('[Paytm] Error creating payment order:', err);
    return {
      success: false,
      error: err.message || 'Failed to generate payment QR code',
    };
  }
}

export interface PaytmStatusResponse {
  TXNID?: string;
  BANKTXNID?: string;
  ORDERID?: string;
  TXNAMOUNT?: string;
  STATUS?: string;
  TXNTYPE?: string;
  GATEWAYNAME?: string;
  RESPCODE?: string;
  RESPMSG?: string;
  BANKNAME?: string;
  MID?: string;
  PAYMENTMODE?: string;
  REFUNDAMT?: string;
  TXNDATE?: string;
  [key: string]: any;
}

/**
 * Directly queries Paytm's Order Status API: https://securegw.paytm.in/order/status
 */
export async function queryPaytmOrderStatus(
  mid: string,
  orderId: string
): Promise<{
  isPaid: boolean;
  status: 'paid' | 'pending' | 'failed';
  amount?: number;
  bankTxnId?: string;
  respMsg?: string;
  raw: PaytmStatusResponse | null;
}> {
  try {
    const payload = JSON.stringify({
      MID: mid,
      ORDERID: orderId,
    });

    const response = await fetch('https://securegw.paytm.in/order/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: payload,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn(`[Paytm] Status API returned HTTP ${response.status}`);
      return {
        isPaid: false,
        status: 'pending',
        raw: null,
      };
    }

    const json: PaytmStatusResponse = await response.json();

    // Check for success status from Paytm
    if (json.STATUS === 'TXN_SUCCESS') {
      const amount = json.TXNAMOUNT ? parseFloat(json.TXNAMOUNT) : undefined;
      return {
        isPaid: true,
        status: 'paid',
        amount,
        bankTxnId: json.BANKTXNID || json.TXNID,
        respMsg: json.RESPMSG || 'Transaction Successful',
        raw: json,
      };
    }

    // Terminal failure codes from Paytm
    const failureCodes = ['227', '295', '400', '401', '402'];
    if (json.STATUS === 'TXN_FAILURE' && failureCodes.includes(json.RESPCODE || '')) {
      return {
        isPaid: false,
        status: 'failed',
        respMsg: json.RESPMSG || 'Transaction Failed',
        raw: json,
      };
    }

    // "334" = Invalid Order Id before user has scanned & paid; treat as pending
    if (json.RESPCODE === '334' || json.STATUS === 'TXN_FAILURE') {
      return {
        isPaid: false,
        status: 'pending',
        respMsg: 'Waiting for payment...',
        raw: json,
      };
    }

    return {
      isPaid: false,
      status: 'pending',
      respMsg: json.RESPMSG || 'Transaction Pending',
      raw: json,
    };
  } catch (err) {
    console.error('[Paytm] Error querying order status:', err);
    return {
      isPaid: false,
      status: 'pending',
      raw: null,
    };
  }
}

export interface VerifyPaymentResult {
  success: boolean;
  status: 'paid' | 'pending' | 'failed';
  alreadyCredited?: boolean;
  amount?: number;
  bonusAmount?: number;
  totalCredit?: number;
  promoCode?: string;
  newBalance?: number;
  promotionalBalance?: number;
  purchasedBalance?: number;
  bankTxnId?: string;
  message?: string;
  error?: string;
}

/**
 * Verifies payment with Paytm and atomically credits wallet with concurrency protection.
 * Implements atomic state transitions (PENDING -> PROCESSING -> PAID).
 * Guarantees idempotency so repeated calls or webhooks NEVER double-credit.
 */
export async function verifyAndCreditPaytmPayment(
  orderId: string,
  userId?: string
): Promise<VerifyPaymentResult> {
  try {
    if (!orderId) {
      return { success: false, status: 'failed', error: 'Order ID is required' };
    }

    // Rate Limit: 20 status checks per minute per order
    const rateLimit = await checkRateLimit('PAYMENT_VERIFY', orderId);
    if (!rateLimit.allowed) {
      return {
        success: false,
        status: 'pending',
        error: `Please wait ${rateLimit.retryAfterSeconds}s before refreshing payment status.`,
      };
    }

    await connectToDatabase();

    const cleanOrderId = orderId.trim();
    const query: any = { orderId: cleanOrderId };
    if (userId) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    const payment = await Payment.findOne(query);
    if (!payment) {
      return { success: false, status: 'failed', error: 'Payment record not found' };
    }

    // 1. Idempotency Check: If already marked PAID, return existing balance safely
    const normalizedStatus = (payment.status || '').toUpperCase();
    if (normalizedStatus === 'PAID') {
      const wallet = await Wallet.findOne({ userId: payment.userId });
      return {
        success: true,
        status: 'paid',
        alreadyCredited: true,
        amount: payment.amount,
        newBalance: wallet ? wallet.balance : payment.amount,
        bankTxnId: payment.bankTxnId,
        message: 'Payment verified and credited.',
      };
    }

    // 2. Query Paytm Gateway
    const paytmResult = await queryPaytmOrderStatus(payment.paytmMid, payment.orderId);

    if (paytmResult.isPaid) {
      const creditAmount = paytmResult.amount || payment.amount;

      // 3. Atomic Claim: Transition status from PENDING -> PROCESSING
      // If two concurrent requests reach this point, ONLY ONE will succeed in updating
      const claimedPayment = await Payment.findOneAndUpdate(
        {
          _id: payment._id,
          status: { $in: ['PENDING', 'pending', 'CREATED'] },
        },
        {
          $set: {
            status: 'PROCESSING',
            processingStartedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!claimedPayment) {
        // Payment was already claimed or processed by another concurrent request!
        const recheckPayment = await Payment.findById(payment._id);
        const currentWallet = await Wallet.findOne({ userId: payment.userId });

        if (recheckPayment?.status === 'PAID' || recheckPayment?.status === 'paid') {
          await logAuditEvent({
            actorId: payment.userId,
            action: 'WALLET_PAYMENT_DUPLICATE_ATTEMPT',
            resourceType: 'PAYMENT',
            resourceId: payment.orderId,
            details: { reason: 'Concurrent verification request handled idempotently' },
            status: 'WARNING',
          });

          return {
            success: true,
            status: 'paid',
            alreadyCredited: true,
            amount: creditAmount,
            newBalance: currentWallet ? currentWallet.balance : creditAmount,
            bankTxnId: recheckPayment.bankTxnId,
            message: 'Payment already credited.',
          };
        }

        return {
          success: true,
          status: 'pending',
          message: 'Payment is currently being processed. Please check back in a few seconds.',
        };
      }

      // 4. Verify wallet transaction ledger does NOT already contain this orderId
      const existingWalletTx = await Wallet.findOne({
        userId: payment.userId,
        'transactions.referenceId': payment.orderId,
      });

      if (existingWalletTx) {
        // Mark payment as PAID without crediting again
        claimedPayment.status = 'PAID';
        claimedPayment.verifiedAt = new Date();
        claimedPayment.bankTxnId = paytmResult.bankTxnId || claimedPayment.bankTxnId;
        claimedPayment.gatewayResponse = paytmResult.raw;
        await claimedPayment.save();

        return {
          success: true,
          status: 'paid',
          alreadyCredited: true,
          amount: creditAmount,
          newBalance: existingWalletTx.balance,
          bankTxnId: claimedPayment.bankTxnId,
          message: 'Payment already credited.',
        };
      }

      // 5. Finalize promo code redemption if present
      let bonusAmount = 0;
      if (payment.promoCode) {
        const promoRes = await finalizePromoRedemption(payment.orderId);
        if (promoRes.success && !promoRes.alreadyFinalized) {
          bonusAmount = promoRes.bonusAmount || payment.bonusAmount || 0;
        }
      }

      // Compute ledger amounts
      const purchasedCredit = creditAmount;
      const promotionalCredit = bonusAmount;
      const totalCredit = creditAmount + (payment.discountAmount ? 0 : promotionalCredit);

      const transactionsToPush: any[] = [
        {
          amount: creditAmount,
          type: 'credit',
          category: 'WALLET_TOPUP',
          docType: 'TOPUP',
          referenceId: payment.orderId,
          description: `Paytm UPI Recharge (${payment.upiId})`,
          balanceAfter: 0,
          isPromotional: false,
          createdAt: new Date(),
        },
      ];

      if (promotionalCredit > 0) {
        transactionsToPush.push({
          amount: promotionalCredit,
          type: 'credit',
          category: 'PROMO_BONUS',
          docType: 'TOPUP',
          referenceId: `PROMO-${payment.orderId}`,
          description: `Promotional Bonus (${payment.promoCode})`,
          balanceAfter: 0,
          isPromotional: true,
          promoCode: payment.promoCode,
          promoCodeId: payment.promoCodeId,
          createdAt: new Date(),
        });
      }

      // 6. Atomically credit user's wallet with purchased and promotional breakdown
      const updatedWallet = await Wallet.findOneAndUpdate(
        { userId: payment.userId },
        {
          $inc: {
            balance: totalCredit,
            totalCredited: totalCredit,
            purchasedBalance: purchasedCredit,
            promotionalBalance: promotionalCredit,
          },
          $push: {
            transactions: { $each: transactionsToPush },
          },
        },
        { new: true, upsert: true }
      );

      // Patch balanceAfter on the newly pushed transactions
      if (updatedWallet && updatedWallet.transactions.length > 0) {
        const txLen = updatedWallet.transactions.length;
        if (promotionalCredit > 0 && txLen >= 2) {
          updatedWallet.transactions[txLen - 2].balanceAfter =
            updatedWallet.balance - promotionalCredit;
          updatedWallet.transactions[txLen - 1].balanceAfter = updatedWallet.balance;
        } else if (txLen >= 1) {
          updatedWallet.transactions[txLen - 1].balanceAfter = updatedWallet.balance;
        }
        await updatedWallet.save();
      }

      // 7. Transition payment status to PAID
      claimedPayment.status = 'PAID';
      claimedPayment.bankTxnId = paytmResult.bankTxnId || claimedPayment.bankTxnId;
      claimedPayment.gatewayResponse = paytmResult.raw;
      claimedPayment.verifiedAt = new Date();
      await claimedPayment.save();

      // 8. Qualify and reward referral program if eligible
      try {
        await qualifyAndRewardReferral(
          payment.userId.toString(),
          payment.orderId,
          creditAmount
        );
      } catch (refErr) {
        console.error('[Payment] Error during referral qualification:', refErr);
      }

      await logAuditEvent({
        actorId: payment.userId,
        action: 'WALLET_PAYMENT_VERIFIED',
        resourceType: 'PAYMENT',
        resourceId: payment.orderId,
        details: {
          amount: creditAmount,
          bonusAmount: promotionalCredit,
          totalCredit,
          promoCode: payment.promoCode,
          bankTxnId: claimedPayment.bankTxnId,
          newBalance: updatedWallet?.balance,
        },
        status: 'SUCCESS',
      });

      const successMsg = promotionalCredit > 0
        ? `Payment successful! ₹${creditAmount.toFixed(2)} + ₹${promotionalCredit.toFixed(2)} promo bonus credited to your wallet.`
        : `Payment successful! ₹${creditAmount.toFixed(2)} credited to your wallet.`;

      return {
        success: true,
        status: 'paid',
        amount: creditAmount,
        bonusAmount: promotionalCredit,
        totalCredit,
        promoCode: payment.promoCode,
        newBalance: updatedWallet ? updatedWallet.balance : totalCredit,
        promotionalBalance: updatedWallet ? updatedWallet.promotionalBalance : promotionalCredit,
        purchasedBalance: updatedWallet ? updatedWallet.purchasedBalance : purchasedCredit,
        bankTxnId: claimedPayment.bankTxnId,
        message: successMsg,
      };
    }

    if (paytmResult.status === 'failed') {
      if (payment.promoCode) {
        await failPromoRedemption(payment.orderId, paytmResult.respMsg);
      }
      payment.status = 'FAILED';
      payment.gatewayResponse = paytmResult.raw;
      await payment.save();

      return {
        success: false,
        status: 'failed',
        error: paytmResult.respMsg || 'Payment failed at gateway.',
      };
    }

    return {
      success: true,
      status: 'pending',
      message: paytmResult.respMsg || 'Waiting for payment confirmation...',
    };
  } catch (err: any) {
    console.error('[Paytm] Error verifying and crediting payment:', err);
    return {
      success: false,
      status: 'failed',
      error: err.message || 'Failed to verify transaction',
    };
  }
}
