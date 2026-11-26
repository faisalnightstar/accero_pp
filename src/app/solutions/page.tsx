import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Building2,
  Users,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Laptop,
  Coins,
  Clock,
  TrendingUp,
  Cpu,
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
  title: 'Industry Solutions for Document Service Businesses | Accero PrintPortal',
  description:
    'Tailored document formatting and PVC card printing solutions for Cyber Cafes, CSC VLEs, Commercial Printing Shops, and Digital Service Centers across India. Eliminate wasted blanks, save operator time, and increase counter profitability.',
  path: '/solutions',
  keywords: [
    'cyber cafe software',
    'csc operator software',
    'printing shop management software',
    'digital service center software',
    'jan seva kendra software',
    'pvc card print solutions',
    'vle id card printing tool',
    'epson l805 csc portal',
    'best software for csc and cyber cafe',
    'smart card printing solutions india',
  ],
});

const solutions = [
  {
    slug: 'cyber-cafes',
    title: 'For Cyber Cafes',
    subtitle: 'High-Volume Walk-In Card Printing Without Missing API Data',
    description:
      'Turn walk-in visitors into high-margin PVC card customers. Format PAN, Aadhaar, Voter, and DL cards in seconds with real-time missing field detection that prevents ruined blanks.',
    icon: Laptop,
    badge: 'Popular for Retail Cafes',
    color: 'text-[#8B1E2D]',
    highlights: [
      'Serve walk-in customers in under 60 seconds per card',
      'Missing field amber alerts stop wasted PVC card stock',
      'Permanent ₹0 re-prints when customers lose their cards',
      'Instant UPI dynamic QR top-ups starting at ₹100',
    ],
    counterProfile: 'Single to dual computer setup with desktop Epson L805 or Canon G-series.',
  },
  {
    slug: 'csc-operators',
    title: 'For CSC Operators (VLEs)',
    subtitle: 'Citizen Card Formatting for Rural & Urban Service Centers',
    description:
      'Empower Common Service Centers (CSCs) and Jan Seva Kendras to format high-resolution identity documents using desktop card trays on Epson and Canon printers with flawless bilingual Hindi Devanagari text.',
    icon: Users,
    badge: 'Built for VLEs & Jan Seva',
    color: 'text-amber-600',
    highlights: [
      'Full Devanagari Hindi font rendering via Google Fonts Hind',
      'Specialized templates for NFSA Family Ration Cards & Farmer IDs',
      'Voter EPIC card formatting with assembly and part number support',
      'Zero monthly subscriptions; pay strictly per processed card',
    ],
    counterProfile: 'Panchayat or urban citizen service kiosks with photo inkjet printers.',
  },
  {
    slug: 'printing-shops',
    title: 'For Printing Shops',
    subtitle: 'Zero Margin-Drift Output for Commercial ID Trays & Thermal Units',
    description:
      'Engineered for print shops running Evolis, Zebra, Fargo, and high-speed Epson photo printers. Direct 300+ DPI vector PDF export perfectly calibrated to ISO 7810 ID-1 standard dimensions.',
    icon: Printer,
    badge: 'Industrial Precision',
    color: 'text-purple-600',
    highlights: [
      'Exact ISO/IEC 7810 ID-1 standard dimensions (85.60 × 53.98 mm)',
      'High-resolution vector PDF & 300 DPI PNG file export',
      'Compatible with multi-card trays and direct-to-card thermal printers',
      'Bulk batch export for commercial identity card orders',
    ],
    counterProfile: 'Commercial print kiosks, offset jobbers, and digital graphics studios.',
  },
  {
    slug: 'digital-service-centers',
    title: 'For Digital Service Centers',
    subtitle: 'Multi-Service Front-Desk Fulfillment Utility',
    description:
      'Streamline operator counters in municipal centers and citizen kiosks. A unified dashboard for lookups, photo cropping, multilingual typesetting, and transparent wallet accounting.',
    icon: Building2,
    badge: 'Multi-Counter Ready',
    color: 'text-[#1D3557]',
    highlights: [
      'Single unified login for all Indian identity document workflows',
      'Isolated operator vault with full audit logs and ledger entries',
      'Automated fallback to manual draft when external registries timeout',
      'Role-based security ensuring customer demographic confidentiality',
    ],
    counterProfile: 'High-throughput citizen helpdesks and government facilitation centers.',
  },
];

const roiMetrics = [
  {
    icon: Clock,
    title: '70% Faster Turnaround',
    description: 'Average card formatting time dropped from 6 minutes in Photoshop to under 45 seconds.',
  },
  {
    icon: Coins,
    title: 'Zero Ruined Blanks',
    description: 'Split-screen validation eliminates wasted PVC cards from missing fields or margin cutoff.',
  },
  {
    icon: TrendingUp,
    title: '₹25 to ₹60 Margin Per Card',
    description: 'Raw blank + ink costs ~₹10-₹15; retail selling price is ₹50-₹80 per finished card.',
  },
];

