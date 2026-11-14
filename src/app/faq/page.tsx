'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, Sparkles, ArrowRight, Search, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CTASection } from '@/components/public/CTASection';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ '0-0': true });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filteredCategories = faqCategories
    .filter((cat) => (activeCategory === 'all' ? true : cat.category === activeCategory))
    .map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.faqs.length > 0);

  return (
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

        {/* Hero */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#1D3557] border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5 text-[#8B1E2D]" />
            <span>Operator Knowledge Base &amp; FAQ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Clear, direct answers regarding Accero PrintPortal, card printer hardware, wallet accounting, and compliance.
          </p>

          {/* Search Bar */}
          <div className="pt-2 relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword (e.g. Epson, tray, recharge, refund)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1D3557] focus:ring-1 focus:ring-[#1D3557] transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeCategory === 'all'
                ? 'bg-white text-[#1D3557] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Questions
          </button>
          {faqCategories.map((cat) => (
            <button
              key={cat.category}
              type="button"
              onClick={() => setActiveCategory(cat.category)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeCategory === cat.category
                  ? 'bg-white text-[#1D3557] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.category.split('&')[0].trim()}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat, cIdx) => (
              <section key={cIdx} className="space-y-3">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
                  {cat.category}
                </h2>
                <div className="space-y-3">
                  {cat.faqs.map((faq, fIdx) => {
                    const key = `${cIdx}-${fIdx}`;
                    const isOpen = !!openItems[key];
                    return (
                      <Card
                        key={fIdx}
                        className="border border-slate-200/90 overflow-hidden transition-all duration-200"
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(key)}
                          aria-expanded={isOpen}
                          className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D3557]"
                        >
                          <span className="text-sm sm:text-base font-bold text-[#1D3557] flex items-center gap-2">
                            <span className="text-[#8B1E2D] font-mono">Q:</span>
                            <span>{faq.question}</span>
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                              isOpen ? 'rotate-180 text-[#8B1E2D]' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                            {faq.answer}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <p className="text-sm font-semibold text-slate-700">No matching questions found</p>
              <p className="text-xs text-slate-500">Try searching with a different term.</p>
            </div>
          )}
        </div>

        {/* Contact Assistance Callout */}
        <div className="p-8 rounded-3xl bg-[#1D3557] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Have a Specific Question?</h3>
            <p className="text-xs text-slate-300">
              Contact our support team for printer calibration assistance or high-volume inquiries.
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
  );
}
