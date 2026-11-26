import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Laptop,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Printer,
  ShieldCheck,
  Eye,
  CreditCard,
  Zap,
  Users,
  Coins,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FAQSection } from '@/components/public/FAQSection';
import { CTASection } from '@/components/public/CTASection';

export const metadata: Metadata = buildPageMetadata({
  title: 'Cyber Cafe Printing Software – High-Margin PVC Card Maker | Accero',
  description:
    'The dedicated cyber cafe printing software for high-speed PVC card formatting. Eliminate ruined card stock with live amber missing-field alerts and free lifetime re-prints.',
  path: '/cyber-cafe-printing-software',
  keywords: [
    'cyber cafe printing software',
    'cyber cafe document printing software',
    'cyber cafe card printing solutions',
    'pvc id card software for cyber cafe',
    'cyber cafe print portal',
    'epson l805 cyber cafe print tool',
    'cyber cafe software india',
    'cyber cafe card printing business',
    'cyber cafe billing and card printing software',
    'instant id card print software cyber cafe',
    'smart card printing software for cyber cafe',
    'epson l8050 cyber cafe software',
    'canon g570 cyber cafe printing',
    '1 click id card print action',
    'photoshop id card action free download alternative',
    'smart csc tools cyber cafe',
    'fastergyan print tools alternative',
    'vle club aadhaar cutter alternative',
    'inkjet printable pvc cards for cyber cafe',
    'cyber cafe pvc card tray printer settings',
  ],
});

const cafeHighlights = [
  {
    title: 'Zero Photoshop Training for Staff',
    desc: 'Empower your cyber cafe assistants to format and print cards in under 60 seconds without manual cropping, Photoshop layers, or complex graphic editing.',
    icon: Zap,
  },
  {
    title: 'Eliminate Wasted ₹25–₹35 Plastic Cards',
    desc: 'When external lookups return incomplete father names, missing signatures, or bad photos, our studio flags them in amber so staff never waste expensive PVC stock.',
    icon: AlertTriangle,
  },
  {
    title: 'High Profit Margins on Every Walk-In',
    desc: 'At ₹5 for manual formatting or ₹20–₹30 for automated lookups, cyber cafes charging customers ₹50 to ₹100 per PVC card earn upwards of 65% net gross margin.',
    icon: TrendingUp,
  },
  {
    title: '100% Free Lifetime Customer Re-Prints',
    desc: 'Returning customers needing a duplicate card can be serviced in seconds from your private vault at ₹0 cost to you. Retain 100% of the customer reprint fee.',
    icon: Coins,
  },
  {
    title: 'Direct Epson Tray J & Canon Alignment',
    desc: 'Direct browser CSS print engine calibrated to 85.60 mm × 53.98 mm ISO/IEC 7810 ID-1 standard dimensions. Perfect zero-margin fit for Epson L805 and Canon trays.',
    icon: Printer,
  },
  {
    title: 'Sub-100ms Speed During Peak Morning Rush',
    desc: 'Hosted on high-availability Vercel Edge infrastructure. Never experience 502 Bad Gateway timeouts during peak government exam and admission registration hours.',
    icon: Laptop,
  },
];

const economicsData = [
  {
    service: 'PAN Card Print (CR80 PVC)',
    costToCafe: '₹20 (Lookup) / ₹5 (Manual)',
    customerPrice: '₹70 – ₹100',
    netProfit: '₹50 – ₹80',
    margin: '70% – 80%',
  },
  {
    service: 'Aadhaar PVC Card (Bilingual)',
    costToCafe: '₹30 (Lookup) / ₹5 (Manual)',
    customerPrice: '₹70 – ₹100',
    netProfit: '₹40 – ₹70',
    margin: '60% – 70%',
  },
  {
    service: 'Voter ID (EPIC National Format)',
    costToCafe: '₹20 (Lookup) / ₹5 (Manual)',
    customerPrice: '₹60 – ₹80',
    netProfit: '₹40 – ₹60',
    margin: '66% – 75%',
  },
  {
    service: 'Driving Licence / Vehicle RC',
    costToCafe: '₹25 (Lookup) / ₹5 (Manual)',
    customerPrice: '₹80 – ₹120',
    netProfit: '₹55 – ₹95',
    margin: '70% – 80%',
  },
  {
    service: 'Customer Duplicate Re-Print',
    costToCafe: '₹0 (Free Lifetime)',
    customerPrice: '₹50 – ₹70',
    netProfit: '₹50 – ₹70',
    margin: '100% Net Profit',
  },
];

