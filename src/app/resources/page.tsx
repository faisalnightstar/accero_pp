import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  BookOpen,
  Printer,
  Layers,
  Sparkles,
  ArrowRight,
  FileText,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Download,
  Terminal,
  Cpu,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema, generateFaqSchema } from '@/lib/seo/structuredData';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FAQSection } from '@/components/public/FAQSection';
import { CTASection } from '@/components/public/CTASection';

export const metadata: Metadata = buildPageMetadata({
  title: 'Operator Resources, Calibration Guides & CR80 Specs | Accero PrintPortal',
  description:
    'Comprehensive technical references and printing guides for cyber cafe and CSC operators. Master CR80 card dimensions, PVC printer tray alignment for Epson/Canon, and missing-field troubleshooting.',
  path: '/resources',
  keywords: [
    'pvc card printing resources',
    'id card printing guides',
    'cr80 card size specifications',
    'epson l805 card tray instructions',
    'canon g series id tray settings',
    'cyber cafe training guides',
    'csc operator printer calibration',
    'zero margin card printing css',
  ],
});

const resources = [
  {
    slug: '/blog/cr80-card-dimensions-guide',
    category: 'Technical Specifications',
    title: 'CR80 Card Dimensions: The Complete Size & Measurement Guide',
    description:
      'Detailed breakdown of ISO/IEC 7810 ID-1 standard dimensions in millimeters, inches, and pixels at 300 DPI. Understand thickness, corner radii, and printer tray allowances.',
    badge: 'Essential Reading',
    readTime: '6 min read',
  },
  {
    slug: '/blog/pvc-card-printer-tray-guide',
    category: 'Hardware & Setup',
    title: 'How to Print PVC Cards on Epson L805 & Canon Printers Without Margin Cutoff',
    description:
      'Step-by-step tutorial on loading PVC card trays, setting 0-margin paper profiles, and avoiding margin drift on desktop photo printers.',
    badge: 'Hardware Tutorial',
    readTime: '8 min read',
  },
  {
    slug: '/blog/cyber-cafe-document-printing-guide',
    category: 'Business Operations',
    title: 'The Cyber Cafe Guide to High-Margin Identity Card Printing in India',
    description:
      'Learn how retail document centers turn walk-in citizen requests into high-margin PVC card orders with zero failed prints and free re-print policies.',
    badge: 'Operator Playbook',
    readTime: '10 min read',
  },
  {
    slug: '/blog/how-to-fix-missing-card-fields',
    category: 'Operator Troubleshooting',
    title: 'How to Fix Missing Demographic Fields in Online Card Printing',
    description:
      'Stop ruining PVC blanks. Learn how to detect missing father names, addresses, and photos live on the split-screen studio and complete them before printing.',
    badge: 'Quality Control',
    readTime: '7 min read',
  },
  {
    slug: '/blog/multilingual-document-printing-guide',
    category: 'Typography & Regional Scripts',
    title: 'Regional Language Printing for Indian Identity Cards: Devanagari & Hindi Fonts',
    description:
      'Avoid broken characters and font substitution errors. Complete guide to calibrating bilingual regional scripts for PVC card trays using Google Fonts Hind.',
    badge: 'Typography Guide',
    readTime: '8 min read',
  },
];

const faqs = [
  {
    question: 'What is the standard size of a PVC identity card in India?',
    answer:
      'Standard identity cards (PAN, Aadhaar, Voter EPIC, Driving Licence, Vehicle RC) conform to the international ISO/IEC 7810 ID-1 standard (CR80 format), measuring exactly 85.60 mm × 53.98 mm with 3.18 mm rounded corners.',
  },
  {
    question: 'How do I prevent printer margins from shifting on Epson PVC trays?',
    answer:
      'In your browser print dialog, set Paper Size to "User Defined / CD/DVD Tray", Margins to "None / Minimum", and Scale to "100%". Accero PrintPortal automatically injects zero-margin CSS @page rules to prevent browser margin offsets.',
  },
  {
    question: 'What resolution should photos and signatures have on printed cards?',
    answer:
      'All cards rendered on Accero PrintPortal use 300+ DPI high-density rendering (1011 × 638 pixels per card face) to ensure crisp micro-text, razor-sharp QR codes, and clear portrait photographs.',
  },
];

