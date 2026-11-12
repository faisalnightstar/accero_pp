'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gift,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Settings,
  RefreshCw,
  Sliders,
  DollarSign,
  Users,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  Check,
} from 'lucide-react';
import {
  getAdminReferralsAction,
  updateAdminReferralStatusAction,
  getAdminReferralConfigAction,
  saveAdminReferralConfigAction,
  getAdminReferralAnalyticsAction,
} from '@/actions/referral';

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Analytics
  const [analytics, setAnalytics] = useState<any>({
    totalReferrals: 0,
    rewardedReferrals: 0,
    pendingReferrals: 0,
    rejectedReferrals: 0,
    totalRewardsPaid: 0,
    totalAttributedRevenue: 0,
    conversionRate: 0,
  });

  // Config Modal
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState<any>({
    rewardPerReferral: 50,
    firstRechargeThreshold: 249,
    welcomeRewardReferred: 50,
    maxReferralsPerUser: 100,
    isActive: true,
    terms: '',
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // Status Action Modal (Reject / Reverse)
  const [selectedReferral, setSelectedReferral] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'REJECT' | 'REVERSE' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes, cfgRes] = await Promise.all([
        getAdminReferralsAction({
          page,
          limit: 15,
          status: statusFilter,
          search: searchQuery,
        }),
        getAdminReferralAnalyticsAction(),
        getAdminReferralConfigAction(),
      ]);

      if (listRes.success) {
        setReferrals(listRes.referrals || []);
        setTotalCount(listRes.total || 0);
        setTotalPages(listRes.totalPages || 1);
      }

      if (statsRes.success && statsRes.analytics) {
        setAnalytics(statsRes.analytics);
      }

      if (cfgRes.success && cfgRes.config) {
        setConfig(cfgRes.config);
      }
    } catch (err) {
      console.error('Failed to load admin referrals data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve and credit this referral reward?')) return;
    try {
      await updateAdminReferralStatusAction(id, 'REWARDED');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve referral.');
    }
  };

  const handleActionConfirm = async () => {
    if (!selectedReferral || !actionType) return;
    setIsUpdatingStatus(true);
    try {
      const targetStatus = actionType === 'REJECT' ? 'REJECTED' : 'REVERSED';
      await updateAdminReferralStatusAction(selectedReferral.id, targetStatus, actionReason);
      setSelectedReferral(null);
      setActionType(null);
      setActionReason('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update referral status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await saveAdminReferralConfigAction(config);
      setIsConfigOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save configuration.');
    } finally {
      setSavingConfig(false);
    }
  };

  const exportCsv = () => {
    const headers = [
      'Referral ID',
      'Referrer Name',
      'Referrer Email',
      'Referral Code',
      'Referred Operator Name',
      'Referred Operator Email',
      'Status',
      'First Recharge Amount',
      'Payment Ref',
      'Reward Amount',
      'Created Date',
      'Rewarded Date',
      'Notes/Reason',
    ];

    const rows = referrals.map((r) => [
      r.id,
      r.referrer.name,
      r.referrer.email,
      r.referralCode,
      r.referred.name,
      r.referred.email,
      r.status,
      r.qualifyingAmount,
      r.qualifyingPaymentId,
      r.referrerReward,
      r.createdAt,
      r.rewardedDate,
      r.rejectionReason,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((cell: any) => `"${cell || ''}"`).join(','))].join(
        '\n'
      );

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `referrals-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Gift className="w-6 h-6 text-emerald-400" />
            <span>Referral & Rewards Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit operator referral links, configure reward policies, verify qualifying recharges, and
            prevent fraud.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-[#F4D35E]" />
            <span>Program Settings</span>
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Total Referrals</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {analytics.totalReferrals}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-400 font-semibold">{analytics.rewardedReferrals} rewarded</span>
            <span>•</span>
            <span className="text-amber-400">{analytics.pendingReferrals} pending</span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Rewards Paid</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
            ₹{analytics.totalRewardsPaid}
          </div>
          <span className="text-[11px] text-slate-500">Promotional wallet credits disbursed</span>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Revenue Generated</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            ₹{analytics.totalAttributedRevenue}
          </div>
          <span className="text-[11px] text-slate-500">First recharge volume from referred users</span>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Conversion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-[#F4D35E]" />
          </div>
          <div className="text-2xl font-black text-[#F4D35E] mt-2">
            {analytics.conversionRate}%
          </div>
          <span className="text-[11px] text-slate-500">Registered operators who completed recharge</span>
        </div>
      </div>

      {/* Referrals Table Container */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        {/* Table Filters & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code, referrer, or referred operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
            />
          </form>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
            >
              <option value="all">All Statuses ({totalCount})</option>
              <option value="PENDING">Pending</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="REWARDED">Rewarded</option>
              <option value="REJECTED">Rejected</option>
              <option value="REVERSED">Reversed</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Referrer</th>
                <th className="px-5 py-3.5">Code</th>
                <th className="px-5 py-3.5">Referred Operator</th>
                <th className="px-5 py-3.5">Registration</th>
                <th className="px-5 py-3.5">First Recharge</th>
                <th className="px-5 py-3.5">Reward</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading referrals...
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No referral records found matching query.
                  </td>
                </tr>
              ) : (
                referrals.map((r) => {
                  return (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Referrer */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">{r.referrer.name}</span>
                          <span className="text-[11px] text-slate-400 block">{r.referrer.email}</span>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-[#F4D35E] border border-slate-700">
                          {r.referralCode}
                        </span>
                      </td>

                      {/* Referred Operator */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block">{r.referred.name}</span>
                          <span className="text-[11px] text-slate-400 block">{r.referred.email}</span>
                        </div>
                      </td>

                      {/* Registration Date */}
                      <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>

                      {/* First Recharge */}
                      <td className="px-5 py-4">
                        {r.qualifyingAmount > 0 ? (
                          <div className="font-mono text-emerald-400 font-bold">
                            ₹{r.qualifyingAmount}
                            <span className="block text-[10px] text-slate-500 font-normal">
                              {r.qualifyingPaymentId}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">None yet</span>
                        )}
                      </td>

                      {/* Reward */}
                      <td className="px-5 py-4 font-mono font-bold text-emerald-400">
                        +₹{r.referrerReward}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {r.status === 'REWARDED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Rewarded
                          </span>
                        )}
                        {r.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                        {r.status === 'QUALIFIED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            Qualified
                          </span>
                        )}
                        {r.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                            <AlertCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                        {r.status === 'REVERSED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            Reversed
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(r.id)}
                                className="px-2 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-[10px] font-bold transition-colors"
                                title="Approve and credit reward"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedReferral(r);
                                  setActionType('REJECT');
                                }}
                                className="px-2 py-1 rounded bg-red-900/60 hover:bg-red-800 text-red-300 text-[10px] font-bold transition-colors"
                                title="Reject referral"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {r.status === 'REWARDED' && (
                            <button
                              onClick={() => {
                                setSelectedReferral(r);
                                setActionType('REVERSE');
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors"
                              title="Reverse reward"
                            >
                              Reverse
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing page {page} of {totalPages} ({totalCount} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Program Settings Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#F4D35E]" />
                <span>Referral Program Configuration</span>
              </h3>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Referrer Reward per Qualifying Operator (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={config.rewardPerReferral}
                  onChange={(e) =>
                    setConfig({ ...config, rewardPerReferral: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  First Recharge Threshold for Qualification (₹)
                </label>
                <input
                  type="number"
                  min="10"
                  required
                  value={config.firstRechargeThreshold}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      firstRechargeThreshold: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Referred Operator Welcome Bonus (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={config.welcomeRewardReferred}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      welcomeRewardReferred: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Maximum Allowed Referrals per User
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={config.maxReferralsPerUser}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxReferralsPerUser: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Terms & Conditions Summary
                </label>
                <textarea
                  rows={3}
                  value={config.terms}
                  onChange={(e) => setConfig({ ...config, terms: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-[11px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={config.isActive}
                  onChange={(e) => setConfig({ ...config, isActive: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800"
                />
                <label htmlFor="isActive" className="font-bold text-white cursor-pointer">
                  Referral Program is Active
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold"
                >
                  {savingConfig ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Modal (Reject / Reverse) */}
      {selectedReferral && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-white">
              {actionType === 'REJECT' ? 'Reject Referral' : 'Reverse Referral Reward'}
            </h3>
            <p className="text-xs text-slate-400">
              {actionType === 'REJECT'
                ? `Please provide a reason for rejecting the referral for operator ${selectedReferral.referred.name}:`
                : `Are you sure you want to reverse the ₹${selectedReferral.referrerReward} reward credited to ${selectedReferral.referrer.name}? This will debit their promotional wallet balance.`}
            </p>

            <textarea
              rows={3}
              placeholder="Reason for audit log (e.g., duplicate device detected, refund issued)..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedReferral(null);
                  setActionType(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleActionConfirm}
                disabled={isUpdatingStatus}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

