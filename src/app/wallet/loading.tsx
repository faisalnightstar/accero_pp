import React from 'react';
import { WalletSkeleton } from '@/components/skeletons/WalletSkeleton';

export default function WalletLoading() {
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <WalletSkeleton />
    </div>
  );
}
