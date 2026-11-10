'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Loader2,
  RefreshCw,
  Gift,
  Calendar,
  AlertCircle,
  Percent,
} from 'lucide-react';
import {
  getAdminCampaigns,
  createAdminCampaign,
  toggleCampaignStatus,
} from '@/actions/admin';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [minRechargeAmount, setMinRechargeAmount] = useState('249');
  const [slabAmount, setSlabAmount] = useState('249');
  const [bonusPerSlab, setBonusPerSlab] = useState('50');
  const [maxBonusPerOperator, setMaxBonusPerOperator] = useState('1000');
  const [totalBudget, setTotalBudget] = useState('100000');

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await getAdminCampaigns();
      setCampaigns(data);
    } catch (err: any) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleToggle = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setTogglingId(campaignId);
    try {
      await toggleCampaignStatus(campaignId, newStatus);
      setFeedback({ type: 'success', message: `Campaign status updated to ${newStatus}` });
      await fetchCampaigns();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update campaign status' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      await createAdminCampaign({
        name,
        code,
        description,
        startDate,
        endDate,
        minRechargeAmount: Number(minRechargeAmount),
        slabAmount: Number(slabAmount),
        bonusPerSlab: Number(bonusPerSlab),
        maxBonusPerOperator: Number(maxBonusPerOperator),
        totalBudget: Number(totalBudget),
      });

      setFeedback({ type: 'success', message: 'Promotional campaign created successfully!' });
      setShowCreateModal(false);
      // Reset form
      setName('');
      setCode('');
      setDescription('');
      await fetchCampaigns();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create campaign' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-purple-400" />
            Promotional Campaigns & Recharge Bonuses
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure automated wallet credit incentives, promotional recharge slabs, and budget caps.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium text-xs shadow-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create Campaign
          </button>
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

      {/* Featured Banner: Launch Bonus */}
      <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Primary Promotional Engine
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Accero Launch Offer: ₹249 + ₹50 Bonus</h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Every ₹249 recharge slab automatically grants operators ₹50 in non-withdrawable promotional credit directly into their wallet. Multi-slab recharges scale proportionally (e.g. ₹498 recharge receives ₹100 bonus).
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 shrink-0 flex items-center gap-6">
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-400">Slab Trigger</p>
              <p className="text-lg font-bold text-white">₹249</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <p className="text-[10px] uppercase font-mono text-purple-400">Bonus Added</p>
              <p className="text-lg font-bold text-emerald-400">+₹50</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <p className="text-[10px] uppercase font-mono text-slate-400">Operator Cap</p>
              <p className="text-lg font-bold text-slate-300">₹1,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Loading campaign configurations...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-16 text-center">
          <Gift className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Campaigns Configured</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create a promotional campaign to incentivize operators to maintain active wallet balances.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((camp) => {
            const budgetPercent = camp.totalBudget > 0 ? Math.min(100, Math.round((camp.budgetSpent / camp.totalBudget) * 100)) : 0;
            const isToggling = togglingId === camp.id;

            return (
              <div
                key={camp.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-white text-base tracking-tight">{camp.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                            camp.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : camp.status === 'DEPLETED'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {camp.status}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-purple-400 mt-0.5">CODE: {camp.code}</p>
                    </div>

                    <button
                      onClick={() => handleToggle(camp.id, camp.status)}
                      disabled={isToggling || camp.status === 'DEPLETED'}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                        camp.status === 'ACTIVE'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                      }`}
                    >
                      {isToggling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : camp.status === 'ACTIVE' ? 'Pause Campaign' : 'Activate'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">{camp.description}</p>

                  {/* Slab Rule Summary */}
                  <div className="grid grid-cols-3 gap-3 my-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-center">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-mono">Slab Unit</span>
                      <p className="text-sm font-bold text-white">₹{camp.slabAmount}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-mono">Bonus Added</span>
                      <p className="text-sm font-bold text-emerald-400">+₹{camp.bonusPerSlab}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-mono">Max Cap</span>
                      <p className="text-sm font-bold text-slate-300">₹{camp.maxBonusPerOperator}</p>
                    </div>
                  </div>

                  {/* Budget & Redemption Progress */}
                  <div className="space-y-1.5 mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Budget Spent</span>
                      <span className="font-mono text-white">
                        ₹{camp.budgetSpent.toLocaleString()} / ₹{camp.totalBudget.toLocaleString()} ({budgetPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          budgetPercent > 90 ? 'bg-rose-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${budgetPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 mt-5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Valid: {new Date(camp.startDate).toLocaleDateString()} — {new Date(camp.endDate).toLocaleDateString()}
                  </span>
                  <span className="font-mono text-purple-300">
                    {camp.totalRedemptions} redemptions
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-400" />
                Create Promotional Campaign
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Summer Recharge Fest"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Promo Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. FEST_50"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the promotional bonus rules and terms clearly..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Slab Amount (₹)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={slabAmount}
                    onChange={(e) => setSlabAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Bonus per Slab (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bonusPerSlab}
                    onChange={(e) => setBonusPerSlab(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Max Cap/User (₹)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={maxBonusPerOperator}
                    onChange={(e) => setMaxBonusPerOperator(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Total Promotional Budget (₹) *</label>
                <input
                  type="number"
                  min="500"
                  required
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
