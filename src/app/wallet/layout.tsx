import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { buildPrivateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPrivateMetadata('Operator Wallet & Ledger');
export const dynamic = 'force-dynamic';

export default async function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login?redirect=/wallet');
  }

  return <>{children}</>;
}
