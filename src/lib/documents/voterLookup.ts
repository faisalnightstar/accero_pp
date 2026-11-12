import crypto from 'crypto';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import VerificationRequest from '@/models/VerificationRequest';
import { VerificationResult } from '@/lib/verify/types';
import { validateEpicNumber } from '@/lib/verify/validators';
import { getProvidersForDocType } from '@/lib/verify/providerFactory';
import { executeProviderCascade } from '@/lib/verify/orchestrator';
import {
  findCachedDocument,
  findExistingDocumentRecord,
  saveDocumentToCache,
} from './documentCache';
import {
  buildVoterLookupReferenceId,
  getConfiguredServicePricing,
  hasPaidVoterLookupEntitlement,
} from '@/lib/wallet/pricing';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { logAuditEvent } from '@/lib/logger/audit';
import { maskIdentifier } from '@/lib/network/proxy-config';

export interface VoterLookupParams {
  userId: string;
  epicNumber: string;
  requestId?: string;
}

/**
 * In-process concurrency deduplication map keyed by `userId:VOTER:EPIC`.
 * Collapses simultaneous requests (e.g., double-clicks) within the same worker
 * so only one NeoAPI request and one wallet charge execute.
 */
const inFlightVoterLookups = new Map<string, Promise<VerificationResult>>();

function canQueryModel(modelFn: unknown): boolean {
  return (
    mongoose.connection?.readyState === 1 ||
    typeof (modelFn as any)?.mock !== 'undefined'
  );
}

async function resolveQuery<T = any>(q: any): Promise<T | null> {
  if (!q) return null;
  if (typeof q.lean === 'function') {
    return await q.lean();
  }
  return await q;
}

const maskEpicForLog = maskIdentifier;

async function getSafeBalance(userId: string): Promise<number> {
  try {
    if (!canQueryModel(Wallet?.findOne)) return 0;
    await connectToDatabase();
    const wallet = await resolveQuery<any>(
      Wallet.findOne({ userId: new mongoose.Types.ObjectId(userId) })
    );
    return typeof wallet?.balance === 'number' ? wallet.balance : 0;
  } catch {
    return 0;
  }
}

