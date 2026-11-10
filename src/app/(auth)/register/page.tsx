import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getSafeRedirectUrl } from '@/lib/rbac';
import RegisterForm from './RegisterForm';

export const dynamic = 'force-dynamic';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  if (session) {
    const rawRedirect =
      typeof params?.returnTo === 'string'
        ? params.returnTo
        : typeof params?.redirect === 'string'
        ? params.redirect
        : null;
    const destination = getSafeRedirectUrl(rawRedirect, session.role);
    redirect(destination);
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center p-8 text-slate-500">
          Loading registration...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
