import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Search,
  Edit3,
  Globe,
  Printer,
  Shield,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Platform Features & Tools | Accero PrintPortal',
  description:
    'Explore the complete feature suite of Accero PrintPortal: instant document lookup, split-screen live editor, multilingual typography, CR80 print engine, and wallet management.',
  path: '/features',
  keywords: [
    'document processing features',
    'pvc card studio features',
    'split-screen card editor',
    'cr80 print engine',
    'bilingual document printing',
    'operator wallet billing',
  ],
});

const featuresList = [
  {
    slug: 'document-lookup',
    title: 'Instant Document Lookup',
    subtitle: 'Automated Demographic Query with Multi-Provider Failover',
    description:
      'Enter 10-digit PAN, 12-digit Aadhaar/Ration, EPIC, or DL/RC numbers to retrieve verified demographic records directly to the editor canvas in under 2 seconds.',
    icon: Search,
    color: 'text-[#E63946] bg-red-50 border-red-200',
  },
  {
    slug: 'document-editing',
    title: 'Split-Screen Live Editor',
    subtitle: 'Reactive Preview with Missing Field Detection',
    description:
      'Side-by-side workspace flags missing father names, addresses, or photos with amber guides. Every keystroke synchronizes live with the CR80 card canvas.',
    icon: Edit3,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    slug: 'multilingual-printing',
    title: 'Multilingual Typography',
    subtitle: 'Unicode Regional Language Support for Indian Documents',
    description:
      'Renders crisp regional conjuncts in Devanagari (Hindi, Marathi) and other Indian scripts using Google Fonts Hind alongside standard Latin script.',
    icon: Globe,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    slug: 'document-printing',
    title: 'CR80 Physical Print Engine',
    subtitle: 'Zero-Margin Output for Epson & Canon PVC Card Trays',
    description:
      'Engineered to meet ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm). Eliminates margin drift and clipping across all desktop and thermal card printers.',
    icon: Printer,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    slug: 'document-management',
    title: 'Secure Document Vault',
    subtitle: 'Operator Record Archival with 100% Free Re-prints',
    description:
      'Encrypted digital storage of previously formatted documents. Operators can re-print, modify, or download PDF cards anytime without recurring deduction fees.',
    icon: Shield,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    slug: 'wallet-management',
    title: 'Prepaid Wallet & Ledger',
    subtitle: 'Transparent Per-Card Deductions with Instant UPI Recharge',
    description:
      'Zero monthly subscriptions. Top up your balance via UPI, monitor itemized transactions, and enjoy automated refunds on failed external lookups.',
    icon: Wallet,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
];

const faqs = [
  {
    question: 'Can I use Accero PrintPortal if an external lookup API is down?',
    answer:
      'Yes. Accero PrintPortal features an offline-capable manual entry mode for every supported document. Operators can fill in customer details, upload fresh photos, and print on the same standard CR80 canvas.',
  },
  {
    question: 'How does the split-screen studio prevent print errors?',
    answer:
      'The studio continuously scans for missing fields (such as missing father names or photo URLs) and highlights them with amber alert badges. Operators visually verify the card canvas in real time before triggering a print.',
  },
  {
    question: 'What printer trays are supported?',
    answer:
      'Our CSS @page print engine supports all 2-card and 4-card ID trays on Epson L805, L850, L8050, Canon G-series, as well as direct-to-card thermal printers (Zebra, Evolis).',
  },
];

export default function FeaturesOverviewPage() {
  const softwareSchema = generateSoftwareApplicationSchema('Accero PrintPortal Features');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
  ]);
  const faqSchema = generateFaqSchema(faqs);

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

      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Features</span>
          </nav>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-[#8B1E2D] border border-red-200">
              <Sparkles className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Full Platform Feature Suite</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight">
              Powerful Document Processing & Printing Features
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Engineered specifically for cyber cafes, CSC operators, and print shops to eliminate failed prints, missing fields, and printer tray alignment issues.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((feat) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={feat.slug}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center ${feat.color}`}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#1D3557]">{feat.title}</h2>
                      <span className="text-xs font-semibold text-slate-500 block mb-2">
                        {feat.subtitle}
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-6 border-t border-slate-100">
                    <Link
                      href={`/features/${feat.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B1E2D] hover:text-[#E63946] transition-colors"
                    >
                      <span>Explore {feat.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AEO FAQ Section */}
          <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#1D3557] flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-[#8B1E2D]" />
                <span>Frequently Asked Questions About Platform Features</span>
              </h2>
              <p className="text-xs text-slate-500">
                Direct answers to common questions about our technical capabilities and printer support.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <h3 className="text-sm font-bold text-[#1D3557] mb-1">{faq.question}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-[#1D3557] to-[#14233c] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Ready to Simplify Document Printing?</h3>
              <p className="text-sm text-slate-300 max-w-xl">
                Create an operator account today and start formatting ISO-compliant PVC cards with live split-screen precision.
              </p>
            </div>
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all shrink-0"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

