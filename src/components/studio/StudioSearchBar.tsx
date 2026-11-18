'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, AlertCircle, CheckCircle2, Tag, RefreshCw, Shield, KeyRound, X, Lock } from 'lucide-react';
import { DocumentType } from '@/types/cards';
import {
  verifyDocument,
  getServicePricingAction,
  getVoterCaptchaAction,
  verifyVoterWithCaptchaAction,
} from '@/actions/verify';
import { validateEpicNumber } from '@/lib/verify/validators';
import { OverwriteConfirmModal } from './OverwriteConfirmModal';
import InsufficientBalanceModal from '@/components/wallet/InsufficientBalanceModal';
import RechargeModal from '@/components/wallet/RechargeModal';
import { SERVICE_FEES } from '@/lib/wallet/constants';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events';

interface StudioSearchBarProps {
  docType: DocumentType;
  isDirty?: boolean;
  onDataLoaded: (data: any, meta?: { docId?: string; isIdentityLocked?: boolean; identityLock?: any }) => void;
  onToast?: (message: string, type: 'info' | 'warning' | 'error' | 'success') => void;
  isIdentityLocked?: boolean;
  lockedIdentifier?: string;
}

const placeholders: Record<DocumentType, string> = {
  pan: 'Enter 10-digit PAN (e.g. ABCDE1234F)',
  voter: 'Enter EPIC Voter ID (e.g. IFV1949684)',
  dl: 'Enter Driving License No (e.g. DL-0420110123456)',
  rc: 'Enter Vehicle RC Reg No (e.g. UP05LD1234)',
  aadhaar: 'Enter 12-digit Aadhaar Number',
  ration: 'Enter 12 or 20-digit Ration Card Number (e.g. 10350050028009409992)',
  farmer: 'Enter 11/12-digit Farmer ID or Aadhaar No (e.g. 4256 177 6703)',
};

const serviceNames: Record<DocumentType, string> = {
  pan: 'PAN Card Verification',
  voter: 'Voter ID (EPIC) Verification',
  dl: 'Driving License Verification',
  rc: 'Vehicle RC Verification',
  aadhaar: 'Aadhaar Verification',
  ration: 'Ration Card Verification',
  farmer: 'Farmer ID (AgriStack) Verification',
};

