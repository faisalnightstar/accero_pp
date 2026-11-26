import React from 'react';
import ReactDOM from 'react-dom';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ShieldCheck,
  CheckCircle2,
  Printer,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Edit3,
  HelpCircle,
  Check,
  Search,
  Globe,
  Wallet,
  AlertTriangle,
  RotateCw,
  Cpu,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateFaqSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from '@/lib/seo/structuredData';
import PageTracker from '@/components/analytics/PageTracker';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { DEFAULT_SERVICE_PRICING } from '@/lib/wallet/constants';
import { HeroSection } from '@/components/public/HeroSection';
import { ServiceGrid } from '@/components/public/ServiceGrid';
import { FeatureSection } from '@/components/public/FeatureSection';
import { FAQSection } from '@/components/public/FAQSection';
import { CTASection } from '@/components/public/CTASection';
import { ServiceCardData } from '@/components/public/ServiceCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = buildPageMetadata({
  title: 'Accero PrintPortal – Online Print Portal & PVC Card Printing Software',
  description:
    'Accero PrintPortal: Online print portal for CSC VLEs and cyber cafes. Format, preview and print PAN, Aadhaar, Voter, DL, RC and Ration PVC cards with zero waste.',
  path: '/',
  keywords: [
    'print portal',
    'online print portal',
    'csc print portal',
    'digital print portal',
    'pvc card printing software',
    'cyber cafe document management software',
    'csc operator software',
    'pan card printing software',
    'voter id printing software',
    'driving licence printing software',
    'vehicle rc printing software',
    'ration card printing software',
    'cr80 card format',
  ],
});

