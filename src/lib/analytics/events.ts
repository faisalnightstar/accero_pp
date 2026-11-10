/**
 * Privacy-Conscious Analytics & Conversion Tracking
 * Accero PrintPortal (https://printportal.accero.app)
 *
 * GUARANTEES:
 * 1. Zero PII: Never logs, captures, or transmits citizen identity numbers (Aadhaar, PAN, EPIC, DL, RC), names, addresses, or photos.
 * 2. Zero Financial Secrets: Never logs wallet balance numbers, bank details, or UPI VPA credentials.
 * 3. Minimal Metadata: Strictly tracks anonymous workflow funnel events to optimize operator acquisition and activation.
 */

export const ANALYTICS_EVENTS = {
  HOMEPAGE_VISIT: 'homepage_visit',
  PRICING_VISIT: 'pricing_visit',
  REGISTRATION_START: 'registration_start',
  REGISTRATION_COMPLETE: 'registration_complete',
  FIRST_LOOKUP_SUCCESS: 'first_lookup_success',
  FIRST_RECHARGE_SUCCESS: 'first_recharge_success',
  FIRST_PRINT_SUCCESS: 'first_print_success',
  RETURNING_CUSTOMER: 'returning_customer',
  PILLAR_PAGE_VIEW: 'pillar_page_view',
} as const;

export type AnalyticsEventType = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

export interface SafeEventMetadata {
  pagePath?: string;
  referrer?: string;
  docCategory?: 'pan' | 'aadhaar' | 'voter' | 'dl' | 'rc' | 'ration' | 'manual';
  operatorRole?: 'cyber_cafe' | 'csc_vle' | 'retailer' | 'print_shop' | 'other';
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  timestamp?: number;
}

/**
 * Sanitizes and strips any accidental sensitive fields before dispatching.
 */
function sanitizeMetadata(data?: Record<string, any>): SafeEventMetadata {
  if (!data) return {};

  const clean: SafeEventMetadata = {};
  if (typeof data.pagePath === 'string') clean.pagePath = data.pagePath;
  if (typeof data.referrer === 'string') clean.referrer = data.referrer;
  if (typeof data.docCategory === 'string') clean.docCategory = data.docCategory as any;
  if (typeof data.operatorRole === 'string') clean.operatorRole = data.operatorRole as any;
  if (typeof data.deviceType === 'string') clean.deviceType = data.deviceType as any;
  clean.timestamp = Date.now();

  return clean;
}

/**
 * Dispatches a client-side analytics event.
 * Compatible with GTM, Plausible, PostHog, or standard window events without tracking cookies.
 */
export function trackEvent(eventType: AnalyticsEventType, metadata?: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  const sanitized = sanitizeMetadata(metadata);

  // 1. Dispatch custom DOM event for decoupled listeners
  try {
    const customEvent = new CustomEvent('accero:analytics', {
      detail: {
        event: eventType,
        ...sanitized,
      },
    });
    window.dispatchEvent(customEvent);
  } catch {
    // Silent catch for legacy browser environments
  }

  // 2. Dispatch to window.dataLayer if configured (GTM / GA4)
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: eventType,
      ...sanitized,
    });
  }

  // 3. Development audit logging
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug(`[Accero Analytics] Event: ${eventType}`, sanitized);
  }
}

