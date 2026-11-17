import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface DocumentSkeletonProps {
  className?: string;
  splitView?: boolean;
}

export function DocumentSkeleton({ className = '', splitView = true }: DocumentSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`space-y-6 max-w-7xl mx-auto ${className}`}
    >
      <span className="sr-only">Loading card studio...</span>
      {/* Studio Header Skeleton */}
      <div aria-hidden="true" className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton aria-hidden="true" className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton aria-hidden="true" className="h-6 w-44 rounded" />
              <Skeleton aria-hidden="true" className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton aria-hidden="true" className="h-3.5 w-64 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton aria-hidden="true" className="h-9 w-24 rounded-lg" />
          <Skeleton aria-hidden="true" className="h-9 w-28 rounded-lg" />
          <Skeleton aria-hidden="true" className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Document Studio Search / Lookup Bar */}
      <div aria-hidden="true" className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <Skeleton aria-hidden="true" className="h-10 w-full sm:flex-1 rounded-lg" />
        <Skeleton aria-hidden="true" className="h-10 w-full sm:w-28 rounded-lg" />
      </div>

      {/* Main Studio Work Area */}
      <div aria-hidden="true" className={`grid gap-6 ${splitView ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* Form Panel (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <Skeleton aria-hidden="true" className="h-5 w-32 rounded" />
              <Skeleton aria-hidden="true" className="h-4 w-20 rounded" />
            </div>

            {/* Photo & Signature Dropzone Skeleton */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Skeleton aria-hidden="true" className="h-3 w-16 rounded" />
                <Skeleton aria-hidden="true" className="h-28 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton aria-hidden="true" className="h-3 w-16 rounded" />
                <Skeleton aria-hidden="true" className="h-28 w-full rounded-xl" />
              </div>
            </div>

            {/* Input Field Skeletons */}
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton aria-hidden="true" className="h-3 w-24 rounded" />
                  <Skeleton aria-hidden="true" className="h-9 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card Canvas Preview Panel (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 bg-slate-100/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[460px] space-y-6">
            <div className="flex items-center justify-between w-full max-w-[500px]">
              <Skeleton aria-hidden="true" className="h-5 w-36 rounded" />
              <div className="flex gap-2">
                <Skeleton aria-hidden="true" className="h-8 w-16 rounded-lg" />
                <Skeleton aria-hidden="true" className="h-8 w-16 rounded-lg" />
              </div>
            </div>

            {/* CR80 Standard Card Dimension Skeleton (Aspect ~ 1.586 : 85.6mm x 53.98mm) */}
            <div className="relative w-full max-w-[420px] aspect-[1.586] rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md p-5 flex flex-col justify-between">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton aria-hidden="true" className="w-8 h-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton aria-hidden="true" className="h-3 w-24 rounded" />
                    <Skeleton aria-hidden="true" className="h-2.5 w-16 rounded" />
                  </div>
                </div>
                <Skeleton aria-hidden="true" className="w-8 h-8 rounded-md" />
              </div>

              {/* Card Body */}
              <div className="flex items-center gap-4 my-auto">
                <Skeleton aria-hidden="true" className="w-20 h-24 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton aria-hidden="true" className="h-3 w-3/4 rounded" />
                  <Skeleton aria-hidden="true" className="h-3 w-1/2 rounded" />
                  <Skeleton aria-hidden="true" className="h-3 w-2/3 rounded" />
                  <Skeleton aria-hidden="true" className="h-4 w-4/5 rounded font-mono" />
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <Skeleton aria-hidden="true" className="h-3 w-28 rounded" />
                <Skeleton aria-hidden="true" className="w-12 h-6 rounded" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Skeleton aria-hidden="true" className="h-4 w-48 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentSkeleton;
