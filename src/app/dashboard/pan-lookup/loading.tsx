import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FormSkeleton } from '@/components/skeletons/FormSkeleton';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

export default function PanLookupLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-8 w-56 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-80 rounded" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <FormSkeleton fields={2} columns={1} hasSubmitButton={true} />

      <div className="space-y-4">
        <Skeleton className="h-6 w-48 rounded" />
        <TableSkeleton rows={5} columns={4} />
      </div>
    </div>
  );
}
