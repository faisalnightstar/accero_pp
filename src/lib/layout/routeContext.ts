/**
 * Application Layout & Route Context Engine
 * Accero PrintPortal (https://printportal.accero.app)
 *
 * Defines the authoritative boundary between:
 * 1. Public Marketing Website (/ , /pricing, /about, /services, /blog, etc.)
 * 2. Authenticated Operator Application (/dashboard, /studio, /wallet, /cards)
 * 3. Authenticated Admin Command Center (/admin, /admin/*)
 * 4. Authenticated Support Center (/support, /support/*)
 * 5. Authentication Flows (/login, /register, /forgot-password, /reset-password)
 */

export type ApplicationContext = 'public' | 'operator' | 'admin' | 'support' | 'auth';

/**
 * All protected operator routes that must render within the Operator Application Shell
 */
export const OPERATOR_ROUTE_PREFIXES = [
  '/dashboard',
  '/studio',
  '/wallet',
  '/cards',
] as const;

/**
 * Admin root and subroute prefix
 */
export const ADMIN_ROUTE_PREFIX = '/admin' as const;

/**
 * Support root and subroute prefix
 */
export const SUPPORT_ROUTE_PREFIX = '/support' as const;

/**
 * Authentication routes
 */
export const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const;

/**
 * Resolves the application layout context strictly from the pathname.
 * Does not rely on client authentication state or CSS display rules.
 */
export function getApplicationContext(pathname: string | null | undefined): ApplicationContext {
  if (!pathname) return 'public';

  // Normalize path by removing trailing slash (except for root '/')
  const normalized = pathname.length > 1 && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;

  // 1. Admin application hierarchy (/admin, /admin/*)
  if (normalized === ADMIN_ROUTE_PREFIX || normalized.startsWith(`${ADMIN_ROUTE_PREFIX}/`)) {
    return 'admin';
  }

  // 2. Support application hierarchy (/support, /support/*)
  if (normalized === SUPPORT_ROUTE_PREFIX || normalized.startsWith(`${SUPPORT_ROUTE_PREFIX}/`)) {
    return 'support';
  }

  // 3. Operator application hierarchy (/dashboard, /studio, /wallet, /cards)
  for (const prefix of OPERATOR_ROUTE_PREFIXES) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
      return 'operator';
    }
  }

  // 4. Authentication pages (/login, /register, etc.)
  for (const authRoute of AUTH_ROUTES) {
    if (normalized === authRoute || normalized.startsWith(`${authRoute}/`)) {
      return 'auth';
    }
  }

  // 5. Default: Public marketing website
  return 'public';
}

export function isPublicRoute(pathname: string | null | undefined): boolean {
  return getApplicationContext(pathname) === 'public';
}

export function isOperatorRoute(pathname: string | null | undefined): boolean {
  return getApplicationContext(pathname) === 'operator';
}

export function isAdminRoute(pathname: string | null | undefined): boolean {
  return getApplicationContext(pathname) === 'admin';
}

export function isSupportRoute(pathname: string | null | undefined): boolean {
  return getApplicationContext(pathname) === 'support';
}

export function isAuthRoute(pathname: string | null | undefined): boolean {
  return getApplicationContext(pathname) === 'auth';
}