const cafeFaqs = [
  {
    question: 'How does Accero PrintPortal increase a cyber cafe’s daily profit?',
    answer:
      'Cyber cafes typically lose money on ruined plastic card stock when staff make alignment errors or when APIs return missing fields. Accero eliminates ruined cards through an interactive split-screen editor that flags errors before printing. Combined with 100% free lifetime re-prints (₹0), cafes earn 65% to 80% margins on initial prints and 100% margins on repeat prints.',
  },
  {
    question: 'Do my cyber cafe staff need graphic design or Photoshop skills?',
    answer:
      'Not at all. Accero PrintPortal is designed with an intuitive browser-based interface. Staff simply enter an ID number or paste demographic details into labeled inputs, and the live vector card updates letter-by-letter in real time. Anyone who can browse the web can produce high-quality cards in under a minute.',
  },
  {
    question: 'Which printers work best with Accero in a cyber cafe environment?',
    answer:
      'The most popular and cost-effective setup in Indian cyber cafes is an Epson EcoTank L805, L850, or L8050 printer equipped with an aftermarket 2-card PVC tray (Tray J), or a Canon PIXMA G-series with an ID card tray. Accero outputs exact 1:1 ISO 7810 ID-1 standard dimensions with zero margins.',
  },
  {
    question: 'Are there any monthly subscription fees or software license keys?',
    answer:
      'No. Accero operates purely on a prepaid utility wallet model. You top up your wallet via UPI QR code starting at ₹100. There are no monthly fees, no annual renewals, and unused wallet balances never expire.',
  },
  {
    question: 'Is citizen demographic data stored securely in my cyber cafe account?',
    answer:
      'Yes. Accero complies with DPDP standards. Records saved in your operator studio are accessible exclusively to your authenticated user account. Accero never exposes customer data publicly, and no citizen PII is ever shared or sent to analytics trackers.',
  },
];

export default function CyberCafePrintingSoftwarePage() {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Specialized Portals', url: '/print-portal' },
    { name: 'Cyber Cafe Printing Software', url: '/cyber-cafe-printing-software' },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const softwareSchema = generateSoftwareApplicationSchema(
    'Accero Cyber Cafe Printing Software',
    'BusinessApplication',
    [
      'Cyber Cafe Fast Walk-in Document Formatting',
      'Split-Screen Live PVC Card Studio with Amber Field Guides',
      'Epson Tray J and Canon Pixma Zero-Margin Tray Alignment',
      'Transparent Pay-As-You-Print Utility Rates with UPI Top-Up',
      '100% Free Lifetime Re-Prints for Returning Customers',
    ]
  );
  const faqSchema = generateFaqSchema(cafeFaqs);

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
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-2">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/print-portal" className="hover:text-slate-900 transition-colors">
              Specialized Portals
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Cyber Cafe Printing Software</span>
          </nav>

          {/* Hero Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>High-Margin PVC Card Software for Cyber Cafes Across India</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Cyber Cafe Printing Software for{' '}
                <span className="text-emerald-600">Fast Walk-In Turnaround</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Streamline your cyber cafe’s document formatting and PVC card printing. Give your counter assistants an intuitive tool that formats PAN, Aadhaar, Voter, DL, RC, and Ration cards in 60 seconds with zero wasted plastic stock.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Button href="/register" variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                  Create Free Cyber Cafe Account
                </Button>
                <Button href="/studio" variant="outline" size="lg">
                  Open Interactive Studio
                </Button>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  60-Second Card Turnaround
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  65% – 80% Gross Profit Margin
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Free Lifetime Re-Prints
                </span>
              </div>
            </div>
          </section>

          {/* Highlights Grid */}
          <section className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Cyber Cafe Advantages
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Built to Accelerate Your Cyber Cafe Business
              </h2>
              <p className="text-sm text-slate-600">
                Stop wasting staff hours in Adobe Photoshop or dealing with slow, crashed legacy portals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cafeHighlights.map((item, idx) => (
                <Card key={idx} className="p-6 space-y-3 bg-white border-slate-200/90 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* Business Economics Table */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Operator Economics
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Cyber Cafe Profit Margins per Document Print
              </h2>
              <p className="text-sm text-slate-600">
                Transparent utility costs that maximize your shop's bottom line.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75">
                    <th className="py-3 px-4 font-bold text-slate-900">Document Type</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Cost to Cyber Cafe</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Typical Customer Price</th>
                    <th className="py-3 px-4 font-bold text-emerald-700">Net Profit per Card</th>
                    <th className="py-3 px-4 font-bold text-emerald-700">Profit Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {economicsData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{row.service}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{row.costToCafe}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{row.customerPrice}</td>
                      <td className="py-3.5 px-4 text-xs font-bold text-emerald-700">{row.netProfit}</td>
                      <td className="py-3.5 px-4 text-xs font-bold text-emerald-700">{row.margin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQs */}
          <FAQSection faqs={cafeFaqs} title="Frequently Asked Questions by Cyber Cafe Owners" />

          {/* CTA */}
          <CTASection
            title="Start Printing High-Margin PVC Cards Today"
            description="Equip your cyber cafe with modern, reliable printing software. Zero setup fees, instant UPI wallet top-ups, and 100% free lifetime re-prints."
            primaryButtonText="Create Cyber Cafe Account"
            primaryButtonHref="/register"
            secondaryButtonText="Explore Card Studio"
            secondaryButtonHref="/studio"
          />

          {/* Compliance Disclaimer */}
          <footer className="text-center text-xs text-slate-500 max-w-3xl mx-auto pt-4 space-y-2">
            <p>
              <strong>Compliance Notice:</strong> Accero PrintPortal is an independent commercial software platform for layout preparation and document printing. It is not affiliated with, endorsed by, or partnered with any government authority. Cyber cafe operators must ensure lawful citizen consent before processing or printing identity documents.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
