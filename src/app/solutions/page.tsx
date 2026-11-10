import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Building2,
  Users,
  Printer,
  Sparkles,
  ArrowRight,
  Shield,
  CheckCircle2,
  HelpCircle,
  Laptop,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Industry Solutions for Document Service Businesses | Accero PrintPortal',
  description:
    'Discover purpose-built document processing solutions for Cyber Cafes, CSC Operators, Printing Kiosks, and Digital Service Centers. Eliminate print failures and increase shop profitability.',
  path: '/solutions',
  keywords: [
    'cyber cafe software',
    'csc operator software',
    'printing shop management software',
    'digital service center software',
    'jan seva kendra software',
    'pvc card print solutions',
  ],
});

const solutions = [
  {
    slug: 'cyber-cafes',
    title: 'For Cyber Cafes',
    subtitle: 'High-Volume Card Printing Without Missing API Data',
    description:
      'Turn walk-in visitors into high-margin PVC card customers. Format PAN, Aadhaar, Voter, and DL cards in seconds with real-time missing field detection.',
    icon: Laptop,
    badge: 'Popular for Retail Cafes',
    color: 'text-[#E63946] bg-red-50 border-red-200',
  },
  {
    slug: 'csc-operators',
    title: 'For CSC Operators (VLEs)',
    subtitle: 'Government Card Formatting for Rural & Urban Citizens',
    description:
      'Empower Common Service Centers (CSCs) and Jan Seva Kendras to format high-resolution identity documents using desktop card trays on Epson and Canon printers.',
    icon: Users,
    badge: 'Built for VLEs',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    slug: 'printing-shops',
    title: 'For Printing Shops',
    subtitle: 'Zero Margin-Drift Output for Commercial ID Trays',
    description:
      'Engineered for print shops running Evolis, Zebra, Fargo, and Epson printers. 300+ DPI vector PDFs perfectly calibrated to ISO 7810 ID-1 standard dimensions.',
    icon: Printer,
    badge: 'Industrial Precision',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    slug: 'digital-service-centers',
    title: 'For Digital Service Centers',
    subtitle: 'Multi-Service Front-Desk Fulfillment Utility',
    description:
      'Streamline operator counters in municipal centers and citizen kiosks. Single dashboard for lookups, photo cropping, and print accounting.',
    icon: Building2,
    badge: 'Multi-Counter Ready',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
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
    question: 'Is any special hardware required?',
    answer:
      'No specialized proprietary hardware is required. You can use standard photo inkjet printers with PVC card trays (e.g. Epson L805) or direct-to-card thermal printers (Zebra, Evolis).',
  },
];

export default function SolutionsOverviewPage() {
  const softwareSchema = generateSoftwareApplicationSchema('Accero PrintPortal Solutions');
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

      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Solutions</span>
          </nav>

          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-[#8B1E2D] border border-red-200">
              <Sparkles className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Tailored Business Solutions</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight">
              Document Processing Built for Your Business Model
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Whether you run a single-desk cyber cafe, a busy Common Service Centre, or a high-volume print shop, Accero PrintPortal scales to your operational demands.
            </p>
          </div>

          {/* Solutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {solutions.map((sol) => {
              const IconComp = sol.icon;
              return (
                <div
                  key={sol.slug}
                  className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${sol.color}`}
                      >
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                        {sol.badge}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-[#1D3557]">{sol.title}</h2>
                      <span className="text-xs font-semibold text-slate-500 block mb-2">
                        {sol.subtitle}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {sol.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/solutions/${sol.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#8B1E2D] hover:text-[#E63946] transition-colors"
                    >
                      <span>Explore {sol.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/register"
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQs */}
          <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557] flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#8B1E2D]" />
              <span>Frequently Asked Questions</span>
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <h3 className="text-sm font-bold text-[#1D3557] mb-1">{faq.question}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-3xl bg-gradient-to-r from-[#1D3557] to-[#14233c] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Empower Your Shop Today</h3>
              <p className="text-sm text-slate-300 max-w-xl">
                Join thousands of operators across India using Accero PrintPortal to format and print high-quality PVC cards.
              </p>
            </div>
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all shrink-0"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

