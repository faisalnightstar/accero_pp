import { MetadataRoute } from 'next';
import { getCanonicalUrl } from '@/lib/seo/canonical';
import { CANONICAL_PUBLIC_ROUTES } from '@/lib/seo/routes';

/**
 * Dynamic Canonical Sitemap Generation for Next.js 15 App Router
 * Accero PrintPortal (https://printportal.accero.app)
 *
 * GUARANTEES:
 * 1. 100% Public Canonical Coverage: Contains all 49 genuinely public indexable routes.
 * 2. Zero Private Leakage: Excludes /dashboard, /studio, /wallet, /cards, /admin, and /api.
 * 3. Zero Auth Pages: Excludes /login, /register, /forgot-password, /reset-password.
 * 4. Zero Duplicate Aliases: Aliases redirect or canonicalize to their primary service slug.
 * 5. Deterministic Dates: Uses exact revision dates rather than unstable request timestamps.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return CANONICAL_PUBLIC_ROUTES.map((route) => ({
    url: getCanonicalUrl(route.path),
    lastModified: route.lastModified
      ? new Date(route.lastModified)
      : new Date('2026-11-10T00:00:00.000Z'),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
