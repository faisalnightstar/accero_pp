import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface DetailSkeletonProps {
  className?: string;
}

export function DetailSkeleton({ className = '' }: DetailSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 ${className}`}
    >
      <span className="sr-only">Loading record details...</span>
      {/* Detail Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5" aria-hidden="true">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Skeleton aria-hidden="true" className="h-6 w-52 rounded" />
            <Skeleton aria-hidden="true" className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton aria-hidden="true" className="h-3.5 w-64 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton aria-hidden="true" className="h-9 w-24 rounded-lg" />
          <Skeleton aria-hidden="true" className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Detail Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <Skeleton aria-hidden="true" className="h-3 w-16 rounded" />
            <Skeleton aria-hidden="true" className="h-5 w-28 rounded" />
          </div>
        ))}
      </div>

      {/* Main Detail Content Blocks */}
      <div className="space-y-4" aria-hidden="true">
        <Skeleton aria-hidden="true" className="h-4 w-32 rounded" />
        <div className="space-y-2">
          <Skeleton aria-hidden="true" className="h-3.5 w-full rounded" />
          <Skeleton aria-hidden="true" className="h-3.5 w-11/12 rounded" />
          <Skeleton aria-hidden="true" className="h-3.5 w-4/5 rounded" />
        </div>
      </div>

      {/* Key-Value Attribute Rows */}
      <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3.5 flex items-center justify-between bg-white dark:bg-slate-900/60">
            <Skeleton aria-hidden="true" className="h-3.5 w-32 rounded" />
            <Skeleton aria-hidden="true" className="h-4 w-44 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default DetailSkeleton;
