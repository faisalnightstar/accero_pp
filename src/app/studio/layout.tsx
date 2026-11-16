import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { buildPrivateMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPrivateMetadata('Split-Screen Card Studio');
export const dynamic = 'force-dynamic';

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login?redirect=/studio');
  }

  return <>{children}</>;
}
