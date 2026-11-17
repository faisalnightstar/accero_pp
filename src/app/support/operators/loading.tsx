import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

export default function SupportOperatorsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6"
    >
      <span className="sr-only">Loading operator directory and lookup...</span>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5" aria-hidden="true">
        <div className="space-y-2">
          <Skeleton aria-hidden="true" className="h-8 w-60 rounded-lg" />
          <Skeleton aria-hidden="true" className="h-4 w-96 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton aria-hidden="true" className="h-10 w-64 rounded-xl" />
        </div>
      </div>

      <TableSkeleton rows={6} columns={5} />
    </div>
  );
}
