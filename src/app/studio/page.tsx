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
import { StudioSearchBar } from '@/components/studio/StudioSearchBar';
import { verifyDocument } from '@/actions/verify';
import { authorizePrintAction } from '@/actions/print';
import { useCardStudio } from '@/hooks/useCardStudio';
import { analyzeDocumentCompleteness } from '@/lib/missingFields';
import { DocumentType } from '@/types/cards';
import InsufficientBalanceModal from '@/components/wallet/InsufficientBalanceModal';
import RechargeModal from '@/components/wallet/RechargeModal';

function StudioPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlDocId = searchParams.get('id');
  const urlDocType = searchParams.get('type') as DocumentType | null;
  const urlLookup = searchParams.get('lookup');

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
    isDirty,
  } = useCardStudio(resolvedType);

  const [currentDocId, setCurrentDocId] = useState<string | null>(urlDocId);
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);
  const [toastAlert, setToastAlert] = useState<{ message: string; type: 'info' | 'warning' | 'error' | 'success' } | null>(null);
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
  const [insufficientBalanceInfo, setInsufficientBalanceInfo] = useState<{
    requiredFee: number;
    currentBalance: number;
    serviceName?: string;
  } | null>(null);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

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

  const lastUrlTypeRef = React.useRef<string | null>(urlDocType);

  // Switch type if urlDocType query param changes externally (e.g. browser back/forward or navigation)
  useEffect(() => {
    if (urlDocType && validTypes.includes(urlDocType) && !urlDocId) {
      if (urlDocType !== lastUrlTypeRef.current) {
        lastUrlTypeRef.current = urlDocType;
        switchDocType(urlDocType);
      }
    }
  }, [urlDocType, urlDocId, switchDocType]);

  // Handle explicit tab switching
  const handleTabChange = useCallback(
    (newType: DocumentType) => {
      lastUrlTypeRef.current = newType;
      switchDocType(newType);
      setCurrentDocId(null);
      setSaveSuccess(null);
      // Synchronize URL search params so browser address matches active tab
      const params = new URLSearchParams(searchParams.toString());
      params.set('type', newType);
      params.delete('id');
      params.delete('lookup');
      router.replace(`/studio?${params.toString()}`, { scroll: false });
    },
    [switchDocType, searchParams, router]
  );

  // Handle auto-lookup from query params (e.g. redirected from Dashboard modal)
  useEffect(() => {
    if (!urlLookup || urlDocId) return;

    let isMounted = true;
    setIsLoadingDoc(true);

    verifyDocument(resolvedType, urlLookup)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          loadData(resolvedType, res.data);
          if (res.isPartial) {
            setToastAlert({
              message: 'Partial record retrieved — please complete the missing fields highlighted in amber.',
              type: 'warning',
            });
          } else {
            setToastAlert({
              message: `Retrieved record for ${urlLookup} via ${res.provider || 'Gateway'}.`,
              type: 'success',
            });
          }
        }
      })
      .catch((err) => {
        console.error('Auto lookup error:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDoc(false);
      });

    return () => {
      isMounted = false;
    };
  }, [urlLookup, urlDocId, resolvedType, loadData]);

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
        if (res.status === 402) {
          setInsufficientBalanceInfo({
            requiredFee: result.requiredFee || 5,
            currentBalance: result.currentBalance || 0,
            serviceName: 'Manual Document Creation',
          });
          throw new Error(
            result.message || 'Insufficient wallet balance. Manual card creation requires ₹5.'
          );
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

  const [isAuthorizingPrint, setIsAuthorizingPrint] = useState(false);

  const resolveCurrentIdentifier = (): string => {
    if (!cardData) return 'CARD';
    if (docType === 'pan') return (cardData.panNumber || '').trim().toUpperCase() || 'PAN';
    if (docType === 'aadhaar') return (cardData.aadhaarNumber || '').trim().replace(/[\s-]+/g, '') || 'AADHAAR';
    if (docType === 'voter') return (cardData.epicNumber || '').trim().toUpperCase() || 'VOTER';
    if (docType === 'dl') return (cardData.dlNumber || '').trim().toUpperCase() || 'DL';
    if (docType === 'rc') return (cardData.registrationNumber || '').trim().toUpperCase() || 'RC';
    if (docType === 'ration') return (cardData.rationCardNumber || '').trim().toUpperCase() || 'RATION';
    return 'CARD';
  };

  // Centralized Print Authorization & Wallet Deduction
  const handleTriggerPrint = async () => {
    try {
      setIsAuthorizingPrint(true);
      const identifier = resolveCurrentIdentifier();
      const printJobId = `pj_${crypto.randomUUID()}`;

      const res = await authorizePrintAction({
        documentType: docType,
        cardIdentifier: identifier,
        documentId: currentDocId || undefined,
        printJobId,
        printFormat: 'CR80',
      });

      if (!res.success) {
        if (res.error?.code === 'INSUFFICIENT_BALANCE') {
          setInsufficientBalanceInfo({
            requiredFee: res.requiredFee || 20,
            currentBalance: res.currentBalance || 0,
            serviceName: `${docType.toUpperCase()} Card Printing`,
          });
        } else {
          setToastAlert({
            message: res.error?.message || 'Print authorization failed.',
            type: 'error',
          });
        }
        return;
      }

      setToastAlert({
        message: `Print authorized! ₹${res.fee} deducted. Remaining balance: ₹${res.remainingBalance}.`,
        type: 'success',
      });

      // Execute browser print
      window.print();
    } catch (err: any) {
      setToastAlert({
        message: err.message || 'Error executing print.',
        type: 'error',
      });
    } finally {
      setIsAuthorizingPrint(false);
    }
  };

  // Render front and back for the selected card tab
  let cardFront: React.ReactNode;
  let cardBack: React.ReactNode;

  if (docType === 'pan') {
    cardFront = (
      <PanCardCanvas
        data={cardData}
        side="front"
        variant={cardData.templateVariant}
      />
    );
    cardBack = (
      <PanCardCanvas
        data={cardData}
        side="back"
        variant={cardData.templateVariant}
      />
    );
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
    cardFront = (
      <RcCardCanvas
        data={cardData}
        side="front"
        variant={cardData.templateVariant}
      />
    );
    cardBack = (
      <RcCardCanvas
        data={cardData}
        side="back"
        variant={cardData.templateVariant}
      />
    );
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
            style={{ backgroundColor: '#8B1E2D', color: '#ffffff' }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg bg-burgundy hover:bg-[#721925] shadow-sm transition-all disabled:opacity-50"
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
              onClick={() => handleTabChange(item.id as DocumentType)}
              style={
                isActive
                  ? { backgroundColor: '#8B1E2D', color: '#ffffff' }
                  : undefined
              }
              className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 ${isActive
                  ? 'bg-burgundy text-white shadow-sm'
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
        <div className="no-print fixed inset-0 z-50 bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4">
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
                  handleTriggerPrint();
                }}
                disabled={isAuthorizingPrint}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-steel-blue hover:bg-steel-blue/90 rounded-xl transition-colors disabled:opacity-50"
              >
                {isAuthorizingPrint ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Printer className="w-3.5 h-3.5" />
                )}
                <span>{isAuthorizingPrint ? 'Authorizing...' : 'Print Card'}</span>
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
            onPrint={handleTriggerPrint}
            isPrinting={isAuthorizingPrint}
          />
        }
        form={
          <div className="space-y-4">
            <StudioSearchBar
              docType={docType}
              isDirty={isDirty}
              onDataLoaded={(data) => {
                loadData(docType, data);
                setCurrentDocId(null);
                setSaveSuccess(null);
              }}
              onToast={(msg, type) => {
                setToastAlert({ message: msg, type });
                setTimeout(() => setToastAlert(null), 5000);
              }}
            />

            {toastAlert && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between border shadow-xs animate-in fade-in duration-150 ${toastAlert.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : toastAlert.type === 'error'
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}
              >
                <span>{toastAlert.message}</span>
                <button
                  type="button"
                  onClick={() => setToastAlert(null)}
                  className="ml-2 font-bold opacity-75 hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            )}

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
          cardData.layoutFormat === 'sheet' && (docType === 'pan' || docType === 'voter' || docType === 'aadhaar' || docType === 'rc') ? (
            <div className="flex flex-col items-center gap-4">
              <div className="no-print w-full flex flex-col items-center">
                <span className="text-xs font-semibold tracking-wider uppercase text-gray-500 mb-2">
                  {docType === 'pan'
                    ? 'Side-by-Side Foldable Sheet (Legacy pan.php Layout)'
                    : docType === 'voter'
                    ? 'Full Official e-EPIC A4 Document Sheet'
                    : docType === 'rc'
                    ? 'Side-by-Side Vehicle RC Print Sheet'
                    : 'Aadhaar PVC Print Sheet'}
                </span>
                <div
                  className={`shadow-2xl border border-gray-200 bg-white relative transition-all duration-200 select-none overflow-hidden rounded-md max-w-full ${
                    docType === 'voter' || (docType === 'aadhaar' && cardData.layoutFormat === 'sheet')
                      ? 'aspect-[2480/3508]'
                      : docType === 'rc'
                      ? 'aspect-[2060/670]'
                      : 'aspect-[1280/386]'
                  }`}
                  style={{
                    width:
                      docType === 'voter' || (docType === 'aadhaar' && cardData.layoutFormat === 'sheet')
                        ? `${450 * zoom}px`
                        : `${648 * zoom}px`,
                  }}
                >
                  {docType === 'pan' && (
                    <PanCardCanvas
                      data={cardData}
                      side="sheet"
                      variant={cardData.templateVariant}
                    />
                  )}
                  {docType === 'voter' && (
                    <VoterCardCanvas
                      data={cardData}
                      side="sheet"
                    />
                  )}
                  {docType === 'aadhaar' && (
                    <AadhaarCardCanvas
                      data={cardData}
                      side="sheet"
                    />
                  )}
                  {docType === 'rc' && (
                    <RcCardCanvas
                      data={cardData}
                      side="sheet"
                      variant={cardData.templateVariant}
                    />
                  )}
                </div>
              </div>
              {/* Print Mode for Sheet */}
              <div className="hidden print:block w-full">
                {docType === 'voter' || (docType === 'aadhaar' && cardData.layoutFormat === 'sheet') ? (
                  <div className="w-[210mm] h-[297mm] relative overflow-hidden bg-white mx-auto">
                    {docType === 'voter' ? (
                      <VoterCardCanvas data={cardData} side="sheet" />
                    ) : (
                      <AadhaarCardCanvas data={cardData} side="sheet" />
                    )}
                  </div>
                ) : (
                  <div className="w-[171.2mm] h-[53.98mm] relative overflow-hidden bg-white mx-auto">
                    {docType === 'pan' && (
                      <PanCardCanvas
                        data={cardData}
                        side="sheet"
                        variant={cardData.templateVariant}
                      />
                    )}
                    {docType === 'aadhaar' && (
                      <AadhaarCardCanvas
                        data={cardData}
                        side="sheet"
                      />
                    )}
                    {docType === 'rc' && (
                      <RcCardCanvas
                        data={cardData}
                        side="sheet"
                        variant={cardData.templateVariant}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Cr80CardContainer
              front={cardFront}
              back={cardBack}
              activeSide={viewMode}
              zoom={zoom}
              showGuides={showGuides}
              orientation={
                docType === 'voter'
                  ? (cardData.templateVariant === 'assam' || cardData.templateVariant === 'legacy' ? 'portrait' : 'landscape')
                  : 'landscape'
              }
            />
          )
        }
      />

      {/* Insufficient Balance Dialog for Manual Saves */}
      {insufficientBalanceInfo && (
        <InsufficientBalanceModal
          isOpen={Boolean(insufficientBalanceInfo)}
          onClose={() => setInsufficientBalanceInfo(null)}
          onOpenRecharge={() => {
            setInsufficientBalanceInfo(null);
            setIsRechargeModalOpen(true);
          }}
          requiredFee={insufficientBalanceInfo.requiredFee}
          currentBalance={insufficientBalanceInfo.currentBalance}
          serviceName={insufficientBalanceInfo.serviceName || 'Document Generation'}
        />
      )}

      {/* Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        suggestedAmount={100}
        onSuccess={() => {
          setIsRechargeModalOpen(false);
          setToastAlert({
            message: 'Wallet topped up successfully! You can now save your card.',
            type: 'success',
          });
        }}
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
