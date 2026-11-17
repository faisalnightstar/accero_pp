import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  HelpCircle,
  FileCheck,
  Check,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { getServiceConfig, getAllServices } from '@/lib/seo/servicesData';
import { getBaseUrl, getCanonicalUrl } from '@/lib/seo/canonical';
import {
  generateSoftwareApplicationSchema,
  generateFaqSchema,
  generateHowToSchema,
  generateBreadcrumbSchema,
  generateServiceSchema,
} from '@/lib/seo/structuredData';
import HeroCardPreview from '@/components/seo/HeroCardPreview';
import HeroLookupForm from '@/components/seo/HeroLookupForm';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { FAQSection } from '@/components/public/FAQSection';
import { CTASection } from '@/components/public/CTASection';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ServicePageProps {
  params: Promise<{
    card: string;
  }>;
}

export async function generateStaticParams() {
  return getAllServices().map((service) => ({
    card: service.slug,
  }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { card } = await params;
  const config = getServiceConfig(card);
  if (!config) return {};

  const baseUrl = getBaseUrl();
  const canonicalUrl = getCanonicalUrl(`/services/${config.slug}`);
  const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(config.title)}`;

  return {
    title: config.metaTitle,
    description: config.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url: canonicalUrl,
      siteName: 'Accero PrintPortal',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${config.title} - Accero PrintPortal`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.metaTitle,
      description: config.metaDescription,
      images: [ogImageUrl],
      creator: '@acceroapp',
    },
    robots:
      card === config.slug
        ? {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              'max-video-preview': -1,
              'max-image-preview': 'large',
              'max-snippet': -1,
            },
          }
        : {
            index: false,
            follow: true,
          },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { card } = await params;
  const config = getServiceConfig(card);

  if (!config) {
    notFound();
  }

  // Enforce 308 redirect from aliases to canonical slug
  if (card !== config.slug) {
    redirect(`/services/${config.slug}`);
  }

  const allServices = getAllServices();
  const canonicalUrl = getCanonicalUrl(`/services/${config.slug}`);

  // Generate Schemas
  const softwareSchema = generateSoftwareApplicationSchema(
    `${config.title} - Accero PrintPortal`,
    'BusinessApplication',
    config.features
  );
  const serviceSchema = generateServiceSchema({
    name: config.title,
    description: config.metaDescription,
    serviceType: 'Document Printing Service',
    url: canonicalUrl,
    fee: config.fee,
    originalFee: config.originalFee,
  });
  const faqSchema = generateFaqSchema(config.faqs);
  const howToSchema = generateHowToSchema(config.title, config.howToSteps);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: config.shortTitle, url: canonicalUrl },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
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

      <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Breadcrumb Navigation */}
          <Breadcrumbs
            items={[
              { name: 'Services', url: '/services' },
              { name: config.shortTitle, url: `/services/${config.slug}` },
            ]}
            className="text-slate-500"
          />

          {/* Above-The-Fold Split Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Copy & Lookup Form */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white text-[#1D3557] border border-slate-200 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#8B1E2D]" />
                <span>Instant CR80 Physical Print Template</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight leading-tight">
                {config.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                {config.heroSubheadline}
              </p>

              {/* Value Proposition Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                {config.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* 1-Click Number Lookup Component */}
              <div className="pt-2">
                <HeroLookupForm
                  docType={config.docType}
                  placeholder={config.lookupPlaceholder}
                  exampleId={config.exampleId}
                  fee={config.fee}
                  originalFee={config.originalFee}
                  discountPercent={config.discountPercent}
                  offerBadge={config.offerBadge}
                />
              </div>
            </div>

            {/* Right Column: Live Interactive Card Canvas */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <HeroCardPreview docType={config.docType} sampleData={config.sampleData} />
            </div>
          </div>

          {/* Dedicated AEO Direct Answer Block */}
          <section className="bg-white border-l-4 border-l-[#8B1E2D] border-y border-r border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-red-50 text-[#8B1E2D] shrink-0 mt-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
                  Quick Answer / TL;DR: How to Format &amp; Print Official {config.shortTitle}
                </h2>
                <p className="text-base sm:text-lg text-[#1D3557] font-semibold leading-relaxed">
                  {config.aeoQuickAnswer}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                  <span>Format: ISO 7810 ID-1 (CR80)</span>
                  <span>&bull;</span>
                  <span>Resolution: 300+ DPI Vector</span>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span>Utility Fee:</span>
                    {config.originalFee && config.originalFee > config.fee && (
                      <span className="line-through text-slate-400">₹{config.originalFee}</span>
                    )}
                    <span className="text-emerald-700 font-bold">₹{config.fee}</span>
                    {config.discountPercent && config.discountPercent > 0 && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-emerald-200">
                        {config.offerBadge || `${config.discountPercent}% OFF`}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Specialized CSC Operator Portal Contextual Callouts */}
          {config.slug === 'ration-card-printing' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-amber-950 text-sm">
                  Dedicated CSC &amp; Jan Seva Kendra Operator Workflow
                </p>
                <p className="text-amber-800">
                  Formatting family ration cards with full NFSA member rosters? Access our specialized CSC operator portal.
                </p>
              </div>
              <Link
                href="/ration-card-printing-for-csc"
                className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors text-center"
              >
                CSC Ration Card Portal &rarr;
              </Link>
            </div>
          )}

          {config.slug === 'farmer-id-printing' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-emerald-950 text-sm">
                  CSC AgriStack &amp; PM-KISAN Operator Portal
                </p>
                <p className="text-emerald-800">
                  Formatting digital Farmer ID cards for rural farmers in your panchayat? Access our specialized CSC farmer tool.
                </p>
              </div>
              <Link
                href="/farmer-id-printing-for-csc"
                className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors text-center"
              >
                CSC Farmer ID Portal &rarr;
              </Link>
            </div>
          )}

          {/* 4-Step HowTo Process Section */}
          <section className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
                Step-by-Step
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557]">
                How It Works: 4 Steps to Print
              </h2>
              <p className="text-sm text-slate-600">
                Generate high-resolution printable card PDF files ready for your thermal or inkjet ID card tray.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {config.howToSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 relative flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-[#1D3557] font-bold text-sm flex items-center justify-center">
                      0{idx + 1}
                    </div>
                    <h3 className="text-base font-bold text-[#1D3557]">{step.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Technical Specifications & ID Printer Compatibility */}
          <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1D3557]">
                Technical Specifications &amp; Printer Tray Compatibility
              </h2>
              <p className="text-xs text-slate-600">
                Engineered to meet ISO physical identity card specifications for commercial and desktop card printers.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  {config.specs.map((spec, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-700 w-1/3">
                        {spec.label}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ Accordion Section */}
          <FAQSection
            faqs={config.faqs}
            title={`Frequently Asked Questions: ${config.shortTitle}`}
            subtitle={`Common questions about ${config.shortTitle} PVC printing, tray alignment, and verification.`}
          />

          {/* Cross-Service Exploration Links */}
          <section className="pt-6 border-t border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Other Official PVC Card Services
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {allServices
                .filter((s) => s.slug !== config.slug)
                .map((srv) => (
                  <Link
                    key={srv.slug}
                    href={`/services/${srv.slug}`}
                    className="p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:text-[#8B1E2D] flex items-center justify-between transition-colors shadow-xs"
                  >
                    <span>{srv.shortTitle}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                ))}
            </div>
          </section>

          {/* Regulatory & Security Disclaimer */}
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 leading-relaxed flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>Compliance Notice:</strong> Accero PrintPortal is an independent document layout formatting utility and physical card tray alignment tool. It is not an official government portal, does not issue official credentials, and does not impersonate statutory authorities. Operators are solely responsible for verifying the authenticity of data processed.
            </p>
          </div>

          {/* Final CTA */}
          <CTASection
            title={`Ready to Print Official-Standard ${config.shortTitle} Cards?`}
            description={`Launch the split-screen studio to preview your ${config.shortTitle} template, detect missing data, and export high-DPI prints.`}
            primaryButtonText="Open in Studio"
            primaryButtonHref={`/studio?type=${config.docType}`}
          />
        </div>
      </div>
    </>
  );
}
