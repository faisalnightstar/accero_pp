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
  FileText,
  CreditCard,
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
  title: 'Ration Card Printing Software for CSC Operators & Cyber Cafes | Accero',
  description:
    'Dedicated Ration Card document processing and PVC printing software for CSC VLEs, cyber cafes and digital service centers in India. Live family member editor, multi-page continuation, bilingual Devanagari text, and ₹0 lifetime re-prints.',
  path: '/ration-card-printing-for-csc',
  keywords: [
    'Ration Card Printing Software for CSC',
    'Ration Card Print Portal for VLE',
    'Ration Card Printing for Cyber Cafe',
    'Ration Card Printing for Retailers',
    'Online Ration Card PDF Printing',
    'CSC Ration Card Print Portal',
    'NFSA Smart Ration Card Printing',
    'Ration Card Family Member Details Printing',
    'सीएससी राशन कार्ड प्रिंट पोर्टल',
    'राशन कार्ड प्रिंट सॉफ्टवेयर',
  ],
});

const cscBenefits = [
  {
    title: 'Zero Ruined PVC Cards for Rural Citizens',
    desc: 'When village residents travel to your CSC center or cyber cafe, misprints waste expensive plastic cards and erode trust. Accero flags missing father names, invalid FPS codes, or incomplete addresses in amber before printing.',
    icon: ShieldCheck,
  },
  {
    title: 'Continuation Pagination for Large Families',
    desc: 'Legacy print portals truncate or silently drop beneficiaries when a household has more than 5 members. Accero dynamically generates continuation reverse cards with clear page counters so every family member is printed.',
    icon: Users,
  },
  {
    title: '100% Free Lifetime Re-Prints (₹0)',
    desc: 'When a citizen misplaces their PVC card or needs a replacement, reprint it directly from your encrypted vault without paying another lookup fee. Keep 100% of the customer re-print fee as pure center profit.',
    icon: Award,
  },
  {
    title: 'Bilingual Devanagari & Regional Scripts',
    desc: 'Accurately render Head of Family names, guardian relations, and residential addresses in native Devanagari (Hindi) alongside English, fully compliant with state food department guidelines.',
    icon: Layers,
  },
  {
    title: 'Instant Automated Wallet Rollback',
    desc: 'Never waste time chasing WhatsApp admins for ₹10 refunds when third-party lookup APIs timeout. Accero’s atomic ledger automatically restores your wallet balance in milliseconds.',
    icon: Wallet,
  },
  {
    title: 'Epson & Canon Card Tray Precision',
    desc: 'Outputs exact ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm) with zero margin drift. Compatible with Epson L805/L850/L8050, Canon G-series, and thermal PVC card printers.',
    icon: Printer,
  },
];

const faqs = [
  {
    question: 'Which software can CSC operators use for Ration Card printing?',
    answer:
      'CSC Village Level Entrepreneurs (VLEs) and cyber cafe operators use Accero PrintPortal. Unlike legacy scripts that crop beneficiary names or crash during peak hours, Accero offers a high-speed cloud platform with a live split-screen editor, multi-page continuation for large families, and lifetime free re-prints.',
  },
  {
    question: 'Can a Ration Card be printed from a cyber cafe or local retail shop?',
    answer:
      'Yes. Cyber cafe owners and printing shops can process authorized customer Ration Card records into print-ready CR80 PVC layouts in under 60 seconds. The platform runs directly inside Google Chrome or Microsoft Edge without requiring complex drivers or local server installations.',
  },
  {
    question: 'How does Accero handle families with more than 5 members?',
    answer:
      'Standard PVC card dimensions comfortably accommodate up to 5 family members on the reverse side. For households with 6 to 15+ members, Accero automatically generates continuation cards (Page 2+) carrying clear sub-headers and pagination badges, ensuring no beneficiary is omitted.',
  },
  {
    question: 'Does Accero issue official government Ration Cards?',
    answer:
      'No. Accero PrintPortal is an independent commercial document processing and card formatting platform. It does not issue official government ration cards, register new families, or distribute food grains. It is designed solely to format authorized records onto printable PVC layouts.',
  },
  {
    question: 'What information is required to format a Ration Card in Accero?',
    answer:
      'To generate a card, you can enter the 12-to-20 digit Ration Card number for instant lookup, or manually input the Head of Family name, scheme category (PHH, AAY, BPL, APL), Fair Price Shop (FPS) code, residential address, and family member details.',
  },
  {
    question: 'What printer settings should CSC operators use for PVC trays?',
    answer:
      'Accero’s vector print engine uses exact millimeter dimensions with CSS @page rules. When printing from Chrome or Edge, select Paper Size as A4 or Card Tray, margins as None (or 0), and ensure Background Graphics is checked with scale set to 100%.',
  },
];

