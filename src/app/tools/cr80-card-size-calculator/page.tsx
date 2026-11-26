import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Maximize2,
  Printer,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';
import { Cr80CalculatorClient } from '@/components/tools/Cr80CalculatorClient';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = buildPageMetadata({
  title: 'CR80 Card Size Calculator (Pixels, MM, Inches & DPI) | Accero PrintPortal',
  description:
    'Free online ISO/IEC 7810 ID-1 (CR80) card dimension calculator. Convert PVC card size to exact pixels for 96, 300, 600, 1200 DPI printer trays (Epson/Canon) with custom bleed.',
  path: '/tools/cr80-card-size-calculator',
  keywords: [
    'cr80 card size calculator',
    'cr80 dimensions in pixels',
    'pvc card pixel dimensions',
    '85.60 x 53.98 mm in pixels',
    '300 dpi id card size pixels',
    'epson l805 card size pixels',
    'canon g series id card tray dimensions',
    'cr80 bleed calculator',
    'id card printing resolution',
    'iso 7810 id 1 card dimensions',
    'calculate id card dimensions 300 dpi',
    'cr80 to pixels converter',
  ],
});

const faqItems = [
  {
    question: 'What are the exact physical dimensions of a CR80 PVC card?',
    answer:
      'According to the ISO/IEC 7810 standard (ID-1 format), a standard CR80 card measures exactly 85.60 mm in width, 53.98 mm in height (3.370 × 2.125 inches), with a corner radius of 3.18 mm (0.125 inches) and a standard thickness of 0.76 mm (30 mil).',
  },
  {
    question: 'What is the exact pixel dimension of a CR80 card at 300 DPI?',
    answer:
      'At 300 DPI (dots per inch), a standard CR80 card is exactly 1011 pixels wide by 638 pixels high. At 600 DPI, it measures 2022 × 1275 pixels.',
  },
  {
    question: 'How much bleed margin should I add for PVC card tray printing?',
    answer:
      'For pre-cut PVC card blanks in Epson or Canon inkjet trays, 0 mm bleed (exact 1011 × 638 px at 300 DPI) is standard because the tray guides the pre-cut blank directly. For thermal dye-sublimation or guillotine die cutters, adding 1 mm to 2 mm outer bleed (1035 × 661 px to 1058 × 685 px) prevents white unprinted borders.',
  },
  {
    question: 'How do Epson L805 and Canon G-Series trays align cards?',
    answer:
      'Epson L805/L8050/L850 and Canon G570/G670 trays hold 2 pre-cut CR80 cards simultaneously. Accero PrintPortal automatically formats print outputs to align perfectly with the standard tray coordinates without manual cropping or dragging in Photoshop.',
  },
];

