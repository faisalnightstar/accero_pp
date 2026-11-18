'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Admin] Runtime Error:', error);
  }, [error]);

  return (
    <div className="p-8 max-w-2xl mx-auto my-12 bg-slate-950 border border-red-900/40 rounded-2xl shadow-xl text-center space-y-5">
      <div className="w-14 h-14 mx-auto rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Admin Section Error</h2>
        <p className="text-xs text-slate-400 mt-1.5">
          {error.message || 'An unexpected error occurred while loading this administrative view.'}
        </p>
        {error.digest && (
          <p className="text-[11px] font-mono text-slate-500 mt-1">Digest: {error.digest}</p>
        )}
      </div>
      <div className="flex justify-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      </div>
    </div>
  );
}
