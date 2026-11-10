'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  CreditCard,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { getAdminOverviewMetrics, exportFinancialReportCsv } from '@/actions/admin';

export default function AdminReportsPage() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Date filters
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await getAdminOverviewMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const csvData = await exportFinancialReportCsv(dateFrom, dateTo);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `accero_financial_report_${dateFrom}_to_${dateTo}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Financial Reports & Data Exports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Reconciled revenue metrics, payment gateway settlement summaries, and audit-compliant CSV downloads.
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          disabled={loading}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700 self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Date Range & Export Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Export Reconciled Financial Ledger (CSV)
          </div>
          <p className="text-xs text-slate-400">
            Generate an immutable CSV containing all verified orders, bank transaction references, and operator IDs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs">
            <span className="text-slate-500">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent text-white focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs">
            <span className="text-slate-500">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent text-white focus:outline-none"
            />
          </div>
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      {loading || !metrics ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Computing financial summaries from MongoDB ledger...</p>
        </div>
      ) : (
        (() => {
          const revenueTotal = Number(metrics.revenue?.total ?? metrics.finance?.totalRevenue ?? 0);
          const revenueToday = Number(metrics.revenue?.today ?? metrics.finance?.todayRevenue ?? 0);
          const revenueMonth = Number(metrics.revenue?.thisMonth ?? metrics.finance?.monthlyRevenue ?? 0);
          const revenuePending = Number(metrics.revenue?.pending ?? metrics.finance?.pendingManualUtrs ?? 0);
          const serviceList = Array.isArray(metrics.serviceUsage)
            ? metrics.serviceUsage
            : Array.isArray(metrics.trends?.serviceUsage)
            ? metrics.trends.serviceUsage.map((s: any) => ({
                docType: s.service || s.docType || 'OTHER',
                count: s.lookups ?? s.count ?? 0,
                prints: s.prints ?? 0,
              }))
            : [];

          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Net Revenue</span>
                  <p className="text-2xl font-bold font-mono text-emerald-400">
                    ₹{revenueTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-500">Verified payment gateway deposits</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Today's Revenue</span>
                  <p className="text-2xl font-bold font-mono text-white">
                    ₹{revenueToday.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-emerald-400/80 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Live day settlements
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Monthly Volume</span>
                  <p className="text-2xl font-bold font-mono text-cyan-400">
                    ₹{revenueMonth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-500">Current calendar month total</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Pending Settlements</span>
                  <p className="text-2xl font-bold font-mono text-amber-400">
                    ₹{revenuePending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-500">In bank reconciliation queue</p>
                </div>
              </div>

              {/* Service Volume Breakdown */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Service Processing Volume & Print Revenue
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                  {serviceList.map((svc: any) => (
                    <div key={svc.docType} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                      <span className="text-xs font-mono font-bold text-white">{svc.docType}</span>
                      <div className="text-lg font-bold text-cyan-300 font-mono">{svc.count}</div>
                      <p className="text-[11px] text-slate-400 font-mono">{svc.prints} PVC prints</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
