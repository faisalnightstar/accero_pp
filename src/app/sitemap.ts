import { MetadataRoute } from 'next';
import { getAllServices } from '@/lib/seo/servicesData';
import { getAllRegionalHubs } from '@/lib/geo/regions';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://printportal.vercel.app';
  const currentDate = new Date();

  // Root URLs
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // Core 5 Service Landing Pages
  const services = getAllServices();
  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 1.0,
  }));

  // Programmatic Regional GEO Pages (145 districts × 5 services = 725 URLs)
  const regionalHubs = getAllRegionalHubs();
  const regionalRoutes: MetadataRoute.Sitemap = [];

  for (const service of services) {
    for (const hub of regionalHubs) {
      regionalRoutes.push({
        url: `${baseUrl}/services/${service.slug}/${hub.state.slug}/${hub.district.slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return [...staticRoutes, ...serviceRoutes, ...regionalRoutes];
}
