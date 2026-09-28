import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://printportal.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/services', '/services/*'],
        disallow: [
          '/studio',
          '/studio/*',
          '/dashboard',
          '/dashboard/*',
          '/wallet',
          '/wallet/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
