import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/canonical';
import {
  CANONICAL_PUBLIC_ROUTES,
  PRIVATE_NOINDEX_ROUTES,
  STATIC_VERIFICATION_ALLOWANCES,
} from '@/lib/seo/routes';

/**
 * Robots.txt Configuration for Next.js 15 App Router
 * Accero PrintPortal (https://printportal.accero.app)
 *
 * GOVERNANCE RULES:
 * 1. Allow all public canonical and content routes for standard and AI crawlers.
 * 2. Allow static verification files (GSC verification, llms.txt, sitemap.xml).
 * 3. Strictly disallow private application workflows (/dashboard, /studio, /wallet, /cards, /admin, /api).
 * 4. Do NOT block /login or /register here so Googlebot can crawl and discover their meta noindex directive.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  const publicAllowPaths = Array.from(
    new Set([
      ...CANONICAL_PUBLIC_ROUTES.map((r) => r.path),
      ...STATIC_VERIFICATION_ALLOWANCES,
      '/services/*',
      '/features/*',
      '/solutions/*',
      '/blog/*',
    ])
  );

  const privateDisallowPaths = [...PRIVATE_NOINDEX_ROUTES];

  const botRules = [
    // Standard search engines (Googlebot, Bingbot, Default)
    { userAgent: '*', allow: publicAllowPaths, disallow: privateDisallowPaths },
    { userAgent: 'Googlebot', allow: publicAllowPaths, disallow: privateDisallowPaths },
    { userAgent: 'bingbot', allow: publicAllowPaths, disallow: privateDisallowPaths },

    // Conversational & Search AI Bots
    { userAgent: 'OAI-SearchBot', allow: publicAllowPaths, disallow: privateDisallowPaths },
    { userAgent: 'ChatGPT-User', allow: publicAllowPaths, disallow: privateDisallowPaths },
    { userAgent: 'PerplexityBot', allow: publicAllowPaths, disallow: privateDisallowPaths },
    { userAgent: 'ClaudeBot', allow: publicAllowPaths, disallow: privateDisallowPaths },
    { userAgent: 'Google-Extended', allow: publicAllowPaths, disallow: privateDisallowPaths },
    { userAgent: 'GPTBot', allow: publicAllowPaths, disallow: privateDisallowPaths },
  ];

  return {
    rules: botRules,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
