import { DocumentType } from '@/types/cards';
import { ProviderAdapter } from './types';
import { FastNexoraProvider } from './providers/fastnexora';
import { NeoApiProvider } from './providers/neoapi';
import { AxenApiProvider } from './providers/axenapi';
import { MockProvider } from './providers/mock';

/**
 * Returns prioritized array of verification providers for a document type.
 * STRICT SECURITY: MockProvider is restricted to explicit development and test environments.
 * In production, MockProvider is NEVER included, preventing fictitious identity delivery.
 */
export function getProvidersForDocType(docType: DocumentType): ProviderAdapter[] {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowMock =
    !isProduction &&
    (process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'test' ||
      process.env.ALLOW_MOCK_PROVIDERS === 'true');

  const list: ProviderAdapter[] = [];

  switch (docType) {
    case 'pan': {
      if (process.env.NEO_API_KEY) {
        list.push(new NeoApiProvider());
      }
      if (allowMock) {
        list.push(new MockProvider());
      }
      return list;
    }

    case 'voter': {
      // NeoAPI V1 (primary) -> NeoAPI V2 (automatic fallback) inside NeoApiProvider
      if (process.env.NEO_API_KEY) {
        list.push(new NeoApiProvider());
      } else if (process.env.FASTNEXORA_API_KEY) {
        list.push(new FastNexoraProvider());
      }
      if (list.length === 0 && !isProduction && process.env.ALLOW_MOCK_PROVIDERS === 'true') {
        list.push(new MockProvider());
      }
      return list;
    }

    case 'dl': {
      if (process.env.AXEN_API_KEY) {
        list.push(new AxenApiProvider());
      }
      if (allowMock) {
        list.push(new MockProvider());
      }
      return list;
    }

    case 'rc': {
      if (process.env.AXEN_API_KEY) {
        list.push(new AxenApiProvider());
      }
      if (allowMock) {
        list.push(new MockProvider());
      }
      return list;
    }

    case 'aadhaar':
    default: {
      if (allowMock) {
        return [new MockProvider()];
      }
      // In production without live Aadhaar API, return empty list so system prompts manual entry
      return [];
    }
  }
}
