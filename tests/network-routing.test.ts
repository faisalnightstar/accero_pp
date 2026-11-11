import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  PROVIDER_REGISTRY,
  getProviderById,
  getProviderByHostname,
  getProviderForUrl,
  shouldRouteViaFixie,
  validateProxyEligibility,
} from '@/lib/network/provider-registry';
import {
  parseFixieProxyUrl,
  getFixieConfig,
  isFixieConfigured,
  isFixieEnforcedForEnvironment,
  maskUrlCredentials,
  FIXIE_STATIC_IPS,
} from '@/lib/network/proxy-config';
import {
  getFixieDispatcher,
  getFixieHttpsAgent,
  getFixieAxiosProxyConfig,
  resetFixieCache,
  setTestingFetch,
  FixieProxyConfigurationError,
} from '@/lib/network/fixie';
import { providerFetch } from '@/lib/network/provider-client';

describe('Centralized Outbound Network & Fixie Routing Policy', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.FIXIE_URL;
    delete process.env.ALLOW_FIXIE_BYPASS_DEV;
    delete process.env.ALLOW_FIXIE_BYPASS;
    resetFixieCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetFixieCache();
    vi.restoreAllMocks();
  });

  describe('1. Provider Registry & Allowlist Policy', () => {
    it('configures NeoAPI to route via Fixie with static IP whitelisting', () => {
      const neo = getProviderById('neoapi');
      expect(neo).toBeDefined();
      expect(neo?.routing).toBe('fixie');
      expect(neo?.requiresWhitelisting).toBe(true);
      expect(neo?.allowedHostnames).toContain('core.neoapi.io');
    });

    it('configures verification providers (FastNexora, AxenAPI) to route via Fixie', () => {
      const fastnexora = getProviderById('fastnexora');
      expect(fastnexora?.routing).toBe('fixie');
      expect(fastnexora?.allowedHostnames).toContain('auth.fastnexora.xyz');

      const axenapi = getProviderById('axenapi');
      expect(axenapi?.routing).toBe('fixie');
      expect(axenapi?.allowedHostnames).toContain('test.axenapi.co.in');
    });

    it('enforces direct routing for payment gateways (Paytm)', () => {
      const paytm = getProviderById('paytm');
      expect(paytm).toBeDefined();
      expect(paytm?.routing).toBe('direct');
      expect(paytm?.requiresWhitelisting).toBe(false);
      expect(shouldRouteViaFixie('https://securegw.paytm.in/order/status')).toBe(false);
    });

    it('enforces direct routing for WhatsApp and MongoDB', () => {
      const whatsapp = getProviderById('whatsapp');
      expect(whatsapp?.routing).toBe('direct');
      expect(shouldRouteViaFixie('https://graph.facebook.com/v19.0/messages')).toBe(false);

      const mongo = getProviderById('mongodb');
      expect(mongo?.routing).toBe('direct');
    });

    it('enforces direct routing for unregistered external services', () => {
      const unregistered = getProviderForUrl('https://example.com/api/webhook');
      expect(unregistered).toBeUndefined();
      expect(shouldRouteViaFixie('https://example.com/api/webhook')).toBe(false);
    });

    it('prevents arbitrary user-supplied URLs from utilizing the Fixie proxy', () => {
      const validation = validateProxyEligibility('https://malicious-site.com/exploit');
      expect(validation.authorized).toBe(false);
      expect(validation.routing).toBe('direct');
    });

    it('rejects spoofed provider IDs with mismatched hostnames', () => {
      const validation = validateProxyEligibility('https://attacker.com/v1/pan', 'neoapi');
      expect(validation.authorized).toBe(false);
      expect(validation.rejectionReason).toContain('not authorized for provider');
    });
  });

  describe('2. Fixie Configuration & Security Validation', () => {
    it('documents both official Fixie static egress IP addresses', () => {
      expect(FIXIE_STATIC_IPS).toEqual(['54.195.3.54', '54.217.142.99']);
    });

    it('parses valid Fixie proxy URL correctly', () => {
      const parsed = parseFixieProxyUrl('http://fixie:secret_pass123@ventoux.usefixie.com:80');
      expect(parsed).not.toBeNull();
      expect(parsed?.host).toBe('ventoux.usefixie.com');
      expect(parsed?.port).toBe(80);
      expect(parsed?.username).toBe('fixie');
      expect(parsed?.password).toBe('secret_pass123');
      expect(parsed?.protocol).toBe('http:');
    });

    it('supports TLS proxy connection on port 443', () => {
      const parsed = parseFixieProxyUrl('https://fixie:tls_token@ventoux.usefixie.com:443');
      expect(parsed?.protocol).toBe('https:');
      expect(parsed?.port).toBe(443);
    });

    it('masks proxy passwords to prevent secret leakage in logs and diagnostics', () => {
      const masked = maskUrlCredentials('http://fixie:super_secret_token_abc@ventoux.usefixie.com:80');
      expect(masked).toBe('http://fixie:*****@ventoux.usefixie.com:80');
      expect(masked).not.toContain('super_secret_token_abc');
    });

    it('returns Axios proxy configuration structure with parsed credentials', () => {
      process.env.FIXIE_URL = 'http://fixie:token999@ventoux.usefixie.com:80';
      const axiosConfig = getFixieAxiosProxyConfig();

      expect(axiosConfig).toEqual({
        protocol: 'http',
        host: 'ventoux.usefixie.com',
        port: 80,
        auth: {
          username: 'fixie',
          password: 'token999',
        },
      });
    });
  });

  describe('3. Fail-Safe Closed Behavior (Production & Dev)', () => {
    it('FAILS CLOSED in production if FIXIE_URL is missing for a proxy-required provider', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.FIXIE_URL;

      await expect(
        providerFetch('https://core.neoapi.io/v1/pan/detail', { providerId: 'neoapi' })
      ).rejects.toThrow(FixieProxyConfigurationError);
    });

    it('FAILS CLOSED if FIXIE_URL is invalid/malformed in production', async () => {
      process.env.NODE_ENV = 'production';
      process.env.FIXIE_URL = 'invalid-proxy-url';

      await expect(
        providerFetch('https://core.neoapi.io/v1/pan/detail', { providerId: 'neoapi' })
      ).rejects.toThrow(FixieProxyConfigurationError);
    });

    it('allows direct connection in development ONLY when ALLOW_FIXIE_BYPASS_DEV is explicitly set', async () => {
      process.env.NODE_ENV = 'development';
      process.env.ALLOW_FIXIE_BYPASS_DEV = 'true';
      delete process.env.FIXIE_URL;

      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: 'success' }), { status: 200 })
      );
      vi.stubGlobal('fetch', mockFetch);

      const res = await providerFetch('https://core.neoapi.io/v1/pan/detail', { providerId: 'neoapi' });
      expect(res.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('never fails direct providers (Paytm) even if FIXIE_URL is missing in production', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.FIXIE_URL;

      const mockFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ isPaid: true }), { status: 200 })
      );
      vi.stubGlobal('fetch', mockFetch);

      const res = await providerFetch('https://securegw.paytm.in/order/status', { providerId: 'paytm' });
      expect(res.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('4. Provider Outbound Dispatching & Undici Tunneling', () => {
    it('dispatches NeoAPI requests through Undici ProxyAgent when FIXIE_URL is set', async () => {
      process.env.FIXIE_URL = 'http://fixie:test_token@ventoux.usefixie.com:80';

      const mockUndiciFetch = vi.fn().mockImplementation((url, init) => {
        expect(init.dispatcher).toBeDefined(); // ProxyAgent dispatcher attached
        return Promise.resolve(
          new Response(JSON.stringify({ status: 'success', name: 'JOHN DOE' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        );
      });
      setTestingFetch(mockUndiciFetch as any);

      const res = await providerFetch('https://core.neoapi.io/v1/pan/detail/premium.php?pan=ABCDE1234F', {
        providerId: 'neoapi',
      });

      expect(res.status).toBe(200);
      expect(mockUndiciFetch).toHaveBeenCalledTimes(1);
    });

    it('dispatches FastNexora and AxenAPI through Fixie when configured', async () => {
      process.env.FIXIE_URL = 'http://fixie:test_token@ventoux.usefixie.com:80';

      const mockUndiciFetch = vi.fn().mockImplementation((url, init) => {
        expect(init.dispatcher).toBeDefined();
        return Promise.resolve(new Response('{"status":"ok"}', { status: 200 }));
      });
      setTestingFetch(mockUndiciFetch as any);

      await providerFetch('https://auth.fastnexora.xyz/api/v1/voterVerification.php', {
        providerId: 'fastnexora',
      });
      expect(mockUndiciFetch).toHaveBeenCalledTimes(1);

      await providerFetch('https://test.axenapi.co.in/Dashboard/Verify_api/Dl/DLFind.php', {
        providerId: 'axenapi',
      });
      expect(mockUndiciFetch).toHaveBeenCalledTimes(2);
    });

    it('applies request timeouts cleanly without hanging', async () => {
      process.env.FIXIE_URL = 'http://fixie:test_token@ventoux.usefixie.com:80';

      const mockUndiciFetch = vi.fn().mockImplementation((url, init) => {
        expect(init.signal).toBeDefined();
        return Promise.resolve(new Response('{}', { status: 200 }));
      });
      setTestingFetch(mockUndiciFetch as any);

      await providerFetch('https://core.neoapi.io/v1/pan/detail', {
        providerId: 'neoapi',
        timeoutMs: 3000,
      });

      expect(mockUndiciFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('5. Audit Logging Sanitization', () => {
    it('never prints sensitive credentials or request payloads in console', async () => {
      process.env.FIXIE_URL = 'http://fixie:super_secret_token_12345@ventoux.usefixie.com:80';

      const consoleSpy = vi.spyOn(console, 'log');
      const consoleWarnSpy = vi.spyOn(console, 'warn');

      const mockUndiciFetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
      setTestingFetch(mockUndiciFetch as any);

      await providerFetch('https://core.neoapi.io/v1/pan/detail?apikey=MY_SECRET_KEY&pan=ABCDE1234F', {
        providerId: 'neoapi',
      });

      // Check all console output
      const allLogs = [
        ...consoleSpy.mock.calls.map((c) => c.join(' ')),
        ...consoleWarnSpy.mock.calls.map((c) => c.join(' ')),
      ].join(' ');

      expect(allLogs).not.toContain('super_secret_token_12345');
      expect(allLogs).not.toContain('MY_SECRET_KEY');
      expect(allLogs).not.toContain('ABCDE1234F');
    });
  });
});
