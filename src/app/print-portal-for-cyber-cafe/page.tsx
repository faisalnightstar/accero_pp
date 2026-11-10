import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Laptop,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Printer,
  ShieldCheck,
  Eye,
  CreditCard,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Print Portal for Cyber Cafes – High-Margin PVC Card Printing | Accero',
  description:
    'The dedicated print portal software for cyber cafe owners in India. Real-time split-screen preview, amber missing field warnings, exact Epson & Canon card tray alignment, and 100% free lifetime re-prints.',
  path: '/print-portal-for-cyber-cafe',
  keywords: [
    'print portal for cyber cafe',
    'cyber cafe print software',
    'cyber cafe document printing software',
    'cyber cafe card printing solutions',
    'pvc id card software for cyber cafe',
    'epson l805 cyber cafe print tool',
  ],
});

const cafeProblems = [
  {
    problem: 'Wasting ₹25 on Blank PVC Cards',
    solution: 'Amber missing field alerts flag missing father names, signatures, or photo blobs before you send the job to the tray.',
  },
  {
    problem: 'Staff Making Mistakes on Long Forms',
    solution: 'Live dual-pane studio allows staff to see the card update letter-by-letter as they type, catching typos instantly.',
  },
  {
    problem: 'Slow Portals Crashing During Peak Hours',
    solution: 'Next.js 15 on Vercel Edge ensures sub-100ms response times even during heavy morning peak footfall.',
  },
  {
    problem: 'Customer Returning for Lost Cards',
    solution: 'Encrypted document vault lets you re-print past customer cards in 5 seconds for ₹0 lookup cost.',
  },
];

const faqs = [
  {
    question: 'How does Accero PrintPortal help a cyber cafe increase profits?',
    answer:
      'In a busy cyber cafe, ruined PVC cards directly eat into your daily cash flow. If an employee prints 5 bad cards a day due to missing data or margin cutoffs, that is ₹100–₹150 in lost profit every day. Accero’s live split-screen preview ensures zero card spoilage, while 100% free lifetime re-prints allow you to charge customers for replacement cards with zero cost to the portal.',
  },
  {
    question: 'Do I need special graphic design skills or Photoshop?',
    answer:
      'No. Accero PrintPortal is 100% automated and web-based. Simply input an ID number or type manual details, and the system automatically generates an exact vector card layout conforming to official standards.',
  },
  {
    question: 'Can multiple computers in my cyber cafe use one account?',
    answer:
      'Yes. You can access Accero PrintPortal simultaneously from any desktop, laptop, or tablet in your shop through standard web browsers (Google Chrome, Microsoft Edge, Mozilla Firefox) with a shared prepaid wallet.',
  },
  {
    question: 'How do wallet recharges work for cyber cafes?',
    answer:
      'You can recharge your prepaid balance at any time using your UPI app (Google Pay, PhonePe, Paytm, BHIM) by scanning a dynamic QR code. Your balance is credited in seconds with an itemized transaction ledger.',
  },
];

export default function PrintPortalForCyberCafePage() {
  const softwareSchema = generateSoftwareApplicationSchema('Print Portal for Cyber Cafes');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Print Portal', url: '/print-portal' },
    { name: 'For Cyber Cafes', url: '/print-portal-for-cyber-cafe' },
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
            <span className="text-slate-900 font-bold">For Cyber Cafes</span>
          </nav>

          {/* Hero Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100 to-purple-50 rounded-full blur-3xl -z-10 opacity-70"></div>
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide uppercase">
                <Laptop className="w-3.5 h-3.5" />
                Cyber Cafe Growth Software
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                The Dedicated <span className="text-indigo-600">Print Portal</span> for Cyber Cafe Owners
              </h1>

              {/* AEO / GEO Definition Snippet Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border-l-4 border-indigo-600 text-slate-700 text-base sm:text-lg leading-relaxed shadow-sm font-medium">
                <strong>Accero PrintPortal for Cyber Cafes</strong> is a cloud-based document processing system designed to turn identity card printing into a high-margin, error-free retail service. By integrating real-time missing field detection, instant photo cropping, 1:1 physical card tray alignment, and lifetime free re-prints, cyber cafes maximize transaction speed and customer satisfaction.
              </div>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Eliminate the frustration of bad print margins, unformatted government PDFs, and customers returning with complaints. Accero makes your PVC card printing counter the fastest and most profitable part of your shop.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Free Cyber Cafe Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/studio"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>Explore Live Studio</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero Ruined Plastic Cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Epson Tray J Alignment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>₹0 Lifetime Free Re-Prints</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pay-As-You-Print From ₹5</span>
                </div>
              </div>
            </div>
          </section>

          {/* Everyday Cyber Cafe Problems Solved */}
          <section className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Solving the Four Daily Headaches in Cyber Cafe Printing
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                How Accero transforms common operational pitfalls into streamlined profit drivers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cafeProblems.map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Problem: {item.problem}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-800 text-sm leading-relaxed pl-6 border-l-2 border-indigo-500">
                    <span><strong>Accero Solution:</strong> {item.solution}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Supported Documents Quick Grid */}
          <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/60">
                Full Service Coverage
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                All Popular Citizen ID Formats in One Dashboard
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Offer your customers a complete catalog of professional identity card printing services without switching between multiple software programs.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              {[
                { name: 'PAN Card', sub: 'NSDL & UTI' },
                { name: 'Aadhaar PVC', sub: 'Bilingual Format' },
                { name: 'Voter ID', sub: 'New EPIC Card' },
                { name: 'Driving Licence', sub: 'Smart Chip Card' },
                { name: 'Vehicle RC', sub: 'Vahan Smart Card' },
                { name: 'Ration Card', sub: 'NFSA Roster' },
              ].map((doc, idx) => (
                <div key={idx} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
                  <div className="font-bold text-white text-sm">{doc.name}</div>
                  <div className="text-xs text-indigo-400">{doc.sub}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center sm:text-left">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-300 hover:text-white transition-colors"
              >
                <span>View Complete Rate Card & Wallet Economics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Frequently Asked Questions from Cyber Cafe Owners
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Everything you need to know about setting up Accero PrintPortal in your shop.
              </p>
            </div>

            <div className="divide-y divide-slate-100 max-w-4xl mx-auto">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-5 space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed pl-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Boost Your Cyber Cafe’s Daily Profits Today
            </h2>
            <p className="text-indigo-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Create your account in under 30 seconds. No setup fees, no monthly bills. Recharge starting at ₹100 via UPI.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-white text-indigo-700 font-extrabold text-sm shadow-md hover:bg-indigo-50 transition-all"
              >
                Register Free Shop Account
              </Link>
              <Link
                href="/solutions/cyber-cafes"
                className="px-8 py-4 rounded-xl bg-indigo-800/80 hover:bg-indigo-900 text-white font-bold text-sm border border-indigo-400/40 transition-all"
              >
                View Cyber Cafe Solution Guide
              </Link>
            </div>
          </section>

          {/* Legal Compliance Disclaimer */}
          <footer className="text-center text-xs text-slate-500 max-w-3xl mx-auto pt-4 space-y-2">
            <p>
              <strong>Disclaimer:</strong> Accero PrintPortal is an independent commercial software platform designed for document layout formatting, editing, and physical card printing. It is not affiliated with, endorsed by, or an official service of any government agency or department.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}

