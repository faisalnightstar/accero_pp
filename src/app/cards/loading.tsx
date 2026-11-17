import React from 'react';
import { DocumentSkeleton } from '@/components/skeletons/DocumentSkeleton';

export default function CardsLoading() {
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <DocumentSkeleton splitView={true} />
    </div>
  );
}
