import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Printer,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileCheck,
  Crop,
  Layers,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'PVC Card Printing Software for Epson & Canon Trays | Accero PrintPortal',
  description:
    'The premier PVC card printing software for Epson L805, L850, L8050 Tray J and Canon ID card trays in India. Pure ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm), zero margin cutoff, and razor-sharp 300 DPI vector output.',
  path: '/pvc-card-printing-software',
  keywords: [
    'pvc card printing software',
    'id card tray print software',
    'epson l805 card printing software',
    'canon g3010 pvc print setup',
    'cr80 pvc card software',
    'epson tray j printing tool',
    'plastic id card printing software',
  ],
});

const printerConfigs = [
  {
    model: 'Epson EcoTank L805 / L8050 / L850',
    tray: 'Epson 2-Card ID Tray (Tray J)',
    settings: 'Paper Source: Tray J | Paper Type: Epson Matte / Photo | Size: Dedicated Tray Template | Margins: None (Zero)',
    tip: 'Ensure default browser headers and footers are unchecked in the print preview dialog.',
  },
  {
    model: 'Canon PIXMA G-Series (G3010 / G5070)',
    tray: 'Third-Party Canon PVC Card Tray (2-Up)',
    settings: 'Paper Source: Rear Tray | Media Type: Photo Paper Plus Glossy II | Print Quality: High',
    tip: 'Feed tray gently until alignment arrow lines up with the guide mark on the printer bed.',
  },
  {
    model: 'Direct-to-Card Thermal PVC Printers',
    tray: 'Zebra ZXP Series 3, Evolis Zenius / Primacy, Magicard',
    settings: 'Document Size: CR80 (85.60 mm × 53.98 mm) | Ribbon: YMCKO Color | Resolution: 300 DPI Edge-to-Edge',
    tip: 'Direct browser vector output guarantees crisp text and barcode scannability.',
  },
];

const faqs = [
  {
    question: 'What are the exact dimensions for printing PVC cards?',
    answer:
      'Standard PVC identity cards conform to the international ISO/IEC 7810 ID-1 specification (commonly known as CR80). The exact physical dimensions are 85.60 mm in width by 53.98 mm in height (3.370 inches × 2.125 inches) with a 3.18 mm rounded corner radius. At 300 DPI high-resolution printing, this translates to 1011 pixels by 638 pixels.',
  },
  {
    question: 'Why do my prints get cut off on Epson L805 Tray J?',
    answer:
      'Margin cutoffs happen when standard print software outputs arbitrary HTML canvases with default browser page margins (typically 0.25 to 0.5 inches). Accero PrintPortal uses zero-margin CSS (@page { size: 85.60mm 53.98mm; margin: 0; }) which commands the print driver to disable automatic scaling and align the card canvas with 1:1 physical millimeter precision.',
  },
  {
    question: 'Do I need to crop my cards in Photoshop before printing?',
    answer:
      'No. Photoshop manual cropping takes 10 to 15 minutes per customer and frequently results in stretched proportions or blurry text. Accero PrintPortal automatically renders preformatted, razor-sharp vector cards ready for immediate one-click printing directly from your browser.',
  },
  {
    question: 'How do I handle double-sided (front and back) printing on an ID card tray?',
    answer:
      'Accero PrintPortal provides a seamless dual-slot layout for standard 2-card trays. You can print the front and back of a single card side-by-side in one tray pass, or print two different front cards in a single run, dramatically speeding up your counter operations.',
  },
];

