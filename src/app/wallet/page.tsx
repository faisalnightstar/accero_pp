'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Plus,
  RefreshCw,
  FileText,
  CreditCard,
  Car,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Tag,
  Sparkles,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { getWalletBalance, getWalletTransactions } from '@/actions/wallet';
import RechargeModal from '@/components/wallet/RechargeModal';

interface TransactionItem {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  category?: string;
  docType?: string;
  referenceId?: string;
  description: string;
  balanceAfter: number;
  isPromotional?: boolean;
  promoCode?: string;
  createdAt: string;
}

interface WalletStats {
  balance: number;
  promotionalBalance?: number;
  purchasedBalance?: number;
  totalCredited: number;
  totalDebited: number;
  isLowBalance: boolean;
}

export default function WalletPage() {
  const router = useRouter();
  const [stats, setStats] = useState<WalletStats>({
    balance: 0,
    totalCredited: 0,
    totalDebited: 0,
    isLowBalance: false,
  });
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch balance & stats
      const balRes = await getWalletBalance();
      if (!balRes.success && balRes.error === 'Unauthorized') {
        router.push('/login');
        return;
      }

      if (balRes.success) {
        setStats({
          balance: balRes.balance,
          promotionalBalance: balRes.promotionalBalance || 0,
          purchasedBalance: balRes.purchasedBalance || 0,
          totalCredited: balRes.totalCredited,
          totalDebited: balRes.totalDebited,
          isLowBalance: balRes.isLowBalance,
        });
      }

      // 2. Fetch paginated transactions
      const txRes = await getWalletTransactions(page, 15, filterType);
      if (txRes.success) {
        setTransactions(txRes.transactions);
        setTotalCount(txRes.total);
        setTotalPages(txRes.totalPages);
      }
    } catch (err) {
      console.error('[WalletPage] Error loading data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, filterType, router]);

  useEffect(() => {
    loadData();

    const handleWalletUpdated = (e: any) => {
      loadData();
    };

    window.addEventListener('wallet-updated', handleWalletUpdated);
    return () => {
      window.removeEventListener('wallet-updated', handleWalletUpdated);
    };
  }, [loadData]);

  const copyRef = (refText: string, id: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Client-side search filtering across current page records
  const filteredTransactions = transactions.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.referenceId && t.referenceId.toLowerCase().includes(q)) ||
      t.description.toLowerCase().includes(q) ||
      (t.docType && t.docType.toLowerCase().includes(q))
    );
  });

  const getDocTypeIcon = (docType?: string) => {
    const dt = (docType || '').toUpperCase();
    if (dt === 'PAN') return <CreditCard className="w-4 h-4 text-[#E63946]" />;
    if (dt === 'RC') return <Car className="w-4 h-4 text-purple-400" />;
    if (dt === 'DL') return <CreditCard className="w-4 h-4 text-indigo-400" />;
    if (dt === 'AADHAAR') return <ShieldCheck className="w-4 h-4 text-amber-400" />;
    if (dt === 'VOTER') return <Check className="w-4 h-4 text-blue-400" />;
    if (dt === 'TOPUP') return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-[#F4D35E]">Wallet Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Wallet & Credits Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Official per-print billing audit, atomic service deductions, and top-up transactions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData()}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-sm"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsRechargeModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white font-bold text-sm shadow-lg hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>Add Credits / Recharge</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Available Balance */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1D3557] to-[#0f1d30] border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Available Balance
              </span>
              <div className="p-2 rounded-xl bg-white/10 text-[#F4D35E]">
                <Wallet className="w-5 h-5" />
              </div>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  ₹{stats.balance.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 font-mono">INR</span>
              </div>
              {stats.promotionalBalance !== undefined && stats.promotionalBalance > 0 && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                  <Tag className="w-3 h-3" />
                  <span>Includes ₹{stats.promotionalBalance.toFixed(2)} promotional credits</span>
                </div>
              )}
              <p className="text-[11px] text-slate-300 mt-1">
                Reserved for verification & print tray jobs
              </p>
            </div>

            <div>
              {stats.isLowBalance ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Low Balance — Top-up Soon</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Account Active & Ready</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Total Credited */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Deposited
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tracking-tight">
                  ₹{stats.totalCredited.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 font-mono">INR</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Lifetime top-ups & wallet credits
              </p>
            </div>

            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span>Instant UPI & Sandbox</span>
            </div>
          </div>

          {/* Card 3: Total Debited */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Spent
              </span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tracking-tight">
                  ₹{stats.totalDebited.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 font-mono">INR</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Card lookups & manual saves debited
              </p>
            </div>

            <div className="text-xs text-rose-400 font-semibold flex items-center gap-1">
              <span>Atomic conditional billing</span>
            </div>
          </div>

          {/* Card 4: Total Transactions */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Audited Ledger Events
              </span>
              <div className="p-2 rounded-xl bg-[#8B1E2D]/20 text-[#F4D35E] border border-[#8B1E2D]/30">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tracking-tight">
                  {totalCount}
                </span>
                <span className="text-xs text-slate-500 font-mono">Events</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tamper-proof transaction records
              </p>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full audit chain</span>
            </div>
          </div>
        </div>

        {/* Pricing Guide Banner */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Tag className="w-4 h-4 text-[#F4D35E]" />
            <span className="font-bold text-white">Tiered Service Fee Matrix:</span>
            <span className="text-slate-400 hidden md:inline">
              PAN: ₹25 • RC: ₹25 • DL: ₹25 • Aadhaar: ₹15 • Voter: ₹20 • Manual Draft: ₹5
            </span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <Check className="w-4 h-4" />
            <span>Saved cards get 100% Free Re-printing (₹0)</span>
          </div>
        </div>

        {/* Transaction Ledger Table Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start">
              <button
                onClick={() => {
                  setFilterType('all');
                  setPage(1);
                }}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all'
                    ? 'bg-[#8B1E2D] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                All Events
              </button>
              <button
                onClick={() => {
                  setFilterType('debit');
                  setPage(1);
                }}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${filterType === 'debit'
                    ? 'bg-[#8B1E2D] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                Debits (Usage)
              </button>
              <button
                onClick={() => {
                  setFilterType('credit');
                  setPage(1);
                }}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${filterType === 'credit'
                    ? 'bg-[#8B1E2D] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                Credits (Top-ups)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search reference, doc ID, or desc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F4D35E]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Description & Reference
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Balance After
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#F4D35E]" />
                        <span>Loading ledger history...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-600">
                          <Wallet className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-slate-400 text-sm">
                          No transactions found
                        </span>
                        <p className="text-xs text-slate-500 max-w-sm">
                          {searchQuery
                            ? 'No transactions matched your search query.'
                            : 'Perform a card verification or top up your wallet to view your financial audit trail.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isCredit = tx.type === 'credit';
                    const dateFormatted = new Date(tx.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    });

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Timestamp */}
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                          {dateFormatted}
                        </td>

                        {/* Transaction Type */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isCredit ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <ArrowDownLeft className="w-3 h-3" />
                              Credit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              <ArrowUpRight className="w-3 h-3" />
                              Debit
                            </span>
                          )}
                        </td>

                        {/* Service / DocType */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getDocTypeIcon(tx.docType)}
                            <span className="font-semibold text-white">
                              {tx.docType || 'GENERAL'}
                            </span>
                          </div>
                        </td>

                        {/* Description & Reference */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-medium">
                                {tx.description}
                              </span>
                              {tx.category === 'REFERRAL_REWARD' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  🎁 Referral Reward
                                </span>
                              )}
                              {(tx.category === 'PROMO_BONUS' || tx.isPromotional) && tx.category !== 'REFERRAL_REWARD' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                                  🏷️ Promo Bonus {tx.promoCode ? `(${tx.promoCode})` : ''}
                                </span>
                              )}
                              {tx.category === 'RECHARGE_BONUS' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  ⚡ Recharge Bonus
                                </span>
                              )}
                              {tx.category === 'PROMO_REVERSAL' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  ⚠️ Reversal
                                </span>
                              )}
                            </div>
                            {tx.referenceId && (
                              <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                                <span>Ref: {tx.referenceId}</span>
                                <button
                                  type="button"
                                  onClick={() => copyRef(tx.referenceId!, tx.id)}
                                  className="text-slate-500 hover:text-slate-300"
                                  title="Copy reference"
                                >
                                  {copiedId === tx.id ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Amount */}
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-right font-bold text-sm ${isCredit ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'
                            }`}
                        >
                          {isCredit ? `+₹${tx.amount.toFixed(2)}` : `-₹${tx.amount.toFixed(2)}`}
                        </td>

                        {/* Balance After */}
                        <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-white text-xs">
                          ₹{tx.balanceAfter.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Page <strong className="text-white">{page}</strong> of{' '}
                <strong className="text-white">{totalPages}</strong> ({totalCount} total entries)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white disabled:opacity-40 hover:bg-slate-700 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white disabled:opacity-40 hover:bg-slate-700 transition-colors flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        suggestedAmount={100}
        onSuccess={() => {
          setIsRechargeModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
