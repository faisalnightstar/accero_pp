import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ListSkeleton } from '@/components/skeletons/ListSkeleton';

export default function SupportKnowledgeBaseLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6"
    >
      <span className="sr-only">Loading knowledge base articles...</span>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5" aria-hidden="true">
        <div className="space-y-2">
          <Skeleton aria-hidden="true" className="h-8 w-60 rounded-lg" />
          <Skeleton aria-hidden="true" className="h-4 w-80 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton aria-hidden="true" className="h-10 w-48 rounded-xl" />
        </div>
      </div>

      <div className="flex items-center gap-2 pb-2 overflow-x-auto" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} aria-hidden="true" className="h-8 w-24 rounded-full shrink-0" />
        ))}
      </div>

      <ListSkeleton items={6} hasHeader={false} />
    </div>
  );
}