const serviceCardsData: ServiceCardData[] = [
  {
    id: 'pan',
    serviceKey: 'PAN',
    slug: 'pan-card-printing',
    title: 'PAN Card Print',
    tag: 'NSDL / UTIITSL Format',
    description:
      'Instant PAN card formatting with photo, signature, father name, and verifiable demographic QR code.',
    docType: 'pan',
    features: [
      'Dual-side CR80 physical card layout',
      'Instant NSDL & UTIITSL slip lookup',
      'Demographic QR code synthesis',
    ],
    fee: DEFAULT_SERVICE_PRICING.PAN?.fee ?? 20,
    originalFee: DEFAULT_SERVICE_PRICING.PAN?.originalFee ?? 20,
    discountPercent: DEFAULT_SERVICE_PRICING.PAN?.discountPercent ?? 0,
    offerBadge: DEFAULT_SERVICE_PRICING.PAN?.offerBadge,
  },
  {
    id: 'aadhaar',
    serviceKey: 'AADHAAR',
    slug: 'aadhaar-document-management',
    title: 'Aadhaar PVC Card',
    tag: 'Bilingual CR80 Layout',
    description:
      'Bilingual regional typography, secure demographic QR code embedding, and ghost image alignment.',
    docType: 'aadhaar',
    features: [
      'Bilingual Hindi & English font rendering',
      'High-contrast secure QR embedding',
      'Zero-margin PVC card tray fit',
    ],
    fee: DEFAULT_SERVICE_PRICING.AADHAAR?.fee ?? 30,
    originalFee: DEFAULT_SERVICE_PRICING.AADHAAR?.originalFee ?? 30,
    discountPercent: DEFAULT_SERVICE_PRICING.AADHAAR?.discountPercent ?? 0,
    offerBadge: DEFAULT_SERVICE_PRICING.AADHAAR?.offerBadge,
  },
  {
    id: 'voter',
    serviceKey: 'VOTER',
    slug: 'voter-id-printing',
    title: 'Voter ID (EPIC)',
    tag: 'National Electoral Standard',
    description:
      'High-resolution EPIC card format with assembly constituency, polling part, and barcode block.',
    docType: 'voter',
    features: [
      'Assembly constituency & part number mapping',
      'Electoral barcode synthesis',
      'Old & new EPIC layout support',
    ],
    fee: DEFAULT_SERVICE_PRICING.VOTER?.fee ?? 20,
    originalFee: DEFAULT_SERVICE_PRICING.VOTER?.originalFee ?? 20,
    discountPercent: DEFAULT_SERVICE_PRICING.VOTER?.discountPercent ?? 0,
    offerBadge: DEFAULT_SERVICE_PRICING.VOTER?.offerBadge,
  },
  {
    id: 'dl',
    serviceKey: 'DL',
    slug: 'driving-licence-printing',
    title: 'Driving Licence (DL)',
    tag: 'Smart Card Chip Format',
    description:
      'Full transport department layout including vehicle class badges (MCWG, LMV) and validity tracking.',
    docType: 'dl',
    features: [
      'Smart card chip alignment guides',
      'Vehicle class badges (MCWG, LMV, HMV)',
      'Transport & non-transport validity',
    ],
    fee: DEFAULT_SERVICE_PRICING.DL?.fee ?? 25,
    originalFee: DEFAULT_SERVICE_PRICING.DL?.originalFee ?? 25,
    discountPercent: DEFAULT_SERVICE_PRICING.DL?.discountPercent ?? 0,
    offerBadge: DEFAULT_SERVICE_PRICING.DL?.offerBadge,
  },
  {
    id: 'rc',
    serviceKey: 'RC',
    slug: 'vehicle-rc-printing',
    title: 'Vehicle RC Smart Card',
    tag: 'Vahan Smart Card Format',
    description:
      'Vehicle registration smart card template with chassis, engine, maker model, and fuel specifications.',
    docType: 'rc',
    features: [
      'Vahan 4.0 layout compatibility',
      'Chassis & engine number precision',
      'Commercial & private vehicle classes',
    ],
    fee: DEFAULT_SERVICE_PRICING.RC?.fee ?? 25,
    originalFee: DEFAULT_SERVICE_PRICING.RC?.originalFee ?? 25,
    discountPercent: DEFAULT_SERVICE_PRICING.RC?.discountPercent ?? 0,
    offerBadge: DEFAULT_SERVICE_PRICING.RC?.offerBadge,
  },
  {
    id: 'ration',
    serviceKey: 'RATION',
    slug: 'ration-card-printing',
    title: 'Ration Card Print',
    tag: 'NFSA Food Security Layout',
    description:
      'Bilingual family ration card format with FPS dealer code, member count, and CR80 card tray support.',
    docType: 'ration',
    features: [
      'Family member list table formatting',
      'FPS dealer & commodity quota tracking',
      'Multi-page continuation for large families',
    ],
    fee: DEFAULT_SERVICE_PRICING.RATION?.fee ?? 25,
    originalFee: DEFAULT_SERVICE_PRICING.RATION?.originalFee ?? 35,
    discountPercent: DEFAULT_SERVICE_PRICING.RATION?.discountPercent ?? 29,
    offerBadge: DEFAULT_SERVICE_PRICING.RATION?.offerBadge ?? '29% OFF',
  },
  {
    id: 'farmer',
    serviceKey: 'FARMER',
    slug: 'farmer-id-printing',
    title: 'Farmer ID (AgriStack)',
    tag: 'Farmer Registry Card Layout',
    description:
      'Official-standard digital Farmer ID smart card with Khata/Khasra land records, QR verification, and 12-language translation.',
    docType: 'farmer',
    features: [
      'Authentic AgriStack & Rajasthan Registry layout',
      'Land parcel table (Khata, Khasra, Area)',
      '12-language regional script translation',
    ],
    fee: DEFAULT_SERVICE_PRICING.FARMER?.fee ?? 20,
    originalFee: DEFAULT_SERVICE_PRICING.FARMER?.originalFee ?? 35,
    discountPercent: DEFAULT_SERVICE_PRICING.FARMER?.discountPercent ?? 43,
    offerBadge: DEFAULT_SERVICE_PRICING.FARMER?.offerBadge ?? '43% OFF',
  },
];

const homeFaqs = [
  {
    question: 'What is Accero PrintPortal?',
    answer:
      'Accero PrintPortal is an independent document processing and PVC card formatting software platform engineered specifically for cyber cafes, CSC operators, and printing businesses. It provides rapid document lookups, interactive split-screen editing with missing field guides, and print-ready CR80 card tray outputs.',
  },
  {
    question: 'Which document card workflows does Accero PrintPortal support?',
    answer:
      'Accero supports PAN Card (NSDL/UTIITSL), Aadhaar PVC Card, Voter ID (EPIC), Driving Licence (DL), Vehicle RC Smart Card, and Ration Card formatting, subject to applicable service configurations and legal authorizations.',
  },
  {
    question: 'Is Accero PrintPortal an official government portal or partner?',
    answer:
      'No. Accero PrintPortal is an independent commercial software platform. It is not an official government portal, and is not affiliated with, endorsed by, or partnered with UIDAI, NSDL, UTIITSL, the Election Commission of India, MoRTH, or State Food Departments. Operators are solely responsible for ensuring lawful consent and legitimate usage.',
  },
  {
    question: 'What are the exact physical dimensions of printed cards?',
    answer:
      'All cards strictly conform to the international standard ISO/IEC 7810 ID-1 standard: exactly 85.60 mm × 53.98 mm (standard CR80 credit card dimensions) with 3.18 mm rounded corner radii, engineered for 1:1 fit in Epson and Canon PVC card printer trays.',
  },
  {
    question: 'Are re-prints charged from my prepaid wallet?',
    answer:
      'No! Once a document has been verified or drafted and saved to your operator vault, all subsequent re-views, edits, and PDF re-downloads are 100% free of charge (₹0).',
  },
  {
    question: 'What happens if an external API lookup times out or fails?',
    answer:
      'Zero fee is charged (₹0). If an external API query fails or times out, our atomic ledger automatically rolls back any pending wallet deduction in milliseconds. You are never billed for incomplete operations.',
  },
];

