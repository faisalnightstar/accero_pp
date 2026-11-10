'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CreditCard,
  Wallet,
  Ticket,
  Eye,
  PlusCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { searchSupportOperators, getOperatorSupportProfile } from '@/actions/support';
import Link from 'next/link';

export default function SupportOperatorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setProfile(null);
    setSelectedOperatorId(null);
    try {
      const results = await searchSupportOperators(searchQuery);
      setSearchResults(results);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operator search failed' });
    } finally {
      setSearching(false);
    }
  };

  const loadProfile = async (operatorId: string) => {
    setSelectedOperatorId(operatorId);
    setProfileLoading(true);
    try {
      const data = await getOperatorSupportProfile(operatorId);
      setProfile(data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load operator profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            Operator Support Lookup
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Search operator accounts to assist with payment inquiries, ticket history, and balance verification.
          </p>
        </div>
      </div>

      {/* PII Privacy Shield Guarantee */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-indigo-200">Customer Privacy & Data Minimization Active</p>
          <p className="text-indigo-300/80 leading-relaxed">
            Support workspace strictly masks operator contact information and hides citizen document payloads, government ID numbers, photos, and payment gateway credentials in compliance with data privacy mandates.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs hover:underline opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
        <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Operator Name, Email, or Phone number..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </form>

        {/* Quick Results List */}
        {searchResults.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Matching Operators ({searchResults.length})
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map((op) => (
                <button
                  key={op.id}
                  onClick={() => loadProfile(op.id)}
                  className={`p-3 rounded-xl border text-left transition-colors flex items-center justify-between ${
                    selectedOperatorId === op.id
                      ? 'bg-indigo-950/40 border-indigo-500/60'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-white text-xs">{op.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{op.maskedEmail}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{op.maskedPhone}</p>
                  </div>
                  <Eye className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Operator Detail Workspace */}
      {profileLoading ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Loading masked operator support profile...</p>
        </div>
      ) : profile ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Identity & Wallet Header */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">{profile.operator.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {profile.operator.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                <span>Email: <strong className="text-slate-300">{profile.operator.maskedEmail}</strong></span>
                <span>•</span>
                <span>Phone: <strong className="text-slate-300">{profile.operator.maskedPhone}</strong></span>
                <span>•</span>
                <span>Operator ID: <strong className="text-slate-300">{profile.operator.id}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shrink-0">
              <Wallet className="w-6 h-6 text-indigo-400" />
              <div>
                <p className="text-[10px] uppercase font-mono text-slate-400">Current Balance</p>
                <p className="text-xl font-bold font-mono text-emerald-400">
                  ₹{Number(profile.walletSummary.balance).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sanitized Wallet Ledger */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-400" />
                Sanitized Ledger Transactions (Recent 10)
              </h3>

              {profile.walletSummary.recentTransactions.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No transaction records</p>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {profile.walletSummary.recentTransactions.map((tx: any, idx: number) => {
                    const isCredit = tx.type === 'credit';
                    return (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-200">{tx.description}</p>
                          <p className="text-[10px] font-mono text-slate-500">
                            REF: {tx.referenceId} • {new Date(tx.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`font-mono font-bold ${
                            isCredit ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {isCredit ? '+' : '-'}₹{tx.amount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Payments & Support Tickets */}
            <div className="space-y-6">
              {/* Payment Records */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-rose-400" />
                  Recent Recharge Payments
                </h3>

                {profile.recentPayments.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No payment history</p>
                ) : (
                  <div className="space-y-2">
                    {profile.recentPayments.map((p: any) => (
                      <div
                        key={p.orderId}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-mono font-semibold text-white">{p.orderId}</p>
                          <p className="text-[10px] font-mono text-slate-500">UTR: {p.bankTxnId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-emerald-400">₹{p.amount.toFixed(2)}</p>
                          <span
                            className={`inline-block text-[10px] font-mono uppercase font-bold ${
                              p.status === 'SUCCESS' ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tickets */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-cyan-400" />
                    Operator Support Tickets
                  </h3>
                  <Link
                    href={`/support/tickets?search=${profile.operator.id}`}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                {profile.existingTickets.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No active support tickets</p>
                ) : (
                  <div className="space-y-2">
                    {profile.existingTickets.map((t: any) => (
                      <div
                        key={t.ticketId}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-white">{t.subject}</p>
                          <p className="text-[10px] font-mono text-slate-500">
                            {t.ticketId} • {t.category}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
