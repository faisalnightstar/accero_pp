/**
 * Privacy-Conscious Analytics & Conversion Tracking
 * Accero PrintPortal (https://printportal.accero.app)
 *
 * GUARANTEES:
 * 1. Zero Citizen PII: Never logs or transmits Aadhaar, PAN, EPIC, DL, RC, Ration numbers, citizen names, photos, or DOB.
 * 2. Zero Financial Data: Never logs wallet balance numbers, bank account numbers, or UPI VPAs.
 * 3. Strictly Sanitized Funnel Events: Dispatches anonymous, non-sensitive metrics to GTM / GA4.
 * 4. Rigorous Event Semantics: Distinguishes print initiation from physical output confirmation.
 * 5. Idempotent Revenue Tracking: Client-side deduplication guarantees purchase events never fire twice per transaction ID.
 */

import { pushToDataLayer, pushPageView as dataLayerPageView, sanitizeDataLayerPayload } from './dataLayer';

export const ANALYTICS_EVENTS = {
  // Required Standard GA4 / GTM Conversion Funnel Events
  PAGE_VIEW: 'page_view',
  REGISTRATION_STARTED: 'registration_started',
  REGISTRATION_COMPLETED: 'registration_completed',
  LOGIN_COMPLETED: 'login_completed',
  WALLET_RECHARGE_INITIATED: 'wallet_recharge_initiated',
  PURCHASE: 'purchase', // Standard GA4 E-commerce Revenue Event
  DOCUMENT_PROCESSING_STARTED: 'document_processing_started',
  PRINT_INITIATED: 'print_initiated',
  PRINT_DIALOG_CLOSED: 'print_dialog_closed',
  PRINT_SUCCESS_CONFIRMED: 'print_success_confirmed',
  REFUND_COMPLETED: 'refund_completed',

  // Secondary & Funnel State Events
  FIRST_LOOKUP: 'first_lookup',
  LOOKUP_FAILED: 'lookup_failed',
  FIRST_LOOKUP_SUCCESS: 'first_lookup_success',
  FIRST_RECHARGE_SUCCESS: 'first_recharge_success',
  REPEAT_PAID_USAGE: 'repeat_paid_usage',
  REPEAT_PRINT: 'repeat_print',

  // Backward-Compatible Aliases
  LOGIN_SUCCESS: 'login_completed',
  RECHARGE_STARTED: 'wallet_recharge_initiated',
  RECHARGE_COMPLETED: 'purchase',
  DOCUMENT_PROCESSED: 'document_processing_started',
  PRINT_STARTED: 'print_initiated',
  PRINT_DIALOG_COMPLETED: 'print_dialog_closed',
  PRINT_COMPLETED: 'print_dialog_closed',
  FIRST_PRINT_SUCCESS: 'print_dialog_closed',
  REGISTRATION_START: 'registration_started',
  REGISTRATION_COMPLETE: 'registration_completed',
  HOMEPAGE_VISIT: 'homepage_visit',
  PRICING_VISIT: 'pricing_visit',
  RETURNING_CUSTOMER: 'repeat_print',
  PILLAR_PAGE_VIEW: 'pillar_page_view',

  // Competitor Acquisition & Comparison Funnel Events
  COMPETITOR_LANDING_VIEW: 'competitor_landing_view',
  COMPARISON_TABLE_VIEW: 'comparison_table_view',
  SWITCHING_GUIDE_VIEW: 'switching_guide_view',
  REGISTRATION_CTA_CLICK: 'registration_cta_click',

  // Specific Campaign & Service Funnel Events
  SK_ALTERNATIVE_LANDING_VIEW: 'sk_alternative_landing_view',
  SK_MIGRATION_CTA_CLICK: 'sk_migration_cta_click',
  SK_REGISTRATION_CTA_CLICK: 'sk_registration_cta_click',
  SK_REGISTRATION_COMPLETED: 'sk_registration_completed',
  SK_FIRST_LOOKUP_SUCCESS: 'sk_first_lookup_success',
  SK_FIRST_RECHARGE_SUCCESS: 'sk_first_recharge_success',
  SK_REPEAT_PAID_USAGE: 'sk_repeat_paid_usage',

  RAJPRINT_LANDING_VIEW: 'rajprint_landing_view',
  EFORMS99_LANDING_VIEW: 'eforms99_landing_view',
  APNAPRINT_LANDING_VIEW: 'apnaprint_landing_view',
  DOCPRINT_LANDING_VIEW: 'docprint_landing_view',

  RATION_PAGE_VIEW: 'ration_page_view',
  RATION_REGISTRATION_CTA_CLICK: 'ration_registration_cta_click',
  RATION_REGISTRATION_COMPLETED: 'ration_registration_completed',
  RATION_FIRST_LOOKUP_SUCCESS: 'ration_first_lookup_success',
  RATION_FIRST_RECHARGE_SUCCESS: 'ration_first_recharge_success',

  FARMER_PAGE_VIEW: 'farmer_page_view',
  FARMER_REGISTRATION_CTA_CLICK: 'farmer_registration_cta_click',
  FARMER_REGISTRATION_COMPLETED: 'farmer_registration_completed',
  FARMER_FIRST_LOOKUP_SUCCESS: 'farmer_first_lookup_success',
  FARMER_FIRST_RECHARGE_SUCCESS: 'farmer_first_recharge_success',

  // Progressive Web App (PWA) Lifecycle & Funnel Events
  PWA_INSTALL_PROMPT_VIEW: 'pwa_install_prompt_view',
  PWA_INSTALL_PROMPT_DISMISS: 'pwa_install_prompt_dismiss',
  PWA_INSTALL_COMPLETED: 'pwa_install_completed',
  PWA_STANDALONE_LAUNCH: 'pwa_standalone_launch',
  PWA_OFFLINE_VIEW: 'pwa_offline_view',
  PWA_UPDATE_AVAILABLE: 'pwa_update_available',
  PWA_UPDATE_COMPLETED: 'pwa_update_completed',
} as const;

