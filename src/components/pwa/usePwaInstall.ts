'use client';

import { useState, useEffect, useCallback } from 'react';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Global reference so both Navbar button and floating prompt can share the captured prompt
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

function setGlobalPrompt(prompt: BeforeInstallPromptEvent | null) {
  globalDeferredPrompt = prompt;
  promptListeners.forEach((listener) => listener(prompt));
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    setGlobalPrompt(e as BeforeInstallPromptEvent);
  });

  window.addEventListener('appinstalled', () => {
    setGlobalPrompt(null);
    trackEvent(ANALYTICS_EVENTS.PWA_INSTALL_COMPLETED);
  });
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    globalDeferredPrompt
  );
  const [isStandalone, setIsStandalone] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [isIPadOS, setIsIPadOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // 1. Detect standalone mode
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const checkStandalone = () => {
      const isAppStandalone =
        standaloneQuery.matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isAppStandalone);
    };

    checkStandalone();
    standaloneQuery.addEventListener('change', checkStandalone);

    // 2. Detect iOS / iPadOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipod/.test(ua);
    const isIPad =
      /ipad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    setIsIOS(isIOSDevice);
    setIsIPadOS(isIPad);

    // 3. Subscribe to global deferred prompt updates
    const handlePromptChange = (prompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(prompt);
    };

    promptListeners.add(handlePromptChange);
    setDeferredPrompt(globalDeferredPrompt);

    return () => {
      standaloneQuery.removeEventListener('change', checkStandalone);
      promptListeners.delete(handlePromptChange);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (isIOS || isIPadOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback for browsers without beforeinstallprompt or desktop Safari
      setShowIOSModal(true);
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        trackEvent(ANALYTICS_EVENTS.PWA_INSTALL_COMPLETED);
        setGlobalPrompt(null);
      } else {
        trackEvent(ANALYTICS_EVENTS.PWA_INSTALL_PROMPT_DISMISS);
      }
    } catch (err) {
      console.warn('[PWA] Installation failed:', err);
    }
  }, [deferredPrompt, isIOS, isIPadOS]);

  const canInstall = !isStandalone && (Boolean(deferredPrompt) || isIOS || isIPadOS);

  return {
    isMounted,
    isStandalone,
    canInstall,
    isIOS,
    isIPadOS,
    deferredPrompt,
    showIOSModal,
    setShowIOSModal,
    installApp,
  };
}
