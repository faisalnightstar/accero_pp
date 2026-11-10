import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Printer,
  CheckCircle2,
  Layers,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  FileDown,
  Sparkles,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'CR80 PVC Card Print Engine | Accero PrintPortal',
  description:
    'Generate pixel-perfect ISO/IEC 7810 ID-1 standard PVC cards with zero margin drift. Optimized for Epson L805, Canon G-series, Zebra, and Evolis card printer trays.',
  path: '/features/document-printing',
  keywords: [
    'pvc card printing software',
    'cr80 card print engine',
    'epson l805 pvc card print software',
    'canon id card tray software',
    'zero margin print engine',
    '300 dpi id card printing',
    'iso 7810 card layout generator',
  ],
});

const faqs = [
  {
    question: 'How does Accero PrintPortal eliminate printer margin drift?',
    answer:
      'Standard web pages inject 5mm-15mm white margins when sent to print. Accero PrintPortal uses exact CSS `@page { size: 85.6mm 53.98mm; margin: 0; }` coordinates with high-density vector SVG scaling, ensuring 1:1 scale mapping directly into the physical pockets of your card tray.',
  },
  {
    question: 'Can I print both single-card and dual-card trays?',
    answer:
      'Yes. The print dialog supports standard 1-card, 2-card (Tray J on Epson), and 4-card batch formats. You can also export a 300+ DPI PDF for off-line batch processing.',
  },
  {
    question: 'What is the recommended resolution for card printing?',
    answer:
      'We output at 300+ DPI vector resolution. Text, fine borders, and QR codes remain crisp and sharp when printed on inkjet or direct-to-card thermal ribbon printers.',
  },
];

export default function DocumentPrintingFeaturePage() {
  const softwareSchema = generateSoftwareApplicationSchema('CR80 PVC Card Print Engine');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
    { name: 'Document Printing', url: '/features/document-printing' },
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
            <Link href="/features" className="hover:text-[#1D3557] transition-colors">
              Features
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Document Printing</span>
          </nav>

          {/* Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                <Printer className="w-3.5 h-3.5 text-purple-600" />
                <span>Zero Margin-Drift CSS @page Engine</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight leading-tight">
                ISO 7810 ID-1 Physical Card Print Engine
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Say goodbye to misaligned card tray prints, cut-off edges, and wasted PVC blanks. Designed for Epson L805, Canon G-series, Zebra, and Evolis printers.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all"
                >
                  Start Printing Now
                </Link>
                <Link
                  href="/blog/cr80-card-dimensions-guide"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-white text-[#1D3557] border border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  Read Dimensions Guide
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Hardware & Dimensions Specification
              </span>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Physical Dimensions</span>
                  <span className="text-xs font-mono font-bold text-emerald-600">85.60 × 53.98 mm</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Corner Radii</span>
                  <span className="text-xs font-mono font-bold text-slate-600">3.18 mm (ISO standard)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Output Resolution</span>
                  <span className="text-xs font-mono font-bold text-purple-600">300+ DPI Vector</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Supported Trays</span>
                  <span className="text-xs font-mono font-bold text-blue-600">Epson Tray J / Canon ID</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compatible Hardware Highlights */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557]">
              Universal Card Printer & Tray Compatibility
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Printer className="w-6 h-6 text-[#8B1E2D]" />
                <h3 className="text-base font-bold text-[#1D3557]">Epson Inkjet Series</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Optimized for Epson L805, L850, L8050, and L1800 equipped with standard 2-card PVC ID trays (Tray J).
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Printer className="w-6 h-6 text-indigo-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Canon G-Series ID Trays</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full compatibility with Canon Pixma G1010, G2010, G3010, and TS707 card tray feeders.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Printer className="w-6 h-6 text-purple-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Thermal Direct-to-Card</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instant print execution on Zebra ZC300, Evolis Zenius/Primacy, Magicard, and Fargo HDP series printers.
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
            <span className="font-bold text-slate-500 uppercase">Related Guides & Services:</span>
            <div className="flex flex-wrap gap-4">
              <Link href="/blog/pvc-card-printer-tray-guide" className="text-[#8B1E2D] hover:underline font-semibold">
                Printer Tray Setup Guide
              </Link>
              <Link href="/services/pan-card-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                PAN Card Print
              </Link>
              <Link href="/services/vehicle-rc-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                Vehicle RC Smart Card
              </Link>
              <Link href="/solutions/printing-shops" className="text-[#8B1E2D] hover:underline font-semibold">
                For Printing Shops
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

