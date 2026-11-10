import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Wallet,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Prepaid Wallet & Ledger Management | Accero PrintPortal',
  description:
    'Simple pay-as-you-go utility billing for card printing shops. Instant UPI recharge, transparent per-card deductions, automatic refund on timeouts, and zero recurring subscription fees.',
  path: '/features/wallet-management',
  keywords: [
    'cyber cafe billing software',
    'csc operator wallet',
    'prepaid print ledger',
    'paytm upi print portal recharge',
    'transparent per card pricing',
    'print shop ledger software',
  ],
});

const faqs = [
  {
    question: 'Are there any recurring monthly subscription charges?',
    answer:
      'No. Accero PrintPortal has zero monthly maintenance fees, zero sign-up fees, and zero hidden software subscriptions. You only maintain a prepaid credit balance and pay flat rates per card generated.',
  },
  {
    question: 'How do operators recharge their wallet balance?',
    answer:
      'Recharges are processed instantly via UPI, QR code, or net banking using our integrated Paytm payment gateway. Balance reflects immediately in your operator header.',
  },
  {
    question: 'What happens if a lookup fails due to a network glitch?',
    answer:
      'Our financial ledger uses atomic database transactions. If an external lookup fails, no funds are deducted. If a transient error occurs during processing, the fee is automatically rolled back to your balance.',
  },
];

export default function WalletManagementFeaturePage() {
  const softwareSchema = generateSoftwareApplicationSchema('Prepaid Wallet & Ledger Management');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
    { name: 'Wallet Management', url: '/features/wallet-management' },
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
            <span className="text-[#8B1E2D]">Wallet Management</span>
          </nav>

          {/* Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                <span>Zero Subscription Fees • Pay-As-You-Print</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight leading-tight">
                Prepaid Wallet Ledger with Instant UPI Top-Up
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Take control of your business costs. Simple pay-as-you-go card formatting utility with instant UPI wallet recharges, itemized transaction tracking, and zero recurring lock-ins.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all"
                >
                  Create Operator Account
                </Link>
                <Link
                  href="/pricing"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-white text-[#1D3557] border border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  View Per-Card Rates
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Transparent Fee Structure
              </span>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Manual Draft Card</span>
                  <span className="text-xs font-mono font-bold text-emerald-600">₹5 / card</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Alphanumeric Lookup</span>
                  <span className="text-xs font-mono font-bold text-slate-600">₹20 – ₹35 / card</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">Subsequent Re-Prints</span>
                  <span className="text-xs font-mono font-bold text-purple-600">₹0 (100% Free)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D3557]">UPI Recharge Min</span>
                  <span className="text-xs font-mono font-bold text-blue-600">₹100 (Instant)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advantages */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557]">
              Financial Integrity for Business Operators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Receipt className="w-6 h-6 text-indigo-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Itemized Transaction Log</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every recharge and debit transaction is logged with unique IDs, reference numbers, and timestamps for complete accounting reconciliation.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Atomic Balance Security</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Debits occur via atomic MongoDB sessions. If any step fails during document generation, funds are instantly protected from erroneous deductions.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <CreditCard className="w-6 h-6 text-[#8B1E2D]" />
                <h3 className="text-base font-bold text-[#1D3557]">Fast Dynamic UPI QR</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Top up directly from your phone using Google Pay, PhonePe, Paytm, or BHIM UPI by scanning a dynamic QR code.
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
              <Link href="/pricing" className="text-[#8B1E2D] hover:underline font-semibold">
                Transparent Pricing
              </Link>
              <Link href="/features/document-lookup" className="text-[#8B1E2D] hover:underline font-semibold">
                Document Lookup
              </Link>
              <Link href="/solutions/csc-operators" className="text-[#8B1E2D] hover:underline font-semibold">
                For CSC Operators
              </Link>
              <Link href="/faq" className="text-[#8B1E2D] hover:underline font-semibold">
                Operator FAQ
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

