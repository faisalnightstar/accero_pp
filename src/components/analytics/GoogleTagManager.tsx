'use client';

import React from 'react';
import Script from 'next/script';
import { getGtmId, DEFAULT_GTM_ID } from '@/lib/analytics/dataLayer';

export { getGtmId, DEFAULT_GTM_ID };

/**
 * Centrally loads Google Tag Manager container script once via next/script.
 * Strategy: lazyOnload loads during browser idle time, preventing TBT and LCP delays.
 */
export function GoogleTagManager() {
  const gtmId = getGtmId();

  if (!gtmId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[GTM] Container ID is missing. GTM script was not loaded.');
    }
    return null;
  }

  return (
    <Script
      id="google-tag-manager"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `,
      }}
    />
  );
}

/**
 * Standard GTM noscript fallback iframe to be rendered immediately after the opening <body> tag.
 */
export function GoogleTagManagerNoscript() {
  const gtmId = getGtmId();

  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}

export default GoogleTagManager;
