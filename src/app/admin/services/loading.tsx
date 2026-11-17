import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

export default function AdminServicesLoading() {
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
      </div>

      <TableSkeleton rows={7} columns={5} />
    </div>
  );
}
