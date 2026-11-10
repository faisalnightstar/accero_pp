import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Laptop,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Printer,
  Sparkles,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'PVC Card Printing Software for Cyber Cafes | Accero PrintPortal',
  description:
    'Boost cyber cafe revenue with instant PVC card printing. Zero wasted cards, live missing field detection, instant photo upload, and compatibility with Epson and Canon card trays.',
  path: '/solutions/cyber-cafes',
  keywords: [
    'cyber cafe document printing software',
    'cyber cafe card printing solutions',
    'cyber cafe software india',
    'epson l805 cyber cafe printing',
    'how to print pvc cards in cyber cafe',
  ],
});

const faqs = [
  {
    question: 'How does Accero PrintPortal increase a cyber cafe’s profit margins?',
    answer:
      'Cyber cafes often lose ₹15 to ₹30 per ruined card when an external API omits father names or photos, forcing operators to throw away blank cards. Accero PrintPortal flags missing fields live on screen so you can fix them before printing, plus gives you 100% free lifetime re-prints for returning customers.',
  },
  {
    question: 'Can I print cards using my existing Epson or Canon printer?',
    answer:
      'Yes. If your shop has an Epson L805, L850, L8050, or Canon G-series printer with an ID card tray, our zero-margin CSS print engine lines up cards with 1:1 physical accuracy.',
  },
  {
    question: 'What is the setup time for new cyber cafes?',
    answer:
      'Zero installation or driver compilation is needed. Accero PrintPortal is 100% web-based. Simply create an account, recharge your wallet via UPI, and start printing immediately.',
  },
];

export default function CyberCafesSolutionPage() {
  const softwareSchema = generateSoftwareApplicationSchema('Cyber Cafe Document Printing Platform');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Cyber Cafes', url: '/solutions/cyber-cafes' },
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
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/solutions" className="hover:text-[#1D3557] transition-colors">
              Solutions
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Cyber Cafes</span>
          </nav>

          {/* Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-[#8B1E2D] border border-red-200">
                <Laptop className="w-3.5 h-3.5 text-[#E63946]" />
                <span>Engineered for Retail Cyber Cafe Counters</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight leading-tight">
                High-Margin PVC Card Printing for Cyber Cafes
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Turn walk-in visitors into high-margin PVC card orders. Eliminate blank card waste, fix incomplete customer records on the fly, and deliver official ISO CR80 cards in under 3 minutes.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all"
                >
                  Start Printing at Your Cafe
                </Link>
                <Link
                  href="/features/document-editing"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-white text-[#1D3557] border border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  See Split-Screen Editor
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cyber Cafe Profitability Snapshot
              </span>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Average Retail Card Charge</span>
                  <span className="text-xs font-bold text-slate-900">₹60 – ₹100</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Portal Verification Fee</span>
                  <span className="text-xs font-bold text-[#8B1E2D]">₹5 – ₹25</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">PVC Blank + Ink Cost</span>
                  <span className="text-xs font-bold text-slate-700">~₹10 – ₹12</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Net Profit per Card</span>
                  <span className="text-xs font-bold text-emerald-700">₹40 – ₹65 (Over 200% ROI)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Common Problems Solved */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557]">
              The Top 3 Headaches Accero Solves for Cyber Cafes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-[#8B1E2D] font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h3 className="text-base font-bold text-[#1D3557]">Missing Father Name or DOB</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  External government APIs frequently return partial demographic strings. Our studio flags missing data in amber, letting you type in the customer's details live before pressing print.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h3 className="text-base font-bold text-[#1D3557]">Printer Margin Drift</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Browser print dialogs often inject unwanted margins, causing cards to clip on PVC trays. Our CSS @page layout locks exact 85.60 mm × 53.98 mm dimensions.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h3 className="text-base font-bold text-[#1D3557]">Paying Twice for Lost Cards</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When a customer comes back asking for a duplicate print, other portals charge you full fees again. Accero PrintPortal provides 100% free lifetime re-prints (₹0).
                </p>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557] flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#8B1E2D]" />
              <span>Frequently Asked Questions for Cyber Cafes</span>
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
            <span className="font-bold text-slate-500 uppercase">Explore Services:</span>
            <div className="flex flex-wrap gap-4">
              <Link href="/services/pan-card-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                PAN Card Print
              </Link>
              <Link href="/services/aadhaar-document-management" className="text-[#8B1E2D] hover:underline font-semibold">
                Aadhaar PVC Card
              </Link>
              <Link href="/services/voter-id-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                Voter ID Print
              </Link>
              <Link href="/solutions/csc-operators" className="text-[#8B1E2D] hover:underline font-semibold">
                For CSC Operators
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

