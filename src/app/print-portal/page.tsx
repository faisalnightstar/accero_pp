import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Printer,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileCheck,
  CreditCard,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Print Portal – Online Document Processing & Card Printing | Accero',
  description:
    'Accero PrintPortal helps CSC operators, cyber cafes and retailers process, manage and print supported PAN, Aadhaar, Voter, DL, RC and other document formats.',
  path: '/print-portal',
  keywords: [
    'print portal',
    'online print portal',
    'digital print portal',
    'best print portal',
    'best print portal in india',
    'pan print portal',
    'voter print portal',
    'aadhaar print portal',
    'csc print portal',
    'document printing portal',
    'pvc card printing portal',
    'cyber cafe print software',
  ],
});

const comparisonData = [
  {
    feature: 'Missing Data Handling',
    legacy: 'Blindly prints cards with blank names or broken photos, wasting ₹25 plastic stock.',
    accero: 'Split-screen live editor flags missing fields in amber so you complete them before printing.',
  },
  {
    feature: 'Repeat Print Billing',
    legacy: 'Charges full wallet fee every time you click print or reprint for a returning customer.',
    accero: '100% Free Lifetime Re-Prints (₹0) from your secure encrypted document vault.',
  },
  {
    feature: 'Physical Tray Alignment',
    legacy: 'Arbitrary pixel layouts cause 2–4mm margin cutoffs on Epson and Canon trays.',
    accero: 'Pure ISO/IEC 7810 ID-1 standard (85.60 mm × 53.98 mm) with zero-margin CSS @page precision.',
  },
  {
    feature: 'Server Uptime & Speed',
    legacy: 'Frequent 502 Bad Gateway timeouts, database lockouts, and shared hosting crashes during morning rush hours.',
    accero: '99.9% platform availability on Vercel Edge with sub-100ms UI response (external department lookups subject to official portal speeds).',
  },
  {
    feature: 'Failed Lookup Policy',
    legacy: 'Balance is deducted; requires manual complaints on WhatsApp groups for refunds.',
    accero: 'Automated atomic ledger rollback: zero fee deducted (₹0) if an API query fails.',
  },
  {
    feature: 'Legal & Regulatory Posture',
    legacy: 'Deceptive government emblem mimicry and false partnership claims risk sudden shutdown.',
    accero: '100% transparent independent commercial software with full DPDP privacy protection.',
  },
];

const faqs = [
  {
    question: 'What is a Print Portal?',
    answer:
      'A print portal is a specialized web software platform used by cyber cafes, Common Service Centres (CSC), and printing shops in India to format, preview, and print identity cards and government documents (such as PAN, Aadhaar PVC, Voter ID, Driving Licence, and Vehicle RC) onto physical PVC card trays or photo paper.',
  },
  {
    question: 'How is Accero PrintPortal different from other print portals in India?',
    answer:
      'Unlike legacy PHP script portals that crash during peak hours or ruin cards when API data is incomplete, Accero PrintPortal provides a real-time split-screen editor that flags missing demographic fields in amber before printing. Additionally, Accero provides 100% free lifetime re-prints (₹0) for all saved documents and guarantees exact millimeter alignment (85.60 mm × 53.98 mm) for Epson Tray J and Canon ID trays.',
  },
  {
    question: 'Why are operators searching for alternatives to Digital Portal, Fast Print Portal, or Kamboj Pan Portal?',
    answer:
      'Many Indian cyber cafe and CSC operators search for alternatives to older platforms like Digital Portal, Fast Print Portal, and Kamboj Pan Portal due to common operational headaches: sudden 502 Bad Gateway server timeouts during peak morning hours, rigid upfront distributor fees (often ₹49 to ₹149), and double charges for re-printing lost cards. Furthermore, older portals often print cards blindly even when government API lookups return blank or missing fields, resulting in wasted ₹25 PVC plastic stock. Accero PrintPortal resolves these issues with a real-time missing data editor, 99.9% edge platform availability, atomic wallet rollbacks on failed lookups, and 100% free lifetime re-prints.',
  },
  {
    question: 'How much does it cost to use Accero PrintPortal?',
    answer:
      'Registration is 100% free with zero monthly subscriptions. You recharge your prepaid wallet starting at ₹100 via instant UPI QR code. Manual drafts are ₹5, automated card lookups range from ₹20 to ₹35, and all subsequent re-prints of saved cards are ₹0 Free Forever.',
  },
  {
    question: 'Which printers are compatible with Accero PrintPortal?',
    answer:
      'Accero PrintPortal supports all standard PVC card tray printers, including the Epson L805, L850, L8050 (using Tray J), Canon PIXMA G-series with ID card trays, as well as direct-to-card thermal PVC printers from Zebra and Evolis.',
  },
  {
    question: 'Is Accero PrintPortal an official government website?',
    answer:
      'No. Accero PrintPortal is an independent commercial software platform designed for document layout formatting, editing, and physical card printing. It is not affiliated with, endorsed by, or an official portal of UIDAI, NSDL, UTIITSL, the Election Commission of India, or any government ministry.',
  },
];

