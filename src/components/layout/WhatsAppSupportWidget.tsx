'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppSupportWidgetProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

/**
 * Floating WhatsApp Support Widget for Indian Operators (CSC, Cyber Cafe, VLEs)
 * Automatically pushes conversion event 'whatsapp_support_click' to GTM/GA4 dataLayer.
 */
export default function WhatsAppSupportWidget({
  phoneNumber = '919876543210',
  defaultMessage = 'Hello Accero Support, I run a CSC / Cyber Cafe and have a question about PrintPortal.',
}: WhatsAppSupportWidgetProps) {
  const handleClick = () => {
    // Dispatch analytics event to GTM / GA4
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'whatsapp_support_click',
        pagePath: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
    defaultMessage
  )}`;

  return (
    <aside
      aria-label="WhatsApp Support"
      className="fixed bottom-6 right-6 z-40 no-print"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="group flex items-center gap-2.5 px-4 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        aria-label="Chat with Operator Support on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 text-white shrink-0 fill-current" />
        <span className="hidden sm:inline-block text-xs font-bold tracking-wide">
          Operator Support
        </span>
      </a>
    </aside>
  );
}

