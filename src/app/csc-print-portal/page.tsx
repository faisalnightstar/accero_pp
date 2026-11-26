import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  Award,
  Wallet,
  Users,
  Compass,
  FileCheck,
  Cpu,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { FAQSection } from '@/components/public/FAQSection';
import { CTASection } from '@/components/public/CTASection';

export const metadata: Metadata = buildPageMetadata({
  title: 'CSC Print Portal – Official Standard PVC Card Printing for VLEs | Accero',
  description:
    'Dedicated CSC print portal engineered for Village Level Entrepreneurs (VLEs) and Digital Seva Kendras. Format PAN, Aadhaar, Voter, DL, RC and Ration PVC cards with zero waste.',
  path: '/csc-print-portal',
  keywords: [
    'csc print portal',
    'csc vle print portal',
    'vle print portal',
    'csc pvc card print online',
    'main print portal',
    'vle club print portal',
    'advance aadhar print portal',
    'manual print portal csc',
    'webapiking print alternative',
    'printcsc in alternative',
    'fastergyan print tools alternative',
    'digital seva print portal',
    'digital seva card software',
    'jan seva kendra print portal',
    'csc pan card print portal',
    'csc voter print portal',
    'csc aadhaar print portal',
    'csc ration card print portal',
    'csc id card print software',
    'vle card printing software 2026',
    'maha e seva kendra print portal',
    'सीएससी प्रिंट पोर्टल',
    'सीएससी वीएलई पोर्टल',
    'जन सेवा केंद्र कार्ड प्रिंट सॉफ्टवेयर',
  ],
});

const vleWorkflows = [
  {
    title: 'Instant Alphanumeric ID Lookup with Multi-Provider Cascade',
    desc: 'When rural citizens visit your CSC kiosk with just an ID number or registration slip, quickly fetch verifiable demographic records across high-availability fallback channels.',
    icon: Sparkles,
  },
  {
    title: 'Amber Alert Missing Field Prevention',
    desc: 'Never hand a rural citizen an incomplete PVC card. If father name, signature, or photo is missing from external government feeds, our live editor flags it in amber for instant entry.',
    icon: AlertTriangle,
  },
  {
    title: '100% Free Lifetime Re-Prints (₹0 Deductions)',
    desc: 'When a citizen misplaces their PVC card and returns to your Kendra for a reprint, generate it directly from your encrypted vault with zero wallet deduction.',
    icon: Award,
  },
  {
    title: 'Bilingual Devanagari Regional Typography',
    desc: 'Full regional script rendering for Hindi, Bengali, Gujarati, Marathi, and Tamil, ensuring names and village addresses match local Gram Panchayat records.',
    icon: Layers,
  },
  {
    title: 'Zero-Margin Hardware Tray Precision',
    desc: 'Outputs exact 85.60 mm × 53.98 mm ISO/IEC 7810 ID-1 standard dimensions engineered for Epson L805, L850, L8050 Tray J and Canon Pixma ID card trays.',
    icon: Printer,
  },
  {
    title: 'Automated Atomic Wallet Rollback',
    desc: 'Never lose money on failed government portal queries. If an external lookup times out or fails, our ledger automatically refunds your balance in milliseconds.',
    icon: Wallet,
  },
];

const cscComparison = [
  {
    feature: 'Incomplete API Records',
    legacy: 'Prints cards with blank spaces or missing father names, wasting ₹25–₹35 PVC plastic stock.',
    accero: 'Split-screen studio flags missing fields in amber, allowing instant inline completion before printing.',
  },
  {
    feature: 'Customer Re-Prints',
    legacy: 'Charges full wallet fee every time a returning citizen requests an extra copy.',
    accero: '100% free lifetime re-prints (₹0) from your secure operator vault. Keep 100% of your retail service fee.',
  },
  {
    feature: 'Server Uptime During Rush',
    legacy: 'Frequent 502 Bad Gateway timeouts on cheap shared hosting during peak morning Kendra hours.',
    accero: '99.9% platform availability on Vercel Edge with sub-100ms response times.',
  },
  {
    feature: 'Failed Lookup Billing',
    legacy: 'Deducts wallet balance even on failed queries; requires manual WhatsApp complaints for refunds.',
    accero: 'Zero fee deducted (₹0). Failed or timed-out queries trigger automatic atomic wallet rollbacks.',
  },
];

