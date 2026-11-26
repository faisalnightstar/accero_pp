import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = buildPageMetadata({
  title: 'Reset Password & Account Recovery | Accero PrintPortal',
  description:
    'Recover your Accero PrintPortal operator account password via registered mobile number or email.',
  path: '/forgot-password',
  keywords: [
    'print portal password reset',
    'indiprint portal forgot password',
    'csc print portal password recovery',
    'vle login password reset',
    'digital print portal account recovery',
    'operator password reset',
    'reset print portal credentials',
    'fast print portal forgot password',
    'acp print password reset',
    'cyber cafe operator login recovery',
  ],
});

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <Suspense
        fallback={
          <div className="max-w-md w-full p-8 text-center text-slate-500">
            Loading reset portal...
          </div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
