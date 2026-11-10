import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Check,
  CreditCard,
  Zap,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';
import PageTracker from '@/components/analytics/PageTracker';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';

export const metadata: Metadata = buildPageMetadata({
  title: 'Transparent Pay-As-You-Print Pricing | Accero PrintPortal',
  description:
    'No monthly subscriptions. Pay only per verified card lookup or manual draft. 100% free lifetime re-prints (₹0) and instant UPI wallet recharge.',
  path: '/pricing',
  keywords: [
    'document printing software pricing',
    'pvc card print cost',
    'accero printportal fees',
    'pay as you go print software',
    'cyber cafe card printing rates',
    'free card re-print portal',
  ],
});

const serviceRates = [
  { service: 'Manual Draft (Any Document)', rate: '₹5', note: 'Operator inputs data and photo manually' },
  { service: 'PAN Card (Alphanumeric Lookup)', rate: '₹20', note: 'Auto-fetches NSDL/UTI format with QR' },
  { service: 'Voter ID (EPIC Number Lookup)', rate: '₹20', note: 'Includes Assembly and Polling Part' },
  { service: 'Aadhaar PVC Card (UID Lookup)', rate: '₹25', note: 'Bilingual Devanagari layout with QR' },
  { service: 'Ration Card (NFSA Number Lookup)', rate: '₹25', note: 'Includes full family member roster table' },
  { service: 'Driving Licence (DL Number Lookup)', rate: '₹30', note: 'Smart chip graphic with vehicle classes' },
  { service: 'Vehicle RC (Vahan Reg No Lookup)', rate: '₹35', note: 'Chassis, engine, and owner specifications' },
  { service: 'Subsequent Re-Prints (Saved Records)', rate: '₹0', note: '100% Free Forever for all saved cards' },
];

const faqs = [
  {
    question: 'Are there any recurring monthly subscriptions or hidden charges?',
    answer:
      'No. Accero PrintPortal is completely subscription-free. You only recharge your prepaid wallet balance as needed and pay transparent utility rates per card generated.',
  },
  {
    question: 'What happens if a lookup fails or the document is not found?',
    answer:
      'If an external query times out or fails, zero fee is charged (₹0). You are never billed for incomplete or failed operations.',
  },
  {
    question: 'Do I have to pay again when re-printing a saved card?',
    answer:
      'No! Once a document has been saved to your account, you can re-print it or re-download the vector PDF as many times as you want for free (₹0).',
  },
  {
    question: 'What is the minimum wallet recharge amount?',
    answer:
      'You can recharge your prepaid balance starting at ₹100 using any standard UPI app (Google Pay, PhonePe, Paytm, BHIM) via dynamic QR code.',
  },
];

export default function PricingPage() {
  const softwareSchema = generateSoftwareApplicationSchema('Accero PrintPortal Pricing');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Pricing', url: '/pricing' },
  ]);
  const faqSchema = generateFaqSchema(faqs);

  return (
    <>
      <PageTracker event={ANALYTICS_EVENTS.PRICING_VISIT} metadata={{ pagePath: '/pricing' }} />
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
            <span className="text-[#8B1E2D]">Pricing</span>
          </nav>

          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Monthly Subscriptions • Pay Only What You Print</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight">
              Transparent Pay-As-You-Print Pricing
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              No contracts, no setup fees, and no recurring deductions. Top up your operator wallet via UPI and print official-standard CR80 PVC cards on demand.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#1D3557]">Manual Draft Studio</h2>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-extrabold text-[#1D3557]">₹5</span>
                  <span className="text-xs text-slate-500"> / card generated</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  Perfect when customers bring their own documents, photographs, or application receipts.
                </p>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Full Access to All 6 Card Canvases</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Photo & Signature Drag-and-Drop</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Unlimited Free Re-prints (₹0)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>300+ DPI Vector PDF Export</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 text-center py-3 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#1D3557] transition-colors"
              >
                Start with Manual Mode
              </Link>
            </div>

            {/* Card 2 (Featured) */}
            <div className="bg-white rounded-3xl p-8 border-2 border-[#8B1E2D] shadow-xl flex flex-col justify-between relative">
              <span className="absolute -top-3 right-6 bg-[#8B1E2D] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow">
                Most Popular for Cyber Cafes
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#1D3557]">Alphanumeric Lookup</h2>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-extrabold text-[#8B1E2D]">₹20 – ₹35</span>
                  <span className="text-xs text-slate-500"> / verified lookup</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  Automated query for PAN, Voter, DL, RC, Ration, and Aadhaar demographic data.
                </p>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Auto-Fetches Official Demographic Data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Split-Screen Live Missing Field Guides</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dynamic Demographic QR Code</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Zero Fee on Failed Lookups (₹0)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Unlimited Free Re-prints (₹0)</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 text-center py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#8B1E2D] to-[#E63946] shadow transition-all hover:shadow-btn-hover"
              >
                Create Operator Account
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#1D3557]">Enterprise / Hubs</h2>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-extrabold text-[#1D3557]">Custom</span>
                  <span className="text-xs text-slate-500"> / high-volume counters</span>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                  For regional multi-desk centers, franchise networks, and high-capacity printing shops.
                </p>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated High-Throughput Quotas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Multi-Operator Sub-Accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Priority WhatsApp & Phone SLA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Custom Template Calibration</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/contact"
                className="mt-8 text-center py-3 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#1D3557] transition-colors"
              >
                Contact Enterprise Sales
              </Link>
            </div>
          </div>

          {/* Itemized Rates Table */}
          <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#1D3557]">Itemized Service Rate Card</h2>
              <p className="text-xs text-slate-500">
                Transparent per-service fees. Debited directly from your prepaid operator balance.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Service Workflow</th>
                    <th className="py-3 px-4">Operator Fee</th>
                    <th className="py-3 px-4">Details & Guarantees</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRates.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#1D3557]">{item.service}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#8B1E2D]">{item.rate}</td>
                      <td className="py-3.5 px-4 text-slate-600">{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQs */}
          <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557] flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#8B1E2D]" />
              <span>Pricing & Wallet Billing FAQs</span>
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
        </div>
      </div>
    </>
  );
}

