'use client';

import React from 'react';
import { CompletenessResult } from '@/lib/missingFields';
import { CheckCircle2, AlertTriangle, ArrowDownRight, Sparkles } from 'lucide-react';

interface MissingFieldBannerProps {
  completeness: CompletenessResult;
  onJumpToField: (key: string) => void;
}

export default function MissingFieldBanner({
  completeness,
  onJumpToField,
}: MissingFieldBannerProps) {
  const { isPrintReady, completionScore, missingFields, missingKeys } = completeness;

  const handleFixNext = () => {
    if (missingKeys.length > 0) {
      onJumpToField(missingKeys[0]);
    }
  };

  return (
    <div
      className={`rounded-2xl border p-4 shadow-xs transition-all ${
        isPrintReady
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-amber-50/80 border-amber-300 text-amber-950'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isPrintReady ? (
            <div className="p-1.5 rounded-full bg-emerald-500 text-white shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-1.5 rounded-full bg-amber-500 text-white shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold flex items-center gap-1.5">
              <span>{isPrintReady ? '100% Data Complete — Ready to Print' : 'Incomplete Data Detected'}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isPrintReady ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-900'
                }`}
              >
                {completionScore}%
              </span>
            </h4>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isPrintReady
                ? 'All mandatory government format fields are present. Canvas preview is verified.'
                : `${missingFields.length} field${
                    missingFields.length > 1 ? 's' : ''
                  } missing from API response. Please fill them before printing.`}
            </p>
          </div>
        </div>

        {!isPrintReady && (
          <button
            type="button"
            onClick={handleFixNext}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 rounded-lg shadow transition-all shrink-0"
          >
            <span>Fix Next Field</span>
            <ArrowDownRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-black/10 rounded-full h-1.5 mt-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isPrintReady ? 'bg-emerald-500' : completionScore >= 50 ? 'bg-amber-500' : 'bg-crimson'
          }`}
          style={{ width: `${completionScore}%` }}
        />
      </div>

      {/* Missing Fields Pill List */}
      {!isPrintReady && missingFields.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-amber-200/60">
          <span className="text-[10px] font-semibold text-amber-900/80 mr-1">
            Missing:
          </span>
          {missingFields.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onJumpToField(f.key)}
              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/80 hover:bg-white text-amber-900 border border-amber-300/80 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1"
            >
              <span>{f.label}</span>
              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
