import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getSafeRedirectUrl } from '@/lib/rbac';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <Suspense
        fallback={
          <div className="max-w-md w-full p-8 text-center text-slate-500">
            Loading login portal...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
