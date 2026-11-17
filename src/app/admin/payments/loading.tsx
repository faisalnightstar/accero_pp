import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

export default function AdminPaymentsLoading() {
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-sm space-y-3"
          >
            <Skeleton className="w-24 h-4 rounded bg-slate-800" />
            <Skeleton className="w-32 h-7 rounded-md bg-slate-800" />
          </div>
        ))}
      </div>

      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
