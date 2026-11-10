'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Ticket,
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
  Search,
  Download,
  Trash2,
  Edit2,
  Users,
  Wallet,
  TrendingUp,
  BarChart3,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import {
  getAdminPromoCodesAction,
  createPromoCodeAction,
  updatePromoCodeAction,
  deletePromoCodeAction,
  togglePromoCodeStatusAction,
  getPromoRedemptionsAction,
  getPromoAnalyticsAction,
  PromoCodeInput,
} from '@/actions/promo';
import { PromoDiscountType } from '@/models/PromoCode';

export default function AdminPromoCodesPage() {
  const [activeTab, setActiveTab] = useState<'codes' | 'redemptions'>('codes');
  const [loading, setLoading] = useState<boolean>(true);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [totalCodes, setTotalCodes] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Redemptions state
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [totalRedemptions, setTotalRedemptions] = useState<number>(0);
  const [redemptionPage, setRedemptionPage] = useState<number>(1);
  const [selectedPromoForRedemptions, setSelectedPromoForRedemptions] = useState<string | null>(null);

  // Analytics State
  const [analytics, setAnalytics] = useState<{
    totalPromoCodes: number;
    activePromoCodes: number;
    totalRedemptions: number;
    totalPromotionalExpenditure: number;
    totalAttributedRevenue: number;
    newOperatorsAcquired: number;
    repeatRechargeRate: number;
    conversionRate: number;
  } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState<string>('');
  const [campaignName, setCampaignName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [discountType, setDiscountType] = useState<PromoDiscountType>('FIXED_BONUS');
  const [discountValue, setDiscountValue] = useState<string>('50');
  const [minRechargeAmount, setMinRechargeAmount] = useState<string>('249');
  const [maximumBonus, setMaximumBonus] = useState<string>('0');
  const [totalRedemptionLimit, setTotalRedemptionLimit] = useState<string>('0');
  const [perUserRedemptionLimit, setPerUserRedemptionLimit] = useState<string>('1');
  const [totalBudget, setTotalBudget] = useState<string>('50000');
  const [applicableUsers, setApplicableUsers] = useState<string>('');
  const [firstRechargeOnly, setFirstRechargeOnly] = useState<boolean>(false);
  const [startsAt, setStartsAt] = useState<string>(() => new Date().toISOString().slice(0, 16));
  const [expiresAt, setExpiresAt] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().slice(0, 16);
  });
  const [isActive, setIsActive] = useState<boolean>(true);

  // Fetch Promo Codes
  const fetchPromoCodes = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const res = await getAdminPromoCodesAction({
          search: searchQuery,
          status: statusFilter,
          page,
          limit: 15,
        });
        if (res.success) {
          setPromoCodes(res.promoCodes);
          setTotalCodes(res.total);
          return;
        }
      } catch (actionErr: any) {
        // Fallback to REST endpoint
        const params = new URLSearchParams({
          page: String(page),
          limit: '15',
        });
        if (searchQuery) params.set('search', searchQuery);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        const res = await fetch(`/api/admin/promo-codes?${params.toString()}`);
        const data = await res.json();
        if (data.success && data.promoCodes) {
          setPromoCodes(data.promoCodes);
          setTotalCodes(data.total);
          return;
        }
        throw actionErr;
      }
    } catch (err: any) {
      console.error('Error fetching promo codes:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, page]);

  // Fetch Redemptions
  const fetchRedemptions = useCallback(async () => {
    try {
      const res = await getPromoRedemptionsAction({
        promoCodeId: selectedPromoForRedemptions || undefined,
        page: redemptionPage,
        limit: 15,
      });
      if (res.success) {
        setRedemptions(res.redemptions);
        setTotalRedemptions(res.total);
      }
    } catch (err: any) {
      console.error('Error fetching redemptions:', err);
    }
  }, [selectedPromoForRedemptions, redemptionPage]);

  // Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await getPromoAnalyticsAction();
      if (res.success) {
        setAnalytics(res.analytics);
      }
    } catch (err) {
      console.error('Error fetching promo analytics:', err);
    }
  }, []);

  useEffect(() => {
    fetchPromoCodes();
    fetchAnalytics();
  }, [fetchPromoCodes, fetchAnalytics]);

  useEffect(() => {
    if (activeTab === 'redemptions') {
      fetchRedemptions();
    }
  }, [activeTab, fetchRedemptions]);

  // Handle Toggle Active/Inactive
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setActionLoadingId(id);
    try {
      let res: any;
      try {
        res = await togglePromoCodeStatusAction(id, !currentStatus);
      } catch {
        const patchRes = await fetch('/api/admin/promo-codes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action: 'toggle-status', isActive: !currentStatus }),
        });
        res = await patchRes.json();
      }

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Promo code status set to ${!currentStatus ? 'Active' : 'Inactive'}.`,
        });
        await fetchPromoCodes();
        await fetchAnalytics();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to toggle status' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error updating status' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete Promo Code
  const handleDelete = async (id: string, codeName: string) => {
    if (!confirm(`Are you sure you want to delete unused promo code "${codeName}"?`)) {
      return;
    }

    setActionLoadingId(id);
    try {
      let res: any;
      try {
        res = await deletePromoCodeAction(id);
      } catch {
        const delRes = await fetch(`/api/admin/promo-codes?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        res = await delRes.json();
      }

      if (res.success) {
        setFeedback({ type: 'success', message: `Promo code "${codeName}" deleted successfully.` });
        await fetchPromoCodes();
        await fetchAnalytics();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete promo code' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error deleting promo code' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingPromoId(null);
    setCode('');
    setCampaignName('');
    setDescription('');
    setDiscountType('FIXED_BONUS');
    setDiscountValue('50');
    setMinRechargeAmount('249');
    setMaximumBonus('0');
    setTotalRedemptionLimit('0');
    setPerUserRedemptionLimit('1');
    setTotalBudget('50000');
    setApplicableUsers('');
    setFirstRechargeOnly(false);
    setStartsAt(new Date().toISOString().slice(0, 16));
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    setExpiresAt(d.toISOString().slice(0, 16));
    setIsActive(true);
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (p: any) => {
    setEditingPromoId(p.id);
    setCode(p.code);
    setCampaignName(p.campaignName);
    setDescription(p.description || '');
    setDiscountType(p.discountType);
    setDiscountValue(String(p.discountValue));
    setMinRechargeAmount(String(p.minimumRechargeAmount || 0));
    setMaximumBonus(String(p.maximumBonus || 0));
    setTotalRedemptionLimit(String(p.totalRedemptionLimit || 0));
    setPerUserRedemptionLimit(String(p.perUserRedemptionLimit || 1));
    setTotalBudget(String(p.totalBudget || 0));
    setApplicableUsers(
      (p.applicableUsers || []).map((u: any) => u.email || u.id || u).join(', ')
    );
    setFirstRechargeOnly(!!p.firstRechargeOnly);
    setStartsAt(p.startsAt ? new Date(p.startsAt).toISOString().slice(0, 16) : '');
    setExpiresAt(p.expiresAt ? new Date(p.expiresAt).toISOString().slice(0, 16) : '');
    setIsActive(p.isActive);
    setShowModal(true);
  };

  // Handle Create or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const usersList = applicableUsers
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: PromoCodeInput = {
        code: code.trim().toUpperCase(),
        campaignName: campaignName.trim(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        minimumRechargeAmount: Number(minRechargeAmount),
        maximumBonus: Number(maximumBonus),
        totalRedemptionLimit: Number(totalRedemptionLimit),
        perUserRedemptionLimit: Number(perUserRedemptionLimit),
        totalBudget: Number(totalBudget),
        applicableUsers: usersList,
        firstRechargeOnly,
        startsAt,
        expiresAt,
        isActive,
      };

      if (editingPromoId) {
        let res: any;
        try {
          res = await updatePromoCodeAction(editingPromoId, payload);
        } catch {
          const patchRes = await fetch('/api/admin/promo-codes', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingPromoId, ...payload }),
          });
          res = await patchRes.json();
        }

        if (res.success) {
          setFeedback({ type: 'success', message: 'Promo code updated successfully!' });
          setShowModal(false);
          await fetchPromoCodes();
          await fetchAnalytics();
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to update promo code' });
        }
      } else {
        let res: any;
        try {
          res = await createPromoCodeAction(payload);
        } catch {
          const postRes = await fetch('/api/admin/promo-codes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          res = await postRes.json();
        }

        if (res.success) {
          setFeedback({ type: 'success', message: 'Promo code created successfully!' });
          setShowModal(false);
          await fetchPromoCodes();
          await fetchAnalytics();
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to create promo code' });
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error saving promo code' });
    } finally {
      setSubmitting(false);
    }
  };

  const getDiscountTypeBadge = (type: PromoDiscountType) => {
    switch (type) {
      case 'FIXED_BONUS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">Fixed Bonus</span>;
      case 'PERCENTAGE_BONUS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Percentage Bonus</span>;
      case 'FIXED_DISCOUNT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Fixed Discount</span>;
      case 'FIRST_RECHARGE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">First Recharge</span>;
      case 'USER_SPECIFIC':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">User Specific</span>;
      case 'REFERRAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">Referral</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-pink-400" />
            Promo Codes &amp; Coupon Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, manage, and audit promotional codes, recharge discounts, and operator acquisition campaigns.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchPromoCodes();
              fetchAnalytics();
              if (activeTab === 'redemptions') fetchRedemptions();
            }}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export CSV Dropdown */}
          <div className="flex items-center gap-1.5">
            <a
              href="/api/admin/promo-codes/export?type=campaigns"
              download
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium text-xs transition-colors"
              title="Download Campaigns CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Codes</span>
            </a>
            <a
              href="/api/admin/promo-codes/export?type=redemptions"
              download
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium text-xs transition-colors"
              title="Download Redemptions CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Redemptions</span>
            </a>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white rounded-xl font-bold text-xs shadow-lg shadow-pink-900/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Promo Code</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between animate-in fade-in ${feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs hover:underline opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* 11.7 Campaign Analytics Dashboard Grid */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Metric 1: Total Codes & Active */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Campaign Codes</span>
              <Ticket className="w-4 h-4 text-pink-400" />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-white">{analytics.totalPromoCodes}</span>
              <span className="text-xs text-emerald-400 font-bold">({analytics.activePromoCodes} Active)</span>
            </div>
            <p className="text-[11px] text-slate-500">Total created promo campaigns</p>
          </div>

          {/* Metric 2: Total Redemptions & Conversion */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Total Redemptions</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-white">{analytics.totalRedemptions}</span>
              <span className="text-xs text-cyan-400 font-bold">{analytics.conversionRate}% conv.</span>
            </div>
            <p className="text-[11px] text-slate-500">Completed coupon claims</p>
          </div>

          {/* Metric 3: Promotional Expenditure vs Attributed Revenue */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Attributed Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-emerald-400">
                ₹{analytics.totalAttributedRevenue.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Expended: ₹{analytics.totalPromotionalExpenditure.toLocaleString('en-IN')} bonus
            </p>
          </div>

          {/* Metric 4: New Operators & Repeat Rate */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Acquired Operators</span>
              <Users className="w-4 h-4 text-[#F4D35E]" />
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-black text-white">{analytics.newOperatorsAcquired}</span>
              <span className="text-xs text-purple-400 font-bold">{analytics.repeatRechargeRate}% repeat</span>
            </div>
            <p className="text-[11px] text-slate-500">Unique operators claiming promos</p>
          </div>
        </div>
      )}

      {/* Tabs Switcher: Codes vs Redemptions */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('codes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'codes'
                ? 'bg-slate-800 text-white shadow border border-slate-700'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            Promo Codes &amp; Campaigns ({totalCodes})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('redemptions');
              setSelectedPromoForRedemptions(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'redemptions'
                ? 'bg-slate-800 text-white shadow border border-slate-700'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            Redemption History ({analytics?.totalRedemptions || redemptions.length})
          </button>
        </div>

        {activeTab === 'codes' && (
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search code or campaign..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Promo Codes Table */}
      {activeTab === 'codes' && (
        <div className="space-y-4">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Code &amp; Campaign</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Benefit</th>
                    <th className="p-4">Min Recharge</th>
                    <th className="p-4">Redemptions</th>
                    <th className="p-4">Budget &amp; Spend</th>
                    <th className="p-4">Validity</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-pink-400" />
                          <span>Loading promo codes...</span>
                        </div>
                      </td>
                    </tr>
                  ) : promoCodes.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No promotional codes found. Click &quot;Create Promo Code&quot; to launch your first campaign.
                      </td>
                    </tr>
                  ) : (
                    promoCodes.map((p) => {
                      const isExpired = p.expiresAt && new Date(p.expiresAt) < new Date();
                      const budgetPercent = p.totalBudget > 0
                        ? Math.min(100, Math.round((p.budgetSpent / p.totalBudget) * 100))
                        : 0;

                      return (
                        <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm text-pink-400 tracking-wider bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                                {p.code}
                              </span>
                            </div>
                            <p className="font-bold text-white mt-1">{p.campaignName}</p>
                            {p.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{p.description}</p>
                            )}
                          </td>
                          <td className="p-4">{getDiscountTypeBadge(p.discountType)}</td>
                          <td className="p-4">
                            <span className="text-white font-black text-sm">
                              {p.discountType === 'PERCENTAGE_BONUS' ? `${p.discountValue}%` : `₹${p.discountValue}`}
                            </span>
                            {p.maximumBonus > 0 && (
                              <span className="text-[10px] text-slate-400 block">Cap: ₹{p.maximumBonus}</span>
                            )}
                          </td>
                          <td className="p-4 text-slate-300 font-bold">
                            ₹{p.minimumRechargeAmount || 0}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white">{p.totalRedeemed}</span>
                              {p.totalRedemptionLimit > 0 && (
                                <span className="text-[11px] text-slate-400">/ {p.totalRedemptionLimit}</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block">
                              Max {p.perUserRedemptionLimit}/user
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1 min-w-[100px]">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-slate-400 font-mono">₹{p.budgetSpent}</span>
                                <span className="text-slate-500 font-mono">
                                  {p.totalBudget > 0 ? `₹${p.totalBudget}` : '∞'}
                                </span>
                              </div>
                              {p.totalBudget > 0 && (
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${budgetPercent >= 90 ? 'bg-rose-500' : 'bg-emerald-500'
                                      }`}
                                    style={{ width: `${budgetPercent}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-[11px] text-slate-300 block">
                              {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString('en-IN') : 'Never'}
                            </span>
                            {isExpired && (
                              <span className="text-[10px] font-bold text-rose-400">Expired</span>
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(p.id, p.isActive)}
                              disabled={actionLoadingId === p.id}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all ${p.isActive
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                                }`}
                            >
                              {p.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPromoForRedemptions(p.id);
                                  setActiveTab('redemptions');
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                                title="View redemptions"
                              >
                                <Users className="w-3.5 h-3.5 text-cyan-400" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditModal(p)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                                title="Edit code"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(p.id, p.code)}
                                disabled={p.totalRedeemed > 0 || actionLoadingId === p.id}
                                className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title={
                                  p.totalRedeemed > 0
                                    ? 'Cannot delete redeemed code (audit protected)'
                                    : 'Delete unused code'
                                }
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Redemption History Table */}
      {activeTab === 'redemptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Filter:</span>
              {selectedPromoForRedemptions ? (
                <span className="px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/30 font-mono font-bold flex items-center gap-1.5">
                  Filtered by Promo
                  <button
                    type="button"
                    onClick={() => setSelectedPromoForRedemptions(null)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : (
                <span className="text-slate-300 font-medium">All Redemptions</span>
              )}
            </div>
            <span>Total Logged: {totalRedemptions}</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Operator</th>
                    <th className="p-4">Promo Code</th>
                    <th className="p-4">Payment Order ID</th>
                    <th className="p-4">Recharge</th>
                    <th className="p-4">Bonus / Discount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Redeemed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {redemptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No redemptions found for this filter.
                      </td>
                    </tr>
                  ) : (
                    redemptions.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-white">{r.operatorName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{r.operatorEmail || r.operatorPhone || 'N/A'}</p>
                        </td>
                        <td className="p-4">
                          <span className="font-mono font-bold text-pink-400 px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">
                            {r.code}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{r.campaignName}</span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-300">{r.paymentId}</td>
                        <td className="p-4 font-bold text-white">₹{r.rechargeAmount.toFixed(2)}</td>
                        <td className="p-4 font-bold text-emerald-400">
                          {r.discountAmount > 0 ? `₹${r.discountAmount.toFixed(2)} (Disc)` : `+₹${r.bonusAmount.toFixed(2)}`}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${r.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : r.status === 'APPLIED'
                                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-[11px]">
                          {r.redeemedAt ? new Date(r.redeemedAt).toLocaleString('en-IN') : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Promo Code Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <Ticket className="w-5 h-5 text-pink-400" />
                <h2 className="text-lg font-bold text-white">
                  {editingPromoId ? 'Edit Promo Code' : 'Create New Promo Code'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingPromoId}
                    placeholder="e.g. LAUNCH50"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono uppercase font-bold text-sm focus:outline-none focus:border-pink-500 disabled:opacity-60"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Unique uppercase redemption code</p>
                </div>

                {/* Campaign Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diwali Topup Mega Bonus"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Campaign Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional operator notes or promotion terms..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 11.2 Promo Code Types */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Promo Code Type *
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-pink-500"
                  >
                    <option value="FIXED_BONUS">1. FIXED_BONUS (₹ extra credit)</option>
                    <option value="PERCENTAGE_BONUS">2. PERCENTAGE_BONUS (% extra credit)</option>
                    <option value="FIXED_DISCOUNT">3. FIXED_DISCOUNT (Pay less on recharge)</option>
                    <option value="FIRST_RECHARGE">4. FIRST_RECHARGE (1st recharge only)</option>
                    <option value="USER_SPECIFIC">5. USER_SPECIFIC (Restricted to specific users)</option>
                    <option value="REFERRAL">6. REFERRAL (Referral reward)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Benefit Value ({discountType === 'PERCENTAGE_BONUS' ? '%' : '₹'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Min Recharge Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Min Recharge (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minRechargeAmount}
                    onChange={(e) => setMinRechargeAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>

                {/* Maximum Bonus Benefit Cap */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Max Bonus Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = No Cap"
                    value={maximumBonus}
                    onChange={(e) => setMaximumBonus(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>

                {/* Per-User Redemption Limit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Per User Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={perUserRedemptionLimit}
                    onChange={(e) => setPerUserRedemptionLimit(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Total Redemption Limit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Total Redemption Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = Unlimited"
                    value={totalRedemptionLimit}
                    onChange={(e) => setTotalRedemptionLimit(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>

                {/* Total Campaign Budget */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Total Budget (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = Unlimited"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Eligible Operators (Applicable Users) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Eligible Operators (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter operator emails or User IDs separated by commas (leave blank for all operators)"
                  value={applicableUsers}
                  onChange={(e) => setApplicableUsers(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Start Date &amp; Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Expiry Date &amp; Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={firstRechargeOnly}
                    onChange={(e) => setFirstRechargeOnly(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-pink-500 focus:ring-pink-500"
                  />
                  <span className="text-xs text-slate-300 font-semibold">
                    First Recharge Only
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-pink-500 focus:ring-pink-500"
                  />
                  <span className="text-xs text-slate-300 font-semibold">
                    Active Immediately
                  </span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingPromoId ? 'Save Changes' : 'Create Promo Code'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

