'use client';

import React, { useState } from 'react';
import { DocumentType } from '@/types/cards';
import Cr80CardContainer from '@/components/cards/Cr80CardContainer';
import PanCardCanvas from '@/components/cards/PanCardCanvas';
import AadhaarCardCanvas from '@/components/cards/AadhaarCardCanvas';
import VoterCardCanvas from '@/components/cards/VoterCardCanvas';
import DlCardCanvas from '@/components/cards/DlCardCanvas';
import RcCardCanvas from '@/components/cards/RcCardCanvas';
import { RotateCw, CheckCircle2, Shield, Eye } from 'lucide-react';

interface HeroCardPreviewProps {
  docType: DocumentType;
  sampleData: Record<string, any>;
  className?: string;
}

export default function HeroCardPreview({
  docType,
  sampleData,
  className = '',
}: HeroCardPreviewProps) {
  const [activeSide, setActiveSide] = useState<'flip' | 'both'>('flip');

  const renderCanvas = (side: 'front' | 'back') => {
    switch (docType) {
      case 'pan':
        return <PanCardCanvas data={sampleData as any} side={side} />;
      case 'aadhaar':
        return <AadhaarCardCanvas data={sampleData as any} side={side} />;
      case 'voter':
        return <VoterCardCanvas data={sampleData as any} side={side} />;
      case 'dl':
        return <DlCardCanvas data={sampleData as any} side={side} />;
      case 'rc':
        return <RcCardCanvas data={sampleData as any} side={side} />;
      default:
        return <div className="p-4 text-center">Preview Unavailable</div>;
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Dimension & Specification Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300">
          <Shield className="w-3 h-3 text-[#F4D35E]" />
          ISO/IEC 7810 ID-1 Standard (85.60 × 53.98 mm)
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-emerald-400">
          <CheckCircle2 className="w-3 h-3" />
          300+ DPI Vector Ready
        </span>
      </div>

      {/* Card Container */}
      <div className="p-3 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl relative">
        <Cr80CardContainer
          front={renderCanvas('front')}
          back={renderCanvas('back')}
          activeSide={activeSide}
          zoom={1.15}
          className="transition-all duration-300"
        />

        {/* View Mode Toggle */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 w-full px-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Eye className="w-3.5 h-3.5 text-[#F4D35E]" />
            <span>Interactive Live Canvas</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveSide('flip')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeSide === 'flip'
                  ? 'bg-[#8B1E2D] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Flip Mode
            </button>
            <button
              type="button"
              onClick={() => setActiveSide('both')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeSide === 'both'
                  ? 'bg-[#8B1E2D] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Side-by-Side
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
