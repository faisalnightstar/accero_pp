import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppSupportWidget from '@/components/layout/WhatsAppSupportWidget';
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import WebMcpProvider from '@/components/ai/WebMcpProvider';
import { GoogleTagManager, GoogleTagManagerNoscript } from '@/components/analytics/GoogleTagManager';
import { AppRouterPageTracker } from '@/components/analytics/PageTracker';
import { PRIMARY_CANONICAL_DOMAIN } from '@/lib/seo/canonical';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from '@/lib/seo/structuredData';

export const viewport: Viewport = {
  themeColor: '#8B1E2D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(PRIMARY_CANONICAL_DOMAIN),
  manifest: '/manifest.webmanifest',
  title: {
    default: 'Accero PrintPortal | Online Print Portal & PVC Card Printing Software',
    template: '%s | Accero PrintPortal',
  },
  description:
    'Accero PrintPortal: Leading online print portal for CSC operators and cyber cafes. Fast document formatting, split-screen editor, and zero-waste PVC card printing.',
  keywords: [
    'print portal',
    'online print portal',
    'csc print portal',
    'document printing software',
    'pvc card printing software',
    'cyber cafe document management',
    'csc operator software',
    'pan card printing software',
    'voter id printing software',
    'driving licence printing software',
    'vehicle rc printing software',
    'ration card printing software',
    'cr80 card format',
  ],
  authors: [{ name: 'Accero Technologies', url: PRIMARY_CANONICAL_DOMAIN }],
  creator: 'Accero Technologies',
  publisher: 'Accero Technologies',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Accero PrintPortal',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: PRIMARY_CANONICAL_DOMAIN,
    siteName: 'Accero PrintPortal',
    title: 'Accero PrintPortal | Online Print Portal & PVC Card Printing Software',
    description:
      'Accero PrintPortal: Leading online print portal for CSC operators and cyber cafes. Fast document formatting, split-screen editor, and zero-waste PVC card printing.',
    images: [
      {
        url: `${PRIMARY_CANONICAL_DOMAIN}/api/og?title=${encodeURIComponent(
          'Online Print Portal & PVC Card Printing Software'
        )}`,
        width: 1200,
        height: 630,
        alt: 'Accero PrintPortal - Online Print Portal & PVC Card Printing Software',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accero PrintPortal | Online Print Portal & PVC Card Printing Software',
    description:
      'Accero PrintPortal: Leading online print portal for CSC operators and cyber cafes. Fast document formatting, split-screen editor, and zero-waste PVC card printing.',
    images: [
      `${PRIMARY_CANONICAL_DOMAIN}/api/og?title=${encodeURIComponent(
        'Online Print Portal & PVC Card Printing Software'
      )}`,
    ],
    creator: '@acceroapp',
  },
  robots: {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="ard" href="/.well-known/ard.json" type="application/json" />
        <GoogleTagManager />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased overflow-x-hidden">
        <GoogleTagManagerNoscript />
        <WebMcpProvider />
        <ServiceWorkerRegistration />
        <InstallPrompt />
        <Suspense fallback={null}>
          <AppRouterPageTracker />
        </Suspense>
        <Navbar />
        <main className="flex-1">{children}</main>
        <WhatsAppSupportWidget />
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
