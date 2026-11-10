import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/canonical';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  const publicAllowPaths = [
    '/',
    '/print-portal',
    '/best-print-portal-for-csc',
    '/print-portal-for-cyber-cafe',
    '/print-portal-for-retailers',
    '/pvc-card-printing-software',
    '/csc-operator-software',
    '/document-processing-platform',
    '/features',
    '/features/*',
    '/services',
    '/services/*',
    '/solutions',
    '/solutions/*',
    '/pricing',
    '/about',
    '/contact',
    '/faq',
    '/blog',
    '/blog/*',
    '/resources',
    '/resources/*',
    '/security',
    '/privacy-policy',
    '/terms',
    '/llms.txt',
    '/llms-full.txt',
  ];

  const privateDisallowPaths = [
    '/dashboard',
    '/dashboard/*',
    '/studio',
    '/studio/*',
    '/wallet',
    '/wallet/*',
    '/admin',
    '/admin/*',
    '/cards',
    '/cards/*',
    '/api/*',
  ];

  return {
    rules: [
      // Standard search engine crawlers (Google, Bing, General Web)
      {
        userAgent: '*',
        allow: publicAllowPaths,
        disallow: privateDisallowPaths,
      },
      // Googlebot (Google Search Engine)
      {
        userAgent: 'Googlebot',
        allow: publicAllowPaths,
        disallow: privateDisallowPaths,
      },
      // bingbot (Microsoft Bing & Copilot Search)
      {
        userAgent: 'bingbot',
        allow: publicAllowPaths,
        disallow: privateDisallowPaths,
      },
      // OAI-SearchBot (ChatGPT Search direct web discovery & citations)
      {
        userAgent: 'OAI-SearchBot',
        allow: publicAllowPaths,
        disallow: privateDisallowPaths,
      },
      // ChatGPT-User (Live user-initiated browsing queries in ChatGPT)
      {
        userAgent: 'ChatGPT-User',
        allow: publicAllowPaths,
        disallow: privateDisallowPaths,
      },
      // PerplexityBot (Perplexity AI conversational search engine)
      {
        userAgent: 'PerplexityBot',
        allow: publicAllowPaths,
        disallow: privateDisallowPaths,
      },
      // GPTBot (OpenAI foundation model training & general data collection)
      {
        userAgent: 'GPTBot',
        allow: publicAllowPaths,
        disallow: privateDisallowPaths,
      },
      // ClaudeBot (Anthropic AI retrieval & processing)
      {
        userAgent: 'ClaudeBot',
        allow: publicAllowPaths,
        disallow: privateDisallowPaths,
      },
      // Google-Extended (Google Gemini training & multimodal grounding)
      {
        userAgent: 'Google-Extended',
        allow: publicAllowPaths,
        disallow: privateDisallowPaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
