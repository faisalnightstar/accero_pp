import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Shield,
  CheckCircle2,
  Lock,
  Archive,
  ArrowRight,
  HelpCircle,
  FileCheck,
  History,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Secure Document Vault & Records Management | Accero PrintPortal',
  description:
    'Secure encrypted archival of previously generated cards. Unlimited 100% free re-printing (₹0), instant PDF re-downloads, and search filters for busy cyber cafes.',
  path: '/features/document-management',
  keywords: [
    'document management software',
    'secure document vault',
    'cyber cafe document records',
    'free card re-print software',
    'id card record keeping',
    'operator document archive',
  ],
});

const faqs = [
  {
    question: 'Are re-prints charged from my operator balance?',
    answer:
      'No. Once a document has been generated or drafted and stored in your operator account, all subsequent views, edits, and PDF/PNG re-prints are 100% free of charge (₹0).',
  },
  {
    question: 'How is customer identity data secured in the vault?',
    answer:
      'Document records are stored with encryption-at-rest in an isolated MongoDB database. Access is strictly authenticated via cryptographically signed JWT session cookies.',
  },
  {
    question: 'Can I search previous records by customer name or card number?',
    answer:
      'Yes. The operator dashboard provides instant alphanumeric search across document IDs, customer names, and date ranges.',
  },
];

export default function DocumentManagementFeaturePage() {
  const softwareSchema = generateSoftwareApplicationSchema('Secure Document Vault');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
    { name: 'Document Management', url: '/features/document-management' },
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
            <span className="text-[#8B1E2D]">Document Management</span>
          </nav>

          {/* Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                <Archive className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Free Lifetime Re-Printing</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight leading-tight">
                Secure Document Records Management for Busy Operators
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Never recharge twice for the same customer card. Our secure records vault stores previously generated layouts for instant 1-click re-prints and PDF re-downloads.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/security"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-white text-[#1D3557] border border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  Review Security Architecture
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Operator Vault Benefits
              </span>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Subsequent Re-Prints</span>
                  <span className="text-xs font-mono font-bold text-emerald-600">₹0 (Free Forever)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Encrypted Record Storage</span>
                  <span className="text-xs font-mono font-bold text-slate-600">AES-256 / SHA-256</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Re-Download Formats</span>
                  <span className="text-xs font-mono font-bold text-purple-600">Vector PDF & High-DPI PNG</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Search Indexing</span>
                  <span className="text-xs font-mono font-bold text-blue-600">Name, Card ID, Date</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Advantages */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557]">
              Why Cyber Cafes Rely on Our Vault
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <History className="w-6 h-6 text-emerald-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Instant Replacement Prints</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When a customer loses their printed PVC card, simply pull up their saved file by name or number and re-print in seconds without extra verification cost.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Lock className="w-6 h-6 text-indigo-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Strict Operator Isolation</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every account has its own isolated records boundary. Only your authorized account login can view, download, or edit your saved files.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <FileCheck className="w-6 h-6 text-[#8B1E2D]" />
                <h3 className="text-base font-bold text-[#1D3557]">Audit Trail & Accounting</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every card creation and re-print is time-stamped in your audit ledger, providing complete operational transparency for shop owners.
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
            <span className="font-bold text-slate-500 uppercase">Related Features:</span>
            <div className="flex flex-wrap gap-4">
              <Link href="/features/wallet-management" className="text-[#8B1E2D] hover:underline font-semibold">
                Wallet Management
              </Link>
              <Link href="/features/document-editing" className="text-[#8B1E2D] hover:underline font-semibold">
                Split-Screen Studio
              </Link>
              <Link href="/solutions/cyber-cafes" className="text-[#8B1E2D] hover:underline font-semibold">
                For Cyber Cafes
              </Link>
              <Link href="/pricing" className="text-[#8B1E2D] hover:underline font-semibold">
                Pricing & Fees
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

