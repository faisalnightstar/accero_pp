'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, AlertCircle, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setTimeout(() => {
        setIsRetrying(false);
      }, 800);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
        {/* Status Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <WifiOff className="w-8 h-8 animate-pulse" />
        </div>

        {/* Live Network Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-slate-100 text-slate-700">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'
            }`}
          />
          {isOnline ? 'Internet Connection Restored' : 'No Internet Connection'}
        </div>

        <h1 className="text-2xl font-bold text-[#1D3557] mb-2">
          You&apos;re currently offline
        </h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Your internet connection appears to be unavailable. Reconnect to continue using Accero
          PrintPortal.
        </p>

        {/* Informational Warning */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 mb-6 text-left flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-snug">
            <span className="font-semibold block mb-0.5">Online Services Paused</span>
            Document lookups, wallet deductions, live Paytm payments, and print authorizations are
            disabled while offline to guarantee financial and data integrity.
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B1E2D] hover:bg-[#A32435] text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Checking Connection...' : 'Retry Connection'}
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Home
          </Link>
        </div>

        <p className="text-xs text-slate-400">
          Accero PrintPortal &bull; Progressive Web App Engine
        </p>
      </div>
    </div>
  );
}
