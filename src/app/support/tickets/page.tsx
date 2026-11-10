'use client';

import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Search,
  Filter,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  User,
  Send,
  Lock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import {
  getSupportTickets,
  getSupportTicketDetail,
  createSupportTicket,
  addTicketMessage,
  escalateSupportTicket,
  resolveSupportTicket,
} from '@/actions/support';
import { TicketCategory, TicketPriority, TicketStatus } from '@/models/SupportTicket';

const CATEGORIES: TicketCategory[] = [
  'Account/Login Issue',
  'Wallet Recharge Issue',
  'Payment Pending',
  'Wallet Balance Discrepancy',
  'Document Lookup Failure',
  'Printing Issue',
  'Reprint Issue',
  'Pricing Query',
  'Promotional Bonus Issue',
  'Technical Issue',
  'Other',
];

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Selected ticket drawer
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketDetail, setTicketDetail] = useState<any | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Drawer action states
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Escalate & Resolve Modals
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  // Create Ticket Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<TicketCategory>('Technical Issue');
  const [newPriority, setNewPriority] = useState<TicketPriority>('NORMAL');
  const [newOperatorEmail, setNewOperatorEmail] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getSupportTickets({
        page,
        limit: 20,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        search,
      });
      setTickets(res.tickets);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err: any) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter, priorityFilter, categoryFilter]);

  const loadTicketDetail = async (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setDrawerLoading(true);
    try {
      const data = await getSupportTicketDetail(ticketId);
      setTicketDetail(data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load ticket detail' });
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicketId) return;
    setActionLoading(true);
    try {
      await addTicketMessage(selectedTicketId, replyMessage, isInternalNote);
      setReplyMessage('');
      await loadTicketDetail(selectedTicketId);
      await fetchTickets();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to send message' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalateReason.trim() || !selectedTicketId) return;
    setActionLoading(true);
    try {
      await escalateSupportTicket(selectedTicketId, escalateReason);
      setShowEscalateModal(false);
      setEscalateReason('');
      setFeedback({ type: 'success', message: 'Ticket escalated to support manager' });
      await loadTicketDetail(selectedTicketId);
      await fetchTickets();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to escalate ticket' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNote.trim() || !selectedTicketId) return;
    setActionLoading(true);
    try {
      await resolveSupportTicket(selectedTicketId, resolutionNote);
      setShowResolveModal(false);
      setResolutionNote('');
      setFeedback({ type: 'success', message: 'Ticket marked as resolved!' });
      await loadTicketDetail(selectedTicketId);
      await fetchTickets();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to resolve ticket' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      const res = await createSupportTicket({
        subject: newSubject,
        category: newCategory,
        priority: newPriority,
        operatorEmail: newOperatorEmail,
        description: newDescription,
      });
      setShowCreateModal(false);
      setNewSubject('');
      setNewOperatorEmail('');
      setNewDescription('');
      setFeedback({ type: 'success', message: `Ticket ${res.ticketId} created successfully!` });
      await fetchTickets();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create ticket' });
    } finally {
      setCreateSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'NORMAL':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'ESCALATED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'WAITING_FOR_OPERATOR':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-cyan-400" />
            Customer Support Ticket Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Triage, investigate, and resolve operator issues with masked contact details and zero citizen PII exposure.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create Ticket
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

      {/* Filters & Search */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
            placeholder="Search Ticket ID, subject, operator..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_OPERATOR">Waiting for Operator</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 max-w-[200px]"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Ticket ID</th>
                <th className="px-5 py-3.5">Subject & Category</th>
                <th className="px-5 py-3.5">Operator</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Assigned To</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    Loading support tickets...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    No tickets found matching the specified filters.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-white">
                      {t.ticketId}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-200 line-clamp-1">{t.subject}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{t.category}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-300">{t.operatorName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{t.operatorEmail}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getPriorityBadge(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getStatusBadge(
                          t.status
                        )}`}
                      >
                        {t.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                      {t.assignedAgentName}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => loadTicketDetail(t.ticketId)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 text-xs font-medium transition-colors"
                      >
                        View & Reply
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing {tickets.length} of {total} tickets
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Detail Drawer */}
      {selectedTicketId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-white text-base">
                    {ticketDetail?.ticketId || selectedTicketId}
                  </span>
                  {ticketDetail && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getStatusBadge(
                        ticketDetail.status
                      )}`}
                    >
                      {ticketDetail.status.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-semibold">{ticketDetail?.subject}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedTicketId(null);
                  setTicketDetail(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {drawerLoading || !ticketDetail ? (
                <div className="py-20 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                  Loading conversation history...
                </div>
              ) : (
                <>
                  {/* Metadata Card */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-mono">Operator</span>
                      <p className="font-semibold text-white">{ticketDetail.operatorName}</p>
                      <p className="text-slate-400 font-mono text-[11px]">{ticketDetail.operatorEmail}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-mono">Category</span>
                      <p className="text-slate-200 font-mono">{ticketDetail.category}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-mono">Assigned Staff</span>
                      <p className="text-slate-200">{ticketDetail.assignedAgentName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-mono">Priority</span>
                      <p className="font-mono text-white font-bold">{ticketDetail.priority}</p>
                    </div>
                  </div>

                  {/* Resolution Banner if resolved */}
                  {ticketDetail.resolution && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Resolved by {ticketDetail.resolution.resolvedByName} on{' '}
                        {new Date(ticketDetail.resolution.resolvedAt).toLocaleDateString()}
                      </div>
                      <p className="text-emerald-200/90 pl-5">{ticketDetail.resolution.resolutionNote}</p>
                    </div>
                  )}

                  {/* Message Thread */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Communication Thread
                    </h4>

                    {ticketDetail.messages.map((m: any) => (
                      <div
                        key={m.id}
                        className={`rounded-xl p-4 space-y-1.5 text-xs ${
                          m.senderRole === 'operator' || m.senderRole === 'user'
                            ? 'bg-slate-950 border border-slate-800 text-slate-200 mr-8'
                            : 'bg-cyan-950/30 border border-cyan-800/40 text-cyan-100 ml-8'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] opacity-75">
                          <span className="font-semibold">{m.senderName} ({m.senderRole})</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Internal Notes Section */}
                  {ticketDetail.internalNotes.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Confidential Staff Notes (Hidden from Operator)
                      </h4>

                      {ticketDetail.internalNotes.map((n: any) => (
                        <div
                          key={n.id}
                          className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3.5 space-y-1 text-xs text-amber-200"
                        >
                          <div className="flex items-center justify-between text-[10px] text-amber-400 font-mono">
                            <span>{n.authorName} ({n.authorRole})</span>
                            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="leading-relaxed">{n.note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Drawer Footer: Reply box & Quick actions */}
            {ticketDetail && (
              <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
                {/* Action buttons: Escalate & Resolve */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsInternalNote(!isInternalNote)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-colors flex items-center gap-1 ${
                        isInternalNote
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      {isInternalNote ? 'Internal Note Mode' : 'Public Reply'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {ticketDetail.status !== 'ESCALATED' && ticketDetail.status !== 'RESOLVED' && (
                      <button
                        onClick={() => setShowEscalateModal(true)}
                        className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        Escalate
                      </button>
                    )}
                    {ticketDetail.status !== 'RESOLVED' && (
                      <button
                        onClick={() => setShowResolveModal(true)}
                        className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                {/* Reply Input Form */}
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={
                      isInternalNote
                        ? 'Type private note for internal staff...'
                        : 'Type reply to operator...'
                    }
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading || !replyMessage.trim()}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 ${
                      isInternalNote ? 'bg-amber-600 hover:bg-amber-500' : 'bg-cyan-600 hover:bg-cyan-500'
                    }`}
                  >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-400" />
              Escalate to Support Manager
            </h3>
            <p className="text-xs text-slate-400">
              Escalating flags this ticket as URGENT priority and notifies support leadership.
            </p>
            <form onSubmit={handleEscalate} className="space-y-4">
              <textarea
                required
                rows={3}
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                placeholder="Explain why this ticket requires management escalation..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Mark Ticket as Resolved
            </h3>
            <p className="text-xs text-slate-400">
              Record a brief summary of how the operator's issue was addressed.
            </p>
            <form onSubmit={handleResolve} className="space-y-4">
              <textarea
                required
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. UTR verified and credited, operator successfully printed PAN card."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-400" />
                Create Support Ticket
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Operator Email *</label>
                <input
                  type="email"
                  required
                  value={newOperatorEmail}
                  onChange={(e) => setNewOperatorEmail(e.target.value)}
                  placeholder="operator@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Brief summary of the issue..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TicketCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority *</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the problem, error message, or transaction ID..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {createSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
