import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Table,
  HelpCircle,
  FileCheck,
  Printer,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';
import { getCanonicalUrl } from '@/lib/seo/canonical';

export const metadata: Metadata = buildPageMetadata({
  title: 'CR80 Card Dimensions: The Complete Size & Measurement Guide',
  description:
    'Comprehensive reference on ISO/IEC 7810 ID-1 (CR80) standard card dimensions in millimeters (85.60 × 53.98 mm), inches, and pixels at 300 DPI for PVC card printing.',
  path: '/blog/cr80-card-dimensions-guide',
  keywords: [
    'cr80 card size in mm',
    'cr80 card dimensions',
    'id-1 vs cr80',
    'standard pvc card dimensions',
    'cr80 size in inches',
    'cr80 size in pixels 300 dpi',
    'pvc card corner radius',
  ],
});

const faqs = [
  {
    question: 'What is the exact size of a CR80 card in millimeters?',
    answer:
      'A standard CR80 card measures exactly 85.60 mm in width by 53.98 mm in height (3.370 in × 2.125 in). The standard thickness is 0.76 mm (30 mil), and the four corners have a rounded radius of 3.18 mm (1/8 inch).',
  },
  {
    question: 'What is the difference between ID-1 and CR80 card dimensions?',
    answer:
      'ID-1 and CR80 refer to the exact same physical format. ISO/IEC 7810 is the international formal standard defining the "ID-1" form factor, while "CR80" is the common commercial industry designation used by card printer manufacturers and plastic fabricators.',
  },
  {
    question: 'What are CR80 dimensions in pixels for 300 DPI printing?',
    answer:
      'At 300 DPI (dots per inch), a CR80 card canvas is 1011 pixels wide by 638 pixels high. When preparing designs with full bleed, designers typically add 1-2 mm margin bleed, resulting in a 1038 × 664 pixel canvas.',
  },
];

