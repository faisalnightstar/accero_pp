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
  const fromCookie =
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('auth-token')?.value ||
    request.cookies.get('refreshToken')?.value;
  if (fromCookie) return fromCookie;

  const rawCookie = request.headers.get('cookie');
  if (rawCookie) {
    const match = rawCookie.match(/(?:accessToken|auth-token|refreshToken)=([^;]+)/);
    if (match) return decodeURIComponent(match[1].trim());
  }

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

  // Enforce standard production security headers on all routes
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

  const pathname = request.nextUrl.pathname;
  const isHomepage = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // If visitor is on homepage (/), /login, or /register, redirect already-authenticated users to their dashboard
  if (isHomepage || isAuthPage) {
    const token = extractToken(request);
    if (!token) {
      return response;
    }

    const payload = await verifyMiddlewareToken(token);
    if (payload) {
      const role = (payload.role as string | undefined)?.toLowerCase();
      const rawReturnTo = isAuthPage
        ? request.nextUrl.searchParams.get('returnTo') ||
          request.nextUrl.searchParams.get('redirect')
        : null;
      const safeDestination = getSafeRedirectUrl(rawReturnTo, role);

      return NextResponse.redirect(new URL(safeDestination, request.url));
    }
  }

  // Protected route security is authoritatively enforced by Server Component Layouts
  // (AdminLayout, SupportLayout, DashboardLayout, etc.) in Node.js runtime, ensuring
  // zero Edge-runtime token drops, zero false 307 redirects, and seamless client navigations.
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - assets (public static assets)
     * - favicon.ico, manifest.webmanifest (metadata files)
     */
    '/((?!api|_next/static|_next/image|assets|favicon.ico|manifest.webmanifest).*)',
  ],
};
