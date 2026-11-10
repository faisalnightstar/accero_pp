import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/canonical';
import { getAllServices } from '@/lib/seo/servicesData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const publishDate = new Date('2026-11-10T00:00:00.000Z');

  // Root & Primary Commercial Routes
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: publishDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: publishDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: publishDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: publishDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/solutions`,
      lastModified: publishDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // 6 Core Document Services
  const services = getAllServices();
  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: publishDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Dedicated Feature Pages
  const featurePages = [
    'document-lookup',
    'document-management',
    'document-editing',
    'document-printing',
    'multilingual-printing',
    'wallet-management',
  ];
  const featureRoutes: MetadataRoute.Sitemap = featurePages.map((slug) => ({
    url: `${baseUrl}/features/${slug}`,
    lastModified: publishDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Target Solution Pages for Operators
  const solutionPages = [
    'cyber-cafes',
    'csc-operators',
    'printing-shops',
    'digital-service-centers',
  ];
  const solutionRoutes: MetadataRoute.Sitemap = solutionPages.map((slug) => ({
    url: `${baseUrl}/solutions/${slug}`,
    lastModified: publishDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Educational Cornerstone Blog Guides & Resources
  const contentRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: publishDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/cr80-card-dimensions-guide`,
      lastModified: publishDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/pvc-card-printer-tray-guide`,
      lastModified: publishDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/cyber-cafe-document-printing-guide`,
      lastModified: publishDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/how-to-fix-missing-card-fields`,
      lastModified: publishDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/multilingual-document-printing-guide`,
      lastModified: publishDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: publishDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // High-Intent Competitor & Commercial Pillar Pages
  const competitorPillarRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/print-portal`,
      lastModified: publishDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/best-print-portal-for-csc`,
      lastModified: publishDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/print-portal-for-cyber-cafe`,
      lastModified: publishDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/print-portal-for-retailers`,
      lastModified: publishDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pvc-card-printing-software`,
      lastModified: publishDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/csc-operator-software`,
      lastModified: publishDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/document-processing-platform`,
      lastModified: publishDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  // Informational, Legal & Trust Pages
  const trustRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/about`,
      lastModified: publishDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: publishDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: publishDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/security`,
      lastModified: publishDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: publishDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: publishDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  return [
    ...coreRoutes,
    ...competitorPillarRoutes,
    ...serviceRoutes,
    ...featureRoutes,
    ...solutionRoutes,
    ...contentRoutes,
    ...trustRoutes,
  ];
}
