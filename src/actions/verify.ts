'use server';

import { DocumentType } from '@/types/cards';
import { executeProviderCascade } from '@/lib/verify/orchestrator';
import { getProvidersForDocType } from '@/lib/verify/providerFactory';
import { VerificationResult } from '@/lib/verify/types';

/**
 * Server Action for document verification with automatic silent cascading and secret isolation.
 * Strictly executes server-side, protecting third-party vendor credentials.
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

  const providers = getProvidersForDocType(docType);
  return await executeProviderCascade(docType, sanitizedId, providers);
}
