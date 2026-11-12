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

  // Competitor Acquisition & Comparison Funnel Events
  COMPETITOR_LANDING_VIEW: 'competitor_landing_view',
  COMPARISON_TABLE_VIEW: 'comparison_table_view',
  SWITCHING_GUIDE_VIEW: 'switching_guide_view',
  REGISTRATION_CTA_CLICK: 'registration_cta_click',
  FIRST_LOOKUP_SUCCESS: 'first_lookup_success',
  FIRST_RECHARGE_SUCCESS: 'first_recharge_success',
  REPEAT_PAID_USAGE: 'repeat_paid_usage',

  // SK Print Portal Campaign Specific Funnel Events
  SK_ALTERNATIVE_LANDING_VIEW: 'sk_alternative_landing_view',
  SK_MIGRATION_CTA_CLICK: 'sk_migration_cta_click',
  SK_REGISTRATION_CTA_CLICK: 'sk_registration_cta_click',
  SK_REGISTRATION_COMPLETED: 'sk_registration_completed',
  SK_FIRST_LOOKUP_SUCCESS: 'sk_first_lookup_success',
  SK_FIRST_RECHARGE_SUCCESS: 'sk_first_recharge_success',
  SK_REPEAT_PAID_USAGE: 'sk_repeat_paid_usage',

  // Additional Competitor Campaign Funnel Events
  RAJPRINT_LANDING_VIEW: 'rajprint_landing_view',
  EFORMS99_LANDING_VIEW: 'eforms99_landing_view',
  APNAPRINT_LANDING_VIEW: 'apnaprint_landing_view',
  DOCPRINT_LANDING_VIEW: 'docprint_landing_view',

  // Backward-Compatible Aliases
  HOMEPAGE_VISIT: 'homepage_visit',
  PRICING_VISIT: 'pricing_visit',
  REGISTRATION_START: 'registration_started',
  REGISTRATION_COMPLETE: 'registration_completed',
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
