'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentType } from '@/types/cards';
import { Search, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface HeroLookupFormProps {
  docType: DocumentType;
  placeholder: string;
  exampleId: string;
  fee: number;
}

export default function HeroLookupForm({
  docType,
  placeholder,
  exampleId,
  fee,
}: HeroLookupFormProps) {
  const router = useRouter();
  const [lookupValue, setLookupValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupValue.trim()) return;

    setIsSubmitting(true);
    const targetUrl = `/studio?type=${docType}&lookup=${encodeURIComponent(
      lookupValue.trim().toUpperCase()
    )}`;
    router.push(targetUrl);
  };

  const handleUseExample = () => {
    setLookupValue(exampleId);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-3"
      toolname="hero_document_lookup"
      tooldescription={`Lookup official ${docType.toUpperCase()} document and open interactive split-screen studio for CR80 PVC formatting`}
      toolautosubmit="true"
    >
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 shadow-inner focus-within:border-[#E63946] focus-within:ring-2 focus-within:ring-[#E63946]/20 transition-all">
        <div className="flex items-center pl-3 pr-2 text-slate-400">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          name="documentIdentifier"
          id={`lookup-${docType}`}
          toolparamdescription={`Official alphanumeric identification number for ${docType.toUpperCase()} card`}
          value={lookupValue}
          onChange={(e) => setLookupValue(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder-slate-500 text-sm font-medium focus:outline-none py-2.5 px-1 uppercase tracking-wider"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting || !lookupValue.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#8B1E2D] to-[#E63946] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shrink-0 cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Opening...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-current text-[#F4D35E]" />
              <span>1-Click Format</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </div>

      {/* Helper text & Example filler */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 px-1 gap-2">
        <div className="flex items-center gap-1.5">
          <span>Try sample:</span>
          <button
            type="button"
            onClick={handleUseExample}
            className="text-[#F4D35E] hover:underline font-mono font-medium transition-colors cursor-pointer"
          >
            {exampleId}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-medium">Standard Fee: ₹{fee}</span>
          <a
            href={`/studio?type=${docType}`}
            className="text-slate-400 hover:text-white transition-colors underline underline-offset-2"
          >
            Manual Entry Studio
          </a>
        </div>
      </div>
    </form>
  );
}
