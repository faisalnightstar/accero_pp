'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Headphones,
  ChevronRight,
  Bell,
  LogOut,
  ExternalLink,
  ChevronDown,
  Shield,
  Ticket,
} from 'lucide-react';

export interface SupportUserData {
  id?: string;
  name: string;
  email: string;
  role: string;
}

export interface SupportHeaderProps {
  user: SupportUserData;
  className?: string;
}

export default function SupportHeader({ user, className = '' }: SupportHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
    if (pathname === '/support') return 'Support Overview';
    if (pathname.startsWith('/support/tickets')) return 'Ticket Queue';
    if (pathname.startsWith('/support/operators')) return 'Operator Lookup';
    if (pathname.startsWith('/support/troubleshooting')) return 'Troubleshooting';
    if (pathname.startsWith('/support/knowledge-base')) return 'Knowledge Base';
    return 'Command Center';
  };

  const isAdmin = user.role?.toLowerCase().includes('admin');

  return (
    <header className={`bg-slate-950 border-b border-slate-800 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between no-print ${className}`}>
      {/* Left: Branding & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Link href="/support" className="font-bold text-white hover:text-slate-300 transition-colors flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Support</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-300 truncate max-w-[200px] sm:max-w-none">
            {getBreadcrumb()}
          </span>
        </div>
      </div>

      {/* Right: Quick Links & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isAdmin && (
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Admin Portal</span>
          </Link>
        )}

        <Link
          href="/dashboard"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          <span>Operator App</span>
        </Link>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-800 hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
            aria-label="Support staff account menu"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow">
              {user.name ? user.name[0] : 'S'}
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
                <span className="mt-2 inline-block text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  {user.role.replace('_', ' ')}
                </span>
              </div>

              <div className="py-1">
                <Link
                  href="/support/tickets"
                  onClick={() => setIsProfileOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 px-4 py-2 font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Ticket className="w-4 h-4 text-slate-400" />
                  <span>Ticket Queue</span>
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
                    <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
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