export default function Cr80DimensionsArticlePage() {
  const currentUrl = getCanonicalUrl('/blog/cr80-card-dimensions-guide');
  const articleSchema = generateArticleSchema({
    title: 'CR80 Card Dimensions: The Complete Size & Measurement Guide',
    description:
      'Complete reference on ISO/IEC 7810 ID-1 (CR80) standard card dimensions in millimeters, inches, and pixels at 300 DPI for PVC card printing.',
    url: currentUrl,
    datePublished: '2026-11-10T00:00:00.000Z',
    authorName: 'Accero Technical Team',
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: 'CR80 Dimensions Guide', url: '/blog/cr80-card-dimensions-guide' },
  ]);
  const faqSchema = generateFaqSchema(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
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
        <article className="max-w-4xl mx-auto space-y-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#1D3557] transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">CR80 Dimensions</span>
          </nav>

          {/* Article Header */}
          <header className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-bold text-[#8B1E2D] uppercase tracking-wider">
                Technical Standards & Hardware
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                November 2026
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                6 min read
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight leading-tight">
              CR80 Card Dimensions: The Complete Size & Measurement Guide
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Whether you are printing PVC PAN cards, Aadhaar cards, Voter IDs, or Driving Licences, conforming strictly to the ISO/IEC 7810 ID-1 (CR80) standard is essential for physical card tray alignment. Here is the authoritative measurement guide.
            </p>
          </header>

          {/* AEO Direct Answer Box */}
          <div className="bg-white border-l-4 border-l-[#8B1E2D] p-6 sm:p-8 rounded-2xl shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
              Quick Answer: What are CR80 Card Dimensions?
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
              A standard CR80 card measures <strong>85.60 mm × 53.98 mm</strong> (3.370 in × 2.125 in) with a corner radius of <strong>3.18 mm</strong> (0.125 in) and a thickness of <strong>0.76 mm</strong> (30 mil / 0.030 in). At 300 DPI print resolution, the digital canvas dimensions are exactly <strong>1011 × 638 pixels</strong>.
            </p>
          </div>

          {/* Article Body */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1D3557]">
                1. ISO/IEC 7810 ID-1 Standard vs. CR80 Designation
              </h2>
              <p>
                In the printing and identification industry, the terms <strong>ID-1</strong> and <strong>CR80</strong> are used interchangeably.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>ISO/IEC 7810 ID-1:</strong> The formal international standard published by the International Organization for Standardization defining the physical characteristics of identification cards, including dimensions, bending stiffness, flammability, and toxicity.
                </li>
                <li>
                  <strong>CR80:</strong> The commercial specification name ("Customer Reference 80") popularized by thermal direct-to-card printer manufacturers such as Zebra, Evolis, Fargo, and Magicard.
                </li>
              </ul>
              <p>
                All modern Indian citizen identity cards (PAN cards, Voter IDs, smart Driving Licences, and vehicle registration smart cards) are physically engineered to fit the ID-1 / CR80 form factor.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1D3557]">
                2. Comprehensive Measurements Reference Table
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Measurement Unit</th>
                      <th className="py-3 px-4">Width</th>
                      <th className="py-3 px-4">Height</th>
                      <th className="py-3 px-4">Corner Radius</th>
                      <th className="py-3 px-4">Thickness</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-4 font-bold text-[#1D3557]">Millimeters (mm)</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">85.60 mm</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600">53.98 mm</td>
                      <td className="py-3 px-4 font-mono">3.18 mm</td>
                      <td className="py-3 px-4 font-mono">0.76 mm</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-4 font-bold text-[#1D3557]">Inches (in)</td>
                      <td className="py-3 px-4 font-mono">3.370 in</td>
                      <td className="py-3 px-4 font-mono">2.125 in</td>
                      <td className="py-3 px-4 font-mono">0.125 in</td>
                      <td className="py-3 px-4 font-mono">0.030 in</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-4 font-bold text-[#1D3557]">Centimeters (cm)</td>
                      <td className="py-3 px-4 font-mono">8.56 cm</td>
                      <td className="py-3 px-4 font-mono">5.40 cm</td>
                      <td className="py-3 px-4 font-mono">0.32 cm</td>
                      <td className="py-3 px-4 font-mono">0.08 cm</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#1D3557]">Pixels @ 300 DPI</td>
                      <td className="py-3 px-4 font-mono text-purple-600">1011 px</td>
                      <td className="py-3 px-4 font-mono text-purple-600">638 px</td>
                      <td className="py-3 px-4 font-mono">38 px</td>
                      <td className="py-3 px-4 font-mono">N/A</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1D3557]">
                3. The 300 DPI Resolution Requirement
              </h2>
              <p>
                Printing on plastic PVC surfaces requires significantly higher visual density than standard office printing. Because PVC plastic does not absorb liquid ink the same way as paper, text smaller than 6pt can become unreadable if rendered below 300 DPI.
              </p>
              <p>
                Accero PrintPortal exports all document layouts as 300+ DPI vector assets with embedded fonts, ensuring barcode strings, micro-text, and emblems remain razor sharp.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1D3557]">
                4. Why Browser Printing Causes Card Margin Drift
              </h2>
              <p>
                A frequent problem cyber cafes experience is margin drift: when pressing print from standard image viewers or web browsers, cards shift 5mm to 10mm off center, printing across the plastic divider of the card tray.
              </p>
              <p>
                Accero PrintPortal solves this via CSS print engine directives:
              </p>
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto">
                <code>{`@media print {
  @page {
    size: 85.60mm 53.98mm;
    margin: 0;
  }
  body {
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
  }
}`}</code>
              </pre>
              <p>
                By setting the exact `@page size` to 85.60mm × 53.98mm and removing margin offsets, browsers feed coordinates directly to the card tray slots on Epson and Canon printers with 1:1 precision.
              </p>
            </section>
          </div>

          {/* FAQs */}
          <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
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

          {/* Next Steps CTA */}
          <div className="p-8 rounded-3xl bg-[#1D3557] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Print ISO-Compliant Cards with Zero Drift</h3>
              <p className="text-xs text-slate-300">
                Accero PrintPortal pre-formats all cards to exact 85.60 mm × 53.98 mm dimensions.
              </p>
            </div>
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all shrink-0"
            >
              Start Free Trial
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}