const cscFaqs = [
  {
    question: 'What is a CSC Print Portal?',
    answer:
      'A CSC Print Portal is a specialized web software platform used by Common Service Centre (CSC) Village Level Entrepreneurs (VLEs) and Digital Seva Kendra operators across India to format, preview, and print identity cards (such as PAN, Aadhaar PVC format, Voter ID, Driving Licence, Vehicle RC, and Ration Cards) onto physical CR80 PVC plastic cards.',
  },
  {
    question: 'Is Accero PrintPortal affiliated with CSC e-Governance Services India Limited?',
    answer:
      'No. Accero PrintPortal is an independent commercial software platform built to provide document layout preparation and printing tools for VLEs and cyber cafes. It is not affiliated with, endorsed by, or partnered with CSC e-Governance Services India Limited, the Digital Seva Portal (digitalseva.csc.gov.in), or any government department.',
  },
  {
    question: 'How does Accero PrintPortal help CSC VLEs eliminate wasted PVC cards?',
    answer:
      'Rural citizens often travel significant distances to a Digital Seva Kendra. Accero features a real-time split-screen studio that inspects demographic records retrieved via lookup. If any crucial detail (such as father name, applicant photo, or address) is missing, the field is highlighted with an amber alert, allowing the VLE to fill the missing data before printing.',
  },
  {
    question: 'Which printers and trays are supported for CSC card printing?',
    answer:
      'Accero PrintPortal generates pixel-perfect 1:1 vector outputs strictly conforming to ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm). It is natively compatible with Epson EcoTank L805, L850, L8050 Tray J (2-card tray) and Canon PIXMA G-Series PVC card trays.',
  },
  {
    question: 'How do wallet recharges work for CSC operators?',
    answer:
      'Accero operates on a transparent pay-as-you-print model with zero monthly subscription fees. Operators can top up their wallet instantly starting from ₹100 using dynamic UPI QR codes. Manual drafting is just ₹5/card, and verified lookups range from ₹20 to ₹30, with all subsequent reprints 100% free forever.',
  },
];

