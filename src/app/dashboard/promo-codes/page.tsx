'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Ticket,
  Copy,
  Check,
  Tag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  RefreshCw,
  Gift,
  Plus,
  Percent,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  getCustomerPromoCodesAction,
  getCustomerRedeemedPromoCodesAction,
} from '@/actions/promo';
import RechargeModal from '@/components/wallet/RechargeModal';

interface PromoCodeItem {
  id: string;
  code: string;
  campaignName: string;
  description: string;
  discountType: string;
  discountValue: number;
  minimumRechargeAmount: number;
  maximumBonus: number;
  firstRechargeOnly: boolean;
  expiresAt: string;
}

interface RedemptionItem {
  id: string;
  code: string;
  campaignName: string;
  description: string;
  discountType: string;
  paymentId: string;
  rechargeAmount: number;
  bonusAmount: number;
  discountAmount: number;
  status: string;
  redeemedAt: string;
}

export default function CustomerPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCodeItem[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<string | undefined>(undefined);
  const [selectedMinAmount, setSelectedMinAmount] = useState<number | undefined>(undefined);

  const loadData = async () => {
    setLoading(true);
    try {
      const [codesRes, redemptionsRes] = await Promise.all([
        getCustomerPromoCodesAction(),
        getCustomerRedeemedPromoCodesAction(),
      ]);

      if (codesRes.success && codesRes.promoCodes) {
        setPromoCodes(codesRes.promoCodes);
      }
      if (redemptionsRes.success && redemptionsRes.redemptions) {
        setRedemptions(redemptionsRes.redemptions);
      }
    } catch (err) {
      console.error('Failed to load promo codes data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyInRecharge = (code: string, minAmount: number) => {
    setSelectedPromoCode(code);
    setSelectedMinAmount(minAmount > 0 ? minAmount : undefined);
    setIsRechargeModalOpen(true);
  };

  const getDiscountLabel = (type: string, value: number) => {
    if (type === 'PERCENTAGE_BONUS') {
      return `+${value}% Extra Credit`;
    }
    if (type === 'FIXED_DISCOUNT') {
      return `₹${value} Instant Discount`;
    }
    if (type === 'FIRST_RECHARGE') {
      return `+₹${value} First Recharge Bonus`;
    }
    return `+₹${value} Extra Bonus`;
  };

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
              <span className="text-[#F4D35E]">Promo Codes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>Promo Codes & Coupons</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Coupons Available
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Apply valid promotional coupon codes during wallet recharge to unlock instant discounts
              or bonus credits for your document card printing jobs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh promo codes"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                setSelectedPromoCode(undefined);
                setSelectedMinAmount(undefined);
                setIsRechargeModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>Top-up Wallet</span>
            </button>
          </div>
        </div>

        {/* Available Promo Codes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-pink-400" />
              <span>Eligible Active Promo Codes ({promoCodes.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
              Loading available coupon codes...
            </div>
          ) : promoCodes.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
              <Ticket className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-slate-400">No active promo codes currently eligible for your account</p>
              <p className="text-xs text-slate-500 mt-1">
                Explore our active{' '}
                <Link href="/dashboard/offers" className="text-purple-400 hover:underline">
                  Recharge Bonus Campaigns
                </Link>{' '}
                or invite operators with{' '}
                <Link href="/dashboard/refer-earn" className="text-emerald-400 hover:underline">
                  Refer & Earn
                </Link>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promoCodes.map((code) => {
                const isCopied = copiedCode === code.code;

                return (
                  <div
                    key={code.id}
                    className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-xl hover:border-slate-700 transition-all group"
                  >
                    {/* Top Row: Code Pill & Type */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black font-mono tracking-wider px-3 py-1 rounded-xl bg-pink-500/10 text-pink-300 border border-pink-500/30">
                          {code.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(code.code)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Copy promo code"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {code.firstRechargeOnly && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          First Recharge
                        </span>
                      )}
                    </div>

                    {/* Campaign Name & Description */}
                    <div className="space-y-1.5 mb-6">
                      <h3 className="text-lg font-bold text-white group-hover:text-[#F4D35E] transition-colors">
                        {code.campaignName}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {code.description || 'Promotional coupon code for wallet recharge.'}
                      </p>
                    </div>

                    {/* Benefit Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Benefit:</span>
                        <span className="font-extrabold text-emerald-400 font-mono">
                          {getDiscountLabel(code.discountType, code.discountValue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Min. Recharge:</span>
                        <span className="font-semibold text-white font-mono">
                          {code.minimumRechargeAmount > 0 ? `₹${code.minimumRechargeAmount}` : 'No minimum'}
                        </span>
                      </div>
                      {code.maximumBonus > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Max Benefit:</span>
                          <span className="font-semibold text-white font-mono">
                            ₹{code.maximumBonus}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expiry & CTA */}
                    <div className="space-y-3">
                      {code.expiresAt && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            Expires:{' '}
                            {new Date(code.expiresAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => handleApplyInRecharge(code.code, code.minimumRechargeAmount)}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Apply in Recharge</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* "My Redeemed Promo Codes" History Table */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-white">My Promo Code Redemptions</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit history of coupons applied to your previous top-up payments.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {redemptions.length} Total Applied
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Promo Code</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Recharge Amount</th>
                  <th className="px-6 py-3.5">Promotional Benefit</th>
                  <th className="px-6 py-3.5">Payment Reference</th>
                  <th className="px-6 py-3.5 text-right">Redemption Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      Loading redemption records...
                    </td>
                  </tr>
                ) : redemptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Tag className="w-8 h-8 mx-auto text-slate-600" />
                        <p className="font-semibold text-slate-400">No promo codes redeemed yet</p>
                        <p className="text-slate-500 text-[11px]">
                          Enter an eligible promo code during your next wallet recharge to see it tracked here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  redemptions.map((item) => {
                    const benefit =
                      item.bonusAmount > 0
                        ? `+₹${item.bonusAmount} Bonus`
                        : item.discountAmount > 0
                        ? `-₹${item.discountAmount} Discount`
                        : '₹0';

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-pink-300 border border-slate-700">
                              {item.code}
                            </span>
                            <span className="text-slate-400 text-[11px] hidden sm:inline">
                              {item.campaignName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                          {item.redeemedAt
                            ? new Date(item.redeemedAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-200 font-mono">
                          ₹{item.rechargeAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-400 font-mono">
                          {benefit}
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                          {item.paymentId}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.status === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              Redeemed
                            </span>
                          )}
                          {item.status === 'APPLIED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <Clock className="w-3 h-3" />
                              Applied (Pending)
                            </span>
                          )}
                          {item.status === 'FAILED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              <AlertCircle className="w-3 h-3" />
                              Failed
                            </span>
                          )}
                          {item.status === 'CANCELLED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                              Cancelled
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
      </div>

      {/* Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        initialPromoCode={selectedPromoCode}
        initialAmount={selectedMinAmount}
        onSuccess={() => loadData()}
      />
    </div>
  );
}