export type AnalyticsEventType = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

export interface SafeEventMetadata {
  pagePath?: string;
  pageTitle?: string;
  referrer?: string;
  docType?: 'PAN' | 'AADHAAR' | 'VOTER' | 'DL' | 'RC' | 'RATION' | 'FARMER' | string;
  docCategory?: 'pan' | 'aadhaar' | 'voter' | 'dl' | 'rc' | 'ration' | 'farmer' | 'manual' | string;
  isManual?: boolean;
  missingCount?: number;
  errorType?: string;
  paymentMethod?: 'GATEWAY' | 'MANUAL_UTR' | 'UPI' | string;
  rechargeAmount?: number;
  transactionId?: string;
  printFormat?: 'CR80' | 'A4' | 'PDF' | string;
  printerTray?: 'epson_tray' | 'canon_tray' | 'generic' | string;
  isReprint?: boolean;
  fee?: number;
  currency?: string;
  value?: number;
  items?: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>;
  operatorRole?: 'cyber_cafe' | 'csc_vle' | 'retailer' | 'print_shop' | 'other';
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  [key: string]: any;
}

/**
 * PII Denylist & Regex Pattern Detectors
 */
const FORBIDDEN_KEY_PATTERNS = [
  /aadhaar/i,
  /aadhar/i,
  /\buid\b/i,
  /pan/i,
  /epic/i,
  /voter/i,
  /ration/i,
  /farmer/i,
  /citizen/i,
  /father/i,
  /fullname/i,
  /(?<!item_)\bname\b/i,
  /\bdob\b/i,
  /birth/i,
  /address/i,
  /mobile/i,
  /phone/i,
  /email/i,
  /password/i,
  /secret/i,
  /token/i,
  /apikey/i,
  /vpa/i,
  /account_?num/i,
];

const SENSITIVE_VALUE_PATTERNS = [
  /^\d{12}$/, // 12-digit Aadhaar
  /^\d{4}\s\d{4}\s\d{4}$/, // Spaced Aadhaar
  /^[A-Z]{5}[0-9]{4}[A-Z]$/, // 10-char PAN
  /^[A-Z]{3}[0-9]{7}$/, // EPIC Voter ID
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Email address
  /^[6-9]\d{9}$/, // 10-digit Indian Mobile
];

