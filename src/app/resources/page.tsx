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
} from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CTASection } from '@/components/public/CTASection';

export const metadata: Metadata = buildPageMetadata({
  title: 'Operator Resources & Technical Guides | Accero PrintPortal',
  description:
    'Comprehensive technical guides for cyber cafe and print shop operators. Learn CR80 card dimensions, PVC printer tray alignment for Epson/Canon, and document workflows.',
  path: '/resources',
  keywords: [
    'pvc card printing resources',
    'id card printing guides',
    'cr80 card size specifications',
    'epson l805 card tray instructions',
    'cyber cafe training guides',
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
];

export default function ResourcesPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-7xl mx-auto space-y-10">
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
              In-depth technical references and operational playbooks designed to help cyber cafes, CSC operators, and print businesses master PVC card production.
            </p>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <h2 className="text-base font-bold text-[#1D3557] leading-snug mb-2 hover:text-[#8B1E2D] transition-colors">
                      <Link href={item.slug}>{item.title}</Link>
                    </h2>
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

          {/* Quick Cheat-Sheet Table */}
          <Card className="p-8 border border-slate-200/90 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-[#1D3557]">
              CR80 Card Dimensions Quick Reference Table
            </h2>
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

          {/* CTA */}
          <CTASection />
        </div>
      </div>
    </>
  );
}
