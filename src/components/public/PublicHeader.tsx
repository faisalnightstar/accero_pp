'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Menu,
  X,
  User,
  ArrowRight,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Car,
  UtensilsCrossed,
  Printer,
  FileText,
  HelpCircle,
  PhoneCall,
  Sparkles,
  Layers,
  Search,
  Compass,
} from 'lucide-react';

const serviceItems = [
  {
    name: 'PAN Card Print',
    description: 'NSDL & UTIITSL preformatted CR80 layout with QR',
    href: '/services/pan-card-printing',
    icon: CreditCard,
    color: 'text-[#E63946]',
  },
  {
    name: 'Aadhaar PVC Card',
    description: 'Bilingual regional script with secure demographic layout',
    href: '/services/aadhaar-document-management',
    icon: ShieldCheck,
    color: 'text-amber-500',
  },
  {
    name: 'Voter ID (EPIC)',
    description: 'Electoral photo identity format with assembly parts',
    href: '/services/voter-id-printing',
    icon: CheckCircle2,
    color: 'text-blue-500',
  },
  {
    name: 'Driving Licence (DL)',
    description: 'Smart card chip layout with vehicle class categories',
    href: '/services/driving-licence-printing',
    icon: CreditCard,
    color: 'text-indigo-500',
  },
  {
    name: 'Vehicle RC Smart Card',
    description: 'Vahan standard vehicle registration smart card template',
    href: '/services/vehicle-rc-printing',
    icon: Car,
    color: 'text-purple-500',
  },
  {
    name: 'Ration Card Print',
    description: 'NFSA family food security card with CR80 tray support',
    href: '/services/ration-card-printing',
    icon: UtensilsCrossed,
    color: 'text-teal-500',
  },
  {
    name: 'Farmer ID (AgriStack)',
    description: 'Farmer Registry card layout with landholding table',
    href: '/services/farmer-id-printing',
    icon: Compass,
    color: 'text-emerald-600',
  },
];

const platformNav = [
  {
    name: 'Specialized Portals',
    items: [
      { name: 'Print Portal Overview', href: '/print-portal' },
      { name: 'Best Portal for CSC', href: '/best-print-portal-for-csc' },
      { name: 'For Cyber Cafes', href: '/print-portal-for-cyber-cafe' },
      { name: 'For Retailers', href: '/print-portal-for-retailers' },
      { name: 'PVC Card Software', href: '/pvc-card-printing-software' },
      { name: 'CSC Operator Software', href: '/csc-operator-software' },
    ],
  },
  {
    name: 'Features & Solutions',
    items: [
      { name: 'Split-Screen Live Studio', href: '/features/document-editing' },
      { name: 'CR80 Physical Print Engine', href: '/features/document-printing' },
      { name: 'Document Lookup Cascade', href: '/features/document-lookup' },
      { name: 'Cyber Cafe Hub', href: '/solutions/cyber-cafes' },
      { name: 'CSC Operator Hub', href: '/solutions/csc-operators' },
      { name: 'All Features', href: '/features' },
    ],
  },
  {
    name: 'Guides & Support',
    items: [
      { name: 'ISO CR80 Dimensions Guide', href: '/blog/cr80-card-dimensions-guide' },
      { name: 'Epson & Canon Tray Setup', href: '/blog/pvc-card-printer-tray-guide' },
      { name: 'Operator Knowledge Base', href: '/faq' },
      { name: 'Contact & Support', href: '/contact' },
      { name: 'Security & Compliance', href: '/security' },
      { name: 'Operator Resources', href: '/resources' },
    ],
  },
];

export interface PublicHeaderProps {
  className?: string;
}

