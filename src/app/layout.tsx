import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'PrintPortal Next.js | Official Standard PVC Card Printing Gateway',
  description:
    'Effortless, pixel-perfect card printing with zero missing-data failures. Print PAN, Aadhaar, Voter, Driving License, and Vehicle RC cards on preformatted CR80 PVC card layouts.',
  keywords: [
    'PVC card print',
    'PAN card print',
    'Aadhaar PVC print',
    'Voter card print',
    'Driving License print',
    'Vehicle RC print',
    'CR80 card printer',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
