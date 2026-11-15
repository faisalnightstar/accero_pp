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
  HelpCircle,
  Clock,
  Zap,
  Sliders,
} from 'lucide-react';
import { getAllServices } from '@/lib/seo/servicesData';
import { getBaseUrl, getCanonicalUrl } from '@/lib/seo/canonical';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';
import { ServiceGrid } from '@/components/public/ServiceGrid';
import { ServiceCardData } from '@/components/public/ServiceCard';
import { FAQSection } from '@/components/public/FAQSection';
import { CTASection } from '@/components/public/CTASection';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'PVC Card Printing Services Directory | Accero PrintPortal',
  description:
    'Browse all official-standard preformatted PVC card printing services: PAN Card, Aadhaar Card, Voter ID (EPIC), Driving Licence (DL), Vehicle RC, Ration Card, and Farmer ID. High-DPI ISO 7810 CR80 print-ready PDF export.',
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

const serviceFaqs = [
  {
    question: 'Which identity document card services are supported in the directory?',
    answer:
      'Accero PrintPortal provides preformatted CR80 PVC card templates for PAN Card, Aadhaar Card, Voter ID (EPIC), Transport Driving Licence (DL), Vehicle Registration Certificate (RC), NFSA Family Ration Card, and Farmer ID cards.',
  },
  {
    question: 'What happens if an external registry lookup times out or fails?',
    answer:
      'If an external provider is unreachable or returns no data, zero fee is deducted from your wallet balance (₹0). Operators can switch seamlessly to our offline-capable manual entry studio to fill demographic details, upload photos, and print on the same standard card layout.',
  },
  {
    question: 'Are card re-prints charged to the operator wallet?',
    answer:
      'No. Once a card is generated or drafted, it is saved in your encrypted document vault. Subsequent views, edits, PDF re-downloads, and physical re-prints are 100% free forever (₹0).',
  },
  {
    question: 'How does Accero PrintPortal ensure 1:1 physical card tray alignment?',
    answer:
      'Our engine formats every card to the international ISO/IEC 7810 ID-1 standard (85.60 mm × 53.98 mm) and injects custom zero-margin CSS `@page` print rules. This bypasses standard browser margin injection and maps pixels directly into Epson Tray J and Canon G-series PVC card trays.',
  },
  {
    question: 'Can I test a service before recharging my operator wallet?',
    answer:
      'Yes. Operators can access the manual entry studio, test split-screen live preview synchronization, and inspect template alignment before adding balance.',
  },
];

const workflowSteps = [
  {
    step: '01',
    title: 'Select Document Service',
    description: 'Pick PAN, Aadhaar, Voter, DL, RC, Ration Card, or Farmer ID from the service directory.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Lookup or Manual Draft',
    description: 'Query by alphanumeric document ID in under 2 seconds, or type customer details manually.',
    icon: Zap,
  },
  {
    step: '03',
    title: 'Split-Screen Verification',
    description: 'Inspect live reactive canvas. Missing father names or photos are flagged in amber for instant completion.',
    icon: Sliders,
  },
  {
    step: '04',
    title: '1-Click Zero-Margin Print',
    description: 'Send directly to your Epson or Canon PVC card tray, or export a 300+ DPI vector PDF file.',
    icon: Printer,
  },
];

export default function ServicesDirectoryPage() {
  const services = getAllServices();

  const softwareSchema = generateSoftwareApplicationSchema('PVC Card Printing Services');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services Directory', url: '/services' },
  ]);
  const faqSchema = generateFaqSchema(serviceFaqs);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-7xl mx-auto space-y-16">
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
                <span>100% Free Lifetime Re-Prints (₹0)</span>
              </div>
            </div>
          </div>

          {/* 4-Step Operator Counter Pipeline */}
          <section className="space-y-6">
            <div className="text-left space-y-1">
              <h2 className="text-2xl font-bold text-[#1D3557]">
                How Document Card Printing Works at the Counter
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                A streamlined 4-stage pipeline designed for walk-in speed and zero-defect card output.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {workflowSteps.map((ws, i) => {
                const IconComp = ws.icon;
                return (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#8B1E2D]/20 font-mono">{ws.step}</span>
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#1D3557]">
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-[#1D3557]">{ws.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{ws.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

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
                      <td className="py-3.5 px-4 font-mono">85.60 mm &times; 53.98 mm</td>
                      <td className="py-3.5 px-4 font-mono">3.18 mm (CR80)</td>
                      <td className="py-3.5 px-4 font-medium text-emerald-700">300+ DPI Vector</td>
                      <td className="py-3.5 px-4">Epson Tray J / Canon G</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">₹0 (Free Lifetime)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ Section */}
          <FAQSection
            faqs={serviceFaqs}
            title="Frequently Asked Questions About Document Services"
            subtitle="Everything operators need to know about supported formats, registry lookups, and printer trays."
          />

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
