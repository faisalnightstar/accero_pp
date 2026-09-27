'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Car,
  RotateCcw,
} from 'lucide-react';
import StudioLayout from '@/components/studio/StudioLayout';
import CardForm from '@/components/studio/CardForm';
import MissingFieldBanner from '@/components/studio/MissingFieldBanner';
import Cr80CardContainer from '@/components/cards/Cr80CardContainer';
import PrintControls from '@/components/cards/PrintControls';
import PanCardCanvas from '@/components/cards/PanCardCanvas';
import VoterCardCanvas from '@/components/cards/VoterCardCanvas';
import AadhaarCardCanvas from '@/components/cards/AadhaarCardCanvas';
import DlCardCanvas from '@/components/cards/DlCardCanvas';
import RcCardCanvas from '@/components/cards/RcCardCanvas';
import { useCardStudio } from '@/hooks/useCardStudio';
import { analyzeDocumentCompleteness } from '@/lib/missingFields';
import { DocumentType } from '@/types/cards';

export default function StudioPage() {
  const { docType, cardData, updateField, switchDocType, resetToOriginal } = useCardStudio('pan');
  const [zoom, setZoom] = useState<number>(1.5);
  const [showGuides, setShowGuides] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'both' | 'flip'>('both');

  // Analyze completeness dynamically on every state change
  const completeness = useMemo(() => {
    return analyzeDocumentCompleteness(docType, cardData);
  }, [docType, cardData]);

  // Jump to specific input field
  const handleJumpToField = (key: string) => {
    const inputEl = document.getElementById(`input-${key}`);
    if (inputEl) {
      inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inputEl.focus();
    }
  };

  // Render front and back for the selected card tab
  let cardFront: React.ReactNode;
  let cardBack: React.ReactNode;

  if (docType === 'pan') {
    cardFront = <PanCardCanvas data={cardData} side="front" />;
    cardBack = <PanCardCanvas data={cardData} side="back" />;
  } else if (docType === 'voter') {
    cardFront = <VoterCardCanvas data={cardData} side="front" />;
    cardBack = <VoterCardCanvas data={cardData} side="back" />;
  } else if (docType === 'aadhaar') {
    cardFront = <AadhaarCardCanvas data={cardData} side="front" />;
    cardBack = <AadhaarCardCanvas data={cardData} side="back" />;
  } else if (docType === 'dl') {
    cardFront = <DlCardCanvas data={cardData} side="front" />;
    cardBack = <DlCardCanvas data={cardData} side="back" />;
  } else if (docType === 'rc') {
    cardFront = <RcCardCanvas data={cardData} side="front" />;
    cardBack = <RcCardCanvas data={cardData} side="back" />;
  }

  // Studio Header Component
  const studioHeader = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg text-gray-500 hover:text-navy hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-navy flex items-center gap-2">
              Interactive Card Studio
              <span className="bg-crimson/10 text-crimson border border-crimson/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Zero Missing-Data Engine
              </span>
            </h1>
            <p className="text-xs text-gray-500">
              Audit, Complete, and Edit Missing Fields in Real-Time on Live Canvases
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetToOriginal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-navy border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            title="Reset form fields to initial data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
            <span>Reset Data</span>
          </button>

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-gray-600 hover:text-navy px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Document Type Tabs */}
      <div className="flex items-center gap-1 border-t border-gray-100 pt-2 overflow-x-auto">
        {(
          [
            { id: 'pan', label: 'PAN Card', icon: CreditCard },
            { id: 'aadhaar', label: 'Aadhaar Card', icon: ShieldCheck },
            { id: 'voter', label: 'Voter ID', icon: CheckCircle2 },
            { id: 'dl', label: 'Driving License', icon: CreditCard },
            { id: 'rc', label: 'Vehicle RC', icon: Car },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const isActive = docType === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => switchDocType(item.id as DocumentType)}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 ${
                isActive
                  ? 'bg-burgundy text-white shadow-xs'
                  : 'text-gray-600 hover:text-navy hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <StudioLayout
      header={studioHeader}
      controls={
        <PrintControls
          zoom={zoom}
          onZoomChange={setZoom}
          showGuides={showGuides}
          onToggleGuides={() => setShowGuides(!showGuides)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      }
      form={
        <div className="space-y-4">
          <MissingFieldBanner
            completeness={completeness}
            onJumpToField={handleJumpToField}
          />

          <CardForm
            docType={docType}
            data={cardData}
            onFieldChange={updateField}
            missingKeys={completeness.missingKeys}
          />
        </div>
      }
      preview={
        <Cr80CardContainer
          front={cardFront}
          back={cardBack}
          activeSide={viewMode}
          zoom={zoom}
          showGuides={showGuides}
        />
      }
    />
  );
}
