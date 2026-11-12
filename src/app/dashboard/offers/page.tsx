'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Tag,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calendar,
  Gift,
  Plus,
  RefreshCw,
  Clock,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { getCustomerOffersAction } from '@/actions/promo';
import RechargeModal from '@/components/wallet/RechargeModal';

interface OfferItem {
  id: string;
  name: string;
  code: string;
  description: string;
  minRechargeAmount: number;
  slabAmount: number;
  bonusPerSlab: number;
  maxBonusPerOperator: number;
  startDate: string;
  endDate: string;
  status: string;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [prefilledAmount, setPrefilledAmount] = useState<number | undefined>(undefined);
  const [prefilledCode, setPrefilledCode] = useState<string | undefined>(undefined);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const res = await getCustomerOffersAction();
      if (res.success && res.offers) {
        setOffers(res.offers);
      }
    } catch (err) {
      console.error('Failed to load active offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleRechargeNow = (slabAmount: number, code: string) => {
    setPrefilledAmount(slabAmount);
    setPrefilledCode(code);
    setIsRechargeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-[#F4D35E]">Offers & Rewards</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>Promotional Campaigns & Recharge Bonuses</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Auto-Credited
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Maximize your document printing margin with active wallet top-up bonuses. Every qualifying
              recharge slab automatically adds bonus promotional credits to your balance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadOffers}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh campaigns"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                setPrefilledAmount(undefined);
                setPrefilledCode(undefined);
                setIsRechargeModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white font-bold text-xs shadow-lg hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>Top-up Wallet Now</span>
            </button>
          </div>
        </div>

        {/* Financial Guarantee Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-800/40 p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="font-bold text-white flex items-center gap-2">
              <span>Automatic Server-Side Bonus Crediting</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Zero Code Entry Required
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              When you recharge with any amount that meets the active campaign slab, your bonus credit
              is calculated securely on the server and added immediately to your wallet once payment is
              verified by the gateway.
            </p>
          </div>
        </div>

        {/* Campaign Offers Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F4D35E]" />
              <span>Active Bonus Campaigns ({offers.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
              Loading active campaigns...
            </div>
          ) : offers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
              <Tag className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-slate-400">No active promotional campaigns at this time</p>
              <p className="text-xs text-slate-500 mt-1">
                Check back soon or explore our{' '}
                <Link href="/dashboard/refer-earn" className="text-purple-400 hover:underline">
                  Refer & Earn program
                </Link>{' '}
                to get free wallet credits.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map((offer) => {
                const totalCredit = offer.slabAmount + offer.bonusPerSlab;
                const bonusPercent = Math.round((offer.bonusPerSlab / offer.slabAmount) * 100);

                return (
                  <div
                    key={offer.id}
                    className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-xl hover:border-slate-700 transition-all group"
                  >
                    {/* Top Badge & Code */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        <Tag className="w-3 h-3 text-purple-400" />
                        <span>Code: {offer.code}</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        +{bonusPercent}% Bonus
                      </span>
                    </div>

                    {/* Campaign Info */}
                    <div className="space-y-2 mb-6">
                      <h3 className="text-xl font-black text-white group-hover:text-[#F4D35E] transition-colors">
                        {offer.name}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {offer.description}
                      </p>
                    </div>

                    {/* Financial Breakdown Cards */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center mb-6">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          Recharge
                        </span>
                        <span className="text-sm font-extrabold text-white font-mono">
                          ₹{offer.slabAmount}
                        </span>
                      </div>
                      <div className="border-x border-slate-800">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                          Bonus
                        </span>
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          +₹{offer.bonusPerSlab}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#F4D35E] uppercase block">
                          Total Credit
                        </span>
                        <span className="text-sm font-black text-[#F4D35E] font-mono">
                          ₹{totalCredit}
                        </span>
                      </div>
                    </div>

                    {/* Slabs & Max Cap details */}
                    <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 mb-6">
                      <div className="flex items-center justify-between">
                        <span>Max bonus per operator:</span>
                        <span className="font-semibold text-white">₹{offer.maxBonusPerOperator}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Multiple slabs allowed:</span>
                        <span className="font-semibold text-emerald-400">Yes (scales up)</span>
                      </div>
                      {offer.endDate && (
                        <div className="flex items-center justify-between text-slate-500 text-[10px]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Valid until:
                          </span>
                          <span>
                            {new Date(offer.endDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleRechargeNow(offer.slabAmount, offer.code)}
                      className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#1D3557] to-[#457B9D] hover:from-[#8B1E2D] hover:to-[#E63946] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <span>Recharge ₹{offer.slabAmount} & Get ₹{totalCredit}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Informative Slabs Explanation */}
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#F4D35E]" />
            <span>How Slab-Based Multipliers Work</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="font-bold text-[#F4D35E] block">1 Slab (₹249)</span>
              <p className="text-[11px] text-slate-400">
                Pay ₹249 &rarr; Receive ₹249 purchased credits + ₹50 promotional bonus ={' '}
                <strong className="text-white">₹299 total wallet credit</strong>.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="font-bold text-[#F4D35E] block">2 Slabs (₹498)</span>
              <p className="text-[11px] text-slate-400">
                Pay ₹498 &rarr; Receive ₹498 purchased credits + ₹100 promotional bonus ={' '}
                <strong className="text-white">₹598 total wallet credit</strong>.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="font-bold text-[#F4D35E] block">4 Slabs (₹996)</span>
              <p className="text-[11px] text-slate-400">
                Pay ₹996 &rarr; Receive ₹996 purchased credits + ₹200 promotional bonus ={' '}
                <strong className="text-white">₹1,196 total wallet credit</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recharge Modal with prefilled parameters */}
      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        initialAmount={prefilledAmount}
        initialPromoCode={prefilledCode}
      />
    </div>
  );
}

