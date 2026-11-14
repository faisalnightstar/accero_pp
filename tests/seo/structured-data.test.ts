import { describe, it, expect } from 'vitest';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateSoftwareApplicationSchema,
  generateServiceSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
  generateHowToSchema,
  generateArticleSchema,
} from '@/lib/seo/structuredData';

describe('Structured Data (JSON-LD) Validation & Entity Conformance', () => {
  it('generates a valid, verified Organization schema', () => {
    const org = generateOrganizationSchema();

    expect(org['@context']).toBe('https://schema.org');
    expect(org['@type']).toBe('Organization');
    expect(org.name).toBe('Accero PrintPortal');
    expect(org.legalName).toBe('Accero Technologies');
    expect(org.url).toBe('https://printportal.accero.app');
    expect(org.contactPoint).toBeDefined();
    expect(org.contactPoint.contactType).toBe('Customer Support');
    expect(org.sameAs.length).toBeGreaterThanOrEqual(3);
  });

  it('generates a valid WebSite schema with SearchAction query-input', () => {
    const site = generateWebSiteSchema();

    expect(site['@context']).toBe('https://schema.org');
    expect(site['@type']).toBe('WebSite');
    expect(site.potentialAction).toBeDefined();
    expect(site.potentialAction['@type']).toBe('SearchAction');
    expect(site.potentialAction.target.urlTemplate).toContain('/services?q=');
  });

  it('generates a valid SoftwareApplication schema with pricing offer and zero fabricated ratings', () => {
    const app = generateSoftwareApplicationSchema(
      'PAN Card Printing - Accero PrintPortal',
      'BusinessApplication',
      ['Instant PAN Verification', 'ISO 7810 CR80 Format']
    );

    expect(app['@context']).toBe('https://schema.org');
    expect(app['@type']).toBe('SoftwareApplication');
    expect(app.applicationCategory).toBe('BusinessApplication');
    expect(app.operatingSystem).toContain('Cross-platform');
    expect(app.offers).toBeDefined();
    expect(app.offers.priceCurrency).toBe('INR');
    expect(app.offers.price).toBe('5.00');

    // Strict rule: Zero fabricated reviews or aggregate ratings
    expect((app as any).aggregateRating).toBeUndefined();
    expect((app as any).review).toBeUndefined();
  });

  it('generates a valid Service schema for document workflows', () => {
    const service = generateServiceSchema({
      name: 'Voter ID (EPIC) Card Printing',
      description: 'Format official electoral voter ID cards on CR80 PVC templates.',
      serviceType: 'Electoral Services',
      url: 'https://printportal.accero.app/services/voter-id-printing',
      fee: 20,
      originalFee: 25,
    });

    expect(service['@context']).toBe('https://schema.org');
    expect(service['@type']).toBe('Service');
    expect(service.name).toBe('Voter ID (EPIC) Card Printing');
    expect(service.serviceType).toBe('Electoral Services');
    expect(service.provider.name).toBe('Accero Technologies');
    expect(service.areaServed.name).toBe('India');
    expect(service.hasOfferCatalog).toBeDefined();
    expect(service.hasOfferCatalog.itemListElement[0].price).toBe('20.00');
  });

  it('generates a valid BreadcrumbList schema with sequential 1-based indexing', () => {
    const breadcrumbs = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Services', url: '/services' },
      { name: 'PAN Card', url: '/services/pan-card-printing' },
    ]);

    expect(breadcrumbs['@context']).toBe('https://schema.org');
    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
    expect(breadcrumbs.itemListElement).toHaveLength(3);

    breadcrumbs.itemListElement.forEach((item, idx) => {
      expect(item.position).toBe(idx + 1);
      expect(item.item.startsWith('https://printportal.accero.app')).toBe(true);
    });
  });

  it('generates valid FAQPage schema with matching Question and Answer objects', () => {
    const faq = generateFaqSchema([
      { question: 'What is CR80 standard?', answer: '85.60 mm by 53.98 mm.' },
      { question: 'Are re-prints free?', answer: 'Yes, lifetime re-prints are ₹0.' },
    ]);

    expect(faq['@context']).toBe('https://schema.org');
    expect(faq['@type']).toBe('FAQPage');
    expect(faq.mainEntity).toHaveLength(2);
    expect(faq.mainEntity[0]['@type']).toBe('Question');
    expect(faq.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe('85.60 mm by 53.98 mm.');
  });

  it('generates valid HowTo and Article schemas', () => {
    const howTo = generateHowToSchema('Print PAN Card', [
      { name: 'Lookup', text: 'Enter 10-character PAN number.' },
      { name: 'Edit', text: 'Correct missing fields in amber.' },
      { name: 'Print', text: 'Send 0-margin output to Epson Tray J.' },
    ]);

    expect(howTo['@type']).toBe('HowTo');
    expect(howTo.step).toHaveLength(3);

    const article = generateArticleSchema({
      title: 'CR80 Card Dimensions Guide',
      description: 'Physical specs for ID-1 PVC printing.',
      url: 'https://printportal.accero.app/blog/cr80-card-dimensions-guide',
      datePublished: '2026-11-10T00:00:00Z',
    });

    expect(article['@type']).toBe('Article');
    expect(article.headline).toBe('CR80 Card Dimensions Guide');
    expect(article.author.name).toBe('Accero Technical Team');
  });
});
