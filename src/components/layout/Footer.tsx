import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Award, FileText, AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">
                Accero <span className="text-[#E63946]">PrintPortal</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Independent document processing & PVC card printing SaaS platform. Designed for cyber cafes, CSC operators, and printing businesses.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>

          {/* Supported Documents */}
          <div>
            <h3 className="text-white font-semibold text-xs mb-3 tracking-wider uppercase">
              Supported Documents
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
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold text-xs mb-3 tracking-wider uppercase">
              Platform Features
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/print-portal" className="hover:text-white transition-colors font-medium text-slate-200">
                  Print Portal Overview
                </Link>
              </li>
              <li>
                <Link href="/pvc-card-printing-software" className="hover:text-white transition-colors">
                  PVC Card Software
                </Link>
              </li>
              <li>
                <Link href="/features/document-editing" className="hover:text-white transition-colors">
                  Split-Screen Studio
                </Link>
              </li>
              <li>
                <Link href="/features/multilingual-printing" className="hover:text-white transition-colors">
                  Multilingual Layouts
                </Link>
              </li>
              <li>
                <Link href="/features/document-printing" className="hover:text-white transition-colors">
                  CR80 Card Print Engine
                </Link>
              </li>
              <li>
                <Link href="/features/wallet-management" className="hover:text-white transition-colors">
                  Prepaid Wallet Ledger
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-white font-semibold text-xs mb-3 tracking-wider uppercase">
              Operator Solutions
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/best-print-portal-for-csc" className="hover:text-white transition-colors font-medium text-slate-200">
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
                <Link href="/solutions/printing-shops" className="hover:text-white transition-colors">
                  For Printing Shops
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing & Wallet Top-up
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Operator FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust, Legal & Resources */}
          <div>
            <h3 className="text-white font-semibold text-xs mb-3 tracking-wider uppercase">
              Company & Legal
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Accero
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Resource Blog & Guides
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-white transition-colors">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclaimer Banner */}
        <div className="mt-10 pt-6 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Important Compliance Notice:</strong> Accero PrintPortal is an independent commercial software platform engineered for document layout formatting and physical card tray alignment. It is not an official government portal, and is not affiliated with, authorized by, or an official partner of UIDAI, NSDL, UTIITSL, the Election Commission of India, MoRTH, or State Food Departments. Output templates conform to the international physical standard ISO/IEC 7810 ID-1 (CR80: 85.60 mm × 53.98 mm).
            </p>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-6 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Accero Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/llms.txt" className="hover:text-slate-400 transition-colors">
              llms.txt
            </Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-slate-400 transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link href="/sitemap.xml" className="hover:text-slate-400 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
