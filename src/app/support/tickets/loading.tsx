import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ListSkeleton } from '@/components/skeletons/ListSkeleton';

export default function SupportTicketsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      <ListSkeleton items={6} hasHeader={false} />
    </div>
  );
}
