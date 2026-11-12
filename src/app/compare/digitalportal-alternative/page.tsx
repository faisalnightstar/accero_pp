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
  title: 'Digital Portal Alternative in India | Compare Accero PrintPortal',
  description:
    "Looking for an alternative to Digital Portal? Compare Accero PrintPortal's document processing, PAN, Voter, Aadhaar and PVC card workflows, pricing and operator features.",
  path: '/compare/digitalportal-alternative',
  keywords: [
    'digitalportal alternative',
    'digital portal alternative',
    'digitalprintportal alternative',
    'digitalportal.in alternative',
    'digital portal vs Accero',
    'alternative to Digital Portal',
    'best digital print portal in india',
  ],
});

const comparisonTable = [
  {
    feature: 'Registration Fee',
    competitor: 'Free registration behind closed operator login panel',
    accero: '100% Free Instant Operator Signup (₹0)',
    advantage: 'Accero',
  },
  {
    feature: 'PAN Workflow',
    competitor: 'Basic alphanumeric lookup script',
    accero: 'Automated NSDL/UTI lookup + ₹5 manual drafting with QR generation',
    advantage: 'Accero',
  },
  {
    feature: 'Aadhaar Workflow',
    competitor: 'Manual layout formatting script',
    accero: 'Bilingual Devanagari card formatting with secure QR & photo placement',
    advantage: 'Accero',
  },
  {
    feature: 'Voter Workflow',
    competitor: 'State-dependent EPIC lookup',
    accero: 'Standard 2024–2026 Election Commission EPIC card layout with barcode',
    advantage: 'Accero',
  },
  {
    feature: 'DL & RC Workflow',
    competitor: 'Limited availability / state portal redirects',
    accero: 'Native dual-side smart card templates for Parivahan DL and Vehicle RC',
    advantage: 'Accero',
  },
  {
    feature: 'Ration Card Workflow',
    competitor: 'Not publicly disclosed',
    accero: 'NFSA food security tabular card layout with family member roster',
    advantage: 'Accero',
  },
  {
    feature: 'Missing-Field Detection',
    competitor: 'None (prints incomplete cards when upstream APIs omit fields)',
    accero: 'Real-time amber warning flags in live split-screen studio',
    advantage: 'Accero',
  },
  {
    feature: 'Pre-Print Data Editing',
    competitor: 'Rigid static preview; requires external graphics software to patch errors',
    accero: 'Live editable fields directly in split-screen canvas before printing',
    advantage: 'Accero',
  },
  {
    feature: 'PVC Printing Tray Output',
    competitor: 'Arbitrary pixel styling causing 2–4mm margin cutoffs',
    accero: 'Exact ISO/IEC 7810 ID-1 standard (85.60 mm × 53.98 mm) zero-margin CSS',
    advantage: 'Accero',
  },
  {
    feature: 'Reprint Policy',
    competitor: 'Full wallet deduction charged for every reprint',
    accero: '100% Free Lifetime Re-Prints (₹0) from encrypted operator vault',
    advantage: 'Accero',
  },
  {
    feature: 'Server Uptime & Architecture',
    competitor: 'Shared PHP Apache hosting with peak-hour 502 Bad Gateway timeouts',
    accero: 'Next.js 15 App Router deployed on globally distributed Vercel Edge network',
    advantage: 'Accero',
  },
  {
    feature: 'Wallet Transaction Safety',
    competitor: 'Balance deducted on failed queries; manual WhatsApp dispute handling',
    accero: 'Atomic database transactions with automated rollback on lookup timeout',
    advantage: 'Accero',
  },
  {
    feature: 'Wallet Top-Up Flow',
    competitor: 'Manual UTR submission or third-party payment gateways',
    accero: 'Automated instant UPI dynamic QR code with real-time balance credit',
    advantage: 'Accero',
  },
  {
    feature: 'Customer Support',
    competitor: 'Informal WhatsApp messaging groups without ticket tracking',
    accero: 'Formal support desk, ticket tracker, knowledge base & priority WhatsApp',
    advantage: 'Accero',
  },
];

