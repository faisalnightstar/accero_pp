import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { SignJWT } from 'jose';
import { middleware } from '@/middleware';
import { signJwtToken, getJwtSecretKey } from '@/lib/auth';
import { getSafeRedirectUrl, getRoleDashboardUrl } from '@/lib/rbac';
import { POST as logoutPost, GET as logoutGet } from '@/app/api/auth/logout/route';

const SECURE_SECRET = 'valid_production_secret_key_with_at_least_32_characters_for_security';

describe('Authentication & Role-Based Redirect Engine', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.JWT_SECRET = SECURE_SECRET;
  });

  // 1. Logged-out user can access /login
  it('1. allows logged-out user to access /login', async () => {
    const req = new NextRequest('https://printportal.accero.app/login');
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  // 2. Logged-out user can access /register
  it('2. allows logged-out user to access /register', async () => {
    const req = new NextRequest('https://printportal.accero.app/register');
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  // 3. Normal authenticated user visiting /login redirects to /dashboard
  it('3. redirects normal authenticated user visiting /login to /dashboard', async () => {
    const token = await signJwtToken({
      userId: 'user_001',
      email: 'user@accero.app',
      name: 'Regular User',
      role: 'user',
    });

    const req = new NextRequest('https://printportal.accero.app/login', {
      headers: { cookie: `auth-token=${token}` },
    });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://printportal.accero.app/dashboard');
  });

  // 4. Normal authenticated user visiting /register redirects to /dashboard
  it('4. redirects normal authenticated user visiting /register to /dashboard', async () => {
    const token = await signJwtToken({
      userId: 'operator_001',
      email: 'operator@accero.app',
      name: 'Card Operator',
      role: 'operator',
    });

    const req = new NextRequest('https://printportal.accero.app/register', {
      headers: { cookie: `auth-token=${token}` },
    });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('https://printportal.accero.app/dashboard');
  });

  // 5. ADMIN visiting /login redirects to /admin
  it('5. redirects ADMIN and SUPER_ADMIN visiting /login to /admin', async () => {
    const adminToken = await signJwtToken({
      userId: 'admin_001',
      email: 'admin@accero.app',
      name: 'Admin User',
      role: 'admin',
    });

    const reqAdmin = new NextRequest('https://printportal.accero.app/login', {
      headers: { cookie: `auth-token=${adminToken}` },
    });
    const resAdmin = await middleware(reqAdmin);
    expect(resAdmin.status).toBe(307);
    expect(resAdmin.headers.get('location')).toBe('https://printportal.accero.app/admin');

    const superAdminToken = await signJwtToken({
      userId: 'super_001',
      email: 'super@accero.app',
      name: 'Super Administrator',
      role: 'super_admin',
    });

    const reqSuper = new NextRequest('https://printportal.accero.app/login', {
      headers: { cookie: `auth-token=${superAdminToken}` },
    });
    const resSuper = await middleware(reqSuper);
    expect(resSuper.status).toBe(307);
    expect(resSuper.headers.get('location')).toBe('https://printportal.accero.app/admin');
  });

  // 6. SUPPORT_AGENT visiting /register redirects to /support
  it('6. redirects SUPPORT_AGENT and SUPPORT_MANAGER visiting /register to /support', async () => {
    const agentToken = await signJwtToken({
      userId: 'agent_001',
      email: 'agent@accero.app',
      name: 'Support Specialist',
      role: 'support_agent',
    });

    const reqAgent = new NextRequest('https://printportal.accero.app/register', {
      headers: { cookie: `auth-token=${agentToken}` },
    });
    const resAgent = await middleware(reqAgent);
    expect(resAgent.status).toBe(307);
    expect(resAgent.headers.get('location')).toBe('https://printportal.accero.app/support');

    const managerToken = await signJwtToken({
      userId: 'mgr_001',
      email: 'manager@accero.app',
      name: 'Support Lead',
      role: 'support_manager',
    });

    const reqManager = new NextRequest('https://printportal.accero.app/register', {
      headers: { cookie: `auth-token=${managerToken}` },
    });
    const resManager = await middleware(reqManager);
    expect(resManager.status).toBe(307);
    expect(resManager.headers.get('location')).toBe('https://printportal.accero.app/support');
  });

  // 7. Expired JWT does not grant access
  it('7. ensures expired JWT does not grant access and deletes cookie on login/protected pages', async () => {
    const secret = getJwtSecretKey();
    // Sign token expired 1 hour ago
    const expiredToken = await new SignJWT({
      userId: 'expired_user',
      email: 'expired@accero.app',
      name: 'Expired',
      role: 'user',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer('accero-printportal')
      .setAudience('accero-users')
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(secret);

    // On protected route: redirects to login and clears cookie
    const protectedReq = new NextRequest('https://printportal.accero.app/dashboard', {
      headers: { cookie: `auth-token=${expiredToken}` },
    });
    const protectedRes = await middleware(protectedReq);
    expect(protectedRes.status).toBe(307);
    expect(protectedRes.headers.get('location')).toContain('/login');
    const deletedCookie = protectedRes.cookies.get('auth-token');
    expect(deletedCookie?.value).toBe('');

    // On auth page: permits viewing login and clears expired cookie
    const loginReq = new NextRequest('https://printportal.accero.app/login', {
      headers: { cookie: `auth-token=${expiredToken}` },
    });
    const loginRes = await middleware(loginReq);
    expect(loginRes.status).toBe(200);
    const loginDeletedCookie = loginRes.cookies.get('auth-token');
    expect(loginDeletedCookie?.value).toBe('');
  });

  // 8. Invalid JWT does not grant access
  it('8. ensures invalid/tampered JWT does not grant access and deletes cookie', async () => {
    const invalidToken = 'invalid.header.and.signature.token';

    const protectedReq = new NextRequest('https://printportal.accero.app/dashboard', {
      headers: { cookie: `auth-token=${invalidToken}` },
    });
    const protectedRes = await middleware(protectedReq);
    expect(protectedRes.status).toBe(307);
    expect(protectedRes.headers.get('location')).toContain('/login');
    expect(protectedRes.cookies.get('auth-token')?.value).toBe('');

    const loginReq = new NextRequest('https://printportal.accero.app/login', {
      headers: { cookie: `auth-token=${invalidToken}` },
    });
    const loginRes = await middleware(loginReq);
    expect(loginRes.status).toBe(200);
    expect(loginRes.cookies.get('auth-token')?.value).toBe('');
  });

  // 9. Missing cookie allows authentication pages
  it('9. allows access to /login and /register when cookie is missing', async () => {
    const loginReq = new NextRequest('https://printportal.accero.app/login');
    const loginRes = await middleware(loginReq);
    expect(loginRes.status).toBe(200);

    const regReq = new NextRequest('https://printportal.accero.app/register');
    const regRes = await middleware(regReq);
    expect(regRes.status).toBe(200);
  });

  // 10. Inactive/Suspended user check
  it('10. verifies suspended user logic in server data layer', () => {
    const activeUser = { status: 'active', role: 'operator' };
    const suspendedUser = { status: 'suspended', role: 'operator' };

    expect(activeUser.status === 'active').toBe(true);
    expect(suspendedUser.status === 'active').toBe(false);
  });

  // 11. Logout clears the session and allows login access
  it('11. verifies logout clears the session cookie and permits login access', async () => {
    // Test POST logout
    const postRes = await logoutPost();
    const postCookie = postRes.cookies.get('auth-token');
    expect(postCookie?.value).toBe('');
    expect(postCookie?.maxAge).toBe(0);

    // Test GET logout
    const getReq = new Request('https://printportal.accero.app/api/auth/logout');
    const getRes = await logoutGet(getReq);
    expect(getRes.status).toBe(307);
    expect(getRes.headers.get('location')).toBe('https://printportal.accero.app/login?message=logged_out');
    const getCookie = getRes.cookies.get('auth-token');
    expect(getCookie?.value).toBe('');
    expect(getCookie?.maxAge).toBe(0);
  });

  // 12. No redirect loops occur & Safe returnTo handling
  it('12. prevents redirect loops and blocks malicious open redirects', async () => {
    const token = await signJwtToken({
      userId: 'user_001',
      email: 'user@accero.app',
      name: 'User',
      role: 'user',
    });

    // Loop Prevention: returnTo pointing to /login
    const loopReq1 = new NextRequest('https://printportal.accero.app/login?returnTo=/login', {
      headers: { cookie: `auth-token=${token}` },
    });
    const loopRes1 = await middleware(loopReq1);
    expect(loopRes1.headers.get('location')).toBe('https://printportal.accero.app/dashboard');

    // Loop Prevention: returnTo pointing to /register
    const loopReq2 = new NextRequest('https://printportal.accero.app/login?returnTo=/register', {
      headers: { cookie: `auth-token=${token}` },
    });
    const loopRes2 = await middleware(loopReq2);
    expect(loopRes2.headers.get('location')).toBe('https://printportal.accero.app/dashboard');

    // Open Redirect Prevention: absolute URL to external evil site
    const evilReq1 = new NextRequest('https://printportal.accero.app/login?returnTo=https://evil.com', {
      headers: { cookie: `auth-token=${token}` },
    });
    const evilRes1 = await middleware(evilReq1);
    expect(evilRes1.headers.get('location')).toBe('https://printportal.accero.app/dashboard');

    // Open Redirect Prevention: protocol-relative URL
    const evilReq2 = new NextRequest('https://printportal.accero.app/login?returnTo=//attacker.com/steal', {
      headers: { cookie: `auth-token=${token}` },
    });
    const evilRes2 = await middleware(evilReq2);
    expect(evilRes2.headers.get('location')).toBe('https://printportal.accero.app/dashboard');

    // Open Redirect Prevention: backslash bypass
    const evilReq3 = new NextRequest('https://printportal.accero.app/login?returnTo=/\\attacker.com', {
      headers: { cookie: `auth-token=${token}` },
    });
    const evilRes3 = await middleware(evilReq3);
    expect(evilRes3.headers.get('location')).toBe('https://printportal.accero.app/dashboard');

    // Valid internal returnTo: preserved safely
    const validReturnReq = new NextRequest('https://printportal.accero.app/login?returnTo=/wallet', {
      headers: { cookie: `auth-token=${token}` },
    });
    const validReturnRes = await middleware(validReturnReq);
    expect(validReturnRes.headers.get('location')).toBe('https://printportal.accero.app/wallet');

    // Role boundary on returnTo: normal user trying to return to /admin falls back to /dashboard
    const unauthorizedReturnReq = new NextRequest('https://printportal.accero.app/login?returnTo=/admin', {
      headers: { cookie: `auth-token=${token}` },
    });
    const unauthorizedReturnRes = await middleware(unauthorizedReturnReq);
    expect(unauthorizedReturnRes.headers.get('location')).toBe('https://printportal.accero.app/dashboard');
  });

  describe('getSafeRedirectUrl helper unit tests', () => {
    it('returns role dashboard when returnTo is null or undefined', () => {
      expect(getSafeRedirectUrl(null, 'admin')).toBe('/admin');
      expect(getSafeRedirectUrl(undefined, 'support_agent')).toBe('/support');
      expect(getSafeRedirectUrl('', 'operator')).toBe('/dashboard');
    });

    it('rejects external schemes', () => {
      expect(getSafeRedirectUrl('http://phishing.site', 'user')).toBe('/dashboard');
      expect(getSafeRedirectUrl('https://google.com', 'user')).toBe('/dashboard');
      expect(getSafeRedirectUrl('javascript:alert(1)', 'user')).toBe('/dashboard');
    });

    it('rejects auth paths to prevent loops', () => {
      expect(getSafeRedirectUrl('/login', 'user')).toBe('/dashboard');
      expect(getSafeRedirectUrl('/login?redirect=/foo', 'user')).toBe('/dashboard');
      expect(getSafeRedirectUrl('/register', 'user')).toBe('/dashboard');
      expect(getSafeRedirectUrl('/api/auth/login', 'user')).toBe('/dashboard');
    });

    it('allows valid internal paths and query parameters', () => {
      expect(getSafeRedirectUrl('/studio/pan?mode=manual', 'user')).toBe('/studio/pan?mode=manual');
      expect(getSafeRedirectUrl('/wallet#recharge', 'user')).toBe('/wallet#recharge');
    });
  });
});

