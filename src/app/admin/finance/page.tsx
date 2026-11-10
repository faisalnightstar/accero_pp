'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  PlusCircle,
  Tag,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  getAdminFinancialLedger,
  executeAdministrativeWalletAdjustment,
  getAdminOverviewMetrics,
} from '@/actions/admin';
import {
  getPendingManualRecharges,
  approveManualRecharge,
  rejectManualRecharge,
} from '@/actions/wallet';

export default function AdminFinancePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Pending Manual UTRs
  const [pendingUtrs, setPendingUtrs] = useState<any[]>([]);
  const [utrLoading, setUtrLoading] = useState(false);

  // Financial Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [operatorId, setOperatorId] = useState('');
  const [amount, setAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit' | 'refund'>('credit');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await getAdminFinancialLedger({
        page,
        limit: 25,
        type: typeFilter,
        category: categoryFilter,
        search,
      });
      setTransactions(res.transactions);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err: any) {
      console.error('Failed to load ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUtrs = async () => {
    setUtrLoading(true);
    try {
      const res = await getPendingManualRecharges();
      if (res.success && res.requests) {
        setPendingUtrs(res.requests);
      }
    } catch (err) {
      console.error('Failed to load pending UTRs:', err);
    } finally {
      setUtrLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
    fetchPendingUtrs();
  }, [page, typeFilter, categoryFilter]);

  const handleApproveUtr = async (reqId: string) => {
    if (!confirm('Are you sure you want to approve this UTR payment and credit the operator wallet?')) return;
    try {
      await approveManualRecharge(reqId);
      fetchPendingUtrs();
      fetchLedger();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleRejectUtr = async (reqId: string) => {
    const reasonInput = prompt('Enter rejection reason (e.g. Unverified UTR on bank statement):');
    if (!reasonInput) return;
    try {
      await rejectManualRecharge(reqId, reasonInput);
      fetchPendingUtrs();
      fetchLedger();
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!operatorId.trim() || !amt || amt <= 0 || !reason.trim()) {
      setErrorMsg('Please provide valid Operator ID, positive amount, and reason.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await executeAdministrativeWalletAdjustment({
        operatorId: operatorId.trim(),
        amount: amt,
        type: adjustType,
        reason: reason.trim(),
      });
      setSuccessMsg(res.message);
      setOperatorId('');
      setAmount('');
      setReason('');
      fetchLedger();
      setTimeout(() => {
        setShowAdjustModal(false);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Wallet & Financial Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            System transaction ledger, manual UTR verification, and administrative adjustments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowAdjustModal(true);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] hover:opacity-90 text-xs font-bold text-white shadow flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manual Adjustment</span>
          </button>
          <button
            onClick={() => {
              fetchLedger();
              fetchPendingUtrs();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pending Manual UTR Verification Card */}
      {pendingUtrs.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-800/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>Pending Manual UTR Requests ({pendingUtrs.length})</span>
            </div>
            <span className="text-[11px] text-amber-300">Requires manual bank statement verification</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingUtrs.map((req) => (
              <div
                key={req._id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white text-sm">₹{req.amount}</span>
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
                      PENDING
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-1">UTR: {req.utrNumber}</p>
                  <p className="text-[11px] text-slate-400">{req.user?.name} ({req.user?.email})</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleApproveUtr(req._id)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectUtr(req._id)}
                    className="flex-1 py-1.5 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            fetchLedger();
          }}
          className="relative flex-1"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by reference ID or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E63946]"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E63946]"
          >
            <option value="all">All Types</option>
            <option value="credit">Credits (+)</option>
            <option value="debit">Debits (-)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E63946]"
          >
            <option value="all">All Categories</option>
            <option value="WALLET_TOPUP">Recharges</option>
            <option value="DOCUMENT_PRINT">Service Fees</option>
            <option value="PROMOTIONAL_BONUS">Promo Bonuses</option>
            <option value="MANUAL_ADJUSTMENT">Manual Adjustments</option>
            <option value="REFUND">Refunds</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#E63946]" />
                    <span>Loading financial ledger...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{tx.operatorName || 'System'}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs">{tx.operatorEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                      {tx.referenceId || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                        {tx.category || 'TRANSACTION'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-sm truncate" title={tx.description}>
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200 whitespace-nowrap">
                      ₹{(tx.balanceAfter || 0).toFixed(2)}
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
            <span className="text-white font-bold">{totalPages || 1}</span> ({total} records)
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

      {/* Manual Financial Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white">Direct Wallet Adjustment</h3>
              <p className="text-xs text-slate-400">
                Execute an administrative financial credit, debit, or refund with mandatory audit logging.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Operator ID (MongoDB ObjectId)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 67cf1a2b3c4d5e6f7a8b9c0d"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#E63946] font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Adjustment Action</label>
                <select
                  value={adjustType}
                  onChange={(e: any) => setAdjustType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#E63946]"
                >
                  <option value="credit">Credit (+) Add funds</option>
                  <option value="debit">Debit (-) Deduct funds</option>
                  <option value="refund">Refund (+) Service dispute refund</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Amount (₹ INR)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  placeholder="e.g. 249"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#E63946] font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason / Justification</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify clear administrative reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
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
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#E63946] text-white font-bold flex items-center gap-1.5 shadow disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Execute Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