export default function RationCardPrintingForCscPage() {
  const softwareSchema = generateSoftwareApplicationSchema(
    'Ration Card Printing Software for CSC Operators',
    'BusinessApplication',
    [
      'ISO/IEC 7810 ID-1 CR80 PVC Card Dimensions',
      'Dynamic Scheme Palettes (PHH, AAY, BPL, APL, White)',
      'Family Beneficiary Micro-Table with Continuation Pagination',
      'Bilingual Hindi & Regional Language Rendering',
      'Zero Margin-Drift PVC Printer Tray CSS Engine',
      '100% Free Lifetime Re-Prints (₹0)',
    ]
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
    { name: 'Ration Card Printing for CSC', url: '/ration-card-printing-for-csc' },
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

      <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/services" className="hover:text-[#1D3557] transition-colors">
              Services
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Ration Card Printing for CSC</span>
          </nav>

          {/* Hero Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200/90 shadow-sm relative overflow-hidden text-left">
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Engineered for CSC VLEs &amp; Cyber Cafes</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight leading-tight">
                Ration Card Printing Software for <span className="text-[#8B1E2D]">CSC Operators</span> &amp; Cyber Cafes
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
                Process, format, and print official-standard NFSA Ration Cards on durable PVC plastic. Featuring live family beneficiary management, multi-page continuation for large households, and 100% free lifetime re-prints.
              </p>

              {/* AEO / GEO Direct Answer Box */}
              <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-slate-50/90 border border-slate-200/90 shadow-xs">
                <FileText className="w-6 h-6 text-[#8B1E2D] shrink-0 mt-0.5" />
                <div className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                  <span className="font-bold text-[#1D3557] block">
                    Direct Operator Answer: How does Accero format Ration Cards for CSC printing?
                  </span>
                  <p className="leading-relaxed">
                    CSC operators enter an authorized Ration Card number or input household data into Accero PrintPortal. The platform automatically maps Head of Family details, subsidy category badges (PHH, AAY, BPL, APL), Fair Price Shop dealer codes, and an organized family member table into ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm) with zero margin drift for instant PVC card tray printing.
                  </p>
                  <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">NFSA Compliant Layout</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">₹25 Verified / ₹5 Manual</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">₹0 Lifetime Re-Prints</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  href="/studio?type=ration"
                  variant="primary"
                  size="lg"
                  icon={<Printer className="w-5 h-5" />}
                >
                  Open Ration Card Studio
                </Button>
                <Button
                  href="/register"
                  variant="accent"
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                >
                  Create Free Operator Account
                </Button>
                <Button
                  href="/services/ration-card-printing"
                  variant="outline"
                  size="lg"
                >
                  View Service Specifications
                </Button>
              </div>

              {/* Trust Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ISO ID-1 Standard (85.6mm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>₹0 Lifetime Free Re-Prints</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-Page Family Continuation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant Atomic Auto-Refund</span>
                </div>
              </div>
            </div>
          </section>

          {/* Operator Benefits Grid */}
          <section className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
                Built for Daily Operations
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557]">
                Why CSC VLEs Choose Accero for Ration Cards
              </h2>
              <p className="text-sm text-slate-600">
                Designed to eliminate daily operator pain points: clipped member names, wasted PVC cards, and lost reprint profits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cscBenefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <Card key={idx} className="p-6 space-y-3 bg-white border border-slate-200/90 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#8B1E2D]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#1D3557]">{benefit.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{benefit.desc}</p>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Scheme Categories Visual Guide */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-6">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
                Category Scheme Support
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557]">
                Supported NFSA Ration Card Categories
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Accero automatically applies official color palettes and statutory headers based on the cardholder&apos;s entitlement scheme:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5">
                <div className="font-bold text-emerald-900 text-sm">PHH — Priority Household (पात्र गृहस्थी)</div>
                <p className="text-emerald-800 leading-relaxed">
                  Emerald green header gradient with bilingual scheme label. Supports rural and urban NFSA priority beneficiaries.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
                <div className="font-bold text-amber-900 text-sm">AAY — Antyodaya Anna Yojana (अंत्योदय)</div>
                <p className="text-amber-800 leading-relaxed">
                  Golden amber theme for poorest of the poor households entitled to 35 kg of grain per family per month.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1.5">
                <div className="font-bold text-blue-900 text-sm">BPL — Below Poverty Line</div>
                <p className="text-blue-800 leading-relaxed">
                  Royal navy blue styling for state-specific BPL beneficiary households.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 space-y-1.5">
                <div className="font-bold text-orange-900 text-sm">APL — Above Poverty Line</div>
                <p className="text-orange-800 leading-relaxed">
                  Saffron / rust styling for above poverty line families holding subsidized grain cards.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 sm:col-span-2 lg:col-span-2">
                <div className="font-bold text-slate-900 text-sm">WHITE — Non-Subsidized Household Card</div>
                <p className="text-slate-700 leading-relaxed">
                  Neutral slate gray theme used primarily for household identity and address verification in states offering non-subsidized cards.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <FAQSection faqs={faqs} />

          {/* Official Compliance Disclaimer */}
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 leading-relaxed flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Compliance &amp; Legal Notice:</strong> Accero PrintPortal is an independent commercial document processing and layout formatting software utility. It is not affiliated with, endorsed by, or an official website of the Department of Food and Public Distribution, the National Food Security Act (NFSA), or any State Food and Civil Supplies Department. Output templates strictly conform to the ISO/IEC 7810 ID-1 international physical card standard.
            </div>
          </div>

          {/* Conversion CTA Section */}
          <CTASection
            title="Start Printing PVC Ration Cards at Your Center Today"
            description="Create your operator account in 30 seconds. Zero monthly software fees, instant UPI wallet recharge, and 100% free lifetime re-prints."
          />
        </div>
      </div>
    </>
  );
}
