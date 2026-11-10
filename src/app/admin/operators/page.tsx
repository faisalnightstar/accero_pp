'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wallet,
  FileText,
  Edit3,
  Loader2,
  RefreshCw,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Eye,
  AlertCircle,
} from 'lucide-react';
import {
  getAdminOperators,
  updateOperatorStatus,
  addOperatorNote,
  executeAdministrativeWalletAdjustment,
  getAdminOperatorDetail,
} from '@/actions/admin';

export default function AdminOperatorsPage() {
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal States
  const [selectedOperator, setSelectedOperator] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Adjust Wallet Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit' | 'refund'>('credit');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [adjustSuccess, setAdjustSuccess] = useState<string | null>(null);

  // Note Modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTarget, setNoteTarget] = useState<any | null>(null);
  const [newNote, setNewNote] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  const fetchOperators = async () => {
    setLoading(true);
    try {
      const res = await getAdminOperators({
        page,
        limit: 15,
        search,
        status: statusFilter,
      });
      setOperators(res.operators);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err: any) {
      console.error('Failed to load operators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOperators();
  };

  const handleToggleStatus = async (op: any) => {
    const nextStatus = op.status === 'active' ? 'suspended' : 'active';
    const reason =
      nextStatus === 'suspended'
        ? prompt('Enter administrative reason for suspending this operator:')
        : 'Reactivated by administrator';

    if (nextStatus === 'suspended' && !reason) return;

    try {
      await updateOperatorStatus(op.id, nextStatus, reason || undefined);
      fetchOperators();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleViewDetail = async (op: any) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    try {
      const detail = await getAdminOperatorDetail(op.id);
      setSelectedOperator(detail);
    } catch (err: any) {
      alert(`Failed to load details: ${err.message}`);
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(adjustAmount);
    if (!amt || amt <= 0 || !adjustReason.trim() || !adjustTarget) {
      setAdjustError('Please enter a valid positive amount and detailed reason.');
      return;
    }

    setAdjustSubmitting(true);
    setAdjustError(null);
    setAdjustSuccess(null);

    try {
      const res = await executeAdministrativeWalletAdjustment({
        operatorId: adjustTarget.id,
        amount: amt,
        type: adjustType,
        reason: adjustReason.trim(),
      });
      setAdjustSuccess(res.message);
      setAdjustAmount('');
      setAdjustReason('');
      fetchOperators();
      setTimeout(() => {
        setShowAdjustModal(false);
        setAdjustSuccess(null);
      }, 1500);
    } catch (err: any) {
      setAdjustError(err.message || 'Adjustment failed');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !noteTarget) return;

    setNoteSubmitting(true);
    try {
      await addOperatorNote(noteTarget.id, newNote.trim());
      setNewNote('');
      setShowNoteModal(false);
      fetchOperators();
    } catch (err: any) {
      alert(`Error adding note: ${err.message}`);
    } finally {
      setNoteSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Operator Accounts</h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered print shop and cyber cafe operators ({total} accounts total).
          </p>
        </div>
        <button
          onClick={fetchOperators}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or Operator ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E63946]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Operators Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Wallet Balance</th>
                <th className="py-3 px-4 text-right">Recharges</th>
                <th className="py-3 px-4 text-center">Prints / Lookups</th>
                <th className="py-3 px-4 text-right">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#E63946]" />
                    <span>Loading operator records...</span>
                  </td>
                </tr>
              ) : operators.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No operator accounts match the query.
                  </td>
                </tr>
              ) : (
                operators.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{op.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {op.id.slice(-8)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300">{op.email}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{op.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      {op.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded-md" title={op.suspendedReason}>
                          <XCircle className="w-3 h-3" />
                          <span>Suspended</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      ₹{op.walletBalance.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">
                      ₹{op.totalRechargeAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[#F4D35E] font-bold">{op.totalPrints}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-slate-300">{op.totalLookups}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(op.createdAt).toISOString().split('T')[0]}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetail(op)}
                          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="View Operator Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setAdjustTarget(op);
                            setShowAdjustModal(true);
                            setAdjustError(null);
                            setAdjustSuccess(null);
                          }}
                          className="p-1.5 hover:bg-slate-800 text-blue-400 rounded-lg transition-colors cursor-pointer"
                          title="Adjust Wallet"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setNoteTarget(op);
                            setShowNoteModal(true);
                          }}
                          className="p-1.5 hover:bg-slate-800 text-amber-400 rounded-lg transition-colors cursor-pointer"
                          title="Add Internal Note"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(op)}
                          className={`p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ${
                            op.status === 'active' ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                          title={op.status === 'active' ? 'Suspend Operator' : 'Reactivate Operator'}
                        >
                          {op.status === 'active' ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <span className="text-white font-bold">{page}</span> of{' '}
            <span className="text-white font-bold">{totalPages || 1}</span> ({total} operators)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Operator Detail Drawer / Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Operator Profile</h3>
                <p className="text-xs text-slate-400">Administrative details and ledger view</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            {detailLoading || !selectedOperator ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#E63946] mb-2" />
                <span>Loading profile...</span>
              </div>
            ) : (
              <div className="space-y-5 text-xs">
                {/* Profile Summary */}
                <div className="grid grid-cols-2 gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Operator Name</span>
                    <span className="font-bold text-white text-sm">{selectedOperator.operator.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Operator ID</span>
                    <span className="font-mono text-slate-200">{selectedOperator.operator.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Email</span>
                    <span className="text-slate-200">{selectedOperator.operator.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Phone</span>
                    <span className="text-slate-200 font-mono">{selectedOperator.operator.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Wallet Balance</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      ₹{selectedOperator.wallet.balance.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Account Status</span>
                    <span
                      className={`font-semibold ${
                        selectedOperator.operator.status === 'active' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {selectedOperator.operator.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Internal Notes */}
                {selectedOperator.operator.notes && (
                  <div className="space-y-1">
                    <span className="font-bold text-slate-300 block">Internal Staff Notes:</span>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] whitespace-pre-line">
                      {selectedOperator.operator.notes}
                    </div>
                  </div>
                )}

                {/* Recent Ledger Transactions */}
                <div className="space-y-2">
                  <h4 className="font-bold text-white">Recent Transactions ({selectedOperator.wallet.recentTransactions.length})</h4>
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {selectedOperator.wallet.recentTransactions.length === 0 ? (
                      <p className="text-slate-500">No transactions recorded yet.</p>
                    ) : (
                      selectedOperator.wallet.recentTransactions.map((tx: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px]"
                        >
                          <div>
                            <span className="font-semibold text-slate-200">{tx.description}</span>
                            <span className="text-slate-500 font-mono block text-[10px]">{tx.referenceId}</span>
                          </div>
                          <span
                            className={`font-bold font-mono ${
                              tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Financial Adjustment Modal */}
      {showAdjustModal && adjustTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white">Administrative Wallet Adjustment</h3>
              <p className="text-xs text-slate-400">
                Operator: <span className="text-white font-semibold">{adjustTarget.name}</span> (Current Balance: ₹{adjustTarget.walletBalance.toFixed(2)})
              </p>
            </div>

            {adjustError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{adjustError}</span>
              </div>
            )}

            {adjustSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{adjustSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e: any) => setAdjustType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#E63946]"
                >
                  <option value="credit">Credit (+) Add funds to operator</option>
                  <option value="debit">Debit (-) Deduct funds from operator</option>
                  <option value="refund">Refund (+) Refund service deduction</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Amount (₹ INR)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  placeholder="e.g. 100"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#E63946] font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason / Audit Justification (Required)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this manual adjustment is being executed (recorded in immutable audit log)..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#E63946]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white font-bold flex items-center gap-1.5 shadow disabled:opacity-50 cursor-pointer"
                >
                  {adjustSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Execute Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && noteTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Add Internal Administrative Note</h3>
            <p className="text-xs text-slate-400">
              For: <span className="text-white font-semibold">{noteTarget.name}</span>
            </p>

            <form onSubmit={handleNoteSubmit} className="space-y-4 text-xs">
              <textarea
                rows={4}
                required
                placeholder="Enter confidential internal staff note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#E63946]"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={noteSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#8B1E2D] hover:bg-[#A32235] text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {noteSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
