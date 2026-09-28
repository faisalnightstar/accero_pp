'use server';

import { DocumentType } from '@/types/cards';
import { executeProviderCascade } from '@/lib/verify/orchestrator';
import { FastNexoraProvider } from '@/lib/verify/providers/fastnexora';
import { NeoApiProvider } from '@/lib/verify/providers/neoapi';
import { MockProvider } from '@/lib/verify/providers/mock';
import { ProviderAdapter, VerificationResult } from '@/lib/verify/types';

function getActiveProviders(docType: DocumentType): ProviderAdapter[] {
  const isDevOrDemo = process.env.NODE_ENV !== 'production' || !process.env.NEO_API_KEY;

  switch (docType) {
    case 'pan': {
      const providers: ProviderAdapter[] = [new NeoApiProvider()];
      if (isDevOrDemo) {
        providers.push(new MockProvider());
      }
      return providers;
    }
    case 'voter': {
      // Prioritize FastNexora (direct non-captcha) -> NeoAPI -> Mock
      const providers: ProviderAdapter[] = [new FastNexoraProvider(), new NeoApiProvider()];
      if (isDevOrDemo) {
        providers.push(new MockProvider());
      }
      return providers;
    }
    default: {
      return [new MockProvider()];
    }
  }
}

/**
 * Server Action for document verification with automatic silent cascading and secret isolation
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

  const providers = getActiveProviders(docType);
  return await executeProviderCascade(docType, sanitizedId, providers);
}
