import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Users,
  CheckCircle2,
  ShieldCheck,
  Building,
  ArrowRight,
  HelpCircle,
  FileCheck,
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
  title: 'Document Printing Software for CSC Operators | Accero PrintPortal',
  description:
    'Tailored document formatting and PVC card printing software for Common Service Center (CSC) VLEs and Jan Seva Kendras across India. Low cost, instant UPI recharge, and reliable tray alignment.',
  path: '/solutions/csc-operators',
  keywords: [
    'csc operator software',
    'csc vle card printing portal',
    'jan seva kendra pvc card print',
    'digital seva card formatting software',
    'csc document printing utility',
    'vle id card printing tool',
  ],
});

const faqs = [
  {
    question: 'Is Accero PrintPortal an official CSC SPV portal?',
    answer:
      'No. Accero PrintPortal is an independent commercial software platform. It is not owned or operated by CSC e-Governance Services India Limited. It functions strictly as an operator productivity utility to format and print cards on standard physical printer trays.',
  },
  {
    question: 'How do CSC VLEs benefit from Accero PrintPortal?',
    answer:
      'VLEs often face long queues of citizens needing physical PVC card prints. Our portal streamlines the entire process: quick alphanumeric lookup, automatic formatting on standard CR80 templates, instant Devanagari Hindi text support, and 1-click printing on your local Epson or Canon printer.',
  },
  {
    question: 'Can I print Ration Cards and Voter ID cards for rural citizens?',
    answer:
      'Yes. Accero PrintPortal features specialized templates for both Voter ID (EPIC) and National Food Security (NFSA) Ration Cards with full family member roster tables.',
  },
];

export default function CscOperatorsSolutionPage() {
  const softwareSchema = generateSoftwareApplicationSchema('CSC Operator Document Printing Utility');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'CSC Operators', url: '/solutions/csc-operators' },
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
            <span className="text-[#8B1E2D]">CSC Operators</span>
          </nav>

          {/* Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                <span>Productivity Suite for VLEs & Jan Seva Kendras</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight leading-tight">
                Document Formatting & PVC Printing for CSC Operators
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Deliver fast, reliable, and professional PVC card printing services to citizens in your panchayat or town. Support for all standard citizen identity documents on ISO CR80 card blanks.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all"
                >
                  Join as CSC Operator
                </Link>
                <Link
                  href="/services/ration-card-management"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-white text-[#1D3557] border border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  Explore Ration Card Layout
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Essential VLE Document Workflows
              </span>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Voter EPIC Cards</span>
                  <span className="text-xs font-bold text-blue-600">Assembly & Part No.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Family Ration Cards</span>
                  <span className="text-xs font-bold text-teal-600">NFSA Roster Table</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">PAN & Aadhaar Layouts</span>
                  <span className="text-xs font-bold text-emerald-600">Bilingual Hindi</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Driving Licences</span>
                  <span className="text-xs font-bold text-purple-600">Vehicle Classes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Advantages */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557]">
              Engineered for Grassroots Service Delivery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Building className="w-6 h-6 text-amber-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Bilingual Devanagari Hindi</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Accurately print citizen names, father names, and village addresses in clear Devanagari script using embedded Google Fonts Hind.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Printer className="w-6 h-6 text-[#8B1E2D]" />
                <h3 className="text-base font-bold text-[#1D3557]">Zero Margin Inkjet Tray Printing</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Print directly on low-cost Epson L805 or Canon G-series PVC card trays without expensive dedicated thermal card printers.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Prepaid Wallet via UPI</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Top up your operator wallet instantly with Google Pay, PhonePe, or Paytm UPI with a minimum recharge of just ₹100.
                </p>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557] flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#8B1E2D]" />
              <span>Frequently Asked Questions for CSC Operators</span>
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
              <Link href="/services/voter-id-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                Voter ID Print
              </Link>
              <Link href="/services/ration-card-management" className="text-[#8B1E2D] hover:underline font-semibold">
                Ration Card Print
              </Link>
              <Link href="/features/multilingual-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                Multilingual Printing
              </Link>
              <Link href="/pricing" className="text-[#8B1E2D] hover:underline font-semibold">
                Pricing Details
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

