import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface ChartSkeletonProps {
  className?: string;
  height?: string;
  bars?: number;
}

export function ChartSkeleton({
  className = '',
  height = 'h-64',
  bars = 12,
}: ChartSkeletonProps) {
  // Deterministic bar heights to simulate realistic chart throughput without layout shifts
  const heights = [40, 65, 30, 85, 55, 90, 70, 45, 80, 60, 95, 75];

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 ${className}`}
    >
      <span className="sr-only">Loading chart data...</span>
      {/* Chart Header */}
      <div aria-hidden="true" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton aria-hidden="true" className="h-5 w-44 rounded" />
          <Skeleton aria-hidden="true" className="h-3.5 w-60 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton aria-hidden="true" className="h-8 w-16 rounded-lg" />
          <Skeleton aria-hidden="true" className="h-8 w-16 rounded-lg" />
          <Skeleton aria-hidden="true" className="h-8 w-16 rounded-lg" />
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div aria-hidden="true" className={`w-full ${height} flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800`}>
        {Array.from({ length: bars }).map((_, idx) => {
          const hPercent = heights[idx % heights.length];
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <Skeleton
                aria-hidden="true"
                className="w-full rounded-t-md"
                style={{ height: `${hPercent}%` }}
              />
              <Skeleton aria-hidden="true" className="h-2.5 w-6 rounded" />
            </div>
          );
        })}
      </div>

      {/* Chart Legend / Summary */}
      <div aria-hidden="true" className="flex items-center justify-between text-xs pt-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton aria-hidden="true" className="w-3 h-3 rounded-full" />
            <Skeleton aria-hidden="true" className="h-3 w-20 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton aria-hidden="true" className="w-3 h-3 rounded-full" />
            <Skeleton aria-hidden="true" className="h-3 w-24 rounded" />
          </div>
        </div>
        <Skeleton aria-hidden="true" className="h-3.5 w-28 rounded" />
      </div>
    </div>
  );
}

export default ChartSkeleton;
