import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getSafeRedirectUrl } from '@/lib/rbac';
import { buildPageMetadata } from '@/lib/seo/metadata';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = buildPageMetadata({
  title: 'Operator Registration | Accero PrintPortal – Free Instant VLE Signup',
  description:
    'Create your free Accero PrintPortal operator account. Zero upfront fees, instant UPI wallet activation, and access to all 7 official PVC card formats.',
  path: '/register',
  keywords: [
    'print portal registration',
    'csc print portal registration',
    'new vle register print portal',
    'indiprint portal sign up',
    'digital print portal retailer registration',
    'distributor print portal registration',
    'free print portal account',
    'cyber cafe operator registration',
    'print portal create account',
    'retailer onboarding print portal',
    'free csc print portal id',
  ],
});

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
