/**
 * Privacy-Conscious Analytics & Conversion Tracking
 * Accero PrintPortal (https://printportal.accero.app)
 *
 * GUARANTEES:
 * 1. Zero Citizen PII: Never logs or transmits Aadhaar, PAN, EPIC, DL, RC, Ration numbers, citizen names, photos, or DOB.
 * 2. Zero Financial Data: Never logs wallet balance numbers, bank account numbers, or UPI VPAs.
 * 3. Strictly Sanitized Funnel Events: Dispatches anonymous, non-sensitive metrics to GTM / GA4.
 */

import { pushToDataLayer, pushPageView as dataLayerPageView } from './dataLayer';

export const ANALYTICS_EVENTS = {
  // Required Standard GA4 / GTM Conversion Funnel Events
  PAGE_VIEW: 'page_view',
  REGISTRATION_STARTED: 'registration_started',
  REGISTRATION_COMPLETED: 'registration_completed',
  FIRST_LOOKUP: 'first_lookup',
  LOOKUP_FAILED: 'lookup_failed',
  RECHARGE_STARTED: 'recharge_started',
  RECHARGE_COMPLETED: 'recharge_completed',
  PRINT_STARTED: 'print_started',
  PRINT_COMPLETED: 'print_completed',
  REPEAT_PRINT: 'repeat_print',

  // Backward-Compatible Aliases
  HOMEPAGE_VISIT: 'homepage_visit',
  PRICING_VISIT: 'pricing_visit',
  REGISTRATION_START: 'registration_started',
  REGISTRATION_COMPLETE: 'registration_completed',
  FIRST_LOOKUP_SUCCESS: 'first_lookup',
  FIRST_RECHARGE_SUCCESS: 'recharge_completed',
  FIRST_PRINT_SUCCESS: 'print_completed',
  RETURNING_CUSTOMER: 'repeat_print',
  PILLAR_PAGE_VIEW: 'pillar_page_view',
} as const;

export type AnalyticsEventType = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

export interface SafeEventMetadata {
  pagePath?: string;
  pageTitle?: string;
  referrer?: string;
  docType?: 'PAN' | 'AADHAAR' | 'VOTER' | 'DL' | 'RC' | 'RATION' | string;
  docCategory?: 'pan' | 'aadhaar' | 'voter' | 'dl' | 'rc' | 'ration' | 'manual' | string;
  isManual?: boolean;
  errorType?: string;
  paymentMethod?: 'GATEWAY' | 'MANUAL_UTR' | 'UPI' | string;
  rechargeAmount?: number;
  printFormat?: 'CR80' | 'A4' | string;
  isReprint?: boolean;
  operatorRole?: 'cyber_cafe' | 'csc_vle' | 'retailer' | 'print_shop' | 'other';
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  [key: string]: any;
}

/**
 * Dispatches a client-side analytics event to window.dataLayer (GTM/GA4)
 * and dispatches a local DOM event for any custom listeners.
 */
export function trackEvent(eventType: AnalyticsEventType, metadata?: SafeEventMetadata): void {
  if (typeof window === 'undefined') return;

  // 1. Dispatch custom DOM event
  try {
    const customEvent = new CustomEvent('accero:analytics', {
      detail: {
        event: eventType,
        ...metadata,
      },
    });
    window.dispatchEvent(customEvent);
  } catch {
    // Silent catch for legacy browsers
  }

  // 2. Dispatch sanitized event to GTM dataLayer
  pushToDataLayer({
    event: eventType,
    ...metadata,
  });
}

/**
 * Convenience helper to dispatch virtual page views on App Router navigation.
 */
export function trackPageView(pathname: string, searchParamsString?: string): void {
  dataLayerPageView(pathname, searchParamsString);
}