export default function PublicHeader({ className = '' }: PublicHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  const servicesRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setServicesOpen(false);
        setExploreOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesOpen(false);
    setExploreOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 no-print transition-colors ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Authority Label */}
          <Link href="/" className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D3557] rounded-lg">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs group-hover:border-slate-300 transition-colors">
              <Image
                src="/assets/logo.png"
                alt="Accero PrintPortal Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-lg tracking-tight text-[#1D3557]">
                  Accero <span className="text-[#8B1E2D]">PrintPortal</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  ISO CR80
                </span>
              </div>
              <span className="hidden md:block text-[10px] font-medium text-slate-500 tracking-wide mt-0.5">
                Document Processing &amp; Printing SaaS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {/* Services Dropdown */}
            <div className="relative" ref={servicesRef}>
              <button
                type="button"
                onClick={() => {
                  setServicesOpen((prev) => !prev);
                  setExploreOpen(false);
                }}
                aria-expanded={servicesOpen}
                className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  pathname.startsWith('/services') || servicesOpen
                    ? 'text-[#8B1E2D] bg-red-50/60'
                    : 'text-slate-700 hover:text-[#1D3557] hover:bg-slate-100/70'
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    servicesOpen ? 'rotate-180 text-[#8B1E2D]' : 'text-slate-400'
                  }`}
                />
              </button>

              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-[560px] bg-white rounded-2xl border border-slate-200 shadow-xl p-4 grid grid-cols-2 gap-2 animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                  <div className="col-span-2 pb-2 mb-1 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Supported Document Workflows
                    </span>
                    <Link
                      href="/services"
                      onClick={() => setServicesOpen(false)}
                      className="text-xs font-bold text-[#8B1E2D] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View All Services</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {serviceItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setServicesOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60 group-hover:bg-white group-hover:border-slate-300">
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#8B1E2D] transition-colors">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Platform & Solutions Dropdown */}
            <div className="relative" ref={exploreRef}>
              <button
                type="button"
                onClick={() => {
                  setExploreOpen((prev) => !prev);
                  setServicesOpen(false);
                }}
                aria-expanded={exploreOpen}
                className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  exploreOpen ||
                  pathname.startsWith('/features') ||
                  pathname.startsWith('/solutions') ||
                  pathname.startsWith('/print-portal')
                    ? 'text-[#8B1E2D] bg-red-50/60'
                    : 'text-slate-700 hover:text-[#1D3557] hover:bg-slate-100/70'
                }`}
              >
                <span>Platform</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    exploreOpen ? 'rotate-180 text-[#8B1E2D]' : 'text-slate-400'
                  }`}
                />
              </button>

              {exploreOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-[620px] bg-white rounded-2xl border border-slate-200 shadow-xl p-5 grid grid-cols-3 gap-6 animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                  {platformNav.map((col) => (
                    <div key={col.name} className="space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
                        {col.name}
                      </h4>
                      <ul className="space-y-1">
                        {col.items.map((sub) => (
                          <li key={sub.href}>
                            <Link
                              href={sub.href}
                              onClick={() => setExploreOpen(false)}
                              className="block py-1 text-xs font-medium text-slate-600 hover:text-[#8B1E2D] transition-colors"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Links */}
            <Link
              href="/pricing"
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                pathname === '/pricing'
                  ? 'text-[#8B1E2D] bg-red-50/60'
                  : 'text-slate-700 hover:text-[#1D3557] hover:bg-slate-100/70'
              }`}
            >
              Pricing
            </Link>

            <Link
              href="/faq"
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                pathname === '/faq'
                  ? 'text-[#8B1E2D] bg-red-50/60'
                  : 'text-slate-700 hover:text-[#1D3557] hover:bg-slate-100/70'
              }`}
            >
              FAQ
            </Link>

            <Link
              href="/about"
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                pathname === '/about'
                  ? 'text-[#8B1E2D] bg-red-50/60'
                  : 'text-slate-700 hover:text-[#1D3557] hover:bg-slate-100/70'
              }`}
            >
              About
            </Link>

            <Link
              href="/contact"
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                pathname === '/contact'
                  ? 'text-[#8B1E2D] bg-red-50/60'
                  : 'text-slate-700 hover:text-[#1D3557] hover:bg-slate-100/70'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#1D3557] hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Operator Login</span>
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1D3557] hover:bg-[#8B1E2D] rounded-xl transition-all shadow-xs"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-bold text-[#1D3557] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              Login
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D3557]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-4 max-h-[calc(100vh-64px)] overflow-y-auto animate-in slide-in-from-top duration-200 shadow-xl">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-[#1D3557] bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100"
            >
              <User className="w-3.5 h-3.5" />
              <span>Operator Login</span>
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-white bg-[#1D3557] rounded-xl shadow-xs"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Services Section */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Document Workflows
            </div>
            {serviceItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
              >
                <span>{item.name}</span>
                <span className="text-[10px] text-slate-400">CR80</span>
              </Link>
            ))}
          </div>

          {/* Direct Core Navigation */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Platform &amp; Pricing
            </div>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Pay-As-You-Print Pricing
            </Link>
            <Link
              href="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Platform Features
            </Link>
            <Link
              href="/solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Industry Solutions
            </Link>
            <Link
              href="/print-portal"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Print Portal Hub
            </Link>
          </div>

          {/* Resources & Support */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Trust &amp; Knowledge
            </div>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Frequently Asked Questions
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              About Accero
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Contact Support
            </Link>
            <Link
              href="/security"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-lg"
            >
              Security Architecture
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
