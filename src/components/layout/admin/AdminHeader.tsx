'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ChevronRight,
  Bell,
  LogOut,
  User as UserIcon,
  ExternalLink,
  ChevronDown,
  Shield,
  Headphones,
  CheckCircle2,
} from 'lucide-react';

export interface AdminUserData {
  id?: string;
  name: string;
  email: string;
  role: string;
}

export interface AdminHeaderProps {
  user: AdminUserData;
  className?: string;
}

export default function AdminHeader({ user, className = '' }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getBreadcrumb = () => {
    if (pathname === '/admin') return 'Overview & Metrics';
    if (pathname.startsWith('/admin/operators')) return 'Operator Management';
    if (pathname.startsWith('/admin/finance')) return 'Wallet & Finance';
    if (pathname.startsWith('/admin/campaigns')) return 'Campaigns & Bonuses';
    if (pathname.startsWith('/admin/promo-codes')) return 'Promo Codes & Coupons';
    if (pathname.startsWith('/admin/referrals')) return 'Referral & Rewards';
    if (pathname.startsWith('/admin/services')) return 'Service Pricing';
    if (pathname.startsWith('/admin/payments')) return 'Payment Auditing';
    if (pathname.startsWith('/admin/reports')) return 'Reports & Exports';
    if (pathname.startsWith('/admin/team')) return 'Team & Access Control';
    return 'Console';
  };

  const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.role?.toLowerCase() === 'super_admin';

  return (
    <header className={`bg-slate-950 border-b border-slate-800 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between no-print ${className}`}>
      {/* Left: Branding & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Link href="/admin" className="font-bold text-white hover:text-slate-300 transition-colors flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E63946]" />
            <span>Admin</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-300 truncate max-w-[200px] sm:max-w-none">
            {getBreadcrumb()}
          </span>
        </div>
      </div>

      {/* Right: Notifications, External Portals & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Support Quick Link */}
        <Link
          href="/support"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Switch to Support Center"
        >
          <Headphones className="w-3.5 h-3.5 text-emerald-400" />
          <span>Support</span>
        </Link>

        {/* Operator Portal Quick Link */}
        <Link
          href="/dashboard"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Open Operator Portal"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          <span>Operator App</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative cursor-pointer"
            title="System Alerts"
            aria-label="View system notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 py-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                <span className="font-bold text-white">System Notifications</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Healthy
                </span>
              </div>
              <div className="p-3 space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Database & Ledger Sync</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Mongoose transactions and balance deductions are 100% operational.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-800 hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
            aria-label="Admin account menu"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B1E2D] to-[#E63946] flex items-center justify-center text-white font-bold text-xs shadow">
              {user.name ? user.name[0] : 'A'}
            </div>
            <span className="hidden md:inline-block text-xs font-bold text-white max-w-[120px] truncate">
              {user.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="font-bold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                <div className="mt-2">
                  <span className="inline-block text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-slate-800 text-[#F4D35E] border border-slate-700">
                    {isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/admin"
                  onClick={() => setIsProfileOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 px-4 py-2 font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Admin Overview</span>
                </Link>

                <Link
                  href="/dashboard"
                  onClick={() => setIsProfileOpen(false)}
                  role="menuitem"
                  className="flex items-center justify-between px-4 py-2 font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-400" />
                    <span>Operator Workspace</span>
                  </span>
                </Link>

                <Link
                  href="/support"
                  onClick={() => setIsProfileOpen(false)}
                  role="menuitem"
                  className="flex items-center justify-between px-4 py-2 font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-emerald-400" />
                    <span>Support Command</span>
                  </span>
                </Link>

                <div className="pt-1 border-t border-slate-800 mt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    role="menuitem"
                    className="w-full flex items-center gap-2.5 px-4 py-2 font-bold text-rose-400 hover:bg-slate-800 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isLoggingOut ? 'Signing out...' : 'Sign Out of Admin'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
