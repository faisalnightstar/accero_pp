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
} from 'lucide-react';
import { getServiceConfig, getAllServices } from '@/lib/seo/servicesData';
import { getBaseUrl, getCanonicalUrl } from '@/lib/seo/canonical';
import {
  generateSoftwareApplicationSchema,
  generateFaqSchema,
  generateHowToSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo/structuredData';
import HeroCardPreview from '@/components/seo/HeroCardPreview';
import HeroLookupForm from '@/components/seo/HeroLookupForm';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

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

  // Generate Schemas (clean, verified, no fake ratings)
  const softwareSchema = generateSoftwareApplicationSchema(
    `${config.title} - Accero PrintPortal`,
    'BusinessApplication',
    config.features
  );
  const faqSchema = generateFaqSchema(config.faqs);
  const howToSchema = generateHowToSchema(config.title, config.howToSteps);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: config.shortTitle, url: canonicalUrl },
  ]);

  return (
    <>
      {/* Structured Data Schemas */}
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
          <Breadcrumbs
            items={[
              { name: 'Services', url: '/services' },
              { name: config.shortTitle, url: `/services/${config.slug}` },
            ]}
            className="text-slate-400"
          />

          {/* Above-The-Fold Split Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Copy & Lookup Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#8B1E2D]/20 text-[#F4D35E] border border-[#8B1E2D]/40 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant CR80 Physical Print Template</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {config.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                {config.heroSubheadline}
              </p>

              {/* Value Proposition Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                {config.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
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
                />
              </div>
            </div>

            {/* Right Column: Live Interactive Card Canvas */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <HeroCardPreview docType={config.docType} sampleData={config.sampleData} />
            </div>
          </div>

          {/* Dedicated AEO Direct Answer Block */}
          <section className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border-l-4 border-l-[#F4D35E] border-y border-r border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-[#F4D35E]/10 text-[#F4D35E] shrink-0 mt-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#F4D35E]">
                  Quick Answer / TL;DR: How to Format & Print Official {config.shortTitle}
                </h2>
                <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
                  {config.aeoQuickAnswer}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
                  <span>Format: ISO 7810 ID-1 (CR80)</span>
                  <span>•</span>
                  <span>Resolution: 300+ DPI Vector</span>
                  <span>•</span>
                  <span>Utility Fee: ₹{config.fee}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 4-Step HowTo Process Section */}
          <section className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                How It Works: 4 Steps to Print
              </h2>
              <p className="text-sm text-slate-400">
                Generate high-resolution printable card PDF files ready for your thermal or inkjet ID card tray.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {config.howToSteps.map((step, idx) => (
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

          {/* Technical Specifications & ID Printer Compatibility */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Technical Specifications & Printer Tray Compatibility
              </h2>
              <p className="text-xs text-slate-400">
                Engineered to meet ISO physical identity card specifications for commercial and desktop card printers.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  {config.specs.map((spec, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-800/80 last:border-0 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-300 w-1/3">
                        {spec.label}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ Accordion Section */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-[#F4D35E]" />
                <span>Frequently Asked Questions</span>
              </h2>
              <p className="text-xs text-slate-400">
                Common questions about {config.shortTitle} PVC printing, tray alignment, and verification.
              </p>
            </div>

            <div className="space-y-4">
              {config.faqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors space-y-2"
                >
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-start gap-2">
                    <span className="text-[#F4D35E] font-mono">Q:</span>
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Cross-Service Exploration Links */}
          <section className="pt-6 border-t border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Other Official PVC Card Services
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {allServices
                .filter((s) => s.slug !== config.slug)
                .map((srv) => (
                  <Link
                    key={srv.slug}
                    href={`/services/${srv.slug}`}
                    className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span>{srv.shortTitle}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                ))}
            </div>
          </section>

          {/* Regulatory & Security Disclaimer */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Compliance Notice:</strong> Accero PrintPortal is an independent document layout formatting utility and physical card tray alignment tool. It is not an official government portal, does not issue official credentials, and does not impersonate statutory authorities. Operators are solely responsible for verifying the authenticity of data processed.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
