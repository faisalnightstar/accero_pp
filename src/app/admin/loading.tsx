import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CardSkeleton } from '@/components/skeletons/CardSkeleton';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

export default function AdminLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="space-y-6"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52 rounded-lg bg-slate-800" />
          <Skeleton className="h-4 w-80 rounded bg-slate-800/80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl bg-slate-800" />
          <Skeleton className="h-9 w-36 rounded-xl bg-slate-800" />
        </div>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-24 h-4 rounded bg-slate-800" />
              <Skeleton className="w-8 h-8 rounded-lg bg-slate-800" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="w-32 h-7 rounded-md bg-slate-800" />
              <Skeleton className="w-20 h-3 rounded bg-slate-800/80" />
            </div>
          </div>
        ))}
      </div>

      {/* Admin Secondary Grid / Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <Skeleton className="h-5 w-40 rounded bg-slate-800" />
              <Skeleton className="h-4 w-24 rounded bg-slate-800" />
            </div>
            <TableSkeleton rows={4} columns={4} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <Skeleton className="h-5 w-36 rounded bg-slate-800" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28 rounded bg-slate-800" />
                    <Skeleton className="h-3 w-16 rounded bg-slate-800/80" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full bg-slate-800" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
