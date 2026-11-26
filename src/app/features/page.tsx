import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Search,
  Edit3,
  Globe,
  Printer,
  ShieldCheck,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Cpu,
  Layers,
  FileCheck,
  Zap,
  Sliders,
  Check,
  X,
  Shield,
  Smartphone,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FAQSection } from '@/components/public/FAQSection';
import { CTASection } from '@/components/public/CTASection';

export const metadata: Metadata = buildPageMetadata({
  title: 'Platform Features & Operator Studio Suite | Accero PrintPortal',
  description:
    'Comprehensive document processing and PVC printing suite for cyber cafes and CSC operators. Sub-2s lookups, live split-screen editor, zero-margin CR80 print engine, Devanagari typography, and ₹0 re-prints.',
  path: '/features',
  keywords: [
    'document processing features',
    'pvc card studio features',
    'split-screen card editor',
    'cr80 print engine',
    'bilingual document printing',
    'operator wallet billing',
    'epson l805 card printing software',
    'canon g series pvc card tray',
    'cyber cafe document tools',
    'pvc id card maker features',
    'instant citizen id lookup tools',
    'zero margin card printing engine',
  ],
});

const featuresList = [
  {
    slug: 'document-lookup',
    title: 'Instant Document Lookup',
    subtitle: 'Automated Demographic Query with Multi-Provider Failover',
    description:
      'Enter 10-digit PAN, 12-digit Aadhaar/Ration, EPIC, or DL/RC numbers to retrieve verified demographic records directly to the editor canvas in under 2 seconds with silent failover.',
    icon: Search,
    color: 'text-[#8B1E2D]',
    capabilities: [
      'Sub-2-second automated demographic retrieval',
      'Silent multi-provider failover cascade',
      'Zero wallet deduction on failed queries (₹0)',
      'Direct synchronization into split-screen editor',
    ],
  },
  {
    slug: 'document-editing',
    title: 'Split-Screen Live Editor',
    subtitle: 'Reactive Preview with Missing Field Detection',
    description:
      'Side-by-side workspace flags missing father names, addresses, or photos with amber guides. Every keystroke synchronizes live with the CR80 card canvas to prevent printing errors.',
    icon: Edit3,
    color: 'text-amber-600',
    capabilities: [
      'Side-by-side form and reactive card canvas',
      'Automatic missing-field alerts and photo validation',
      'Live Devanagari Hindi text editing and transposition',
      'Manual override for offline citizen documentation',
    ],
  },
  {
    slug: 'multilingual-printing',
    title: 'Multilingual Typography',
    subtitle: 'Unicode Regional Language Support for Indian Documents',
    description:
      'Renders crisp regional conjuncts in Devanagari (Hindi, Marathi) and other Indian scripts using Google Fonts Hind alongside standard Latin script, eliminating character corruption.',
    icon: Globe,
    color: 'text-blue-600',
    capabilities: [
      'Embedded Google Fonts Hind for flawless Devanagari glyphs',
      'Automatic dual-script alignment on card headers',
      'Crisp 300+ DPI vector font rendering in print dialogs',
      'State-specific language formatting for regional cards',
    ],
  },
  {
    slug: 'document-printing',
    title: 'CR80 Physical Print Engine',
    subtitle: 'Zero-Margin Output for Epson & Canon PVC Card Trays',
    description:
      'Engineered to meet ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm). Injects custom CSS @page rules to eliminate margin drift, white edges, and clipping across all desktop card trays.',
    icon: Printer,
    color: 'text-purple-600',
    capabilities: [
      'Strict ISO/IEC 7810 ID-1 standard dimensions (85.60 × 53.98 mm)',
      'Injected CSS @page zero-margin rule prevents white borders',
      'Calibrated for 2-card and 4-card ID trays (Epson Tray J)',
      'Vector PDF & 300 DPI PNG direct export capabilities',
    ],
  },
  {
    slug: 'document-management',
    title: 'Secure Document Vault',
    subtitle: 'Operator Record Archival with 100% Free Re-prints',
    description:
      'Encrypted digital storage of previously formatted documents. Operators can re-print, modify, or download PDF cards anytime without recurring deduction fees, saving money on lost customer cards.',
    icon: ShieldCheck,
    color: 'text-emerald-600',
    capabilities: [
      'Permanent ₹0 lifetime re-prints on saved records',
      'Encrypted operator-level isolation and search filters',
      'Instant client duplicate generation without repeat API costs',
      'One-click batch export for high-volume counter queues',
    ],
  },
  {
    slug: 'wallet-management',
    title: 'Prepaid Wallet & Ledger',
    subtitle: 'Transparent Per-Card Deductions with Instant UPI Recharge',
    description:
      'Zero monthly subscriptions. Top up your balance via UPI, monitor itemized transactions, and enjoy automated refunds on failed external lookups with absolute billing transparency.',
    icon: Wallet,
    color: 'text-indigo-600',
    capabilities: [
      'Instant UPI dynamic QR recharge starting at just ₹100',
      'Transparent flat rates: ₹5 manual draft, ₹20-₹30 API lookup',
      'Detailed ledger tracking every transaction and document ID',
      'Instant automated rollback on lookup provider timeouts',
    ],
  },
];

