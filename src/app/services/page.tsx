import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Car,
  Printer,
  ArrowRight,
  Sparkles,
  Layers,
  Search,
  Check,
  Shield,
  FileCheck,
  ExternalLink,
  UtensilsCrossed,
  AlertTriangle,
} from 'lucide-react';
import { getAllServices } from '@/lib/seo/servicesData';
import { getBaseUrl, getCanonicalUrl } from '@/lib/seo/canonical';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo/structuredData';
import { ServiceGrid } from '@/components/public/ServiceGrid';
import { ServiceCardData } from '@/components/public/ServiceCard';
import { CTASection } from '@/components/public/CTASection';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'PVC Card Printing Services Directory | Accero PrintPortal',
  description:
    'Browse all official-standard preformatted PVC card printing services: PAN Card, Aadhaar Card, Voter ID (EPIC), Driving Licence (DL), Vehicle RC, and Ration Card. High-DPI ISO 7810 CR80 print-ready PDF export.',
  alternates: {
    canonical: getCanonicalUrl('/services'),
  },
  openGraph: {
    title: 'PVC Card Printing Services Directory | Accero PrintPortal',
    description:
      'Instant number lookup and print-ready CR80 PVC card formatting for PAN, Aadhaar, Voter, Driving Licence, Vehicle RC, and Ration Card.',
    url: getCanonicalUrl('/services'),
    siteName: 'Accero PrintPortal',
    type: 'website',
    images: [
      {
        url: `${getBaseUrl()}/api/og?title=${encodeURIComponent('PVC Card Printing Services Directory')}`,
        width: 1200,
        height: 630,
        alt: 'PVC Card Printing Services Directory - Accero PrintPortal',
      },
    ],
  },
};

export default function ServicesDirectoryPage() {
  const services = getAllServices();

  const softwareSchema = generateSoftwareApplicationSchema('PVC Card Printing Services');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services Directory', url: '/services' },
  ]);

  const serviceGridItems: ServiceCardData[] = services.map((s) => ({
    id: s.docType,
    serviceKey: s.docType.toUpperCase(),
    slug: s.slug,
    title: s.title,
    tag: s.shortTitle,
    description: s.subtitle,
    docType: s.docType,
    fee: s.fee,
    originalFee: s.originalFee,
    discountPercent: s.discountPercent,
    offerBadge: s.offerBadge,
    features: s.features,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Services Directory</span>
          </nav>

          {/* Directory Hero Banner */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[#1D3557] text-xs font-bold border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-[#8B1E2D]" />
              <span>Standard CR80 Document Workflows</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight">
              PVC Card Printing Services Directory
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              Standard preformatted layouts conforming strictly to ISO/IEC 7810 ID-1 dimensions (85.60 mm &times; 53.98 mm). Choose any card format below to inspect specifications, test live lookups, or launch split-screen formatting.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Margin Tray Alignment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Epson &amp; Canon Tray J Ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Free Lifetime Re-Prints</span>
              </div>
            </div>
          </div>

          {/* Interactive Searchable & Categorized Service Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1D3557]">All Document Services</h2>
              <span className="text-xs text-slate-500 font-medium">
                {services.length} Formats Available
              </span>
            </div>
            <ServiceGrid services={serviceGridItems} showFilter={true} />
          </div>

          {/* Technical Specifications Matrix */}
          <section className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#1D3557]">Physical Card Tray Specifications</h3>
              <p className="text-xs text-slate-600">
                All services generate output strictly aligned to international card standard specifications.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Card Workflow</th>
                    <th className="py-3 px-4">Standard Dimensions</th>
                    <th className="py-3 px-4">Corner Radius</th>
                    <th className="py-3 px-4">Resolution</th>
                    <th className="py-3 px-4">Tray Support</th>
                    <th className="py-3 px-4">Re-Print Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {services.map((service) => (
                    <tr key={service.slug} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#1D3557]">
                        <Link href={`/services/${service.slug}`} className="hover:text-[#8B1E2D]">
                          {service.shortTitle}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">85.60 mm &times; 53.98 mm</td>
                      <td className="py-3.5 px-4">3.18 mm (CR80)</td>
                      <td className="py-3.5 px-4 font-medium text-emerald-700">300+ DPI Vector</td>
                      <td className="py-3.5 px-4">Epson Tray J / Canon G</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">₹0 (Free Lifetime)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Compliance Notice */}
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 leading-relaxed flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Compliance Notice:</strong> Accero PrintPortal is an independent commercial software platform. It is not an official government portal, and is not affiliated with, endorsed by, or partnered with UIDAI, NSDL, UTIITSL, the Election Commission of India, MoRTH, or State Food Departments. Output templates conform to the international physical card standard ISO/IEC 7810 ID-1.
            </div>
          </div>

          {/* CTA */}
          <CTASection
            title="Start Formatting PVC Cards at Your Center"
            description="Recharge your wallet starting at ₹100 via UPI and print your first official-standard card in minutes."
          />
        </div>
      </div>
    </>
  );
}
