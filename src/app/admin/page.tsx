import React from 'react';
import Link from 'next/link';
import { getAdminOverviewMetrics } from '@/actions/admin';
import {
  Users,
  Wallet,
  TrendingUp,
  Printer,
  Search,
  Headphones,
  Tag,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const metrics = await getAdminOverviewMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform metrics, financial liabilities, and operational throughput.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/finance"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5 text-blue-400" />
            <span>Manage Ledger</span>
          </Link>
          <Link
            href="/admin/operators"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] hover:opacity-90 text-xs font-bold text-white shadow flex items-center gap-1.5 transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span>View Operators</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Total Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{metrics.finance.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span>Today: ₹{metrics.finance.todayRevenue.toFixed(2)}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Month: ₹{metrics.finance.monthlyRevenue.toFixed(2)}</span>
          </div>
        </div>

        {/* Wallet Balance Liability */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Wallet Liability</span>
            <div className="p-2 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-800/40">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ₹{metrics.finance.totalWalletLiability.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400">
            Deductions: ₹{metrics.finance.totalWalletDeductions.toFixed(2)}
          </div>
        </div>

        {/* Registered Operators */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Registered Operators</span>
            <div className="p-2 rounded-lg bg-purple-950/60 text-purple-400 border border-purple-800/40">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{metrics.operators.total}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">{metrics.operators.active} Active</span>
            {metrics.operators.suspended > 0 && (
              <span className="text-rose-400 font-semibold">({metrics.operators.suspended} Suspended)</span>
            )}
          </div>
        </div>

        {/* Card Prints & Reprints */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Print Volume</span>
            <div className="p-2 rounded-lg bg-amber-950/60 text-[#F4D35E] border border-amber-800/40">
              <Printer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {metrics.operations.totalSuccessfulPrints}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <span>Free Reprints: {metrics.operations.totalReprints}</span>
            <span className="text-slate-500">•</span>
            <span>Lookups: {metrics.operations.totalLookups}</span>
          </div>
        </div>
      </div>

      {/* Secondary Operational Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Outstanding Support Tickets</span>
            <p className="text-lg font-bold text-amber-400">{metrics.operations.outstandingTickets}</p>
          </div>
          <Link
            href="/support/tickets"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <span>Resolve</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Pending Manual UTRs</span>
            <p className="text-lg font-bold text-blue-400">{metrics.finance.pendingManualUtrs}</p>
          </div>
          <Link
            href="/admin/finance"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <span>Audit</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Promotional Bonus Credits</span>
            <p className="text-lg font-bold text-purple-400">
              ₹{metrics.finance.totalPromotionalBonus.toFixed(2)}
            </p>
          </div>
          <Link
            href="/admin/campaigns"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <span>Campaigns</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Revenue Trend & Service Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Revenue Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                7-Day Revenue Activity
              </h2>
              <p className="text-xs text-slate-400">Verified recharge transactions</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
              Live DB Aggregation
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {metrics.trends.dailyRevenue.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No revenue recorded in the last 7 days.
              </div>
            ) : (
              metrics.trends.dailyRevenue.map((d) => (
                <div key={d.date} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-mono">{d.date}</span>
                    <span className="text-emerald-400 font-bold">
                      ₹{d.revenue.toFixed(2)} ({d.count} recharges)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(8, (d.revenue / (metrics.finance.totalRevenue || 1)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Service Usage Breakdown */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Document Service Usage
            </h2>
            <p className="text-xs text-slate-400">Throughput by document type</p>
          </div>

          <div className="space-y-3">
            {metrics.trends.serviceUsage.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No document records found.</div>
            ) : (
              metrics.trends.serviceUsage.map((s) => (
                <div
                  key={s.service}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{s.service}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-300 font-semibold">{s.lookups} Lookups</span>
                    <span className="text-slate-500 mx-1.5">•</span>
                    <span className="text-[#F4D35E] font-semibold">{s.prints} Prints</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
