import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CardSkeleton } from './CardSkeleton';
import { TableSkeleton } from './TableSkeleton';

export interface DashboardSkeletonProps {
  className?: string;
}

export function DashboardSkeleton({ className = '' }: DashboardSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`space-y-8 max-w-7xl mx-auto ${className}`}
    >
      <span className="sr-only">Loading dashboard workspace...</span>
      {/* Top Welcome & Operator Banner */}
      <div aria-hidden="true" className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton aria-hidden="true" className="h-7 w-52 rounded-lg" />
            <Skeleton aria-hidden="true" className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton aria-hidden="true" className="h-4 w-72 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton aria-hidden="true" className="h-11 w-36 rounded-xl" />
          <Skeleton aria-hidden="true" className="h-11 w-40 rounded-xl" />
        </div>
      </div>

      {/* 4 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} variant="stat" />
        ))}
      </div>

      {/* Services Grid Header & Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-44 rounded" />
            <Skeleton className="h-3.5 w-60 rounded" />
          </div>
          <Skeleton className="h-4 w-28 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <CardSkeleton key={i} variant="service" />
          ))}
        </div>
      </div>

      {/* Document Library Table Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-52 rounded" />
            <Skeleton className="h-3.5 w-48 rounded" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>

        <TableSkeleton rows={5} columns={4} />
      </div>
    </div>
  );
}

export default DashboardSkeleton;
