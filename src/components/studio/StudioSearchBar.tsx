'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, AlertCircle, CheckCircle2, Tag } from 'lucide-react';
import { DocumentType } from '@/types/cards';
import { verifyDocument, getServicePricingAction } from '@/actions/verify';
import { validateEpicNumber } from '@/lib/verify/validators';
import { OverwriteConfirmModal } from './OverwriteConfirmModal';
import InsufficientBalanceModal from '@/components/wallet/InsufficientBalanceModal';
import RechargeModal from '@/components/wallet/RechargeModal';
import { SERVICE_FEES } from '@/lib/wallet/constants';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events';

interface StudioSearchBarProps {
  docType: DocumentType;
  isDirty?: boolean;
  onDataLoaded: (data: any, meta?: { docId?: string }) => void;
  onToast?: (message: string, type: 'info' | 'warning' | 'error' | 'success') => void;
}

const placeholders: Record<DocumentType, string> = {
  pan: 'Enter 10-digit PAN (e.g. ABCDE1234F)',
  voter: 'Enter EPIC Voter ID (e.g. IFV1949684)',
  dl: 'Enter Driving License No (e.g. DL-0420110123456)',
  rc: 'Enter Vehicle RC Reg No (e.g. UP05LD1234)',
  aadhaar: 'Enter 12-digit Aadhaar Number',
  ration: 'Enter Ration Card Number (e.g. RC1234567890)',
};

const serviceNames: Record<DocumentType, string> = {
  pan: 'PAN Card Verification',
  voter: 'Voter ID (EPIC) Verification',
  dl: 'Driving License Verification',
  rc: 'Vehicle RC Verification',
  aadhaar: 'Aadhaar Verification',
  ration: 'Ration Card Verification',
};