const comparisonData = [
  {
    feature: 'Card Dimensions & Margin Calibration',
    traditional: 'Manual Photoshop/Word alignment; frequent white borders and clipped text',
    accero: 'Standard ISO CR80 (85.60 × 53.98 mm) with zero-margin CSS @page auto-injection',
  },
  {
    feature: 'Missing Field Detection',
    traditional: 'No pre-print validation; cards printed with blank father names or missing photos',
    accero: 'Real-time amber alert badges highlight missing fields before printing',
  },
  {
    feature: 'Re-Print Cost Policy',
    traditional: 'Full fee charged again on portal crashes, card misprints, or customer returns',
    accero: '100% Free Lifetime Re-prints (₹0) from operator encrypted document vault',
  },
  {
    feature: 'Regional Language Typography',
    traditional: 'Broken Devanagari conjuncts, corrupted matras, or missing font glyphs',
    accero: 'Native embedded Google Fonts Hind for flawless bilingual rendering',
  },
  {
    feature: 'Desktop Tray Compatibility',
    traditional: 'Requires complex printer driver modifications or costly dedicated RIP software',
    accero: 'Native browser 1-click print directly into Epson Tray J and Canon G-series trays',
  },
  {
    feature: 'Software Billing Model',
    traditional: 'Expensive recurring monthly software rentals or locked annual subscriptions',
    accero: 'Pay-as-you-print prepaid wallet; ₹0 subscriptions; min recharge ₹100 via UPI',
  },
];

const hardwareSpecs = [
  {
    brand: 'Epson EcoTank Series',
    models: 'L805, L850, L8050, L1800',
    trayType: 'Standard PVC Tray J (2-Card Slot)',
    settings: 'Paper Type: CD/DVD, Quality: High Photo, Scale: 100% (No Margins)',
  },
  {
    brand: 'Canon Pixma Series',
    models: 'G1010, G2010, G3010, TS707',
    trayType: 'Multi-Tray PVC ID Adapter (2-Card Slot)',
    settings: 'Media: Printable Disc, Borderless: On, Scale: 100%',
  },
  {
    brand: 'Thermal Direct-to-Card Printers',
    models: 'Zebra ZC100/ZC300, Evolis Zenius/Primacy',
    trayType: 'Standard Internal CR80 Feeder',
    settings: 'Driver: Standard CR80 Card (85.60 × 53.98 mm), 300 DPI Vector',
  },
];

const faqs = [
  {
    question: 'Can I use Accero PrintPortal if an external lookup API is down?',
    answer:
      'Yes. Accero PrintPortal features an offline-capable manual entry mode for every supported document. Operators can fill in customer details, upload fresh photos, and print on the same standard CR80 canvas.',
  },
  {
    question: 'How does the split-screen studio prevent print errors?',
    answer:
      'The studio continuously scans for missing fields (such as missing father names or photo URLs) and highlights them with amber alert badges. Operators visually verify the card canvas in real time before triggering a print.',
  },
  {
    question: 'What printer trays are supported?',
    answer:
      'Our CSS @page print engine supports all 2-card and 4-card ID trays on Epson L805, L850, L8050, Canon G-series, as well as direct-to-card thermal printers (Zebra, Evolis).',
  },
  {
    question: 'Are there hidden monthly subscription charges?',
    answer:
      'No. Accero PrintPortal has zero monthly software subscriptions. You only maintain a prepaid balance and pay flat per-card processing fees. Re-prints are always ₹0.',
  },
  {
    question: 'How is customer identity data protected?',
    answer:
      'All traffic is secured via modern TLS 1.3 / 256-bit encryption. Document records are stored in an ephemeral 72-hour cache with automated expiration, isolated per operator account, and designed in alignment with Indian data protection standards.',
  },
];

