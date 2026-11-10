import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, './'),
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
        destination: '/services/ration-card-management',
        permanent: true,
      },
      {
        source: '/services/ration-card-printing',
        destination: '/services/ration-card-management',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
