import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getSafeRedirectUrl } from '@/lib/rbac';

const JWT_ISSUER = 'accero-printportal';
const JWT_AUDIENCE = 'accero-users';

function getMiddlewareSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    return null;
  }
  return new TextEncoder().encode(secret.trim());
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

  const token = request.cookies.get('auth-token')?.value;
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

  const secret = getMiddlewareSecret();

  // 1. Authenticated User Handling on Auth Pages (/login, /register)
  if (isAuthPage) {
    if (!token) {
      // Unauthenticated visitor is permitted to view login/register
      return response;
    }

    if (!secret) {
      // Misconfigured secret: permit login view
      return response;
    }

    try {
      const { payload } = await jwtVerify(token, secret, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });

      // Token is valid & unexpired: Redirect authenticated user away from login/register
      const role = (payload.role as string | undefined)?.toLowerCase();
      const rawReturnTo =
        request.nextUrl.searchParams.get('returnTo') ||
        request.nextUrl.searchParams.get('redirect');
      const safeDestination = getSafeRedirectUrl(rawReturnTo, role);

      return NextResponse.redirect(new URL(safeDestination, request.url));
    } catch {
      // Corrupt or expired token: Clear cookie and allow access to login/register
      const res = NextResponse.next();
      res.cookies.delete('auth-token');
      return res;
    }
  }

  // 2. Protected Routes Handling (/dashboard, /admin, /support, etc.)
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    const fullPath = pathname + request.nextUrl.search;
    loginUrl.searchParams.set('redirect', fullPath);
    return NextResponse.redirect(loginUrl);
  }

  if (!secret) {
    console.error('[Middleware] JWT_SECRET is unconfigured or insecure (<32 characters). Denying access.');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'server_configuration_error');
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

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

    return response;
  } catch {
    // Expired or invalid token on protected route: delete cookie and redirect to login
    const loginUrl = new URL('/login', request.url);
    const fullPath = pathname + request.nextUrl.search;
    loginUrl.searchParams.set('redirect', fullPath);
    const redirectRes = NextResponse.redirect(loginUrl);
    redirectRes.cookies.delete('auth-token');
    return redirectRes;
  }
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
