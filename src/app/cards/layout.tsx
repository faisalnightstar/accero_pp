import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getOperatorUserSession } from '@/lib/layout/operatorSession';
import { buildPrivateMetadata } from '@/lib/seo/metadata';
import OperatorShell from '@/components/layout/operator/OperatorShell';

export const metadata: Metadata = buildPrivateMetadata('Card Formatting Canvas');
export const dynamic = 'force-dynamic';

export default async function CardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOperatorUserSession();

  if (!user) {
    redirect('/login?redirect=/cards');
  }

  return <OperatorShell user={user}>{children}</OperatorShell>;
}