const faqs = [
  {
    question: 'How do cyber cafes benefit from Accero PrintPortal?',
    answer:
      'Cyber cafes typically lose money when customer card prints are ruined by missing father names or clipped margins. Accero PrintPortal catches missing fields live on screen and provides free re-prints, saving wasted blanks and ink.',
  },
  {
    question: 'Can CSC operators legally use this software?',
    answer:
      'Yes. Accero PrintPortal is an independent document layout formatting utility used for printing records already authorized and held by citizens. Operators must always adhere to data privacy and client consent standards.',
  },
  {
    question: 'Is any special proprietary hardware required?',
    answer:
      'No specialized proprietary hardware is required. You can use standard photo inkjet printers with PVC card trays (e.g. Epson L805) or direct-to-card thermal printers (Zebra, Evolis).',
  },
  {
    question: 'How does the ₹0 re-print policy help retail print shops?',
    answer:
      'When a customer accidentally drops, scratches, or loses a recently printed PVC card, print shops can re-print from their encrypted vault history without paying any additional API or platform fee.',
  },
  {
    question: 'Can multiple operators in the same shop share one account?',
    answer:
      'Yes. A shop owner can maintain a shared operator balance across multiple counter computers. All processed documents are centrally archived in the shop vault.',
  },
];

export default function SolutionsOverviewPage() {
  const softwareSchema = generateSoftwareApplicationSchema('Accero PrintPortal Industry Solutions');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Solutions', url: '/solutions' },
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
            <span className="text-[#8B1E2D]">Solutions</span>
          </nav>

          {/* Hero Header */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#1D3557] border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-[#8B1E2D]" />
              <span>Targeted Operator Solutions</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight leading-tight">
              Tailored Solutions for Document Service Businesses
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              Discover purpose-built document processing and PVC printing workflows for Cyber Cafes, CSC VLEs, Printing Kiosks, and Citizen Service Centers across India. Eliminate print errors and maximize counter profit margins.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all"
              >
                Register Your Business
              </Link>
              <Link
                href="/features"
                className="px-6 py-3 rounded-xl text-sm font-bold bg-slate-100 text-[#1D3557] border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                Explore All Features
              </Link>
            </div>
          </div>

          {/* ROI & Operator Impact Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roiMetrics.map((metric, i) => {
              const IconComp = metric.icon;
              return (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#8B1E2D]">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#1D3557]">{metric.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{metric.description}</p>
                </div>
              );
            })}
          </div>

          {/* Solutions Grid */}
          <div className="space-y-6">
            <div className="text-left space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557]">
                Choose Your Business Profile
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Tailored workflows matching the specific hardware, customer profiles, and service menus of your shop.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {solutions.map((sol) => {
                const IconComp = sol.icon;
                return (
                  <Card
                    key={sol.slug}
                    hoverEffect
                    className="p-8 border border-slate-200/90 flex flex-col justify-between"
                  >
                    <div className="space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                          <IconComp className={`w-6 h-6 ${sol.color}`} />
                        </div>
                        <Badge variant="outline" className="text-xs font-semibold">
                          {sol.badge}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-[#1D3557]">{sol.title}</h3>
                        <span className="text-xs font-semibold text-slate-400 block">
                          {sol.subtitle}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {sol.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Key Advantages for Operators:
                        </span>
                        <ul className="space-y-1.5">
                          {sol.highlights.map((h, idx) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                        <span className="font-bold text-slate-700">Typical Hardware Setup: </span>
                        {sol.counterProfile}
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100">
                      <Link
                        href={`/solutions/${sol.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#1D3557] hover:text-[#8B1E2D] transition-colors"
                      >
                        <span>View Dedicated Solution for {sol.title.replace('For ', '')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Compliance Notice */}
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1 text-left">
            <span className="font-bold uppercase tracking-wider block text-amber-800">
              Operator Compliance Notice:
            </span>
            <p>
              Accero PrintPortal is an independent commercial software platform engineered for document layout formatting and physical card tray alignment. It is not an official government portal and does not issue identity credentials. Operators must ensure they possess legitimate customer consent and comply with applicable laws when printing personal identity cards.
            </p>
          </div>

          {/* FAQ Section */}
          <FAQSection
            faqs={faqs}
            title="Frequently Asked Questions About Business Solutions"
            subtitle="Direct answers to help cyber cafes, CSCs, and print shops evaluate Accero PrintPortal."
          />

          {/* CTA */}
          <CTASection
            title="Transform Your Document Printing Services Today"
            description="Join thousands of operators across India using Accero PrintPortal for fast, reliable, zero-margin card printing."
          />
        </div>
      </div>
    </>
  );
}