export default function ResourcesPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
  ]);
  const faqSchema = generateFaqSchema(faqs);

  return (
    <>
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
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Resources</span>
          </nav>

          {/* Hero */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#1D3557] border border-slate-200">
              <BookOpen className="w-3.5 h-3.5 text-[#8B1E2D]" />
              <span>Operator Knowledge &amp; Technical Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight">
              Educational Guides &amp; Printing Standards
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              In-depth technical references, hardware calibration tutorials, and operational playbooks designed to help cyber cafes, CSC operators, and print businesses master PVC card production.
            </p>
          </div>

          {/* Resources Grid */}
          <div className="space-y-6">
            <div className="text-left space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D3557]">
                Technical Guides &amp; Tutorials
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Essential reference material covering physical standards, printer trays, and shop profitability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((item, idx) => (
                <Card
                  key={idx}
                  hoverEffect
                  className="p-8 border border-slate-200/90 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <Badge variant="default" size="sm">
                        {item.readTime}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#1D3557] leading-snug mb-2 hover:text-[#8B1E2D] transition-colors">
                        <Link href={item.slug}>{item.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <Link
                      href={item.slug}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B1E2D] hover:text-[#721925] transition-colors"
                    >
                      <span>Read Full Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Cheat-Sheet Table */}
          <Card className="p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="space-y-1 text-left">
              <h2 className="text-xl font-bold text-[#1D3557]">
                CR80 Card Dimensions Quick Reference Table
              </h2>
              <p className="text-xs text-slate-500">
                Universal physical dimensions conforming to ISO/IEC 7810 ID-1 standard for PVC cards.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Standard / Unit</th>
                    <th className="py-3 px-4">Width</th>
                    <th className="py-3 px-4">Height</th>
                    <th className="py-3 px-4">Corner Radius</th>
                    <th className="py-3 px-4">Standard Thickness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1D3557]">Millimeters (Metric)</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">85.60 mm</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">53.98 mm</td>
                    <td className="py-3.5 px-4 font-mono">3.18 mm</td>
                    <td className="py-3.5 px-4 font-mono">0.76 mm (30 mil)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1D3557]">Inches (Imperial)</td>
                    <td className="py-3.5 px-4 font-mono">3.370 in</td>
                    <td className="py-3.5 px-4 font-mono">2.125 in</td>
                    <td className="py-3.5 px-4 font-mono">0.125 in (1/8")</td>
                    <td className="py-3.5 px-4 font-mono">0.030 in</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1D3557]">Pixels @ 300 DPI</td>
                    <td className="py-3.5 px-4 font-mono text-indigo-700 font-bold">1011 px</td>
                    <td className="py-3.5 px-4 font-mono text-indigo-700 font-bold">638 px</td>
                    <td className="py-3.5 px-4 font-mono">38 px</td>
                    <td className="py-3.5 px-4 font-mono">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Operator Calibration Code Snippet Box */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-4 text-left">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#8B1E2D]" />
              <h3 className="text-base font-bold text-[#1D3557]">Zero-Margin CSS Rule for Card Trays</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If you build custom print templates or print from your browser, inject this standardized CSS rule into your stylesheet to disable margin drift and prevent white borders on PVC ID card trays:
            </p>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto">
{`@media print {
  @page {
    size: 85.60mm 53.98mm;
    margin: 0mm;
  }
  body {
    margin: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}`}
            </pre>
          </div>

          {/* FAQ Section */}
          <FAQSection
            faqs={faqs}
            title="Technical &amp; Calibration FAQs"
            subtitle="Frequently asked questions regarding print dimensions, tray settings, and resolution."
          />

          {/* CTA */}
          <CTASection
            title="Ready to Print Perfect PVC Cards?"
            description="Create an operator account and experience zero-margin CR80 printing with split-screen validation."
          />
        </div>
      </div>
    </>
  );
}
