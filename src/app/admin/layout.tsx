import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { isAdmin, isSuperAdmin } from '@/lib/rbac';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Tag,
  Sliders,
  CreditCard,
  BarChart3,
  ShieldAlert,
  Headphones,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !isAdmin(session.role)) {
    redirect('/dashboard?error=unauthorized_admin');
  }

  const superAdmin = isSuperAdmin(session.role);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B1E2D] to-[#E63946] flex items-center justify-center text-white font-black text-sm shadow">
              AP
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>Accero</span>
                <span className="text-[#E63946]">Admin</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                {superAdmin ? 'Super Administrator' : 'Platform Administrator'}
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto text-xs font-semibold">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-[#F4D35E]" />
            <span>Overview & Metrics</span>
          </Link>

          <Link
            href="/admin/operators"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Operator Management</span>
          </Link>

          <Link
            href="/admin/finance"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <Wallet className="w-4 h-4 text-blue-400" />
            <span>Wallet & Finance</span>
          </Link>

          <Link
            href="/admin/campaigns"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <Tag className="w-4 h-4 text-purple-400" />
            <span>Campaigns & Bonuses</span>
          </Link>

          <Link
            href="/admin/services"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Service Pricing</span>
          </Link>

          <Link
            href="/admin/payments"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <CreditCard className="w-4 h-4 text-rose-400" />
            <span>Payment Auditing</span>
          </Link>

          <Link
            href="/admin/reports"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Reports & Exports</span>
          </Link>

          {superAdmin && (
            <Link
              href="/admin/team"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-yellow-400" />
              <span>Team & Access Control</span>
            </Link>
          )}

          <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-1.5">
            <Link
              href="/support"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <Headphones className="w-4 h-4 text-emerald-400" />
              <span>Support Dashboard</span>
            </Link>

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
