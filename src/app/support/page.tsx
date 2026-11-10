'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Headphones,
  Ticket,
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
  ChevronRight,
  Loader2,
  RefreshCw,
  Flame,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { getSupportOverviewMetrics } from '@/actions/support';

export default function SupportOverviewPage() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await getSupportOverviewMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load support metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Headphones className="w-6 h-6 text-emerald-400" />
            Customer Support Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time ticket queue status, agent workload metrics, and SLA breach indicators.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/support/tickets"
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors"
          >
            <Ticket className="w-4 h-4" />
            Open Ticket Queue
          </Link>
        </div>
      </div>

      {loading || !metrics ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Loading support operations data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Urgent SLA Alert Banner if overdue or escalated */}
          {(metrics.tickets.overdue > 0 || metrics.tickets.escalated > 0) && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-rose-200 text-sm">Action Required: Attention Needed</p>
                  <p className="text-xs text-rose-300/80">
                    There are <strong>{metrics.tickets.escalated}</strong> escalated tickets and{' '}
                    <strong>{metrics.tickets.overdue}</strong> tickets exceeding the 24-hour initial SLA.
                  </p>
                </div>
              </div>
              <Link
                href="/support/tickets?priority=URGENT"
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
              >
                Review Urgent
              </Link>
            </div>
          )}

          {/* Ticket KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Active Queue</span>
              <p className="text-3xl font-bold font-mono text-white">{metrics.tickets.totalOpen}</p>
              <p className="text-xs text-slate-500">Unresolved tickets in pipeline</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">New / Unassigned</span>
              <p className="text-3xl font-bold font-mono text-cyan-400">{metrics.tickets.new}</p>
              <p className="text-xs text-slate-500">Awaiting triage & assignment</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">In Progress</span>
              <p className="text-3xl font-bold font-mono text-indigo-400">{metrics.tickets.inProgress}</p>
              <p className="text-xs text-slate-500">Under agent investigation</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Resolved & Closed</span>
              <p className="text-3xl font-bold font-mono text-emerald-400">
                {metrics.tickets.resolved + metrics.tickets.closed}
              </p>
              <p className="text-xs text-slate-500">Successfully closed cases</p>
            </div>
          </div>

          {/* Workload & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Workload */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Support Staff Workload
              </h2>

              {metrics.workload.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No active assignments</p>
              ) : (
                <div className="space-y-3">
                  {metrics.workload.map((w: any) => (
                    <div
                      key={w.agent}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                          {w.agent.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-white">{w.agent}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-300">
                        {w.count} active tickets
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Distribution */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Ticket className="w-4 h-4 text-cyan-400" />
                Ticket Categories
              </h2>

              {metrics.categories.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No categories recorded</p>
              ) : (
                <div className="space-y-3">
                  {metrics.categories.map((c: any) => (
                    <div
                      key={c.category}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
                    >
                      <span className="text-xs font-medium text-slate-200">{c.category}</span>
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {c.count} tickets
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
