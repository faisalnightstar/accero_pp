import { ServiceFaq, ServiceHowToStep } from './servicesData';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://printportal.vercel.app';

/**
 * Generates SoftwareApplication JSON-LD schema
 */
export function generateSoftwareApplicationSchema(serviceName?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: serviceName ? `${serviceName} - Accero PrintPortal` : 'Accero PrintPortal  ',
    operatingSystem: 'All Modern Web Browsers (Chrome, Firefox, Safari, Edge)',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Document Printing Utility',
    url: BASE_URL,
    description:
      'High-performance official-standard PVC card formatting and print-ready PDF generation platform conforming strictly to ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm).',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: '5.00',
      highPrice: '50.00',
      offerCount: '5',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1850',
      bestRating: '5',
      worstRating: '1',
    },
    creator: {
      '@type': 'Organization',
      name: 'Accero PrintPortal Technologies',
      url: BASE_URL,
    },
  };
}

/**
 * Generates FAQPage JSON-LD schema
 */
export function generateFaqSchema(faqs: ServiceFaq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generates HowTo JSON-LD schema
 */
export function generateHowToSchema(title: string, steps: ServiceHowToStep[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: `Step-by-step procedure to format and print ${title} with official ISO 7810 CR80 precision.`,
    totalTime: 'PT2M',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${BASE_URL}/#how-it-works`,
    })),
  };
}

/**
 * Generates BreadcrumbList JSON-LD schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}
