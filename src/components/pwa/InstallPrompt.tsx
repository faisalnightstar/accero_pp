'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Download, X } from 'lucide-react';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { usePwaInstall } from './usePwaInstall';
import IOSInstallModal from './IOSInstallModal';

const DISMISSAL_STORAGE_KEY = 'accero_pwa_dismissed_until';
const DISMISSAL_COOLDOWN_DAYS = 7;

export default function InstallPrompt() {
  const pathname = usePathname();
  const {
    isMounted,
    isStandalone,
    isIOS,
    isIPadOS,
    showIOSModal,
    setShowIOSModal,
    installApp,
    deferredPrompt,
  } = usePwaInstall();

  const [showFloatingBanner, setShowFloatingBanner] = useState(false);

  // Determine if current route is an authenticated operator workspace
  const isAuthenticatedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/wallet') ||
    pathname.startsWith('/cards') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/support');

  useEffect(() => {
    if (!isMounted || isStandalone) {
      setShowFloatingBanner(false);
      return;
    }

    // If operator is on an authenticated workspace route, they already have the Install App button in their Navbar
    if (isAuthenticatedRoute) {
      setShowFloatingBanner(false);
      return;
    }

    // Check 7-day cooldown dismissal
    try {
      const dismissedUntil = localStorage.getItem(DISMISSAL_STORAGE_KEY);
      if (dismissedUntil && parseInt(dismissedUntil, 10) > Date.now()) {
        setShowFloatingBanner(false);
        return;
      }
    } catch {
      // Ignore localStorage permission errors
    }

    // On Chromium, show banner when prompt is captured
    if (deferredPrompt) {
      setShowFloatingBanner(true);
      trackEvent(ANALYTICS_EVENTS.PWA_INSTALL_PROMPT_VIEW, { platform: 'chromium' });
    } else if (isIOS || isIPadOS) {
      // For iOS Safari visitors on public pages, show banner after a gentle delay
      const timer = setTimeout(() => {
        setShowFloatingBanner(true);
        trackEvent(ANALYTICS_EVENTS.PWA_INSTALL_PROMPT_VIEW, {
          platform: isIOS ? 'ios' : 'ipados',
        });
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isMounted, isStandalone, isAuthenticatedRoute, deferredPrompt, isIOS, isIPadOS]);

  const handleDismiss = () => {
    setShowFloatingBanner(false);
    try {
      const cooldownMs = DISMISSAL_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(DISMISSAL_STORAGE_KEY, (Date.now() + cooldownMs).toString());
    } catch {
      // Ignore storage errors
    }
    trackEvent(ANALYTICS_EVENTS.PWA_INSTALL_PROMPT_DISMISS);
  };

  return (
    <>
      {/* Floating PWA Install Card Banner (Positioned on the BOTTOM-LEFT so it NEVER collides with bottom-right WhatsApp widget) */}
      {!isStandalone && showFloatingBanner && (
        <aside
          aria-label="Install Accero PrintPortal"
          className="fixed bottom-6 left-4 sm:left-6 sm:right-auto sm:w-96 z-40 bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 no-print"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/icons/icon-192.png"
                  alt="Accero PrintPortal"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain rounded-lg"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1D3557] flex items-center gap-1.5">
                  Install Accero PrintPortal
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                    App
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-snug">
                  Add Accero to your device for faster access to your document-processing workspace.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              aria-label="Dismiss install prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              onClick={handleDismiss}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
            <button
              onClick={installApp}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B1E2D] hover:bg-[#A32435] text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {isIOS || isIPadOS ? 'How to Install on iPhone' : 'Install App'}
            </button>
          </div>
        </aside>
      )}

      {/* iOS Step-by-Step Installation Modal */}
      <IOSInstallModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
        isIPadOS={isIPadOS}
      />
    </>
  );
}
