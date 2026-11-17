import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

export default function AdminTeamLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="space-y-6"
    >
      <span className="sr-only">Loading team members and permissions...</span>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5" aria-hidden="true">
        <div className="space-y-2">
          <Skeleton aria-hidden="true" className="h-8 w-56 rounded-lg bg-slate-800" />
          <Skeleton aria-hidden="true" className="h-4 w-96 rounded bg-slate-800/80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton aria-hidden="true" className="h-9 w-36 rounded-xl bg-slate-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm space-y-2">
            <Skeleton aria-hidden="true" className="w-20 h-3.5 rounded bg-slate-800" />
            <Skeleton aria-hidden="true" className="w-16 h-6 rounded bg-slate-800" />
          </div>
        ))}
      </div>

      <TableSkeleton rows={6} columns={4} />
    </div>
  );
}
