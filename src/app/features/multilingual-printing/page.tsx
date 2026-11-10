import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Globe,
  CheckCircle2,
  Type,
  Languages,
  ArrowRight,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
} from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Multilingual Document Printing & Typography | Accero PrintPortal',
  description:
    'Print official identity cards with bilingual regional typography. Full Devanagari Hindi support, accurate conjuncts, and Unicode font rendering for Indian documents.',
  path: '/features/multilingual-printing',
  keywords: [
    'multilingual document printing',
    'hindi document printing software',
    'devanagari font card print',
    'bilingual identity card layout',
    'regional language pvc card print',
    'indian document typography',
  ],
});

const faqs = [
  {
    question: 'Which Indian languages are supported by the typography engine?',
    answer:
      'Accero PrintPortal currently provides native Devanagari script support (Hindi, Marathi) utilizing Google Fonts Hind, ensuring that complex conjuncts, matras, and halants render cleanly at 300+ DPI. Additional regional Indian scripts are systematically expanding across supported templates.',
  },
  {
    question: 'How do I input Hindi or regional language text?',
    answer:
      'You can type directly using standard Unicode InScript, Google Input Tools, or copy-paste regional text into the bilingual fields in the studio editor. The canvas updates immediately.',
  },
  {
    question: 'Does the font stay sharp when printed on PVC cards?',
    answer:
      'Yes. Google Fonts Hind is embedded into the vector print stylesheet, preventing font substitution, pixelation, or blurry edges on thermal and inkjet PVC card trays.',
  },
];

export default function MultilingualPrintingFeaturePage() {
  const softwareSchema = generateSoftwareApplicationSchema('Multilingual Document Typography Engine');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Features', url: '/features' },
    { name: 'Multilingual Printing', url: '/features/multilingual-printing' },
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
            <span className="text-[#8B1E2D]">Multilingual Printing</span>
          </nav>

          {/* Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                <Languages className="w-3.5 h-3.5 text-blue-600" />
                <span>Unicode Devanagari & Latin Typography</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight leading-tight">
                Bilingual Regional Language Printing for Indian Businesses
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Render authentic Indian identity documents with bilingual regional typography. Complete support for Hindi Devanagari conjuncts and address lines alongside standard English text.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white hover:shadow-btn-hover transition-all"
                >
                  Test Bilingual Printing
                </Link>
                <Link
                  href="/services/aadhaar-document-management"
                  className="px-6 py-3 rounded-xl text-sm font-bold bg-white text-[#1D3557] border border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  View Aadhaar Layout
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Bilingual Typography Showcase
              </span>
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 font-sans">
                <div className="border-b border-slate-800 pb-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#F4D35E]">Cardholder Name</span>
                  <div className="text-sm font-bold text-white">ANIL KUMAR MISHRA</div>
                  <div className="text-sm font-bold text-[#F4D35E] font-devanagari">अनिल कुमार मिश्रा</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#F4D35E]">Residential Address</span>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    H.No 42, Sector 15, Vasundhara, Ghaziabad, Uttar Pradesh
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed font-devanagari">
                    मकान नं 42, सेक्टर 15, वसुंधरा, गाजियाबाद, उत्तर प्रदेश
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Advantages */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1D3557]">
              Engineered for Regional Indian Document Requirements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Type className="w-6 h-6 text-blue-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Zero Font Corruption</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Avoid the common "question-mark box" glyph errors caused by standard printer drivers. Our web-font pipeline embeds vector outlines directly into printable output.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Globe className="w-6 h-6 text-emerald-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Synchronized Dual-Language Inputs</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Both English and regional text fields are presented side-by-side, allowing operators to verify spelling accuracy before printing.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h3 className="text-base font-bold text-[#1D3557]">Optimized for Thermal & Inkjet</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Specially tuned font weights ensure regional diacritics and matras remain crisp without bleeding into card backgrounds.
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
            <span className="font-bold text-slate-500 uppercase">Related Solutions:</span>
            <div className="flex flex-wrap gap-4">
              <Link href="/solutions/csc-operators" className="text-[#8B1E2D] hover:underline font-semibold">
                For CSC Operators
              </Link>
              <Link href="/solutions/cyber-cafes" className="text-[#8B1E2D] hover:underline font-semibold">
                For Cyber Cafes
              </Link>
              <Link href="/services/voter-id-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                Voter ID Bilingual Print
              </Link>
              <Link href="/features/document-printing" className="text-[#8B1E2D] hover:underline font-semibold">
                CR80 Print Engine
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

