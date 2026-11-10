import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ShieldCheck,
  Lock,
  Server,
  Key,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Security Architecture & Data Protection | Accero PrintPortal',
  description:
    'Learn about Accero PrintPortal’s enterprise security architecture: 256-bit SSL encryption, zero credential storage, atomic financial ledger, and strict operator data boundaries.',
  path: '/security',
  keywords: [
    'accero printportal security',
    'document data security',
    'zero credential storage policy',
    'secure card printing architecture',
    'operator session encryption',
  ],
});

export default function SecurityPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Security', url: '/security' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Security</span>
          </nav>

          {/* Hero */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Enterprise-Grade Data Isolation</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight">
              Security Architecture & Data Privacy Boundaries
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Accero PrintPortal processes sensitive identity documents for businesses. We treat security, privacy, and data boundaries as non-negotiable architectural mandates.
            </p>
          </div>

          {/* Security Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#1D3557]">End-to-End Transport Encryption</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                All communications between operator web browsers, Accero servers, and payment/provider APIs are secured via modern TLS 1.3 / 256-bit SSL encryption. We enforce HTTP Strict Transport Security (HSTS) with preloading.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
                <EyeOff className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#1D3557]">Zero Government Credential Storage</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accero PrintPortal never requests, collects, logs, or stores citizen passwords, OTPs, or government credentials. API queries are executed using encrypted server-side integration tokens.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#1D3557]">Encrypted Vault & Operator Isolation</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Document snapshots saved for re-printing are stored in isolated MongoDB replica collections with AES-256 encryption-at-rest. Strict multi-tenant access controls ensure no operator can access another business’s records.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center">
                <Server className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#1D3557]">Atomic Financial Accounting</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prepaid wallet debits and recharges are managed using atomic ACID database transactions. If an external query fails or times out, funds are automatically protected from erroneous deductions.
              </p>
            </div>
          </div>

          {/* Strict SEO & Search Engine Boundaries */}
          <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-[#1D3557]">
              Strict Search Engine & Indexing Boundaries
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We strictly enforce that personal customer information must never appear in search engines, public logs, or crawlable HTML. Our infrastructure guarantees:
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Operator dashboards, studios, and wallets are protected behind server-side authentication with strict <code>noindex, nofollow</code> headers.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Customer names, Aadhaar numbers, PAN strings, and addresses are strictly excluded from URLs, page titles, and sitemaps.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>AI web search bots (GPTBot, PerplexityBot) are restricted to public marketing and educational guides only.</span>
              </li>
            </ul>
          </section>

          {/* Compliance Disclaimer */}
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Compliance Notice:</strong> Accero PrintPortal is an independent commercial software platform. It is not an official government portal, and is not affiliated with UIDAI, NSDL, UTIITSL, ECI, or RTO authorities. Operators are solely responsible for obtaining lawful customer consent and complying with Indian IT Act provisions when formatting identity cards.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

