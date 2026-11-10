import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import {
  CANONICAL_PUBLIC_ROUTES,
  PRIVATE_NOINDEX_ROUTES,
  AUTH_NOINDEX_ROUTES,
  STATIC_VERIFICATION_ALLOWANCES,
} from '@/lib/seo/routes';
import { buildPrivateMetadata, buildPageMetadata } from '@/lib/seo/metadata';
import { getBaseUrl, getCanonicalUrl, PRIMARY_CANONICAL_DOMAIN } from '@/lib/seo/canonical';
import fs from 'fs';
import path from 'path';

describe('Technical SEO & Public Route Indexing Architecture', () => {
  const generatedSitemap = sitemap();
  const sitemapUrls = generatedSitemap.map((item) => item.url);

  describe('1. Sitemap Coverage & Parity', () => {
    it('contains all 41 genuinely public canonical website routes', () => {
      expect(CANONICAL_PUBLIC_ROUTES).toHaveLength(41);
      expect(generatedSitemap).toHaveLength(41);
    });

    it('ensures every sitemap URL starts with the canonical HTTPS domain', () => {
      sitemapUrls.forEach((url) => {
        expect(url.startsWith('https://printportal.accero.app')).toBe(true);
      });
    });

    it('contains zero duplicate URLs in sitemap', () => {
      const uniqueUrls = new Set(sitemapUrls);
      expect(uniqueUrls.size).toBe(sitemapUrls.length);
    });

    it('contains zero query parameters or URL fragments', () => {
      sitemapUrls.forEach((url) => {
        expect(url).not.toContain('?');
        expect(url).not.toContain('#');
      });
    });

    it('contains valid changeFrequency, priority, and deterministic dates', () => {
      const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

      generatedSitemap.forEach((item) => {
        expect(validFrequencies).toContain(item.changeFrequency);
        expect(item.priority).toBeGreaterThanOrEqual(0.1);
        expect(item.priority).toBeLessThanOrEqual(1.0);
        expect(item.lastModified).toBeInstanceOf(Date);
        expect(isNaN(new Date(item.lastModified!).getTime())).toBe(false);
      });
    });
  });

  describe('2. Strict Private & Auth Route Exclusions from Sitemap', () => {
    it('excludes all private operator routes from sitemap', () => {
      const privatePrefixes = ['/dashboard', '/studio', '/wallet', '/cards', '/admin', '/api'];

      sitemapUrls.forEach((url) => {
        const urlObj = new URL(url);
        privatePrefixes.forEach((prefix) => {
          expect(urlObj.pathname.startsWith(prefix)).toBe(false);
        });
      });
    });

    it('excludes all authentication routes from sitemap', () => {
      AUTH_NOINDEX_ROUTES.forEach((authPath) => {
        const fullAuthUrl = `${PRIMARY_CANONICAL_DOMAIN}${authPath}`;
        expect(sitemapUrls).not.toContain(fullAuthUrl);
      });
    });

    it('excludes service aliases and legacy redirect routes from sitemap', () => {
      const aliasSlugs = [
        '/services/pan-card',
        '/services/pan-card-management',
        '/services/aadhaar-card',
        '/services/aadhaar-card-printing',
        '/services/voter-id',
        '/services/voter-id-card-printing',
        '/services/driving-license',
        '/services/vehicle-rc',
        '/services/ration-card',
      ];

      aliasSlugs.forEach((alias) => {
        const fullAliasUrl = `${PRIMARY_CANONICAL_DOMAIN}${alias}`;
        expect(sitemapUrls).not.toContain(fullAliasUrl);
      });
    });
  });

  describe('3. Robots.txt Compliance & Bot Policy', () => {
    const robotsConfig = robots();

    it('declares the authoritative sitemap in robots.txt', () => {
      expect(robotsConfig.sitemap).toBe('https://printportal.accero.app/sitemap.xml');
    });

    it('allows crawling on all public routes and static verification assets', () => {
      const defaultRule = (robotsConfig.rules as any[]).find((r) => r.userAgent === '*');
      expect(defaultRule).toBeDefined();

      // Verification asset must be allowed
      expect(defaultRule.allow).toContain('/google83ee5457f4c0bef8.html');

      // Primary routes must be allowed
      CANONICAL_PUBLIC_ROUTES.forEach((route) => {
        expect(defaultRule.allow).toContain(route.path);
      });
    });

    it('strictly disallows private operator routes and API endpoints in robots.txt', () => {
      const defaultRule = (robotsConfig.rules as any[]).find((r) => r.userAgent === '*');

      expect(defaultRule.disallow).toContain('/dashboard');
      expect(defaultRule.disallow).toContain('/studio');
      expect(defaultRule.disallow).toContain('/wallet');
      expect(defaultRule.disallow).toContain('/cards');
      expect(defaultRule.disallow).toContain('/api/*');
    });

    it('does NOT block /login or /register in robots.txt so Google can discover their noindex tag', () => {
      const defaultRule = (robotsConfig.rules as any[]).find((r) => r.userAgent === '*');

      expect(defaultRule.disallow).not.toContain('/login');
      expect(defaultRule.disallow).not.toContain('/register');
      expect(defaultRule.disallow).not.toContain('/forgot-password');
      expect(defaultRule.disallow).not.toContain('/reset-password');
    });
  });

  describe('4. Metadata Generator & Indexability Guarantees', () => {
    it('sets index: true and follow: true for public pages', () => {
      const meta = buildPageMetadata({
        title: 'Test Public Page',
        description: 'Test Description',
        path: '/pricing',
      });

      expect(meta.robots).toEqual(
        expect.objectContaining({
          index: true,
          follow: true,
        })
      );
      expect((meta.alternates as any)?.canonical).toBe('https://printportal.accero.app/pricing');
    });

    it('sets index: false and follow: false for private workflows', () => {
      const privateMeta = buildPrivateMetadata('Operator Dashboard');

      expect(privateMeta.robots).toEqual(
        expect.objectContaining({
          index: false,
          follow: false,
        })
      );
    });
  });

  describe('5. Physical Route Integrity on Disk', () => {
    it('verifies every registered canonical public route has a corresponding page.tsx file', () => {
      CANONICAL_PUBLIC_ROUTES.forEach((route) => {
        let expectedFilePath: string;

        if (route.path === '/') {
          expectedFilePath = path.join(process.cwd(), 'src/app/page.tsx');
        } else if (route.path.startsWith('/services/')) {
          expectedFilePath = path.join(process.cwd(), 'src/app/services/[card]/page.tsx');
        } else {
          expectedFilePath = path.join(process.cwd(), 'src/app', route.path, 'page.tsx');
        }

        expect(
          fs.existsSync(expectedFilePath),
          `Missing page file for registered canonical route: ${route.path}`
        ).toBe(true);
      });
    });
  });
});
