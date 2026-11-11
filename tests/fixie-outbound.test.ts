import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  parseFixieUrl,
  isFixieConfigured,
  getFixieUrl,
  getFixieConfig,
  getFixieDispatcher,
  getFixieAgent,
  getAxiosProxyConfig,
  resetFixieAgentCache,
  setFixieFetchForTesting,
  fixedFetch,
  checkOutboundIp,
} from '@/lib/outbound/fixie';

describe('Fixie Outbound Fixed IP Proxy Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.FIXIE_URL;
    resetFixieAgentCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetFixieAgentCache();
    vi.restoreAllMocks();
  });

  describe('Configuration Parsing & Detection', () => {
    it('returns null and false when FIXIE_URL is not set', () => {
      expect(isFixieConfigured()).toBe(false);
      expect(getFixieUrl()).toBeUndefined();
      expect(getFixieConfig()).toBeNull();
      expect(parseFixieUrl()).toBeNull();
      expect(parseFixieUrl('')).toBeNull();
      expect(parseFixieUrl('   ')).toBeNull();
    });

    it('rejects invalid schemes or non-HTTP protocols', () => {
      expect(parseFixieUrl('ftp://fixie:pass@host:21')).toBeNull();
      expect(parseFixieUrl('not-a-valid-url')).toBeNull();
    });

    it('parses standard HTTP Fixie URL with custom port', () => {
      const raw = 'http://fixie:secretpass123@velvet.usefixie.com:80';
      const config = parseFixieUrl(raw);

      expect(config).not.toBeNull();
      expect(config?.protocol).toBe('http:');
      expect(config?.host).toBe('velvet.usefixie.com');
      expect(config?.port).toBe(80);
      expect(config?.username).toBe('fixie');
      expect(config?.password).toBe('secretpass123');
      expect(config?.url).toBe(raw);
      expect(config?.maskedUrl).toBe('http://fixie:*****@velvet.usefixie.com:80');
    });

    it('parses TLS/HTTPS Fixie URL (port 443)', () => {
      const raw = 'https://fixie:secureToken999@pipeline.usefixie.com:443';
      const config = parseFixieUrl(raw);

      expect(config).not.toBeNull();
      expect(config?.protocol).toBe('https:');
      expect(config?.host).toBe('pipeline.usefixie.com');
      expect(config?.port).toBe(443);
      expect(config?.maskedUrl).toBe('https://fixie:*****@pipeline.usefixie.com:443');
    });

    it('supplies default ports when port is omitted', () => {
      const httpConfig = parseFixieUrl('http://fixie:pass@subdomain.usefixie.com');
      expect(httpConfig?.port).toBe(80);

      const httpsConfig = parseFixieUrl('https://fixie:pass@subdomain.usefixie.com');
      expect(httpsConfig?.port).toBe(443);
    });

    it('reads FIXIE_URL from process.env', () => {
      process.env.FIXIE_URL = 'http://fixie:env_token@env.usefixie.com:80';
      expect(isFixieConfigured()).toBe(true);
      expect(getFixieUrl()).toBe('http://fixie:env_token@env.usefixie.com:80');

      const config = getFixieConfig();
      expect(config?.host).toBe('env.usefixie.com');
      expect(config?.username).toBe('fixie');
    });
  });

  describe('Agent & Dispatcher Instantiation', () => {
    it('returns undefined when FIXIE_URL is unconfigured', () => {
      expect(getFixieDispatcher()).toBeUndefined();
      expect(getFixieAgent()).toBeUndefined();
      expect(getAxiosProxyConfig()).toBe(false);
    });

    it('instantiates and caches Undici ProxyAgent dispatcher', () => {
      process.env.FIXIE_URL = 'http://fixie:token1@group.usefixie.com:80';

      const dispatcher1 = getFixieDispatcher();
      expect(dispatcher1).toBeDefined();

      const dispatcher2 = getFixieDispatcher();
      expect(dispatcher2).toBe(dispatcher1); // Singleton reuse
    });

    it('instantiates and caches HttpsProxyAgent', () => {
      process.env.FIXIE_URL = 'http://fixie:token1@group.usefixie.com:80';

      const agent1 = getFixieAgent();
      expect(agent1).toBeDefined();

      const agent2 = getFixieAgent();
      expect(agent2).toBe(agent1); // Singleton reuse
    });

    it('returns Axios-compatible proxy config object', () => {
      process.env.FIXIE_URL = 'http://fixie:mySecret@proxy.usefixie.com:80';

      const axiosConfig = getAxiosProxyConfig();
      expect(axiosConfig).toEqual({
        protocol: 'http',
        host: 'proxy.usefixie.com',
        port: 80,
        auth: {
          username: 'fixie',
          password: 'mySecret',
        },
      });
    });

    it('clears agent cache on resetFixieAgentCache()', () => {
      process.env.FIXIE_URL = 'http://fixie:token1@group.usefixie.com:80';
      const agent1 = getFixieAgent();
      expect(agent1).toBeDefined();

      resetFixieAgentCache();

      const agent2 = getFixieAgent();
      expect(agent2).not.toBe(agent1);
    });
  });

  describe('fixedFetch Routing & Security Enforcement', () => {
    it('routes registered direct providers through globalThis.fetch when FIXIE_URL is not configured', async () => {
      const mockGlobalFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      vi.stubGlobal('fetch', mockGlobalFetch);

      const res = await fixedFetch('https://securegw.paytm.in/order/status', {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });

      expect(mockGlobalFetch).toHaveBeenCalledTimes(1);
      const call = mockGlobalFetch.mock.calls[0];
      expect(call[0]).toBe('https://securegw.paytm.in/order/status');
      expect(call[1].method).toBe('POST');
      expect(call[1].headers).toEqual({ Accept: 'application/json' });
      expect(res.status).toBe(200);
    });

    it('rejects unregistered hostnames by default', async () => {
      await expect(
        fixedFetch('https://api.example.com/status', { method: 'GET' })
      ).rejects.toThrow('Unregistered destination hostname');
    });

    it('applies timeoutMs properly via AbortSignal for registered providers', async () => {
      const mockGlobalFetch = vi.fn().mockImplementation((url, init) => {
        expect(init.signal).toBeDefined();
        return Promise.resolve(new Response('{}', { status: 200 }));
      });
      vi.stubGlobal('fetch', mockGlobalFetch);

      await fixedFetch('https://securegw.paytm.in/order/status', {
        timeoutMs: 5000,
      });

      expect(mockGlobalFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkOutboundIp Diagnostics', () => {
    it('returns successful reflection data when IP echo service responds', async () => {
      const mockGlobalFetch = vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ ip: '52.14.80.12' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        )
      );
      vi.stubGlobal('fetch', mockGlobalFetch);

      const result = await checkOutboundIp();

      expect(result.success).toBe(true);
      expect(result.ip).toBe('52.14.80.12');
      expect(result.fixieConfigured).toBe(false);
      expect(result.proxied).toBe(false);
    });

    it('identifies proxied traffic when FIXIE_URL is set', async () => {
      process.env.FIXIE_URL = 'http://fixie:token1@group.usefixie.com:80';

      const mockUndiciFetch = vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ ip: '54.210.12.34' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        )
      );
      setFixieFetchForTesting(mockUndiciFetch as any);

      const result = await checkOutboundIp();

      expect(result.success).toBe(true);
      expect(result.ip).toBe('54.210.12.34');
      expect(result.proxied).toBe(true);
      expect(result.fixieConfigured).toBe(true);
      expect(result.proxyHost).toBe('group.usefixie.com');

      expect(mockUndiciFetch).toHaveBeenCalled();
    });
  });
});
