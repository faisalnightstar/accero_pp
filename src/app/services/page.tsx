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
} from 'lucide-react';
import { getAllServices } from '@/lib/seo/servicesData';
import { getBaseUrl, getCanonicalUrl } from '@/lib/seo/canonical';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo/structuredData';

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

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'pan':
        return <CreditCard className="w-6 h-6 text-[#E63946]" />;
      case 'aadhaar':
        return <ShieldCheck className="w-6 h-6 text-amber-500" />;
      case 'voter':
        return <CheckCircle2 className="w-6 h-6 text-blue-500" />;
      case 'dl':
        return <CreditCard className="w-6 h-6 text-indigo-500" />;
      case 'rc':
        return <Car className="w-6 h-6 text-purple-500" />;
      case 'ration':
        return <UtensilsCrossed className="w-6 h-6 text-teal-500" />;
      default:
        return <Printer className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#F4D35E]">Services Directory</span>
          </nav>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#8B1E2D]/20 text-[#F4D35E] border border-[#8B1E2D]/40 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official CR80 Physical Dimensions</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              PVC Card Printing Services
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Format official-standard preformatted PVC cards with zero missing-data failures.
              Instant number lookup, interactive missing field completion, and 1-click print-ready PDF export.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <div
                key={svc.slug}
                className="group relative rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:scale-105 transition-transform">
                      {getServiceIcon(svc.docType)}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-[#8B1E2D]/20 text-[#F4D35E] border border-[#8B1E2D]/40">
                      ₹{svc.fee} / lookup
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white group-hover:text-[#F4D35E] transition-colors">
                    {svc.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 mb-4 line-clamp-2">
                    {svc.subtitle}
                  </p>

                  <ul className="space-y-2 mb-6 text-xs text-slate-300">
                    {svc.features.slice(0, 3).map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3">
                  <Link
                    href={`/services/${svc.slug}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                  >
                    <span>Overview & Specs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/studio?type=${svc.docType}`}
                    className="inline-flex items-center justify-center gap-1 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white text-xs font-bold hover:opacity-95 transition-opacity shadow"
                  >
                    <span>Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Compliance & Standards Section */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  Compliance & Physical Standard Guarantees
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Outputs conform strictly to the international ISO/IEC 7810 ID-1 standard (85.60 mm × 53.98 mm).
                  Compatible with all standard PVC card printer trays on Epson, Canon, Zebra, Evolis, and Magicard printers.
                  Accero PrintPortal is an independent digital formatting utility with zero statutory authority impersonation.
                </p>
              </div>
            </div>

            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white text-xs font-bold hover:shadow-btn-hover transition-all shrink-0"
            >
              <Layers className="w-4 h-4 text-[#F4D35E]" />
              <span>Open Split-Screen Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
