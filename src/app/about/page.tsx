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
  CheckCircle2,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo/structuredData';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CTASection } from '@/components/public/CTASection';

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

      <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">About Accero</span>
          </nav>

          {/* Hero */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#1D3557] border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-[#8B1E2D]" />
              <span>Independent Commercial Software Platform</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight">
              About Accero PrintPortal
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              We build specialized document processing and printing software engineered to help cyber cafes, Common Service Center (CSC) operators, and retail printing businesses eliminate failed card prints and deliver official-standard PVC cards to citizens.
            </p>
          </div>

          {/* Mission & Problem Statement */}
          <Card className="p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557]">Our Mission &amp; Why We Built This</h2>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>
                In towns and cities across India, over 250,000 cyber cafe owners, CSC Village Level Entrepreneurs (VLEs), and printing kiosks provide vital document services to citizens every day. However, these small business operators consistently grapple with two severe challenges:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h3 className="font-bold text-sm text-[#1D3557]">Missing API Demographic Data</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Government or third-party lookup responses often omit critical fields—such as father name, candidate portrait, or regional language addresses. Operators are forced to either throw away expensive blank PVC cards or explain missing fields to frustrated customers.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h3 className="font-bold text-sm text-[#1D3557]">Printer Margin Drift</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Web browsers inject unpredictable margins when sending cards to desktop photo printers (such as the Epson L805 or Canon G-series). This causes edges to clip and text to fall outside physical card tray slots.
                  </p>
                </div>
              </div>
              <p className="pt-2">
                Accero PrintPortal was engineered to permanently solve these bottlenecks. By combining rapid alphanumeric lookup with an interactive split-screen live editor and a zero-margin CSS @page print engine, we ensure every card is visually verified and physically aligned before printing.
              </p>
            </div>
          </Card>

          {/* Core Operating Principles */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557]">Our Engineering Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card hoverEffect className="p-6 border border-slate-200/90 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                  <Award className="w-5 h-5 text-[#8B1E2D]" />
                </div>
                <h3 className="text-base font-bold text-[#1D3557]">ISO 7810 ID-1 Standard</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every card template conforms strictly to international CR80 dimensions (85.60 mm &times; 53.98 mm with 3.18 mm corner radii) for flawless physical tray printing.
                </p>
              </Card>

              <Card hoverEffect className="p-6 border border-slate-200/90 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-[#1D3557]">Financial Integrity</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Zero monthly subscriptions. Operators pay only for successful lookups, while re-prints of saved cards are 100% free of charge (₹0).
                </p>
              </Card>

              <Card hoverEffect className="p-6 border border-slate-200/90 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                  <Users className="w-5 h-5 text-[#457B9D]" />
                </div>
                <h3 className="text-base font-bold text-[#1D3557]">Operator-Centric UX</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bilingual Hindi Devanagari typography, drag-and-drop photo replacement, and 1-click high-DPI vector PDF exports built for fast counter throughput.
                </p>
              </Card>
            </div>
          </section>

          {/* Statutory Disambiguation Notice */}
          <section className="bg-amber-50/80 border border-amber-200 rounded-3xl p-8 space-y-4">
            <div className="flex items-center gap-3 text-amber-950">
              <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" />
              <h2 className="text-base sm:text-lg font-bold">Important Statutory Disambiguation Notice</h2>
            </div>
            <div className="space-y-3 text-xs text-amber-950 leading-relaxed">
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
                <li>The Department of Food &amp; Public Distribution (NFSA) / State Food Departments</li>
              </ul>
              <p>
                The platform operates solely as a digital layout formatting and printing utility. Users and operators must ensure that all document data processed is acquired lawfully with the explicit consent of the legitimate document owner in accordance with the Indian Information Technology Act and applicable privacy laws.
              </p>
            </div>
          </section>

          {/* CTA */}
          <CTASection
            title="Experience the Accero Difference"
            description="Format official-standard PVC cards with zero missing data at your counter today."
          />
        </div>
      </div>
    </>
  );
}
