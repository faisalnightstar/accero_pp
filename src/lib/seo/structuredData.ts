/**
 * Production-Grade Structured Data & Schema Markup Generator
 * Accero PrintPortal (https://printportal.accero.app)
 * Conforms to Google Search Central & Schema.org guidelines.
 * NO fabricated ratings, reviews, or unverified claims.
 */

import { getBaseUrl, getCanonicalUrl } from './canonical';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

/**
 * Organization Schema for Accero PrintPortal
 */
export function generateOrganizationSchema() {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: 'Accero PrintPortal',
    legalName: 'Accero Technologies',
    url: baseUrl,
    logo: `${baseUrl}/assets/logo.png`,
    description:
      'Independent commercial document processing and printing software platform designed for cyber cafes, CSC operators, printing shops, and digital service centers.',
    category: 'Document Processing and Printing SaaS',
    sameAs: [
      'https://twitter.com/acceroapp',
      'https://github.com/accero-app',
      'https://linkedin.com/company/accero',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@accero.app',
      availableLanguage: ['English', 'Hindi'],
    },
  };
}

/**
 * WebSite Schema for SearchAction & Site Recognition
 */
export function generateWebSiteSchema() {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: 'Accero PrintPortal',
    alternateName: ['PrintPortal', 'Accero Document Portal'],
    description:
      'Preformatted CR80 PVC card formatting and document processing platform with real-time split-screen editing and missing-data detection.',
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/services?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * SoftwareApplication Schema (Strictly verified properties; no fabricated ratings)
 */
export function generateSoftwareApplicationSchema(
  appName: string = 'Accero PrintPortal',
  category: string = 'BusinessApplication',
  featureList: string[] = []
) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${baseUrl}/#software`,
    name: appName,
    operatingSystem: 'Cross-platform (Web browser: Google Chrome, Mozilla Firefox, Microsoft Edge, Safari)',
    applicationCategory: category,
    applicationSubCategory: 'Document Printing & Card Formatting Utility',
    url: baseUrl,
    description:
      'High-performance document processing platform engineered for printing shops and cyber cafes to format ISO/IEC 7810 ID-1 standard PVC cards with zero missing-data failures.',
    creator: {
      '@id': `${baseUrl}/#organization`,
    },
    softwareRequirements: 'HTML5 compatible modern web browser with CSS @page print support',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: '5.00',
      description: 'Transparent pay-as-you-go utility pricing per generated card with 100% free lifetime re-prints.',
      availability: 'https://schema.org/InStock',
    },
    ...(featureList.length > 0 && { featureList }),
  };
}

/**
 * BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : getCanonicalUrl(item.url),
    })),
  };
}

/**
 * FAQPage Schema
 */
export function generateFaqSchema(faqs: FaqItem[]) {
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
 * HowTo Schema
 */
export function generateHowToSchema(title: string, steps: HowToStep[], description?: string) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description:
      description || `Step-by-step instructions to format and print ${title} on official ISO 7810 CR80 physical PVC layouts.`,
    totalTime: 'PT2M',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${baseUrl}/#how-it-works`,
    })),
  };
}

/**
 * Article Schema for Blog & Resource Guides
 */
export function generateArticleSchema({
  title,
  description,
  url,
  datePublished,
  dateModified,
  authorName = 'Accero Technical Team',
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: title,
    description,
    image: `${baseUrl}/api/og?title=${encodeURIComponent(title)}`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: baseUrl,
    },
    publisher: {
      '@id': `${baseUrl}/#organization`,
    },
  };
}

