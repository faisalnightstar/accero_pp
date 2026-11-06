'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Printer,
  User,
  CreditCard,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export interface PublicNavbarProps {
  className?: string;
}

export default function PublicNavbar({ className = '' }: PublicNavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const publicLinks = [
    { name: 'Services', href: '/#services' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Card Formats', href: '/cards' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print transition-colors ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B1E2D] to-[#E63946] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-[#1D3557]">
                  Print<span className="text-[#E63946]">Portal</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                  PVC Next
                </span>
              </div>
              <span className="hidden sm:block text-[10px] font-semibold text-slate-500 tracking-wide uppercase">
                Official PVC Gateway
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {publicLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-semibold text-slate-600 hover:text-burgundy transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action: Sign In & Register */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-navy hover:text-burgundy hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-burgundy to-crimson hover:shadow-btn-hover rounded-lg transition-all shadow-xs"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-bold text-navy px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg text-slate-600 hover:text-navy hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-navy" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200 shadow-xl">
          <div className="space-y-1">
            {publicLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-navy bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-gradient-to-r from-burgundy to-crimson rounded-lg shadow-xs"
            >
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
