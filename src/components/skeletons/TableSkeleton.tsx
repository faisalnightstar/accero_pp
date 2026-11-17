import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
  hasActions?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = '',
  hasActions = true,
}: TableSkeletonProps) {
  const rowList = Array.from({ length: rows }, (_, i) => i);
  const colList = Array.from({ length: columns }, (_, i) => i);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm ${className}`}
    >
      <span className="sr-only">Loading data table...</span>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" aria-hidden="true">
          {showHeader && (
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
                {colList.map((colIdx) => (
                  <th key={`th-${colIdx}`} className="px-4 py-3.5 sm:px-6">
                    <Skeleton
                      aria-hidden="true"
                      className={`h-4 rounded ${
                        colIdx === 0
                          ? 'w-24'
                          : colIdx === 1
                          ? 'w-32'
                          : colIdx === 2
                          ? 'w-20'
                          : 'w-16'
                      }`}
                    />
                  </th>
                ))}
                {hasActions && (
                  <th className="px-4 py-3.5 sm:px-6 text-right">
                    <Skeleton aria-hidden="true" className="h-4 w-14 rounded ml-auto" />
                  </th>
                )}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {rowList.map((rowIdx) => (
              <tr key={`tr-${rowIdx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                {colList.map((colIdx) => (
                  <td key={`td-${rowIdx}-${colIdx}`} className="px-4 py-4 sm:px-6">
                    {colIdx === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton aria-hidden="true" className="w-8 h-8 rounded-lg shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton aria-hidden="true" className="h-4 w-28 rounded" />
                          <Skeleton aria-hidden="true" className="h-3 w-16 rounded" />
                        </div>
                      </div>
                    ) : colIdx === 1 ? (
                      <Skeleton aria-hidden="true" className="h-4 w-36 rounded" />
                    ) : colIdx === 2 ? (
                      <Skeleton aria-hidden="true" className="h-5 w-20 rounded-full" />
                    ) : (
                      <Skeleton aria-hidden="true" className="h-4 w-24 rounded" />
                    )}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton aria-hidden="true" className="h-8 w-16 rounded-lg" />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableSkeleton;