export function StudioSearchBar({
  docType,
  isDirty = false,
  onDataLoaded,
  onToast,
  isIdentityLocked = false,
  lockedIdentifier,
}: StudioSearchBarProps) {
  const [queryId, setQueryId] = useState(lockedIdentifier || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (lockedIdentifier) {
      setQueryId(lockedIdentifier.toUpperCase());
    }
  }, [lockedIdentifier]);
  const [configuredFee, setConfiguredFee] = useState<number>(
    SERVICE_FEES[docType.toUpperCase()] || 20
  );
  const [pricingInfo, setPricingInfo] = useState<{
    fee: number;
    originalFee?: number;
    discountPercent?: number;
    offerActive?: boolean;
    offerBadge?: string;
  }>({
    fee: SERVICE_FEES[docType.toUpperCase()] || 20,
    originalFee: SERVICE_FEES[docType.toUpperCase()] || 20,
    discountPercent: 0,
    offerActive: false,
    offerBadge: '',
  });
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

  // Voter Captcha Modal state
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [captchaData, setCaptchaData] = useState<{ captchaId: string; captchaDataUri: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [selectedStateCd, setSelectedStateCd] = useState('S24');
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [submittingCaptcha, setSubmittingCaptcha] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const fetchCaptchaChallenge = async () => {
    setLoadingCaptcha(true);
    setCaptchaError(null);
    try {
      const res = await getVoterCaptchaAction('webapi_in');
      if (res.success && res.captchaId && res.captchaDataUri) {
        setCaptchaData({ captchaId: res.captchaId, captchaDataUri: res.captchaDataUri });
        setCaptchaAnswer('');
      } else {
        setCaptchaError(res.errorMessage || 'Failed to load captcha. Please try again.');
      }
    } catch (err: any) {
      setCaptchaError(err?.message || 'Failed to load captcha.');
    } finally {
      setLoadingCaptcha(false);
    }
  };

  const handleOpenCaptcha = async () => {
    setShowCaptchaModal(true);
    await fetchCaptchaChallenge();
  };

  const handleCaptchaSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedAnswer = captchaAnswer.trim();
    if (!trimmedAnswer) {
      setCaptchaError('Please enter the characters shown in the image.');
      return;
    }
    if (!captchaData?.captchaId) {
      setCaptchaError('Captcha expired. Please refresh.');
      return;
    }

    setSubmittingCaptcha(true);
    setCaptchaError(null);
    const requestId = activeRequestIdRef.current || `vr_${crypto.randomUUID()}`;

    try {
      const result = await verifyVoterWithCaptchaAction({
        epicNumber: queryId.trim().toUpperCase(),
        captchaId: captchaData.captchaId,
        captchaAnswer: trimmedAnswer,
        stateCd: selectedStateCd,
        requestId,
      });

      if (
        result.errorMessage === 'INSUFFICIENT_BALANCE' ||
        result.errorCode === 'INSUFFICIENT_BALANCE'
      ) {
        setShowCaptchaModal(false);
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

      if (result.errorCode === 'CAPTCHA_REQUIRED') {
        setStatusMessage({
          text: 'Voter verification requires captcha challenge. Loading...',
          type: 'warning',
        });
        await handleOpenCaptcha();
        return;
      }

      if (result.success && result.data && Object.keys(result.data).length > 0) {
        setShowCaptchaModal(false);
        onDataLoaded(result.data, {
          docId: result.docId,
          isIdentityLocked: true,
          identityLock: result.identityLock,
        });
        trackEvent(ANALYTICS_EVENTS.FIRST_LOOKUP_SUCCESS, { docCategory: docType });

        setProviderInfo({ name: 'WebAPI.in (Captcha Verified)', latency: result.latencyMs });

        if (typeof result.currentBalance === 'number' && typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('wallet-updated', { detail: result.currentBalance })
          );
        }

        const isCachedOrPaid = result.isFreeReprint || result.feeDeducted === 0;
        const feeNotice = isCachedOrPaid
          ? ' (₹0 — Already paid / Free reprint)'
          : ` (₹${result.feeDeducted ?? feeAmount} debited)`;

        const msg = `Voter record verified via WebAPI.in.${feeNotice}`;
        setStatusMessage({ text: msg, type: 'success' });
        if (onToast) onToast(msg, 'success');
        return;
      }

      // If invalid or expired captcha
      if (
        result.errorCode === 'CAPTCHA_INVALID' ||
        result.errorCode === 'CAPTCHA_EXPIRED'
      ) {
        setCaptchaError(result.errorMessage || 'Incorrect captcha entered. Please try with a new captcha.');
        await fetchCaptchaChallenge();
        return;
      }

      // Other error
      setCaptchaError(result.errorMessage || 'Voter verification failed. Please try again.');
    } catch (err: any) {
      setCaptchaError(err?.message || 'Verification error occurred.');
    } finally {
      setSubmittingCaptcha(false);
    }
  };

  useEffect(() => {
    const fallbackFee = SERVICE_FEES[docType.toUpperCase()] || 20;
    setConfiguredFee(fallbackFee);
    setPricingInfo({
      fee: fallbackFee,
      originalFee: fallbackFee,
      discountPercent: 0,
      offerActive: false,
      offerBadge: '',
    });

    let active = true;
    getServicePricingAction(docType)
      .then((pricing) => {
        if (active && typeof pricing?.fee === 'number') {
          setConfiguredFee(pricing.fee);
          setPricingInfo({
            fee: pricing.fee,
            originalFee: pricing.originalFee,
            discountPercent: pricing.discountPercent,
            offerActive: pricing.offerActive,
            offerBadge: pricing.offerBadge,
          });
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

    if (isIdentityLocked) {
      const msg =
        docType === 'voter'
          ? 'Voter record already verified via API.'
          : 'Record already verified. Lookup is disabled for this document.';
      setStatusMessage({ text: msg, type: 'warning' });
      if (onToast) onToast(msg, 'warning');
      return;
    }

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

      if (result.errorCode === 'CAPTCHA_REQUIRED') {
        setStatusMessage({
          text: 'Voter verification requires captcha challenge. Loading...',
          type: 'warning',
        });
        await handleOpenCaptcha();
        return;
      }

      if (result.success && result.data && Object.keys(result.data).length > 0) {
        onDataLoaded(result.data, {
          docId: result.docId,
          isIdentityLocked: true,
          identityLock: result.identityLock,
        });
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
            {/* Service Fee Pill with % OFF Badge */}
            <div className="inline-flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-[#F4D35E] border border-slate-700">
                <Tag className="w-3 h-3" />
                Fee: ₹{feeAmount}
                {pricingInfo.originalFee && pricingInfo.originalFee > feeAmount && (
                  <span className="line-through text-slate-400 font-normal ml-0.5">
                    ₹{pricingInfo.originalFee}
                  </span>
                )}
              </span>
              {pricingInfo.offerActive && (pricingInfo.discountPercent ?? 0) > 0 && (
                <span className="inline-flex items-center text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {pricingInfo.offerBadge || `${pricingInfo.discountPercent}% OFF`}
                </span>
              )}
            </div>
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
                if (isIdentityLocked) return;
                setQueryId(e.target.value.toUpperCase());
                setStatusMessage(null);
              }}
              placeholder={
                isIdentityLocked
                  ? `Locked: ${lockedIdentifier || queryId}`
                  : placeholders[docType] || 'Enter document number...'
              }
              disabled={isLoading || isIdentityLocked}
              className={`w-full pl-9 pr-3 py-2 bg-slate-800 border rounded-lg text-sm font-mono transition-colors ${
                isIdentityLocked
                  ? 'border-emerald-600/50 bg-slate-800/80 text-emerald-300 cursor-not-allowed select-none'
                  : 'border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E63946]'
              } disabled:opacity-75`}
            />
          </div>

          {docType === 'voter' && (
            <button
              type="button"
              onClick={handleOpenCaptcha}
              disabled={isLoading || isIdentityLocked || !queryId.trim()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg flex items-center gap-1.5 border border-slate-700 transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              title={isIdentityLocked ? 'Record already verified' : 'Use Captcha Challenge Lookup'}
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Captcha Mode</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || isIdentityLocked || !queryId.trim()}
            title={
              isIdentityLocked
                ? docType === 'voter'
                  ? 'Voter record already verified via API.'
                  : 'Record already verified. Lookup is disabled for this document.'
                : 'Lookup official record'
            }
            className={`px-4 py-2 font-semibold text-sm rounded-lg flex items-center gap-2 shadow transition-all shrink-0 ${
              isIdentityLocked
                ? 'bg-slate-700/80 text-slate-400 cursor-not-allowed border border-slate-600/80'
                : 'bg-gradient-to-r from-[#8B1E2D] to-[#E63946] hover:opacity-90 text-white cursor-pointer disabled:opacity-50'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{docType === 'voter' ? 'Verifying V1/V2...' : 'Searching...'}</span>
              </>
            ) : isIdentityLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Lookup Disabled</span>
              </>
            ) : (
              <>
                <span>Lookup</span>
              </>
            )}
          </button>
        </form>

        {/* Identity Lock Status Notification */}
        {isIdentityLocked && !statusMessage && (
          <div className="flex items-center gap-2 text-xs p-2.5 rounded-lg border bg-emerald-950/40 border-emerald-500/40 text-emerald-300 animate-in fade-in duration-150">
            <Lock className="w-4 h-4 shrink-0 text-emerald-400" />
            <div className="flex-1 flex items-center justify-between flex-wrap gap-1">
              <span>
                {docType === 'voter'
                  ? 'Voter record verified via API. (₹0 — Already paid / Free reprint)'
                  : 'Record already verified. Lookup is disabled for this document.'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/50">
                Identity Locked
              </span>
            </div>
          </div>
        )}

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

      {/* Voter Captcha Challenge Modal */}
      {showCaptchaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Voter Captcha Verification</h3>
                  <p className="text-xs text-slate-400">Security challenge required by upstream gateway</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCaptchaModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCaptchaSubmit} className="space-y-4">
              {/* Target EPIC display */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                <span className="text-slate-400">EPIC Number:</span>
                <span className="font-mono font-bold text-amber-400 tracking-wider">
                  {queryId.trim().toUpperCase() || 'NOT ENTERED'}
                </span>
              </div>

              {/* State Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  State / Territory
                </label>
                <select
                  value={selectedStateCd}
                  onChange={(e) => setSelectedStateCd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="S24">S24 - Uttar Pradesh</option>
                  <option value="S04">S04 - Bihar</option>
                  <option value="S14">S14 - Maharashtra</option>
                  <option value="S20">S20 - Rajasthan</option>
                  <option value="S12">S12 - Madhya Pradesh</option>
                  <option value="S29">S29 - West Bengal</option>
                  <option value="S07">S07 - Gujarat</option>
                  <option value="S10">S10 - Karnataka</option>
                  <option value="S05">S05 - NCT of Delhi</option>
                  <option value="S22">S22 - Tamil Nadu</option>
                  <option value="S01">S01 - Andhra Pradesh</option>
                  <option value="S19">S19 - Punjab</option>
                  <option value="S08">S08 - Haryana</option>
                  <option value="S21">S21 - Telangana</option>
                  <option value="S11">S11 - Kerala</option>
                  <option value="S06">S06 - Goa</option>
                  <option value="S03">S03 - Assam</option>
                  <option value="S28">S28 - Uttarakhand</option>
                  <option value="S27">S27 - Jharkhand</option>
                  <option value="S26">S26 - Chhattisgarh</option>
                  <option value="S18">S18 - Odisha</option>
                  <option value="U01">U01 - Jammu & Kashmir</option>
                </select>
              </div>

              {/* Captcha Image Display & Refresh */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Enter Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={fetchCaptchaChallenge}
                    disabled={loadingCaptcha || submittingCaptcha}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingCaptcha ? 'animate-spin' : ''}`} />
                    Refresh Image
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-14 bg-white rounded-xl flex items-center justify-center border border-slate-700 overflow-hidden p-1 shadow-inner">
                    {loadingCaptcha ? (
                      <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
                    ) : captchaData?.captchaDataUri ? (
                      <img
                        src={captchaData.captchaDataUri}
                        alt="Security Captcha"
                        className="max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-rose-500 font-medium">Failed to load</span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value.toUpperCase())}
                    placeholder="CODE"
                    autoFocus
                    maxLength={10}
                    disabled={loadingCaptcha || submittingCaptcha}
                    className="w-32 h-14 bg-slate-950 border border-slate-700 rounded-xl px-3 text-center font-mono font-bold text-lg text-white tracking-widest uppercase focus:outline-none focus:border-indigo-500 shadow-inner"
                  />
                </div>
              </div>

              {captchaError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{captchaError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCaptchaModal(false)}
                  disabled={submittingCaptcha}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCaptcha || loadingCaptcha || !captchaAnswer.trim()}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                >
                  {submittingCaptcha ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Verify & Fetch
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
