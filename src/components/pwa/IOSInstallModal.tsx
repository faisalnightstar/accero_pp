'use client';

import React from 'react';
import { X, Smartphone, Share2, PlusSquare } from 'lucide-react';

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIPadOS?: boolean;
}

export default function IOSInstallModal({
  isOpen,
  onClose,
  isIPadOS = false,
}: IOSInstallModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative animate-in slide-in-from-bottom-6 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#8B1E2D] mb-4">
          <Smartphone className="w-6 h-6" />
        </div>

        <h4 id="ios-install-title" className="text-base font-bold text-[#1D3557] mb-1">
          Install Accero on {isIPadOS ? 'iPad' : 'iPhone'}
        </h4>
        <p className="text-xs text-slate-600 mb-4">
          Install Accero on your home screen for instant fullscreen access with zero browser bars:
        </p>

        <ol className="space-y-3 text-xs text-slate-700 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1D3557] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <span>
              Tap the <strong>Share</strong> button at the bottom of Safari:
              <Share2 className="w-4 h-4 inline-block text-blue-600 mx-1 align-sub" />
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1D3557] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <span>
              Scroll down the share sheet and tap <strong>Add to Home Screen</strong>:
              <PlusSquare className="w-4 h-4 inline-block text-slate-700 mx-1 align-sub" />
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1D3557] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <span>
              Tap <strong>Add</strong> in the top-right corner to complete installation.
            </span>
          </li>
        </ol>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#1D3557] hover:bg-[#25446D] text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
