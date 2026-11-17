import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

export default function DashboardPromoCodesLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded" />
        </div>
      </div>

      <TableSkeleton rows={5} columns={4} />
    </div>
  );
}
