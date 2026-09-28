'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface OverwriteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  pendingDocType?: string;
  pendingIdNumber?: string;
}

export function OverwriteConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  pendingDocType,
  pendingIdNumber,
}: OverwriteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-xl shadow-2xl overflow-hidden p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-lg flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white tracking-wide">
              Overwrite Current Draft?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              You have unsaved modifications or custom uploads in this session. Fetching{' '}
              {pendingDocType?.toUpperCase()} record{' '}
              {pendingIdNumber && <span className="font-mono text-amber-300">({pendingIdNumber})</span>}{' '}
              will replace your current inputs.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            Keep Current Draft
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            Overwrite Draft
          </button>
        </div>
      </div>
    </div>
  );
}
