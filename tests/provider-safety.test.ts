import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getProvidersForDocType } from '@/lib/verify/providerFactory';

describe('MockProvider Production Isolation & Safety', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  it('NEVER includes MockProvider in production mode even if API keys are missing', () => {
    (process.env as any).NODE_ENV = 'production';
    delete process.env.NEO_API_KEY;
    delete process.env.AXEN_API_KEY;
    delete process.env.FASTNEXORA_API_KEY;

    const panProviders = getProvidersForDocType('pan');
    const voterProviders = getProvidersForDocType('voter');
    const dlProviders = getProvidersForDocType('dl');
    const rcProviders = getProvidersForDocType('rc');
    const aadhaarProviders = getProvidersForDocType('aadhaar');

    expect(panProviders.some((p) => p.name === 'MockSimulation')).toBe(false);
    expect(voterProviders.some((p) => p.name === 'MockSimulation')).toBe(false);
    expect(dlProviders.some((p) => p.name === 'MockSimulation')).toBe(false);
    expect(rcProviders.some((p) => p.name === 'MockSimulation')).toBe(false);
    expect(aadhaarProviders.some((p) => p.name === 'MockSimulation')).toBe(false);
  });

  it('includes MockProvider only in development/test when permitted', () => {
    (process.env as any).NODE_ENV = 'development';
    process.env.ALLOW_MOCK_PROVIDERS = 'true';

    const panProviders = getProvidersForDocType('pan');
    expect(panProviders.some((p) => p.name === 'MockSimulation')).toBe(true);
  });

  it('only returns real provider adapters when keys are configured in production', () => {
    (process.env as any).NODE_ENV = 'production';
    process.env.NEO_API_KEY = 'valid_neo_key';
    process.env.AXEN_API_KEY = 'valid_axen_key';
    process.env.FASTNEXORA_API_KEY = 'valid_fastnexora_key';

    const pan = getProvidersForDocType('pan');
    expect(pan.length).toBe(1);
    expect(pan[0].name).toBe('NeoAPI');

    const voter = getProvidersForDocType('voter');
    expect(voter.length).toBe(2);
    expect(voter[0].name).toBe('FastNexora');
    expect(voter[1].name).toBe('NeoAPI');

    const dl = getProvidersForDocType('dl');
    expect(dl.length).toBe(1);
    expect(dl[0].name).toBe('AxenAPI');

    const rc = getProvidersForDocType('rc');
    expect(rc.length).toBe(1);
    expect(rc[0].name).toBe('AxenAPI');
  });
});
