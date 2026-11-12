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
  Lock,
  UserCheck,
  Smartphone,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'RajPrint Alternative in India | Compare Accero PrintPortal',
  description:
    'Looking for an alternative to RajPrint (rajprint.co.in)? Compare Accero PrintPortal: instant free signup, live split-screen missing data alerts, ₹0 lifetime reprints, and ISO PVC card printing.',
  path: '/compare/rajprint-alternative',
  keywords: [
    'rajprint alternative',
    'raj print alternative',
    'rajprint.co.in alternative',
    'alternative to rajprint',
    'raj print portal',
    'rajprint login alternative',
    'raj print csc portal',
    'pvc card printing software',
  ],
});

const comparisonTable = [
  {
    feature: 'Operator Onboarding',
    competitor: 'Gated WordPress login wall (rajprint.co.in/login/); requires private admin approval or manual contact',
    accero: '100% Free instant self-serve registration (₹0) via mobile & email OTP in 30 seconds',
    advantage: 'Accero',
  },
  {
    feature: 'Upfront Pricing Transparency',
    competitor: 'Undisclosed private rates hidden behind login screen; unpredictable price changes',
    accero: '100% Publicly disclosed rates (₹5 manual drafts, ₹20–₹35 automated lookups, ₹0 reprints)',
    advantage: 'Accero',
  },
  {
    feature: 'Pre-Print Data Verification',
    competitor: 'Static forms without real-time validation; errors discovered only after printing',
    accero: 'Interactive split-screen live editor with amber badges flagging missing parent names, DOB, or addresses',
    advantage: 'Accero',
  },
  {
    feature: 'Card Stock Protection',
    competitor: 'Blind printing on blank plastic; incomplete upstream API data ruins ₹25 PVC cards',
    accero: 'Zero Ruined Cards Guarantee: preview and edit missing fields before sending to printer tray',
    advantage: 'Accero',
  },
  {
    feature: 'PVC Tray Alignment',
    competitor: 'Uncalibrated browser print templates with arbitrary margins causing 2–4mm tray cutoffs',
    accero: 'Exact ISO/IEC 7810 ID-1 standard (85.60 mm × 53.98 mm) zero-margin CSS for Epson L805/L8050 & Canon trays',
    advantage: 'Accero',
  },
  {
    feature: 'Customer Reprint Policy',
    competitor: 'Full wallet deduction repeated whenever a customer requests a replacement card',
    accero: '100% Free Lifetime Re-Prints (₹0) from encrypted operator Document Vault',
    advantage: 'Accero',
  },
  {
    feature: 'Wallet Balance Protection',
    competitor: 'Balance deducted on failed lookups or timeouts; manual dispute resolution via WhatsApp',
    accero: 'Atomic MongoDB transactions with automated instant balance rollback on timeout or error',
    advantage: 'Accero',
  },
  {
    feature: 'Wallet Top-Up Speed',
    competitor: 'Manual UTR entry or third-party payment gateways with delay',
    accero: 'Dynamic UPI QR code with instant zero-fee real-time wallet credit',
    advantage: 'Accero',
  },
  {
    feature: 'Supported Document Suite',
    competitor: 'Manual Aadhar, PAN, Voter, RC, Licence, Jan Aadhar, Marksheet (WordPress scripts)',
    accero: 'Consolidated 6-in-1 Studio: PAN, Aadhaar PVC, Voter ID, DL, RC, Ayushman & Ration Cards',
    advantage: 'Accero',
  },
  {
    feature: 'Platform Architecture & Uptime',
    competitor: 'Single shared PHP/WordPress cPanel hosting vulnerable to peak-hour downtime',
    accero: 'Next.js 15.5 App Router on globally distributed Vercel Edge with sub-100ms static response',
    advantage: 'Accero',
  },
  {
    feature: 'Security & DPDP Compliance',
    competitor: 'Unverified legacy database storage without documented customer data encryption',
    accero: '256-bit AES database encryption, zero plain-text Aadhaar storage, India DPDP Act compliance',
    advantage: 'Accero',
  },
  {
    feature: 'Customer Support Desk',
    competitor: 'Informal personal WhatsApp chat with no ticket tracking or SLA',
    accero: 'Dedicated help desk, ticketing system, video knowledge base & priority WhatsApp support',
    advantage: 'Accero',
  },
];