async function recordVerificationRequest(params: {
  requestId: string;
  userId: mongoose.Types.ObjectId;
  idNumber: string;
  fee: number;
  status: 'RESERVED' | 'COMPLETED' | 'REFUNDED' | 'FAILED';
  provider?: string;
  providerVersion?: string;
  fallbackUsed?: boolean;
  transactionReferenceId?: string;
  documentId?: mongoose.Types.ObjectId;
  refundReason?: string;
}): Promise<void> {
  if (!canQueryModel(VerificationRequest?.findOneAndUpdate)) return;

  try {
    await VerificationRequest.findOneAndUpdate(
      { requestId: params.requestId },
      {
        $set: {
          userId: params.userId,
          docType: 'VOTER',
          idNumber: params.idNumber,
          fee: params.fee,
          status: params.status,
          ...(params.provider ? { provider: params.provider } : {}),
          ...(params.providerVersion ? { providerVersion: params.providerVersion } : {}),
          ...(typeof params.fallbackUsed === 'boolean' ? { fallbackUsed: params.fallbackUsed } : {}),
          ...(params.transactionReferenceId ? { transactionReferenceId: params.transactionReferenceId } : {}),
          ...(params.documentId ? { documentId: params.documentId } : {}),
          ...(params.refundReason ? { refundReason: params.refundReason } : {}),
        },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.warn('[VoterLookup] Non-fatal error recording VerificationRequest:', err);
  }
}

async function patchWalletTxBalances(
  updatedWallet: any,
  fee: number,
  isCredit = false
): Promise<void> {
  if (!updatedWallet?.transactions?.length) return;
  const lastTx = updatedWallet.transactions[updatedWallet.transactions.length - 1];
  const balanceAfter = updatedWallet.balance;
  const balanceBefore = isCredit ? balanceAfter - fee : balanceAfter + fee;

  if (lastTx._id && canQueryModel(Wallet?.updateOne)) {
    try {
      await Wallet.updateOne(
        { _id: updatedWallet._id, 'transactions._id': lastTx._id },
        {
          $set: {
            'transactions.$.balanceBefore': balanceBefore,
            'transactions.$.balanceAfter': balanceAfter,
          },
        }
      );
      return;
    } catch {
      // Fall back to document save if targeted update is unsupported in mock
    }
  }

  lastTx.balanceBefore = balanceBefore;
  lastTx.balanceAfter = balanceAfter;
  if (typeof updatedWallet.save === 'function') {
    await updatedWallet.save();
  }
}

/**
 * Executes the complete NeoAPI V1/V2 Voter lookup + lookup-time billing workflow:
 * 1. Validates EPIC input strictly before any external call.
 * 2. Checks MongoDB 72h cache scoped to authenticated userId (free reuse on cache hit).
 * 3. Deduplicates concurrent in-flight requests per user + EPIC.
 * 4. Calls NeoAPI V1 (primary) with automatic fallback to NeoAPI V2 on failure.
 * 5. Validates response strictly; zero charges on any failure or malformed data.
 * 6. Checks existing paid entitlement (isPaid / VerificationRequest / ledger; NEVER printCount).
 * 7. Checks wallet balance & atomically debits configured fee with deterministic referenceId.
 * 8. Saves/updates DocumentRecord with isPaid: true while preserving existing user edits.
 * 9. Automatically refunds wallet & marks VerificationRequest REFUNDED if DB save fails post-debit.
 */
export async function lookupAndBillVoter({
  userId,
  epicNumber,
  requestId,
}: VoterLookupParams): Promise<VerificationResult> {
  const startTime = Date.now();

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return {
      success: false,
      documentType: 'voter',
      idNumber: (epicNumber || '').trim().toUpperCase(),
      data: {},
      isPartial: false,
      errorCode: 'UNAUTHORIZED',
      errorMessage: 'Please sign in to verify documents.',
      feeDeducted: 0,
      latencyMs: Date.now() - startTime,
    };
  }

  const epicCheck = validateEpicNumber(epicNumber);
  if (!epicCheck.valid) {
    return {
      success: false,
      documentType: 'voter',
      idNumber: epicCheck.normalized,
      data: {},
      isPartial: false,
      errorCode: 'INVALID_EPIC',
      errorMessage: epicCheck.errorMessage,
      feeDeducted: 0,
      latencyMs: Date.now() - startTime,
    };
  }

  const normalizedEpic = epicCheck.normalized;
  const maskedEpic = maskEpicForLog(normalizedEpic);

  console.log('[VoterLookup] Start', {
    epic: maskedEpic,
    hasRequestId: Boolean(requestId),
  });

  const rateLimit = await checkRateLimit('DOC_LOOKUP', userId);
  if (!rateLimit.allowed) {
    console.warn('[VoterLookup] Rate limited', {
      epic: maskedEpic,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
    return {
      success: false,
      documentType: 'voter',
      idNumber: normalizedEpic,
      data: {},
      isPartial: false,
      errorCode: 'RATE_LIMITED',
      errorMessage: `Too many lookup requests. Please wait ${rateLimit.retryAfterSeconds}s before searching again.`,
      feeDeducted: 0,
      latencyMs: Date.now() - startTime,
    };
  }

  const serviceConfig = await getConfiguredServicePricing('VOTER');
  if (!serviceConfig.enabled || serviceConfig.maintenanceMode) {
    console.warn('[VoterLookup] Service disabled or in maintenance', {
      epic: maskedEpic,
      enabled: serviceConfig.enabled,
      maintenanceMode: serviceConfig.maintenanceMode,
    });
    return {
      success: false,
      documentType: 'voter',
      idNumber: normalizedEpic,
      data: {},
      isPartial: false,
      errorCode: 'SERVICE_UNAVAILABLE',
      errorMessage:
        serviceConfig.maintenanceNotice ||
        'Voter ID lookup service is temporarily unavailable. No wallet amount was charged.',
      feeDeducted: 0,
      latencyMs: Date.now() - startTime,
    };
  }

  // Step 1: Check valid 72h MongoDB cache for this user
  const cachedDoc = await findCachedDocument({
    userId,
    docType: 'VOTER',
    documentNumber: normalizedEpic,
  });

  if (cachedDoc && cachedDoc.data && Object.keys(cachedDoc.data).length > 0) {
    console.log('[VoterLookup] Cache hit (72h MongoDB cache)', {
      epic: maskedEpic,
      provider: cachedDoc.provider || 'Cache',
    });
    const currentBalance = await getSafeBalance(userId);
    await logAuditEvent({
      actorId: userId,
      action: 'DOCUMENT_CACHE_HIT',
      resourceType: 'DOCUMENT',
      resourceId: maskEpicForLog(normalizedEpic),
      details: {
        docType: 'VOTER',
        expiresAt: cachedDoc.expiresAt,
        fetchedAt: cachedDoc.fetchedAt,
        source: cachedDoc.source || 'CACHE',
      },
      status: 'SUCCESS',
    });

    return {
      success: true,
      documentType: 'voter',
      idNumber: normalizedEpic,
      data: cachedDoc.data,
      provider: cachedDoc.provider || 'NeoAPI',
      isPartial: !cachedDoc.isComplete,
      docId: cachedDoc._id.toString(),
      feeDeducted: 0,
      isFreeReprint: true,
      currentBalance,
      latencyMs: Date.now() - startTime,
    };
  }

  // Step 2: Process-local concurrency deduplication
  const inflightKey = `${userId}:VOTER:${normalizedEpic}`;
  const existingInflight = inFlightVoterLookups.get(inflightKey);
  if (existingInflight) {
    const sharedResult = await existingInflight;
    if (!sharedResult.success) {
      return sharedResult;
    }
    return {
      ...sharedResult,
      feeDeducted: 0,
      isFreeReprint: true,
    };
  }

  const lookupPromise = executeVoterLookupInternal({
    userId,
    normalizedEpic,
    requestId,
    fee: serviceConfig.fee,
    startTime,
  }).finally(() => {
    inFlightVoterLookups.delete(inflightKey);
  });

  inFlightVoterLookups.set(inflightKey, lookupPromise);
  return await lookupPromise;
}

async function executeVoterLookupInternal({
  userId,
  normalizedEpic,
  requestId,
  fee,
  startTime,
}: {
  userId: string;
  normalizedEpic: string;
  requestId?: string;
  fee: number;
  startTime: number;
}): Promise<VerificationResult> {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const txReferenceId = buildVoterLookupReferenceId(userId, normalizedEpic);
  const attemptRequestId = requestId?.trim() || `vr_${crypto.randomUUID()}`;

  // Idempotency check if caller supplied an explicit requestId that already completed
  if (requestId?.trim() && canQueryModel(VerificationRequest?.findOne)) {
    const prevReq = await resolveQuery<any>(
      VerificationRequest.findOne({ requestId: requestId.trim(), userId: userObjectId })
    );
    if (prevReq?.status === 'COMPLETED') {
      const existingDoc = await findExistingDocumentRecord({
        userId,
        docType: 'VOTER',
        documentNumber: normalizedEpic,
      });
      if (existingDoc?.data && Object.keys(existingDoc.data).length > 0) {
        const currentBalance = await getSafeBalance(userId);
        return {
          success: true,
          documentType: 'voter',
          idNumber: normalizedEpic,
          data: existingDoc.data,
          provider: existingDoc.provider || 'NeoAPI',
          isPartial: !existingDoc.isComplete,
          docId: existingDoc._id?.toString(),
          feeDeducted: 0,
          isFreeReprint: true,
          currentBalance,
          latencyMs: Date.now() - startTime,
        };
      }
    }
  }

  // Step 3: Execute NeoAPI V1 -> V2 Lookup
  const providers = getProvidersForDocType('voter');
  console.log('[VoterLookup] Executing provider cascade', {
    epic: maskEpicForLog(normalizedEpic),
    providers: providers.map((p) => p.name),
    fee,
  });
  if (providers.length === 0) {
    console.warn('[VoterLookup] No voter providers configured', {
      epic: maskEpicForLog(normalizedEpic),
    });
    const currentBalance = await getSafeBalance(userId);
    return {
      success: false,
      documentType: 'voter',
      idNumber: normalizedEpic,
      data: {},
      isPartial: false,
      errorCode: 'NO_PROVIDER',
      errorMessage: 'Voter verification provider is not configured. No wallet amount was charged.',
      feeDeducted: 0,
      currentBalance,
      latencyMs: Date.now() - startTime,
    };
  }

  const cascadeResult = await executeProviderCascade('voter', normalizedEpic, providers);

  // Never charge or overwrite existing records on provider failure
  if (!cascadeResult.success || !cascadeResult.data || Object.keys(cascadeResult.data).length === 0) {
    console.warn('[VoterLookup] Provider cascade failed', {
      epic: maskEpicForLog(normalizedEpic),
      provider: cascadeResult.provider || 'NeoAPI',
      providerVersion: cascadeResult.providerVersion,
      errorCode: cascadeResult.errorCode || 'LOOKUP_FAILED',
      errorMessage: cascadeResult.errorMessage,
      latencyMs: cascadeResult.latencyMs,
    });
    const currentBalance = await getSafeBalance(userId);
    return {
      success: false,
      documentType: 'voter',
      idNumber: normalizedEpic,
      data: {},
      provider: cascadeResult.provider || 'NeoAPI',
      providerVersion: cascadeResult.providerVersion,
      fallbackUsed: cascadeResult.fallbackUsed,
      errorCode: cascadeResult.errorCode || 'LOOKUP_FAILED',
      statusCode: cascadeResult.statusCode,
      attempts: cascadeResult.attempts,
      isPartial: false,
      errorMessage:
        cascadeResult.errorMessage ||
        'Unable to retrieve Voter record. No wallet amount was charged.',
      feeDeducted: 0,
      currentBalance,
      latencyMs: Date.now() - startTime,
    };
  }

  console.log('[VoterLookup] Provider cascade succeeded', {
    epic: maskEpicForLog(normalizedEpic),
    provider: cascadeResult.provider || 'NeoAPI',
    providerVersion: cascadeResult.providerVersion,
    fallbackUsed: Boolean(cascadeResult.fallbackUsed),
    latencyMs: cascadeResult.latencyMs,
  });

  // Step 4: Check existing paid entitlement (NEVER uses printCount as proof of lookup payment)
  const alreadyPaid = await hasPaidVoterLookupEntitlement(userId, normalizedEpic);

  if (alreadyPaid || fee <= 0) {
    const savedDoc = await saveDocumentToCache({
      userId,
      docType: 'VOTER',
      documentNumber: normalizedEpic,
      data: cascadeResult.data,
      provider: cascadeResult.provider || 'NeoAPI',
      source: 'API',
      inputMode: 'API',
      isPaid: true,
      paymentReferenceId: txReferenceId,
    });

    const currentBalance = await getSafeBalance(userId);
    return {
      success: true,
      documentType: 'voter',
      idNumber: normalizedEpic,
      data: savedDoc?.data || cascadeResult.data,
      provider: cascadeResult.provider || 'NeoAPI',
      providerVersion: cascadeResult.providerVersion,
      fallbackUsed: cascadeResult.fallbackUsed,
      attempts: cascadeResult.attempts,
      isPartial: savedDoc ? !savedDoc.isComplete : cascadeResult.isPartial,
      docId: savedDoc?._id?.toString(),
      feeDeducted: 0,
      isFreeReprint: true,
      currentBalance,
      latencyMs: Date.now() - startTime,
    };
  }

  // Step 5: Check wallet balance BEFORE atomic debit
  await connectToDatabase();
  const wallet = await resolveQuery<any>(Wallet.findOne({ userId: userObjectId }));
  const availableBalance = typeof wallet?.balance === 'number' ? wallet.balance : 0;

  if (!wallet || availableBalance < fee) {
    // Crucial: Never save unpaid fetched result as completed record
    return {
      success: false,
      documentType: 'voter',
      idNumber: normalizedEpic,
      data: {},
      provider: cascadeResult.provider || 'NeoAPI',
      isPartial: false,
      errorCode: 'INSUFFICIENT_BALANCE',
      errorMessage: 'INSUFFICIENT_BALANCE',
      requiredFee: fee,
      currentBalance: availableBalance,
      feeDeducted: 0,
      latencyMs: Date.now() - startTime,
    };
  }

  // Step 6: Reserve verification billing state
  await recordVerificationRequest({
    requestId: attemptRequestId,
    userId: userObjectId,
    idNumber: normalizedEpic,
    fee,
    status: 'RESERVED',
    provider: cascadeResult.provider || 'NeoAPI',
    providerVersion: cascadeResult.providerVersion,
    fallbackUsed: cascadeResult.fallbackUsed,
    transactionReferenceId: txReferenceId,
  });

  // Step 7: Atomic conditional debit + immutable ledger entry (prevents double-debit under concurrency)
  const updatedWallet = await Wallet.findOneAndUpdate(
    {
      userId: userObjectId,
      balance: { $gte: fee },
      transactions: {
        $not: {
          $elemMatch: {
            referenceId: txReferenceId,
            type: 'debit',
            status: 'COMPLETED',
          },
        },
      },
    },
    {
      $inc: { balance: -fee, totalDebited: fee },
      $push: {
        transactions: {
          amount: fee,
          type: 'debit',
          category: 'VERIFICATION',
          docType: 'VOTER',
          documentType: 'VOTER',
          referenceId: txReferenceId,
          description: `Voter ID Lookup Fee (${normalizedEpic})`,
          balanceBefore: 0,
          balanceAfter: 0,
          status: 'COMPLETED',
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  );

  if (!updatedWallet) {
    const latestWallet = await resolveQuery<any>(Wallet.findOne({ userId: userObjectId }));
    const alreadyDebitedBySibling = Boolean(
      latestWallet?.transactions?.some(
        (t: any) =>
          t.referenceId === txReferenceId && t.type === 'debit' && t.status === 'COMPLETED'
      )
    );

    if (alreadyDebitedBySibling) {
      await recordVerificationRequest({
        requestId: attemptRequestId,
        userId: userObjectId,
        idNumber: normalizedEpic,
        fee: 0,
        status: 'FAILED',
        refundReason: 'CONCURRENT_DUPLICATE_PREVENTED',
      });

      const savedDoc = await saveDocumentToCache({
        userId,
        docType: 'VOTER',
        documentNumber: normalizedEpic,
        data: cascadeResult.data,
        provider: cascadeResult.provider || 'NeoAPI',
        source: 'API',
        inputMode: 'API',
        isPaid: true,
        paymentReferenceId: txReferenceId,
      });

      return {
        success: true,
        documentType: 'voter',
        idNumber: normalizedEpic,
        data: savedDoc?.data || cascadeResult.data,
        provider: cascadeResult.provider || 'NeoAPI',
        providerVersion: cascadeResult.providerVersion,
        fallbackUsed: cascadeResult.fallbackUsed,
        attempts: cascadeResult.attempts,
        isPartial: savedDoc ? !savedDoc.isComplete : cascadeResult.isPartial,
        docId: savedDoc?._id?.toString(),
        feeDeducted: 0,
        isFreeReprint: true,
        currentBalance: latestWallet?.balance ?? 0,
        latencyMs: Date.now() - startTime,
      };
    }

    // Balance dropped concurrently below fee
    await recordVerificationRequest({
      requestId: attemptRequestId,
      userId: userObjectId,
      idNumber: normalizedEpic,
      fee,
      status: 'FAILED',
      refundReason: 'INSUFFICIENT_BALANCE',
    });

    return {
      success: false,
      documentType: 'voter',
      idNumber: normalizedEpic,
      data: {},
      isPartial: false,
      errorCode: 'INSUFFICIENT_BALANCE',
      errorMessage: 'INSUFFICIENT_BALANCE',
      requiredFee: fee,
      currentBalance: latestWallet?.balance ?? 0,
      feeDeducted: 0,
      latencyMs: Date.now() - startTime,
    };
  }

  await patchWalletTxBalances(updatedWallet, fee, false);

  // Step 8: Persist normalized Voter document with explicit isPaid entitlement
  let savedDoc = null;
  try {
    savedDoc = await saveDocumentToCache({
      userId,
      docType: 'VOTER',
      documentNumber: normalizedEpic,
      data: cascadeResult.data,
      provider: cascadeResult.provider || 'NeoAPI',
      source: 'API',
      inputMode: 'API',
      isPaid: true,
      paidAt: new Date(),
      paymentReferenceId: txReferenceId,
    });
  } catch (saveErr) {
    console.error('[VoterLookup] Document save threw after wallet debit:', saveErr);
    savedDoc = null;
  }

  // Step 9: Crash / Save-Failure Recovery -> Compensating Atomic Refund
  if (!savedDoc) {
    const refundRefId = `REFUND:${attemptRequestId}`;
    let restoredBalance = updatedWallet.balance + fee;

    try {
      if (canQueryModel(Wallet?.updateOne)) {
        await Wallet.updateOne(
          {
            userId: userObjectId,
            'transactions.referenceId': txReferenceId,
            'transactions.type': 'debit',
            'transactions.status': 'COMPLETED',
          },
          {
            $set: { 'transactions.$.status': 'FAILED' },
          }
        );
      }

      const refundedWallet = await Wallet.findOneAndUpdate(
        {
          userId: userObjectId,
          'transactions.referenceId': { $ne: refundRefId },
        },
        {
          $inc: { balance: fee, totalCredited: fee },
          $push: {
            transactions: {
              amount: fee,
              type: 'credit',
              category: 'VERIFICATION_REFUND',
              docType: 'VOTER',
              documentType: 'VOTER',
              referenceId: refundRefId,
              description: `Auto-refund: Voter lookup save failed (${normalizedEpic})`,
              balanceBefore: 0,
              balanceAfter: 0,
              status: 'COMPLETED',
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      );

      if (refundedWallet) {
        await patchWalletTxBalances(refundedWallet, fee, true);
        restoredBalance = refundedWallet.balance;
      }
    } catch (refundErr) {
      console.error('[VoterLookup] Critical error during compensating refund:', refundErr);
    }

    await recordVerificationRequest({
      requestId: attemptRequestId,
      userId: userObjectId,
      idNumber: normalizedEpic,
      fee,
      status: 'REFUNDED',
      provider: cascadeResult.provider || 'NeoAPI',
      providerVersion: cascadeResult.providerVersion,
      fallbackUsed: cascadeResult.fallbackUsed,
      transactionReferenceId: txReferenceId,
      refundReason: 'DOCUMENT_SAVE_FAILED',
    });

    await logAuditEvent({
      actorId: userId,
      action: 'WALLET_DEDUCTION_REFUNDED',
      resourceType: 'WALLET',
      resourceId: attemptRequestId,
      details: {
        docType: 'VOTER',
        fee,
        reason: 'DOCUMENT_SAVE_FAILED',
        balanceAfter: restoredBalance,
      },
      status: 'WARNING',
    });

    return {
      success: false,
      documentType: 'voter',
      idNumber: normalizedEpic,
      data: {},
      isPartial: false,
      errorCode: 'SAVE_FAILED_REFUNDED',
      errorMessage:
        'Unable to save verified Voter record. Your wallet charge has been automatically refunded.',
      feeDeducted: 0,
      currentBalance: restoredBalance,
      latencyMs: Date.now() - startTime,
    };
  }

  // Step 10: Finalize VerificationRequest & Audit Logs
  await recordVerificationRequest({
    requestId: attemptRequestId,
    userId: userObjectId,
    idNumber: normalizedEpic,
    fee,
    status: 'COMPLETED',
    provider: cascadeResult.provider || 'NeoAPI',
    providerVersion: cascadeResult.providerVersion,
    fallbackUsed: cascadeResult.fallbackUsed,
    transactionReferenceId: txReferenceId,
    documentId: savedDoc._id as mongoose.Types.ObjectId,
  });

  await logAuditEvent({
    actorId: userId,
    action: 'WALLET_DEDUCTION_FINALIZED',
    resourceType: 'WALLET',
    resourceId: attemptRequestId,
    details: {
      docType: 'VOTER',
      fee,
      balanceAfter: updatedWallet.balance,
      providerVersion: cascadeResult.providerVersion,
      fallbackUsed: Boolean(cascadeResult.fallbackUsed),
    },
    status: 'SUCCESS',
  });

  await logAuditEvent({
    actorId: userId,
    action: 'DOCUMENT_API_FETCH_SUCCESS',
    resourceType: 'DOCUMENT',
    resourceId: maskEpicForLog(normalizedEpic),
    details: {
      docType: 'VOTER',
      provider: cascadeResult.provider || 'NeoAPI',
      providerVersion: cascadeResult.providerVersion,
      fallbackUsed: Boolean(cascadeResult.fallbackUsed),
      docId: savedDoc._id?.toString(),
      expiresAt: savedDoc.expiresAt,
    },
    status: 'SUCCESS',
  });

  return {
    success: true,
    documentType: 'voter',
    idNumber: normalizedEpic,
    data: savedDoc.data || cascadeResult.data,
    provider: cascadeResult.provider || 'NeoAPI',
    providerVersion: cascadeResult.providerVersion,
    fallbackUsed: cascadeResult.fallbackUsed,
    attempts: cascadeResult.attempts,
    isPartial: !savedDoc.isComplete,
    docId: savedDoc._id?.toString(),
    feeDeducted: fee,
    isFreeReprint: false,
    currentBalance: updatedWallet.balance,
    latencyMs: Date.now() - startTime,
  };
}
