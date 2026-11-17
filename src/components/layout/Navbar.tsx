'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import UserNavbar, { UserSessionData } from '@/components/layout/UserNavbar';
import PublicNavbar from '@/components/layout/PublicNavbar';
import { getSafeRedirectUrl } from '@/lib/rbac';
import {
  fetchClientSession,
  getStoredSession,
  storeClientSession,
  updateClientWalletBalance,
} from '@/lib/authClient';

export { default as UserNavbar } from '@/components/layout/UserNavbar';
export { default as PublicNavbar } from '@/components/layout/PublicNavbar';

export interface NavbarSessionState {
  isAuthenticated: boolean;
  user: UserSessionData | null;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] = useState<NavbarSessionState>(() => {
    const stored = getStoredSession();
    if (stored) {
      return {
        isAuthenticated: true,
        user: {
          id: stored.id,
          name: stored.name,
          email: stored.email,
          phone: stored.phone || '',
          role: stored.role || 'user',
          walletBalance: typeof stored.walletBalance === 'number' ? stored.walletBalance : 0,
        },
      };
    }
    return {
      isAuthenticated: false,
      user: null,
    };
  });
  const [isReady, setIsReady] = useState(false);

  // Fetch current user session & wallet balance from /api/auth/me via shared client service
  const fetchSession = async (force = false) => {
    try {
      const res = await fetchClientSession(force);
      if (res.authenticated && res.user) {
        setSession({
          isAuthenticated: true,
          user: {
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            phone: res.user.phone || '',
            role: res.user.role || 'user',
            walletBalance: res.user.walletBalance,
          },
        });
        return;
      }

      setSession({
        isAuthenticated: false,
        user: null,
      });
    } catch {
      setSession({
        isAuthenticated: false,
        user: null,
      });
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    // If not hydrated from storage yet, check storage first
    const stored = getStoredSession();
    if (stored && !session.isAuthenticated) {
      setSession({
        isAuthenticated: true,
        user: {
          id: stored.id,
          name: stored.name,
          email: stored.email,
          phone: stored.phone || '',
          role: stored.role || 'user',
          walletBalance: stored.walletBalance,
        },
      });
    }

    fetchSession();

    // Listen for custom wallet-updated events dispatched after payments or card deductions
    const handleWalletUpdated = (e: any) => {
      const newBal = e.detail;
      if (typeof newBal === 'number') {
        updateClientWalletBalance(newBal);
        setSession((prev) => {
          if (!prev.user) return prev;
          return {
            ...prev,
            user: { ...prev.user, walletBalance: newBal },
          };
        });
      } else {
        fetchSession(true);
      }
    };

    // Listen for auth-state-changed events
    const handleAuthChange = () => {
      fetchSession(true);
    };

    window.addEventListener('wallet-updated', handleWalletUpdated);
    window.addEventListener('auth-state-changed', handleAuthChange);
    return () => {
      window.removeEventListener('wallet-updated', handleWalletUpdated);
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, []);

  // Client-side fallback: ensure authenticated users accessing the homepage are redirected immediately
  useEffect(() => {
    if (session.isAuthenticated && session.user && pathname === '/') {
      const destination = getSafeRedirectUrl(null, session.user.role);
      router.replace(destination);
    }
  }, [session.isAuthenticated, session.user, pathname, router]);

  const handleWalletLocalUpdate = (newBalance: number) => {
    updateClientWalletBalance(newBalance);
    setSession((prev) => {
      if (!prev.user) return prev;
      return {
        ...prev,
        user: { ...prev.user, walletBalance: newBalance },
      };
    });
  };

  const handleLogoutSuccess = () => {
    storeClientSession(null);
    setSession({
      isAuthenticated: false,
      user: null,
    });
  };

  // If authenticated, render dedicated UserNavbar
  if (session.isAuthenticated && session.user) {
    return (
      <UserNavbar
        user={session.user}
        onWalletUpdated={handleWalletLocalUpdate}
        onLogout={handleLogoutSuccess}
      />
    );
  }

  // Otherwise render PublicNavbar
  return <PublicNavbar />;
}
