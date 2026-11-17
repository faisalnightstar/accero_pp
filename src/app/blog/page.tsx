import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BookOpen, Sparkles, ArrowRight, Calendar, Clock, Printer, Sliders, ShieldCheck, Tag } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CTASection } from '@/components/public/CTASection';

export const metadata: Metadata = buildPageMetadata({
  title: 'Document Printing & Operator Knowledge Blog | Accero PrintPortal',
  description:
    'In-depth technical articles, hardware tutorials, and business playbooks for cyber cafe owners, CSC operators, and print professionals across India. Master PVC tray printing, zero-margin calibration, and card economics.',
  path: '/blog',
  keywords: [
    'document printing blog',
    'cyber cafe printing tutorials',
    'pvc card printing guides',
    'csc operator articles',
    'id card printing technology',
    'epson l805 card tray guide',
    'cr80 card size tutorial',
    'bilingual document printing guide',
  ],
});

const articles = [
  {
    slug: '/blog/what-is-a-digital-print-portal',
    category: 'Industry Guide',
    title: 'What Is a Digital Print Portal? Complete Guide for CSC Operators & Cyber Cafes',
    snippet:
      'Understand how modern digital print portals work in India, how they prevent ruined PVC card stock, and which printer trays deliver zero-margin alignment.',
    date: 'November 2026',
    readTime: '8 min read',
    featured: true,
  },
  {
    slug: '/blog/cr80-card-dimensions-guide',
    category: 'Hardware & Standards',
    title: 'CR80 Card Dimensions: The Complete Size & Measurement Guide',
    snippet:
      'Everything you need to know about ISO/IEC 7810 ID-1 standard dimensions in millimeters, inches, and pixels at 300 DPI for physical PVC card printing.',
    date: 'November 2026',
    readTime: '6 min read',
    featured: false,
  },
  {
    slug: '/blog/pvc-card-printer-tray-guide',
    category: 'Tutorial & Setup',
    title: 'How to Print PVC Cards on Epson L805 & Canon Printers Without Margin Cutoff',
    snippet:
      'Avoid margin drift and wasted blanks. Learn how to configure your printer driver, load 2-card trays, and output exact 0-margin vector files.',
    date: 'November 2026',
    readTime: '8 min read',
    featured: false,
  },
  {
    slug: '/blog/cyber-cafe-document-printing-guide',
    category: 'Business Operations',
    title: 'The Cyber Cafe Guide to High-Margin Identity Card Printing in India',
    snippet:
      'Practical strategies for cyber cafe operators to streamline walk-in customer requests, eliminate missing-data errors, and maximize retail margins.',
    date: 'November 2026',
    readTime: '10 min read',
    featured: false,
  },
  {
    slug: '/blog/how-to-fix-missing-card-fields',
    category: 'Operator Troubleshooting',
    title: 'How to Fix Missing Demographic Fields in Online Card Printing (Father Name, Address, Photo)',
    snippet:
      'Stop ruining PVC cards. Learn how to detect missing demographic fields live and complete father names and photos before printing.',
    date: 'November 2026',
    readTime: '7 min read',
    featured: false,
  },
  {
    slug: '/blog/multilingual-document-printing-guide',
    category: 'Typography & Calibration',
    title: 'Regional Language Printing for Indian Identity Cards: Devanagari, Tamil & Bengali Font Calibration',
    snippet:
      'Avoid broken characters and font substitution errors. Complete guide to calibrating bilingual regional scripts for PVC card trays.',
    date: 'November 2026',
    readTime: '8 min read',
    featured: false,
  },
];

const categories = [
  { name: 'Hardware & Standards', count: '2 Guides' },
  { name: 'Printer Calibration', count: '1 Tutorial' },
  { name: 'Shop Economics', count: '1 Playbook' },
  { name: 'Quality Control', count: '1 Guide' },
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

      <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1D3557] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#8B1E2D]">Blog</span>
          </nav>

          {/* Hero */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-[#1D3557] border border-slate-200">
              <BookOpen className="w-3.5 h-3.5 text-[#8B1E2D]" />
              <span>Operator Insights &amp; Hardware Guides</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1D3557] tracking-tight">
              Accero Operator Knowledge Base
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              Actionable guides, hardware tutorials, and counter business playbooks written by printing technicians for cyber cafe owners, CSC VLEs, and document service centers.
            </p>
          </div>

          {/* Featured Cornerstone Article Banner */}
          <div className="bg-gradient-to-br from-[#1D3557] to-[#0F1E33] rounded-3xl p-8 sm:p-10 text-white shadow-card space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant="outline" className="text-xs text-amber-300 border-amber-300/40">
                Featured Cornerstone Reference
              </Badge>
              <span className="text-xs text-slate-300 font-mono">ISO/IEC 7810 ID-1 Standard</span>
            </div>
            <div className="space-y-3 max-w-3xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                CR80 Card Dimensions: The Complete Size &amp; Measurement Guide
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The authoritative physical card specification guide. Exact metric, imperial, and 300 DPI pixel dimensions for PAN, Aadhaar, Voter, and DL cards, with standard corner radius and thickness specifications.
              </p>
            </div>
            <div>
              <Link
                href="/blog/cr80-card-dimensions-guide"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-white text-[#1D3557] hover:bg-slate-100 transition-colors shadow-sm"
              >
                <span>Read Full Technical Guide</span>
                <ArrowRight className="w-4 h-4 text-[#8B1E2D]" />
              </Link>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1D3557]">All Tutorials &amp; Playbooks</h2>
              <span className="text-xs text-slate-500">{articles.length} Published Articles</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((post, idx) => (
                <Card
                  key={idx}
                  hoverEffect
                  className="p-8 border border-slate-200/90 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-bold uppercase tracking-wider text-[#8B1E2D]">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {post.readTime}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#1D3557] leading-snug mb-2 hover:text-[#8B1E2D] transition-colors">
                        <Link href={post.slug}>{post.title}</Link>
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {post.snippet}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{post.date}</span>
                    <Link
                      href={post.slug}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D3557] hover:text-[#8B1E2D] transition-colors"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <CTASection />
        </div>
      </div>
    </>
  );
}
