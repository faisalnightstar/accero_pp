import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CardSkeleton } from '@/components/skeletons/CardSkeleton';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

export default function AdminCampaignsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="space-y-6"
    >
      <span className="sr-only">Loading promotional campaigns...</span>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5" aria-hidden="true">
        <div className="space-y-2">
          <Skeleton aria-hidden="true" className="h-8 w-64 rounded-lg bg-slate-800" />
          <Skeleton aria-hidden="true" className="h-4 w-96 rounded bg-slate-800/80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton aria-hidden="true" className="h-9 w-36 rounded-xl bg-slate-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} variant="compact" />
        ))}
      </div>

      <TableSkeleton rows={6} columns={5} />
    </div>
  );
}
