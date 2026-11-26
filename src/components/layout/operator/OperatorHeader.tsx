'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ChevronRight,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  Gift,
  Ticket,
  Search,
  Bell,
  HelpCircle,
  Settings,
  Shield,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import InstallNavbarButton from '@/components/pwa/InstallNavbarButton';
import { updateClientWalletBalance, storeClientSession } from '@/lib/authClient';

export interface OperatorUserData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  walletBalance: number;
}

export interface OperatorHeaderProps {
  user: OperatorUserData;
  onRechargeClick: () => void;
  className?: string;
}

export default function OperatorHeader({
  user,
  onRechargeClick,
  className = '',
}: OperatorHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentBalance, setCurrentBalance] = useState<number>(user.walletBalance);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const rewardsRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Sync wallet balance when prop changes or via event
  useEffect(() => {
    setCurrentBalance(user.walletBalance);
  }, [user.walletBalance]);

  useEffect(() => {
    const handleWalletUpdated = (e: any) => {
      const newBal = e.detail;
      if (typeof newBal === 'number') {
        setCurrentBalance(newBal);
        updateClientWalletBalance(newBal);
      }
    };

    window.addEventListener('wallet-updated', handleWalletUpdated);
    return () => {
      window.removeEventListener('wallet-updated', handleWalletUpdated);
    };
  }, []);

  // Close menus on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (rewardsRef.current && !rewardsRef.current.contains(event.target as Node)) {
        setIsRewardsOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        setIsRewardsOpen(false);
        setIsNotificationsOpen(false);
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

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
    setIsRewardsOpen(false);
    setIsNotificationsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      storeClientSession(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isLowBalance = currentBalance < 50;

  // Resolve Context title and breadcrumbs
  const getContextInfo = () => {
    if (pathname.startsWith('/studio')) {
      return { title: 'Card Studio', crumb: 'Interactive Editor' };
    }
    if (pathname.startsWith('/wallet')) {
      return { title: 'Wallet & Ledger', crumb: 'Recharge & Billing' };
    }
    if (pathname.startsWith('/cards')) {
      return { title: 'Card Showcase', crumb: 'CR80 Templates' };
    }
    if (pathname === '/dashboard/pan-lookup') {
      return { title: 'PAN Verification', crumb: 'Instant Lookup' };
    }
    if (pathname === '/dashboard/offers') {
      return { title: 'Bonus & Offers', crumb: 'Cashback Perks' };
    }
    if (pathname === '/dashboard/promo-codes') {
      return { title: 'Promo Codes', crumb: 'Voucher Redemption' };
    }
    if (pathname === '/dashboard/refer-earn') {
      return { title: 'Referral Rewards', crumb: 'Invite & Earn' };
    }
    return { title: 'Operator Dashboard', crumb: 'Overview' };
  };

  const contextInfo = getContextInfo();

  // Primary Nav Links
  const primaryNavLinks = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      name: 'Studio',
      href: '/studio',
      icon: Layers,
      active: pathname.startsWith('/studio'),
    },
    {
      name: 'PAN Lookup',
      href: '/dashboard/pan-lookup',
      icon: Search,
      active: pathname.startsWith('/dashboard/pan-lookup'),
    },
    {
      name: 'Templates',
      href: '/cards',
      icon: CreditCard,
      active: pathname === '/cards',
    },
    {
      name: 'Wallet',
      href: '/wallet',
      icon: Wallet,
      active: pathname === '/wallet',
    },
  ];

  // Reward Nav Links
  const rewardNavLinks = [
    {
      name: 'Refer & Earn',
      href: '/dashboard/refer-earn',
      icon: Gift,
      active: pathname === '/dashboard/refer-earn',
      description: 'Earn credits per active referral',
    },
    {
      name: 'Offers & Perks',
      href: '/dashboard/offers',
      icon: Sparkles,
      active: pathname === '/dashboard/offers',
      description: 'Volume recharge bonuses',
    },
    {
      name: 'Promo Codes',
      href: '/dashboard/promo-codes',
      icon: Ticket,
      active: pathname === '/dashboard/promo-codes',
      description: 'Instant discount coupons',
    },
  ];

  const isRewardsActive =
    pathname.startsWith('/dashboard/refer-earn') ||
    pathname.startsWith('/dashboard/offers') ||
    pathname.startsWith('/dashboard/promo-codes');

  const isAdminUser =
    user.role === 'SUPER_ADMIN' ||
    user.role === 'ADMIN' ||
    user.role?.toLowerCase() === 'admin' ||
    user.role?.toLowerCase() === 'super_admin';

  const isSupportUser =
    user.role === 'SUPPORT_MANAGER' ||
    user.role === 'SUPPORT_AGENT' ||
    user.role?.toLowerCase().includes('support');

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print transition-colors ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2 xl:gap-3">
          {/* 1. Left Area: Logo, Operator Context & Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E2D]/40 rounded-xl"
              title="Accero PrintPortal Operator Workspace"
            >
              <Image
                src="/assets/hlogo.png"
                alt="Accero PrintPortal Logo"
                width={120}
                height={36}
                className="h-7.5 sm:h-8 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                priority
              />
              <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#8B1E2D]/10 text-[#8B1E2D] border border-[#8B1E2D]/20 shadow-2xs">
                Operator
              </span>
            </Link>

            {/* Context Breadcrumb */}
            <div className="hidden xl:flex items-center gap-1 pl-2.5 border-l border-slate-200 text-[11px] shrink-0">
              <Link
                href="/dashboard"
                className="text-slate-400 hover:text-[#1D3557] font-medium transition-colors"
              >
                Dashboard
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
              <span className="text-slate-700 font-semibold truncate max-w-[85px] 2xl:max-w-[140px]">
                {contextInfo.crumb}
              </span>
            </div>
          </div>

          {/* 2. Center: Operator Primary Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 shrink-0" aria-label="Operator Navigation">
            {primaryNavLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E2D]/40 ${item.active
                    ? 'text-[#8B1E2D] bg-[#8B1E2D]/10 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-[#1D3557] hover:bg-slate-100'
                    }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${item.active ? 'text-[#8B1E2D]' : 'text-slate-400 group-hover:text-[#1D3557]'
                      }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Rewards Dropdown */}
            <div className="relative" ref={rewardsRef}>
              <button
                type="button"
                onClick={() => setIsRewardsOpen((prev) => !prev)}
                className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E2D]/40 cursor-pointer ${isRewardsActive || isRewardsOpen
                  ? 'text-[#8B1E2D] bg-[#8B1E2D]/10 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-[#1D3557] hover:bg-slate-100'
                  }`}
                aria-expanded={isRewardsOpen}
                aria-haspopup="true"
                aria-label="Rewards menu"
              >
                <Sparkles
                  className={`w-3.5 h-3.5 ${isRewardsActive ? 'text-[#8B1E2D]' : 'text-slate-400 group-hover:text-[#1D3557]'
                    }`}
                />
                <span>Rewards</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isRewardsOpen ? 'rotate-180 text-[#8B1E2D]' : 'text-slate-400'
                    }`}
                />
              </button>

              {isRewardsOpen && (
                <div
                  role="menu"
                  className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Operator Incentives
                  </div>
                  <div className="py-1">
                    {rewardNavLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsRewardsOpen(false)}
                          role="menuitem"
                          className={`flex items-start gap-3 px-3.5 py-2 text-xs transition-colors ${item.active
                            ? 'bg-[#8B1E2D]/10 text-[#8B1E2D] font-bold'
                            : 'text-slate-700 hover:text-[#1D3557] hover:bg-slate-50 font-semibold'
                            }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${item.active
                              ? 'bg-[#8B1E2D] text-white'
                              : 'bg-slate-100 text-slate-600'
                              }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block truncate font-bold">{item.name}</span>
                            <p className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5 truncate">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* 3. Right Area: Studio CTA, Wallet Pill, Notifications, Help, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Action: New Print Studio */}
            <Link
              href="/studio"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#8B1E2D] to-[#E63946] hover:opacity-95 rounded-lg transition-all shrink-0 shadow-xs"
              title="Launch Live Card Studio"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">New Print</span>
            </Link>

            {/* PWA Install */}
            <InstallNavbarButton className="hidden 2xl:inline-flex" />

            {/* Live Wallet Balance Pill */}
            <button
              type="button"
              onClick={onRechargeClick}
              title="Click to recharge wallet credits"
              className={`group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border transition-all shadow-2xs shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E2D]/40 ${isLowBalance
                ? 'bg-amber-500/10 border-amber-400 text-amber-950 hover:bg-amber-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-[#8B1E2D]/40 hover:bg-slate-100'
                }`}
              aria-label={`Wallet balance ₹${currentBalance.toFixed(2)}. Click to top up.`}
            >
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 ${isLowBalance
                  ? 'bg-amber-400 text-amber-950 animate-pulse'
                  : 'bg-[#8B1E2D]/10 text-[#8B1E2D]'
                  }`}
              >
                {isLowBalance ? (
                  <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                ) : (
                  <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                )}
              </div>

              <div className="flex flex-col text-left leading-none">
                <span className="text-[9px] uppercase font-bold text-slate-500">
                  {isLowBalance ? 'Low Bal' : 'Balance'}
                </span>
                <span className="text-xs font-black tracking-tight text-slate-900 mt-0.5">
                  ₹{currentBalance.toFixed(2)}
                </span>
              </div>

              <span className="hidden 2xl:inline-flex items-center gap-0.5 text-[10px] font-bold text-[#8B1E2D] bg-[#8B1E2D]/10 hover:bg-[#8B1E2D]/20 px-1.5 py-0.5 rounded-md transition-colors ml-0.5">
                <Plus className="w-2.5 h-2.5" />
                <span>Top-up</span>
              </span>
            </button>

            {/* Notifications Popover */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Notifications</span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      All Systems Active
                    </span>
                  </div>
                  <div className="p-3 space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <p className="font-bold text-slate-800">Print Engine Operational</p>
                      <p className="text-[11px] text-slate-500">
                        Zero-waste CR80 PVC formatting is running on all templates.
                      </p>
                    </div>
                    {isLowBalance && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                        <p className="font-bold text-amber-900">Wallet Low Balance</p>
                        <p className="text-[11px] text-amber-700">
                          Current balance is below ₹50. Top up to ensure uninterrupted lookups.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Help / Support Link */}
            <a
              href="https://api.whatsapp.com/send?phone=919891210648&text=Hello%20Accero%20Support%2C%20I%20need%20help%20with%20my%20operator%20account."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden 2xl:flex p-1.5 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Operator WhatsApp Support"
              aria-label="Contact Operator Support"
            >
              <HelpCircle className="w-4 h-4" />
            </a>

            {/* Operator Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className={`flex items-center gap-1 p-0.5 sm:p-1 rounded-full border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E2D]/40 ${isProfileOpen
                  ? 'border-[#8B1E2D] ring-2 ring-[#8B1E2D]/20 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
                title="Operator Account Menu"
                aria-label="Operator account menu"
              >
                <div className="relative">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#1D3557] font-black text-xs uppercase shadow-2xs">
                    {user.name ? user.name[0] : 'O'}
                  </div>
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"
                    title="Active Operator Session"
                  />
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 mr-0.5 transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-[#1D3557]' : ''
                    }`}
                />
              </button>

              {isProfileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Operator Details */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#1D3557] truncate">
                        {user.name || 'Verified Operator'}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {user.email || user.phone || 'CSC / Cyber Cafe Account'}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Wallet Credits:</span>
                      <span className="font-extrabold text-[#1D3557] font-mono">
                        ₹{currentBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Profile Menu Items */}
                  <div className="py-1 text-xs">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsProfileOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-4 py-2 font-semibold text-slate-700 hover:text-[#8B1E2D] hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Operator Profile</span>
                    </Link>

                    <Link
                      href="/wallet"
                      onClick={() => setIsProfileOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-4 py-2 font-semibold text-slate-700 hover:text-[#8B1E2D] hover:bg-slate-50 transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-slate-400" />
                      <span>Account & Ledger</span>
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setIsProfileOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-4 py-2 font-semibold text-slate-700 hover:text-[#8B1E2D] hover:bg-slate-50 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span>Security Settings</span>
                    </Link>

                    {/* Admin Switcher if role allows */}
                    {isAdminUser && (
                      <div className="pt-1 border-t border-slate-100 my-1">
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          role="menuitem"
                          className="flex items-center justify-between px-4 py-2 font-bold text-slate-700 hover:text-white hover:bg-slate-900 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#E63946]" />
                            <span>Admin Command Center</span>
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </div>
                    )}

                    {/* Support Switcher if role allows */}
                    {isSupportUser && (
                      <div className="pt-1 border-t border-slate-100 my-1">
                        <Link
                          href="/support"
                          onClick={() => setIsProfileOpen(false)}
                          role="menuitem"
                          className="flex items-center justify-between px-4 py-2 font-bold text-slate-700 hover:text-white hover:bg-emerald-900 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-emerald-400" />
                            <span>Support Command Center</span>
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </div>
                    )}

                    {/* Sign Out */}
                    <div className="pt-1 border-t border-slate-100 mt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        role="menuitem"
                        className="w-full flex items-center gap-2.5 px-4 py-2 font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>{isLoggingOut ? 'Signing out...' : 'Sign Out of Account'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-[#1D3557] hover:bg-slate-100 transition-colors"
              aria-label="Toggle operator navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div >
      </div >

      {/* Mobile Drawer */}
      {
        isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              {primaryNavLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${item.active
                      ? 'bg-[#8B1E2D]/10 text-[#8B1E2D]'
                      : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3.5">
                Rewards & Offers
              </span>
              {rewardNavLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${item.active
                      ? 'bg-[#8B1E2D]/10 text-[#8B1E2D]'
                      : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        )
      }
    </header >
  );
}