export default function PvcCardPrintingSoftwarePage() {
  const softwareSchema = generateSoftwareApplicationSchema('PVC Card Printing Software');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'PVC Card Printing Software', url: '/pvc-card-printing-software' },
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
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">PVC Card Printing Software</span>
          </nav>

          {/* Hero Section */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100 to-indigo-50 rounded-full blur-3xl -z-10 opacity-70"></div>
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase">
                <Printer className="w-3.5 h-3.5" />
                Physical ID-1 Hardware Alignment
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                High-Precision <span className="text-blue-600">PVC Card Printing Software</span> for Tray Printers
              </h1>

              {/* AEO / GEO Definition Snippet Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border-l-4 border-blue-600 text-slate-700 text-base sm:text-lg leading-relaxed shadow-sm font-medium">
                <strong>Accero PrintPortal’s PVC Card Print Engine</strong> is a browser-native formatting platform engineered for physical ID card printing on Epson (Tray J), Canon PIXMA, and thermal dye-sublimation card printers. Conforming strictly to international ISO/IEC 7810 ID-1 dimensions (85.60 mm × 53.98 mm), it delivers zero-margin print precision, 300 DPI vector clarity, and live split-screen missing data validation.
              </div>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Stop wasting expensive PVC blank cards due to driver scaling, blurry scanned barcodes, or off-center margins. Accero guarantees 1:1 physical millimeter tray accuracy directly from Google Chrome and Microsoft Edge.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/studio"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Live Card Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/blog/cr80-card-dimensions-guide"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all"
                >
                  <span>Read CR80 Dimensions Guide</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>85.60 mm × 53.98 mm Standard</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero-Margin CSS @page</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Epson Tray J 100% Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No Photoshop Needed</span>
                </div>
              </div>
            </div>
          </section>

          {/* Printer Configuration Matrix */}
          <section className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Recommended Printer Tray Configurations
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Follow these tested driver and tray settings for flawless, borderless PVC card printing on your hardware.
              </p>
            </div>

            <div className="space-y-6">
              {printerConfigs.map((config, idx) => (
                <div key={idx} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Printer className="w-5 h-5 text-blue-600" />
                      <span>{config.model}</span>
                    </h3>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                      {config.tray}
                    </span>
                  </div>

                  <div className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">Recommended Driver Settings: </span>
                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{config.settings}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Pro Operator Tip:</strong> {config.tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* The ISO 7810 ID-1 Technical Specs Table */}
          <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800/60">
                Engineering Blueprint
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                ISO/IEC 7810 ID-1 Card Standard Specifications
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Accero PrintPortal’s vector canvas is coded directly to the international standard governing financial credit cards and national identity credentials.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase">
                    <th className="py-3 px-4">Parameter</th>
                    <th className="py-3 px-4">Metric (mm)</th>
                    <th className="py-3 px-4">Imperial (Inches)</th>
                    <th className="py-3 px-4">Digital Canvas (300 DPI)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200 font-mono">
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Card Width</td>
                    <td className="py-3 px-4">85.60 mm</td>
                    <td className="py-3 px-4">3.370 in</td>
                    <td className="py-3 px-4">1011 px</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Card Height</td>
                    <td className="py-3 px-4">53.98 mm</td>
                    <td className="py-3 px-4">2.125 in</td>
                    <td className="py-3 px-4">638 px</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Corner Radius</td>
                    <td className="py-3 px-4">3.18 mm</td>
                    <td className="py-3 px-4">0.125 in</td>
                    <td className="py-3 px-4">38 px</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-white">Standard Thickness</td>
                    <td className="py-3 px-4">0.76 mm</td>
                    <td className="py-3 px-4">0.030 in (30 mil)</td>
                    <td className="py-3 px-4">N/A (Physical stock)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* People Also Ask FAQ */}
          <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Frequently Asked Questions on PVC Card Printing
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Detailed technical guidance on card tray calibration, printer drivers, and software settings.
              </p>
            </div>

            <div className="divide-y divide-slate-100 max-w-4xl mx-auto">
              {faqs.map((faq, idx) => (
                <div key={idx} className="py-5 space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{faq.question}</span>
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed pl-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Test Flawless PVC Card Printing On Your Own Printer
            </h2>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Launch our live split-screen editor, adjust your fields, and execute a test print to experience true millimeter tray precision.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/studio"
                className="px-8 py-4 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-md hover:bg-blue-50 transition-all"
              >
                Open Studio Demo
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 rounded-xl bg-blue-800/80 hover:bg-blue-900 text-white font-bold text-sm border border-blue-400/40 transition-all"
              >
                Register Free Account
              </Link>
            </div>
          </section>

          {/* Legal Compliance Disclaimer */}
          <footer className="text-center text-xs text-slate-500 max-w-3xl mx-auto pt-4 space-y-2">
            <p>
              <strong>Disclaimer:</strong> Accero PrintPortal is an independent commercial software platform designed for document layout formatting, editing, and physical card printing. It is not affiliated with, endorsed by, or an official service of any government body or department.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}

