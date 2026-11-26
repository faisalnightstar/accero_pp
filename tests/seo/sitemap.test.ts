import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import { CANONICAL_PUBLIC_ROUTES, AUTH_NOINDEX_ROUTES } from '@/lib/seo/routes';
import { PRIMARY_CANONICAL_DOMAIN } from '@/lib/seo/canonical';

describe('Sitemap Integrity & Governance', () => {
  const generatedSitemap = sitemap();
  const sitemapUrls = generatedSitemap.map((item) => item.url);

  it('matches exactly the 57 canonical public routes registered in routes.ts (52 baseline + 1 CR80 calculator + 3 search-intent expansion routes + 1 refund policy)', () => {
    expect(generatedSitemap.length).toBe(CANONICAL_PUBLIC_ROUTES.length);
    expect(generatedSitemap.length).toBe(57);
  });

  it('ensures every sitemap URL starts with the authoritative production domain', () => {
    sitemapUrls.forEach((url) => {
      expect(url.startsWith('https://printportal.accero.app')).toBe(true);
    });
  });

  it('strictly excludes all private workflow routes from sitemap', () => {
    const forbiddenPrefixes = ['/dashboard', '/studio', '/wallet', '/cards', '/admin', '/api'];
    sitemapUrls.forEach((url) => {
      const pathname = new URL(url).pathname;
      forbiddenPrefixes.forEach((prefix) => {
        expect(pathname.startsWith(prefix)).toBe(false);
      });
    });
  });

  it('strictly excludes authentication routes from sitemap', () => {
    AUTH_NOINDEX_ROUTES.forEach((authPath) => {
      const fullAuthUrl = `${PRIMARY_CANONICAL_DOMAIN}${authPath}`;
      expect(sitemapUrls).not.toContain(fullAuthUrl);
    });
  });

  it('provides deterministic lastModified dates and valid change frequencies', () => {
    const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

    generatedSitemap.forEach((entry) => {
      expect(validFrequencies).toContain(entry.changeFrequency);
      expect(entry.priority).toBeGreaterThanOrEqual(0.5);
      expect(entry.priority).toBeLessThanOrEqual(1.0);
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(isNaN(new Date(entry.lastModified!).getTime())).toBe(false);
    });
  });
});
