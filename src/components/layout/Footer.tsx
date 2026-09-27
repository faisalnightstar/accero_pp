import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Award, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">
                Print<span className="text-[#E63946]">Portal</span>
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Official-standard ISO 7810 ID-1 preformatted PVC card printing gateway. Instant lookup and split-screen live preview with missing field editing.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>256-Bit SSL Encrypted Gateway</span>
            </div>
          </div>

          {/* Document Services */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">
              Supported Documents
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/services/pan-card" className="hover:text-white transition-colors">
                  PAN Card Reprint
                </Link>
              </li>
              <li>
                <Link href="/services/aadhaar-card" className="hover:text-white transition-colors">
                  Aadhaar PVC Card
                </Link>
              </li>
              <li>
                <Link href="/services/voter-id" className="hover:text-white transition-colors">
                  Voter EPIC Card
                </Link>
              </li>
              <li>
                <Link href="/services/driving-license" className="hover:text-white transition-colors">
                  Driving License (DL)
                </Link>
              </li>
              <li>
                <Link href="/services/vehicle-rc" className="hover:text-white transition-colors">
                  Vehicle Registration (RC)
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">
              Portal Access
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Operator Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Register Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="hover:text-white transition-colors">
                  Wallet Top-up
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Standards */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 tracking-wide uppercase">
              Standards
            </h3>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-[#F4D35E] mt-0.5 shrink-0" />
                <span>ISO/IEC 7810 ID-1 standard dimensions (85.60 mm × 53.98 mm).</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-[#457B9D] mt-0.5 shrink-0" />
                <span>Zero government authority impersonation. Digital formatting utility only.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} PrintPortal Next.js. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
