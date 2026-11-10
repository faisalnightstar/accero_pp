import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { HelpCircle, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema, generateFaqSchema } from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Frequently Asked Questions (FAQ) | Accero PrintPortal',
  description:
    'Comprehensive answers to questions about PVC card printing, CR80 card dimensions, Epson/Canon card trays, wallet recharges, and platform compliance.',
  path: '/faq',
  keywords: [
    'accero printportal faq',
    'pvc card printing questions',
    'cr80 card size in mm',
    'epson l805 card tray setup',
    'cyber cafe card printing faq',
    'free card reprint rules',
  ],
});

const faqCategories = [
  {
    category: 'General Platform & Capabilities',
    faqs: [
      {
        question: 'What is Accero PrintPortal?',
        answer:
          'Accero PrintPortal is an independent document processing and printing platform designed for cyber cafes, CSC operators, and printing businesses. It provides document lookup, editing, multilingual layouts, and printing workflows through a centralized web platform.',
      },
      {
        question: 'Which document services does Accero PrintPortal support?',
        answer:
          'Accero PrintPortal supports PAN Card, Aadhaar Card, Voter ID (EPIC), Driving Licence (DL), Vehicle Registration Certificate (RC), and Ration Card workflows, subject to the availability of the corresponding integrations and features.',
      },
      {
        question: 'Can I manage multiple document services from one dashboard?',
        answer:
          'Yes. Accero PrintPortal brings all supported document processing and printing workflows into one centralized dashboard, eliminating the need to log into disparate systems.',
      },
      {
        question: 'Does Accero PrintPortal support multilingual document layouts?',
        answer:
          'Yes. The platform supports multiple regional language layouts (such as Hindi / Devanagari script via Google Fonts Hind) for applicable document templates.',
      },
    ],
  },
  {
    category: 'Physical Dimensions & Printer Hardware',
    faqs: [
      {
        question: 'What are the exact physical dimensions of printed cards?',
        answer:
          'All cards are formatted strictly to the international ISO/IEC 7810 ID-1 standard dimensions: exactly 85.60 mm in width by 53.98 mm in height (CR80 standard credit card size) with 3.18 mm corner radii.',
      },
      {
        question: 'Which desktop inkjet card printers are supported?',
        answer:
          'Accero PrintPortal is natively calibrated for Epson L805, L850, L8050, L1800, and Canon Pixma G-series (G1010, G2010, G3010, TS707) with standard PVC ID card trays (Tray J).',
      },
      {
        question: 'How does Accero PrintPortal prevent white margins or clipping?',
        answer:
          'Our output engine injects CSS @page rules with 0 margins: `@page { size: 85.6mm 53.98mm; margin: 0; }`. This disables browser margin injection and ensures 1:1 scale mapping directly into the physical tray.',
      },
      {
        question: 'Can I export high-resolution vector PDF files?',
        answer:
          'Yes. Every formatted card can be exported as a 300+ DPI vector PDF or high-resolution PNG for offline archival and batch printing.',
      },
    ],
  },
  {
    category: 'Billing, Wallets & Re-Printing',
    faqs: [
      {
        question: 'Are there monthly subscription fees or software contracts?',
        answer:
          'No. Accero PrintPortal is 100% subscription-free. Operators only maintain a prepaid credit balance and pay transparent rates per card generated.',
      },
      {
        question: 'How much does card formatting cost?',
        answer:
          'Manual draft formatting is flat ₹5 per card. Alphanumeric verified lookups range between ₹20 and ₹35 per successful card generation, depending on the document registry.',
      },
      {
        question: 'Are re-prints charged from my wallet balance?',
        answer:
          'No. Once a document has been generated and saved to your account, all subsequent views, edits, and PDF/PNG re-prints are 100% free of charge (₹0).',
      },
      {
        question: 'How do I recharge my operator wallet balance?',
        answer:
          'Operators can recharge instantly starting at ₹100 using dynamic UPI QR codes compatible with Google Pay, PhonePe, Paytm, and BHIM.',
      },
    ],
  },
  {
    category: 'Legal, Compliance & Data Security',
    faqs: [
      {
        question: 'Is Accero PrintPortal an official government website?',
        answer:
          'No. Accero PrintPortal is an independent commercial software platform. It is not an official government portal, nor is it an NSDL, UTIITSL, UIDAI, ECI, or RTO partner. Operators must use authorized sources and comply with applicable government requirements when processing identity-related information.',
      },
      {
        question: 'Does Accero PrintPortal issue or manufacture government credentials?',
        answer:
          'No. Accero PrintPortal is strictly a digital document layout formatting utility and physical card tray alignment tool. It does not issue official credentials, manufacture state cards, or enroll citizens.',
      },
      {
        question: 'How is customer identity data protected?',
        answer:
          'Data transmitted through the portal is encrypted via TLS 1.3 / 256-bit SSL. User records in the vault are isolated and accessible only via cryptographically signed operator sessions.',
      },
    ],
  },
];

export default function FaqPage() {
  const allFaqs = faqCategories.flatMap((c) => c.faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'FAQ', url: '/faq' },
  ]);
  const faqSchema = generateFaqSchema(allFaqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Frequently Asked Questions</span>
          </nav>

          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-[#8B1E2D] border border-red-200">
              <HelpCircle className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Operator Knowledge Base</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Clear, direct answers regarding Accero PrintPortal, card printer hardware, wallet accounting, and compliance.
            </p>
          </div>

          {/* Grouped Accordions */}
          <div className="space-y-10">
            {faqCategories.map((cat, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="text-xl font-bold text-[#1D3557] border-b border-slate-200 pb-2">
                  {cat.category}
                </h2>
                <div className="space-y-4">
                  {cat.faqs.map((faq, fIdx) => (
                    <div
                      key={fIdx}
                      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-2"
                    >
                      <h3 className="text-base font-bold text-[#1D3557] flex items-start gap-2">
                        <span className="text-[#8B1E2D] font-mono">Q:</span>
                        <span>{faq.question}</span>
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed pl-6">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Contact Assistance Callout */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-[#1D3557] to-[#14233c] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Have a Specific Question?</h3>
              <p className="text-xs text-slate-300">
                Contact our support team for printer calibration assistance or high-volume inquiries.
              </p>
            </div>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all shrink-0"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

