import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getServiceConfig } from '@/lib/seo/servicesData';
import { getCanonicalUrl } from '@/lib/seo/canonical';

interface RegionalPageProps {
  params: Promise<{
    card: string;
    state: string;
    district: string;
  }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: RegionalPageProps): Promise<Metadata> {
  const { card } = await params;
  const config = getServiceConfig(card);
  const targetSlug = config ? config.slug : 'pan-card-printing';

  return {
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: getCanonicalUrl(`/services/${targetSlug}`),
    },
  };
}

export default async function RegionalServicePage({ params }: RegionalPageProps) {
  const { card } = await params;
  const config = getServiceConfig(card);
  const targetSlug = config ? config.slug : 'pan-card-printing';
  redirect(`/services/${targetSlug}`);
}
