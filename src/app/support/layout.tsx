import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { isSupportStaff, isAdmin, isSupportManager } from '@/lib/rbac';
import {
  Headphones,
  Ticket,
  Users,
  Wrench,
  BookOpen,
  LayoutDashboard,
  ExternalLink,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !isSupportStaff(session.role)) {
    redirect('/dashboard?error=unauthorized_support');
  }

  const adminAccess = isAdmin(session.role);
  const managerAccess = isSupportManager(session.role);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/support" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>Accero</span>
                <span className="text-emerald-400">Support</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                {session.role.replace('_', ' ')}
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto text-xs font-semibold">
          <Link
            href="/support"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>Support Overview</span>
          </Link>

          <Link
            href="/support/tickets"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <Ticket className="w-4 h-4 text-cyan-400" />
            <span>Ticket Queue</span>
          </Link>

          <Link
            href="/support/operators"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Operator Lookup</span>
          </Link>

          <Link
            href="/support/troubleshooting"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Troubleshooting</span>
          </Link>

          <Link
            href="/support/knowledge-base"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Knowledge Base</span>
          </Link>

          <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-1.5">
            {adminAccess && (
              <Link
                href="/admin"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Admin Console</span>
              </Link>
            )}

            <Link
              href="/dashboard"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Operator Portal</span>
              </span>
            </Link>
          </div>
        </nav>

        {/* User Badge */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs">
          <div className="truncate pr-2">
            <p className="font-bold text-white truncate">{session.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{session.email}</p>
          </div>
          <Link
            href="/api/auth/logout"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
