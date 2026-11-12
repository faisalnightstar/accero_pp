'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  CheckCircle2,
  Clock,
  Wallet,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { getOperatorReferralDataAction } from '@/actions/referral';
import type { OperatorReferralDashboardData } from '@/lib/referral/service';

export default function ReferAndEarnPage() {
  const [data, setData] = useState<OperatorReferralDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getOperatorReferralDataAction();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const referralCode = data?.referralCode || '...';
  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/register?ref=${referralCode}`
      : data?.referralLink || `https://printportal.accero.app/register?ref=${referralCode}`;

  const inviteMessage = `Hi! I use Accero PrintPortal to format and print official-standard PAN, Aadhaar, Voter ID, Driving License, and Vehicle RC cards directly onto physical PVC cards.

Sign up using my referral link or code to get ₹50 free wallet credits on your first recharge:
Code: ${referralCode}
Link: ${referralLink}`;

  const copyToClipboard = (text: string, type: 'code' | 'link' | 'invite') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessage)}`;
    window.open(waUrl, '_blank');
  };

  const filteredHistory = (data?.history || []).filter((item) => {
    const matchesSearch = item.operatorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-[#F4D35E]">Refer & Earn</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>Refer Operators & Earn Rewards</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ₹{data?.config.rewardPerReferral || 50} per referral
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Invite cyber cafes, retail shops, and card printing businesses to PrintPortal. Earn ₹
              {data?.config.rewardPerReferral || 50} wallet credit when they complete their first
              qualifying recharge of ₹{data?.config.firstRechargeThreshold || 249}+.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh referral metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-pink-400" />
              <span>Share Invitation</span>
            </button>
            <button
              onClick={shareOnWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Hero Card: Unique Code & Referral Link */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1D3557] via-[#0f243d] to-[#152a45] border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Code and Link Display */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Gift className="w-3.5 h-3.5" />
                <span>Active Referral Program</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Share Your Code, Grow Your Free Print Balance
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Your referred operators also receive a ₹{data?.config.welcomeRewardReferred || 50}{' '}
                  welcome bonus on their first qualifying recharge.
                </p>
              </div>

              {/* Code & Link Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Code Pill */}
                <div className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Your Referral Code
                  </span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xl font-mono font-black text-[#F4D35E] tracking-wider">
                      {referralCode}
                    </span>
                    <button
                      onClick={() => copyToClipboard(referralCode, 'code')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Link Box */}
                <div className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Your Referral Link
                  </span>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className="text-xs font-mono text-slate-300 truncate">
                      {referralLink}
                    </span>
                    <button
                      onClick={() => copyToClipboard(referralLink, 'link')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors shrink-0"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Quick Step Graphic */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F4D35E]">
                How The Reward Works
              </span>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-white block">Invite Fellow Operators</span>
                    <span className="text-slate-400 text-[11px]">
                      Share via WhatsApp, SMS, or Telegram with your unique code.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-white block">Operator Registers & Recharges</span>
                    <span className="text-slate-400 text-[11px]">
                      They complete their first qualifying recharge of ₹
                      {data?.config.firstRechargeThreshold || 249}+.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-white block">Instant ₹50 Reward Each</span>
                    <span className="text-slate-400 text-[11px]">
                      Both accounts receive instant promotional credits valid for all document cards.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Referrals
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {data?.totalReferrals ?? 0}
            </div>
            <span className="text-[10px] text-slate-500">Registered users</span>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Successful
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {data?.successfulReferrals ?? 0}
            </div>
            <span className="text-[10px] text-slate-500">First recharge done</span>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Pending
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {data?.pendingReferrals ?? 0}
            </div>
            <span className="text-[10px] text-slate-500">Awaiting recharge</span>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F4D35E]">
              Total Earned
            </span>
            <div className="text-2xl font-black text-white mt-1">
              ₹{data?.totalRewardsEarned ?? 0}
            </div>
            <span className="text-[10px] text-slate-500">Lifetime rewards</span>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Available Rewards
            </span>
            <div className="text-2xl font-black text-blue-400 mt-1">
              ₹{data?.availableRewards?.toFixed(2) ?? '0.00'}
            </div>
            <span className="text-[10px] text-slate-500">Ready in wallet</span>
          </div>

          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Total Redeemed
            </span>
            <div className="text-2xl font-black text-purple-400 mt-1">
              ₹{data?.totalRewardsRedeemed?.toFixed(2) ?? '0.00'}
            </div>
            <span className="text-[10px] text-slate-500">Used for prints</span>
          </div>
        </div>

        {/* Referral History Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-white">Referral Activity & History</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Track status and rewards for every operator registered through your referral link.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search operator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-slate-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="REWARDED">Rewarded</option>
                <option value="PENDING">Pending</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="REJECTED">Rejected</option>
                <option value="REVERSED">Reversed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Referred Operator</th>
                  <th className="px-6 py-3.5">Registration Date</th>
                  <th className="px-6 py-3.5">First Recharge</th>
                  <th className="px-6 py-3.5">Reward Benefit</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      Loading referral records...
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Gift className="w-8 h-8 mx-auto text-slate-600" />
                        <p className="font-semibold text-slate-400">No referrals found yet</p>
                        <p className="text-slate-500 text-[11px]">
                          Share your referral link on WhatsApp or with print shop colleagues to start
                          earning rewards.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((ref) => {
                    return (
                      <tr key={ref.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-300">
                              {ref.operatorName[0]}
                            </div>
                            <span>{ref.operatorName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                          {ref.registrationDate
                            ? new Date(ref.registrationDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-300">
                          {ref.firstRechargeStatus}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-400 font-mono">
                          +₹{ref.reward}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {ref.status === 'REWARDED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              Rewarded
                            </span>
                          )}
                          {ref.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                          {ref.status === 'QUALIFIED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                              <RefreshCw className="w-3 h-3" />
                              Qualified
                            </span>
                          )}
                          {ref.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                              <AlertCircle className="w-3 h-3" />
                              Rejected
                            </span>
                          )}
                          {ref.status === 'REVERSED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              <AlertCircle className="w-3 h-3" />
                              Reversed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Program Terms & Conditions Card */}
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800/80 p-5 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            <HelpCircle className="w-4 h-4 text-[#F4D35E]" />
            <span>Referral Terms & Conditions</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {data?.config.terms ||
              'Referral bonus is credited to your wallet once the referred operator completes their first qualifying recharge of ₹249 or more. Non-withdrawable promotional credit valid for official card verification and printing.'}
          </p>
          <p className="text-[10px] text-slate-500">
            Self-referrals, duplicate accounts from identical devices/IPs, or fraudulent activities
            will result in reward cancellation and account suspension. Maximum{' '}
            {data?.config.maxReferralsPerUser || 100} referrals per operator.
          </p>
        </div>
      </div>

      {/* Share Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-pink-400" />
                <span>Share Referral Invitation</span>
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Copy and send this pre-written message to other operators on WhatsApp, Telegram, or
              email:
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
              {inviteMessage}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => copyToClipboard(inviteMessage, 'invite')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center gap-2"
              >
                {copiedInvite ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>
              <button
                onClick={shareOnWhatsApp}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Open in WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

