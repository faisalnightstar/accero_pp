'use client';

import React, { useState } from 'react';
import OperatorHeader, { OperatorUserData } from './OperatorHeader';
import RechargeModal from '@/components/wallet/RechargeModal';

export interface OperatorShellProps {
  user: OperatorUserData;
  children: React.ReactNode;
}

export default function OperatorShell({ user, children }: OperatorShellProps) {
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans antialiased">
      {/* Operator Header with dynamic breadcrumbs, live balance, and profile */}
      <OperatorHeader
        user={user}
        onRechargeClick={() => setIsRechargeOpen(true)}
      />

      {/* Operator Main Workspace */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Global Operator Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
      />
    </div>
  );
}
