import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface ListSkeletonProps {
  items?: number;
  className?: string;
  hasHeader?: boolean;
}

export function ListSkeleton({
  items = 5,
  className = '',
  hasHeader = true,
}: ListSkeletonProps) {
  const itemList = Array.from({ length: items }, (_, i) => i);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden ${className}`}
    >
      <span className="sr-only">Loading activity feed...</span>
      {hasHeader && (
        <div aria-hidden="true" className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton aria-hidden="true" className="h-5 w-40 rounded" />
            <Skeleton aria-hidden="true" className="h-3.5 w-64 rounded" />
          </div>
          <Skeleton aria-hidden="true" className="h-8 w-24 rounded-lg" />
        </div>
      )}

      <div aria-hidden="true" className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {itemList.map((idx) => (
          <div key={idx} className="p-4 sm:p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 flex-1">
              <Skeleton aria-hidden="true" className="w-9 h-9 rounded-xl shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton aria-hidden="true" className="h-4 w-44 rounded" />
                  <Skeleton aria-hidden="true" className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton aria-hidden="true" className="h-3.5 w-4/5 rounded" />
                <Skeleton aria-hidden="true" className="h-3 w-28 rounded" />
              </div>
            </div>
            <Skeleton aria-hidden="true" className="h-8 w-8 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListSkeleton;
