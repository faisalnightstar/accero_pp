import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as auth from '@/lib/auth';
import { GET } from '@/app/api/admin/diagnostics/outbound-ip/route';

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

describe('Admin Diagnostic API Route: GET /api/admin/diagnostics/outbound-ip', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.FIXIE_URL;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('rejects unauthenticated requests with 403', async () => {
    vi.mocked(auth.getSession).mockResolvedValue(null as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Authentication required');
  });

  it('rejects standard operator user with 403', async () => {
    vi.mocked(auth.getSession).mockResolvedValue({
      userId: 'user_123',
      role: 'operator',
      username: 'test_operator',
    } as any);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Forbidden');
  });

  it('allows admin role and returns diagnostic status when FIXIE_URL is unconfigured', async () => {
    vi.mocked(auth.getSession).mockResolvedValue({
      userId: 'admin_123',
      role: 'admin',
      username: 'test_admin',
    } as any);

    const mockGlobalFetch = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ip: '1.2.3.4' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
    );
    vi.stubGlobal('fetch', mockGlobalFetch);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.fixieConfigured).toBe(false);
    expect(json.data.isProxied).toBe(false);
    expect(json.data.outboundIp).toBe('1.2.3.4');
    expect(json.data.maskedUrl).toBeNull();
  });

  it('allows super_admin role and returns masked proxy details when FIXIE_URL is set', async () => {
    process.env.FIXIE_URL = 'http://fixie:super_secret_token@velvet.usefixie.com:80';

    vi.mocked(auth.getSession).mockResolvedValue({
      userId: 'super_admin_123',
      role: 'super_admin',
      username: 'chief_admin',
    } as any);

    const { setFixieFetchForTesting, resetFixieAgentCache } = await import('@/lib/outbound/fixie');
    resetFixieAgentCache();

    const mockUndiciFetch = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ip: '52.14.80.99' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
    );
    setFixieFetchForTesting(mockUndiciFetch as any);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.fixieConfigured).toBe(true);
    expect(json.data.isProxied).toBe(true);
    expect(json.data.proxyHost).toBe('velvet.usefixie.com');
    expect(json.data.proxyPort).toBe(80);
    expect(json.data.proxyProtocol).toBe('http:');
    expect(json.data.maskedUrl).toBe('http://fixie:*****@velvet.usefixie.com:80');
    expect(json.data.outboundIp).toBe('52.14.80.99');
    expect(json.data.maskedUrl).not.toContain('super_secret_token'); // Strict secret leak guard

    resetFixieAgentCache();
  });
});
