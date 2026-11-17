import React from 'react';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';

export default function DashboardLoading() {
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <DashboardSkeleton />
    </div>
  );
}
