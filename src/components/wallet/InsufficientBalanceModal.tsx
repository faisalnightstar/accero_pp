'use client';

import React from 'react';
import { AlertTriangle, Wallet, ArrowRight, X } from 'lucide-react';

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecharge: () => void;
  requiredFee: number;
  currentBalance: number;
  serviceName?: string;
}

export default function InsufficientBalanceModal({
  isOpen,
  onClose,
  onOpenRecharge,
  requiredFee,
  currentBalance,
  serviceName = 'Document Verification',
}: InsufficientBalanceModalProps) {
  if (!isOpen) return null;

  const deficit = Math.max(0, requiredFee - currentBalance);

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            Insufficient Balance
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            You do not have enough wallet credits to complete this action.
          </p>
        </div>

        {/* Breakdown Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Service</span>
            <span className="font-semibold text-white">{serviceName}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Required Fee</span>
            <span className="font-semibold text-white">₹{requiredFee.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Available Balance</span>
            <span className="font-semibold text-slate-300">₹{currentBalance.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold">
            <span className="text-amber-400">Minimum Top-up Needed</span>
            <span className="text-amber-400 text-sm">₹{deficit.toFixed(2)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onOpenRecharge();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-opacity text-sm"
          >
            <Wallet className="w-4 h-4 text-[#F4D35E]" />
            Recharge Wallet Now
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 text-slate-300 font-semibold hover:bg-slate-800 hover:text-white transition-colors text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
