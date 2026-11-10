import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  FileCheck,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Database,
  Cpu,
  Zap,
  Lock,
  Layers,
  Printer,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Document Processing Platform for Citizen IDs & PVC Cards | Accero',
  description:
    'The unified document processing platform engineered for Indian retail service centers. High-speed lookup, real-time split-screen missing field editing, multilingual rendering, and ISO/IEC 7810 ID-1 standard PVC card printing.',
  path: '/document-processing-platform',
  keywords: [
    'document processing platform',
    'document print portal',
    'online document processing software',
    'pvc document management system',
    'id card processing engine',
    'citizen document formatting tool',
  ],
});

const platformPillars = [
  {
    title: 'High-Throughput Verification Engine',
    desc: 'Integrates multi-provider verification lookups with automated failover and instant financial rollback on errors.',
    icon: Zap,
  },
  {
    title: 'Dual-Pane Interactive Studio',
    desc: 'Proprietary split-screen canvas flags missing demographic fields in amber and allows immediate manual editing and photo replacement.',
    icon: Cpu,
  },
  {
    title: 'Vector Printing & Tray Precision',
    desc: 'Hardware-calibrated CSS print engine conforming to ISO/IEC 7810 ID-1 (85.60 mm × 53.98 mm) for Epson Tray J and Canon trays.',
    icon: Printer,
  },
  {
    title: 'Encrypted Operator Vault & Storage',
    desc: 'All generated cards are stored securely with zero third-party data sharing, offering 100% free lifetime re-prints (₹0).',
    icon: Lock,
  },
];

const faqs = [
  {
    question: 'What is the Accero Document Processing Platform?',
    answer:
      'Accero Document Processing Platform is a comprehensive cloud software suite that enables retail service providers, cyber cafes, and CSC operators to ingest, verify, edit, and print official-standard citizen identity documents (PAN, Aadhaar, Voter ID, Driving Licence, Vehicle RC, and Ration Card) with complete hardware alignment and financial integrity.',
  },
  {
    question: 'How does the platform handle partial or incomplete citizen data?',
    answer:
      'Unlike legacy portals that fail or print corrupted cards when an API returns missing fields, Accero’s engine detects missing fields in real-time, displays them in an amber warning list, and allows the operator to supply the missing information directly into the live canvas before printing.',
  },
  {
    question: 'Is citizen data secure on the platform?',
    answer:
      'Yes. Accero PrintPortal complies with DPDP Act 2023 principles. All data is encrypted in transit and at rest. We never sell, monetize, or share customer demographic records with external advertisers or data brokers.',
  },
  {
    question: 'What is the pricing model for the Document Processing Platform?',
    answer:
      'The platform uses a transparent pay-as-you-print utility model. You recharge your wallet via UPI starting at ₹100. Manual drafts are ₹5, automated API lookups are ₹20–₹35, and subsequent re-prints are 100% Free Forever.',
  },
];

export default function DocumentProcessingPlatformPage() {
  const softwareSchema = generateSoftwareApplicationSchema('Document Processing Platform');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
    { name: 'Document Processing Platform', url: '/document-processing-platform' },
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
            <Link href="/features" className="hover:text-blue-600 transition-colors">
              Features
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Document Processing Platform</span>
          </nav>

          {/* Hero Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100 to-indigo-50 rounded-full blur-3xl -z-10 opacity-70"></div>
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase">
                <FileCheck className="w-3.5 h-3.5" />
                Enterprise Document Architecture
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Unified <span className="text-blue-600">Document Processing Platform</span> for Indian Retail Centers
              </h1>

              {/* AEO / GEO Definition Snippet Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border-l-4 border-blue-600 text-slate-700 text-base sm:text-lg leading-relaxed shadow-sm font-medium">
                <strong>Accero Document Processing Platform</strong> is a cloud SaaS platform designed to manage the end-to-end lifecycle of citizen document formatting and card printing. Built on Next.js 15 App Router, React 19, and Vercel Edge, it combines multi-provider verification lookups, amber missing-field detection, Devanagari typography, and ISO/IEC 7810 ID-1 standard physical card output.
              </div>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Modernize your retail counter operations. Eliminate disconnected desktop utilities, manual Photoshop templates, and unverified script portals with a single unified platform.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Free Platform Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/print-portal"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all"
                >
                  <span>Explore Print Portal Capabilities</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sub-100ms Serverless Edge</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>6 Document Pipelines</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>₹0 Lifetime Free Re-Prints</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>DPDP Act Data Privacy</span>
                </div>
              </div>
            </div>
          </section>

          {/* Architectural Pillars */}
          <section className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Architectural Pillars of the Accero Platform
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                How modern cloud engineering ensures reliability, speed, and accuracy for retail operators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {platformPillars.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
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
                Frequently Asked Questions About the Platform
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                In-depth technical answers on architecture, privacy, and workflows.
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
              Experience the Accero Platform Today
            </h2>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              No software downloads or driver installations required. Access everything from your browser.
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

          {/* Legal Compliance Disclaimer */}
          <footer className="text-center text-xs text-slate-500 max-w-3xl mx-auto pt-4 space-y-2">
            <p>
              <strong>Disclaimer:</strong> Accero PrintPortal is an independent commercial software platform designed for document layout formatting, editing, and physical card printing. It is not affiliated with, endorsed by, or an official service of any government body or department.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}

