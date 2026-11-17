import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface FormSkeletonProps {
  fields?: number;
  columns?: 1 | 2;
  className?: string;
  hasSubmitButton?: boolean;
}

export function FormSkeleton({
  fields = 4,
  columns = 2,
  className = '',
  hasSubmitButton = true,
}: FormSkeletonProps) {
  const fieldList = Array.from({ length: fields }, (_, i) => i);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-6 ${className}`}
    >
      <span className="sr-only">Loading form fields...</span>
      <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4" aria-hidden="true">
        <Skeleton aria-hidden="true" className="h-6 w-48 rounded" />
        <Skeleton aria-hidden="true" className="h-4 w-72 rounded" />
      </div>

      <div
        aria-hidden="true"
        className={`grid gap-5 ${
          columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {fieldList.map((idx) => (
          <div key={`field-${idx}`} className="space-y-2">
            <Skeleton aria-hidden="true" className="h-3.5 w-28 rounded" />
            <Skeleton aria-hidden="true" className="h-10 w-full rounded-lg" />
            <Skeleton aria-hidden="true" className="h-3 w-40 rounded" />
          </div>
        ))}
      </div>

      {hasSubmitButton && (
        <div aria-hidden="true" className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Skeleton aria-hidden="true" className="h-10 w-24 rounded-lg" />
          <Skeleton aria-hidden="true" className="h-10 w-32 rounded-lg" />
        </div>
      )}
    </div>
  );
}

export default FormSkeleton;