export default function HomePage() {
  ReactDOM.preload('/assets/pan/nsdl-front.jpg', { as: 'image', fetchPriority: 'high' });

  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const softwareSchema = generateSoftwareApplicationSchema(
    'Accero PrintPortal',
    'BusinessApplication',
    [
      'ISO/IEC 7810 ID-1 Standard PVC Card Formatting',
      'Instant Alphanumeric ID Lookup with Multi-Provider Cascade',
      'Split-Screen Live Editor with Amber Missing Field Detection',
      'Bilingual Regional Language Typography Support',
      'Zero-Margin CSS @page Print Engine for Epson and Canon Card Trays',
      'Prepaid Wallet Accounting with 100% Free Lifetime Re-Prints',
    ]
  );
  const faqSchema = generateFaqSchema(homeFaqs);

  return (
    <>
      <PageTracker event={ANALYTICS_EVENTS.HOMEPAGE_VISIT} metadata={{ pagePath: '/' }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="space-y-16 lg:space-y-20 pb-20">
        {/* 1. Flagship Hero Section with Live CR80 Canvas Switcher */}
        <HeroSection />

        {/* 2. Platform Trust & Hardware Metrics Strip */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-card">
            <div className="space-y-1 p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#F4D35E]">85.60 mm</div>
              <p className="text-xs text-slate-300 font-medium">Exact ISO 7810 ID-1 Width</p>
            </div>
            <div className="space-y-1 p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100% Free</div>
              <p className="text-xs text-slate-300 font-medium">Lifetime Re-Prints (₹0)</p>
            </div>
            <div className="space-y-1 p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">0 ms</div>
              <p className="text-xs text-slate-300 font-medium">Live Studio Keystroke Sync</p>
            </div>
            <div className="space-y-1 p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#E63946]">₹0 / mo</div>
              <p className="text-xs text-slate-300 font-medium">Zero Subscription Fees</p>
            </div>
          </div>
        </section>

        {/* 3. Supported Document Workflows Directory */}
        <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
              Supported Workflows
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] tracking-tight">
              Preformatted Standard PVC Card Directory
            </h2>
            <p className="text-sm text-slate-600">
              Select any document to explore specifications, test lookup samples, or launch the interactive split-screen studio.
            </p>
          </div>

          <ServiceGrid services={serviceCardsData} showFilter={false} />

          <div className="text-center pt-8">
            <Button
              href="/services"
              variant="outline"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Explore Complete Services Directory with Filters
            </Button>
          </div>
        </section>

        {/* 4. How Split-Screen Studio Works */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-sm space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
                Three-Step Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] tracking-tight">
                How Split-Screen Studio Eliminates Ruined Cards
              </h2>
              <p className="text-sm text-slate-600">
                Stop throwing away blank cards due to missing API data. Inspect and complete data before printing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#1D3557] font-bold flex items-center justify-center text-sm border border-slate-200">
                  01
                </div>
                <h3 className="text-base font-bold text-[#1D3557]">
                  Instant Lookup or Direct Manual Entry
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter an alphanumeric document identifier to retrieve demographic records, or switch directly to manual entry mode with custom photo uploads.
                </p>
                <div className="pt-1">
                  <Link
                    href="/features/document-lookup"
                    aria-label="Explore document lookup – learn more about document lookup and manual entry"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D3557] hover:text-[#8B1E2D] transition-colors"
                  >
                    <span>Explore document lookup</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-amber-200/90 shadow-xs space-y-3 relative">
                <span className="absolute top-4 right-4 bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  Amber Guide
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 font-bold flex items-center justify-center text-sm border border-amber-200">
                  02
                </div>
                <h3 className="text-base font-bold text-[#1D3557]">
                  Amber Field Guides Flag Missing Data
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If government APIs return incomplete addresses, missing father names, or blank photos, the live editor highlights them in amber so you can fill them prior to printing.
                </p>
                <div className="pt-1">
                  <Link
                    href="/features/document-editing"
                    aria-label="Explore live editing – learn more about split-screen live editing"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D3557] hover:text-[#8B1E2D] transition-colors"
                  >
                    <span>Explore live editing</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#1D3557] font-bold flex items-center justify-center text-sm border border-slate-200">
                  03
                </div>
                <h3 className="text-base font-bold text-[#1D3557]">
                  0-Margin Print or High-DPI Vector Export
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Print directly through the browser with exact zero-margin CSS coordinates for Epson or Canon PVC card trays, or export a 300+ DPI vector PDF for your printer.
                </p>
                <div className="pt-1">
                  <Link
                    href="/features/multilingual-printing"
                    aria-label="Explore multilingual printing – learn more about multilingual typography"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D3557] hover:text-[#8B1E2D] transition-colors"
                  >
                    <span>Explore multilingual printing</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Core Platform Features */}
        <FeatureSection />

        {/* 6. Transparent Utility Pricing Anchor */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-sm space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
                Transparent Billing
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557] tracking-tight">
                Pay-As-You-Print Utility Rates
              </h2>
              <p className="text-sm text-slate-600">
                Zero recurring monthly fees. Prepaid wallet balance top-ups starting at ₹100 via dynamic UPI QR code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Plan 1 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Manual Mode
                    </span>
                    <h3 className="text-lg font-bold text-[#1D3557] mt-1">Manual Draft &amp; Format</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      For operators drafting cards manually with self-provided customer records.
                    </p>
                  </div>
                  <div className="pt-2 pb-3 border-b border-slate-100">
                    <span className="text-3xl font-extrabold text-[#1D3557]">₹5</span>
                    <span className="text-xs text-slate-500"> / card generated</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Full CR80 Canvas &amp; Studio Access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>100% Free Lifetime Re-Prints (₹0)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>High-DPI PDF &amp; PNG Export</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-6">
                  <Button href="/register" variant="outline" size="md" className="w-full text-xs">
                    Start with Manual Mode
                  </Button>
                </div>
              </div>

              {/* Plan 2: Most Popular */}
              <div className="bg-white rounded-2xl p-6 border-2 border-[#1D3557] shadow-card flex flex-col justify-between relative">
                <span className="absolute -top-3.5 right-6 bg-[#1D3557] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                  Most Popular
                </span>
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Operator Standard
                    </span>
                    <h3 className="text-lg font-bold text-[#1D3557] mt-1">Instant Verified Lookup</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Automated demographic query with silent multi-provider fallback.
                    </p>
                  </div>
                  <div className="pt-2 pb-3 border-b border-slate-100">
                    <span className="text-3xl font-extrabold text-[#8B1E2D]">₹20 – ₹30</span>
                    <span className="text-xs text-slate-500"> / verified lookup</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Auto-fetch verified demographic records</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Amber Missing Field Detection Guide</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero charge on failed or timed-out lookups</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>100% Free Lifetime Re-Prints (₹0)</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-6">
                  <Button href="/register" variant="accent" size="md" className="w-full text-xs">
                    Create Operator Account
                  </Button>
                </div>
              </div>

              {/* Plan 3 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      High Volume
                    </span>
                    <h3 className="text-lg font-bold text-[#1D3557] mt-1">Multi-Counter Enterprise</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Tailored solutions for regional chains and high-traffic centers.
                    </p>
                  </div>
                  <div className="pt-2 pb-3 border-b border-slate-100">
                    <span className="text-3xl font-extrabold text-[#1D3557]">Custom</span>
                    <span className="text-xs text-slate-500"> / volume tier</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Multi-operator sub-accounts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Centralized enterprise wallet ledger</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Dedicated SLA &amp; WhatsApp Support</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-6">
                  <Button href="/contact" variant="outline" size="md" className="w-full text-xs">
                    Contact Sales
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Frequently Asked Questions (Uses WCAG AAA high-contrast <span className="text-[#8B1E2D] font-mono">Q:</span> markers via FAQSection) */}
        <FAQSection faqs={homeFaqs} />

        {/* 8. Compliance & Legal Guardrail Notice */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 leading-relaxed flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Compliance Notice:</strong> Accero PrintPortal is an independent commercial software platform. It is not an official government portal, nor is it an authorized partner of UIDAI, NSDL, UTIITSL, the Election Commission of India, MoRTH, or State Food Departments. Output templates conform to the international physical card standard ISO/IEC 7810 ID-1 (CR80: 85.60 mm &times; 53.98 mm). Operators must verify the lawful authority and accuracy of all citizen data processed.
            </div>
          </div>
        </section>

        {/* 9. Final High-Conversion Call to Action */}
        <CTASection />
      </div>
    </>
  );
}
