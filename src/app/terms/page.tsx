import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { FileText, AlertTriangle } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Terms of Service | Accero PrintPortal',
  description:
    'Review the Terms of Service for Accero PrintPortal. Understand operator usage conditions, prepaid billing terms, compliance requirements, and liability boundaries.',
  path: '/terms',
  keywords: ['accero printportal terms of service', 'operator terms', 'saas usage agreement'],
});

export default function TermsOfServicePage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Terms of Service', url: '/terms' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Terms of Service</span>
          </nav>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-[#1D3557] tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-500">Last materially revised: November 2026</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-base font-bold text-[#1D3557]">1. Acceptance of Terms</h2>
              <p>
                By registering, accessing, or using Accero PrintPortal (https://printportal.accero.app), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not access or use the platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-[#1D3557]">2. Platform Nature & Independent Utility Status</h2>
              <p>
                Accero PrintPortal is an independent commercial B2B software tool engineered to format preformatted document layouts conforming to ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm) for physical card printer trays.
              </p>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <strong>Crucial Regulatory Disclaimer:</strong> Accero PrintPortal is NOT an official government portal and does NOT issue statutory identity cards, manufacture credentials, or impersonate government agencies. Accero Technologies is not affiliated with or endorsed by UIDAI, NSDL, UTIITSL, Election Commission of India, MoRTH, or State Food Departments.
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-[#1D3557]">3. Permitted Operator Use & Lawful Authorization</h2>
              <p>Operators must adhere to strict operational guidelines:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>You may only format and print documents with the lawful, informed consent of the individual cardholder.</li>
                <li>You must not use the platform to fabricate fraudulent identities, alter statutory records, or misrepresent documents.</li>
                <li>You agree to indemnify Accero Technologies against any claims or legal liabilities arising from unlawful document processing or unauthorized access at your business premises.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-[#1D3557]">4. Prepaid Wallet & Financial Terms</h2>
              <p>
                Accero operates on a prepaid utility deduction model. Recharges are executed via integrated payment gateways (e.g. Paytm UPI). Wallet balances are non-refundable and intended solely for debit against valid card formatting actions on the portal. Re-prints of saved cards are provided at ₹0.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-[#1D3557]">5. Disclaimer of Warranties & Availability</h2>
              <p>
                The platform is provided "as is" and "as available". While Accero maintains automated multi-provider failover, we do not guarantee uninterrupted third-party API availability. In the event an external API is offline, operators may utilize manual drafting mode.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-[#1D3557]">6. Governing Law & Jurisdiction</h2>
              <p>
                These Terms are governed by the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in India.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

