'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { pushToDataLayer } from '@/lib/analytics/dataLayer';

interface WhatsAppSupportWidgetProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

/**
 * Floating WhatsApp Support Widget for Indian Operators (CSC, Cyber Cafe, VLEs)
 * Automatically pushes conversion event 'whatsapp_support_click' to GTM/GA4 dataLayer.
 */
export default function WhatsAppSupportWidget({
  phoneNumber = '919891210648',
  defaultMessage = 'Hello Accero Support, I run a CSC / Cyber Cafe and have a question about PrintPortal.',
}: WhatsAppSupportWidgetProps) {
  const handleClick = () => {
    // Dispatch sanitized analytics event to GTM / GA4
    pushToDataLayer({
      event: 'whatsapp_support_click',
      pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
    });
  };

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
    defaultMessage
  )}`;

  return (
    <aside
      aria-label="WhatsApp Support"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 no-print"
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

