import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ShieldCheck,
  Building2,
  Printer,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Award,
  Users,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'About Accero PrintPortal | Independent Document Processing SaaS',
  description:
    'Learn about Accero PrintPortal, our mission to simplify document processing and PVC card tray printing for cyber cafes, CSC operators, and printing shops across India.',
  path: '/about',
  keywords: [
    'about accero printportal',
    'accero technologies',
    'independent document printing platform',
    'cyber cafe printing software company',
    'cr80 document formatting saas',
  ],
});

export default function AboutPage() {
  const orgSchema = generateOrganizationSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
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
            <span className="text-[#8B1E2D]">About Accero</span>
          </nav>

          {/* Hero */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-[#8B1E2D] border border-red-200">
              <Sparkles className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Independent Commercial Software Platform</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight">
              About Accero PrintPortal
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              We build specialized document processing and printing software engineered to help cyber cafes, Common Service Center (CSC) operators, and retail printing businesses eliminate failed card prints and deliver official-standard PVC cards to citizens.
            </p>
          </div>

          {/* Mission & Problem Statement */}
          <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557]">Our Mission & Why We Built This</h2>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>
                In towns and cities across India, over 250,000 cyber cafe owners, CSC Village Level Entrepreneurs (VLEs), and printing kiosks provide vital document services to citizens every day. However, these small business operators consistently grapple with two severe challenges:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li>
                  <strong>Missing API Demographic Data:</strong> Government or third-party lookup responses often omit critical fields—such as father name, candidate portrait, or regional language addresses. Operators are forced to either throw away expensive blank PVC cards or explain missing fields to frustrated customers.
                </li>
                <li>
                  <strong>Printer Margin Drift:</strong> Web browsers inject unpredictable margins when sending cards to desktop photo printers (such as the Epson L805 or Canon G-series). This causes edges to clip and text to fall outside physical card tray slots.
                </li>
              </ul>
              <p>
                Accero PrintPortal was engineered to permanently solve these bottlenecks. By combining rapid alphanumeric lookup with an interactive split-screen live editor and a zero-margin CSS @page print engine, we ensure every card is visually verified and physically aligned before printing.
              </p>
            </div>
          </section>

          {/* Core Operating Principles */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557]">Our Engineering Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Award className="w-6 h-6 text-[#8B1E2D]" />
                <h3 className="text-base font-bold text-[#1D3557]">ISO 7810 ID-1 Standard</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every card template conforms strictly to international CR80 dimensions (85.60 mm × 53.98 mm with 3.18 mm corner radii) for flawless physical tray printing.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Financial Integrity</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Zero monthly subscriptions. Operators pay only for successful lookups, while re-prints of saved cards are 100% free of charge (₹0).
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Operator-Centric UX</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bilingual Hindi Devanagari typography, drag-and-drop photo replacement, and 1-click high-DPI vector PDF exports built for fast counter throughput.
                </p>
              </div>
            </div>
          </section>

          {/* Regulatory & Disambiguation Notice */}
          <section className="bg-amber-50 border border-amber-200 rounded-3xl p-8 space-y-4">
            <div className="flex items-center gap-3 text-amber-900">
              <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" />
              <h2 className="text-lg font-bold">Important Statutory Disambiguation Notice</h2>
            </div>
            <div className="space-y-3 text-xs text-amber-900 leading-relaxed">
              <p>
                <strong>Accero PrintPortal is an independent commercial software product</strong> developed and maintained by Accero Technologies.
              </p>
              <p>
                Accero PrintPortal is <strong>NOT</strong> an official government portal, and is not affiliated with, endorsed by, authorized by, or an official partner of:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Unique Identification Authority of India (UIDAI) / Aadhaar</li>
                <li>NSDL e-Governance Infrastructure Limited or UTI Infrastructure Technology And Services Limited (UTIITSL)</li>
                <li>The Election Commission of India (ECI)</li>
                <li>The Ministry of Road Transport and Highways (MoRTH) / Parivahan / State RTOs</li>
                <li>The Department of Food & Public Distribution (NFSA) / State Food Departments</li>
              </ul>
              <p>
                The platform operates solely as a digital layout formatting and printing utility. Users and operators must ensure that all document data processed is acquired lawfully with the explicit consent of the legitimate document owner in accordance with the Indian Information Technology Act and applicable privacy laws.
              </p>
            </div>
          </section>

          {/* Quick CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-8 rounded-3xl bg-[#1D3557] text-white">
            <div>
              <h3 className="text-lg font-bold">Experience the Accero Difference</h3>
              <p className="text-xs text-slate-300">Format official-standard PVC cards with zero missing data.</p>
            </div>
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all shrink-0"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

