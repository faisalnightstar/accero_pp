'use client';

import React, { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Car,
  RotateCcw,
  Save,
  FilePlus,
  Loader2,
  Printer,
  ExternalLink,
  Check,
  AlertTriangle,
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

function StudioPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlDocId = searchParams.get('id');
  const urlDocType = searchParams.get('type') as DocumentType | null;

  const validTypes: DocumentType[] = ['pan', 'aadhaar', 'voter', 'dl', 'rc'];
  const resolvedType: DocumentType = urlDocType && validTypes.includes(urlDocType) ? urlDocType : 'pan';

  const {
    docType,
    cardData,
    updateField,
    switchDocType,
    resetToOriginal,
    resetToBlank,
    loadData,
  } = useCardStudio(resolvedType);

  const [currentDocId, setCurrentDocId] = useState<string | null>(urlDocId);
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<{
    show: boolean;
    docId: string;
    identifier: string;
  } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [zoom, setZoom] = useState<number>(1.5);
  const [showGuides, setShowGuides] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'both' | 'flip'>('both');

  // Load existing document if id in query params
  useEffect(() => {
    if (!urlDocId) return;

    let isMounted = true;
    setIsLoadingDoc(true);

    fetch(`/api/documents/${urlDocId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load document');
        return res.json();
      })
      .then((payload) => {
        if (isMounted && payload.success && payload.document) {
          const doc = payload.document;
          loadData(doc.docType as DocumentType, doc.data);
          setCurrentDocId(doc.id);
        }
      })
      .catch((err) => {
        console.error('Document load error:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDoc(false);
      });

    return () => {
      isMounted = false;
    };
  }, [urlDocId, loadData]);

  // Switch type if urlDocType query param changes and not loading by ID
  useEffect(() => {
    if (urlDocType && !urlDocId && urlDocType !== docType) {
      switchDocType(urlDocType);
    }
  }, [urlDocType, urlDocId, docType, switchDocType]);

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

  // Switch to blank manual template
  const handleNewBlank = () => {
    resetToBlank();
    setCurrentDocId(null);
    setSaveSuccess(null);
    setSaveError(null);
  };

  // Handle Save Document to MongoDB
  const handleSaveDocument = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      const payload = {
        id: currentDocId || undefined,
        docType,
        inputMode: currentDocId ? 'MANUAL' : 'API',
        data: cardData,
        missingFields: completeness.missingKeys,
        isComplete: completeness.isPrintReady,
      };

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Please sign in to save documents to your account.');
        }
        throw new Error(result.error || 'Failed to save document');
      }

      setCurrentDocId(result.docId);
      setSaveSuccess({
        show: true,
        docId: result.docId,
        identifier: result.record?.cardIdentifier || 'Document',
      });
    } catch (err: any) {
      setSaveError(err.message || 'Error saving document.');
    } finally {
      setIsSaving(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              {currentDocId && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Saved Record
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-500">
              Audit, Complete, and Edit Missing Fields in Real-Time on Live Canvases
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleNewBlank}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:text-navy border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            title="Clear all fields for manual data entry"
          >
            <FilePlus className="w-3.5 h-3.5 text-steel-blue" />
            <span>New Blank</span>
          </button>

          <button
            type="button"
            onClick={resetToOriginal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-navy border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            title="Reset form fields to initial data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
            <span>Reset Mock</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDocument}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg bg-burgundy hover:bg-burgundy/90 shadow-sm transition-all disabled:opacity-50"
            title="Save card record to MongoDB"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Saving...' : currentDocId ? 'Update Record' : 'Save Document'}</span>
          </button>

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-gray-600 hover:text-navy px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Save Error Alert */}
      {saveError && (
        <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{saveError}</span>
          </div>
          <button
            onClick={() => setSaveError(null)}
            className="text-red-500 hover:text-red-800 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

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
              onClick={() => {
                switchDocType(item.id as DocumentType);
                setCurrentDocId(null);
                setSaveSuccess(null);
              }}
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
    <>
      {isLoadingDoc && (
        <div className="fixed inset-0 z-50 bg-navy/20 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-burgundy animate-spin" />
            <span className="text-xs font-semibold text-navy">Loading saved card data...</span>
          </div>
        </div>
      )}

      {/* Save Success Confirmation Modal */}
      {saveSuccess?.show && (
        <div className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">Document Saved to MongoDB</h3>
                <p className="text-xs text-gray-500">
                  Card identifier: <span className="font-semibold text-navy">{saveSuccess.identifier}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
              The card data and missing field status have been securely persisted. You can print the CR80 card immediately, keep editing in the studio, or return to your operator dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSaveSuccess(null)}
                className="flex-1 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Stay in Studio
              </button>

              <button
                type="button"
                onClick={() => {
                  setSaveSuccess(null);
                  window.print();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-steel-blue hover:bg-steel-blue/90 rounded-xl transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-navy hover:bg-navy/90 rounded-xl transition-colors"
              >
                <span>Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="w-6 h-6 text-burgundy animate-spin" />
            <span className="font-semibold text-sm text-navy">Initializing Card Studio...</span>
          </div>
        </div>
      }
    >
      <StudioPageContent />
    </Suspense>
  );
}
