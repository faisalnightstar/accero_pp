import { DocumentType } from '@/types/cards';

export type ProviderStatusCode = 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'PARTIAL';

export const PROVIDER_STATUS = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  TIMEOUT: 'TIMEOUT',
  PARTIAL: 'PARTIAL',
} as const;

export interface ProviderAttemptSummary {
  version: 'v1' | 'v2';
  success: boolean;
  statusCode?: number;
  errorCode?: string;
  latencyMs: number;
}

export interface VerificationResult<T = Record<string, any>> {
  success: boolean;
  documentType: DocumentType;
  idNumber: string;
  data: Partial<T>;
  provider?: string;
  providerVersion?: 'v1' | 'v2';
  fallbackUsed?: boolean;
  errorCode?: string;
  docId?: string;
  attempts?: ProviderAttemptSummary[];
  isPartial: boolean;
  errorMessage?: string;
  statusCode?: number;
  latencyMs?: number;
  feeDeducted?: number;
  requiredFee?: number;
  currentBalance?: number;
  isFreeReprint?: boolean;
}

export interface ProviderAdapter {
  name: string;
  supports(docType: DocumentType): boolean;
  lookup(docType: DocumentType, idNumber: string): Promise<VerificationResult>;
}
