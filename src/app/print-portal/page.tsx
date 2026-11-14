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
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { FAQSection } from '@/components/public/FAQSection';
import { CTASection } from '@/components/public/CTASection';

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
    legacy: 'Blindly prints cards with blank names or broken photos, wasting expensive plastic stock.',
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
    accero: '99.9% platform availability on Vercel Edge with sub-100ms UI response times.',
  },
  {
    feature: 'Failed Lookup Policy',
    legacy: 'Balance is deducted; requires manual complaints on WhatsApp groups for refunds.',
    accero: 'Automatic atomic refund to your wallet balance within milliseconds on failed lookups.',
  },
  {
    feature: 'Monthly Commitments',
    legacy: 'Forces monthly subscription plans or expiry of unused wallet balances.',
    accero: 'Zero monthly fees; prepaid wallet balance never expires.',
  },
];

const faqs = [
  {
    question: 'What is a Print Portal?',
    answer:
      'A print portal is a web-based document processing platform that enables Common Service Center (CSC) operators, cyber cafe owners, and printing shops to retrieve, verify, format, and print official-standard cards (such as PAN, Aadhaar, Voter ID, Driving Licence, and Vehicle RC) onto physical PVC plastic card stock.',
  },
  {
    question: 'How does Accero PrintPortal prevent ruined PVC card stock?',
    answer:
      'Accero features a reactive split-screen studio that automatically inspects demographic records returned by external registries. If a critical field (such as father name, candidate photo, or address) is missing, the interface flags it with an amber alert and provides an instant inline input so you can complete the data before sending it to the printer tray.',
  },
  {
    question: 'Are card re-prints charged from my prepaid wallet?',
    answer:
      'No! Once a document has been verified or drafted and saved to your operator vault, subsequent views, edits, and PDF/PNG re-prints are 100% free of charge (₹0).',
  },
  {
    question: 'Which printers are compatible with Accero PrintPortal?',
    answer:
      'Accero PrintPortal supports all standard PVC card tray printers, including the Epson L805, L850, L8050, L1800 (using Tray J), Canon PIXMA G-series with ID card trays, as well as thermal card printers.',
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

      <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Print Portal</span>
          </nav>

          {/* Hero Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200/90 shadow-sm relative overflow-hidden text-left">
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[#1D3557] text-xs font-bold border border-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-[#8B1E2D]" />
                <span>Next-Generation Document Printing Gateway</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight leading-tight">
                Online <span className="text-[#8B1E2D]">Print Portal</span> for CSC Operators, Cyber Cafes &amp; Retailers
              </h1>

              {/* AEO / GEO Definition Snippet Box */}
              <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-slate-50/90 border border-slate-200/90 shadow-xs">
                <div className="w-1.5 self-stretch bg-[#1D3557] rounded-full shrink-0" />
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
                  <strong className="text-[#1D3557]">Accero PrintPortal</strong> is an independent, high-performance document processing and printing platform engineered for cyber cafes, CSC operators, and print shops in India. It features a real-time split-screen editor that flags missing demographic data in amber, prevents ruined PVC cards, conforms to ISO/IEC 7810 ID-1 standard dimensions (85.60 mm &times; 53.98 mm), and provides 100% free lifetime re-prints.
                </p>
              </div>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Stop losing money on 502 Bad Gateway timeouts, misaligned printer tray margins, and ruined plastic card stock. Accero gives your retail business an enterprise-grade document engine with zero monthly subscriptions.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  href="/studio"
                  variant="primary"
                  size="md"
                  icon={<Eye className="w-4 h-4" />}
                >
                  Try Split-Screen Studio
                </Button>
                <Button
                  href="/pricing"
                  variant="outline"
                  size="md"
                  icon={<CreditCard className="w-4 h-4" />}
                >
                  View Pricing
                </Button>
                <Button
                  href="/register"
                  variant="accent"
                  size="md"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Register Free
                </Button>
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
                  <span>Amber Missing Field Guides</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Atomic Auto-Refund on Fail</span>
                </div>
              </div>
            </div>
          </section>

          {/* Supported Document Pipelines & Card Services Grid */}
          <section className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
                Supported Document Pipelines
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557]">
                Official-Standard Document Print Portals
              </h2>
              <p className="text-sm text-slate-600">
                Explore specialized printing engines engineered for CSC operators, cyber cafes, and digital service centers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <Link
                href="/services/pan-card-printing"
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#1D3557] hover:shadow-md transition-all space-y-2 block"
              >
                <div className="font-bold text-sm text-[#1D3557] flex items-center justify-between">
                  <span>PAN Card Printing</span>
                  <ArrowRight className="w-4 h-4 text-[#8B1E2D]" />
                </div>
                <p className="text-slate-600 leading-relaxed">
                  NSDL &amp; UTI standard layouts with live missing father name indicator and instant photo cropping.
                </p>
              </Link>

              <Link
                href="/services/aadhaar-document-management"
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#1D3557] hover:shadow-md transition-all space-y-2 block"
              >
                <div className="font-bold text-sm text-[#1D3557] flex items-center justify-between">
                  <span>Aadhaar PVC Format</span>
                  <ArrowRight className="w-4 h-4 text-[#8B1E2D]" />
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Bilingual Devanagari smart card layouts with QR verification and ISO ID-1 tray alignment.
                </p>
              </Link>

              <Link
                href="/services/voter-id-printing"
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#1D3557] hover:shadow-md transition-all space-y-2 block"
              >
                <div className="font-bold text-sm text-[#1D3557] flex items-center justify-between">
                  <span>Voter ID (EPIC) Print</span>
                  <ArrowRight className="w-4 h-4 text-[#8B1E2D]" />
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Election Commission standard EPIC layouts with assembly constituency and polling station mapping.
                </p>
              </Link>

              <Link
                href="/services/driving-licence-printing"
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#1D3557] hover:shadow-md transition-all space-y-2 block"
              >
                <div className="font-bold text-sm text-[#1D3557] flex items-center justify-between">
                  <span>Driving Licence (DL)</span>
                  <ArrowRight className="w-4 h-4 text-[#8B1E2D]" />
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Sarithi-compatible transport layouts with vehicle class badges and organ donor indicators.
                </p>
              </Link>

              <Link
                href="/services/vehicle-rc-printing"
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#1D3557] hover:shadow-md transition-all space-y-2 block"
              >
                <div className="font-bold text-sm text-[#1D3557] flex items-center justify-between">
                  <span>Vehicle RC Smart Card</span>
                  <ArrowRight className="w-4 h-4 text-[#8B1E2D]" />
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Vahan standard vehicle registration certificates mapping chassis, engine, and fuel specs.
                </p>
              </Link>

              <Link
                href="/services/ration-card-printing"
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all space-y-2 block"
              >
                <div className="font-bold text-sm text-emerald-800 flex items-center justify-between">
                  <span>Ration Card Printing</span>
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-slate-600 leading-relaxed">
                  NFSA standard layouts with family member tables and multi-page continuation for large households.
                </p>
              </Link>

              <Link
                href="/services/farmer-id-printing"
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all space-y-2 block"
              >
                <div className="font-bold text-sm text-emerald-800 flex items-center justify-between">
                  <span>Farmer ID (AgriStack)</span>
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Farmer Registry smart card layouts with Khata, Khasra, and area land parcel tables.
                </p>
              </Link>

              <Link
                href="/best-print-portal-for-csc"
                className="p-5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md transition-all space-y-2 block"
              >
                <div className="font-bold text-sm text-amber-400 flex items-center justify-between">
                  <span>CSC Operator Hub</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Discover why thousands of VLEs rely on Accero for zero wasted PVC cards and ₹0 lifetime reprints.
                </p>
              </Link>
            </div>
          </section>

          {/* Accero vs Legacy Print Portals Comparison Table */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
                Side-by-Side Analysis
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557]">
                Why Operators Are Switching to Accero
              </h2>
              <p className="text-sm text-slate-600">
                Compare how Accero solves the critical daily frustrations that plague legacy print portals.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 w-1/4">Operational Capability</th>
                    <th className="py-3 px-4 w-3/8 text-rose-700">Legacy Print Portals</th>
                    <th className="py-3 px-4 w-3/8 text-emerald-800 bg-emerald-50/50 rounded-t-xl font-bold">
                      Accero PrintPortal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 font-bold text-[#1D3557]">{row.feature}</td>
                      <td className="py-4 px-4 text-slate-500 leading-relaxed">{row.legacy}</td>
                      <td className="py-4 px-4 font-medium text-slate-800 bg-emerald-50/30 leading-relaxed">
                        {row.accero}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ Section */}
          <FAQSection faqs={faqs} />

          {/* Compliance Disclaimer */}
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 leading-relaxed flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Compliance Notice:</strong> Accero PrintPortal is an independent commercial software platform. It is not an official government portal, and is not affiliated with UIDAI, NSDL, UTIITSL, the Election Commission of India, MoRTH, or State Food Departments. Output templates conform to the international physical card standard ISO/IEC 7810 ID-1.
            </div>
          </div>

          {/* CTA */}
          <CTASection
            title="Ready to Upgrade Your Print Portal Experience?"
            description="Create your free operator account in 30 seconds. Zero subscription fees, instant UPI recharge, and lifetime free re-prints."
          />
        </div>
      </div>
    </>
  );
}