const faqs = [
  {
    question: 'Why are operators looking for an alternative to RajPrint (rajprint.co.in)?',
    answer:
      'RajPrint operates as a closed, gated WordPress login portal (rajprint.co.in/login/) where operators must obtain credentials privately through manual administrative approval or offline contacts. Furthermore, rates are not publicly published, and operators face ruined PVC cards when upstream APIs omit critical fields. Accero PrintPortal provides an open, instant self-serve registration model with transparent pricing, real-time missing-data validation, and 100% free lifetime reprints.',
  },
  {
    question: 'Is rajprint.in the same as RajPrint print portal?',
    answer:
      'No. Domain investigations verify that rajprint.in belongs to Raj Screens, an independent commercial invitation and screen printing firm established in 1983. The digital print portal referenced by cyber cafe operators is hosted separately at rajprint.co.in. Accero PrintPortal is an independent modern platform and is not affiliated with either entity.',
  },
  {
    question: 'Can I transfer my existing RajPrint wallet balance to Accero PrintPortal?',
    answer:
      'No. Because RajPrint and Accero PrintPortal are entirely independent, unaffiliated commercial entities, balances, credentials, or customer histories cannot be transferred. However, Accero requires zero upfront registration fees and allows operators to start with a minimal ₹50 or ₹100 trial recharge with zero lock-in.',
  },
  {
    question: 'How does Accero prevent wasted PVC card plastic compared to RajPrint?',
    answer:
      'In legacy portals like RajPrint, documents are formatted blindly. If an external API returns a record with a missing father name, house number, or blurry photo, the card prints incomplete—wasting a ₹25 PVC plastic card and expensive ink. Accero’s interactive split-screen editor inspects all demographic fields in real time and highlights missing values with amber warning badges, allowing you to edit and complete the data before sending it to the print tray.',
  },
  {
    question: 'Does Accero support Epson L805 and L8050 PVC card trays?',
    answer:
      'Yes. Accero PrintPortal generates pixel-perfect card layouts calibrated specifically for Epson 2-card Tray J (L805, L850, L8050) and Canon ID trays. All printable cards strictly adhere to ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm) with zero-margin CSS (@page { margin: 0; }), eliminating white border trimming.',
  },
  {
    question: 'Is Accero PrintPortal compliant with Indian data protection laws?',
    answer:
      'Yes. Accero PrintPortal is engineered in strict compliance with the Digital Personal Data Protection (DPDP) Act, 2023. All sensitive citizen identifiers are encrypted at rest with AES-256 GCM, full Aadhaar numbers are never stored in plain text, and operator vaults are secured with role-based access controls.',
  },
];

