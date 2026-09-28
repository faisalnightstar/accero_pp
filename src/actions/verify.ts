'use server';

import { DocumentType } from '@/types/cards';
import { executeProviderCascade } from '@/lib/verify/orchestrator';
import { getProvidersForDocType } from '@/lib/verify/providerFactory';
import { VerificationResult } from '@/lib/verify/types';
import { getSession } from '@/lib/auth';
import { getRequiredServiceFee } from '@/lib/wallet/pricing';
import { getWalletBalance, deductWalletFee } from '@/actions/wallet';

/**
 * Server Action for document verification with automatic silent cascading and secret isolation.
 * Strictly executes server-side, protecting third-party vendor credentials.
 * Integrates D-01/D-02: Pre-check wallet balance, atomic deduction only on success, ₹0 on error/re-print.
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

  // 2. Check service fee & free re-print status
  const { fee, isFreeReprint } = await getRequiredServiceFee(
    session.userId,
    docType,
    sanitizedId,
    false
  );

  // 3. Pre-flight wallet balance check (if not free reprint)
  if (!isFreeReprint && fee > 0) {
    const balanceResult = await getWalletBalance();
    if (!balanceResult.success || balanceResult.balance < fee) {
      return {
        success: false,
        documentType: docType,
        idNumber: sanitizedId,
        data: {},
        isPartial: false,
        errorMessage: 'INSUFFICIENT_BALANCE',
        requiredFee: fee,
        currentBalance: balanceResult.balance || 0,
        isFreeReprint: false,
      };
    }
  }

  // 4. Execute external provider cascade
  const providers = getProvidersForDocType(docType);
  const result = await executeProviderCascade(docType, sanitizedId, providers);

  // 5. If lookup succeeded:
  if (result.success) {
    if (isFreeReprint || fee === 0) {
      // Document was already generated/paid: 100% free re-print!
      result.feeDeducted = 0;
      result.isFreeReprint = true;
    } else {
      // Atomically deduct the fee
      const deduction = await deductWalletFee(
        docType,
        sanitizedId,
        `${docType.toUpperCase()} Verification Fee (${sanitizedId})`
      );

      if (deduction.success) {
        result.feeDeducted = fee;
        result.isFreeReprint = false;
        result.currentBalance = deduction.balanceAfter;
      } else {
        // In rare race condition where balance dropped during API call
        console.warn('[Verify] Post-lookup deduction failed:', deduction.error);
        result.feeDeducted = 0;
        result.isFreeReprint = false;
      }
    }
  } else {
    // 6. Zero deduction on failed or timed-out lookups
    result.feeDeducted = 0;
    result.isFreeReprint = isFreeReprint;
  }

  return result;
}
