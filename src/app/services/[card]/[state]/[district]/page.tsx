import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  HelpCircle,
  FileCheck,
  AlertTriangle,
  Building2,
  Printer,
} from 'lucide-react';
import { getServiceConfig, getAllServices } from '@/lib/seo/servicesData';
import {
  findRegion,
  getStateBySlug,
  formatSlugToTitle,
  getAllRegionalStaticParams,
  getDistrictsForState,
} from '@/lib/geo/regions';
import {
  generateSoftwareApplicationSchema,
  generateFaqSchema,
  generateHowToSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo/schemaGenerator';
import HeroCardPreview from '@/components/seo/HeroCardPreview';
import HeroLookupForm from '@/components/seo/HeroLookupForm';

export const dynamicParams = true;

interface RegionalPageProps {
  params: Promise<{
    card: string;
    state: string;
    district: string;
  }>;
}

export async function generateStaticParams() {
  return getAllRegionalStaticParams();
}

export async function generateMetadata({ params }: RegionalPageProps): Promise<Metadata> {
  const { card, state, district } = await params;
  const config = getServiceConfig(card);
  if (!config) return {};

  const region = findRegion(state, district);
  const districtName = region ? region.district.name : formatSlugToTitle(district);
  const stateName = region ? region.state.name : formatSlugToTitle(state);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://printportal.vercel.app';
  const pageUrl = `${baseUrl}/services/${config.slug}/${state}/${district}`;

  const title = `PVC ${config.shortTitle} Printing in ${districtName}, ${stateName} | PrintPortal`;
  const description = `Format and print official-standard ISO 7810 CR80 PVC ${config.shortTitle} cards in ${districtName}, ${stateName}. Instant online number lookup, 300+ DPI vector preview, and print-ready ID tray export.`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'PrintPortal Next.js',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/api/og?title=${encodeURIComponent(
            `PVC ${config.shortTitle} in ${districtName}`
          )}`,
          width: 1200,
          height: 630,
          alt: `${config.shortTitle} Printing in ${districtName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function RegionalServicePage({ params }: RegionalPageProps) {
  const { card, state, district } = await params;
  const config = getServiceConfig(card);

  if (!config) {
    notFound();
  }

  const region = findRegion(state, district);
  const districtName = region ? region.district.name : formatSlugToTitle(district);
  const stateName = region ? region.state.name : formatSlugToTitle(state);
  const rtoCode = region?.district.rtoCode;
  const zoneName = region?.district.zone;

  const stateDistricts = getDistrictsForState(state);
  const otherDistricts = stateDistricts.filter((d) => d.slug !== district);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://printportal.vercel.app';
  const currentUrl = `${baseUrl}/services/${config.slug}/${state}/${district}`;

  // Localized FAQs
  const localizedFaqs = [
    {
      question: `Where can I print an official PVC ${config.shortTitle} in ${districtName}, ${stateName}?`,
      answer: `You can format your official PVC ${config.shortTitle} instantly on PrintPortal from any computer or mobile device in ${districtName}. Once verified, download the 300+ DPI ISO CR80 print-ready PDF and print it on any local thermal card printer or PVC ID card tray (Epson L805/Canon G-series).`,
    },
    {
      question: `Does the ${config.shortTitle} layout match the official guidelines in ${stateName}?`,
      answer: `Yes. All cards conform strictly to the national ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm) accepted across all transport departments, election offices, and government agencies in ${stateName}.`,
    },
    {
      question: `Can I print if I only have my ${config.shortTitle} number?`,
      answer: `Yes! Enter your document number into our instant lookup tool. If external records have missing fields, our interactive studio lets you review, complete, and verify all details before printing.`,
    },
    {
      question: `How much does PVC ${config.shortTitle} card formatting cost in ${districtName}?`,
      answer: `PrintPortal charges a flat utility fee of ₹${config.fee} per verified card lookup. Once generated, all subsequent re-prints and PDF re-downloads are 100% free of charge (₹0).`,
    },
    {
      question: `Are printers in ${districtName} compatible with this PDF format?`,
      answer: `Yes. The generated PDF uses exact 0-margin CSS print coordinates compatible with all commercial card printing kiosks, cyber cafes, and CSC centers throughout ${districtName} and ${stateName}.`,
    },
  ];

  // Localized HowTo Steps
  const localizedHowToSteps = [
    {
      name: `Step 1: Enter ${config.shortTitle} Number`,
      text: `Residents of ${districtName} can enter their document number in the search bar above to fetch verified records or choose blank manual entry.`,
    },
    {
      name: 'Step 2: Auto-Format on CR80 Canvas',
      text: 'Our engine positions all text, emblems, and QR codes onto the standard 85.60 mm × 53.98 mm physical card layout.',
    },
    {
      name: 'Step 3: Review & Complete Missing Fields',
      text: 'Fill in any missing details or upload a fresh candidate photograph and signature in real-time.',
    },
    {
      name: `Step 4: Download PDF & Print in ${districtName}`,
      text: 'Export an instant 300+ DPI print-ready PDF file configured for standard PVC card tray alignment.',
    },
  ];

  // Schemas
  const softwareSchema = generateSoftwareApplicationSchema(
    `PVC ${config.shortTitle} Printing - ${districtName}`
  );
  const faqSchema = generateFaqSchema(localizedFaqs);
  const howToSchema = generateHowToSchema(
    `How to Print PVC ${config.shortTitle} in ${districtName}`,
    localizedHowToSteps
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: config.shortTitle, url: `/services/${config.slug}` },
    { name: stateName, url: `/services/${config.slug}` },
    { name: districtName, url: currentUrl },
  ]);

  return (
    <>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Breadcrumb Navigation */}
          <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/services" className="hover:text-white transition-colors">
              Services
            </Link>
            <span>/</span>
            <Link href={`/services/${config.slug}`} className="hover:text-white transition-colors">
              {config.shortTitle}
            </Link>
            <span>/</span>
            <span>{stateName}</span>
            <span>/</span>
            <span className="text-[#F4D35E]">{districtName}</span>
          </nav>

          {/* Above-The-Fold Split Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Localized Copy & Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#8B1E2D]/20 text-[#F4D35E] border border-[#8B1E2D]/40 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
                <span>
                  {districtName}, {stateName}
                  {rtoCode ? ` • ${rtoCode}` : ''}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Official PVC {config.shortTitle} Printing in {districtName}, {stateName}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                Direct online formatting and high-resolution PVC smart card print generator for residents and service operators across {districtName} and the greater {stateName} region.
              </p>

              {/* Localized Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>ISO 7810 CR80 Dimensions (85.60 × 53.98 mm)</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Compatible with Local CSC & Cyber Cafe Card Trays</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Instant 1-Click Verification & Studio Redirection</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>100% Free Lifetime Re-Printing & PDF Downloads</span>
                </div>
              </div>

              {/* 1-Click Number Lookup Component */}
              <div className="pt-2">
                <HeroLookupForm
                  docType={config.docType}
                  placeholder={config.lookupPlaceholder}
                  exampleId={config.exampleId}
                  fee={config.fee}
                />
              </div>
            </div>

            {/* Right Column: Live Card Canvas */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <HeroCardPreview docType={config.docType} sampleData={config.sampleData} />
            </div>
          </div>

          {/* Localized AEO Quick Answer Block */}
          <section className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border-l-4 border-l-[#F4D35E] border-y border-r border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-[#F4D35E]/10 text-[#F4D35E] shrink-0 mt-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#F4D35E]">
                  Quick Answer: How to Print PVC {config.shortTitle} in {districtName}
                </h2>
                <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
                  Residents of {districtName}, {stateName} can print an official-standard PVC {config.shortTitle} online by entering their document number on PrintPortal to retrieve verified data, or filling fields manually. Preview the ISO 7810 CR80 card layout in real time, complete missing details, and download an instant 300+ DPI print-ready PDF configured for local card printer trays.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
                  <span>Region: {districtName}, {stateName}</span>
                  <span>•</span>
                  {rtoCode && <span>RTO Zone: {rtoCode} •</span>}
                  <span>Fee: ₹{config.fee}</span>
                  <span>•</span>
                  <span>Free Re-prints: Yes</span>
                </div>
              </div>
            </div>
          </section>

          {/* Regional Administrative Hub Card */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-[#F4D35E]" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Regional Specifications for {districtName}
                </h2>
                <p className="text-xs text-slate-400">
                  Administrative jurisdiction and physical card alignment standards for {stateName}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">District</span>
                <p className="text-base font-bold text-white">{districtName}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">State / Territory</span>
                <p className="text-base font-bold text-white">{stateName}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  {rtoCode ? 'RTO Code / Zone' : 'Administrative Zone'}
                </span>
                <p className="text-base font-bold text-white">{rtoCode || zoneName || 'Central Zone'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Physical Standard</span>
                <p className="text-base font-bold text-emerald-400">CR80 (85.60 × 53.98 mm)</p>
              </div>
            </div>
          </section>

          {/* 4-Step Process Section */}
          <section className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                How to Format Your Card in 4 Simple Steps
              </h2>
              <p className="text-sm text-slate-400">
                Ready for printing at any local center in {districtName} or on your personal ID card printer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {localizedHowToSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 relative flex flex-col justify-between hover:border-slate-700 transition-all"
                >
                  <div className="space-y-3">
                    <div className="w-8 h-8 rounded-lg bg-[#8B1E2D]/30 border border-[#8B1E2D]/50 text-[#F4D35E] font-bold text-sm flex items-center justify-center">
                      0{idx + 1}
                    </div>
                    <h3 className="text-base font-bold text-white">{step.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Localized FAQ Section */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-[#F4D35E]" />
                <span>Frequently Asked Questions in {districtName}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Common questions about {config.shortTitle} PVC printing and card tray compatibility in {districtName}.
              </p>
            </div>

            <div className="space-y-4">
              {localizedFaqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors space-y-2"
                >
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-start gap-2">
                    <span className="text-[#E63946] font-mono">Q:</span>
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Other Districts in State Links */}
          {otherDistricts.length > 0 && (
            <section className="pt-6 border-t border-slate-800/80 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Other Districts in {stateName}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {otherDistricts.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/services/${config.slug}/${state}/${d.slug}`}
                    className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>{d.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Compliance Notice */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-500 leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Compliance Notice:</strong> PrintPortal Next.js is an independent document layout formatting utility and physical card tray alignment tool. It does not issue official government credentials or impersonate government agencies in {districtName} or {stateName}.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
