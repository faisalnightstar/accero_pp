import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { CANONICAL_PUBLIC_ROUTES, STATIC_VERIFICATION_ALLOWANCES } from '@/lib/seo/routes';
import { PRIMARY_CANONICAL_DOMAIN } from '@/lib/seo/canonical';

describe('Internal Linking & Crawl Graph Architecture', () => {
  it('verifies public/llms.txt only references registered canonical routes', () => {
    const llmsPath = path.join(process.cwd(), 'public/llms.txt');
    expect(fs.existsSync(llmsPath)).toBe(true);

    const content = fs.readFileSync(llmsPath, 'utf-8');
    const urlMatches = content.match(/https:\/\/printportal\.accero\.app[^\s\)\],]+/g) || [];

    const allowedPaths = new Set(CANONICAL_PUBLIC_ROUTES.map((r) => r.path));
    // Root path
    allowedPaths.add('/');

    urlMatches.forEach((rawUrl) => {
      const urlObj = new URL(rawUrl);
      const pathname = urlObj.pathname.replace(/\/$/, '') || '/';
      expect(
        allowedPaths.has(pathname),
        `public/llms.txt references unregistered or non-canonical path: ${pathname}`
      ).toBe(true);
    });
  });

  it('verifies public/llms-full.txt only references registered canonical routes', () => {
    const llmsFullPath = path.join(process.cwd(), 'public/llms-full.txt');
    expect(fs.existsSync(llmsFullPath)).toBe(true);

    const content = fs.readFileSync(llmsFullPath, 'utf-8');
    const urlMatches = content.match(/https:\/\/printportal\.accero\.app[^\s\)\],]+/g) || [];

    const allowedPaths = new Set(CANONICAL_PUBLIC_ROUTES.map((r) => r.path));
    allowedPaths.add('/');

    urlMatches.forEach((rawUrl) => {
      const urlObj = new URL(rawUrl);
      const pathname = urlObj.pathname.replace(/\/$/, '') || '/';
      expect(
        allowedPaths.has(pathname),
        `public/llms-full.txt references unregistered or non-canonical path: ${pathname}`
      ).toBe(true);
    });
  });

  it('verifies PublicFooter links point to valid canonical routes', () => {
    const footerPath = path.join(process.cwd(), 'src/components/public/PublicFooter.tsx');
    expect(fs.existsSync(footerPath)).toBe(true);

    const content = fs.readFileSync(footerPath, 'utf-8');
    const hrefMatches = content.match(/href="(\/[^"]*)"/g) || [];

    const allowedPaths = new Set([
      ...CANONICAL_PUBLIC_ROUTES.map((r) => r.path),
      ...STATIC_VERIFICATION_ALLOWANCES,
      '/login',
      '/register',
    ]);

    hrefMatches.forEach((match) => {
      const href = match.replace('href="', '').replace('"', '');
      const cleanPath = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';

      expect(
        allowedPaths.has(cleanPath),
        `PublicFooter contains link to unregistered route: ${cleanPath}`
      ).toBe(true);
    });
  });
});
