import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOperatorUserSession } from '@/lib/layout/operatorSession';
import { buildPrivateMetadata } from '@/lib/seo/metadata';
import OperatorShell from '@/components/layout/operator/OperatorShell';

export const metadata: Metadata = buildPrivateMetadata('Operator Wallet & Ledger');
export const dynamic = 'force-dynamic';

export default async function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOperatorUserSession();

  if (!user) {
    redirect('/login?redirect=/wallet');
  }

  return <OperatorShell user={user}>{children}</OperatorShell>;
}
