import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Calendar,
  Clock,
  Printer,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
  generateHowToSchema,
} from '@/lib/seo/structuredData';
import { getCanonicalUrl } from '@/lib/seo/canonical';

export const metadata: Metadata = buildPageMetadata({
  title: 'How to Print PVC Cards on Epson L805 & Canon Printers | Accero PrintPortal',
  description:
    'Step-by-step tutorial on loading PVC card trays, configuring printer driver settings, and printing cards without white borders or margin cutoff.',
  path: '/blog/pvc-card-printer-tray-guide',
  keywords: [
    'how to print pvc card on epson l805',
    'epson card tray j settings',
    'canon id card tray printing',
    'pvc card tray margin cutoff fix',
    'epson l850 card printer driver settings',
  ],
});

const faqs = [
  {
    question: 'Why does my Epson L805 print half of the card or cut off the edge?',
    answer:
      'Edge cutoff occurs when the printer driver is set to standard A4/Letter paper instead of the specialized CD/DVD or PVC card tray feeder profile. Changing the media type to "CD/DVD" or "PVC Card Tray" aligns the printhead directly over the tray slots.',
  },
  {
    question: 'Do I need special ink for PVC card printing?',
    answer:
      'If you are using inkjet PVC cards (which have a special chemical coating), standard dye or pigment ink (such as Epson 673 ink) works perfectly. Standard non-coated thermal PVC cards will not absorb liquid inkjet ink and require a thermal ribbon printer.',
  },
  {
    question: 'How do I align 2 cards in a dual card tray?',
    answer:
      'In Accero PrintPortal, toggle the print mode to "Dual-Card Tray" or export the dual-card PDF. The software spaces the front and back or two separate card designs with exact millimeter gaps matching Tray J specifications.',
  },
];

export default function PvcCardPrinterTrayGuidePage() {
  const currentUrl = getCanonicalUrl('/blog/pvc-card-printer-tray-guide');
  const articleSchema = generateArticleSchema({
    title: 'How to Print PVC Cards on Epson L805 & Canon Printers Without Margin Cutoff',
    description:
      'Step-by-step guide to configuring printer drivers, card trays, and 0-margin layouts for PVC card printing on Epson L805 and Canon printers.',
    url: currentUrl,
    datePublished: '2026-11-10T00:00:00.000Z',
    authorName: 'Accero Technical Team',
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: 'Printer Tray Setup Guide', url: '/blog/pvc-card-printer-tray-guide' },
  ]);
  const faqSchema = generateFaqSchema(faqs);
  const howToSchema = generateHowToSchema(
    'How to Configure Epson L805 Card Tray for PVC Card Printing',
    [
      {
        name: 'Step 1: Insert Inkjet PVC Blanks into Tray J',
        text: 'Seat one or two inkjet-coated CR80 cards firmly into the recessed slots of the tray.',
      },
      {
        name: 'Step 2: Align Tray Guide Marks with Printer Feed Arrows',
        text: 'Feed the tray until the white triangle on the tray aligns with the white line on the printer feeder.',
      },
      {
        name: 'Step 3: Set Paper Source to CD/DVD or Card Tray',
        text: 'In the system print dialog, select CD/DVD / Card as Paper Source and Premium Glossy as Paper Type.',
      },
      {
        name: 'Step 4: Execute Print from Accero PrintPortal',
        text: 'Click 1-Click Print in Accero PrintPortal with 100% scale (no fit-to-page) for exact 1:1 tray alignment.',
      },
    ]
  );

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
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
            <span className="text-[#8B1E2D]">Printer Tray Setup</span>
          </nav>

          {/* Header */}
          <header className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-bold text-[#8B1E2D] uppercase tracking-wider">
                Hardware Setup Tutorial
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                November 2026
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                8 min read
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight leading-tight">
              How to Print PVC Cards on Epson L805 & Canon Printers Without Margin Cutoff
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Eliminate wasted blank cards and misaligned prints. Follow our comprehensive hardware calibration guide to set up PVC ID card trays with zero margin drift.
            </p>
          </header>

          {/* Direct Answer Box */}
          <div className="bg-white border-l-4 border-l-[#8B1E2D] p-6 sm:p-8 rounded-2xl shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B1E2D]">
              Quick Summary: 3 Golden Rules for PVC Tray Printing
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-relaxed">
              <li>
                <strong>Always use Inkjet-Coated PVC blanks:</strong> Standard thermal cards will repel liquid inkjet ink.
              </li>
              <li>
                <strong>Select "CD/DVD" or "PVC Card" in Printer Properties:</strong> Never use "A4 Plain Paper".
              </li>
              <li>
                <strong>Print at 100% Scale:</strong> In the browser print dialog, disable "Fit to Printable Area" and set Scale to 100% or "Default".
              </li>
            </ol>
          </div>

          {/* Article Body */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1D3557]">
                1. Understanding the Inkjet PVC Printing Workflow
              </h2>
              <p>
                The vast majority of cyber cafes and CSC operators in India utilize desktop 6-color photo printers—most commonly the <strong>Epson L805, L850, L8050</strong>, and Canon Pixma G-series. These printers use a dedicated motorized tray feeder originally designed for printing CD/DVD discs, which third-party manufacturers have adapted into a 2-card PVC tray (commonly designated as <strong>Tray J</strong>).
              </p>
              <p>
                When configured properly, this setup produces crisp, water-resistant identification cards that rival expensive industrial thermal card printers costing ₹75,000 or more.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1D3557]">
                2. Step-by-Step Driver Configuration for Epson L805
              </h2>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <h3 className="font-bold text-[#1D3557]">Step 1: Open Printer Preferences</h3>
                  <p className="text-xs text-slate-600">
                    Go to Windows Settings &gt; Printers & Scanners &gt; Epson L805 &gt; Printing Preferences.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <h3 className="font-bold text-[#1D3557]">Step 2: Configure Media Type & Source</h3>
                  <p className="text-xs text-slate-600">
                    Set <strong>Source</strong> to <em>CD/DVD</em> and <strong>Media Type</strong> to <em>CD/DVD Premium Surface</em> or <em>Photo Paper Glossy</em>.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <h3 className="font-bold text-[#1D3557]">Step 3: Quality Settings</h3>
                  <p className="text-xs text-slate-600">
                    Select <strong>High Quality</strong> (1440 or 5760 optimized DPI) to ensure fine text and demographic QR codes scan cleanly.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1D3557]">
                3. How Accero PrintPortal Automates Card Alignment
              </h2>
              <p>
                In Photoshop, CorelDraw, or Word, operators must manually drag guides to position card graphics, leading to recurring human error. Accero PrintPortal eliminates this manual guesswork:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>Cards are automatically generated to the exact ISO 7810 ID-1 standard (85.60 mm × 53.98 mm).</li>
                <li>CSS `@page` print rules enforce 0mm margins, bypassing browser offset algorithms.</li>
                <li>When using dual-card trays, Accero positions Card 1 (Front) and Card 2 (Back) with the exact millimeter gap required by Tray J.</li>
              </ul>
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

          {/* CTA */}
          <div className="p-8 rounded-3xl bg-[#1D3557] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Try 1-Click Card Tray Alignment</h3>
              <p className="text-xs text-slate-300">
                Print flawless cards on your Epson or Canon printer with Accero PrintPortal.
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

