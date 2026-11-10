import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  HelpCircle,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Software for Digital Service Centers | Accero PrintPortal',
  description:
    'Complete document processing and card formatting platform for multi-counter digital service centers, citizen helpdesks, and Jan Seva Kendras.',
  path: '/solutions/digital-service-centers',
  keywords: [
    'digital service center software',
    'citizen service kiosk card printing',
    'jan seva kendra software',
    'maha e seva kendra document print',
    'multi counter card printing portal',
  ],
});

const faqs = [
  {
    question: 'How does Accero PrintPortal support multi-counter digital service centers?',
    answer:
      'Digital service centers handle high citizen volume across diverse document types. Accero PrintPortal brings all 6 major Indian document workflows into one unified interface, allowing counter operators to handle lookups, photo cropping, and printouts in under 3 minutes.',
  },
  {
    question: 'Can managers monitor operator usage and balance deductions?',
    answer:
      'Yes. Our transparent wallet ledger records every transaction, card type, reference number, and timestamp, giving business owners complete audit control over counter operations.',
  },
  {
    question: 'Is customer privacy protected across shared terminal desks?',
    answer:
      'Yes. Card data is strictly sandboxed. Once printed, cards can be saved to your encrypted operator vault or cleared from the active screen, preventing data leakage across customer visits.',
  },
];

export default function DigitalServiceCentersSolutionPage() {
  const softwareSchema = generateSoftwareApplicationSchema('Digital Service Center Management Platform');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Digital Service Centers', url: '/solutions/digital-service-centers' },
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
            <span className="text-[#8B1E2D]">Digital Service Centers</span>
          </nav>

          {/* Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                <span>Multi-Counter Citizen Assistance Infrastructure</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight leading-tight">
                Streamlined Document Workflows for Digital Service Centers
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Empower your front-desk operators with unified document lookups, bilingual layouts, and error-free PVC card printing. Serve citizens faster with zero downtime.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all"
                >
                  Create Center Account
                </Link>
                <Link
                  href="/services"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-white text-[#1D3557] border border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  View Supported Documents
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Center Operational Benefits
              </span>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Turnaround Time</span>
                  <span className="text-xs font-bold text-emerald-600">Under 3 Minutes / Citizen</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Supported Services</span>
                  <span className="text-xs font-bold text-blue-600">6 Major Indian Documents</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Accounting Control</span>
                  <span className="text-xs font-bold text-purple-600">Itemized Audit Ledger</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Operator Onboarding</span>
                  <span className="text-xs font-bold text-amber-600">Zero Technical Training Needed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advantages */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557]">
              Built for Fast Citizen Service Delivery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Zap className="w-6 h-6 text-blue-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Single Unified Portal</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No more switching between separate, fragmented portals. Handle PAN, Aadhaar, Voter, DL, RC, and Ration Card printing from one screen.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Zero Missing-Field Failures</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Amber indicators alert operators to incomplete data before printing, eliminating customer complaints and wasted physical card inventory.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Centralized Wallet Accounting</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Top up once and let multiple counter operators draw from the central prepaid balance with real-time transaction logging.
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
            <span className="font-bold text-slate-500 uppercase">Related Navigation:</span>
            <div className="flex flex-wrap gap-4">
              <Link href="/solutions/csc-operators" className="text-[#8B1E2D] hover:underline font-semibold">
                For CSC Operators
              </Link>
              <Link href="/features/wallet-management" className="text-[#8B1E2D] hover:underline font-semibold">
                Wallet Ledger
              </Link>
              <Link href="/pricing" className="text-[#8B1E2D] hover:underline font-semibold">
                Pricing Overview
              </Link>
              <Link href="/about" className="text-[#8B1E2D] hover:underline font-semibold">
                About Accero
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

