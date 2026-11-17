'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Printer,
  RotateCcw,
  Clock,
  Wallet,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronRight,
  Calendar,
  User,
  Info,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import RechargeModal from '@/components/wallet/RechargeModal';
import { validatePanNumber, normalizePanNumber } from '@/lib/pan/pan.validation';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';
import type { PanLookupStrategy } from '@/lib/pan/pan.types';

interface PanResultData {
  pan: string;
  fullName: string | null;
  fatherName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  aadhaarNumberAvailable: boolean | null;
  providerVersion: 'v1' | 'v2';
  message: string;
  status: 'SUCCESS' | 'FAILED';
  errorCode?: string;
  errorMessage?: string;
  feeDeducted?: number;
  currentBalance?: number;
  isFreeReprint?: boolean;
  docId?: string;
  transactionReferenceId?: string;
  fallbackUsed?: boolean;
  latencyMs?: number;
}

interface PanHistoryItem {
  id: string;
  panNumber: string;
  fullName: string | null;
  fatherName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  providerVersion: 'v1' | 'v2';
  status: 'SUCCESS' | 'FAILED';
  serviceFee: number;
  requestTimestamp: string;
}

export default function PanLookupPage() {
  const router = useRouter();

  // Form states
  const [panInput, setPanInput] = useState('');
  const [strategy, setStrategy] = useState<PanLookupStrategy>('fallback');
  const [isLoading, setIsLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<PanResultData | null>(null);
  const [errorBanner, setErrorBanner] = useState<{ message: string; code?: string } | null>(null);

  // Metadata / Pricing states
  const [serviceFee, setServiceFee] = useState<number>(20);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

  // History states
  const [history, setHistory] = useState<PanHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // UI helper states
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Fetch initial pricing and wallet balance
  const fetchWalletAndPricing = useCallback(async () => {
    try {
      const [walletRes, pricingRes] = await Promise.all([
        fetch('/api/wallet/balance').then((r) => r.json()).catch(() => null),
        fetch('/api/services/pricing?docType=pan').then((r) => r.json()).catch(() => null),
      ]);

      if (walletRes && typeof walletRes.balance === 'number') {
        setWalletBalance(walletRes.balance);
      }
      if (pricingRes && typeof pricingRes.fee === 'number') {
        setServiceFee(pricingRes.fee);
      }
    } catch {
      // Non-blocking fallback defaults
    }
  }, []);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const res = await fetch('/api/pan/lookup?limit=15');
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setHistory(data.history);
      }
    } catch {
      // History non-blocking
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletAndPricing();
    fetchHistory();
  }, [fetchWalletAndPricing, fetchHistory]);

  // Handle PAN input formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setPanInput(raw);
    if (errorBanner) setErrorBanner(null);
  };

  // Execute verification
  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    const cleanPan = normalizePanNumber(panInput);
    const validation = validatePanNumber(cleanPan);

    if (!validation.valid) {
      setErrorBanner({
        message: validation.errorMessage || 'Please enter a valid 10-character alphanumeric PAN (e.g. ABCDE1234F).',
        code: validation.errorCode,
      });
      return;
    }

    if (walletBalance !== null && walletBalance < serviceFee) {
      setErrorBanner({
        message: `Insufficient wallet balance. This lookup requires ₹${serviceFee}, but your balance is ₹${walletBalance.toFixed(2)}.`,
        code: 'INSUFFICIENT_BALANCE',
      });
      return;
    }

    setIsLoading(true);
    setLookupResult(null);

    try {
      const res = await fetch('/api/pan/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          panNumber: cleanPan,
          strategy,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg = json.errorMessage || json.message || 'PAN verification could not be completed.';
        setErrorBanner({
          message: errorMsg,
          code: json.errorCode,
        });

        if (json.currentBalance !== undefined) {
          setWalletBalance(json.currentBalance);
        }
        return;
      }

      setLookupResult(json.result);

      if (typeof json.result?.currentBalance === 'number') {
        setWalletBalance(json.result.currentBalance);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('wallet-updated', { detail: json.result.currentBalance })
          );
        }
      }

      // Refresh history silently
      fetchHistory();
    } catch (err: any) {
      setErrorBanner({
        message: 'Network error communicating with PAN verification server. Please retry.',
        code: 'NETWORK_ERROR',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = () => {
    if (!lookupResult) return;
    const summary = [
      `PAN NUMBER: ${lookupResult.pan}`,
      `FULL NAME: ${lookupResult.fullName || 'N/A'}`,
      `FATHER'S NAME: ${lookupResult.fatherName || 'N/A'}`,
      `DATE OF BIRTH: ${lookupResult.dateOfBirth || 'N/A'}`,
      lookupResult.gender ? `GENDER: ${lookupResult.gender}` : null,
      lookupResult.aadhaarNumberAvailable !== null
        ? `AADHAAR LINKED: ${lookupResult.aadhaarNumberAvailable ? 'Yes' : 'No'}`
        : null,
      `VERIFIED VIA: WebAPI (${lookupResult.providerVersion.toUpperCase()})`,
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(summary);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const panValidationStatus = validatePanNumber(panInput);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link
              href="/dashboard"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              <span>Dashboard</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-semibold">PAN Verification Gateway</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Wallet:</span>
              <span className="font-bold text-white">
                {walletBalance !== null ? `₹${walletBalance.toFixed(2)}` : '—'}
              </span>
              <button
                type="button"
                onClick={() => setIsRechargeModalOpen(true)}
                className="ml-1 text-[11px] font-bold text-[#E63946] hover:underline"
              >
                + Top Up
              </button>
            </div>

            <Link
              href="/studio?type=pan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Card Studio</span>
            </Link>
          </div>
        </div>

        {/* Page Hero Header */}
        <div className="bg-gradient-to-br from-slate-800/90 via-slate-850 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B1E2D]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B1E2D]/20 border border-[#8B1E2D]/40 text-[#E63946] text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>WebAPI V1 & V2 Failover Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Official PAN Verification & Lookup
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Instant demographic verification directly from the Income Tax database. Automatic silent
                failover ensures 99.9% uptime. Verify cardholder details with zero risk: fee is charged only
                upon successful match.
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700/70 shrink-0 min-w-[220px] space-y-2">
              <div className="text-xs text-slate-400 font-medium">Service Fee Per Lookup</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">₹{serviceFee}</span>
                <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ₹0 on Failure
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-800">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Includes free lifetime reprint</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-850 rounded-2xl p-6 border border-slate-700/70 shadow-lg space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#E63946]" />
                  <span>Enter Card Number</span>
                </h2>
                <span className="text-[11px] text-slate-400">10 Alphanumeric</span>
              </div>

              <form onSubmit={handleLookupSubmit} className="space-y-4">
                {/* PAN Number Input */}
                <div className="space-y-1.5">
                  <label htmlFor="panInput" className="text-xs font-semibold text-slate-300">
                    PAN Number (Permanent Account Number)
                  </label>
                  <div className="relative">
                    <input
                      id="panInput"
                      type="text"
                      value={panInput}
                      onChange={handleInputChange}
                      placeholder="e.g. MJPPK9654Q"
                      maxLength={10}
                      autoFocus
                      disabled={isLoading}
                      className="w-full bg-slate-900 text-white font-mono text-lg font-bold tracking-widest px-4 py-3 rounded-xl border border-slate-700 focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/30 outline-none uppercase placeholder:text-slate-600 transition-all disabled:opacity-60"
                    />
                    {panInput.length === 10 && (
                      <div className="absolute right-3 top-3.5">
                        {panValidationStatus.valid ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-400" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>Format: 5 letters + 4 digits + 1 letter</span>
                    <span>{panInput.length}/10</span>
                  </div>
                </div>

                {/* Strategy Selector */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Lookup Engine Strategy</span>
                    <span className="text-[10px] text-emerald-400 font-bold">Recommended: Fallback</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStrategy('fallback')}
                      disabled={isLoading}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center gap-0.5 ${
                        strategy === 'fallback'
                          ? 'bg-[#8B1E2D]/20 border-[#E63946] text-white shadow-sm'
                          : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold">Auto Failover</span>
                      <span className="text-[10px] opacity-75">V1 → V2</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStrategy('v1')}
                      disabled={isLoading}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center gap-0.5 ${
                        strategy === 'v1'
                          ? 'bg-[#8B1E2D]/20 border-[#E63946] text-white shadow-sm'
                          : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold">API V1</span>
                      <span className="text-[10px] opacity-75">Primary</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStrategy('v2')}
                      disabled={isLoading}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center gap-0.5 ${
                        strategy === 'v2'
                          ? 'bg-[#8B1E2D]/20 border-[#E63946] text-white shadow-sm'
                          : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold">API V2</span>
                      <span className="text-[10px] opacity-75">Direct</span>
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {errorBanner && (
                  <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 space-y-2 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1 font-medium">{errorBanner.message}</div>
                    </div>
                    {errorBanner.code === 'INSUFFICIENT_BALANCE' && (
                      <button
                        type="button"
                        onClick={() => setIsRechargeModalOpen(true)}
                        className="w-full py-1.5 px-3 bg-red-800 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Recharge Wallet Balance</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || panInput.length !== 10}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#8B1E2D] to-[#E63946] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-950/50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Querying Income Tax Database...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Verify & Fetch PAN Data (₹{serviceFee})</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Guarantees */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>No deduction on failure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Avg response: 1.2s</span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-slate-850/60 rounded-2xl p-4 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>Verification Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Records verified are cached for 72 hours. Subsequent lookups or prints of the same PAN within the
                window are 100% free of charge (₹0).
              </p>
            </div>
          </div>

          {/* Right Column: Result / Empty State (7 cols) */}
          <div className="lg:col-span-7">
            {isLoading ? (
              /* Loading Skeleton */
              <div
                role="status"
                aria-busy="true"
                aria-live="polite"
                className="bg-slate-850 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden space-y-6 p-6 animate-pulse motion-reduce:animate-none"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl bg-slate-800" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-5 w-48 rounded bg-slate-800" />
                      <Skeleton className="h-3 w-36 rounded bg-slate-800/60" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full bg-slate-800" />
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <Skeleton className="h-4 w-40 rounded bg-slate-800" />
                    <Skeleton className="h-4 w-20 rounded bg-slate-800" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <Skeleton className="h-3 w-24 rounded bg-slate-800/60" />
                        <Skeleton className="h-5 w-36 rounded bg-slate-800" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <Skeleton className="h-10 w-28 rounded-xl bg-slate-800" />
                    <Skeleton className="h-10 w-36 rounded-xl bg-slate-800" />
                  </div>
                </div>
              </div>
            ) : lookupResult && lookupResult.status === 'SUCCESS' ? (
              /* Result Card */
              <div className="bg-slate-850 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden animate-in fade-in duration-200">
                {/* Result Card Header */}
                <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 p-5 border-b border-emerald-900/40 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-wide">
                          PAN Verified Successfully
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          MATCHED
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Official Income Tax demographic record retrieved
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      WebAPI {lookupResult.providerVersion.toUpperCase()}
                    </span>
                    {lookupResult.fallbackUsed && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Failover
                      </span>
                    )}
                  </div>
                </div>

                {/* Result Details Body */}
                <div className="p-6 space-y-6">
                  {/* Fee & Reference Banner */}
                  <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span>
                        {lookupResult.feeDeducted === 0
                          ? 'Deduction: ₹0 (Free Reprint / Saved Record)'
                          : `Deduction: ₹${lookupResult.feeDeducted} debited from wallet`}
                      </span>
                    </div>
                    {lookupResult.latencyMs && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {lookupResult.latencyMs}ms
                      </span>
                    )}
                  </div>

                  {/* Primary Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* PAN */}
                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">
                          Permanent Account Number
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(lookupResult.pan, 'pan')}
                          className="text-slate-400 hover:text-white transition-colors"
                          title="Copy PAN"
                        >
                          {copiedField === 'pan' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="font-mono text-lg font-bold text-white tracking-wider">
                        {lookupResult.pan}
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">
                          Full Name
                        </span>
                        {lookupResult.fullName && (
                          <button
                            type="button"
                            onClick={() => handleCopy(lookupResult.fullName!, 'name')}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Copy Name"
                          >
                            {copiedField === 'name' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="text-base font-bold text-white">
                        {lookupResult.fullName || <span className="text-slate-500 italic">Not Returned</span>}
                      </div>
                    </div>

                    {/* Father's Name */}
                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">
                          Father&apos;s Name
                        </span>
                        {lookupResult.fatherName && (
                          <button
                            type="button"
                            onClick={() => handleCopy(lookupResult.fatherName!, 'father')}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Copy Father's Name"
                          >
                            {copiedField === 'father' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="text-base font-bold text-white">
                        {lookupResult.fatherName || <span className="text-slate-500 italic">Not Returned</span>}
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">
                          Date of Birth (DD-MM-YYYY)
                        </span>
                        {lookupResult.dateOfBirth && (
                          <button
                            type="button"
                            onClick={() => handleCopy(lookupResult.dateOfBirth!, 'dob')}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Copy DOB"
                          >
                            {copiedField === 'dob' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="font-mono text-base font-bold text-white">
                        {lookupResult.dateOfBirth || <span className="text-slate-500 italic">Not Returned</span>}
                      </div>
                    </div>

                    {/* Optional Field: Gender (Only if returned) */}
                    {lookupResult.gender && (
                      <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">
                          Gender
                        </span>
                        <div className="text-base font-bold text-white capitalize">
                          {lookupResult.gender}
                        </div>
                      </div>
                    )}

                    {/* Optional Field: Aadhaar Status (Only if returned) */}
                    {lookupResult.aadhaarNumberAvailable !== null && (
                      <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase">
                          Aadhaar Seeding Status
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                              lookupResult.aadhaarNumberAvailable
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {lookupResult.aadhaarNumberAvailable ? 'Aadhaar Seeded' : 'Not Seeded / False'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
                    {/* Primary Action: Open in Card Studio */}
                    <button
                      type="button"
                      onClick={() => {
                        router.push(`/studio?type=pan&lookup=${encodeURIComponent(lookupResult.pan)}`);
                      }}
                      className="flex-1 min-w-[200px] py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#8B1E2D] to-[#E63946] hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Open in Card Studio & Print PVC</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Secondary Action: Copy All */}
                    <button
                      type="button"
                      onClick={handleCopyAll}
                      className="py-3 px-4 rounded-xl font-semibold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      {copiedAll ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied All</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Details</span>
                        </>
                      )}
                    </button>

                    {/* Print Identity Slip */}
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="py-3 px-4 rounded-xl font-semibold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
                      title="Print Verification Slip"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
                    </button>

                    {/* Clear / New Search */}
                    <button
                      type="button"
                      onClick={() => {
                        setLookupResult(null);
                        setPanInput('');
                      }}
                      className="py-3 px-3 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                      title="New Verification"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty / Idle Guide State */
              <div className="bg-slate-850 rounded-2xl p-8 border border-slate-700/70 shadow-lg min-h-[420px] flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-[#8B1E2D]/10 border border-[#8B1E2D]/20 text-[#E63946]">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Instant Verification Preview</h3>
                      <p className="text-xs text-slate-400">
                        Enter any 10-character PAN number to inspect cardholder records
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <div className="text-[11px] font-bold text-slate-300">High-Fidelity Match</div>
                      <p className="text-[11px] text-slate-400">
                        Returns legal full name, father&apos;s name, and calendar-validated date of birth.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <div className="text-[11px] font-bold text-slate-300">Dual-Engine Reliability</div>
                      <p className="text-[11px] text-slate-400">
                        Combines WebAPI V1 and V2 with automatic fallback for maximum availability.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <div className="text-[11px] font-bold text-slate-300">1-Click Card Studio</div>
                      <p className="text-[11px] text-slate-400">
                        Seamlessly import verified data into NSDL/UTI templates for pixel-perfect PVC printing.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                      <div className="text-[11px] font-bold text-slate-300">Zero-Charge Guarantee</div>
                      <p className="text-[11px] text-slate-400">
                        If a PAN record is not found or the gateway fails, ₹0 is deducted from your wallet.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Need to format a card manually without lookup?
                  </div>
                  <Link
                    href="/studio?type=pan"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#E63946] hover:underline"
                  >
                    <span>Blank PAN Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Previous Lookups History Section */}
        <div className="bg-slate-850 rounded-2xl border border-slate-700/70 shadow-lg p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E63946]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Your Recent PAN Lookups
              </h2>
            </div>
            <button
              type="button"
              onClick={fetchHistory}
              disabled={isHistoryLoading}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isHistoryLoading ? 'animate-spin' : ''}`} />
              <span>Refresh History</span>
            </button>
          </div>

          {isHistoryLoading && history.length === 0 ? (
            <TableSkeleton rows={4} columns={5} className="bg-slate-900 border-slate-800" />
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No recent PAN verification records found. Perform a search above to record your lookups.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">PAN Number</th>
                    <th className="py-2.5 px-3 font-semibold">Cardholder Name</th>
                    <th className="py-2.5 px-3 font-semibold">DOB</th>
                    <th className="py-2.5 px-3 font-semibold">Provider</th>
                    <th className="py-2.5 px-3 font-semibold">Fee</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {item.panNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-200">
                        {item.fullName || <span className="text-slate-500 italic">—</span>}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {item.dateOfBirth || '—'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-blue-400">
                        WebAPI {item.providerVersion.toUpperCase()}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">
                        {item.serviceFee > 0 ? `₹${item.serviceFee}` : '₹0'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'SUCCESS'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(item.requestTimestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setPanInput(item.panNumber);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Load in Search"
                          >
                            <Search className="w-3 h-3" />
                          </button>
                          <Link
                            href={`/studio?type=pan&lookup=${encodeURIComponent(item.panNumber)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#8B1E2D]/20 hover:bg-[#8B1E2D] text-[#E63946] hover:text-white text-[11px] font-bold transition-all border border-[#8B1E2D]/30"
                            title="Open in Card Studio"
                          >
                            <Layers className="w-3 h-3" />
                            <span>Studio</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        onSuccess={(newBal) => {
          setWalletBalance(newBal);
        }}
      />
    </div>
  );
}
