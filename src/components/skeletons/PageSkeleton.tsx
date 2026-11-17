import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CardSkeleton } from './CardSkeleton';
import { TableSkeleton } from './TableSkeleton';

export interface PageSkeletonProps {
  className?: string;
  variant?: 'cards' | 'table' | 'simple';
}

export function PageSkeleton({ className = '', variant = 'cards' }: PageSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`space-y-8 max-w-7xl mx-auto ${className}`}
    >
      <span className="sr-only">Loading page...</span>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5" aria-hidden="true">
        <div className="space-y-2">
          <Skeleton aria-hidden="true" className="h-8 w-60 rounded-lg" />
          <Skeleton aria-hidden="true" className="h-4 w-96 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton aria-hidden="true" className="h-10 w-28 rounded-xl" />
          <Skeleton aria-hidden="true" className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {variant === 'cards' && (
        <div className="space-y-6" aria-hidden="true">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} variant="stat" />
            ))}
          </div>
          <TableSkeleton rows={5} columns={4} />
        </div>
      )}

      {variant === 'table' && <TableSkeleton rows={8} columns={5} />}

      {variant === 'simple' && (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5" aria-hidden="true">
          <Skeleton aria-hidden="true" className="h-6 w-48 rounded" />
          <div className="space-y-3">
            <Skeleton aria-hidden="true" className="h-4 w-full rounded" />
            <Skeleton aria-hidden="true" className="h-4 w-5/6 rounded" />
            <Skeleton aria-hidden="true" className="h-4 w-2/3 rounded" />
          </div>
          <div className="pt-4 flex gap-3">
            <Skeleton aria-hidden="true" className="h-10 w-32 rounded-lg" />
            <Skeleton aria-hidden="true" className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}

export default PageSkeleton;