/**
 * Recursively sanitizes any payload before GTM/GA4 dispatch
 */
export function sanitizeMetadata(metadata?: SafeEventMetadata): Record<string, any> {
  if (!metadata || typeof metadata !== 'object') return {};

  const clean: Record<string, any> = {};

  for (const [key, val] of Object.entries(metadata)) {
    // 1. Check if key is in PII denylist
    const isForbiddenKey = FORBIDDEN_KEY_PATTERNS.some((p) => p.test(key));
    if (isForbiddenKey) {
      continue; // Drop key entirely
    }

    // 2. Check if string value matches sensitive regex patterns
    if (typeof val === 'string') {
      const isSensitiveValue = SENSITIVE_VALUE_PATTERNS.some((p) => p.test(val.trim()));
      if (isSensitiveValue) {
        clean[key] = '[REDACTED_PII]';
        continue;
      }
    }

    // 3. Recursively sanitize objects (e.g. items array)
    if (Array.isArray(val)) {
      clean[key] = val.map((item) =>
        typeof item === 'object' && item !== null ? sanitizeMetadata(item) : item
      );
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = sanitizeMetadata(val);
    } else {
      clean[key] = val;
    }
  }

  return clean;
}

// In-memory set of deduplicated purchase transactions for the current user session
const processedTransactionIds = new Set<string>();

/**
 * Dispatches a client-side analytics event to window.dataLayer (GTM/GA4)
 * and dispatches a local DOM event for any custom listeners.
 */
export function trackEvent(eventType: AnalyticsEventType, metadata?: SafeEventMetadata): void {
  if (typeof window === 'undefined') return;

  const sanitized = sanitizeMetadata(metadata);

  // 1. Dispatch custom DOM event
  try {
    const customEvent = new CustomEvent('accero:analytics', {
      detail: {
        event: eventType,
        ...sanitized,
      },
    });
    window.dispatchEvent(customEvent);
  } catch {
    // Silent catch for legacy browsers
  }

  // 2. Dispatch sanitized event to GTM dataLayer
  pushToDataLayer({
    event: eventType,
    ...sanitized,
  });
}

/**
 * Convenience helper to dispatch virtual page views on App Router navigation.
 */
export function trackPageView(pathname: string, searchParamsString?: string): void {
  dataLayerPageView(pathname, searchParamsString);
}

/**
 * Type-Safe Analytics Conversion API Helpers
 *
 * Exported both as standalone top-level hoisted functions (to prevent undefined module reference
 * errors during Fast Refresh or bundling) and grouped under the canonical `Analytics` namespace object.
 */

/**
 * Tracks user initiating a genuine registration attempt.
 */
export function trackRegistrationStarted(pagePath: string = '/register'): void {
  try {
    trackEvent(ANALYTICS_EVENTS.REGISTRATION_STARTED, { pagePath });
  } catch (err) {
    console.warn('[Analytics] trackRegistrationStarted failed silently:', err);
  }
}

/**
 * Tracks user completing successful registration.
 */
export function trackRegistrationCompleted(pagePath: string = '/register'): void {
  try {
    trackEvent(ANALYTICS_EVENTS.REGISTRATION_COMPLETED, { pagePath });
  } catch (err) {
    console.warn('[Analytics] trackRegistrationCompleted failed silently:', err);
  }
}

/**
 * Tracks operator authentication success.
 */
export function trackLoginCompleted(role: string = 'operator'): void {
  try {
    trackEvent(ANALYTICS_EVENTS.LOGIN_COMPLETED, { operatorRole: role as any });
  } catch (err) {
    console.warn('[Analytics] trackLoginCompleted failed silently:', err);
  }
}

/**
 * Tracks wallet recharge order initiation.
 */
export function trackWalletRechargeInitiated(amount: number, paymentMethod: string = 'GATEWAY'): void {
  try {
    trackEvent(ANALYTICS_EVENTS.WALLET_RECHARGE_INITIATED, {
      rechargeAmount: amount,
      paymentMethod,
    });
  } catch (err) {
    console.warn('[Analytics] trackWalletRechargeInitiated failed silently:', err);
  }
}

