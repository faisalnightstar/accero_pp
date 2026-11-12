import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  Award,
  Wallet,
  Eye,
  FileCheck,
  CreditCard,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'DocPrint Alternative | Compare Accero PrintPortal & DocPrint Shop',
  description:
    'Looking for an alternative to DocPrint Shop (docprint.shop)? Compare Accero PrintPortal: live split-screen missing data alerts, ₹0 lifetime reprints, atomic wallet rollback, and ISO PVC card printing.',
  path: '/compare/docprint-alternative',
  keywords: [
    'docprint alternative',
    'docprint shop alternative',
    'docprint.shop alternative',
    'alternative to docprint',
    'docprint print portal',
    'best print portal for cyber cafe',
    'pvc card printing software',
  ],
});

const comparisonTable = [
  {
    feature: 'Registration Fee & Onboarding',
    competitor: 'Basic web portal registration with unverified tier requirements',
    accero: '100% Free Instant Operator Signup (₹0) with immediate mobile OTP verification',
    advantage: 'Accero',
  },
  {
    feature: 'Missing-Field Detection',
    competitor: 'None (static previews output whatever upstream scrapers return)',
    accero: 'Real-time amber warning badges in live split-screen studio flagging missing fields',
    advantage: 'Accero',
  },
  {
    feature: 'Card Stock Protection',
    competitor: 'Blind printing on blank plastic; incomplete data ruins ₹25 PVC cards',
    accero: 'Zero Ruined Cards Guarantee: preview and edit missing fields before printing',
    advantage: 'Accero',
  },
  {
    feature: 'PVC Tray Alignment & Precision',
    competitor: 'Arbitrary browser margins causing 2–4mm cutoff on tray edges',
    accero: 'Exact ISO/IEC 7810 ID-1 standard (85.60 mm × 53.98 mm) zero-margin CSS',
    advantage: 'Accero',
  },
  {
    feature: 'Customer Reprint Policy',
    competitor: 'Full wallet deduction charged for every repeat customer print',
    accero: '100% Free Lifetime Re-Prints (₹0) from encrypted operator Document Vault',
    advantage: 'Accero',
  },
  {
    feature: 'Wallet Transaction Safety',
    competitor: 'Balance deducted on failed queries; manual WhatsApp dispute handling',
    accero: 'Atomic database transactions with automated rollback on lookup timeout',
    advantage: 'Accero',
  },
  {
    feature: 'Document Suite Coverage',
    competitor: 'Aadhaar, Voter, DL, PAN No. Find, and RC (Webapiking scrapers)',
    accero: '6-in-1 Complete Studio: PAN, Aadhaar PVC, Voter ID, DL, RC, Ayushman & Ration Cards',
    advantage: 'Accero',
  },
  {
    feature: 'High-Density Vector QR Codes',
    competitor: 'Raster bitmap QR codes prone to blurring on inkjet and thermal PVC printers',
    accero: 'Dynamic high-density vector QR code rendering with embedded demographic metadata',
    advantage: 'Accero',
  },
  {
    feature: 'Platform Architecture & Uptime',
    competitor: 'Single shared PHP server vulnerable to morning peak-hour slowdowns',
    accero: 'Next.js 15.5 App Router on globally distributed Vercel Edge network',
    advantage: 'Accero',
  },
  {
    feature: 'Data Security & DPDP Compliance',
    competitor: 'Unverified database storage without documented encryption standards',
    accero: 'AES-256 GCM encryption at rest, role-based access control, DPDP Act compliance',
    advantage: 'Accero',
  },
  {
    feature: 'Wallet Top-Up Flow',
    competitor: 'Manual UTR submission or standard third-party gateways',
    accero: 'Automated instant UPI dynamic QR code with real-time balance credit',
    advantage: 'Accero',
  },
  {
    feature: 'Customer Support Desk',
    competitor: 'Informal personal WhatsApp chat with no ticket tracking',
    accero: 'Dedicated help desk, ticketing system, knowledge base & priority WhatsApp support',
    advantage: 'Accero',
  },
];

const faqs = [
  {
    question: 'Why are cyber cafes switching from DocPrint Shop to Accero PrintPortal?',
    answer:
      'Retail printing shops and Jan Seva Kendras frequently encounter two major issues with clone portals like DocPrint Shop (docprint.shop): server timeouts during morning business rush hours and paying repeat wallet charges whenever a returning customer needs a replacement card. Accero PrintPortal resolves these pain points with 99.9% edge platform availability, real-time missing-data validation, and 100% free lifetime re-prints (₹0) from an encrypted operator vault.',
  },
  {
    question: 'Does Accero charge again if an old customer requests a reprint?',
    answer:
      'No. Every document processed in Accero PrintPortal is securely encrypted and archived in your Document Vault. If a customer damages, washes, or misplaces their card, you can reprint it anytime for ₹0 wallet deduction, retaining 100% of your retail walk-in fee as pure profit.',
  },
  {
    question: 'How does Accero prevent spoiled PVC cards compared to DocPrint?',
    answer:
      'In traditional portals like DocPrint, cards are formatted from raw upstream responses. If an upstream scraper omits a father name, address, or house number, the card prints incomplete—ruining a ₹25 blank PVC card. Accero’s live split-screen editor inspects all demographic fields in real time and highlights missing values with amber warning badges, allowing you to edit and complete the details before sending the job to the printer tray.',
  },
  {
    question: 'Can I print cards on an Epson L8050 or L805 Tray J using Accero?',
    answer:
      'Yes. Accero PrintPortal is calibrated specifically for Epson 2-card Tray J (Epson L805, L850, L8050) and Canon ID card trays. All cards output to exact ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm) using zero-margin CSS (@page { margin: 0; }), eliminating white border clipping common in legacy portals.',
  },
  {
    question: 'Is Accero PrintPortal affiliated with DocPrint Shop (docprint.shop)?',
    answer:
      'No. Accero PrintPortal is an independent commercial document processing platform developed by Accero Technologies. It has no affiliation, partnership, or connection with DocPrint Shop (docprint.shop). All brand names and trademarks are referenced under nominative fair use for comparative and informative purposes only.',
  },
  {
    question: 'Can I transfer my balance from DocPrint to Accero PrintPortal?',
    answer:
      'No. Because DocPrint and Accero are entirely independent platforms, balances and credentials cannot be migrated. However, Accero has zero registration fees (₹0) and allows you to test the platform with a minimal ₹50 or ₹100 trial recharge with zero commitment.',
  },
];

