'use client';

import React, { useState } from 'react';
import { Search, Loader2, Sparkles, AlertCircle, CheckCircle2, Wallet, Tag } from 'lucide-react';
import { DocumentType } from '@/types/cards';
import { verifyDocument } from '@/actions/verify';
import { OverwriteConfirmModal } from './OverwriteConfirmModal';
import InsufficientBalanceModal from '@/components/wallet/InsufficientBalanceModal';
import RechargeModal from '@/components/wallet/RechargeModal';
import { SERVICE_FEES } from '@/lib/wallet/constants';

interface StudioSearchBarProps {
  docType: DocumentType;
  isDirty?: boolean;
  onDataLoaded: (data: any) => void;
  onToast?: (message: string, type: 'info' | 'warning' | 'error' | 'success') => void;
}

const placeholders: Record<DocumentType, string> = {
  pan: 'Enter 10-digit PAN (e.g. ABCDE1234F)',
  voter: 'Enter EPIC Voter ID (e.g. AXH0801639)',
  dl: 'Enter Driving License No (e.g. DL-0420110123456)',
  rc: 'Enter Vehicle RC Reg No (e.g. UP16DL3137)',
  aadhaar: 'Enter 12-digit Aadhaar Number',
};

const serviceNames: Record<DocumentType, string> = {
  pan: 'PAN Card Verification',
  voter: 'Voter ID (EPIC) Verification',
  dl: 'Driving License Verification',
  rc: 'Vehicle RC Verification',
  aadhaar: 'Aadhaar Verification',
};

export function StudioSearchBar({
  docType,
  isDirty = false,
  onDataLoaded,
  onToast,
}: StudioSearchBarProps) {
  const [queryId, setQueryId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'error' | 'warning' | 'success';
  } | null>(null);
  const [providerInfo, setProviderInfo] = useState<{ name?: string; latency?: number } | null>(
    null
  );
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);

  // Insufficient Balance & Recharge Modals
  const [insufficientBalanceInfo, setInsufficientBalanceInfo] = useState<{
    requiredFee: number;
    currentBalance: number;
  } | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const feeAmount = SERVICE_FEES[docType.toUpperCase()] || 20;

  const handleFetch = async () => {
    const trimmed = queryId.trim().toUpperCase();
    if (!trimmed) {
      setStatusMessage({ text: 'Please enter a document number.', type: 'error' });
      return;
    }

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

    try {
      const result = await verifyDocument(docType, id);

      if (result.errorMessage === 'INSUFFICIENT_BALANCE') {
        setInsufficientBalanceInfo({
          requiredFee: result.requiredFee || feeAmount,
          currentBalance: result.currentBalance || 0,
        });
        const errMsg = `Insufficient wallet balance. This lookup requires ₹${
          result.requiredFee || feeAmount
        }.`;
        setStatusMessage({ text: errMsg, type: 'error' });
        if (onToast) onToast(errMsg, 'error');
        return;
      }

      if (result.success && result.data && Object.keys(result.data).length > 0) {
        onDataLoaded(result.data);
        setProviderInfo({ name: result.provider, latency: result.latencyMs });

        // Broadcast balance update if a fee was deducted
        if (typeof result.currentBalance === 'number' && typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('wallet-updated', { detail: result.currentBalance })
          );
        }

        const feeNotice =
          result.isFreeReprint || result.feeDeducted === 0
            ? ' (Free re-print)'
            : ` (₹${result.feeDeducted || feeAmount} debited)`;

        if (result.isPartial) {
          const msg = `Partial record found — missing fields highlighted for manual completion.${feeNotice}`;
          setStatusMessage({ text: msg, type: 'warning' });
          if (onToast) onToast(msg, 'warning');
        } else {
          const successMsg = `Successfully verified via ${
            result.provider || 'Gateway'
          }.${feeNotice}`;
          setStatusMessage({ text: successMsg, type: 'success' });
          if (onToast) onToast(successMsg, 'success');
        }
      } else {
        const errMsg = result.errorMessage || 'No record found. (₹0 charged)';
        setStatusMessage({ text: errMsg, type: 'error' });
        if (onToast) onToast(errMsg, 'error');
      }
    } catch (err: any) {
      const errMsg =
        err?.message || 'Verification request timed out. (₹0 charged). Switched to manual Studio entry.';
      setStatusMessage({ text: errMsg, type: 'warning' });
      if (onToast) onToast(errMsg, 'warning');
    } finally {
      setIsLoading(false);
      setShowOverwriteModal(false);
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

        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={queryId}
              onChange={(e) => {
                setQueryId(e.target.value.toUpperCase());
                setStatusMessage(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleFetch();
                }
              }}
              placeholder={placeholders[docType] || 'Enter document number...'}
              disabled={isLoading}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent font-mono disabled:opacity-50"
            />
          </div>

          <button
            type="button"
            disabled={isLoading || !queryId.trim()}
            onClick={handleFetch}
            className="px-4 py-2 bg-gradient-to-r from-[#8B1E2D] to-[#E63946] hover:opacity-90 text-white font-semibold text-sm rounded-lg flex items-center gap-2 shadow transition-all disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <span>Lookup</span>
              </>
            )}
          </button>
        </div>

        {/* Status Message Notification */}
        {statusMessage && (
          <div
            className={`flex items-start gap-2 text-xs p-2.5 rounded-lg border ${
              statusMessage.type === 'success'
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
        onConfirm={() => performLookup(queryId.trim().toUpperCase())}
        onCancel={() => setShowOverwriteModal(false)}
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
