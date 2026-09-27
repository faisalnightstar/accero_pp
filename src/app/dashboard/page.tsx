'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Wallet,
  PlusCircle,
  Printer,
  FileText,
  Clock,
  LogOut,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  walletBalance: number;
}

const cardServices = [
  {
    type: 'pan',
    title: 'PAN Card Studio',
    subtitle: 'NSDL & UTI Layouts',
    fee: '₹20',
    color: 'from-[#8B1E2D] to-[#E63946]',
    border: 'border-red-200',
    tag: 'Instant Lookup',
  },
  {
    type: 'aadhaar',
    title: 'Aadhaar PVC Studio',
    subtitle: 'High-Res Hologram & QR',
    fee: '₹20',
    color: 'from-amber-600 to-amber-700',
    border: 'border-amber-200',
    tag: 'Bilingual Font',
  },
  {
    type: 'voter',
    title: 'Voter ID Studio',
    subtitle: 'ECI Standard EPIC Format',
    fee: '₹20',
    color: 'from-[#1D3557] to-[#457B9D]',
    border: 'border-blue-200',
    tag: 'Assembly Details',
  },
  {
    type: 'dl',
    title: 'Driving License Studio',
    subtitle: 'Smart Chip Transport Format',
    fee: '₹30',
    color: 'from-indigo-600 to-indigo-700',
    border: 'border-indigo-200',
    tag: 'Vehicle Classes',
  },
  {
    type: 'rc',
    title: 'Vehicle RC Studio',
    subtitle: 'Vahan Smart Card Format',
    fee: '₹30',
    color: 'from-purple-600 to-purple-700',
    border: 'border-purple-200',
    tag: 'Chassis & Engine',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="w-6 h-6 border-3 border-[#8B1E2D] border-t-transparent rounded-full animate-spin" />
          <span className="font-medium text-sm">Loading operator session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#1D3557]">
              Welcome back, {user?.name || 'Operator'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Active Session
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {user?.email} • {user?.phone} • Ready to print ISO 7810 CR80 PVC cards
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Wallet Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-[#1D3557] to-[#122238] rounded-2xl p-6 sm:p-8 text-white shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Available Wallet Balance
              </span>
              <Wallet className="w-6 h-6 text-[#F4D35E]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                ₹{user?.walletBalance.toFixed(2) || '0.00'}
              </span>
              <span className="text-sm text-slate-400">INR</span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Per-print deductions are debited atomically upon card rendering.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4">
            <button
              onClick={() => alert('Wallet recharge gateway will be active in Phase 5!')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white text-sm font-semibold hover:shadow-btn-hover transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Top-Up Balance</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Auto-Debit Protected</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Printer Tray Specification
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span>Standard Dimensions:</span>
                <span className="font-semibold text-slate-900">85.60 mm × 53.98 mm</span>
              </li>
              <li className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span>Aspect Ratio:</span>
                <span className="font-semibold text-slate-900">CR80 (ISO/IEC 7810)</span>
              </li>
              <li className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span>Print Margins:</span>
                <span className="font-semibold text-emerald-700">0 mm (Exact Tray Fit)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>DPI Resolution:</span>
                <span className="font-semibold text-slate-900">300+ DPI Vector</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Optimized for Evolis, Zebra, Fargo, Epson, Canon PVC Trays
            </span>
          </div>
        </div>
      </div>

      {/* Card Studios Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1D3557]">Launch Split-Screen Card Studio</h2>
          <span className="text-xs text-slate-500">Select card to format or edit missing fields</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardServices.map((card) => (
            <div
              key={card.type}
              className={`bg-white rounded-2xl border ${card.border} p-6 shadow-sm hover:shadow-card transition-all group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-md`}
                  >
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {card.fee}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1D3557] group-hover:text-[#8B1E2D] transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
                <div className="mt-3">
                  <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {card.tag}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href={`/studio/${card.type}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 hover:bg-[#8B1E2D] text-[#1D3557] hover:text-white text-sm font-semibold transition-all"
                >
                  <span>Open Split-Screen Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
