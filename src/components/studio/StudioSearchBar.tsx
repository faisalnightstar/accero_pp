'use client';

import React, { useState } from 'react';
import { Search, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DocumentType } from '@/types/cards';
import { verifyDocument } from '@/actions/verify';
import { OverwriteConfirmModal } from './OverwriteConfirmModal';

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

export function StudioSearchBar({
  docType,
  isDirty = false,
  onDataLoaded,
  onToast,
}: StudioSearchBarProps) {
  const [queryId, setQueryId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'error' | 'warning' | 'success' } | null>(null);
  const [providerInfo, setProviderInfo] = useState<{ name?: string; latency?: number } | null>(null);
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);

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

      if (result.success && result.data && Object.keys(result.data).length > 0) {
        onDataLoaded(result.data);
        setProviderInfo({ name: result.provider, latency: result.latencyMs });

        if (result.isPartial) {
          const msg = 'Partial record found — missing fields highlighted for manual completion.';
          setStatusMessage({ text: msg, type: 'warning' });
          if (onToast) onToast(msg, 'warning');
        } else {
          setStatusMessage({ text: `Successfully verified via ${result.provider || 'Gateway'}.`, type: 'success' });
          if (onToast) onToast('Document record retrieved and populated.', 'success');
        }
      } else {
        const errMsg = result.errorMessage || 'No record found. You can proceed with manual entry.';
        setStatusMessage({ text: errMsg, type: 'error' });
        if (onToast) onToast(errMsg, 'error');
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Verification request timed out. Switched to manual Studio entry.';
      setStatusMessage({ text: errMsg, type: 'warning' });
      if (onToast) onToast(errMsg, 'warning');
    } finally {
      setIsLoading(false);
      setShowOverwriteModal(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-lg backdrop-blur-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Instant API Lookup</span>
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
          onClick={handleFetch}
          disabled={isLoading || !queryId.trim()}
          className="px-4 py-2 bg-[#8B1E2D] hover:bg-[#A82537] text-white text-sm font-semibold rounded-lg shadow transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              <span>Fetching...</span>
            </>
          ) : (
            <span>Fetch Details</span>
          )}
        </button>
      </div>

      {statusMessage && (
        <div
          className={`flex items-start gap-2 p-2.5 rounded-lg text-xs border animate-in fade-in duration-150 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : statusMessage.type === 'warning'
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="leading-snug">{statusMessage.text}</span>
        </div>
      )}

      <OverwriteConfirmModal
        isOpen={showOverwriteModal}
        pendingDocType={docType}
        pendingIdNumber={queryId}
        onConfirm={() => performLookup(queryId.trim().toUpperCase())}
        onCancel={() => setShowOverwriteModal(false)}
      />
    </div>
  );
}
