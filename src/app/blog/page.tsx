import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen, Sparkles, ArrowRight, Calendar, Clock } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';

export const metadata: Metadata = buildPageMetadata({
  title: 'Document Printing & Operator Blog | Accero PrintPortal',
  description:
    'In-depth articles, tutorials, and business playbooks for cyber cafe owners, CSC operators, and print professionals.',
  path: '/blog',
  keywords: [
    'document printing blog',
    'cyber cafe printing tutorials',
    'pvc card printing guides',
    'csc operator articles',
    'id card printing technology',
  ],
});

const articles = [
  {
    slug: '/blog/cr80-card-dimensions-guide',
    category: 'Hardware & Standards',
    title: 'CR80 Card Dimensions: The Complete Size & Measurement Guide',
    snippet:
      'Everything you need to know about ISO/IEC 7810 ID-1 standard dimensions in millimeters, inches, and pixels at 300 DPI for physical PVC card printing.',
    date: 'November 2026',
    readTime: '6 min read',
  },
  {
    slug: '/blog/pvc-card-printer-tray-guide',
    category: 'Tutorial & Setup',
    title: 'How to Print PVC Cards on Epson L805 & Canon Printers Without Margin Cutoff',
    snippet:
      'Avoid margin drift and wasted blanks. Learn how to configure your printer driver, load 2-card trays, and output exact 0-margin vector files.',
    date: 'November 2026',
    readTime: '8 min read',
  },
  {
    slug: '/blog/cyber-cafe-document-printing-guide',
    category: 'Business Operations',
    title: 'The Cyber Cafe Guide to High-Margin Identity Card Printing in India',
    snippet:
      'Practical strategies for cyber cafe operators to streamline walk-in customer requests, eliminate missing-data errors, and maximize retail margins.',
    date: 'November 2026',
    readTime: '10 min read',
  },
  {
    slug: '/blog/how-to-fix-missing-card-fields',
    category: 'Operator Troubleshooting',
    title: 'How to Fix Missing Demographic Fields in Online Card Printing (Father Name, Address, Photo)',
    snippet:
      'Stop ruining PVC cards. Learn how to detect missing demographic fields live and complete father names and photos before printing.',
    date: 'November 2026',
    readTime: '7 min read',
  },
  {
    slug: '/blog/multilingual-document-printing-guide',
    category: 'Typography & Calibration',
    title: 'Regional Language Printing for Indian Identity Cards: Devanagari, Tamil & Bengali Font Calibration',
    snippet:
      'Avoid broken characters and font substitution errors. Complete guide to calibrating bilingual regional scripts for PVC card trays.',
    date: 'November 2026',
    readTime: '8 min read',
  },
];

export default function BlogIndexPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Blog</span>
          </nav>

          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-[#8B1E2D] border border-red-200">
              <BookOpen className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Operator Insights & Tutorials</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#1D3557] tracking-tight">
              Accero Knowledge Blog
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Actionable guides, hardware tutorials, and industry insights written for printing businesses and cyber cafe operators.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((post, idx) => (
              <article
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold uppercase tracking-wider text-[#8B1E2D]">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#1D3557] leading-snug mb-2 hover:text-[#8B1E2D] transition-colors">
                      <Link href={post.slug}>{post.title}</Link>
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {post.snippet}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{post.date}</span>
                  <Link
                    href={post.slug}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B1E2D] hover:text-[#E63946] transition-colors"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