export default function RajPrintAlternativePage() {
  const softwareSchema = generateSoftwareApplicationSchema(
    'Accero PrintPortal - RajPrint Alternative'
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Print Portal', url: '/print-portal' },
    { name: 'RajPrint Alternative', url: '/compare/rajprint-alternative' },
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
            <span className="text-slate-900 font-bold">RajPrint Alternative</span>
          </nav>

          {/* Hero Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100 to-indigo-50 rounded-full blur-3xl -z-10 opacity-70"></div>
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modern Document Studio vs Gated Portals</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Looking for an Alternative to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  RajPrint
                </span>
                ?
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Frustrated by closed login walls, undisclosed pricing, and ruined PVC cards? Switch to{' '}
                <strong>Accero PrintPortal</strong>—India&apos;s open, Next.js-powered document processing
                platform with instant self-serve registration, real-time missing-data validation, and
                100% free lifetime reprints.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <span>Start Free Operator Trial (₹0)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors"
                >
                  <Wallet className="w-4 h-4 text-slate-600" />
                  <span>View Transparent Pricing</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Real-World Context Notice */}
          <section className="bg-amber-50 rounded-2xl p-6 sm:p-8 border border-amber-200 text-amber-900 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h2 className="text-base font-bold text-amber-900">
                  Independent Comparison Notice (RajPrint rajprint.co.in)
                </h2>
                <p className="text-sm text-amber-800 leading-relaxed">
                  As of our live November 2026 technical audit, <code>rajprint.co.in</code> operates as a
                  gated WordPress authentication screen requiring administrative pre-approval, with no public
                  documentation or upfront fee schedules. (Note: The domain <code>rajprint.in</code> belongs to
                  an unrelated commercial printing firm founded in 1983). Accero PrintPortal provides a fully
                  independent, public, enterprise-grade cloud alternative.
                </p>
              </div>
            </div>
          </section>

          {/* Comprehensive Comparison Table */}
          <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                RajPrint vs Accero PrintPortal: Feature Comparison
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Detailed side-by-side comparison based on live network probes and verified application features.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="py-4 px-4 font-bold text-slate-900 w-1/4">Key Capability</th>
                    <th className="py-4 px-4 font-bold text-slate-600 w-1/3">RajPrint (rajprint.co.in)</th>
                    <th className="py-4 px-4 font-bold text-blue-700 w-5/12 bg-blue-50/50">
                      Accero PrintPortal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-800 align-top">
                        {row.feature}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 align-top leading-relaxed">
                        {row.competitor}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 bg-blue-50/30 align-top leading-relaxed">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>{row.accero}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Core Differentiators Grid */}
          <section className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Why Operators Choose Accero Over Closed Legacy Portals
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Modern software engineering designed to maximize cyber cafe margins and eliminate downtime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Zero Onboarding Barriers</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Never wait days for a middleman to activate your account. Register instantly via mobile OTP,
                  test our tools with ₹50, and enjoy zero ongoing subscription or franchise charges.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Live Missing-Data Flags</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Our split-screen canvas inspects retrieved data before you print. If parentage, photo, or
                  address fields are missing from government API responses, amber alerts warn you to edit them.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">₹0 Free Lifetime Reprints</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Customer lost their PVC card after 2 months? Re-print it from your encrypted Document Vault
                  at absolutely ₹0 cost. Charge your customer your normal walk-in fee and keep 100% profit.
                </p>
              </div>
            </div>
          </section>

          {/* Migration Steps */}
          <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Easy 4-Step Migration to Accero PrintPortal
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Switch in under 2 minutes without disrupting your shop&apos;s daily printing operations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10 space-y-3">
                <div className="text-2xl font-black text-blue-400">01</div>
                <h3 className="font-bold text-white">Create Free Account</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sign up with your mobile number and email. No documents or admin approval required.
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10 space-y-3">
                <div className="text-2xl font-black text-blue-400">02</div>
                <h3 className="font-bold text-white">Trial Wallet Top-Up</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Scan the dynamic UPI QR code with GPay/PhonePe to add ₹50 or ₹100. Balance credits in seconds.
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10 space-y-3">
                <div className="text-2xl font-black text-blue-400">03</div>
                <h3 className="font-bold text-white">Test-Print a Card</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Format any PAN, Voter, or Aadhaar card. Inspect the split-screen preview and verify tray alignment.
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10 space-y-3">
                <div className="text-2xl font-black text-blue-400">04</div>
                <h3 className="font-bold text-white">Scale Your Revenue</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Offer zero-error instant PVC printing to walk-in customers and retain ₹35–₹50 profit per card.
                </p>
              </div>
            </div>
          </section>

          {/* Frequently Asked Questions */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Frequently Asked Questions: RajPrint Alternative
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Everything you need to know before switching your printing operations to Accero.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">{faq.question}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="bg-blue-600 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                Switch to India&apos;s Most Reliable Print Portal Today
              </h2>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
                Join thousands of CSC VLEs, cyber cafe operators, and document service centers printing
                pixel-perfect PVC cards with zero missing data and zero wasted cards.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-sm shadow-lg transition-colors"
              >
                Register Your Shop Free
              </Link>
              <Link
                href="/features/document-printing"
                className="px-8 py-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm transition-colors border border-blue-500"
              >
                Explore Printing Features
              </Link>
            </div>
          </section>

          {/* Legal Fair Use Disclaimer */}
          <footer className="text-center text-xs text-slate-400 space-y-2 py-4">
            <p>
              <strong>Disclaimer:</strong> RajPrint and rajprint.co.in are trademarks and domain names of their
              respective owners. Accero PrintPortal is an independent commercial platform developed by Accero
              Technologies and has no connection, partnership, or affiliation with RajPrint or Raj Screens.
              All comparative analysis is published for operator education and nominative fair use under applicable law.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
