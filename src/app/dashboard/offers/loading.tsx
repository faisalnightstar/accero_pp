import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CardSkeleton } from '@/components/skeletons/CardSkeleton';

export default function OffersLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8"
    >
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-5">
        <Skeleton className="h-8 w-60 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} variant="service" />
        ))}
      </div>
    </div>
  );
}
