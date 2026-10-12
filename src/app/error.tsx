'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console
    console.error('Application Runtime Error:', error);

    // If ChunkLoadError (common after build or deployment cache mismatch),
    // automatically attempt hard reload once if not already retried
    const isChunkLoadError =
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('ChunkLoadError');

    if (isChunkLoadError && typeof window !== 'undefined') {
      const storageKey = 'last_chunk_reload_timestamp';
      const lastReload = sessionStorage.getItem(storageKey);
      const now = Date.now();

      // Only auto-reload if we haven't reloaded within the last 15 seconds to avoid loop
      if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
        sessionStorage.setItem(storageKey, now.toString());
        console.warn('ChunkLoadError detected. Automatically refreshing page with fresh assets...');
        window.location.reload();
      }
    }
  }, [error]);

  const isChunkError =
    error.name === 'ChunkLoadError' ||
    error.message?.includes('Loading chunk') ||
    error.message?.includes('ChunkLoadError');

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-600 animate-pulse">
          <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#1D3557]">
            {isChunkError ? 'Application Updated' : 'Something went wrong'}
          </h2>
          <p className="text-sm text-slate-500">
            {isChunkError
              ? 'A newer version of this page is available. Reloading will fetch the latest assets from the server.'
              : 'An unexpected runtime error occurred while rendering this page.'}
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-slate-400">
              Digest ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#8B1E2D] to-[#E63946] hover:shadow-btn-hover transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Page</span>
          </button>

          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
