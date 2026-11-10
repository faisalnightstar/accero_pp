import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  CreditCard,
  CheckCircle,
  FileCheck,
  Printer,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Edit3,
  HelpCircle,
  Check,
  Search,
  Globe,
  Wallet,
  AlertTriangle,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { generateSoftwareApplicationSchema, generateFaqSchema } from '@/lib/seo/structuredData';
import PageTracker from '@/components/analytics/PageTracker';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';

export const metadata: Metadata = buildPageMetadata({
  title: 'Accero PrintPortal – Document Processing & Printing Software',
  description:
    'Simplify document processing and printing with Accero PrintPortal. Manage document lookups, multilingual layouts, editing and print-ready workflows from one platform.',
  path: '/',
  keywords: [
    'document printing software',
    'pvc card printing software',
    'cyber cafe document management software',
    'csc operator software',
    'pan card printing software',
    'voter id printing software',
    'driving licence printing software',
    'vehicle rc printing software',
    'ration card printing software',
    'cr80 card format',
  ],
});

const serviceCards = [
  {
    id: 'pan',
    slug: 'pan-card-printing',
    title: 'PAN Card',
    tag: 'NSDL / UTI Format',
    description: 'Instant PAN format with photo, signature, father name, and verifiable demographic QR code.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    iconColor: 'from-[#8B1E2D] to-[#E63946]',
    fee: '₹20 / Verified Lookup',
  },
  {
    id: 'aadhaar',
    slug: 'aadhaar-document-management',
    title: 'Aadhaar PVC Card',
    tag: 'Standard Card Layout',
    description: 'Bilingual regional typography, secure QR code embedding, and ghost image alignment.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    iconColor: 'from-amber-600 to-amber-700',
    fee: '₹25 / Verified Lookup',
  },
  {
    id: 'voter',
    slug: 'voter-id-printing',
    title: 'Voter ID (EPIC)',
    tag: 'National Electoral Standard',
    description: 'High-resolution EPIC card format with assembly constituency, polling part, and barcode block.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    iconColor: 'from-[#1D3557] to-[#457B9D]',
    fee: '₹20 / Verified Lookup',
  },
  {
    id: 'dl',
    slug: 'driving-licence-printing',
    title: 'Driving Licence (DL)',
    tag: 'Smart Card Chip Layout',
    description: 'Full transport department layout including vehicle class badges (MCWG, LMV) and validity tracking.',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    iconColor: 'from-indigo-600 to-indigo-700',
    fee: '₹30 / Verified Lookup',
  },
  {
    id: 'rc',
    slug: 'vehicle-rc-printing',
    title: 'Vehicle RC',
    tag: 'Vahan Smart Card Layout',
    description: 'Vehicle registration smart card template with chassis, engine, and owner specifications.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    iconColor: 'from-purple-600 to-purple-700',
    fee: '₹35 / Verified Lookup',
  },
  {
    id: 'ration',
    slug: 'ration-card-management',
    title: 'Ration Card',
    tag: 'NFSA Food Security Layout',
    description: 'Bilingual family ration card format with FPS code, member count, and CR80 card tray support.',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    iconColor: 'from-teal-600 to-teal-700',
    fee: '₹25 / Verified Lookup',
  },
];

const homeFaqs = [
  {
    question: 'What is Accero PrintPortal?',
    answer:
      'Accero PrintPortal is an independent document processing and printing platform designed for cyber cafes, CSC operators, and printing businesses. It provides document lookup, editing, multilingual layouts, and printing workflows through a centralized web platform.',
  },
  {
    question: 'Which document services does Accero PrintPortal support?',
    answer:
      'Accero PrintPortal supports PAN, Aadhaar, Voter ID, Driving Licence, Vehicle Registration Certificate (RC), and Ration Card workflows, subject to the availability of the corresponding integrations and features.',
  },
  {
    question: 'Is Accero PrintPortal an official government website?',
    answer:
      'No. Accero PrintPortal is an independent commercial software platform. It is not an official government portal, nor is it an NSDL, UTIITSL, UIDAI, ECI, or RTO partner. Users must use authorized sources and comply with applicable government requirements when processing identity-related information.',
  },
  {
    question: 'What are the exact physical dimensions of printed cards?',
    answer:
      'All cards are formatted to the international ISO/IEC 7810 ID-1 standard dimensions: exactly 85.60 mm × 53.98 mm (standard CR80 credit card size) with 3.18 mm corner radii for 1:1 fit in physical PVC card printer trays.',
  },
  {
    question: 'Are re-prints charged from the user wallet?',
    answer:
      'No. Once a document has been verified or drafted and saved to your operator account, all subsequent re-views, edits, and PDF re-downloads are 100% free of charge (₹0).',
  },
];

export default function HomePage() {
  const softwareSchema = generateSoftwareApplicationSchema(
    'Accero PrintPortal',
    'BusinessApplication',
    [
      'ISO/IEC 7810 ID-1 Standard PVC Card Formatting',
      'Instant Alphanumeric ID Lookup with Silent Multi-Provider Cascade',
      'Split-Screen Live Editor with Amber Missing Field Detection',
      'Bilingual Regional Language Typography Support',
      'Zero-Margin CSS @page Print Engine for Epson and Canon Card Trays',
      'Prepaid Wallet Accounting with Instant Transparent Billing',
    ]
  );
  const faqSchema = generateFaqSchema(homeFaqs);

  return (
    <>
      <PageTracker event={ANALYTICS_EVENTS.HOMEPAGE_VISIT} metadata={{ pagePath: '/' }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="space-y-16 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#F0F4F8] pt-12 pb-20 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#8B1E2D] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#E63946]" />
                <span>Next-Gen Document Processing & Printing SaaS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1D3557] tracking-tight leading-tight">
                Pixel-Perfect PVC Cards with{' '}
                <span className="bg-gradient-to-r from-[#8B1E2D] via-[#E63946] to-[#457B9D] bg-clip-text text-transparent">
                  Zero Missing Data
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed">
                Simplify document processing and printing with Accero PrintPortal. Manage document lookups, multilingual layouts, editing, and print-ready workflows for cyber cafes, CSC operators, and printing businesses.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-[#8B1E2D] to-[#E63946] rounded-xl shadow-lg hover:shadow-btn-hover transition-all transform hover:-translate-y-0.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/features"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium text-[#1D3557] bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <span>Explore Features</span>
                </Link>
              </div>

              {/* Feature Highlights */}
              <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>85.60 mm × 53.98 mm ISO CR80</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Live Missing Field Detection</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant High-DPI PDF & Print</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>API Lookup & Manual Modes</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-[#1D3557]">Supported Document Workflows</h2>
            <p className="mt-2 text-slate-600 text-sm">
              Standard preformatted layouts conforming strictly to ISO/IEC 7810 ID-1 dimensions for seamless card tray printing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.iconColor} text-white flex items-center justify-center shadow-md`}
                    >
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${card.badgeColor}`}
                    >
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#1D3557] group-hover:text-[#8B1E2D] transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {card.fee}
                  </span>
                  <Link
                    href={`/services/${card.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8B1E2D] hover:text-[#E63946] group-hover:translate-x-1 transition-all"
                  >
                    <span>View Specifications</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Overview Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#F4D35E]">
                Platform Capabilities
              </span>
              <h2 className="text-3xl font-black">Engineered for High-Volume Document Operators</h2>
              <p className="text-sm text-slate-300">
                Eliminate failed print runs, misaligned card trays, and unreadable fonts with our purpose-built toolset.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <Search className="w-8 h-8 text-[#F4D35E]" />
                <h3 className="text-lg font-bold">Document Lookup & Manual Entry</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fast alphanumeric document verification with automated silent failover, plus complete manual entry mode for offline processing.
                </p>
                <Link
                  href="/features/document-lookup"
                  aria-label="Learn more about document lookup and manual entry"
                  className="text-xs font-bold text-[#F4D35E] hover:underline inline-flex items-center gap-1 pt-2"
                >
                  <span>Explore document lookup</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <Edit3 className="w-8 h-8 text-emerald-400" />
                <h3 className="text-lg font-bold">Split-Screen Live Editing</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Interactive side-by-side editor flags missing fields with amber indicators so you can complete father names, DOB, or portraits before printing.
                </p>
                <Link
                  href="/features/document-editing"
                  aria-label="Learn more about split-screen live editing"
                  className="text-xs font-bold text-emerald-400 hover:underline inline-flex items-center gap-1 pt-2"
                >
                  <span>Explore live editing</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <Globe className="w-8 h-8 text-blue-400" />
                <h3 className="text-lg font-bold">Multilingual Typography</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Full Devanagari script support via Google Fonts Hind, rendering crisp conjuncts and regional language strings on card canvases.
                </p>
                <Link
                  href="/features/multilingual-printing"
                  aria-label="Learn more about multilingual typography"
                  className="text-xs font-bold text-blue-400 hover:underline inline-flex items-center gap-1 pt-2"
                >
                  <span>Explore multilingual printing</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#1D3557] font-bold text-sm hover:bg-slate-100 transition-colors shadow"
              >
                <span>View All 6 Core Features</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-card">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-[#1D3557]">How Split-Screen Studio Works</h2>
              <p className="mt-2 text-slate-600 text-sm">
                Stop throwing away blank cards due to missing API data. Follow 3 simple steps:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-[#8B1E2D] font-bold flex items-center justify-center text-lg">
                  1
                </div>
                <h3 className="text-lg font-bold text-[#1D3557]">Enter ID Number or Manual Data</h3>
                <p className="text-sm text-slate-600">
                  Provide the card number to auto-fetch demographic records, or switch directly to manual entry mode.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-lg">
                  2
                </div>
                <h3 className="text-lg font-bold text-[#1D3557]">Edit Missing Fields Live</h3>
                <p className="text-sm text-slate-600">
                  Any field missing from the initial query is flagged with amber guides. Update text or upload photos, and watch the card canvas synchronize in real time.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#457B9D] font-bold flex items-center justify-center text-lg">
                  3
                </div>
                <h3 className="text-lg font-bold text-[#1D3557]">Print or Download Vector PDF</h3>
                <p className="text-sm text-slate-600">
                  Execute direct browser print with exact 0-margin CSS print coordinates or download a print-ready vector PDF for your card printer tray.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Anchor Section */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8B1E2D]">
                Transparent Utility Billing
              </span>
              <h2 className="text-3xl font-black text-[#1D3557]">Pay-As-You-Print Operator Pricing</h2>
              <p className="text-sm text-slate-600">
                Zero monthly subscriptions. Prepaid wallet ledger with instant UPI recharge and 100% free lifetime re-prints.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1D3557]">Manual Draft & Format</h3>
                  <div className="mt-4 mb-2">
                    <span className="text-3xl font-extrabold text-[#1D3557]">₹5</span>
                    <span className="text-xs text-slate-500"> / card generated</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    For operators drafting cards manually with self-provided customer records and photos.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Full CR80 Canvas Access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Unlimited Free Re-prints (₹0)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>High-DPI PDF Export</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="mt-6 text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#1D3557] transition-colors"
                >
                  Start with Manual Mode
                </Link>
              </div>

              <div className="bg-white rounded-2xl p-6 border-2 border-[#8B1E2D] shadow-md flex flex-col justify-between relative">
                <span className="absolute -top-3 right-6 bg-[#8B1E2D] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Most Popular
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#1D3557]">Instant Alphanumeric Lookup</h3>
                  <div className="mt-4 mb-2">
                    <span className="text-3xl font-extrabold text-[#8B1E2D]">₹20 – ₹35</span>
                    <span className="text-xs text-slate-500"> / verified lookup</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Automated data fetching across PAN, Aadhaar, Voter, DL, RC, and Ration records.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Auto-Fetch Demographic Data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Live Missing Field Detection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Zero Fee on Failed Lookups</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="mt-6 text-center py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#8B1E2D] to-[#E63946] shadow transition-all hover:shadow-btn-hover"
                >
                  Create Operator Account
                </Link>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1D3557]">Enterprise / High Volume</h3>
                  <div className="mt-4 mb-2">
                    <span className="text-3xl font-extrabold text-[#1D3557]">Custom</span>
                    <span className="text-xs text-slate-500"> / high-volume hubs</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Tailored solutions for regional chains, multi-counter digital service centers, and distributors.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Dedicated API Quotas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Priority Support & SLA</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Custom Sub-Operator Accounts</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/contact"
                  className="mt-6 text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#1D3557] transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Homepage AEO FAQ Section */}
        <section id="faq" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold text-[#1D3557] flex items-center justify-center gap-2">
              <HelpCircle className="w-7 h-7 text-[#8B1E2D]" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-sm text-slate-600">
              Clear, direct answers regarding Accero PrintPortal, card printer compatibility, and platform policies.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {homeFaqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2"
              >
                <h3 className="text-base font-bold text-[#1D3557] flex items-start gap-2">
                  <span className="text-[#8B1E2D] font-mono">Q:</span>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed pl-6">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Regulatory & Compliance Notice */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Compliance Notice:</strong> Accero PrintPortal is an independent commercial software platform. It is not an official government portal, nor is it an NSDL, UTIITSL, UIDAI, ECI, or RTO partner. The platform acts strictly as a digital layout formatting and printing utility for operators. Users are solely responsible for verifying the authenticity and lawful authorization of all data processed.
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
