import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getSafeRedirectUrl } from '@/lib/rbac';
import { buildPageMetadata } from '@/lib/seo/metadata';
import LoginForm from './LoginForm';

export const metadata: Metadata = buildPageMetadata({
  title: 'Operator Login | Accero PrintPortal – Access CSC & Cyber Cafe Card Studio',
  description:
    'Sign in to Accero PrintPortal. Access your operator wallet, document lookup cascade, live CR80 split-screen card editor, and free lifetime reprints.',
  path: '/login',
  keywords: [
    'print portal login',
    'csc print portal login',
    'indiprint portal login',
    'digital print portal sign in',
    'vle print portal login',
    'operator login print portal',
    'fast print portal login',
    'retail print portal login',
    'print portal member login',
    'distributor login print portal',
    'cyber cafe login portal',
    'acp print login',
    'free print portal login',
  ],
});

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
