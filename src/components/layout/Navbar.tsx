'use client';

import React, { useEffect, useState } from 'react';
import UserNavbar, { UserSessionData } from '@/components/layout/UserNavbar';
import PublicNavbar from '@/components/layout/PublicNavbar';

export { default as UserNavbar } from '@/components/layout/UserNavbar';
export { default as PublicNavbar } from '@/components/layout/PublicNavbar';

export interface NavbarSessionState {
  isAuthenticated: boolean;
  user: UserSessionData | null;
}

export default function Navbar() {
  const [session, setSession] = useState<NavbarSessionState>({
    isAuthenticated: false,
    user: null,
  });
  const [isReady, setIsReady] = useState(false);

  // Fetch current user session & wallet balance from /api/auth/me
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setSession({
            isAuthenticated: true,
            user: {
              id: data.user.id || data.user._id,
              name: data.user.name || '',
              email: data.user.email || '',
              phone: data.user.phone || '',
              role: data.user.role || 'user',
              walletBalance:
                typeof data.user.walletBalance === 'number' ? data.user.walletBalance : 0,
            },
          });
          return;
        }
      }

      setSession({
        isAuthenticated: false,
        user: null,
      });
    } catch (err) {
      setSession({
        isAuthenticated: false,
        user: null,
      });
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    fetchSession();

    // Listen for custom wallet-updated events dispatched after payments or card deductions
    const handleWalletUpdated = (e: any) => {
      const newBal = e.detail;
      if (typeof newBal === 'number') {
        setSession((prev) => {
          if (!prev.user) return prev;
          return {
            ...prev,
            user: { ...prev.user, walletBalance: newBal },
          };
        });
      } else {
        fetchSession();
      }
    };

    // Listen for auth-state-changed events
    const handleAuthChange = () => {
      fetchSession();
    };

    window.addEventListener('wallet-updated', handleWalletUpdated);
    window.addEventListener('auth-state-changed', handleAuthChange);
    return () => {
      window.removeEventListener('wallet-updated', handleWalletUpdated);
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, []);

  const handleWalletLocalUpdate = (newBalance: number) => {
    setSession((prev) => {
      if (!prev.user) return prev;
      return {
        ...prev,
        user: { ...prev.user, walletBalance: newBalance },
      };
    });
  };

  const handleLogoutSuccess = () => {
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
