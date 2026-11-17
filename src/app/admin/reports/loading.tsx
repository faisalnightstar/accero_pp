import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartSkeleton } from '@/components/skeletons/ChartSkeleton';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

export default function AdminReportsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="space-y-6"
    >
      <span className="sr-only">Loading financial reports and analytics...</span>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5" aria-hidden="true">
        <div className="space-y-2">
          <Skeleton aria-hidden="true" className="h-8 w-60 rounded-lg bg-slate-800" />
          <Skeleton aria-hidden="true" className="h-4 w-96 rounded bg-slate-800/80" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton aria-hidden="true" className="h-9 w-32 rounded-xl bg-slate-800" />
          <Skeleton aria-hidden="true" className="h-9 w-28 rounded-xl bg-slate-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-sm space-y-3">
            <Skeleton aria-hidden="true" className="w-24 h-4 rounded bg-slate-800" />
            <Skeleton aria-hidden="true" className="w-32 h-7 rounded-md bg-slate-800" />
          </div>
        ))}
      </div>

      <ChartSkeleton bars={12} />
      <TableSkeleton rows={6} columns={5} />
    </div>
  );
}
