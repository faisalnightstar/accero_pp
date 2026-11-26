import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  outputFileTracingRoot: path.join(__dirname, './'),
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      // Direct root-level document aliases canonicalized to /services/*
      {
        source: '/pan-card-printing',
        destination: '/services/pan-card-printing',
        permanent: true,
      },
      {
        source: '/aadhaar-card-printing',
        destination: '/services/aadhaar-document-management',
        permanent: true,
      },
      {
        source: '/voter-id-printing',
        destination: '/services/voter-id-printing',
        permanent: true,
      },
      {
        source: '/driving-licence-printing',
        destination: '/services/driving-licence-printing',
        permanent: true,
      },
      {
        source: '/vehicle-rc-printing',
        destination: '/services/vehicle-rc-printing',
        permanent: true,
      },
      {
        source: '/ration-card-printing',
        destination: '/services/ration-card-printing',
        permanent: true,
      },
      {
        source: '/farmer-id-printing',
        destination: '/services/farmer-id-printing',
        permanent: true,
      },
      {
        source: '/csc-printing-software',
        destination: '/csc-operator-software',
        permanent: true,
      },
      {
        source: '/online-pvc-card-maker',
        destination: '/pvc-card-printing-software',
        permanent: true,
      },
      // Service subpath redirects
      {
        source: '/services/pan-card',
        destination: '/services/pan-card-printing',
        permanent: true,
      },
      {
        source: '/services/pan-card-management',
        destination: '/services/pan-card-printing',
        permanent: true,
      },
      {
        source: '/services/aadhaar-card',
        destination: '/services/aadhaar-document-management',
        permanent: true,
      },
      {
        source: '/services/aadhaar-card-printing',
        destination: '/services/aadhaar-document-management',
        permanent: true,
      },
      {
        source: '/services/aadhaar-document-processing',
        destination: '/services/aadhaar-document-management',
        permanent: true,
      },
      {
        source: '/services/voter-id',
        destination: '/services/voter-id-printing',
        permanent: true,
      },
      {
        source: '/services/voter-id-card-printing',
        destination: '/services/voter-id-printing',
        permanent: true,
      },
      {
        source: '/services/voter-id-card-management',
        destination: '/services/voter-id-printing',
        permanent: true,
      },
      {
        source: '/services/driving-license',
        destination: '/services/driving-licence-printing',
        permanent: true,
      },
      {
        source: '/services/driving-license-printing',
        destination: '/services/driving-licence-printing',
        permanent: true,
      },
      {
        source: '/services/driving-licence-management',
        destination: '/services/driving-licence-printing',
        permanent: true,
      },
      {
        source: '/services/vehicle-rc',
        destination: '/services/vehicle-rc-printing',
        permanent: true,
      },
      {
        source: '/services/vehicle-rc-management',
        destination: '/services/vehicle-rc-printing',
        permanent: true,
      },
      {
        source: '/services/ration-card',
        destination: '/services/ration-card-printing',
        permanent: true,
      },
      {
        source: '/services/ration-card-management',
        destination: '/services/ration-card-printing',
        permanent: true,
      },
      {
        source: '/services/farmer-id',
        destination: '/services/farmer-id-printing',
        permanent: true,
      },
      {
        source: '/services/farmer-id-management',
        destination: '/services/farmer-id-printing',
        permanent: true,
      },
      // Competitor and legacy URL pattern redirects
      {
        source: '/service',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/services/aadhaar-print',
        destination: '/services/aadhaar-document-management',
        permanent: true,
      },
      {
        source: '/services/pan-card-print',
        destination: '/services/pan-card-printing',
        permanent: true,
      },
      {
        source: '/services/voter-id-print',
        destination: '/services/voter-id-printing',
        permanent: true,
      },
      {
        source: '/services/driving-licence-print',
        destination: '/services/driving-licence-printing',
        permanent: true,
      },
      {
        source: '/services/rc-print',
        destination: '/services/vehicle-rc-printing',
        permanent: true,
      },
      {
        source: '/services/ration-card-print',
        destination: '/services/ration-card-printing',
        permanent: true,
      },
      {
        source: '/services/farmer-card-print',
        destination: '/services/farmer-id-printing',
        permanent: true,
      },
      {
        source: '/services/pvc-card-print',
        destination: '/pvc-card-printing-software',
        permanent: true,
      },
      {
        source: '/services/ayushman-card-print',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/services/e-shram-print',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/services/abha-card-print',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/services/udyam-print',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/password-reset',
        destination: '/forgot-password',
        permanent: true,
      },
      {
        source: '/abouts',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/contacts',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/terms-condition',
        destination: '/terms',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/llms.txt',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
      {
        source: '/llms-full.txt',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
