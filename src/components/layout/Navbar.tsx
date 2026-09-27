'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, Printer, Shield, User, Wallet } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B1E2D] to-[#E63946] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-[#1D3557]">
                Print<span className="text-[#E63946]">Portal</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                PVC Next
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#services"
              className="text-sm font-medium text-slate-600 hover:text-[#8B1E2D] transition-colors"
            >
              Services
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-[#8B1E2D] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#pricing"
              className="text-sm font-medium text-slate-600 hover:text-[#8B1E2D] transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#1D3557] hover:text-[#8B1E2D] hover:bg-slate-50 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#8B1E2D] to-[#E63946] hover:shadow-btn-hover rounded-lg transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
