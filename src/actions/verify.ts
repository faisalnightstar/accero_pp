'use server';

import { DocumentType } from '@/types/cards';
import { VerificationResult } from '@/lib/verify/types';
import { getSession } from '@/lib/auth';
import { lookupDocument } from '@/lib/documents/documentLookup';
import { getWalletBalance } from '@/actions/wallet';

/**
 * Server Action for document verification.
 * 
 * Architecture:
 * - Database-first lookup: Checks MongoDB for valid 72-hour cached document.
 * - NeoAPI/Axen/FastNexora is called ONLY when no valid cached record exists.
 * - Successfully retrieved documents are automatically cached in MongoDB with 72h expiration.
 * - Searching/Previewing documents does NOT deduct wallet balance (print authorization bills at print time).
 */
export async function verifyDocument(
  docType: DocumentType,
  idNumber: string
): Promise<VerificationResult> {
  const sanitizedId = (idNumber || '').trim().toUpperCase();

  if (!sanitizedId) {
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
    return {
      success: false,
      documentType: docType,
      idNumber: sanitizedId,
      data: {},
      isPartial: false,
      errorMessage: 'Please sign in to verify documents.',
    };
  }

  // 2. Execute centralized, database-first document lookup
  const lookup = await lookupDocument({
    userId: session.userId,
    docType,
    documentNumber: sanitizedId,
  });

  const walletRes = await getWalletBalance();
  const currentBalance = walletRes.success ? walletRes.balance : 0;

  if (!lookup.success) {
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

  return {
    success: true,
    documentType: docType,
    idNumber: sanitizedId,
    data: lookup.data,
    isPartial: lookup.isPartial || false,
    provider: lookup.provider || (lookup.cache?.hit ? 'Cache (MongoDB 72h)' : 'Gateway'),
    feeDeducted: 0, // No deduction on preview/search
    isFreeReprint: lookup.cache?.hit,
    currentBalance,
    latencyMs: lookup.latencyMs,
  };
}
