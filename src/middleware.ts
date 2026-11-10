import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

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

  // Protected paths check
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/wallet') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/support') ||
    pathname.startsWith('/cards');

  if (!isProtectedPath) {
    return response;
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const secret = getMiddlewareSecret();
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
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const redirectRes = NextResponse.redirect(loginUrl);
    redirectRes.cookies.delete('auth-token');
    return redirectRes;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/studio/:path*',
    '/wallet/:path*',
    '/admin/:path*',
    '/cards/:path*',
  ],
};
