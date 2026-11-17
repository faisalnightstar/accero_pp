import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

export default function AdminOperatorsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-lg bg-slate-800" />
          <Skeleton className="h-4 w-80 rounded bg-slate-800/80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl bg-slate-800" />
        </div>
      </div>

      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
        <Skeleton className="h-10 w-full rounded-lg bg-slate-800" />
        <Skeleton className="h-10 w-28 rounded-lg bg-slate-800" />
      </div>

      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}