export default function FeaturesOverviewPage() {
  const softwareSchema = generateSoftwareApplicationSchema('Accero PrintPortal Features');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
  ]);
  const faqSchema = generateFaqSchema(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Features</span>
          </nav>

          {/* Hero Header */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#1D3557] border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-[#8B1E2D]" />
              <span>Full Platform Feature Suite</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight leading-tight">
              Powerful Document Processing &amp; PVC Printing Studio
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              Engineered specifically for cyber cafes, CSC operators, and printing businesses across India. Eliminate failed prints, missing fields, and printer tray alignment issues with our purpose-built software.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all"
              >
                Create Operator Account
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3 rounded-xl text-sm font-bold bg-slate-100 text-[#1D3557] border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                View Transparent Pricing
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="space-y-6">
            <div className="text-left space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557]">
                Core Platform Capabilities
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Explore the six modular systems powering high-speed, zero-defect counter printing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuresList.map((feat) => {
                const IconComp = feat.icon;
                return (
                  <Card
                    key={feat.slug}
                    hoverEffect
                    className="p-8 border border-slate-200/90 flex flex-col justify-between"
                  >
                    <div className="space-y-5">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <IconComp className={`w-6 h-6 ${feat.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#1D3557]">{feat.title}</h3>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-2 mt-0.5">
                          {feat.subtitle}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                          {feat.description}
                        </p>
                        <ul className="space-y-1.5 border-t border-slate-100 pt-3">
                          {feat.capabilities.map((cap, i) => (
                            <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{cap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100">
                      <Link
                        href={`/features/${feat.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D3557] hover:text-[#8B1E2D] transition-colors"
                      >
                        <span>Deep Dive: {feat.title}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Workflow Comparison Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-6">
            <div className="space-y-2 text-left">
              <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D] border-[#8B1E2D]/20">
                The Operator Advantage
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557]">
                Traditional Printing vs. Accero PrintPortal
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Why thousands of CSC operators and cyber cafes across India have replaced Photoshop scripts and ad-hoc portals with our dedicated printing gateway.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Workflow Feature</th>
                    <th className="py-3 px-4 text-slate-500">Traditional Methods (Photoshop / Legacy Portals)</th>
                    <th className="py-3 px-4 text-[#8B1E2D]">Accero PrintPortal Solution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 font-bold text-[#1D3557] align-top">{row.feature}</td>
                      <td className="py-4 px-4 text-slate-500 align-top flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{row.traditional}</span>
                      </td>
                      <td className="py-4 px-4 text-slate-800 font-medium align-top">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{row.accero}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Hardware & Printer Compatibility Guide */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-6">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200">
                <Printer className="w-3.5 h-3.5 text-purple-700" />
                <span>Hardware Interoperability</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557]">
                Supported Desktop PVC Card Printers &amp; Trays
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                No expensive specialized card machines required. Accero PrintPortal is natively calibrated to print on popular inkjet photo printers using commercial ID trays.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hardwareSpecs.map((spec, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-[#1D3557]">{spec.brand}</h3>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="font-semibold text-slate-500">Models: </span>
                      <span className="text-slate-800 font-mono">{spec.models}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Tray Type: </span>
                      <span className="text-slate-800">{spec.trayType}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                      <span className="font-semibold text-[#8B1E2D]">Driver Config: </span>
                      {spec.settings}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
              <span>Need step-by-step driver setup instructions for your printer?</span>
              <Link
                href="/blog/pvc-card-printer-tray-guide"
                className="font-bold text-[#8B1E2D] hover:underline flex items-center gap-1"
              >
                Read Desktop Card Tray Setup Tutorial <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </section>

          {/* Compliance & Legal Disclaimer Banner */}
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1 text-left">
            <span className="font-bold uppercase tracking-wider block text-amber-800">
              Important Regulatory Notice:
            </span>
            <p>
              Accero PrintPortal is an independent commercial software platform engineered for document layout formatting and physical card tray alignment. It is not an official government portal and is not affiliated with UIDAI, NSDL, UTIITSL, the Election Commission of India, MoRTH, or State Food Departments. Output templates strictly conform to international ISO/IEC 7810 ID-1 standard physical specifications (85.60 mm × 53.98 mm).
            </p>
          </div>

          {/* FAQ Section */}
          <FAQSection
            faqs={faqs}
            title="Frequently Asked Questions About Platform Features"
            subtitle="Direct answers to common questions about our technical capabilities, pricing, and printer support."
          />

          {/* CTA */}
          <CTASection
            title="Ready to Upgrade Your Document Printing Counter?"
            description="Create an operator account today and start formatting ISO-compliant PVC cards with live split-screen precision and ₹0 re-prints."
          />
        </div>
      </div>
    </>
  );
}
