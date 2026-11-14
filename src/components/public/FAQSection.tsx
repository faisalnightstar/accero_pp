'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface FAQSectionProps {
  faqs: FAQItem[];
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  className?: string;
}

export function FAQSection({
  faqs,
  title = 'Frequently Asked Questions',
  subtitle = 'Direct answers regarding Accero PrintPortal, card printer compatibility, and platform policies.',
  showSearch = false,
  className = '',
}: FAQSectionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 ${className}`}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] flex items-center justify-center gap-2">
          <HelpCircle className="w-6 h-6 text-[#8B1E2D]" />
          <span>{title}</span>
        </h2>
        {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
      </div>

      {showSearch && (
        <div className="max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. printer tray, recharge, refund)..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1D3557] focus:ring-1 focus:ring-[#1D3557]"
          />
        </div>
      )}

      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <Card
              key={idx}
              className="border border-slate-200/90 overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
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
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pl-9">
                  {faq.answer}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default FAQSection;
