import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Search,
  CheckCircle2,
  Zap,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  FileCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
  generateHowToSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Instant Document Lookup Tool | Accero PrintPortal',
  description:
    'Retrieve demographic document records in seconds with automated multi-provider failover. Supports PAN, Aadhaar, Voter ID, Driving Licence, Vehicle RC, and Ration Cards.',
  path: '/features/document-lookup',
  keywords: [
    'document lookup software',
    'instant document lookup',
    'pan card number lookup',
    'voter id lookup software',
    'vahan vehicle rc lookup',
    'driving licence lookup tool',
    'csc operator lookup software',
  ],
});

const faqs = [
  {
    question: 'How fast does the document lookup feature respond?',
    answer:
      'Most alphanumeric document lookups complete in under 2 seconds. In case a provider experiences latency, our silent failover cascade automatically routes the request to an alternate gateway without user interruption.',
  },
  {
    question: 'What happens if a lookup fails or the document is not found?',
    answer:
      'If all external lookup providers return no records or fail, zero fee is deducted from your wallet (₹0). You are seamlessly transitioned to manual entry mode with pre-set templates.',
  },
  {
    question: 'Does the lookup store or expose sensitive customer credentials?',
    answer:
      'No. Queries are executed strictly server-side over encrypted channels. Customer credentials and passwords are never collected or stored.',
  },
];

export default function DocumentLookupFeaturePage() {
  const softwareSchema = generateSoftwareApplicationSchema('Instant Document Lookup Tool');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
    { name: 'Document Lookup', url: '/features/document-lookup' },
  ]);
  const faqSchema = generateFaqSchema(faqs);
  const howToSchema = generateHowToSchema('How to Lookup and Format Documents on Accero PrintPortal', [
    {
      name: 'Select Document Type',
      text: 'Choose PAN, Aadhaar, Voter ID, DL, RC, or Ration Card in the portal.',
    },
    {
      name: 'Enter Alphanumeric Number',
      text: 'Provide the document ID number (e.g. 10-digit PAN or EPIC number) into the search bar.',
    },
    {
      name: 'Inspect Retrieved Data',
      text: 'Review populated fields in the split-screen studio with live reactive canvas rendering.',
    },
    {
      name: 'Verify & Print',
      text: 'Fill any missing fields and export high-DPI print-ready files.',
    },
  ]);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/features" className="hover:text-[#1D3557] transition-colors">
              Features
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Document Lookup</span>
          </nav>

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-[#8B1E2D] border border-red-200">
                <Zap className="w-3.5 h-3.5 text-[#E63946]" />
                <span>Sub-2-Second Verification Cascade</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight leading-tight">
                Instant Document Lookup for Fast Operator Fulfillment
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Retrieve verified demographic records across PAN, Aadhaar, Voter ID, Driving Licence, Vehicle RC, and Ration Cards directly onto standard CR80 physical card layouts.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all"
                >
                  Start Looking Up Documents
                </Link>
                <Link
                  href="/services"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-white text-[#1D3557] border border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  View Supported Services
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Supported Document Queries
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">10-Digit Alphanumeric PAN</span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Fast Auto-Fetch</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">10-Character Voter EPIC</span>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Assembly + Part</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Transport DL & Vehicle RC</span>
                  <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Vahan / Smart Chip</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">12-Digit UID & Ration Card</span>
                  <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Family Roster</span>
                </div>
              </div>
            </div>
          </div>

          {/* AEO Quick Answer Block */}
          <section className="bg-white border-l-4 border-l-[#8B1E2D] p-6 sm:p-8 rounded-2xl shadow-sm space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
              Direct Answer: How Does Accero PrintPortal Document Lookup Work?
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              Accero PrintPortal allows operators to query document demographic records using alphanumeric numbers. When submitted, our engine queries secure gateway providers in a multi-tiered cascade. Successfully fetched demographic data is pre-positioned onto an ISO 7810 CR80 card layout with dynamic QR codes. If any fields are omitted by the data provider, the split-screen studio flags them for operator completion before printing.
            </p>
          </section>

          {/* Key Advantages */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557]">
              Key Advantages for Cyber Cafes & CSC Centers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <RefreshCw className="w-6 h-6 text-emerald-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Automated Provider Cascade</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If the primary data provider experiences downtime or timeouts, the query instantly cascades to secondary providers without manual intervention.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Zero Fee on Failed Lookups</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unlike traditional portals that consume operator tokens on timeouts, Accero PrintPortal only debits your wallet on 100% successful data generation.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Zap className="w-6 h-6 text-blue-600" />
                <h3 className="text-base font-bold text-[#1D3557]">1-Click Canvas Transfer</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Data seamlessly populates both front and back canvases with proper text scaling and Devanagari regional font rendering.
                </p>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557] flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#8B1E2D]" />
              <span>Frequently Asked Questions</span>
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <h3 className="text-sm font-bold text-[#1D3557] mb-1">{faq.question}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Links */}
          <section className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="font-bold text-slate-500 uppercase">Related Services:</span>
            <div className="flex flex-wrap gap-4">
              <Link href="/services/pan-card-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                PAN Card Print
              </Link>
              <Link href="/services/voter-id-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                Voter ID Print
              </Link>
              <Link href="/services/driving-licence-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                Driving Licence Print
              </Link>
              <Link href="/features/document-editing" className="text-[#8B1E2D] hover:underline font-semibold">
                Split-Screen Studio
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

