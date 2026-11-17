import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TableSkeleton } from './TableSkeleton';

export interface WalletSkeletonProps {
  className?: string;
}

export function WalletSkeleton({ className = '' }: WalletSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`space-y-8 max-w-7xl mx-auto ${className}`}
    >
      <span className="sr-only">Loading wallet ledger...</span>
      {/* Header Skeleton */}
      <div aria-hidden="true" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Skeleton aria-hidden="true" className="w-8 h-8 rounded-lg" />
            <Skeleton aria-hidden="true" className="h-8 w-44 rounded-lg" />
          </div>
          <Skeleton aria-hidden="true" className="h-4 w-72 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton aria-hidden="true" className="h-10 w-28 rounded-xl" />
          <Skeleton aria-hidden="true" className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Financial Overview Cards Grid */}
      <div aria-hidden="true" className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Main Available Balance Card Skeleton */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton aria-hidden="true" className="h-4 w-28 rounded" />
            <Skeleton aria-hidden="true" className="w-9 h-9 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton aria-hidden="true" className="h-9 w-36 rounded-md" />
            <Skeleton aria-hidden="true" className="h-3.5 w-48 rounded" />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Skeleton aria-hidden="true" className="h-4 w-24 rounded" />
            <Skeleton aria-hidden="true" className="h-8 w-24 rounded-lg" />
          </div>
        </div>

        {/* Total Credited Card Skeleton */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton aria-hidden="true" className="h-4 w-28 rounded" />
            <Skeleton aria-hidden="true" className="w-9 h-9 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton aria-hidden="true" className="h-9 w-32 rounded-md" />
            <Skeleton aria-hidden="true" className="h-3.5 w-40 rounded" />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Skeleton aria-hidden="true" className="h-4 w-32 rounded" />
          </div>
        </div>

        {/* Total Debited Card Skeleton */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton aria-hidden="true" className="h-4 w-28 rounded" />
            <Skeleton aria-hidden="true" className="w-9 h-9 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton aria-hidden="true" className="h-9 w-32 rounded-md" />
            <Skeleton aria-hidden="true" className="h-3.5 w-40 rounded" />
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Skeleton aria-hidden="true" className="h-4 w-32 rounded" />
          </div>
        </div>
      </div>

      {/* Preset Recharge Plan Chips Skeleton */}
      <div aria-hidden="true" className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton aria-hidden="true" className="h-4 w-40 rounded" />
          <Skeleton aria-hidden="true" className="h-4 w-24 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((idx) => (
            <Skeleton aria-hidden="true" key={idx} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Transactions History Header & Table Skeleton */}
      <div className="space-y-4">
        <div aria-hidden="true" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <Skeleton aria-hidden="true" className="h-6 w-48 rounded" />
            <Skeleton aria-hidden="true" className="h-3.5 w-64 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton aria-hidden="true" className="h-9 w-32 rounded-lg" />
            <Skeleton aria-hidden="true" className="h-9 w-24 rounded-lg" />
          </div>
        </div>

        {/* Ledger Table Skeleton */}
        <TableSkeleton rows={6} columns={5} />
      </div>
    </div>
  );
}

export default WalletSkeleton;
