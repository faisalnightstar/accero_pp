import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Top 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">
                Accero <span className="text-[#E63946]">PrintPortal</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Independent document processing &amp; PVC card printing SaaS platform. Designed for cyber cafes, CSC operators, and printing businesses across India.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              <Link href="/pricing" className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2">
                Transparent Pricing &rarr;
              </Link>
            </div>
          </div>

          {/* Supported Documents */}
          <div>
            <h3 className="text-white font-semibold text-xs mb-3 tracking-wider uppercase">
              <Link href="/services" className="hover:text-[#E63946] transition-colors">
                Document Services
              </Link>
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/services/pan-card-printing" className="hover:text-white transition-colors">
                  PAN Card Print
                </Link>
              </li>
              <li>
                <Link href="/services/aadhaar-document-management" className="hover:text-white transition-colors">
                  Aadhaar PVC Card
                </Link>
              </li>
              <li>
                <Link href="/services/voter-id-printing" className="hover:text-white transition-colors">
                  Voter ID (EPIC) Card
                </Link>
              </li>
              <li>
                <Link href="/services/driving-licence-printing" className="hover:text-white transition-colors">
                  Driving Licence (DL)
                </Link>
              </li>
              <li>
                <Link href="/services/vehicle-rc-printing" className="hover:text-white transition-colors">
                  Vehicle RC Smart Card
                </Link>
              </li>
              <li>
                <Link href="/services/ration-card-management" className="hover:text-white transition-colors">
                  Ration Card Management
                </Link>
              </li>
              <li className="pt-1">
                <Link href="/services" className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
                  &rarr; View All Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Specialized Portals & Commercial Pillars */}
          <div>
            <h3 className="text-white font-semibold text-xs mb-3 tracking-wider uppercase">
              <Link href="/print-portal" className="hover:text-[#E63946] transition-colors">
                Specialized Portals
              </Link>
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/print-portal" className="hover:text-white transition-colors font-medium text-slate-200">
                  Print Portal Overview
                </Link>
              </li>
              <li>
                <Link href="/best-print-portal-for-csc" className="hover:text-white transition-colors">
                  Best Portal for CSC
                </Link>
              </li>
              <li>
                <Link href="/print-portal-for-cyber-cafe" className="hover:text-white transition-colors">
                  For Cyber Cafes
                </Link>
              </li>
              <li>
                <Link href="/print-portal-for-retailers" className="hover:text-white transition-colors">
                  For Retailers
                </Link>
              </li>
              <li>
                <Link href="/pvc-card-printing-software" className="hover:text-white transition-colors">
                  PVC Card Software
                </Link>
              </li>
              <li>
                <Link href="/csc-operator-software" className="hover:text-white transition-colors">
                  CSC Operator Software
                </Link>
              </li>
              <li>
                <Link href="/document-processing-platform" className="hover:text-white transition-colors">
                  Document Processing Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Features & Solutions */}
          <div>
            <h3 className="text-white font-semibold text-xs mb-3 tracking-wider uppercase">
              <Link href="/features" className="hover:text-[#E63946] transition-colors">
                Platform Features
              </Link>
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/features/document-lookup" className="hover:text-white transition-colors">
                  Document Lookup
                </Link>
              </li>
              <li>
                <Link href="/features/document-management" className="hover:text-white transition-colors">
                  Document Management
                </Link>
              </li>
              <li>
                <Link href="/features/document-editing" className="hover:text-white transition-colors">
                  Split-Screen Studio
                </Link>
              </li>
              <li>
                <Link href="/features/document-printing" className="hover:text-white transition-colors">
                  CR80 Print Engine
                </Link>
              </li>
              <li>
                <Link href="/features/multilingual-printing" className="hover:text-white transition-colors">
                  Multilingual Layouts
                </Link>
              </li>
              <li>
                <Link href="/features/wallet-management" className="hover:text-white transition-colors">
                  Prepaid Wallet Ledger
                </Link>
              </li>
              <li className="pt-1">
                <Link href="/features" className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
                  &rarr; All Features
                </Link>
              </li>
            </ul>
          </div>

          {/* Operator Solutions & Company */}
          <div>
            <h3 className="text-white font-semibold text-xs mb-3 tracking-wider uppercase">
              <Link href="/solutions" className="hover:text-[#E63946] transition-colors">
                Solutions &amp; Trust
              </Link>
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/solutions/cyber-cafes" className="hover:text-white transition-colors">
                  Cyber Cafe Hub
                </Link>
              </li>
              <li>
                <Link href="/solutions/csc-operators" className="hover:text-white transition-colors">
                  CSC Operator Hub
                </Link>
              </li>
              <li>
                <Link href="/solutions/printing-shops" className="hover:text-white transition-colors">
                  Printing Shop Hub
                </Link>
              </li>
              <li>
                <Link href="/solutions/digital-service-centers" className="hover:text-white transition-colors">
                  Digital Service Centers
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Operator FAQ
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Accero
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Middle Section: Educational Guides & Technical Resources (Comprehensive Internal Linking) */}
        <div className="mt-10 pt-8 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-slate-400">
          <div>
            <h4 className="text-white font-semibold mb-2">
              <Link href="/blog" className="hover:text-[#E63946] transition-colors">
                Cornerstone Guides
              </Link>
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/blog/cr80-card-dimensions-guide" className="hover:text-white transition-colors">
                  ISO 7810 CR80 Card Dimensions
                </Link>
              </li>
              <li>
                <Link href="/blog/pvc-card-printer-tray-guide" className="hover:text-white transition-colors">
                  Epson &amp; Canon PVC Tray Settings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Technical Walkthroughs</h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/blog/cyber-cafe-document-printing-guide" className="hover:text-white transition-colors">
                  Cyber Cafe Document Setup
                </Link>
              </li>
              <li>
                <Link href="/blog/how-to-fix-missing-card-fields" className="hover:text-white transition-colors">
                  Fixing Missing Card Data
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Resources &amp; Languages</h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/blog/multilingual-document-printing-guide" className="hover:text-white transition-colors">
                  Bilingual Devanagari Scripts
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white transition-colors">
                  Operator Resource Directory
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Security &amp; Compliance</h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/security" className="hover:text-white transition-colors">
                  Platform Security &amp; Encryption
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  DPDP Act Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Compare Alternatives Section (Crawlable Competitor Comparison Links) */}
        <div className="mt-8 pt-6 border-t border-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <span className="text-white font-semibold">Compare Print Portals:</span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400">
              <Link href="/compare/digitalportal-alternative" className="hover:text-white transition-colors">
                Digital Portal Alternative
              </Link>
              <span className="text-slate-700">&bull;</span>
              <Link href="/compare/fastprintportal-alternative" className="hover:text-white transition-colors">
                Fast Print Portal Alternative
              </Link>
              <span className="text-slate-700">&bull;</span>
              <Link href="/compare/kamboj-print-portal-alternative" className="hover:text-white transition-colors">
                Kamboj PAN Portal Alternative
              </Link>
              <span className="text-slate-700">&bull;</span>
              <Link href="/compare/skprintportal-alternative" className="hover:text-white transition-colors">
                SK Print Portal Alternative
              </Link>
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer Banner */}
        <div className="mt-10 pt-6 border-t border-slate-900 text-[11px] text-slate-500 leading-relaxed space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Important Compliance Notice:</strong> Accero PrintPortal is an independent commercial software platform engineered for document layout formatting and physical card tray alignment. It is not an official government portal, and is not affiliated with, authorized by, or an official partner of UIDAI, NSDL, UTIITSL, the Election Commission of India, MoRTH, or State Food Departments. Output templates conform to the international physical standard ISO/IEC 7810 ID-1 (CR80: 85.60 mm &times; 53.98 mm).
            </p>
          </div>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="mt-6 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Accero Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/llms.txt" className="hover:text-slate-400 transition-colors">
              llms.txt
            </Link>
            <span>&bull;</span>
            <Link href="/privacy-policy" className="hover:text-slate-400 transition-colors">
              Privacy
            </Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms
            </Link>
            <span>&bull;</span>
            <Link href="/sitemap.xml" className="hover:text-slate-400 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
