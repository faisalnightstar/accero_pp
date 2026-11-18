'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { getApplicationContext } from '@/lib/layout/routeContext';
import PublicNavbar from '@/components/layout/PublicNavbar';
import Footer from '@/components/layout/Footer';
import WhatsAppSupportWidget from '@/components/layout/WhatsAppSupportWidget';

export interface AppLayoutShellProps {
  children: React.ReactNode;
}

/**
 * AppLayoutShell: Authoritative root layout manager.
 * Determines layout boundaries according to application context:
 * - 'admin': Children own the layout (AdminLayout with AdminHeader & Sidebar).
 * - 'support': Children own the layout (SupportLayout with SupportHeader & Sidebar).
 * - 'operator': Children own the layout (DashboardLayout/StudioLayout/etc. with OperatorShell).
 * - 'auth': Clean authentication layout (PublicNavbar, children, Footer).
 * - 'public': Full marketing layout (PublicNavbar, children, WhatsApp, Footer).
 */
export default function AppLayoutShell({ children }: AppLayoutShellProps) {
  const pathname = usePathname();
  const context = getApplicationContext(pathname);

  // Authenticated operational domains manage their own dedicated application shells
  if (context === 'admin' || context === 'support' || context === 'operator') {
    return <>{children}</>;
  }

  // Authentication routes: include public navbar and footer for orientation without floating widgets
  if (context === 'auth') {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicNavbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  // Public marketing & SEO routes: render the full public website experience
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <WhatsAppSupportWidget />
      <Footer />
    </div>
  );
}
