'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Printer,
  User,
  Wallet,
  AlertTriangle,
  Plus,
  LayoutDashboard,
  Layers,
  LogOut,
} from 'lucide-react';
import RechargeModal from '@/components/wallet/RechargeModal';

interface UserSessionState {
  isAuthenticated: boolean;
  name: string;
  email: string;
  walletBalance: number;
}

export default function Navbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<UserSessionState>({
    isAuthenticated: false,
    name: '',
    email: '',
    walletBalance: 0,
  });
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user session & wallet balance
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setSession({
            isAuthenticated: true,
            name: data.user.name || '',
            email: data.user.email || '',
            walletBalance: typeof data.user.walletBalance === 'number' ? data.user.walletBalance : 0,
          });
        }
      } else {
        setSession({
          isAuthenticated: false,
          name: '',
          email: '',
          walletBalance: 0,
        });
      }
    } catch (err) {
      // Session check failed / guest user
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();

    // Listen for custom wallet update events emitted after top-up or deductions
    const handleWalletUpdated = (e: any) => {
      const newBal = e.detail;
      if (typeof newBal === 'number') {
        setSession((prev) => ({ ...prev, walletBalance: newBal }));
      } else {
        fetchSession();
      }
    };

    window.addEventListener('wallet-updated', handleWalletUpdated);
    return () => {
      window.removeEventListener('wallet-updated', handleWalletUpdated);
    };
  }, []);

  const isLowBalance = session.walletBalance < 50;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print transition-colors">
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
              {session.isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/dashboard'
                        ? 'text-[#8B1E2D] font-semibold'
                        : 'text-slate-600 hover:text-[#8B1E2D]'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/studio"
                    className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/studio'
                        ? 'text-[#8B1E2D] font-semibold'
                        : 'text-slate-600 hover:text-[#8B1E2D]'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Studio
                  </Link>
                  <Link
                    href="/wallet"
                    className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      pathname === '/wallet'
                        ? 'text-[#8B1E2D] font-semibold'
                        : 'text-slate-600 hover:text-[#8B1E2D]'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    Wallet Ledger
                  </Link>
                </>
              ) : (
                <>
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
                </>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {session.isAuthenticated ? (
                <>
                  {/* Live Wallet Balance Pill */}
                  <div
                    onClick={() => setIsRechargeModalOpen(true)}
                    role="button"
                    tabIndex={0}
                    title="Click to recharge wallet"
                    className={`group cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shadow-sm ${
                      isLowBalance
                        ? 'bg-amber-500/10 border-amber-400 text-amber-900 hover:bg-amber-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-[#8B1E2D]/40 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isLowBalance
                          ? 'bg-amber-400 text-amber-950 animate-pulse'
                          : 'bg-[#8B1E2D]/10 text-[#8B1E2D]'
                      }`}
                    >
                      {isLowBalance ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <Wallet className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="flex flex-col text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-500 leading-none">
                        {isLowBalance ? 'Low Balance' : 'Balance'}
                      </span>
                      <span className="text-xs font-black tracking-tight text-slate-900">
                        ₹{session.walletBalance.toFixed(2)}
                      </span>
                    </div>

                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#8B1E2D] bg-[#8B1E2D]/10 hover:bg-[#8B1E2D]/20 px-2 py-0.5 rounded-md transition-colors">
                      <Plus className="w-3 h-3" />
                      Top-up
                    </span>
                  </div>

                  {/* Profile link */}
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 p-1.5 text-sm font-semibold text-slate-700 hover:text-[#8B1E2D] rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs uppercase">
                      {session.name ? session.name[0] : 'U'}
                    </div>
                  </Link>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        onSuccess={(newBal) => {
          setSession((prev) => ({ ...prev, walletBalance: newBal }));
        }}
      />
    </>
  );
}
