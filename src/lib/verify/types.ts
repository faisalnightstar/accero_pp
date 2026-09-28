import { DocumentType } from '@/types/cards';

export type ProviderStatusCode = 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'PARTIAL';

export const PROVIDER_STATUS = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  TIMEOUT: 'TIMEOUT',
  PARTIAL: 'PARTIAL',
} as const;

export interface VerificationResult<T = Record<string, any>> {
  success: boolean;
  documentType: DocumentType;
  idNumber: string;
  data: Partial<T>;
  provider?: string;
  isPartial: boolean;
  errorMessage?: string;
  statusCode?: number;
  latencyMs?: number;
}

export interface ProviderAdapter {
  name: string;
  supports(docType: DocumentType): boolean;
  lookup(docType: DocumentType, idNumber: string): Promise<VerificationResult>;
}
