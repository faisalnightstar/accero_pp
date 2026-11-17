import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface CardSkeletonProps {
  className?: string;
  variant?: 'stat' | 'service' | 'compact';
}

export function CardSkeleton({ className = '', variant = 'stat' }: CardSkeletonProps) {
  if (variant === 'service') {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm space-y-4 ${className}`}
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">Loading service card...</span>
        <div className="flex items-center justify-between" aria-hidden="true">
          <Skeleton aria-hidden="true" className="w-12 h-12 rounded-xl" />
          <Skeleton aria-hidden="true" className="w-20 h-5 rounded-full" />
        </div>
        <div className="space-y-2" aria-hidden="true">
          <Skeleton aria-hidden="true" className="w-3/4 h-5 rounded" />
          <Skeleton aria-hidden="true" className="w-1/2 h-3.5 rounded" />
        </div>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between" aria-hidden="true">
          <Skeleton aria-hidden="true" className="w-16 h-4 rounded" />
          <Skeleton aria-hidden="true" className="w-24 h-8 rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex items-center justify-between ${className}`}
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">Loading card...</span>
        <div className="space-y-2" aria-hidden="true">
          <Skeleton aria-hidden="true" className="w-24 h-3.5 rounded" />
          <Skeleton aria-hidden="true" className="w-16 h-5 rounded" />
        </div>
        <Skeleton aria-hidden="true" className="w-10 h-10 rounded-lg" />
      </div>
    );
  }

  // Default: 'stat' card
  return (
    <div
      className={`p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-3 ${className}`}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading metric card...</span>
      <div className="flex items-center justify-between" aria-hidden="true">
        <Skeleton aria-hidden="true" className="w-24 h-4 rounded" />
        <Skeleton aria-hidden="true" className="w-8 h-8 rounded-lg" />
      </div>
      <div className="space-y-1.5" aria-hidden="true">
        <Skeleton aria-hidden="true" className="w-32 h-7 rounded-md" />
        <Skeleton aria-hidden="true" className="w-20 h-3 rounded" />
      </div>
    </div>
  );
}

export default CardSkeleton;
