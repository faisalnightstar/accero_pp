import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Monitor,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileText,
  Printer,
  Users,
  Award,
  Clock,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'CSC Operator Software – Digital Seva Kiosk Assistant | Accero PrintPortal',
  description:
    'The dedicated desktop web software for CSC operators and VLEs across India. Fast document formatting, real-time missing field detection, instant photo crop, and 100% free lifetime re-prints for citizens.',
  path: '/csc-operator-software',
  keywords: [
    'csc operator software',
    'csc software for pc',
    'digital seva operator software',
    'vle desktop utility',
    'csc id card printing tool',
    'common service center software',
  ],
});

const softwarePillars = [
  {
    title: 'Zero Installation & Driver Hassles',
    desc: 'Runs directly in your Chrome or Edge browser on Windows 7, 10, or 11. No complex drivers, .NET frameworks, or DLL patches required.',
    icon: Monitor,
  },
  {
    title: '6 Core Document Pipelines in One Tool',
    desc: 'Easily handle citizen requests for PAN card, Aadhaar PVC format, Voter ID (EPIC), Driving Licence, Vehicle RC, and NFSA Ration Card from a unified screen.',
    icon: FileText,
  },
  {
    title: 'Sub-60 Second Customer Turnaround',
    desc: 'Speed up your counter lines. Input an ID number, review the pre-filled card in the split-screen editor, make any quick adjustments, and print in under one minute.',
    icon: Clock,
  },
  {
    title: 'Complete Financial Traceability',
    desc: 'Prepaid utility balance with automated refunds on failed API lookups. Download official tax-compliant receipts for every card printed.',
    icon: ShieldCheck,
  },
];

const faqs = [
  {
    question: 'What is CSC Operator Software?',
    answer:
      'CSC Operator Software is auxiliary productivity and document formatting software used by Village Level Entrepreneurs (VLEs) at Common Service Centres (CSC) to process, format, preview, and print official-standard citizen documents (such as PVC identity cards, certificates, and forms) efficiently.',
  },
  {
    question: 'Does this software replace the official Digital Seva Portal?',
    answer:
      'No. Accero PrintPortal is an auxiliary desktop formatting tool designed to make physical PVC card printing faster and prevent wasted plastic card stock. It does not replace the official Digital Seva Portal or official government applications.',
  },
  {
    question: 'How does Accero prevent card printing errors for CSC operators?',
    answer:
      'When government APIs return partial or missing demographic data (such as omitted father names or low-resolution photo thumbnails), Accero’s split-screen studio flags these missing fields in amber. VLEs can manually input or correct the data and upload fresh photos before sending the job to print, ensuring zero wasted cards.',
  },
  {
    question: 'What are the system requirements to run Accero PrintPortal?',
    answer:
      'Any standard desktop PC or laptop with an internet connection and an updated web browser (Google Chrome, Microsoft Edge, or Mozilla Firefox). It is compatible with Windows 7, 8, 10, 11, macOS, and Linux.',
  },
];

export default function CscOperatorSoftwarePage() {
  const softwareSchema = generateSoftwareApplicationSchema('CSC Operator Software');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'CSC Operator Software', url: '/csc-operator-software' },
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
            <Link href="/solutions" className="hover:text-blue-600 transition-colors">
              Solutions
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">CSC Operator Software</span>
          </nav>

          {/* Hero Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-100 to-indigo-50 rounded-full blur-3xl -z-10 opacity-70"></div>
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold tracking-wide uppercase">
                <Monitor className="w-3.5 h-3.5" />
                VLE Productivity Suite
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                High-Performance <span className="text-teal-600">CSC Operator Software</span> for Citizen Services
              </h1>

              {/* AEO / GEO Definition Snippet Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border-l-4 border-teal-600 text-slate-700 text-base sm:text-lg leading-relaxed shadow-sm font-medium">
                <strong>Accero PrintPortal for CSC Operators</strong> is a specialized cloud utility that streamlines identity card formatting, missing data verification, and physical PVC card printing for Village Level Entrepreneurs. By providing split-screen live previews, 1:1 ISO/IEC 7810 ID-1 card layouts, and 100% free lifetime re-prints, VLEs speed up citizen document issuance while completely eliminating spoiled card stock.
              </div>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Run your CSC kiosk with the speed and reliability your community deserves. Never turn away a citizen because of a missing field or slow portal crash.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <Users className="w-4 h-4" />
                  <span>Start Free VLE Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/best-print-portal-for-csc"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all"
                >
                  <span>Compare CSC Portal Features</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Works in Any Browser</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sub-60 Second Printing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>₹0 Free Lifetime Re-Prints</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Automated Wallet Rollback</span>
                </div>
              </div>
            </div>
          </section>

          {/* Software Pillars Grid */}
          <section className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Four Pillars of the Accero VLE Software Engine
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Engineered from the ground up to handle high citizen footfall with maximum uptime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {softwarePillars.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{pillar.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{pillar.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Frequently Asked Questions About CSC Operator Software
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Clear answers regarding compatibility, compliance, and kiosk workflow setup.
              </p>
            </div>

            <div className="divide-y divide-slate-100 max-w-4xl mx-auto">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-5 space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed pl-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="bg-gradient-to-br from-teal-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Equip Your CSC Center With Accero PrintPortal Today
            </h2>
            <p className="text-teal-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Join thousands of VLEs across India who trust Accero for error-free document processing. Zero monthly subscriptions.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-white text-teal-700 font-extrabold text-sm shadow-md hover:bg-teal-50 transition-all"
              >
                Register Free Kiosk Account
              </Link>
              <Link
                href="/studio"
                className="px-8 py-4 rounded-xl bg-teal-800/80 hover:bg-teal-900 text-white font-bold text-sm border border-teal-400/40 transition-all"
              >
                Test Live Studio
              </Link>
            </div>
          </section>

          {/* Legal Compliance Disclaimer */}
          <footer className="text-center text-xs text-slate-500 max-w-3xl mx-auto pt-4 space-y-2">
            <p>
              <strong>Disclaimer:</strong> Accero PrintPortal is an independent commercial software platform designed for document layout formatting, editing, and physical card printing. It is not affiliated with, endorsed by, or an official service of CSC e-Governance Services India Ltd or any government authority.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}

