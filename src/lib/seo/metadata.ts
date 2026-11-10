/**
 * Reusable Metadata Generator for Next.js 15 App Router
 * Accero PrintPortal (https://printportal.accero.app)
 */

import type { Metadata } from 'next';
import { getBaseUrl, getCanonicalUrl } from './canonical';

export interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogImageTitle?: string;
  noIndex?: boolean;
}

/**
 * Builds standardized, fully-qualified Metadata for public indexable pages
 */
export function buildPageMetadata({
  title,
  description,
  path = '/',
  keywords = [],
  ogImageTitle,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const baseUrl = getBaseUrl();
  const canonicalUrl = getCanonicalUrl(path);
  const ogTitle = ogImageTitle || title;
  const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(ogTitle)}`;

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Accero PrintPortal',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} - Accero PrintPortal`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@acceroapp',
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}

/**
 * Builds strict noindex, nofollow metadata for private, authenticated, or sensitive utility routes
 */
export function buildPrivateMetadata(title: string = 'Secure Portal'): Metadata {
  return {
    title: `${title} | Accero PrintPortal`,
    description: 'Secure operator access portal. Authentication required.',
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        'max-video-preview': 0,
        'max-image-preview': 'none',
        'max-snippet': 0,
      },
    },
  };
}

