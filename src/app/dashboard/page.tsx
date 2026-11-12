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
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderOpen,
  Sparkles,
  Gift,
  Ticket,
  Search,
} from 'lucide-react';
import { QuickLookupModal } from '@/components/dashboard/QuickLookupModal';
import RechargeModal from '@/components/wallet/RechargeModal';
import { DocumentType } from '@/types/cards';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  walletBalance: number;
}

interface SavedDocument {
  id: string;
  docType: string;
  cardIdentifier: string;
  inputMode: string;
  missingFields: string[];
  isComplete: boolean;
  printCount: number;
  lastPrintedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const cardServices = [
  {
    type: 'pan',
    title: 'PAN Card Studio',
    subtitle: 'NSDL & UTI Layouts',
    fee: '₹50',
    color: 'from-[#8B1E2D] to-[#E63946]',
    border: 'border-red-200',
    tag: 'Instant Lookup',
  },
  {
    type: 'aadhaar',
    title: 'Aadhaar PVC Studio',
    subtitle: 'High-Res Hologram & QR',
    fee: '₹25',
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
    fee: '₹35',
    color: 'from-purple-600 to-purple-700',
    border: 'border-purple-200',
    tag: 'Chassis & Engine',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedDocs, setSavedDocs] = useState<SavedDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [showLookupModal, setShowLookupModal] = useState(false);
  const [lookupDocType, setLookupDocType] = useState<DocumentType>('pan');
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

  useEffect(() => {
    async function loadSessionAndDocs() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (!data.authenticated || !data.user) {
          router.push('/login');
          return;
        }
        setUser(data.user);

        // Fetch user's saved documents from MongoDB
        const docsRes = await fetch('/api/documents?limit=10');
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setSavedDocs(docsData.documents || []);
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
        setDocsLoading(false);
      }
    }
    loadSessionAndDocs();
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

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setLookupDocType('pan');
              setShowLookupModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#8B1E2D] hover:bg-[#A82537] shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Quick Lookup</span>
          </button>

          <Link
            href="/studio"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-navy bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Launch Studio</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
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
                ₹{typeof user?.walletBalance === 'number' ? user.walletBalance.toFixed(2) : '0.00'}
              </span>
              <span className="text-sm text-slate-400">INR</span>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Per-print deductions are debited atomically upon card rendering.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsRechargeModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white text-sm font-semibold hover:shadow-btn-hover transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Top-Up Balance</span>
            </button>
            <Link
              href="/wallet"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/10"
            >
              <Wallet className="w-3.5 h-3.5 text-[#F4D35E]" />
              <span>View Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard/refer-earn"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors border border-emerald-500/30"
            >
              <Gift className="w-3.5 h-3.5 text-emerald-400" />
              <span>Refer & Earn (₹50)</span>
            </Link>
            <Link
              href="/dashboard/offers"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold transition-colors border border-purple-500/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Offers & Bonuses</span>
            </Link>
            <div className="flex items-center gap-2 text-xs text-emerald-400 sm:ml-auto">
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

      {/* Rewards, Offers & Promo Code Discovery Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/refer-earn"
          className="rounded-2xl p-5 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 hover:border-emerald-700 transition-all group flex flex-col justify-between shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Earn ₹50 Each
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
              <span>Refer & Earn Program</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </h4>
            <p className="text-xs text-slate-400">
              Invite cyber cafe operators. Get ₹50 free wallet credits on their qualifying recharge.
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/offers"
          className="rounded-2xl p-5 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900 border border-purple-800/40 hover:border-purple-700 transition-all group flex flex-col justify-between shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Auto Slab Bonus
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
              <span>Offers & Recharge Bonuses</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </h4>
            <p className="text-xs text-slate-400">
              Top up ₹249+ and receive instant +₹50 bonus credits on every qualifying recharge slab.
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/promo-codes"
          className="rounded-2xl p-5 bg-gradient-to-br from-pink-950/40 via-slate-900 to-slate-900 border border-pink-800/40 hover:border-pink-700 transition-all group flex flex-col justify-between shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Ticket className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Coupons Available
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <h4 className="font-bold text-sm text-white group-hover:text-pink-300 transition-colors flex items-center gap-1.5">
              <span>Promo Codes & Coupons</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </h4>
            <p className="text-xs text-slate-400">
              Discover active promo codes, redeem instant discounts, and view redemption history.
            </p>
          </div>
        </Link>
      </div>

      {/* Saved Documents Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-5 h-5 text-burgundy" />
            <h2 className="text-lg font-bold text-[#1D3557]">Saved Document Records</h2>
          </div>
          <span className="text-xs text-slate-500">
            {savedDocs.length} {savedDocs.length === 1 ? 'Record' : 'Records'} stored in MongoDB
          </span>
        </div>

        {docsLoading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-burgundy" />
            <span>Loading document library...</span>
          </div>
        ) : savedDocs.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
            <p className="text-xs text-slate-500 font-medium">
              No documents saved yet. Launch a studio below to format or edit your first card.
            </p>
            <Link
              href="/studio?type=pan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-burgundy hover:text-white bg-burgundy/5 hover:bg-burgundy border border-burgundy/20 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Create PAN Card</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Document</th>
                  <th className="py-2.5 px-3 font-semibold">Identifier</th>
                  <th className="py-2.5 px-3 font-semibold">Source</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Last Saved</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {savedDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-bold text-navy uppercase">
                        <CreditCard className="w-3.5 h-3.5 text-burgundy" />
                        {doc.docType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                      {doc.cardIdentifier}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {doc.inputMode}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {doc.isComplete ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Ready to Print
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          {doc.missingFields.length} Missing
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/studio?id=${doc.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-navy bg-slate-100 hover:bg-burgundy hover:text-white transition-colors"
                          title="Open in split-screen studio"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>
                        <Link
                          href={`/studio?id=${doc.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-steel-blue bg-blue-50 hover:bg-steel-blue hover:text-white transition-colors"
                          title="Print CR80 card"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLookupDocType(card.type as DocumentType);
                    setShowLookupModal(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#8B1E2D]/10 hover:bg-[#8B1E2D] text-[#8B1E2D] hover:text-white text-xs font-bold transition-all border border-[#8B1E2D]/20"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Quick Number Lookup</span>
                </button>
                <Link
                  href={`/studio?type=${card.type}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#1D3557] text-xs font-semibold transition-all border border-slate-200"
                >
                  <span>Open Blank Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <QuickLookupModal
        isOpen={showLookupModal}
        onClose={() => setShowLookupModal(false)}
        initialType={lookupDocType}
      />

      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        onSuccess={(newBal) => {
          setUser((prev) => (prev ? { ...prev, walletBalance: newBal } : prev));
        }}
      />
    </div>
  );
}