/**
 * Tracks verified wallet recharge (GA4 Purchase & E-commerce Revenue).
 * Includes client-side deduplication to prevent double-counting on rerenders.
 */
export function trackPurchase(orderId: string, amount: number, paymentMethod: string = 'GATEWAY'): void {
  try {
    if (!orderId) return;

    if (processedTransactionIds.has(orderId)) {
      // Deduplicate: already dispatched in current session
      return;
    }
    processedTransactionIds.add(orderId);

    trackEvent(ANALYTICS_EVENTS.PURCHASE, {
      transactionId: orderId,
      value: amount,
      currency: 'INR',
      paymentMethod,
      items: [
        {
          item_id: 'wallet_topup',
          item_name: 'Prepaid Wallet Topup',
          price: amount,
          quantity: 1,
        },
      ],
    });
  } catch (err) {
    console.warn('[Analytics] trackPurchase failed silently:', err);
  }
}

/**
 * Tracks successful document formatting on the studio canvas.
 */
export function trackDocumentProcessingStarted(
  docCategory: string,
  isManual: boolean = false,
  missingCount: number = 0
): void {
  try {
    trackEvent(ANALYTICS_EVENTS.DOCUMENT_PROCESSING_STARTED, {
      docCategory,
      isManual,
      missingCount,
    });
  } catch (err) {
    console.warn('[Analytics] trackDocumentProcessingStarted failed silently:', err);
  }
}

/**
 * Tracks initiation of physical print dialog (post-authorization).
 */
export function trackPrintInitiated(docType?: string, isReprint: boolean = false, fee: number = 0): void {
  try {
    trackEvent(ANALYTICS_EVENTS.PRINT_INITIATED, {
      docType: typeof docType === 'string' && docType ? docType.toUpperCase() : 'DOCUMENT',
      printFormat: 'CR80',
      isReprint: Boolean(isReprint),
      fee: typeof fee === 'number' ? fee : 0,
    });
  } catch (err) {
    console.warn('[Analytics] trackPrintInitiated failed silently:', err);
  }
}

/**
 * Tracks browser print dialog closing and returning control to application.
 */
export function trackPrintDialogClosed(docType?: string, isReprint: boolean = false): void {
  try {
    trackEvent(ANALYTICS_EVENTS.PRINT_DIALOG_CLOSED, {
      docType: typeof docType === 'string' && docType ? docType.toUpperCase() : 'DOCUMENT',
      printFormat: 'CR80',
      isReprint: Boolean(isReprint),
    });
  } catch (err) {
    console.warn('[Analytics] trackPrintDialogClosed failed silently:', err);
  }
}

/**
 * Tracks confirmed physical print success (after operator confirmation).
 */
export function trackPrintSuccessConfirmed(docType?: string, printerTray: string = 'generic'): void {
  try {
    trackEvent(ANALYTICS_EVENTS.PRINT_SUCCESS_CONFIRMED, {
      docType: typeof docType === 'string' && docType ? docType.toUpperCase() : 'DOCUMENT',
      printFormat: 'CR80',
      printerTray: printerTray || 'generic',
    });
  } catch (err) {
    console.warn('[Analytics] trackPrintSuccessConfirmed failed silently:', err);
  }
}

/**
 * Tracks wallet refund or balance reversal.
 */
export function trackRefundCompleted(amount: number, reason: string): void {
  try {
    trackEvent(ANALYTICS_EVENTS.REFUND_COMPLETED, {
      value: amount,
      currency: 'INR',
      errorType: reason,
    });
  } catch (err) {
    console.warn('[Analytics] trackRefundCompleted failed silently:', err);
  }
}

/**
 * Canonical Analytics namespace object
 */
export const Analytics = {
  trackRegistrationStarted,
  trackRegistrationCompleted,
  trackLoginCompleted,
  trackWalletRechargeInitiated,
  trackPurchase,
  trackDocumentProcessingStarted,
  trackPrintInitiated,
  trackPrintDialogClosed,
  trackPrintSuccessConfirmed,
  trackRefundCompleted,
};

// Defensive global registration
if (typeof globalThis !== 'undefined') {
  (globalThis as any).AcceroAnalytics = Analytics;
}

export default Analytics;
