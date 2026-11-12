'use server';

import { DocumentType } from '@/types/cards';
import { VerificationResult } from '@/lib/verify/types';
import { getSession } from '@/lib/auth';
import { lookupDocument } from '@/lib/documents/documentLookup';
import { lookupAndBillVoter } from '@/lib/documents/voterLookup';
import { getConfiguredServicePricing } from '@/lib/wallet/pricing';
import { getWalletBalance } from '@/actions/wallet';
import { maskIdentifier } from '@/lib/network/proxy-config';

/**
 * Returns active server-configured pricing for a document service.
 */
export async function getServicePricingAction(docType: DocumentType): Promise<{
  fee: number;
  enabled: boolean;
  maintenanceMode: boolean;
}> {
  const pricing = await getConfiguredServicePricing(docType);
  return {
    fee: pricing.fee,
    enabled: pricing.enabled,
    maintenanceMode: pricing.maintenanceMode,
  };
}

/**
 * Server Action for document verification.
 *
 * Architecture:
 * - Voter (EPIC): NeoAPI V1 primary -> V2 automatic fallback; database-first 72h cache;
 *   charges configured Voter lookup fee once on successful external lookup (never on failure
 *   and never again on print).
 * - Other document types (PAN/Aadhaar/DL/RC): Preserves existing database-first lookup
 *   with print-time billing unchanged.
 */
export async function verifyDocument(
  docType: DocumentType,
  idNumber: string,
  requestId?: string
): Promise<VerificationResult> {
  const sanitizedId = (idNumber || '').trim().toUpperCase();
  const maskedId = maskIdentifier(sanitizedId);

  console.log('[VerifyAction] verifyDocument start', {
    docType,
    id: maskedId,
    hasRequestId: Boolean(requestId),
  });

  if (!sanitizedId) {
    console.warn('[VerifyAction] Empty document ID rejected', { docType });
    return {
      success: false,
      documentType: docType,
      idNumber: '',
      data: {},
      isPartial: false,
      errorMessage: 'Please enter a valid document number.',
    };
  }

  // 1. Authenticate user session
  const session = await getSession();
  if (!session?.userId) {
    console.warn('[VerifyAction] Unauthenticated session rejected', { docType, id: maskedId });
    return {
      success: false,
      documentType: docType,
      idNumber: sanitizedId,
      data: {},
      isPartial: false,
      errorMessage: 'Please sign in to verify documents.',
    };
  }

  // 2. Voter lookup uses lookup-time billing + NeoAPI V1/V2 fallback workflow
  if (docType === 'voter') {
    const voterResult = await lookupAndBillVoter({
      userId: session.userId,
      epicNumber: sanitizedId,
      requestId,
    });
    console.log('[VerifyAction] verifyDocument voter completed', {
      id: maskedId,
      success: voterResult.success,
      provider: voterResult.provider,
      providerVersion: voterResult.providerVersion,
      fallbackUsed: voterResult.fallbackUsed,
      errorCode: voterResult.errorCode,
      errorMessage: voterResult.errorMessage,
      feeDeducted: voterResult.feeDeducted,
      latencyMs: voterResult.latencyMs,
    });
    return voterResult;
  }

  // 3. Unrelated document types keep existing centralized database-first lookup untouched
  const lookup = await lookupDocument({
    userId: session.userId,
    docType,
    documentNumber: sanitizedId,
  });

  const walletRes = await getWalletBalance();
  const currentBalance = walletRes.success ? walletRes.balance : 0;

  if (!lookup.success) {
    console.warn('[VerifyAction] verifyDocument lookup failed', {
      docType,
      id: maskedId,
      provider: lookup.provider,
      errorMessage: lookup.errorMessage,
      latencyMs: lookup.latencyMs,
    });
    return {
      success: false,
      documentType: docType,
      idNumber: sanitizedId,
      data: {},
      isPartial: false,
      errorMessage: lookup.errorMessage || 'Document record not found.',
      feeDeducted: 0,
      currentBalance,
    };
  }

  console.log('[VerifyAction] verifyDocument succeeded', {
    docType,
    id: maskedId,
    provider: lookup.provider || (lookup.cache?.hit ? 'Cache (MongoDB 72h)' : 'Gateway'),
    cacheHit: Boolean(lookup.cache?.hit),
    latencyMs: lookup.latencyMs,
  });

  return {
    success: true,
    documentType: docType,
    idNumber: sanitizedId,
    data: lookup.data,
    isPartial: lookup.isPartial || false,
    provider: lookup.provider || (lookup.cache?.hit ? 'Cache (MongoDB 72h)' : 'Gateway'),
    docId: lookup.docId,
    feeDeducted: 0, // No deduction on preview/search for non-voter services
    isFreeReprint: lookup.cache?.hit,
    currentBalance,
    latencyMs: lookup.latencyMs,
  };
}