export function StudioSearchBar({
  docType,
  isDirty = false,
  onDataLoaded,
  onToast,
}: StudioSearchBarProps) {
  const [queryId, setQueryId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [configuredFee, setConfiguredFee] = useState<number>(
    SERVICE_FEES[docType.toUpperCase()] || 20
  );
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'error' | 'warning' | 'success';
  } | null>(null);
  const [providerInfo, setProviderInfo] = useState<{ name?: string; latency?: number } | null>(
    null
  );
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);
  const activeRequestIdRef = useRef<string | null>(null);

  // Insufficient Balance & Recharge Modals
  const [insufficientBalanceInfo, setInsufficientBalanceInfo] = useState<{
    requiredFee: number;
    currentBalance: number;
  } | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  useEffect(() => {
    const fallbackFee = SERVICE_FEES[docType.toUpperCase()] || 20;
    setConfiguredFee(fallbackFee);

    let active = true;
    getServicePricingAction(docType)
      .then((pricing) => {
        if (active && typeof pricing?.fee === 'number') {
          setConfiguredFee(pricing.fee);
        }
      })
      .catch(() => {
        // Keep static fallback fee if pricing fetch fails
      });

    return () => {
      active = false;
    };
  }, [docType]);

  const feeAmount = configuredFee;

  const handleFetch = async () => {
    if (isLoading) return;

    const trimmed = queryId.trim().toUpperCase();
    if (!trimmed) {
      setStatusMessage({ text: 'Please enter a document number.', type: 'error' });
      return;
    }

    if (docType === 'voter') {
      const epicCheck = validateEpicNumber(trimmed);
      if (!epicCheck.valid) {
        setStatusMessage({
          text: epicCheck.errorMessage || 'Please enter a valid Voter EPIC number.',
          type: 'error',
        });
        return;
      }
    }

    activeRequestIdRef.current = `vr_${crypto.randomUUID()}`;

    if (isDirty) {
      setShowOverwriteModal(true);
      return;
    }

    await performLookup(trimmed);
  };

  const performLookup = async (id: string) => {
    setIsLoading(true);
    setStatusMessage(null);
    setProviderInfo(null);

    const requestId = activeRequestIdRef.current || `vr_${crypto.randomUUID()}`;

    try {
      const result = await verifyDocument(docType, id, requestId);

      if (
        result.errorMessage === 'INSUFFICIENT_BALANCE' ||
        result.errorCode === 'INSUFFICIENT_BALANCE'
      ) {
        trackEvent(ANALYTICS_EVENTS.LOOKUP_FAILED, {
          docType: docType.toUpperCase(),
          errorType: 'INSUFFICIENT_BALANCE',
          isManual: false,
        });
        const required = result.requiredFee ?? feeAmount;
        const balance = result.currentBalance ?? 0;
        setInsufficientBalanceInfo({
          requiredFee: required,
          currentBalance: balance,
        });
        const errMsg = `Insufficient wallet balance. This lookup requires ₹${required}.`;
        setStatusMessage({ text: errMsg, type: 'error' });
        if (onToast) onToast(errMsg, 'error');
        return;
      }

      if (result.success && result.data && Object.keys(result.data).length > 0) {
        onDataLoaded(result.data, { docId: result.docId });
        trackEvent(ANALYTICS_EVENTS.FIRST_LOOKUP_SUCCESS, { docCategory: docType });

        const providerLabel =
          docType === 'voter'
            ? result.isFreeReprint && !result.providerVersion
              ? 'Saved Record'
              : result.providerVersion === 'v2'
                ? 'NeoAPI V2 (Fallback)'
                : result.providerVersion === 'v1'
                  ? 'NeoAPI V1'
                  : result.provider || 'NeoAPI'
            : result.provider;

        setProviderInfo({ name: providerLabel, latency: result.latencyMs });

        if (typeof result.currentBalance === 'number' && typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('wallet-updated', { detail: result.currentBalance })
          );
        }

        if (docType === 'voter') {
          const isCachedOrPaid = result.isFreeReprint || result.feeDeducted === 0;
          const feeNotice = isCachedOrPaid
            ? ' (₹0 — Already paid / Free reprint)'
            : ` (₹${result.feeDeducted ?? feeAmount} debited)`;

          let sourceLabel = `Voter record verified via ${result.provider || 'NeoAPI'}`;
          if (isCachedOrPaid && !result.providerVersion) {
            sourceLabel = 'Saved Voter record loaded from your account';
          } else if (result.fallbackUsed && result.providerVersion === 'v2') {
            sourceLabel = 'Voter record verified via API';
          } else if (result.providerVersion === 'v1') {
            sourceLabel = 'Voter record verified via API';
          }

          if (result.isPartial) {
            const msg = `${sourceLabel} — missing fields highlighted for completion.${feeNotice}`;
            setStatusMessage({ text: msg, type: 'warning' });
            if (onToast) onToast(msg, 'warning');
          } else {
            const successMsg = `${sourceLabel}.${feeNotice}`;
            setStatusMessage({ text: successMsg, type: 'success' });
            if (onToast) onToast(successMsg, 'success');
          }
        } else {
          const feeNotice =
            result.isFreeReprint || result.feeDeducted === 0
              ? ' (Free re-print)'
              : ` (₹${result.feeDeducted || feeAmount} debited)`;

          if (result.isPartial) {
            const msg = `Partial record found — missing fields highlighted for manual completion.${feeNotice}`;
            setStatusMessage({ text: msg, type: 'warning' });
            if (onToast) onToast(msg, 'warning');
          } else {
            const successMsg = `Successfully verified via ${result.provider || 'Gateway'}.${feeNotice}`;
            setStatusMessage({ text: successMsg, type: 'success' });
            if (onToast) onToast(successMsg, 'success');
          }
        }
      } else {
        const errMsg = result.errorMessage || 'No record found. (₹0 charged)';
        trackEvent(ANALYTICS_EVENTS.LOOKUP_FAILED, {
          docType: docType.toUpperCase(),
          errorType: result.errorCode || result.errorMessage || 'NOT_FOUND',
          isManual: false,
        });
        setStatusMessage({ text: errMsg, type: 'error' });
        if (onToast) onToast(errMsg, 'error');
      }
    } catch (err: any) {
      trackEvent(ANALYTICS_EVENTS.LOOKUP_FAILED, {
        docType: docType.toUpperCase(),
        errorType: 'TIMEOUT_OR_NETWORK_ERROR',
        isManual: false,
      });
      const errMsg =
        err?.message || 'Verification request timed out. (₹0 charged). Switched to manual Studio entry.';
      setStatusMessage({ text: errMsg, type: 'warning' });
      if (onToast) onToast(errMsg, 'warning');
    } finally {
      setIsLoading(false);
      setShowOverwriteModal(false);
      activeRequestIdRef.current = null;
    }
  };

  return (
    <>
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-lg backdrop-blur-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant API Lookup</span>
            </div>
            {/* Service Fee Pill */}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-[#F4D35E] border border-slate-700">
              <Tag className="w-3 h-3" />
              Fee: ₹{feeAmount}
            </span>
          </div>

          {providerInfo?.name && (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
              {providerInfo.name} ({providerInfo.latency}ms)
            </span>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFetch();
          }}
          toolname="studio_document_lookup"
          tooldescription="Load official card record by number into interactive editor"
          toolautosubmit="true"
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="documentQueryNumber"
              id="studio-document-query"
              toolparamdescription={`Alphanumeric identification number for ${docType.toUpperCase()} document`}
              value={queryId}
              onChange={(e) => {
                setQueryId(e.target.value.toUpperCase());
                setStatusMessage(null);
              }}
              placeholder={placeholders[docType] || 'Enter document number...'}
              disabled={isLoading}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent font-mono disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !queryId.trim()}
            className="px-4 py-2 bg-gradient-to-r from-[#8B1E2D] to-[#E63946] hover:opacity-90 text-white font-semibold text-sm rounded-lg flex items-center gap-2 shadow transition-all disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{docType === 'voter' ? 'Verifying V1/V2...' : 'Searching...'}</span>
              </>
            ) : (
              <>
                <span>Lookup</span>
              </>
            )}
          </button>
        </form>

        {/* Status Message Notification */}
        {statusMessage && (
          <div
            className={`flex items-start gap-2 text-xs p-2.5 rounded-lg border ${statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : statusMessage.type === 'warning'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : statusMessage.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            )}
            <div className="flex-1 flex items-center justify-between">
              <span>{statusMessage.text}</span>
              {statusMessage.text.includes('Insufficient wallet balance') && (
                <button
                  type="button"
                  onClick={() => setShowRechargeModal(true)}
                  className="ml-2 font-bold underline hover:text-white"
                >
                  Top-up Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dirty Form Overwrite Confirmation Modal */}
      <OverwriteConfirmModal
        isOpen={showOverwriteModal}
        onConfirm={() => {
          setShowOverwriteModal(false);
          performLookup(queryId.trim().toUpperCase());
        }}
        onCancel={() => {
          activeRequestIdRef.current = null;
          setShowOverwriteModal(false);
        }}
      />

      {/* Insufficient Balance Dialog */}
      {insufficientBalanceInfo && (
        <InsufficientBalanceModal
          isOpen={Boolean(insufficientBalanceInfo)}
          onClose={() => setInsufficientBalanceInfo(null)}
          onOpenRecharge={() => {
            setInsufficientBalanceInfo(null);
            setShowRechargeModal(true);
          }}
          requiredFee={insufficientBalanceInfo.requiredFee}
          currentBalance={insufficientBalanceInfo.currentBalance}
          serviceName={serviceNames[docType]}
        />
      )}

      {/* Recharge Modal */}
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        suggestedAmount={
          insufficientBalanceInfo
            ? Math.max(100, insufficientBalanceInfo.requiredFee - insufficientBalanceInfo.currentBalance)
            : 100
        }
        onSuccess={() => {
          setShowRechargeModal(false);
          setStatusMessage({
            text: 'Wallet topped up successfully. You can now perform the lookup.',
            type: 'success',
          });
        }}
      />
    </>
  );
}
