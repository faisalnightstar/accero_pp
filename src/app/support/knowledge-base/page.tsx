'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Copy,
  ChevronDown,
  ChevronUp,
  Tag,
  Share2,
  Printer,
  Wallet,
  FileText,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { SUPPORT_KNOWLEDGE_BASE } from '@/lib/support/knowledgeBase';

const EXTENDED_ARTICLES = [
  ...SUPPORT_KNOWLEDGE_BASE,
  {
    id: 'kb-007',
    category: 'Document Studio',
    title: 'Regional Language & Devanagari Script Support',
    summary: 'Ensuring correct Hindi and regional font rendering on Voter, Ration, and Aadhaar cards.',
    content:
      'Accero PrintPortal automatically imports Google Fonts ("Hind", "Roboto", "Open Sans") in print style sheets. If an operator reports broken ligature or square boxes: 1. Confirm their browser supports CSS web fonts. 2. Ensure they are using Google Chrome or Microsoft Edge. 3. If regional name transliteration was omitted by the government API, advise the operator to type the Hindi/regional name directly into the Devanagari input field in the live editor.',
    keywords: ['hindi', 'devanagari', 'fonts', 'hind', 'transliteration', 'regional', 'language'],
  },
  {
    id: 'kb-008',
    category: 'Hardware & Printers',
    title: 'Epson L805 & L850 PVC Tray Printing Workflow',
    summary: 'Step-by-step driver setup for 2-up or single PVC card trays on Epson photo printers.',
    content:
      '1. Place card tray in Epson L805 guide slot until arrows align. 2. In printer preferences, set Media Type to "CD/DVD" or "PVC Card". 3. In browser print window, select "Actual Size" (100%). 4. Margin: "None". 5. Quality: "High". 6. Color Management: "Vivid". Never apply browser zoom or page margins.',
    keywords: ['epson', 'l805', 'l850', 'driver', 'cd/dvd', 'pvc card', 'tray'],
  },
  {
    id: 'kb-009',
    category: 'Hardware & Printers',
    title: 'Canon G-Series (G1010, G2010, G3010) Card Tray Calibration',
    summary: 'Configuration guidelines for Canon MegaTank PVC card tray attachments.',
    content:
      'Canon G-Series requires manual tray insert calibration: 1. Install manufacturer-provided card tray guide. 2. Paper size: Select "Custom ID Card" or "Credit Card (CR80)". 3. Set Margins to zero. 4. Always run a plain card test print before inserting magnetic stripe or smart chip PVC blanks.',
    keywords: ['canon', 'g1010', 'g2010', 'g3010', 'megatank', 'tray', 'margins'],
  },
  {
    id: 'kb-010',
    category: 'Security & Access',
    title: 'Operator Account Suspension & Unblock Policy',
    summary: 'Guidelines for handling suspended accounts and fraud investigation escalations.',
    content:
      'Accounts can only be suspended by an Administrator with a recorded administrative note. If an operator contacts support regarding account suspension: 1. Do not immediately unblock. 2. Check the recorded reason in Support > Operators. 3. If suspended for payment dispute or duplicate UTR, collect operator bank statement. 4. Escalate ticket to Admin with tag #AccountReview.',
    keywords: ['suspended', 'unblock', 'security', 'fraud', 'investigation', 'policy'],
  },
];

export default function SupportKnowledgeBasePage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>('kb-001');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(EXTENDED_ARTICLES.map((a) => a.category)))];

  const filteredArticles = EXTENDED_ARTICLES.filter((a) => {
    const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.keywords.some((k) => k.includes(q));
    return matchesCat && matchesSearch;
  });

  const handleCopySnippet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Internal Support Knowledge Base
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Standard operating procedures, hardware calibration guides, and customer communication references.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles, keywords (e.g. UTR, Epson, reprint)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Accordion List */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-16 text-center text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm text-slate-400">No articles match your search criteria.</p>
          </div>
        ) : (
          filteredArticles.map((art) => {
            const isExpanded = expandedId === art.id;
            const isCopied = copiedId === art.id;

            return (
              <div
                key={art.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden transition-colors hover:border-slate-700"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : art.id)}
                  className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-mono uppercase">
                        {art.category}
                      </span>
                      <span className="font-mono text-slate-500 text-[11px]">{art.id}</span>
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">{art.title}</h3>
                    <p className="text-xs text-slate-400">{art.summary}</p>
                  </div>

                  <div className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-900/30 space-y-4 animate-in fade-in duration-150">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                      {art.content}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {art.keywords.map((k) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-400"
                          >
                            #{k}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleCopySnippet(art.id, art.content)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {isCopied ? 'Copied Content!' : 'Copy to Ticket Reply'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