const faqs = [
  {
    question: 'Why are operators switching from Digital Portal to Accero PrintPortal?',
    answer:
      'Indian cyber cafe operators and CSC VLEs frequently report two main operational bottlenecks on Digital Portal: frequent server 502 Bad Gateway crashes during peak morning hours (9 AM–12 PM) and recurring wallet charges whenever a returning customer needs a reprint. Accero PrintPortal solves these issues with 99.9% edge platform availability, a real-time missing data editor, and 100% free lifetime re-prints (₹0) for all previously printed documents.',
  },
  {
    question: 'Does Accero charge again if a customer needs a reprint of their card?',
    answer:
      'No. Once you generate or verify a card in Accero PrintPortal, the encrypted document is saved in your Document History vault. If the customer damages or misplaces their card, you pay ₹0 to Accero and can re-print it instantly, retaining 100% of your customer fee as pure profit.',
  },
  {
    question: 'Can I print cards on an Epson L805 Tray J using Accero?',
    answer:
      'Yes. Accero PrintPortal is calibrated specifically for Epson 2-card Tray J (Epson L805, L850, L8050) and Canon ID card trays. All cards output to exact ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm) using zero-margin CSS (@page { margin: 0; }), eliminating the white border clipping common in legacy portals.',
  },
  {
    question: 'Is Accero PrintPortal affiliated with Digital Portal (digitalportal.in)?',
    answer:
      'No. Accero PrintPortal is an independent commercial document processing platform developed by Accero Technologies. It is not affiliated with, endorsed by, or connected to Digital Portal (digitalportal.in). All brand names and trademarks are referenced under nominative fair use for comparative and informative purposes only.',
  },
];

