import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface ProfileSkeletonProps {
  className?: string;
}

export function ProfileSkeleton({ className = '' }: ProfileSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`space-y-8 max-w-4xl mx-auto ${className}`}
    >
      <span className="sr-only">Loading profile settings...</span>
      {/* Profile Header Card */}
      <div aria-hidden="true" className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        <Skeleton aria-hidden="true" className="w-20 h-20 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Skeleton aria-hidden="true" className="h-6 w-48 rounded" />
            <Skeleton aria-hidden="true" className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton aria-hidden="true" className="h-4 w-60 rounded" />
          <Skeleton aria-hidden="true" className="h-3.5 w-40 rounded" />
        </div>
        <Skeleton aria-hidden="true" className="h-10 w-32 rounded-xl shrink-0" />
      </div>

      {/* Profile Details Sections */}
      <div aria-hidden="true" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <Skeleton aria-hidden="true" className="h-5 w-36 rounded" />
            <Skeleton aria-hidden="true" className="w-6 h-6 rounded-md" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton aria-hidden="true" className="h-3 w-20 rounded" />
                <Skeleton aria-hidden="true" className="h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Business / Center Details */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <Skeleton aria-hidden="true" className="h-5 w-40 rounded" />
            <Skeleton aria-hidden="true" className="w-6 h-6 rounded-md" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton aria-hidden="true" className="h-3 w-24 rounded" />
                <Skeleton aria-hidden="true" className="h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security & Password Section */}
      <div aria-hidden="true" className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <Skeleton aria-hidden="true" className="h-5 w-44 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Skeleton aria-hidden="true" className="h-3 w-28 rounded" />
            <Skeleton aria-hidden="true" className="h-9 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton aria-hidden="true" className="h-3 w-32 rounded" />
            <Skeleton aria-hidden="true" className="h-9 w-full rounded-lg" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Skeleton aria-hidden="true" className="h-10 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default ProfileSkeleton;
