'use client';

import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export interface FAQCategoryItem {
  category: string;
  faqs: {
    question: string;
    answer: string;
  }[];
}

interface FaqInteractiveClientProps {
  categories: FAQCategoryItem[];
}

export function FaqInteractiveClient({ categories }: FaqInteractiveClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ '0-0': true });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filteredCategories = categories
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
    <div className="space-y-8">
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
        {categories.map((cat) => (
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
    </div>
  );
}