export default function PrintPortalPillarPage() {
  const softwareSchema = generateSoftwareApplicationSchema('Accero PrintPortal');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Print Portal', url: '/print-portal' },
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
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Print Portal</span>
          </nav>

          {/* Hero Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100 to-indigo-50 rounded-full blur-3xl -z-10 opacity-70"></div>
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Generation Document Printing Gateway
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Online <span className="text-blue-600">Print Portal</span> for CSC Operators, Cyber Cafes &amp; Retailers
              </h1>

              {/* AEO / GEO Definition Snippet Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border-l-4 border-blue-600 text-slate-700 text-base sm:text-lg leading-relaxed shadow-sm font-medium">
                <strong>Accero PrintPortal</strong> is an independent, high-performance document processing and printing platform engineered for cyber cafes, CSC operators, and print shops in India. It features a real-time split-screen editor that flags missing demographic data in amber, prevents ruined PVC cards, conforms to ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm), and provides 100% free lifetime re-prints.
              </div>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Stop losing money on 502 Bad Gateway timeouts, misaligned printer tray margins, and ruined plastic card stock. Accero gives your retail business an enterprise-grade document engine with zero monthly subscriptions.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/studio"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <Eye className="w-4 h-4" />
                  Try Live Split-Screen Studio
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  View Transparent Pricing
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
                >
                  <span>Register Free Operator Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ISO ID-1 Standard (85.6mm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>₹0 Lifetime Free Re-Prints</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Auto Rollback on Failed API</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant UPI QR Recharges</span>
                </div>
              </div>
            </div>
          </section>

          {/* The Competitor Contrast Table */}
          <section className="space-y-6">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Why Operators Are Switching from Legacy Print Portals
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                See how Accero PrintPortal eliminates the daily friction, ruined card stock, and arbitrary charges common in traditional script-based portals.
              </p>
            </div>

            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <th className="py-4 px-6 w-1/4">Key Capability</th>
                    <th className="py-4 px-6 w-3/8 text-rose-700">Typical Legacy Print Portals</th>
                    <th className="py-4 px-6 w-3/8 text-blue-700">Accero PrintPortal Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{row.feature}</td>
                      <td className="py-4 px-6 text-slate-600 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{row.legacy}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-900 font-medium flex items-start gap-2 bg-blue-50/30">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.accero}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Comparative Market Analysis & Alternative Evaluation */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
            <div className="max-w-4xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Industry Comparison
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Evaluating Print Portal Alternatives in India
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Cyber cafe operators and CSC VLEs across India frequently evaluate alternatives to traditional portals such as <strong>Digital Portal</strong>, <strong>Fast Print Portal</strong>, and <strong>Kamboj Pan Portal</strong>. While these platforms established early market awareness, operators often encounter critical bottlenecks during daily high-volume production.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Market Profile</span>
                  <h3 className="text-lg font-bold text-slate-900">Digital Portal Alternative</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Known for broad document coverage, but legacy script infrastructure experiences frequent 502 gateway timeouts and charges duplicate wallet fees on customer reprints.
                  </p>
                  <div className="pt-2 border-t border-slate-200 text-xs font-semibold text-blue-700">
                    Accero Advantage: 99.9% edge platform availability, zero ruined cards via split-screen validation, and 100% free lifetime reprints.
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <Link
                    href="/compare/digitalportal-alternative"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>Read Full Digital Portal Comparison</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Market Profile</span>
                  <h3 className="text-lg font-bold text-slate-900">Fast Print Portal Alternative</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Focuses on rapid lookup scripts, but lacks live pre-print data validation. When external APIs omit addresses or photos, cards print with blank spots, ruining ₹25 PVC blanks.
                  </p>
                  <div className="pt-2 border-t border-slate-200 text-xs font-semibold text-blue-700">
                    Accero Advantage: Real-time amber warning flags highlight missing fields so operators complete them before printing.
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <Link
                    href="/compare/fastprintportal-alternative"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>Read Full Fast Print Portal Comparison</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Market Profile</span>
                  <h3 className="text-lg font-bold text-slate-900">Kamboj Pan Portal Alternative</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Specialized in UTI and NSDL PAN card services with upfront registration fees (₹49–₹149), but requires separate disjointed portals for Aadhaar, Voter, DL, and RC cards.
                  </p>
                  <div className="pt-2 border-t border-slate-200 text-xs font-semibold text-blue-700">
                    Accero Advantage: Free registration (₹0), 6-in-1 unified document studio, and automatic barcode / QR code generation.
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <Link
                    href="/compare/kamboj-print-portal-alternative"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>Read Full Kamboj PAN Comparison</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <p className="italic">
                Note: Brand names and portal references are used strictly for comparative and informative purposes to assist operators in choosing suitable business software.
              </p>
              <Link
                href="/compare/skprintportal-alternative"
                className="font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1 shrink-0"
              >
                <span>Evaluating SK Print Portal? Compare Features</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </section>

          {/* 6 Supported Document Workflows */}
          <section className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Six Essential Document Workflows in One Portal
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Everything your cyber cafe or CSC center needs to format, edit, and print customer documents instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'PAN Card Print Format',
                  desc: 'Auto-fetches NSDL and UTI formats with high-contrast ITD emblem, photo, signature, and QR code.',
                  url: '/services/pan-card-management',
                  rate: '₹20 lookup / ₹5 manual',
                },
                {
                  title: 'Aadhaar PVC Card Format',
                  desc: 'Bilingual Devanagari layout conforming to official UID card standards with ghost photo and secure QR.',
                  url: '/services/aadhaar-document-processing',
                  rate: '₹25 lookup / ₹5 manual',
                },
                {
                  title: 'Voter ID (New EPIC) Format',
                  desc: 'Official 2024–2026 Election Commission standard card with assembly constituency, part number, and barcode.',
                  url: '/services/voter-id-card-management',
                  rate: '₹20 lookup / ₹5 manual',
                },
                {
                  title: 'Driving Licence Smart Card',
                  desc: 'State transport department smart card format with micro-chip vector graphic and vehicle category badges.',
                  url: '/services/driving-licence-management',
                  rate: '₹30 lookup / ₹5 manual',
                },
                {
                  title: 'Vehicle RC Smart Card',
                  desc: 'Vahan registration certificate with dual-side layout, owner specifications, chassis, and engine numbers.',
                  url: '/services/vehicle-rc-management',
                  rate: '₹35 lookup / ₹5 manual',
                },
                {
                  title: 'Ration Card (NFSA) Format',
                  desc: 'Family member tabular roster with food security entitlement details formatted for card printing or lamination.',
                  url: '/services/ration-card-printing',
                  rate: '₹25 lookup / ₹5 manual',
                },
              ].map((card, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                        {card.rate}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        ₹0 Re-Prints
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <Link
                      href={card.url}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <span>Explore Layout & Specifications</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Hardware & Printer Calibration Section */}
          <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-900/50 px-3 py-1 rounded-full border border-blue-700/50">
                Hardware Engineering
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Engineered for Epson Tray J & Canon ID Card Trays
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Most print portals fail because they send raw web pages to your printer. Accero PrintPortal uses exact CSS print specifications (ISO/IEC 7810 ID-1 standard: 85.60 mm × 53.98 mm) with zero margin drift.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                <Printer className="w-6 h-6 text-blue-400 mb-3" />
                <h4 className="font-bold text-white text-base">Epson L805 / L8050 / L850</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Pre-calibrated for Epson 2-card Tray J. Just set Paper Source to Tray J and click print without manual Photoshop cropping.
                </p>
              </div>

              <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                <SlidersHorizontal className="w-6 h-6 text-indigo-400 mb-3" />
                <h4 className="font-bold text-white text-base">Canon PIXMA G-Series</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Compatible with Canon MP, G3010, G5070 card trays. Direct 1:1 vector rendering eliminates blurry text and smudged QR codes.
                </p>
              </div>

              <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
                <h4 className="font-bold text-white text-base">Thermal PVC Card Printers</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Works seamlessly with Zebra ZXP, Evolis Zenius/Primacy, and Magicard direct-to-card dye sublimation printers.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/pvc-card-printing-software"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-300 hover:text-white transition-colors"
              >
                <span>Read Full Hardware & Printer Tray Setup Guide</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* People Also Ask / Answer Engine FAQ */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Answer Engine Optimization
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Frequently Asked Questions About Print Portals
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Clear, factual answers regarding print portal functionality, hardware setup, and operator economics.
              </p>
            </div>

            <div className="divide-y divide-slate-100 max-w-4xl mx-auto">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-5 space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed pl-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Upgrade Your Print Portal Experience?
            </h2>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Join thousands of Indian cyber cafe owners and CSC VLEs who have eliminated ruined card stock and daily server crashes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-md hover:bg-blue-50 transition-all"
              >
                Create Free Operator Account
              </Link>
              <Link
                href="/studio"
                className="px-8 py-4 rounded-xl bg-blue-800/80 hover:bg-blue-900 text-white font-bold text-sm border border-blue-400/40 transition-all"
              >
                Open Studio Demo
              </Link>
            </div>
          </section>

          {/* Mandatory Independent Legal Disclaimer */}
          <footer className="text-center text-xs text-slate-500 max-w-3xl mx-auto pt-4 space-y-2">
            <p>
              <strong>Important Compliance Notice:</strong> Accero PrintPortal is an independent commercial software platform developed for document formatting, layout preparation, and PVC card printing. It is not affiliated with, authorized by, or an official representative of the Government of India, UIDAI, NSDL, UTIITSL, Election Commission of India, or Ministry of Road Transport and Highways.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}

