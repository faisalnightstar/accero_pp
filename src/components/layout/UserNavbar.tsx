'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Printer,
  LayoutDashboard,
  Layers,
  CreditCard,
  Wallet,
  Plus,
  AlertTriangle,
  ChevronDown,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import RechargeModal from '@/components/wallet/RechargeModal';

export interface UserSessionData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  walletBalance: number;
}

export interface UserNavbarProps {
  user: UserSessionData;
  onWalletUpdated?: (newBalance: number) => void;
  onLogout?: () => void;
  className?: string;
}

export default function UserNavbar({
  user,
  onWalletUpdated,
  onLogout,
  className = '',
}: UserNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click or Esc
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      if (onLogout) {
        onLogout();
      }
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isLowBalance = user.walletBalance < 50;

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      name: 'Interactive Studio',
      href: '/studio',
      icon: Layers,
      active: pathname.startsWith('/studio'),
    },
    {
      name: 'Card Templates',
      href: '/cards',
      icon: CreditCard,
      active: pathname === '/cards',
    },
    {
      name: 'Wallet Ledger',
      href: '/wallet',
      icon: Wallet,
      active: pathname === '/wallet',
    },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print transition-colors ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            {/* 1. Brand Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group shrink-0 focus:outline-none"
              title="PrintPortal App Workspace"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B1E2D] to-[#E63946] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xl tracking-tight text-[#1D3557]">
                    Print<span className="text-[#E63946]">Portal</span>
                  </span>
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-burgundy/10 text-burgundy border border-burgundy/20">
                    PVC
                  </span>
                </div>
                <span className="hidden sm:block text-[10px] font-semibold text-slate-500 tracking-wide uppercase">
                  Workspace Portal
                </span>
              </div>
            </Link>

            {/* 2. Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                      item.active
                        ? 'text-burgundy bg-burgundy/10 shadow-xs'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        item.active ? 'text-burgundy' : 'text-slate-400 group-hover:text-navy'
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* 3. Right Area: CTA, Live Wallet Pill, User Profile & Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Action: New Print */}
              <Link
                href="/studio"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-burgundy to-crimson hover:shadow-btn-hover rounded-lg transition-all shrink-0"
                title="Launch Interactive Card Studio"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Print</span>
              </Link>

              {/* Live Wallet Balance Pill */}
              <button
                type="button"
                onClick={() => setIsRechargeModalOpen(true)}
                title="Click to recharge wallet balance"
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shadow-2xs shrink-0 cursor-pointer ${
                  isLowBalance
                    ? 'bg-amber-500/10 border-amber-400 text-amber-950 hover:bg-amber-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-burgundy/40 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isLowBalance
                      ? 'bg-amber-400 text-amber-950 animate-pulse'
                      : 'bg-burgundy/10 text-burgundy'
                  }`}
                >
                  {isLowBalance ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <Wallet className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="flex flex-col text-left leading-none">
                  <span className="text-[9px] uppercase font-bold text-slate-500">
                    {isLowBalance ? 'Low Bal' : 'Balance'}
                  </span>
                  <span className="text-xs font-black tracking-tight text-slate-900 mt-0.5">
                    ₹{user.walletBalance.toFixed(2)}
                  </span>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-burgundy bg-burgundy/10 hover:bg-burgundy/20 px-2 py-0.5 rounded-md transition-colors ml-0.5">
                  <Plus className="w-2.5 h-2.5" />
                  Top-up
                </span>
              </button>

              {/* User Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 p-1 rounded-full border transition-all ${
                    isProfileOpen
                      ? 'border-burgundy ring-2 ring-burgundy/20 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                  title="User Account Menu"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-navy font-black text-xs uppercase shadow-2xs">
                      {user.name ? user.name[0] : 'U'}
                    </div>
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"
                      title="Online Session Active"
                    />
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 mr-0.5 transition-transform duration-200 ${
                      isProfileOpen ? 'rotate-180 text-navy' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-navy truncate">
                          {user.name || 'PrintPortal User'}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {user.email || user.phone || 'Standard Account'}
                      </p>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px]">Wallet Funds:</span>
                        <span className="font-extrabold text-navy font-mono">
                          ₹{user.walletBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-burgundy hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Dashboard Overview</span>
                      </Link>

                      <Link
                        href="/studio"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-burgundy hover:bg-slate-50 transition-colors"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span>Interactive Card Studio</span>
                      </Link>

                      <Link
                        href="/cards"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-burgundy hover:bg-slate-50 transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <span>Preformatted Templates</span>
                      </Link>

                      <Link
                        href="/wallet"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-burgundy hover:bg-slate-50 transition-colors"
                      >
                        <Wallet className="w-4 h-4 text-slate-400" />
                        <span>Wallet Ledger & Top-Up</span>
                      </Link>
                    </div>

                    {/* Sign Out Action */}
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left disabled:opacity-50"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-navy hover:bg-slate-100 transition-colors"
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

        {/* 4. Responsive Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200 shadow-xl">
            {/* User Profile Info in Drawer */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-navy font-black text-sm uppercase">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-navy truncate max-w-[160px]">
                    {user.name || 'User Account'}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate max-w-[160px]">
                    {user.email || user.phone}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Balance</span>
                <span className="text-xs font-black text-navy font-mono">
                  ₹{user.walletBalance.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quick Action Top-Up & Studio */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsRechargeModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-navy bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <Wallet className="w-3.5 h-3.5 text-burgundy" />
                <span>Top-up Wallet</span>
              </button>

              <Link
                href="/studio"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-gradient-to-r from-burgundy to-crimson rounded-lg shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Print</span>
              </Link>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1 pt-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      item.active
                        ? 'text-burgundy bg-burgundy/10 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Sign Out Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out of Account'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        onSuccess={(newBal) => {
          if (onWalletUpdated) {
            onWalletUpdated(newBal);
          }
        }}
      />
    </>
  );
}