export default function CscPrintPortalPage() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Specialized Portals', url: '/print-portal' },
    { name: 'CSC Print Portal', url: '/csc-print-portal' },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const softwareSchema = generateSoftwareApplicationSchema(
    'Accero CSC Print Portal',
    'BusinessApplication',
    [
      'CSC Village Level Entrepreneur PVC Card Formatting',
      'Instant Alphanumeric ID Lookup with Silent Fallback',
      'Amber Missing Field Detection to Prevent Wasted Stock',
      'Bilingual Devanagari Hindi and Regional Script Typography',
      'Epson Tray J and Canon ID Card Tray Alignment',
      '100% Free Lifetime Re-Prints for Gram Panchayat Residents',
    ]
  );
  const faqSchema = generateFaqSchema(cscFaqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-slate-50 min-h-screen py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-2">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/print-portal" className="hover:text-slate-900 transition-colors">
              Specialized Portals
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">CSC Print Portal</span>
          </nav>

          {/* Hero Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Engineered for Village Level Entrepreneurs (VLEs) Across India</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                CSC Print Portal for{' '}
                <span className="text-blue-600">Digital Seva Kendra Operators</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                The high-reliability document formatting and PVC card printing software purpose-built for CSC VLEs. Eliminate ruined plastic card stock with live missing-field correction, Devanagari typography, and 100% free lifetime re-prints for citizens.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Button href="/register" variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                  Register Free VLE Account
                </Button>
                <Button href="/studio" variant="outline" size="lg">
                  Open Interactive Studio Demo
                </Button>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Epson Tray J (L805/L8050) Ready
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ₹0 Lifetime Re-Prints
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  No Monthly Fees
                </span>
              </div>
            </div>
          </section>

          {/* Operational Pillars for VLEs */}
          <section className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                VLE Operational Features
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Why CSC Operators Choose Accero PrintPortal
              </h2>
              <p className="text-sm text-slate-600">
                Designed to solve the daily operational roadblocks experienced by rural kiosks and CSC centers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vleWorkflows.map((item, idx) => (
                <Card key={idx} className="p-6 space-y-3 bg-white border-slate-200/90 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Direct Comparison Matrix */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Platform Comparison
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Accero PrintPortal vs Legacy PHP Portals
              </h2>
              <p className="text-sm text-slate-600">
                How Accero protects your CSC center from server downtime, ruined card stock, and billing losses.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75">
                    <th className="py-3 px-4 font-bold text-slate-900 w-1/4">Operational Scenario</th>
                    <th className="py-3 px-4 font-bold text-rose-700 w-3/8">Legacy Third-Party Portals</th>
                    <th className="py-3 px-4 font-bold text-emerald-700 w-3/8">Accero CSC Print Portal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cscComparison.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{row.feature}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 leading-relaxed bg-rose-50/20">{row.legacy}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-700 leading-relaxed font-medium bg-emerald-50/20">{row.accero}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Hardware & Printer Compatibility Guide */}
          <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-6 shadow-card">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Hardware Tray Compatibility
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Plug-and-Play PVC Printing with Zero Margin Cutoffs
              </h2>
              <p className="text-sm text-slate-300">
                Direct browser CSS `@page` print integration calibrated for Indian kiosk hardware.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
                <Printer className="w-6 h-6 text-blue-400" />
                <h3 className="font-bold text-base text-white">Epson EcoTank L805 / L8050</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dedicated 2-Card Tray J templates with zero-margin vector positioning. No clipped corners or misaligned barcodes.
                </p>
              </div>

              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
                <Printer className="w-6 h-6 text-amber-400" />
                <h3 className="font-bold text-base text-white">Canon PIXMA G3010 / G5070</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dual-card PVC tray support with automatic front/back orientation matching Canon driver tray feeds.
                </p>
              </div>

              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
                <Printer className="w-6 h-6 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Thermal Direct-to-Card Printers</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Export high-DPI vector PDF and PNG cards for instant pass-through on Zebra ZXP, Evolis Zenius, and Magicard printers.
                </p>
              </div>
            </div>
          </section>

          {/* Frequently Asked Questions */}
          <FAQSection faqs={cscFaqs} title="Frequently Asked Questions by CSC VLEs" />

          {/* Final Call to Action */}
          <CTASection
            title="Elevate Your CSC Kendra with Zero Ruined PVC Cards"
            description="Join thousands of Indian CSC VLEs who format and print perfect citizen identity cards with zero wasted plastic stock and free lifetime re-prints."
            primaryButtonText="Create Free VLE Account"
            primaryButtonHref="/register"
            secondaryButtonText="Open Studio Demo"
            secondaryButtonHref="/studio"
          />

          {/* Mandatory Independent Legal Disclaimer */}
          <footer className="text-center text-xs text-slate-500 max-w-3xl mx-auto pt-4 space-y-2">
            <p>
              <strong>Important Statutory Compliance Notice:</strong> Accero PrintPortal is an independent commercial document formatting and printing software platform. It is not affiliated with, endorsed by, authorized by, or an official representative of the Government of India, CSC e-Governance Services India Limited, UIDAI, NSDL, UTIITSL, the Election Commission of India, or any State Food Department. Accero does not issue official identity cards. Operators must hold lawful citizen authorization before printing records.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
