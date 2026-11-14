import { describe, it, expect } from 'vitest';
import { buildPageMetadata, buildPrivateMetadata } from '@/lib/seo/metadata';
import { CANONICAL_PUBLIC_ROUTES } from '@/lib/seo/routes';
import { getAllServices } from '@/lib/seo/servicesData';

describe('SEO Metadata Architecture', () => {
  it('generates fully-qualified public metadata with openGraph, twitter, and canonical URL', () => {
    const meta = buildPageMetadata({
      title: 'Best Print Portal for CSC Operators',
      description: 'Zero wasted PVC cards with live split-screen editor.',
      path: '/best-print-portal-for-csc',
      keywords: ['csc print portal', 'vle print portal'],
    });

    expect(meta.title).toBe('Best Print Portal for CSC Operators');
    expect(meta.description).toBe('Zero wasted PVC cards with live split-screen editor.');
    expect((meta.alternates as any)?.canonical).toBe('https://printportal.accero.app/best-print-portal-for-csc');
    expect(meta.keywords).toEqual(['csc print portal', 'vle print portal']);

    // OpenGraph verification
    expect(meta.openGraph).toBeDefined();
    expect(meta.openGraph?.siteName).toBe('Accero PrintPortal');
    expect(meta.openGraph?.url).toBe('https://printportal.accero.app/best-print-portal-for-csc');
    expect((meta.openGraph as any)?.type).toBe('website');
    expect(meta.openGraph?.images).toBeDefined();

    // Twitter verification
    expect(meta.twitter).toBeDefined();
    expect((meta.twitter as any)?.card).toBe('summary_large_image');
    expect((meta.twitter as any)?.creator).toBe('@acceroapp');

    // Indexability robots
    expect((meta.robots as any)?.index).toBe(true);
    expect((meta.robots as any)?.follow).toBe(true);
    expect((meta.robots as any)?.googleBot?.index).toBe(true);
  });

  it('generates strict noindex, nofollow metadata for private operator routes', () => {
    const privateMeta = buildPrivateMetadata('Operator Wallet');

    expect(privateMeta.title).toBe('Operator Wallet | Accero PrintPortal');
    expect((privateMeta.robots as any)?.index).toBe(false);
    expect((privateMeta.robots as any)?.follow).toBe(false);
    expect((privateMeta.robots as any)?.googleBot?.index).toBe(false);
    expect((privateMeta.robots as any)?.googleBot?.follow).toBe(false);
  });

  it('verifies all 7 primary document services have distinct, non-empty metadata descriptions and titles', () => {
    const services = getAllServices();
    expect(services.length).toBeGreaterThanOrEqual(7);

    const titles = new Set<string>();
    const descriptions = new Set<string>();

    services.forEach((service) => {
      expect(service.title.length).toBeGreaterThan(5);
      expect(service.metaDescription.length).toBeGreaterThan(20);
      expect(titles.has(service.title)).toBe(false);
      expect(descriptions.has(service.metaDescription)).toBe(false);

      titles.add(service.title);
      descriptions.add(service.metaDescription);
    });
  });

  it('verifies all registered public canonical routes are distinct without duplicates', () => {
    const paths = CANONICAL_PUBLIC_ROUTES.map((r) => r.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });
});
