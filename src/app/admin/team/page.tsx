'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import {
  getAdminTeam,
  createTeamMember,
  updateTeamMemberRole,
} from '@/actions/admin';
import { UserRole } from '@/models/User';

export default function AdminTeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('support_agent');

  const [submitting, setSubmitting] = useState(false);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const data = await getAdminTeam();
      setTeam(data);
    } catch (err: any) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      await createTeamMember({
        name,
        email,
        phone,
        password,
        role,
      });

      setFeedback({ type: 'success', message: 'Staff member created successfully!' });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      await fetchTeam();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create staff member' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!confirm(`Are you sure you want to change this staff member's role to ${newRole.toUpperCase()}?`)) return;
    setChangingId(userId);
    try {
      await updateTeamMemberRole(userId, newRole);
      setFeedback({ type: 'success', message: 'Staff role updated successfully!' });
      await fetchTeam();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update role' });
    } finally {
      setChangingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-yellow-400" />
            Internal Staff & Access Control (RBAC)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Super Administrator console for managing platform administrators, support managers, and agents.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTeam}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Staff Member
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

      {/* RBAC Info Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="space-y-1">
          <span className="font-bold text-yellow-400 font-mono">SUPER_ADMIN</span>
          <p className="text-slate-400">Full system authority, team access management, financial limit bypass.</p>
        </div>
        <div className="space-y-1">
          <span className="font-bold text-indigo-400 font-mono">ADMIN</span>
          <p className="text-slate-400">Business operations, pricing, marketing campaigns, operator adjustments &lt; ₹10k.</p>
        </div>
        <div className="space-y-1">
          <span className="font-bold text-purple-400 font-mono">SUPPORT_MANAGER</span>
          <p className="text-slate-400">Ticket assignment, escalation routing, support workload oversight.</p>
        </div>
        <div className="space-y-1">
          <span className="font-bold text-emerald-400 font-mono">SUPPORT_AGENT</span>
          <p className="text-slate-400">Resolving operator queries with masked contact PII. No wallet or citizen document access.</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Login</th>
                <th className="px-5 py-3.5">Created Date</th>
                <th className="px-5 py-3.5 text-right">Modify Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-yellow-400" />
                    Loading staff directory...
                  </td>
                </tr>
              ) : team.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No staff members found.
                  </td>
                </tr>
              ) : (
                team.map((member) => {
                  const isChanging = changingId === member.id;
                  const isSuper = member.role === 'super_admin';

                  return (
                    <tr key={member.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{member.name}</p>
                            <p className="text-[10px] text-slate-500">ID: {member.id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-slate-300">{member.email}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{member.phone || 'N/A'}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                            member.role === 'super_admin'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                              : member.role === 'admin'
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                              : member.role === 'support_manager'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          {member.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                        {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                          disabled={isChanging}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-yellow-500"
                        >
                          <option value="support_agent">Support Agent</option>
                          <option value="support_manager">Support Manager</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-yellow-400" />
                Add Internal Staff Member
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Work Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@accero.app"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role Assignment *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="support_agent">Support Agent (Tickets & Masked Queries)</option>
                  <option value="support_manager">Support Manager (Assignments & Escalations)</option>
                  <option value="admin">Platform Admin (Business & Finances)</option>
                  <option value="super_admin">Super Administrator (Full System Authority)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
