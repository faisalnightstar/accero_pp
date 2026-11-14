import { describe, it, expect } from 'vitest';
import { getCanonicalUrl, getBaseUrl, PRIMARY_CANONICAL_DOMAIN } from '@/lib/seo/canonical';
import { getServiceConfig } from '@/lib/seo/servicesData';

describe('SEO Canonicalization Engine', () => {
  it('enforces HTTPS and PRIMARY_CANONICAL_DOMAIN across all paths', () => {
    expect(PRIMARY_CANONICAL_DOMAIN).toBe('https://printportal.accero.app');
    expect(getBaseUrl()).toBe('https://printportal.accero.app');

    const canonicalRoot = getCanonicalUrl('/');
    expect(canonicalRoot).toBe('https://printportal.accero.app');

    const canonicalService = getCanonicalUrl('/services/pan-card-printing');
    expect(canonicalService).toBe('https://printportal.accero.app/services/pan-card-printing');
  });

  it('strips query parameters and hashes from canonical URLs', () => {
    const urlWithParams = getCanonicalUrl('/pricing?ref=promo&utm_source=google#faq');
    expect(urlWithParams).toBe('https://printportal.accero.app/pricing');
  });

  it('strips trailing slashes from non-root paths to prevent duplicate content loops', () => {
    const urlWithTrailingSlash = getCanonicalUrl('/about/');
    expect(urlWithTrailingSlash).toBe('https://printportal.accero.app/about');
  });

  it('maps legacy and alias service slugs to primary canonical slugs', () => {
    const aliasCases = [
      { alias: 'pan-card', expectedSlug: 'pan-card-printing' },
      { alias: 'pan-card-management', expectedSlug: 'pan-card-printing' },
      { alias: 'aadhaar-card', expectedSlug: 'aadhaar-document-management' },
      { alias: 'voter-id', expectedSlug: 'voter-id-printing' },
      { alias: 'driving-license', expectedSlug: 'driving-licence-printing' },
      { alias: 'vehicle-rc', expectedSlug: 'vehicle-rc-printing' },
      { alias: 'ration-card', expectedSlug: 'ration-card-printing' },
      { alias: 'farmer-id', expectedSlug: 'farmer-id-printing' },
    ];

    aliasCases.forEach(({ alias, expectedSlug }) => {
      const config = getServiceConfig(alias);
      expect(config, `Expected config for alias ${alias}`).toBeDefined();
      expect(config?.slug).toBe(expectedSlug);
    });
  });
});
