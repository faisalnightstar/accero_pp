import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Printer,
  CheckCircle2,
  Layers,
  Cpu,
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
  title: 'PVC Card Software for Commercial Printing Shops | Accero PrintPortal',
  description:
    'Industrial-grade CR80 card formatting and print engine for commercial print shops. Calibrated for Zebra, Evolis, Magicard, Fargo, and multi-card inkjet trays.',
  path: '/solutions/printing-shops',
  keywords: [
    'printing shop management software',
    'commercial pvc card printing software',
    'id card printing business tools',
    'thermal card printer software',
    'zebra evolis card print software',
    'cr80 vector pdf export',
  ],
});

const faqs = [
  {
    question: 'Can commercial print shops export high-resolution vector PDFs?',
    answer:
      'Yes. Accero PrintPortal allows 1-click export of 300+ DPI vector PDF files formatted to exact ISO 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm). These can be imported directly into industrial card production software or sent straight to the printer driver.',
  },
  {
    question: 'How does the software handle front and back card sides?',
    answer:
      'Both front and back canvases are rendered side-by-side with exact registration marks. You can toggle single-pass or dual-sided printing modes depending on your machine setup.',
  },
  {
    question: 'Can we handle bulk document orders for corporate or local clients?',
    answer:
      'Yes. Our manual entry mode and rapid alphanumeric lookup allow operators to quickly process and queue multiple cards with transparent per-card ledger accounting.',
  },
];

export default function PrintingShopsSolutionPage() {
  const softwareSchema = generateSoftwareApplicationSchema('Print Shop Commercial Card Formatting Software');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Printing Shops', url: '/solutions/printing-shops' },
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
            <span className="text-[#8B1E2D]">Printing Shops</span>
          </nav>

          {/* Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                <Printer className="w-3.5 h-3.5 text-purple-700" />
                <span>Industrial Precision for Print Businesses</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight leading-tight">
                High-DPI PVC Card Software for Printing Shops
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Scale your ID card printing operations with 300+ DPI vector outputs, exact CR80 physical tray alignment, and split-screen validation calibrated for high-volume commercial shops.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all"
                >
                  Start Printing Now
                </Link>
                <Link
                  href="/features/document-printing"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-white text-[#1D3557] border border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  View Print Engine Specs
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Commercial Printer Compatibility
              </span>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Zebra ZC100 / ZC300</span>
                  <span className="text-xs font-bold text-emerald-600">Direct Thermal Output</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Evolis Zenius / Primacy</span>
                  <span className="text-xs font-bold text-blue-600">Dual-Sided Vector PDF</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Epson L805 / L850 / L8050</span>
                  <span className="text-xs font-bold text-purple-600">2-Card Tray Calibration</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Fargo & Magicard Series</span>
                  <span className="text-xs font-bold text-amber-600">Exact Millimeter Aspect</span>
                </div>
              </div>
            </div>
          </div>

          {/* Production Features */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557]">
              Commercial-Grade Production Advantages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <FileDown className="w-6 h-6 text-purple-600" />
                <h3 className="text-base font-bold text-[#1D3557]">300+ DPI Vector PDF Export</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Export vector-quality PDF and high-resolution PNG assets with embedded fonts and sharp barcodes, guaranteeing zero pixelation.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Layers className="w-6 h-6 text-blue-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Dual-Side Card Tray Alignment</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Both sides of the card are calibrated to identical horizontal and vertical coordinates, preventing duplex shift during physical printing.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Cpu className="w-6 h-6 text-emerald-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Smart Card IC Graphic Overlays</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Driving licence and vehicle RC layouts feature photorealistic microchip graphic positioning for standard contact smart cards.
                </p>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557] flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#8B1E2D]" />
              <span>Frequently Asked Questions for Print Shops</span>
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
              <Link href="/services/driving-licence-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                Driving Licence Smart Card
              </Link>
              <Link href="/services/vehicle-rc-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                Vehicle RC Smart Card
              </Link>
              <Link href="/blog/cr80-card-dimensions-guide" className="text-[#8B1E2D] hover:underline font-semibold">
                CR80 Dimensions Guide
              </Link>
              <Link href="/pricing" className="text-[#8B1E2D] hover:underline font-semibold">
                Pricing & Wallets
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

