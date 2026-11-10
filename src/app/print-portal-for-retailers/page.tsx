import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Store,
  CheckCircle2,
  Receipt,
  Wallet,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  History,
  FileCheck,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Print Portal for Retailers – Transparent Wallet & High-Volume Printing | Accero',
  description:
    'The dedicated document printing portal for retail shop owners and digital service retailers in India. Instant UPI dynamic QR recharges, automatic API rollbacks, downloadable tax receipts, and ₹0 lifetime re-prints.',
  path: '/print-portal-for-retailers',
  keywords: [
    'print portal for retailers',
    'retailer print portal',
    'document printing portal for retailers',
    'print portal with wallet',
    'retailer wallet software',
    'high volume print portal',
    'print portal registration',
  ],
});

const retailerFeatures = [
  {
    title: 'Atomic Prepaid Ledger with Instant UPI',
    desc: 'Top up your wallet in seconds using any UPI app (Google Pay, PhonePe, Paytm) via dynamic QR code. Balances update with millisecond precision without manual admin approvals.',
    icon: Wallet,
  },
  {
    title: 'Automated Instant API Rollbacks',
    desc: 'If an external verification query times out or returns a not-found status, your wallet balance is immediately refunded in full (₹0 charged). No lost rupees.',
    icon: ShieldCheck,
  },
  {
    title: 'Downloadable Itemized Receipts',
    desc: 'Generate branded, itemized PDF receipts for every customer transaction, making bookkeeping, daily reconciliation, and retail accounting effortless.',
    icon: Receipt,
  },
  {
    title: 'Encrypted Multi-Device Operator Vault',
    desc: 'Access your saved customer records from multiple counter terminals simultaneously. Find past print jobs instantly by customer mobile number or ID.',
    icon: History,
  },
];

const faqs = [
  {
    question: 'How does the retailer wallet work on Accero PrintPortal?',
    answer:
      'Accero PrintPortal operates on a transparent prepaid utility model. You top up your wallet starting at ₹100 using instant UPI dynamic QR codes. As you generate documents, exact fees (from ₹5 for manual drafts to ₹20–₹35 for automated lookups) are deducted in real-time. If an API lookup fails, your balance is immediately refunded by our atomic database transaction manager.',
  },
  {
    question: 'Are there any setup fees, minimum monthly volumes, or distributor cuts?',
    answer:
      'No. Accero PrintPortal eliminates the bloated multi-tier distributor hierarchy common in legacy portals. There are no registration fees, no monthly software charges, and no minimum usage quotas. Every retail operator gets direct access to primary portal rates.',
  },
  {
    question: 'Can I print receipts for my customers?',
    answer:
      'Yes. Every print job includes a downloadable, printable transaction receipt that you can hand to your customer as proof of service, showing the transaction ID, date, and document type.',
  },
  {
    question: 'What is the refund policy for failed lookups?',
    answer:
      'Our refund system is 100% automated. If an external query fails to return valid document data or times out, the system automatically rolls back the transaction and restores your wallet balance immediately with zero human intervention required.',
  },
];

export default function PrintPortalForRetailersPage() {
  const softwareSchema = generateSoftwareApplicationSchema('Print Portal for Retailers');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Print Portal', url: '/print-portal' },
    { name: 'For Retailers', url: '/print-portal-for-retailers' },
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
            <Link href="/print-portal" className="hover:text-blue-600 transition-colors">
              Print Portal
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">For Retailers</span>
          </nav>

          {/* Hero Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-100 to-blue-50 rounded-full blur-3xl -z-10 opacity-70"></div>
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold tracking-wide uppercase">
                <Store className="w-3.5 h-3.5" />
                Retail Financial & Operational Gateway
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                The High-Volume <span className="text-teal-600">Print Portal</span> for Retail Operators
              </h1>

              {/* AEO / GEO Definition Snippet Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border-l-4 border-teal-600 text-slate-700 text-base sm:text-lg leading-relaxed shadow-sm font-medium">
                <strong>Accero PrintPortal for Retailers</strong> is a professional document management and printing utility engineered for retail document centers, stationary shops, and multi-counter digital service providers. Featuring automated financial ledgers, instant UPI wallet top-ups, automated balance refunds on failed queries, and 100% free lifetime re-prints, retailers scale their document printing business with complete accounting peace of mind.
              </div>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Say goodbye to untraceable WhatsApp wallet recharges and arguing over deducted balances. Accero gives your retail business banking-grade accounting accuracy, sub-second Edge performance, and zero subscription lock-ins.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Register Free Retailer Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Check Transparent Rates</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant UPI QR Top-Up</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Automated Rollbacks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Downloadable Receipts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>₹0 Free Lifetime Re-Prints</span>
                </div>
              </div>
            </div>
          </section>

          {/* Retailer Operational Features */}
          <section className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Designed for Fast-Paced Retail Counters
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Discover the enterprise-grade features that keep your retail printing counter organized and profitable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {retailerFeatures.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{feat.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Retail Economics Comparison */}
          <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800/60">
                Retail Profit Multiplier
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Direct Pricing With Zero Middleman Distributor Cuts
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Legacy print portals force retailers into multi-level schemes where "Master Distributors" skim commissions off every wallet recharge. Accero connects you directly to primary wholesale rates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Manual Form Drafts</span>
                <div className="text-3xl font-black text-white">₹5 / document</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fastest manual data entry with live dual-pane preview.
                </p>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Automated Lookups</span>
                <div className="text-3xl font-black text-teal-400">₹20 – ₹35</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Covers PAN, Voter, Aadhaar, DL, RC, and Ration Card.
                </p>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Lifetime Re-Prints</span>
                <div className="text-3xl font-black text-emerald-400">₹0 Free Forever</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All past records in your vault re-print at zero cost.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Frequently Asked Questions from Retail Operators
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Answers to essential financial, billing, and accounting questions.
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
          <section className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Start Printing Flawless Customer Cards Today
            </h2>
            <p className="text-teal-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Activate your retail account in under 30 seconds. No subscription bills, no distributor markups.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-white text-teal-700 font-extrabold text-sm shadow-md hover:bg-teal-50 transition-all"
              >
                Create Free Retailer Account
              </Link>
              <Link
                href="/print-portal"
                className="px-8 py-4 rounded-xl bg-teal-800/80 hover:bg-teal-900 text-white font-bold text-sm border border-teal-400/40 transition-all"
              >
                Explore Portal Capabilities
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

