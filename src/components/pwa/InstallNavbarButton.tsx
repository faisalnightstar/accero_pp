'use client';

import React from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePwaInstall } from './usePwaInstall';
import IOSInstallModal from './IOSInstallModal';

interface InstallNavbarButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export default function InstallNavbarButton({
  className = '',
  variant = 'compact',
}: InstallNavbarButtonProps) {
  const {
    isMounted,
    isStandalone,
    isIOS,
    isIPadOS,
    showIOSModal,
    setShowIOSModal,
    installApp,
  } = usePwaInstall();

  // If running in standalone window or server-rendering, do not display install button
  if (!isMounted || isStandalone) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={installApp}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200/90 bg-slate-50/80 hover:bg-white hover:border-[#8B1E2D]/40 text-slate-700 hover:text-[#1D3557] text-xs font-semibold transition-all shadow-2xs shrink-0 cursor-pointer ${className}`}
        title="Install Accero PrintPortal on your device for standalone window access"
        aria-label="Install Accero PrintPortal App"
      >
        {isIOS || isIPadOS ? (
          <Smartphone className="w-3.5 h-3.5 text-[#8B1E2D] group-hover:scale-110 transition-transform shrink-0" />
        ) : (
          <Download className="w-3.5 h-3.5 text-[#8B1E2D] group-hover:scale-110 transition-transform shrink-0" />
        )}

        <span className="text-slate-800 font-bold whitespace-nowrap">
          {variant === 'full' ? (
            'Install PrintPortal App'
          ) : (
            <>
              <span className="hidden xl:inline">Install App</span>
              <span className="xl:hidden">Install</span>
            </>
          )}
        </span>

        <span className="hidden xl:inline-block text-[9px] px-1 py-0.2 rounded-md bg-[#8B1E2D]/10 text-[#8B1E2D] font-bold uppercase tracking-wider">
          PWA
        </span>
      </button>

      <IOSInstallModal
        isOpen={showIOSModal}
        onClose={() => setShowIOSModal(false)}
        isIPadOS={isIPadOS}
      />
    </>
  );
}
