import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'PAN Card Verification & Demographic Lookup | Accero PrintPortal',
  description:
    'Instant PAN verification gateway. Verify cardholder name, father name, and DOB from Income Tax database with zero-risk fee structure.',
  path: '/pan-lookup',
});

export default function PanLookupRedirectPage() {
  redirect('/dashboard/pan-lookup');
}