export default function DocPrintAlternativePage() {
  const softwareSchema = generateSoftwareApplicationSchema(
    'Accero PrintPortal - DocPrint Shop Alternative'
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Print Portal', url: '/print-portal' },
    { name: 'DocPrint Alternative', url: '/compare/docprint-alternative' },
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
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/print-portal" className="hover:text-blue-600 transition-colors">
              Print Portal
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">DocPrint Alternative</span>
          </nav>

          {/* Hero Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100 to-indigo-50 rounded-full blur-3xl -z-10 opacity-70"></div>
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Platform vs Legacy Web Scripts</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Looking for an Alternative to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  DocPrint Shop
                </span>
                ?
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Tired of server slowdowns, unhandled timeouts, and paying duplicate fees for reprints?
                Switch to <strong>Accero PrintPortal</strong>—India&apos;s most advanced document printing
                platform with instant self-serve registration, real-time split-screen missing data alerts,
                and 100% free lifetime reprints.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <span>Start Free Operator Trial (₹0)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors"
                >
                  <Wallet className="w-4 h-4 text-slate-600" />
                  <span>View Transparent Pricing</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Real-World Context Notice */}
          <section className="bg-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-200 text-slate-900 space-y-3">
            <div className="flex items-start gap-3">
              <Layers className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h2 className="text-base font-bold text-slate-900">
                  Independent Comparison Notice (DocPrint docprint.shop)
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  As observed during our live November 2026 technical probe, <code>docprint.shop</code> operates
                  as a commercial document printing portal targeting Jan Seva Kendras and cyber cafes with a
                  4-step wizard. Accero PrintPortal provides a completely independent, modern Next.js 15.5 cloud
                  solution with real-time missing-data validation and zero-margin ISO tray formatting.
                </p>
              </div>
            </div>
          </section>

          {/* Comprehensive Comparison Table */}
          <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                DocPrint Shop vs Accero PrintPortal: Feature Comparison
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Detailed side-by-side comparison based on live network probes and verified application features.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="py-4 px-4 font-bold text-slate-900 w-1/4">Key Capability</th>
                    <th className="py-4 px-4 font-bold text-slate-600 w-1/3">DocPrint Shop (docprint.shop)</th>
                    <th className="py-4 px-4 font-bold text-blue-700 w-5/12 bg-blue-50/50">
                      Accero PrintPortal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-800 align-top">
                        {row.feature}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 align-top leading-relaxed">
                        {row.competitor}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 bg-blue-50/30 align-top leading-relaxed">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>{row.accero}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Core Advantages Grid */}
          <section className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Built to Protect Operator Profits and Card Stock
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Three architectural advantages that give Accero operators higher margins and zero wasted cards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Zero Ruined Card Guarantee</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Never spoil a ₹25 blank PVC card due to incomplete demographic data. Our live split-screen
                  canvas highlights missing fields with amber badges, allowing you to edit and correct before printing.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Printer className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Exact Epson Tray J Alignment</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Zero margin CSS calibrated to ISO/IEC 7810 ID-1 standards (85.60 mm × 53.98 mm) ensures your
                  cards print perfectly on Epson L805/L8050 and Canon 2-card trays without 2–4mm cutoff errors.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">₹0 Free Lifetime Reprints</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every card is archived in your encrypted Document Vault. If a customer damages or misplaces their
                  card, reprint it instantly for ₹0 wallet deduction and keep 100% of your customer fee.
                </p>
              </div>
            </div>
          </section>

          {/* Frequently Asked Questions */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Frequently Asked Questions: DocPrint Alternative
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Everything you need to know about switching your shop to Accero PrintPortal.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">{faq.question}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="bg-blue-600 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                Experience Professional PVC Card Printing Today
              </h2>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
                Join thousands of CSC VLEs, cyber cafe operators, and document service centers printing
                pixel-perfect PVC cards with zero missing data and zero wasted cards.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-sm shadow-lg transition-colors"
              >
                Start Free Operator Trial
              </Link>
              <Link
                href="/features/document-printing"
                className="px-8 py-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm transition-colors border border-blue-500"
              >
                View Printing Workflows
              </Link>
            </div>
          </section>

          {/* Legal Fair Use Disclaimer */}
          <footer className="text-center text-xs text-slate-400 space-y-2 py-4">
            <p>
              <strong>Disclaimer:</strong> DocPrint and docprint.shop are trademarks and trade names of their respective
              owners. Accero PrintPortal is an independent commercial platform developed by Accero Technologies
              and has no connection, sponsorship, or corporate affiliation with DocPrint Shop.
              All comparative analysis is provided for operator education and technical transparency under nominative fair use.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
