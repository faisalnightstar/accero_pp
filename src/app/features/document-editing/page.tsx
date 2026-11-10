import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  HelpCircle,
  Eye,
  Camera,
  Sparkles,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Split-Screen Live Card Editor | Accero PrintPortal',
  description:
    'Review and edit PVC card layouts in real time. Flag missing fields, upload candidate photos and signatures, and watch CR80 canvases synchronize live before printing.',
  path: '/features/document-editing',
  keywords: [
    'document editing software',
    'split-screen card editor',
    'missing field detection',
    'pvc card preview studio',
    'live card synchronization',
    'id card photo upload tool',
  ],
});

const faqs = [
  {
    question: 'How does live missing field detection work?',
    answer:
      'The split-screen studio analyzes the document data payload against mandatory card standards. If fields such as father name, birth date, or candidate portrait are absent, prominent amber alert guides point operators directly to the missing inputs.',
  },
  {
    question: 'Can I upload replacement photos or signatures?',
    answer:
      'Yes. Our drag-and-drop asset uploader lets you upload standard JPG, PNG, or WebP files with instant local preview and zero upload lag.',
  },
  {
    question: 'Does the preview match the physical printed card?',
    answer:
      'Yes. The interactive canvas is constructed with exact millimeter-accurate CSS coordinates conforming to ISO/IEC 7810 ID-1 dimensions (85.60 mm × 53.98 mm), guaranteeing WYSIWYG printing accuracy.',
  },
];

export default function DocumentEditingFeaturePage() {
  const softwareSchema = generateSoftwareApplicationSchema('Split-Screen Live Card Editor');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
    { name: 'Document Editing', url: '/features/document-editing' },
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
            <Link href="/features" className="hover:text-[#1D3557] transition-colors">
              Features
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Document Editing</span>
          </nav>

          {/* Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Zero Missing-Data Failures</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight leading-tight">
                Split-Screen Live Editor with Reactive Canvas Preview
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Eliminate blank cards and customer disputes. Our dual-pane studio highlights missing fields and synchronizes typography, QR codes, and portraits in real time.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all"
                >
                  Open Studio Demo
                </Link>
                <Link
                  href="/features/document-printing"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-white text-[#1D3557] border border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  Explore Print Engine
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Studio Architecture
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Dual-Pane Sync
                </span>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1D3557]">
                    <Edit3 className="w-4 h-4 text-[#8B1E2D]" />
                    <span>Left Pane: Form Controls & Asset Uploader</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Input demographic text, select templates, and drop candidate portraits.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1D3557]">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>Right Pane: Interactive CR80 Canvas</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Instant 1:1 preview of front and back sides with 3D flip inspection.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Amber Missing Field Banner</span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    Flags empty inputs so operators complete records before wasting cards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Studio Features */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557]">
              Studio Capabilities Designed for Operators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Camera className="w-6 h-6 text-[#8B1E2D]" />
                <h3 className="text-base font-bold text-[#1D3557]">Instant Photo & Signature Cropping</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Easily replace blurry scanned photos with fresh passport pictures. Automatic aspect ratio locking prevents portrait distortion.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Layers className="w-6 h-6 text-indigo-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Front & Back Canvas Flipping</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Review both front and back card sides simultaneously or toggle dual-pass preview for double-sided PVC card printers.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Sparkles className="w-6 h-6 text-emerald-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Dynamic Demographic QR Generator</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  As you edit demographic fields, the embedded QR payload updates dynamically, ensuring the printed barcode scans accurately.
                </p>
              </div>
            </div>
          </section>

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

          {/* Related Links */}
          <section className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="font-bold text-slate-500 uppercase">Related Workflows:</span>
            <div className="flex flex-wrap gap-4">
              <Link href="/features/document-lookup" className="text-[#8B1E2D] hover:underline font-semibold">
                Document Lookup
              </Link>
              <Link href="/features/multilingual-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                Multilingual Printing
              </Link>
              <Link href="/features/document-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                CR80 Card Print Engine
              </Link>
              <Link href="/solutions/cyber-cafes" className="text-[#8B1E2D] hover:underline font-semibold">
                For Cyber Cafes
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