export default function DigitalPortalAlternativePage() {
  const softwareSchema = generateSoftwareApplicationSchema('Accero PrintPortal - Digital Portal Alternative');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Print Portal', url: '/print-portal' },
    { name: 'Digital Portal Alternative', url: '/compare/digitalportal-alternative' },
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
            <span className="text-slate-900 font-bold">Digital Portal Alternative</span>
          </nav>

          {/* Hero Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100 to-indigo-50 rounded-full blur-3xl -z-10 opacity-70"></div>
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Comprehensive Platform Comparison
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Looking for an Alternative to <span className="text-blue-600">Digital Portal</span>?
              </h1>

              <div className="p-5 rounded-2xl bg-slate-50 border-l-4 border-blue-600 text-slate-700 text-base leading-relaxed shadow-sm font-medium">
                <strong>Accero PrintPortal</strong> provides Indian cyber cafe operators, CSC VLEs, and printing shops with an enterprise-grade document printing gateway. Engineered on Next.js 15 and deployed on Vercel’s global Edge network, it solves the recurring server timeouts, wasted PVC plastic, and double-billing common in legacy portals like Digital Portal.
              </div>

              <p className="text-slate-600 text-base leading-relaxed">
                If your daily retail printing workflow is interrupted by 502 Bad Gateway errors, arbitrary tray margins, or paying full lookup fees every time a customer asks for a reprint, explore why operators across India are switching to Accero.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <span>Create Free Operator Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/studio"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Try Live Studio Demo
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>99.9% Edge Uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>₹0 Lifetime Re-Prints</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Auto Rollback on Timeout</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ISO ID-1 Tray Calibrated</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section A: Comparison Summary */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Platform Overview &amp; Intended Audience
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-slate-600">
              <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="text-base font-bold text-slate-900">Digital Portal Overview</h3>
                <p>
                  <strong>Digital Portal (digitalportal.in)</strong> is a widely recognized legacy portal in the Indian CSC operator community. It provides basic web scripts to generate printable layouts for PAN, Aadhaar, and Voter cards.
                </p>
                <p>
                  <strong>Key Limitations:</strong> Built on traditional shared PHP script hosting, it frequently experiences gateway timeouts during morning peak hours (9 AM–12 PM). It lacks pre-print missing field detection and charges recurring wallet fees every time an operator reprints an existing customer card.
                </p>
              </div>

              <div className="space-y-3 p-6 rounded-2xl bg-blue-50/50 border border-blue-200">
                <h3 className="text-base font-bold text-blue-900">Accero PrintPortal Overview</h3>
                <p>
                  <strong>Accero PrintPortal (printportal.accero.app)</strong> is a next-generation document processing and card tray printing platform built with Next.js 15 and deployed on Vercel Edge.
                </p>
                <p>
                  <strong>Key Advantages:</strong> Designed specifically for high-volume retail operators, Accero features an interactive split-screen editor that flags missing demographic fields in amber before printing, provides 100% free lifetime re-prints (₹0), and guarantees automated wallet rollbacks on failed API queries.
                </p>
              </div>
            </div>
          </section>

          {/* Section B: Comprehensive Feature Comparison Table */}
          <section className="space-y-6">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Detailed Feature-by-Feature Comparison
              </h2>
              <p className="text-slate-600 text-sm">
                A verified breakdown of operational differences between Digital Portal and Accero PrintPortal.
              </p>
            </div>

            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <th className="py-4 px-6 w-1/4">Feature / Capability</th>
                    <th className="py-4 px-6 w-3/8 text-slate-700">Digital Portal (digitalportal.in)</th>
                    <th className="py-4 px-6 w-3/8 text-blue-700">Accero PrintPortal Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {comparisonTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{row.feature}</td>
                      <td className="py-4 px-6 text-slate-600">{row.competitor}</td>
                      <td className="py-4 px-6 text-slate-900 font-medium bg-blue-50/30 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.accero}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section C: Methodology Statement */}
            <div className="p-4 rounded-xl bg-slate-100 text-xs text-slate-500 leading-relaxed">
              <strong>Methodology &amp; Verification Notice:</strong> Competitor information was reviewed using publicly accessible pages, operator feedback, and technical testing. Pricing, features, and platform availability may change over time. Last verified: November 13, 2026.
            </div>
          </section>

          {/* Section D: Original Accero Evidence */}
          <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-950 px-3 py-1 rounded-full border border-blue-800">
                Product Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                How Accero Eliminates Operator Headaches
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Accero PrintPortal replaces blind print scripts with an intelligent operator studio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                <h3 className="font-bold text-white text-base">Live Amber Missing Data Alerts</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When government APIs return incomplete addresses or missing fathers’ names, Accero flags the field in amber, allowing operators to complete it before committing to PVC plastic.
                </p>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
                <Award className="w-6 h-6 text-emerald-400" />
                <h3 className="font-bold text-white text-base">₹0 Lifetime Re-Print Vault</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every card printed is encrypted and stored in your account. You can re-open, adjust, and re-print it unlimited times for ₹0, keeping 100% of the customer reprint fee.
                </p>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
                <Printer className="w-6 h-6 text-blue-400" />
                <h3 className="font-bold text-white text-base">Exact ISO 7810 ID-1 Geometry</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Calibrated to 85.60 mm × 53.98 mm with zero-margin CSS (@page &#123; margin: 0; &#125;) for seamless 1:1 fitting into Epson Tray J and Canon ID card trays.
                </p>
              </div>
            </div>
          </section>

          {/* Section E: Switching Guide */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                How to Switch from Digital Portal to Accero in 7 Easy Steps
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Migrating your daily printing operations takes less than 2 minutes with zero upfront software purchase fees.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  title: 'Create Operator Account',
                  desc: 'Sign up in 30 seconds at printportal.accero.app with your mobile number and email.',
                },
                {
                  step: '02',
                  title: 'Recharge Wallet via UPI',
                  desc: 'Top up starting at ₹100 using instant dynamic UPI QR code with zero convenience fees.',
                },
                {
                  step: '03',
                  title: 'Select Document Service',
                  desc: 'Choose from PAN, Aadhaar PVC, Voter ID (EPIC), Driving Licence, Vehicle RC, or Ration Card.',
                },
                {
                  step: '04',
                  title: 'Execute Lookup or Draft',
                  desc: 'Enter the document number for instant lookup, or use ₹5 manual draft mode.',
                },
                {
                  step: '05',
                  title: 'Review Split-Screen Studio',
                  desc: 'Inspect both card sides in real time. Any incomplete field is flagged in amber.',
                },
                {
                  step: '06',
                  title: 'Print with 1-Click Zero Margin',
                  desc: 'Send directly to your Epson Tray J or Canon tray, or export 300+ DPI vector PDF.',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                    Step {item.step}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
              <strong>Transparent Migration Note:</strong> External card histories cannot be directly imported from Digital Portal due to proprietary encryption. However, all new documents you generate on Accero are saved permanently in your private vault with unlimited ₹0 free reprints.
            </div>
          </section>

          {/* Section F: Frequently Asked Questions */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-600 text-sm">
                Common questions from operators migrating from Digital Portal to Accero PrintPortal.
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-6 space-y-2">
                  <h3 className="text-base font-bold text-slate-900 flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-sm text-slate-600 pl-7 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready for a Reliable Print Portal?
            </h2>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Eliminate daily 502 server crashes, ruined PVC cards, and double-billing. Switch to Accero PrintPortal today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-md hover:bg-blue-50 transition-all"
              >
                Create Free Operator Account
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 rounded-xl bg-blue-800/80 hover:bg-blue-900 text-white font-bold text-sm border border-blue-400/40 transition-all"
              >
                View Transparent Pricing
              </Link>
            </div>
          </section>

          {/* Legal Safeguard Notice */}
          <footer className="text-center text-xs text-slate-500 max-w-3xl mx-auto pt-4 space-y-2">
            <p>
              <strong>Important Compliance Notice:</strong> Accero PrintPortal is an independent commercial B2B document formatting and physical card printing software platform developed by Accero Technologies. It is not affiliated with, endorsed by, or sponsored by Digital Portal (digitalportal.in), UIDAI, NSDL, UTIITSL, or the Election Commission of India. Brand names and domain references are used solely under nominative fair use for truthful comparative purposes.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}

