import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getSafeRedirectUrl } from '@/lib/rbac';

const JWT_ISSUER = 'accero-printportal';
const JWT_AUDIENCE = 'accero-users';

// User specified secret & fallback to guarantee parity between Edge Runtime & Serverless Node.js
const DEFAULT_ACCESS_TOKEN_SECRET =
  '58baf280aa06bc777111fb1defe21e04674255bb91569cc8e4a0c741741ed840';

function getPossibleMiddlewareSecrets(): Uint8Array[] {
  const candidates = [
    process.env.ACCESS_TOKEN_SECRET?.trim(),
    process.env.JWT_SECRET?.trim(),
    DEFAULT_ACCESS_TOKEN_SECRET,
  ].filter((s): s is string => !!s && s.length >= 32);

  const unique = Array.from(new Set(candidates));
  return unique.map((s) => new TextEncoder().encode(s));
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

  const token =
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('auth-token')?.value;
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
  const isServerActionOrRsc =
    request.headers.has('next-action') ||
    request.headers.get('accept')?.includes('text/x-component');

  if (!token) {
    if (isServerActionOrRsc) {
      return NextResponse.json(
        { error: 'Unauthorized: Session expired. Please log in again.' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    const fullPath = pathname + request.nextUrl.search;
    loginUrl.searchParams.set('redirect', fullPath);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyMiddlewareToken(token);

  if (!payload) {
    if (isServerActionOrRsc) {
      return NextResponse.json(
        { error: 'Unauthorized: Session expired. Please log in again.' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    const fullPath = pathname + request.nextUrl.search;
    loginUrl.searchParams.set('redirect', fullPath);
    const redirectRes = NextResponse.redirect(loginUrl);
    // Only clear access token cookies; do not delete refreshToken so background refresh can work
    redirectRes.cookies.delete('auth-token');
    redirectRes.cookies.delete('accessToken');
    return redirectRes;
  }

  const role = (payload.role as string | undefined)?.toLowerCase();

  // Admin role enforcement (/admin requires super_admin or admin)
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin' && role !== 'super_admin') {
      if (isServerActionOrRsc) {
        return NextResponse.json(
          { error: 'Forbidden: Insufficient privileges. Admin access required.' },
          { status: 403 }
        );
      }
      const forbiddenUrl = new URL('/dashboard', request.url);
      forbiddenUrl.searchParams.set('error', 'unauthorized_admin');
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  // Support role enforcement (/support requires super_admin, admin, support_manager, or support_agent)
  if (pathname.startsWith('/support')) {
    const allowedSupportRoles = ['super_admin', 'admin', 'support_manager', 'support_agent'];
    if (!role || !allowedSupportRoles.includes(role)) {
      if (isServerActionOrRsc) {
        return NextResponse.json(
          { error: 'Forbidden: Insufficient privileges. Support access required.' },
          { status: 403 }
        );
      }
      const forbiddenUrl = new URL('/dashboard', request.url);
      forbiddenUrl.searchParams.set('error', 'unauthorized_support');
      return NextResponse.redirect(forbiddenUrl);
    }
  }

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
