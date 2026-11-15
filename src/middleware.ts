import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getSafeRedirectUrl } from '@/lib/rbac';

const JWT_ISSUER = 'accero-printportal';
const JWT_AUDIENCE = 'accero-users';

// User specified secret guaranteed across Edge & Node.js runtimes
const ACCESS_TOKEN_SECRET_VALUE =
  '58baf280aa06bc777111fb1defe21e04674255bb91569cc8e4a0c741741ed840';

function getPossibleMiddlewareSecrets(): Uint8Array[] {
  const candidates = [
    ACCESS_TOKEN_SECRET_VALUE,
    process.env.ACCESS_TOKEN_SECRET?.trim(),
    process.env.JWT_SECRET?.trim(),
  ].filter((s): s is string => !!s && s.length >= 32);

  const unique = Array.from(new Set(candidates));
  return unique.map((s) => new TextEncoder().encode(s));
}

function extractToken(request: NextRequest): string | undefined {
  // 1. NextRequest cookie accessor
  const fromCookie =
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('auth-token')?.value;
  if (fromCookie) return fromCookie;

  // 2. Raw Cookie header fallback (resilient to Edge cookie proxying bugs on Vercel)
  const rawCookie = request.headers.get('cookie');
  if (rawCookie) {
    const match = rawCookie.match(/(?:accessToken|auth-token)=([^;]+)/);
    if (match) return decodeURIComponent(match[1].trim());
  }

  // 3. Bearer authorization header fallback
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return undefined;
}

async function verifyMiddlewareToken(token: string) {
  const secrets = getPossibleMiddlewareSecrets();

  for (const secret of secrets) {
    try {
      const { payload } = await jwtVerify(token, secret, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }).catch(async () => {
        return await jwtVerify(token, secret);
      });

      return payload;
    } catch {
      // Try next candidate secret
    }
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Enforce standard production security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), browsing-topics=()'
  );
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  const token = extractToken(request);
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/wallet') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/support') ||
    pathname.startsWith('/cards');

  // If path is neither auth nor protected, proceed normally with security headers
  if (!isAuthPage && !isProtectedPath) {
    return response;
  }

  // Detect Next.js client-side flight / RSC requests
  const isServerActionOrRsc =
    request.headers.has('next-action') ||
    request.headers.get('accept')?.includes('text/x-component') ||
    request.headers.get('rsc') === '1' ||
    request.nextUrl.searchParams.has('_rsc');

  // 1. Authenticated User Handling on Auth Pages (/login, /register)
  if (isAuthPage) {
    if (!token) {
      return response;
    }

    const payload = await verifyMiddlewareToken(token);
    if (payload) {
      // Token is valid & unexpired: Redirect authenticated user away from login/register
      const role = (payload.role as string | undefined)?.toLowerCase();
      const rawReturnTo =
        request.nextUrl.searchParams.get('returnTo') ||
        request.nextUrl.searchParams.get('redirect');
      const safeDestination = getSafeRedirectUrl(rawReturnTo, role);

      return NextResponse.redirect(new URL(safeDestination, request.url));
    }

    // Token is corrupt/expired on auth page: allow user to see login form
    return response;
  }

  // 2. Protected Routes Handling (/dashboard, /admin, /support, etc.)
  // On RSC / client-side sub-route transitions, let requests pass to Server Components.
  // Server Components (e.g. AdminLayout, StudioLayout) perform authoritative validation
  // in Node.js runtime and generate native React Flight transitions without 307 bounces.
  if (isServerActionOrRsc) {
    return response;
  }

  // If visitor has NO token at all during direct browser document load, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    const fullPath = pathname + request.nextUrl.search;
    loginUrl.searchParams.set('redirect', fullPath);
    return NextResponse.redirect(loginUrl);
  }

  // If visitor has a token on direct document load, verify for role-based protection
  const payload = await verifyMiddlewareToken(token);

  if (payload) {
    const role = (payload.role as string | undefined)?.toLowerCase();

    // Admin role enforcement (/admin requires super_admin or admin)
    if (pathname.startsWith('/admin')) {
      if (role !== 'admin' && role !== 'super_admin') {
        const forbiddenUrl = new URL('/dashboard', request.url);
        forbiddenUrl.searchParams.set('error', 'unauthorized_admin');
        return NextResponse.redirect(forbiddenUrl);
      }
    }

    // Support role enforcement (/support requires super_admin, admin, support_manager, or support_agent)
    if (pathname.startsWith('/support')) {
      const allowedSupportRoles = ['super_admin', 'admin', 'support_manager', 'support_agent'];
      if (!role || !allowedSupportRoles.includes(role)) {
        const forbiddenUrl = new URL('/dashboard', request.url);
        forbiddenUrl.searchParams.set('error', 'unauthorized_support');
        return NextResponse.redirect(forbiddenUrl);
      }
    }
  }

  // Pass request through to Server Component layout for final database-backed auth check
  return response;
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard/:path*',
    '/studio/:path*',
    '/wallet/:path*',
    '/admin/:path*',
    '/support/:path*',
    '/cards/:path*',
  ],
};