export default function Cr80CalculatorPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Tools', url: '/tools/cr80-card-size-calculator' },
    { name: 'CR80 Card Size Calculator', url: '/tools/cr80-card-size-calculator' },
  ]);

  const appSchema = generateSoftwareApplicationSchema(
    'Accero CR80 PVC Card Size & DPI Calculator',
    'UtilityApplication',
    [
      'Real-time ISO/IEC 7810 ID-1 physical to pixel dimension conversion',
      'Preset support for 96 DPI, 300 DPI, 600 DPI, and 1200 DPI',
      'Dynamic bleed margin compensation (0mm to 5mm)',
      'Direct copyable CSS and pixel measurement specifications',
      'Epson L805 and Canon G-Series tray calibration metrics',
    ]
  );

  const faqSchema = generateFaqSchema(faqItems);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#1D3557] to-[#14243b] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-300 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-400">Tools</span>
            <span>/</span>
            <span className="text-sky-300 font-medium">CR80 Card Size Calculator</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-200 border border-sky-400/30 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Free Operator Utility • ISO/IEC 7810 ID-1 Standard
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              CR80 Card Size Calculator
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Convert official standard CR80 PVC card dimensions (85.60 mm × 53.98 mm) into exact pixel
              coordinates for 96, 300, 600, and 1200 DPI printer trays. Calculate outer bleed allowances
              for Epson, Canon, and thermal dye-sublimation card printers.
            </p>
          </div>
        </div>
      </section>

      {/* Main Interactive Tool Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-16 relative z-10">
        <Cr80CalculatorClient />

        {/* Technical Reference Guide Below Calculator */}
        <div className="mt-12 space-y-12">
          {/* Quick Resolution Matrix Table */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Maximize2 className="w-5 h-5 text-[#1D3557]" />
              CR80 Pixel Dimensions by Target Resolution (DPI)
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Official ISO/IEC 7810 ID-1 cards feature a standard physical aspect ratio of 1.5858 (85.60 mm ÷ 53.98 mm).
              The table below outlines exact pixel rendering boundaries across common output profiles.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Resolution</th>
                    <th className="py-3 px-4">Width (px)</th>
                    <th className="py-3 px-4">Height (px)</th>
                    <th className="py-3 px-4">Total Pixels</th>
                    <th className="py-3 px-4">Corner Radius (px)</th>
                    <th className="py-3 px-4">Primary Hardware / Use Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">72 DPI</td>
                    <td className="py-3 px-4 font-mono">243 px</td>
                    <td className="py-3 px-4 font-mono">153 px</td>
                    <td className="py-3 px-4 text-xs text-slate-500">37,179 px</td>
                    <td className="py-3 px-4 font-mono">9 px</td>
                    <td className="py-3 px-4 text-xs">Legacy screen thumbnails</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">96 DPI</td>
                    <td className="py-3 px-4 font-mono">324 px</td>
                    <td className="py-3 px-4 font-mono">204 px</td>
                    <td className="py-3 px-4 text-xs text-slate-500">66,096 px</td>
                    <td className="py-3 px-4 font-mono">12 px</td>
                    <td className="py-3 px-4 text-xs">Standard CSS web preview &amp; split-screen studio</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">150 DPI</td>
                    <td className="py-3 px-4 font-mono">506 px</td>
                    <td className="py-3 px-4 font-mono">319 px</td>
                    <td className="py-3 px-4 text-xs text-slate-500">161,414 px</td>
                    <td className="py-3 px-4 font-mono">19 px</td>
                    <td className="py-3 px-4 text-xs">Fast draft printing</td>
                  </tr>
                  <tr className="bg-emerald-50/60 font-semibold text-emerald-950 hover:bg-emerald-50">
                    <td className="py-3 px-4 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      300 DPI
                    </td>
                    <td className="py-3 px-4 font-mono">1,011 px</td>
                    <td className="py-3 px-4 font-mono">638 px</td>
                    <td className="py-3 px-4 text-xs text-emerald-700">645,018 px</td>
                    <td className="py-3 px-4 font-mono">38 px</td>
                    <td className="py-3 px-4 text-xs">Standard inkjet card trays (Epson L805 / Canon G-Series)</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">600 DPI</td>
                    <td className="py-3 px-4 font-mono">2,022 px</td>
                    <td className="py-3 px-4 font-mono">1,275 px</td>
                    <td className="py-3 px-4 text-xs text-slate-500">2,578,050 px</td>
                    <td className="py-3 px-4 font-mono">75 px</td>
                    <td className="py-3 px-4 text-xs">High-definition micro-text &amp; Devanagari script clarity</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">1200 DPI</td>
                    <td className="py-3 px-4 font-mono">4,044 px</td>
                    <td className="py-3 px-4 font-mono">2,550 px</td>
                    <td className="py-3 px-4 text-xs text-slate-500">10,312,200 px</td>
                    <td className="py-3 px-4 font-mono">150 px</td>
                    <td className="py-3 px-4 text-xs">Commercial dye-sublimation &amp; security guilloche prints</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Printer Tray Calibration Guide */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Printer className="w-5 h-5 text-[#8B1E2D]" />
              Desktop Card Tray Calibration (Epson &amp; Canon)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700">
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-base">Epson Inkjet Trays (L805, L8050, L850)</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Holds 2 standard CR80 PVC cards simultaneously in slots A and B.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Recommended resolution: <strong>300 DPI (1011 × 638 px)</strong> with zero bleed margin.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Set printer media type to <em>CD/DVD Premium Glossy</em> for instant-dry waterproof ink adhesion.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-base">Canon Pixma G-Series Trays (G570, G670)</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Direct PVC card tray compatible with 6-color dye ink tank systems.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Recommended resolution: <strong>600 DPI (2022 × 1275 px)</strong> for rich photo quality.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Zero margin calibration required; tray edges hold pre-cut CR80 cards with ±0.2 mm precision.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Frequently Asked Questions */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#1D3557]" />
              Frequently Asked Questions (FAQ)
            </h2>
            <div className="space-y-6">
              {faqItems.map((item, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    {item.question}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Guides & Commercial Platform Callout */}
          <section className="bg-gradient-to-r from-slate-900 to-[#1D3557] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                Accero PrintPortal Document Studio
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Ready to Print Calibrated CR80 PVC Cards?
              </h2>
              <p className="text-sm text-slate-300">
                Stop manually cropping cards in Photoshop. Accero PrintPortal automatically formats PAN,
                Aadhaar, Voter ID, and Driving Licence cards onto pre-calibrated CR80 templates with
                zero missing data failures.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-xs text-sky-300">
                <Link href="/blog/cr80-card-dimensions-guide" className="hover:underline flex items-center gap-1">
                  Read CR80 Dimensions Guide <ArrowRight className="w-3 h-3" />
                </Link>
                <span>•</span>
                <Link href="/blog/pvc-card-printer-tray-guide" className="hover:underline flex items-center gap-1">
                  Printer Tray Setup Guide <ArrowRight className="w-3 h-3" />
                </Link>
                <span>•</span>
                <Link href="/services/pan-card-printing" className="hover:underline flex items-center gap-1">
                  PAN Card Printing <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button href="/register" variant="accent" size="lg">
                Create Free Account
              </Button>
              <Button href="/pricing" variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                View Pricing (₹5/card)
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
