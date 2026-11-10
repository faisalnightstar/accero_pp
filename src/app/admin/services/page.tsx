'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Save,
  CreditCard,
  ShieldCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  getAdminServices,
  updateAdminServiceConfig,
} from '@/actions/admin';
import { ServiceType } from '@/models/ServiceConfig';

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingService, setSavingService] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Local edit states
  const [editFees, setEditFees] = useState<Record<string, number>>({});
  const [editMaintenance, setEditMaintenance] = useState<Record<string, boolean>>({});
  const [editNotices, setEditNotices] = useState<Record<string, string>>({});
  const [editEnabled, setEditEnabled] = useState<Record<string, boolean>>({});

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getAdminServices();
      setServices(data);

      const fees: Record<string, number> = {};
      const maint: Record<string, boolean> = {};
      const notices: Record<string, string> = {};
      const enabled: Record<string, boolean> = {};

      data.forEach((s) => {
        fees[s.serviceId] = s.fee;
        maint[s.serviceId] = s.maintenanceMode;
        notices[s.serviceId] = s.maintenanceNotice || '';
        enabled[s.serviceId] = s.enabled;
      });

      setEditFees(fees);
      setEditMaintenance(maint);
      setEditNotices(notices);
      setEditEnabled(enabled);
    } catch (err: any) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async (serviceId: ServiceType) => {
    setSavingService(serviceId);
    setFeedback(null);
    try {
      await updateAdminServiceConfig(serviceId, {
        fee: Number(editFees[serviceId]),
        enabled: editEnabled[serviceId],
        maintenanceMode: editMaintenance[serviceId],
        maintenanceNotice: editNotices[serviceId],
      });
      setFeedback({ type: 'success', message: `${serviceId} configuration updated successfully!` });
      await fetchServices();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update service config' });
    } finally {
      setSavingService(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-amber-400" />
            Service Pricing & Provider Maintenance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Control per-card print deduction fees, maintenance mode status, and fallback provider routing.
          </p>
        </div>
        <button
          onClick={fetchServices}
          disabled={loading}
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
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs hover:underline opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* Info notice about Free Lifetime Reprints */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 flex items-start gap-4">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-blue-200">Free Lifetime Reprint Guarantee</p>
          <p className="text-blue-300/80 leading-relaxed">
            The service fee configured below applies strictly to the <strong>first-time verification and card generation</strong> of an identity document. Once verified, operators can re-open, edit, and re-print the same document for ₹0 (Free Reprint) indefinitely from their Document History.
          </p>
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

            return (
              <div
                key={sid}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                        {sid}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{svc.displayName}</h3>
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

                  {/* Form fields */}
                  <div className="space-y-4 pt-4">
                    {/* Fee Setting */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Deduction Fee per First Verification (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-slate-500">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={editFees[sid] ?? svc.fee}
                          onChange={(e) =>
                            setEditFees({ ...editFees, [sid]: Number(e.target.value) })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
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

                <div className="pt-4 border-t border-slate-800 mt-6 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Last updated: {new Date(svc.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleSave(sid)}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Changes
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
