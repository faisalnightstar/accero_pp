import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { RefreshCw, AlertCircle, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = buildPageMetadata({
  title: 'Refund & Cancellation Policy | Accero PrintPortal',
  description:
    'Review the official Refund, Cancellation & Balance Policy for Accero PrintPortal. Understand prepaid utility wallet handling, automatic API rollback, and zero-risk service terms.',
  path: '/refund-policy',
  keywords: [
    'Indi Print Portal refund policy',
    'cancellation policy',
    'print portal refund',
    'CSC refund policy',
    'digital service refund',
    'wallet recharge refund',
    'print portal India',
    'accero printportal refund policy',
  ],
});

export default function RefundPolicyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Refund Policy', url: '/refund-policy' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge variant="outline" className="text-sm py-1 px-3 border-slate-300">
            Billing Transparency & Guarantees
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D3557] tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-base">
            Clear, transparent policies regarding prepaid operator balances, automatic API error rollbacks, and zero-cost re-prints.
          </p>
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Card 1: Prepaid Model & Core Principles */}
          <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
            <div className="flex items-center gap-3 text-[#1D3557]">
              <div className="p-2 bg-red-50 text-[#8B1E2D] rounded-lg">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">1. Prepaid Utility Deduction Model</h2>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm">
              Accero PrintPortal operates on a transparent, pay-as-you-go utility model. Operators top up an account balance via integrated secure payment gateways (e.g., Paytm UPI dynamic QR). Fees are deducted on a per-action basis only when a valid card verification, format, or generation request succeeds.
            </p>
          </Card>

          {/* Card 2: Automatic Rollback & Failed Lookups */}
          <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
            <div className="flex items-center gap-3 text-[#1D3557]">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">2. Automatic API Timeout & Failure Rollback</h2>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm">
              If an external government verification gateway (e.g. Income Tax PAN, Vahan RC, or Sarathi DL) fails to return data or experiences a timeout, <strong>no fee is charged</strong>. If an atomic debit occurred prior to the timeout, the software’s transactional ledger automatically issues an instantaneous reversal back into the operator’s wallet balance.
            </p>
          </Card>

          {/* Card 3: ₹0 Free Lifetime Re-Prints */}
          <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
            <div className="flex items-center gap-3 text-[#1D3557]">
              <div className="p-2 bg-blue-50 text-[#457B9D] rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">3. ₹0 Free Lifetime Re-Prints</h2>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm">
              Unlike legacy portals that charge operators again for printing adjustments or reprint requests, Accero PrintPortal saves your formatted cards. Any future reprint, re-download, or card preview from your vault is <strong>100% free of charge (₹0)</strong>.
            </p>
          </Card>

          {/* Card 4: Wallet Refund Requests */}
          <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-sm rounded-xl space-y-4">
            <div className="flex items-center gap-3 text-[#1D3557]">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">4. Operator Wallet Balance Inquiries</h2>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm">
              Operator wallet top-up credits are intended for service utilization on the platform. In exceptional cases where duplicate payments occur or where technical service discontinuation is requested, operators may submit an account closure ticket via the support portal within 7 days of the transaction. Approved balances are refunded directly to the original UPI payment source minus standard gateway handling fees.
            </p>
          </Card>

          {/* Contact Support CTA */}
          <div className="text-center pt-6 space-y-3">
            <p className="text-sm text-slate-500">
              Have questions regarding a specific transaction or wallet balance?
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/contact">
                <Button className="bg-[#8B1E2D] hover:bg-[#721824] text-white">
                  Contact Support Desk <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/terms">
                <Button variant="outline">
                  View Full Terms of Service
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
