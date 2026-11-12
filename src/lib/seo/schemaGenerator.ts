/**
 * Production-Grade Schema.org Structured Data Generator
 * Accero PrintPortal (https://printportal.accero.app)
 *
 * Re-exports verified, guideline-compliant JSON-LD schemas from structuredData.ts.
 * ZERO fabricated reviews, ratings, or unverified claims.
 */

import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateSoftwareApplicationSchema as baseSoftwareSchema,
  generateBreadcrumbSchema as baseBreadcrumbSchema,
  generateFaqSchema as baseFaqSchema,
  generateHowToSchema as baseHowToSchema,
  generateArticleSchema,
} from './structuredData';
import { ServiceFaq, ServiceHowToStep } from './servicesData';

export {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateArticleSchema,
};

/**
 * Generates SoftwareApplication JSON-LD schema (Strictly verified properties; no fabricated ratings)
 */
export function generateSoftwareApplicationSchema(serviceName?: string) {
  return baseSoftwareSchema(
    serviceName ? `${serviceName} - Accero PrintPortal` : 'Accero PrintPortal',
    'BusinessApplication'
  );
}

/**
 * Generates FAQPage JSON-LD schema
 */
export function generateFaqSchema(faqs: ServiceFaq[]) {
  return baseFaqSchema(faqs);
}

/**
 * Generates HowTo JSON-LD schema
 */
export function generateHowToSchema(title: string, steps: ServiceHowToStep[]) {
  return baseHowToSchema(title, steps);
}

/**
 * Generates BreadcrumbList JSON-LD schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return baseBreadcrumbSchema(items);
}
