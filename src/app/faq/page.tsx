import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { HelpCircle, Sparkles, ArrowRight, ShieldCheck, Printer, Wallet, FileText } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';
import { Button } from '@/components/ui/Button';
import { FaqInteractiveClient, FAQCategoryItem } from '@/components/public/FaqInteractiveClient';

export const metadata: Metadata = buildPageMetadata({
  title: 'Frequently Asked Questions (FAQ)',
  description:
    'Find clear answers regarding Accero PrintPortal, desktop card printer compatibility (Epson/Canon PVC trays), wallet billing, zero-margin calibration, and compliance.',
  path: '/faq',
  keywords: [
    'print portal faq',
    'pvc card printing questions',
    'epson l805 card tray setup',
    'canon g series id card tray',
    'cyber cafe card printing questions',
    'csc operator portal faq',
    'accero printportal support',
    'free card re-print policy',
    'pvc card printing problems and solutions',
    'how to fix margin cutoff on pvc card',
  ],
});

const faqCategories: FAQCategoryItem[] = [
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
      {
        question: 'Can I format cards manually if an external API lookup is unavailable?',
        answer:
          'Yes. Accero PrintPortal includes a dedicated manual entry studio for every document type. Operators can enter demographic details, upload photos and signatures, and generate pixel-perfect CR80 cards even when third-party lookup APIs are offline.',
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
      {
        question: 'Do I need special RIP software or driver plugins?',
        answer:
          'No special RIP software or third-party plugins are required. Accero PrintPortal outputs directly through standard browser print dialogs (Chrome, Edge, Firefox) calibrated to 100% scale.',
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
          'Manual draft formatting is flat ₹5 per card. Alphanumeric verified lookups range between ₹20 and ₹30 per successful card generation, depending on the document registry.',
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
      {
        question: 'What happens if a lookup fails or returns no data?',
        answer:
          'If an external provider lookup fails or returns no record, zero fee (₹0) is deducted from your wallet. Your balance remains untouched, and you can switch to manual entry without penalty.',
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
          'Data transmitted through the portal is secured via TLS 1.3 / 256-bit encryption. Document records required for re-printing are stored in an ephemeral 72-hour cache with automated expiration, accessible only via cryptographically signed operator sessions.',
      },
      {
        question: 'How does Accero PrintPortal align with India’s Digital Personal Data Protection (DPDP) Act?',
        answer:
          'Our architecture is designed in alignment with Indian data minimization and storage limitation principles. Document records expire automatically after 72 hours via MongoDB TTL background cleanup, and sensitive identifiers are never indexed in plain text.',
      },
    ],
  },
];

export default function FaqPage() {
  const softwareSchema = generateSoftwareApplicationSchema('Accero PrintPortal FAQ & Support Knowledge Base');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'FAQ', url: '/faq' },
  ]);

  // Flatten all FAQs for FAQPage JSON-LD schema
  const allFaqs = faqCategories.flatMap((cat) => cat.faqs);
  const faqSchema = generateFaqSchema(allFaqs);

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

      <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Frequently Asked Questions</span>
          </nav>

          {/* Hero Header */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#1D3557] border border-slate-200">
              <HelpCircle className="w-3.5 h-3.5 text-[#8B1E2D]" />
              <span>Operator Knowledge Base &amp; FAQ</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Clear, direct answers regarding Accero PrintPortal, card printer hardware calibration, wallet accounting, and compliance standards.
            </p>
          </div>

          {/* Interactive Client Component for Search, Categories & Accordions */}
          <FaqInteractiveClient categories={faqCategories} />

          {/* High-contrast WCAG AAA question indicator marker */}
          <div className="hidden" aria-hidden="true">
            <span className="text-[#8B1E2D] font-mono">Q:</span>
          </div>

          {/* Quick Help Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <Printer className="w-5 h-5 text-[#8B1E2D]" />
              <h3 className="text-xs font-bold text-[#1D3557]">Hardware Calibration</h3>
              <p className="text-[11px] text-slate-600 leading-normal">
                Learn 0-margin paper setup and tray alignment for Epson L805 and Canon G-series printers.
              </p>
              <Link href="/blog/pvc-card-printer-tray-guide" className="text-[11px] font-bold text-[#8B1E2D] hover:underline inline-block pt-1">
                Read Tray Guide →
              </Link>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xs font-bold text-[#1D3557]">Wallet &amp; Pricing</h3>
              <p className="text-[11px] text-slate-600 leading-normal">
                Understand pay-per-print rates, ₹0 re-prints, and instant UPI recharge workflows.
              </p>
              <Link href="/pricing" className="text-[11px] font-bold text-[#8B1E2D] hover:underline inline-block pt-1">
                View Pricing Catalog →
              </Link>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <ShieldCheck className="w-5 h-5 text-[#1D3557]" />
              <h3 className="text-xs font-bold text-[#1D3557]">Security &amp; Privacy</h3>
              <p className="text-[11px] text-slate-600 leading-normal">
                Learn how customer data is isolated, encrypted, and handled under DPDP compliance.
              </p>
              <Link href="/privacy" className="text-[11px] font-bold text-[#8B1E2D] hover:underline inline-block pt-1">
                Review Privacy Policy →
              </Link>
            </div>
          </div>

          {/* Contact Assistance Callout */}
          <div className="p-8 rounded-3xl bg-[#1D3557] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Have a Specific Question?</h3>
              <p className="text-xs text-slate-300">
                Contact our support team for printer calibration assistance, bulk retail inquiries, or custom setups.
              </p>
            </div>
            <Button
              href="/contact"
              variant="accent"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
