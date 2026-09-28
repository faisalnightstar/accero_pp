import { DocumentType } from '@/types/cards';
import { ProviderAdapter } from './types';
import { FastNexoraProvider } from './providers/fastnexora';
import { NeoApiProvider } from './providers/neoapi';
import { AxenApiProvider } from './providers/axenapi';
import { MockProvider } from './providers/mock';

/**
 * Returns prioritized array of verification providers for a document type.
 * Enforces automatic silent cascading: Primary -> Fallback -> Mock (in dev/demo mode).
 */
export function getProvidersForDocType(docType: DocumentType): ProviderAdapter[] {
  const isDevOrDemo =
    process.env.NODE_ENV !== 'production' ||
    !process.env.NEO_API_KEY ||
    !process.env.AXEN_API_KEY ||
    !process.env.FASTNEXORA_API_KEY;

  switch (docType) {
    case 'pan': {
      // Primary: NeoAPI -> Fallback: Mock in dev/demo
      const list: ProviderAdapter[] = [new NeoApiProvider()];
      if (isDevOrDemo) list.push(new MockProvider());
      return list;
    }

    case 'voter': {
      // Primary: FastNexora (direct non-captcha) -> Secondary: NeoAPI -> Fallback: Mock in dev/demo
      const list: ProviderAdapter[] = [new FastNexoraProvider(), new NeoApiProvider()];
      if (isDevOrDemo) list.push(new MockProvider());
      return list;
    }

    case 'dl': {
      // Primary: AxenAPI -> Fallback: Mock in dev/demo
      const list: ProviderAdapter[] = [new AxenApiProvider()];
      if (isDevOrDemo) list.push(new MockProvider());
      return list;
    }

    case 'rc': {
      // Primary: AxenAPI -> Fallback: Mock in dev/demo
      const list: ProviderAdapter[] = [new AxenApiProvider()];
      if (isDevOrDemo) list.push(new MockProvider());
      return list;
    }

    case 'aadhaar':
    default: {
      return [new MockProvider()];
    }
  }
}
