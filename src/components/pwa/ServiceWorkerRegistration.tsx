'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events';

export default function ServiceWorkerRegistration() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdateBar, setShowUpdateBar] = useState(false);

  useEffect(() => {
    // Only execute on browser environment
    if (typeof window === 'undefined') return;

    // Detect standalone launch
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      trackEvent(ANALYTICS_EVENTS.PWA_STANDALONE_LAUNCH, {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
      });
    }

    // Check service worker support
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // Only register in secure context or localhost
    const isLocalhost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (window.location.protocol !== 'https:' && !isLocalhost) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // 1. Check if a worker is already waiting
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdateBar(true);
          trackEvent(ANALYTICS_EVENTS.PWA_UPDATE_AVAILABLE);
        }

        // 2. Listen for newly installed workers that transition to waiting
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setShowUpdateBar(true);
              trackEvent(ANALYTICS_EVENTS.PWA_UPDATE_AVAILABLE);
            }
          });
        });
      } catch (error) {
        console.warn('[PWA] Service Worker registration failed:', error);
      }
    };

    // Delay registration slightly until window load to prioritize Core Web Vitals
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      trackEvent(ANALYTICS_EVENTS.PWA_UPDATE_COMPLETED);

      // Listen for controlling service worker change and reload
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  };

  if (!showUpdateBar) {
    return null;
  }

  return (
    <aside
      aria-label="Application update alert"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#1D3557] text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 no-print"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#8B1E2D] flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-200">Update Ready</p>
          <p className="text-sm font-medium text-white leading-tight">
            A new version of Accero is available.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleUpdate}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8B1E2D] hover:bg-[#A32435] text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Update Now
        </button>
        <button
          onClick={() => setShowUpdateBar(false)}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
          aria-label="Dismiss update notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
