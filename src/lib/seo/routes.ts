/**
 * Centralized SEO Route Architecture & Indexing Registry
 * Accero PrintPortal (https://printportal.accero.app)
 *
 * GOVERNANCE RULES:
 * 1. Single Source of Truth: All public canonical routes eligible for search indexing are registered here.
 * 2. Absolute Parity: sitemap.ts, robots.ts, and test suites must strictly consume this registry.
 * 3. Exclusions: Private operator workflows, auth pages, and API endpoints are strictly categorized as NOINDEX.
 */

export interface CanonicalRouteConfig {
  path: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  lastModified?: string;
  category: 'core' | 'pillar' | 'service' | 'feature' | 'solution' | 'blog' | 'trust' | 'comparison';
}

/**
 * 45 Genuinely Public Canonical Routes Eligible for Google Search Indexing
 */
export const CANONICAL_PUBLIC_ROUTES: CanonicalRouteConfig[] = [
  // 1. Core Commercial & Platform Hubs
  { path: '/', priority: 1.0, changeFrequency: 'daily', category: 'core', lastModified: '2026-11-10' },
  { path: '/pricing', priority: 0.9, changeFrequency: 'weekly', category: 'core', lastModified: '2026-11-10' },
  { path: '/features', priority: 0.9, changeFrequency: 'weekly', category: 'core', lastModified: '2026-11-10' },
  { path: '/services', priority: 0.9, changeFrequency: 'weekly', category: 'core', lastModified: '2026-11-10' },
  { path: '/solutions', priority: 0.9, changeFrequency: 'weekly', category: 'core', lastModified: '2026-11-10' },

  // 2. High-Intent Commercial Pillar & Competitor-Intent Pages
  { path: '/print-portal', priority: 0.95, changeFrequency: 'daily', category: 'pillar', lastModified: '2026-11-10' },
  { path: '/best-print-portal-for-csc', priority: 0.9, changeFrequency: 'weekly', category: 'pillar', lastModified: '2026-11-10' },
  { path: '/print-portal-for-cyber-cafe', priority: 0.9, changeFrequency: 'weekly', category: 'pillar', lastModified: '2026-11-10' },
  { path: '/print-portal-for-retailers', priority: 0.9, changeFrequency: 'weekly', category: 'pillar', lastModified: '2026-11-10' },
  { path: '/pvc-card-printing-software', priority: 0.9, changeFrequency: 'weekly', category: 'pillar', lastModified: '2026-11-10' },
  { path: '/csc-operator-software', priority: 0.85, changeFrequency: 'weekly', category: 'pillar', lastModified: '2026-11-10' },
  { path: '/document-processing-platform', priority: 0.85, changeFrequency: 'weekly', category: 'pillar', lastModified: '2026-11-10' },

  // 3. Core Document Services (6 Primary Canonical Slugs)
  { path: '/services/pan-card-printing', priority: 0.9, changeFrequency: 'weekly', category: 'service', lastModified: '2026-11-10' },
  { path: '/services/aadhaar-document-management', priority: 0.9, changeFrequency: 'weekly', category: 'service', lastModified: '2026-11-10' },
  { path: '/services/voter-id-printing', priority: 0.9, changeFrequency: 'weekly', category: 'service', lastModified: '2026-11-10' },
  { path: '/services/driving-licence-printing', priority: 0.9, changeFrequency: 'weekly', category: 'service', lastModified: '2026-11-10' },
  { path: '/services/vehicle-rc-printing', priority: 0.9, changeFrequency: 'weekly', category: 'service', lastModified: '2026-11-10' },
  { path: '/services/ration-card-management', priority: 0.9, changeFrequency: 'weekly', category: 'service', lastModified: '2026-11-10' },

  // 4. Feature Detail Pages
  { path: '/features/document-lookup', priority: 0.8, changeFrequency: 'monthly', category: 'feature', lastModified: '2026-11-10' },
  { path: '/features/document-management', priority: 0.8, changeFrequency: 'monthly', category: 'feature', lastModified: '2026-11-10' },
  { path: '/features/document-editing', priority: 0.8, changeFrequency: 'monthly', category: 'feature', lastModified: '2026-11-10' },
  { path: '/features/document-printing', priority: 0.8, changeFrequency: 'monthly', category: 'feature', lastModified: '2026-11-10' },
  { path: '/features/multilingual-printing', priority: 0.8, changeFrequency: 'monthly', category: 'feature', lastModified: '2026-11-10' },
  { path: '/features/wallet-management', priority: 0.8, changeFrequency: 'monthly', category: 'feature', lastModified: '2026-11-10' },

  // 5. Target Audience Solution Pages
  { path: '/solutions/cyber-cafes', priority: 0.8, changeFrequency: 'monthly', category: 'solution', lastModified: '2026-11-10' },
  { path: '/solutions/csc-operators', priority: 0.8, changeFrequency: 'monthly', category: 'solution', lastModified: '2026-11-10' },
  { path: '/solutions/printing-shops', priority: 0.8, changeFrequency: 'monthly', category: 'solution', lastModified: '2026-11-10' },
  { path: '/solutions/digital-service-centers', priority: 0.8, changeFrequency: 'monthly', category: 'solution', lastModified: '2026-11-10' },

  // 6. Educational Cornerstone Guides & Resources
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly', category: 'blog', lastModified: '2026-11-10' },
  { path: '/blog/cr80-card-dimensions-guide', priority: 0.7, changeFrequency: 'monthly', category: 'blog', lastModified: '2026-11-10' },
  { path: '/blog/pvc-card-printer-tray-guide', priority: 0.7, changeFrequency: 'monthly', category: 'blog', lastModified: '2026-11-10' },
  { path: '/blog/cyber-cafe-document-printing-guide', priority: 0.7, changeFrequency: 'monthly', category: 'blog', lastModified: '2026-11-10' },
  { path: '/blog/how-to-fix-missing-card-fields', priority: 0.7, changeFrequency: 'monthly', category: 'blog', lastModified: '2026-11-10' },
  { path: '/blog/multilingual-document-printing-guide', priority: 0.7, changeFrequency: 'monthly', category: 'blog', lastModified: '2026-11-10' },
  { path: '/resources', priority: 0.7, changeFrequency: 'monthly', category: 'blog', lastModified: '2026-11-10' },

  // 7. Institutional, Legal & Trust Pages
  { path: '/about', priority: 0.7, changeFrequency: 'monthly', category: 'trust', lastModified: '2026-11-10' },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly', category: 'trust', lastModified: '2026-11-10' },
  { path: '/faq', priority: 0.8, changeFrequency: 'weekly', category: 'trust', lastModified: '2026-11-10' },
  { path: '/security', priority: 0.6, changeFrequency: 'monthly', category: 'trust', lastModified: '2026-11-10' },
  { path: '/privacy-policy', priority: 0.5, changeFrequency: 'yearly', category: 'trust', lastModified: '2026-11-10' },
  { path: '/terms', priority: 0.5, changeFrequency: 'yearly', category: 'trust', lastModified: '2026-11-10' },

  // 8. Competitor Comparison & Migration Pages
  { path: '/compare/digitalportal-alternative', priority: 0.85, changeFrequency: 'weekly', category: 'comparison', lastModified: '2026-11-13' },
  { path: '/compare/fastprintportal-alternative', priority: 0.85, changeFrequency: 'weekly', category: 'comparison', lastModified: '2026-11-13' },
  { path: '/compare/kamboj-print-portal-alternative', priority: 0.85, changeFrequency: 'weekly', category: 'comparison', lastModified: '2026-11-13' },
  { path: '/compare/skprintportal-alternative', priority: 0.85, changeFrequency: 'weekly', category: 'comparison', lastModified: '2026-11-13' },
];

/**
 * Private Application Workflows (Protected, Never Indexed)
 */
export const PRIVATE_NOINDEX_ROUTES = [
  '/dashboard',
  '/dashboard/*',
  '/studio',
  '/studio/*',
  '/wallet',
  '/wallet/*',
  '/admin',
  '/admin/*',
  '/support',
  '/support/*',
  '/cards',
  '/cards/*',
  '/api/*',
] as const;

/**
 * Authentication Pages (Publicly accessible, but meta noindex to keep search index clean)
 */
export const AUTH_NOINDEX_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const;

/**
 * Verification Static File Allowances (Accessible to search verification engines)
 */
export const STATIC_VERIFICATION_ALLOWANCES = [
  '/google83ee5457f4c0bef8.html',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/llms-full.txt',
  '/.well-known/ard.json',
  '/.well-known/ai-catalog.json',
] as const;

