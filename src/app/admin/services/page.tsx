'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
  AlertCircle,
  Tag,
  Percent,
  Sparkles,
  Zap,
  Flame,
  Check,
  Activity,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Radio,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  getAdminServices,
  updateAdminServiceConfig,
  applyBatchServiceDiscount,
  getAdminVoterProviderStatus,
  resetAdminCircuitBreaker,
  testAdminProviderConnection,
} from '@/actions/admin';
import { ServiceType } from '@/models/ServiceConfig';
import {
  calculateDiscountPercent,
  calculateEffectiveFee,
} from '@/lib/wallet/constants';

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingService, setSavingService] = useState<string | null>(null);
  const [batchApplying, setBatchApplying] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Local edit states
  const [editFees, setEditFees] = useState<Record<string, number>>({});
  const [editOriginalFees, setEditOriginalFees] = useState<Record<string, number>>({});
  const [editDiscounts, setEditDiscounts] = useState<Record<string, number>>({});
  const [editOfferActive, setEditOfferActive] = useState<Record<string, boolean>>({});
  const [editOfferBadges, setEditOfferBadges] = useState<Record<string, string>>({});
  const [editMaintenance, setEditMaintenance] = useState<Record<string, boolean>>({});
  const [editNotices, setEditNotices] = useState<Record<string, string>>({});
  const [editEnabled, setEditEnabled] = useState<Record<string, boolean>>({});

  // Batch offer state
  const [batchDiscount, setBatchDiscount] = useState<number>(20);
  const [batchBadge, setBatchBadge] = useState<string>('20% OFF');

  // Voter multi-provider & circuit breaker state
  const [voterProviders, setVoterProviders] = useState<any[]>([]);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; latencyMs: number }>>({});
  const [resettingCircuit, setResettingCircuit] = useState<string | null>(null);
  const [voterPriority, setVoterPriority] = useState<string[]>(['neoapi', 'webapi_in', 'fastnexora']);
  const [savingPriority, setSavingPriority] = useState(false);

  const fetchVoterProviders = async () => {
    try {
      const p = await getAdminVoterProviderStatus();
      setVoterProviders(p);
    } catch (err: any) {
      console.warn('Failed to load voter provider statuses:', err);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingProvider(id);
    try {
      const res = await testAdminProviderConnection(id);
      setTestResults((prev) => ({ ...prev, [id]: res }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [id]: { success: false, message: err?.message || 'Test failed', latencyMs: 0 },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleResetCircuit = async (id: string) => {
    setResettingCircuit(id);
    try {
      await resetAdminCircuitBreaker(id);
      await fetchVoterProviders();
      setFeedback({ type: 'success', message: `Circuit breaker reset for ${id}.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to reset circuit' });
    } finally {
      setResettingCircuit(null);
    }
  };

  const handleMovePriority = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= voterPriority.length) return;
    const next = [...voterPriority];
    const temp = next[index];
    next[index] = next[newIdx];
    next[newIdx] = temp;
    setVoterPriority(next);
  };

  const handleSaveVoterPriority = async () => {
    setSavingPriority(true);
    try {
      await updateAdminServiceConfig('VOTER', {
        providerPriority: voterPriority,
      });
      setFeedback({
        type: 'success',
        message: `Voter provider priority updated: ${voterPriority.join(' ➔ ')}`,
      });
      await fetchServices();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to save priority' });
    } finally {
      setSavingPriority(false);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getAdminServices();
      setServices(data);

      const fees: Record<string, number> = {};
      const origFees: Record<string, number> = {};
      const discounts: Record<string, number> = {};
      const offers: Record<string, boolean> = {};
      const badges: Record<string, string> = {};
      const maint: Record<string, boolean> = {};
      const notices: Record<string, string> = {};
      const enabled: Record<string, boolean> = {};

      data.forEach((s) => {
        const sid = s.serviceId;
        const fee = typeof s.fee === 'number' ? s.fee : 20;
        const orig = typeof s.originalFee === 'number' && s.originalFee > 0 ? s.originalFee : fee;
        const disc = typeof s.discountPercent === 'number' ? s.discountPercent : calculateDiscountPercent(orig, fee);

        fees[sid] = fee;
        origFees[sid] = orig;
        discounts[sid] = disc;
        offers[sid] = typeof s.offerActive === 'boolean' ? s.offerActive : disc > 0;
        badges[sid] = s.offerBadge || (disc > 0 ? `${disc}% OFF` : '');
        maint[sid] = Boolean(s.maintenanceMode);
        notices[sid] = s.maintenanceNotice || '';
        enabled[sid] = s.enabled !== false;
        if (s.serviceId === 'VOTER' && Array.isArray(s.providerPriority) && s.providerPriority.length > 0) {
          setVoterPriority(s.providerPriority);
        }
      });

      setEditFees(fees);
      setEditOriginalFees(origFees);
      setEditDiscounts(discounts);
      setEditOfferActive(offers);
      setEditOfferBadges(badges);
      setEditMaintenance(maint);
      setEditNotices(notices);
      setEditEnabled(enabled);

      await fetchVoterProviders();
    } catch (err: any) {
      console.error('Failed to load services:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load services' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Update discount % and auto-calculate effective fee
  const handleDiscountChange = (serviceId: string, percent: number) => {
    const clampedPercent = Math.min(100, Math.max(0, percent));
    const orig = editOriginalFees[serviceId] ?? editFees[serviceId] ?? 25;
    const newFee = calculateEffectiveFee(orig, clampedPercent);

    setEditDiscounts((prev) => ({ ...prev, [serviceId]: clampedPercent }));
    setEditFees((prev) => ({ ...prev, [serviceId]: newFee }));

    if (clampedPercent > 0) {
      setEditOfferActive((prev) => ({ ...prev, [serviceId]: true }));
      setEditOfferBadges((prev) => ({
        ...prev,
        [serviceId]: prev[serviceId] && prev[serviceId] !== `${editDiscounts[serviceId]}% OFF`
          ? prev[serviceId]
          : `${clampedPercent}% OFF`,
      }));
    } else {
      setEditOfferActive((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  // Update original fee and recalculate either fee or discount
  const handleOriginalFeeChange = (serviceId: string, original: number) => {
    const orig = Math.max(0, original);
    setEditOriginalFees((prev) => ({ ...prev, [serviceId]: orig }));

    const disc = editDiscounts[serviceId] || 0;
    if (disc > 0) {
      const newFee = calculateEffectiveFee(orig, disc);
      setEditFees((prev) => ({ ...prev, [serviceId]: newFee }));
    } else {
      const curFee = editFees[serviceId] || 0;
      if (curFee > orig) {
        setEditFees((prev) => ({ ...prev, [serviceId]: orig }));
      }
    }
  };

  // Update wallet deduction fee directly and recalculate % OFF
  const handleFeeChange = (serviceId: string, fee: number) => {
    const clampedFee = Math.max(0, fee);
    const orig = Math.max(clampedFee, editOriginalFees[serviceId] || clampedFee);

    setEditFees((prev) => ({ ...prev, [serviceId]: clampedFee }));
    setEditOriginalFees((prev) => ({ ...prev, [serviceId]: orig }));

    const disc = calculateDiscountPercent(orig, clampedFee);
    setEditDiscounts((prev) => ({ ...prev, [serviceId]: disc }));

    if (disc > 0) {
      setEditOfferActive((prev) => ({ ...prev, [serviceId]: true }));
      setEditOfferBadges((prev) => ({
        ...prev,
        [serviceId]: prev[serviceId] || `${disc}% OFF`,
      }));
    } else {
      setEditOfferActive((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  const handleSave = async (serviceId: ServiceType) => {
    setSavingService(serviceId);
    setFeedback(null);
    try {
      const orig = Number(editOriginalFees[serviceId] ?? editFees[serviceId]);
      const fee = Number(editFees[serviceId]);
      const disc = Number(editDiscounts[serviceId] ?? 0);
      const isOffer = Boolean(editOfferActive[serviceId]);
      const badge = editOfferBadges[serviceId] || '';

      await updateAdminServiceConfig(serviceId, {
        originalFee: orig,
        fee,
        discountPercent: disc,
        offerActive: isOffer,
        offerBadge: badge,
        enabled: editEnabled[serviceId],
        maintenanceMode: editMaintenance[serviceId],
        maintenanceNotice: editNotices[serviceId],
      });

      setFeedback({
        type: 'success',
        message: `${serviceId} pricing and offer configuration saved successfully! (Fee: ₹${fee}, ${disc}% OFF)`,
      });
      await fetchServices();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update service config' });
    } finally {
      setSavingService(null);
    }
  };

  const handleApplyBatchOffer = async (
    percent: number,
    badgeText?: string,
    activateOffer = true
  ) => {
    setBatchApplying(true);
    setFeedback(null);
    try {
      const badge = badgeText || (percent > 0 ? `${percent}% OFF` : '');
      const res = await applyBatchServiceDiscount(percent, badge, activateOffer);
      setFeedback({
        type: 'success',
        message: `Batch offer applied: ${percent}% OFF set across ${res.count} services!`,
      });
      await fetchServices();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to apply batch discount offer',
      });
    } finally {
      setBatchApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-amber-400" />
            Service Pricing & Offer Management (SSOT)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Central single source of truth for Base Prices, % OFF discounts, active promotional offers, and provider fallback rules.
          </p>
        </div>
        <button
          onClick={fetchServices}
          disabled={loading || batchApplying}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700 self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
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

      {/* Quick Batch Discount & Promotional Offers Bar */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Promotional Offers & Batch % OFF Manager
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Instant Sitewide
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Apply a uniform discount percentage across all card services or reset to base regular pricing.
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {[10, 20, 30, 50].map((pct) => (
              <button
                key={pct}
                onClick={() => handleApplyBatchOffer(pct, `${pct}% OFF`)}
                disabled={batchApplying || loading}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
              >
                {pct}% OFF
              </button>
            ))}
            <button
              onClick={() => handleApplyBatchOffer(0, '', false)}
              disabled={batchApplying || loading}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:border-slate-700 transition-colors disabled:opacity-50"
            >
              Reset to Base (0%)
            </button>
          </div>
        </div>

        {/* Custom batch bar */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-400 font-medium">Custom Batch:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              max="100"
              value={batchDiscount}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBatchDiscount(val);
                setBatchBadge(`${val}% OFF`);
              }}
              className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-white"
            />
            <span className="text-slate-400">%</span>
          </div>
          <input
            type="text"
            placeholder="Offer badge text (e.g. Festival Special)..."
            value={batchBadge}
            onChange={(e) => setBatchBadge(e.target.value)}
            className="w-48 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 placeholder-slate-500"
          />
          <button
            onClick={() => handleApplyBatchOffer(batchDiscount, batchBadge)}
            disabled={batchApplying || loading}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors disabled:opacity-50"
          >
            {batchApplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Apply Custom Batch
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-blue-200">Single Source of Truth Guarantees</p>
          <p className="text-blue-300/80 leading-relaxed">
            Changing pricing or discount percentages here automatically updates the public <strong>/pricing</strong> rate card, Studio search bar fee badges, and wallet deduction engines in real time. Saved document re-prints always remain 100% free (₹0).
          </p>
        </div>
      </div>

      {/* Voter Multi-Provider Failover & Circuit Breaker Health Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Voter Verification Multi-Provider Failover & Circuit Breakers
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Reliability Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure provider priority order, monitor real-time upstream health metrics, and manage circuit breakers.
              </p>
            </div>
          </div>
          <button
            onClick={fetchVoterProviders}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Metrics
          </button>
        </div>

        {/* Priority Order Manager */}
        <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-200">
                Automatic Provider Cascade Priority
              </span>
              <p className="text-[11px] text-slate-400">
                Primary provider is attempted first. If it encounters a retryable failure (5xx, timeout, gateway error), system automatically cascades to subsequent providers.
              </p>
            </div>
            <button
              onClick={handleSaveVoterPriority}
              disabled={savingPriority}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 self-start sm:self-auto"
            >
              {savingPriority ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Priority
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {voterPriority.map((providerId, idx) => {
              const label =
                providerId === 'neoapi'
                  ? 'NeoAPI (V1/V2)'
                  : providerId === 'webapi_in'
                    ? 'WebAPI.in'
                    : providerId === 'fastnexora'
                      ? 'FastNexora'
                      : providerId;

              return (
                <div
                  key={providerId}
                  className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono"
                >
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    #{idx + 1} {idx === 0 ? 'Primary' : 'Fallback'}
                  </span>
                  <span className="text-white font-medium">{label}</span>
                  <div className="flex items-center gap-0.5 ml-1">
                    <button
                      onClick={() => handleMovePriority(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMovePriority(idx, 'down')}
                      disabled={idx === voterPriority.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Provider Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {voterProviders.map((vp) => {
            const isTesting = testingProvider === vp.id;
            const isResetting = resettingCircuit === vp.id;
            const testResult = testResults[vp.id];
            const circuitState = vp.circuit?.state || 'CLOSED';

            return (
              <div
                key={vp.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <span className="text-xs font-bold text-white">{vp.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        circuitState === 'CLOSED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : circuitState === 'OPEN'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      Circuit: {circuitState}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1.5 text-[11px] text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Credentials:</span>
                      <span className={vp.configured ? 'text-emerald-400 font-mono' : 'text-rose-400'}>
                        {vp.configured ? vp.maskedKey : 'Not Set'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Routing:</span>
                      <span className="text-slate-300 text-[10px]">{vp.routingPolicy}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Success Rate:</span>
                      <span className="text-emerald-400 font-semibold">{vp.health?.successRate ?? 100}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Requests (S/F):</span>
                      <span className="font-mono text-slate-300">
                        {vp.health?.totalRequests ?? 0} ({vp.health?.successfulRequests ?? 0}/{vp.health?.failedRequests ?? 0})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Latency (Avg/P95):</span>
                      <span className="font-mono text-slate-300">
                        {vp.health?.avgLatencyMs ?? 0}ms / {vp.health?.p95LatencyMs ?? 0}ms
                      </span>
                    </div>
                    {vp.circuit?.consecutiveFailures > 0 && (
                      <div className="flex items-center justify-between text-rose-400">
                        <span>Consecutive Failures:</span>
                        <span className="font-bold">{vp.circuit.consecutiveFailures} / 3</span>
                      </div>
                    )}
                  </div>

                  {testResult && (
                    <div
                      className={`mt-2 p-2 rounded-lg text-[10px] border flex items-center gap-1.5 ${
                        testResult.success
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="truncate">
                        {testResult.message} ({testResult.latencyMs}ms)
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => handleTestConnection(vp.id)}
                    disabled={isTesting}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {isTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Radio className="w-3 h-3 text-cyan-400" />}
                    Test Probe
                  </button>
                  {circuitState !== 'CLOSED' && (
                    <button
                      onClick={() => handleResetCircuit(vp.id)}
                      disabled={isResetting}
                      className="py-1.5 px-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      title="Reset Circuit"
                    >
                      {isResetting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                      Reset
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Loading service pricing configurations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {services.map((svc) => {
            const sid = svc.serviceId as ServiceType;
            const isSaving = savingService === sid;
            const isMaintenance = editMaintenance[sid];
            const isEnabled = editEnabled[sid];

            const orig = editOriginalFees[sid] ?? svc.originalFee ?? svc.fee;
            const fee = editFees[sid] ?? svc.fee;
            const disc = editDiscounts[sid] ?? 0;
            const isOffer = editOfferActive[sid] ?? false;
            const badge = editOfferBadges[sid] || '';
            const savings = Math.max(0, orig - fee);

            return (
              <div
                key={sid}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                        {sid}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{svc.displayName}</h3>
                          {isOffer && disc > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <Sparkles className="w-2.5 h-2.5" />
                              {badge || `${disc}% OFF`}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-400">SERVICE ID: {sid}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) =>
                            setEditEnabled({ ...editEnabled, [sid]: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                      <span className="text-xs text-slate-400">
                        {isEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  {/* Pricing & % OFF Controls */}
                  <div className="space-y-4 pt-4">
                    {/* Price Grid: Base Price, Discount %, Final Fee */}
                    <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                      {/* Base Price */}
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Base Price (MRP)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs text-slate-500">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={orig}
                            onChange={(e) => handleOriginalFeeChange(sid, Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-6 pr-2 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* Discount % */}
                      <div>
                        <label className="block text-[11px] font-medium text-emerald-400 mb-1 flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          Discount (% OFF)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={disc}
                            onChange={(e) => handleDiscountChange(sid, Number(e.target.value))}
                            className="w-full bg-slate-950 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                          />
                          <span className="absolute right-2.5 top-2 text-xs text-emerald-500/70">%</span>
                        </div>
                      </div>

                      {/* Effective Fee */}
                      <div>
                        <label className="block text-[11px] font-medium text-amber-400 mb-1">
                          Final Wallet Fee
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs text-slate-500">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={fee}
                            onChange={(e) => handleFeeChange(sid, Number(e.target.value))}
                            className="w-full bg-slate-950 border border-amber-500/40 rounded-lg pl-6 pr-2 py-1.5 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Savings Summary Pill */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-slate-400">Pricing Breakdown:</span>
                        {disc > 0 ? (
                          <span className="font-semibold text-white">
                            <span className="line-through text-slate-500 mr-1.5">₹{orig}</span>
                            <span className="text-emerald-400">₹{fee}</span>
                            <span className="text-emerald-300 ml-1.5">({disc}% OFF)</span>
                          </span>
                        ) : (
                          <span className="font-semibold text-white">₹{fee} (Standard)</span>
                        )}
                      </div>
                      {savings > 0 && (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          Saves ₹{savings}
                        </span>
                      )}
                    </div>

                    {/* Offer Activation & Badge Settings */}
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                          <Sparkles className={`w-3.5 h-3.5 ${isOffer ? 'text-emerald-400' : 'text-slate-500'}`} />
                          Active Promotional Offer
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isOffer}
                            onChange={(e) =>
                              setEditOfferActive({
                                ...editOfferActive,
                                [sid]: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      {isOffer && (
                        <div className="pt-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={badge}
                            onChange={(e) =>
                              setEditOfferBadges({ ...editOfferBadges, [sid]: e.target.value })
                            }
                            placeholder="Offer badge text (e.g. 60% OFF, Cyber Sale)..."
                            className="flex-1 bg-slate-950 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-emerald-200 placeholder-emerald-400/40 focus:outline-none focus:border-emerald-500"
                          />
                          <div className="flex items-center gap-1">
                            {[`${disc}% OFF`, 'Hot Deal', 'Limited'].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() =>
                                  setEditOfferBadges({ ...editOfferBadges, [sid]: preset })
                                }
                                className="px-2 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Maintenance Toggle */}
                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                          <AlertTriangle className={`w-3.5 h-3.5 ${isMaintenance ? 'text-amber-400' : 'text-slate-500'}`} />
                          Maintenance Mode
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isMaintenance}
                            onChange={(e) =>
                              setEditMaintenance({
                                ...editMaintenance,
                                [sid]: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-600"></div>
                        </label>
                      </div>

                      {isMaintenance && (
                        <div>
                          <input
                            type="text"
                            value={editNotices[sid] ?? ''}
                            onChange={(e) =>
                              setEditNotices({ ...editNotices, [sid]: e.target.value })
                            }
                            placeholder="Notice message shown to operators (e.g. Under scheduled maintenance)..."
                            className="w-full bg-slate-950 border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 placeholder-amber-400/40 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Provider priority badges */}
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                        Active Provider Fallback Chain
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(svc.providerPriority || ['NEO', 'SUREPASS', 'MANUAL']).map((p: string, idx: number) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-1"
                          >
                            <span className="text-slate-500">{idx + 1}.</span> {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Save Action */}
                <div className="pt-4 border-t border-slate-800 mt-6 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Last updated: {new Date(svc.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleSave(sid)}
                    disabled={isSaving || batchApplying}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Service Pricing
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
