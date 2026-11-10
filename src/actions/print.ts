'use server';

import { getSession } from '@/lib/auth';
import { authorizePrint, AuthorizePrintResult } from '@/lib/print/printAuthorization';
import { PrintFormat } from '@/models/PrintJob';

export interface AuthorizePrintActionParams {
  documentType: string;
  cardIdentifier?: string;
  documentId?: string;
  printJobId: string;
  printFormat?: PrintFormat;
  metadata?: Record<string, any>;
}

/**
 * Server Action: Authorizes a document print job and deducts wallet fee atomically.
 */
export async function authorizePrintAction(
  params: AuthorizePrintActionParams
): Promise<AuthorizePrintResult> {
  const session = await getSession();
  if (!session?.userId) {
    return {
      success: false,
      printJobId: params.printJobId,
      fee: 0,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Please log in to print documents.',
      },
    };
  }

  return await authorizePrint({
    userId: session.userId,
    documentId: params.documentId,
    documentType: params.documentType,
    cardIdentifier: params.cardIdentifier,
    printJobId: params.printJobId,
    printFormat: params.printFormat,
    metadata: params.metadata,
  });
}

