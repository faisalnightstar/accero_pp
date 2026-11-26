import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'PAN Card Verification & Demographic Lookup | Accero PrintPortal',
  description:
    'Instant PAN verification gateway. Verify cardholder name, father name, and DOB from Income Tax database with zero-risk fee structure.',
  path: '/pan-lookup',
  keywords: [
    'pan lookup portal',
    'pan find print portal',
    'aadhaar to pan find',
    'lost pan number find by aadhaar',
    'aadhar se pan number nikale',
    'pan number search portal',
    'instant pan pdf download',
    'pan find service for csc vle',
    'pan card verification gateway',
    'pan card number lookup online',
    'verify pan card demographic details',
    'pan card father name lookup',
    'income tax pan verification api',
    'instant pan number verification',
    'pan card details by pan number',
  ],
});

export default function PanLookupRedirectPage() {
  redirect('/dashboard/pan-lookup');
}
