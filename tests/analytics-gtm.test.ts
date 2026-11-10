import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  sanitizeDataLayerPayload,
  sanitizeAnalyticsUrl,
  pushToDataLayer,
  pushPageView,
  getGtmId,
  DEFAULT_GTM_ID,
} from '@/lib/analytics/dataLayer';
import {
  trackEvent,
  ANALYTICS_EVENTS,
  AnalyticsEventType,
  SafeEventMetadata,
} from '@/lib/analytics/events';

describe('Privacy-Preserving Google Tag Manager & Analytics Engine', () => {
  beforeEach(() => {
    // Setup window mock in node environment
    (globalThis as any).window = {
      dataLayer: [],
      location: { href: 'https://printportal.accero.app/studio' },
      dispatchEvent: vi.fn(),
    };
    (globalThis as any).document = {
      title: 'Accero PrintPortal',
    };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).document;
  });

  describe('GTM Container ID Resolution', () => {
    it('uses the provided GTM container ID default', () => {
      expect(DEFAULT_GTM_ID).toBe('GTM-MKXHQ658');
      expect(getGtmId()).toBe('GTM-MKXHQ658');
    });

    it('prefers NEXT_PUBLIC_GTM_ID when explicitly configured', () => {
      const originalEnv = process.env.NEXT_PUBLIC_GTM_ID;
      process.env.NEXT_PUBLIC_GTM_ID = 'GTM-TEST1234';
      expect(getGtmId()).toBe('GTM-TEST1234');
      process.env.NEXT_PUBLIC_GTM_ID = originalEnv;
    });
  });

  describe('Strict PII and Citizen Data Filtering', () => {
    it('purges sensitive citizen document numbers and identity keys', () => {
      const maliciousPayload = {
        event: 'first_lookup',
        docType: 'PAN',
        pan: 'ABCDE1234F',
        aadhaar: '987654321098',
        epic: 'XYZ1234567',
        dl: 'DL0420220000001',
        rc: 'DL01AB1234',
        name: 'Ramesh Sharma',
        fatherName: 'Suresh Sharma',
        dob: '1985-04-12',
        phone: '9876543210',
        email: 'ramesh@example.com',
        photo: 'data:image/jpeg;base64,...',
        signature: 'data:image/png;base64,...',
        safeMetadata: 'operator_csc',
      };

      const clean = sanitizeDataLayerPayload(maliciousPayload);

      expect(clean.event).toBe('first_lookup');
      expect(clean.docType).toBe('PAN');
      expect(clean.safeMetadata).toBe('operator_csc');

      // Crucial: All PII keys must be strictly removed
      expect(clean.pan).toBeUndefined();
      expect(clean.aadhaar).toBeUndefined();
      expect(clean.epic).toBeUndefined();
      expect(clean.dl).toBeUndefined();
      expect(clean.rc).toBeUndefined();
      expect(clean.name).toBeUndefined();
      expect(clean.fatherName).toBeUndefined();
      expect(clean.dob).toBeUndefined();
      expect(clean.phone).toBeUndefined();
      expect(clean.email).toBeUndefined();
      expect(clean.photo).toBeUndefined();
      expect(clean.signature).toBeUndefined();
    });

    it('redacts sensitive values matching Aadhaar, PAN, or phone patterns even in harmless keys', () => {
      const leakyPayload = {
        event: 'lookup_failed',
        docType: 'AADHAAR',
        userNotes: 'Citizen provided Aadhaar 2345 6789 0123 for verification',
        searchQuery: 'ABCDE1234F',
        customerPhone: '9898989898',
        safeStatus: 'NOT_FOUND',
      };

      const clean = sanitizeDataLayerPayload(leakyPayload);

      expect(clean.event).toBe('lookup_failed');
      expect(clean.docType).toBe('AADHAAR');
      expect(clean.safeStatus).toBe('NOT_FOUND');

      // Pattern-matched string values dropped
      expect(clean.userNotes).toBeUndefined();
      expect(clean.searchQuery).toBeUndefined();
      expect(clean.customerPhone).toBeUndefined();
    });
  });

  describe('Financial Data & Wallet Balance Protection', () => {
    it('purges wallet balances, bank details, and UPI IDs', () => {
      const financialPayload = {
        event: 'recharge_completed',
        paymentMethod: 'UPI',
        rechargeAmount: 500,
        balance: 1250,
        currentBalance: 1250,
        remainingBalance: 1250,
        walletBalance: 1250,
        upiId: 'merchant@paytm',
        accountNumber: '123456789012',
        ifsc: 'HDFC0001234',
      };

      const clean = sanitizeDataLayerPayload(financialPayload);

      expect(clean.event).toBe('recharge_completed');
      expect(clean.paymentMethod).toBe('UPI');
      expect(clean.rechargeAmount).toBe(500);

      // Financial balances and banking accounts must NEVER reach dataLayer
      expect(clean.balance).toBeUndefined();
      expect(clean.currentBalance).toBeUndefined();
      expect(clean.remainingBalance).toBeUndefined();
      expect(clean.walletBalance).toBeUndefined();
      expect(clean.upiId).toBeUndefined();
      expect(clean.accountNumber).toBeUndefined();
      expect(clean.ifsc).toBeUndefined();
    });
  });

  describe('URL & Query String Sanitization', () => {
    it('strips sensitive query parameters from tracking URLs', () => {
      const dirtyUrl =
        'https://printportal.accero.app/studio?type=pan&card=ABCDE1234F&token=secret_jwt_token_123&phone=9876543210';
      const cleanUrl = sanitizeAnalyticsUrl(dirtyUrl);

      expect(cleanUrl).toContain('https://printportal.accero.app/studio');
      expect(cleanUrl).not.toContain('card=ABCDE1234F');
      expect(cleanUrl).not.toContain('token=');
      expect(cleanUrl).not.toContain('phone=');
    });

    it('sanitizes relative paths without throwing errors', () => {
      const relativePath = '/cards?id=doc_12345&auth=bearer_token';
      const clean = sanitizeAnalyticsUrl(relativePath);

      expect(clean).toBe('/cards');
    });
  });

  describe('Conversion Funnel Event Dispatching', () => {
    it('pushes sanitized page_view event to dataLayer', () => {
      pushPageView('/studio', 'type=pan&token=sensitive');

      expect((window as any).dataLayer).toHaveLength(1);
      const pv = (window as any).dataLayer[0];
      expect(pv.event).toBe('page_view');
      expect(pv.page_path).toBe('/studio?type=pan');
      expect(pv.page_path).not.toContain('token=');
    });

    it('dispatches all 10 standard conversion funnel events cleanly', () => {
      const eventsToTest: Array<{ type: AnalyticsEventType; meta: SafeEventMetadata }> = [
        { type: ANALYTICS_EVENTS.PAGE_VIEW, meta: { pagePath: '/pricing' } },
        { type: ANALYTICS_EVENTS.REGISTRATION_STARTED, meta: { method: 'form' } },
        { type: ANALYTICS_EVENTS.REGISTRATION_COMPLETED, meta: { operatorRole: 'csc_vle' } },
        { type: ANALYTICS_EVENTS.FIRST_LOOKUP, meta: { docType: 'PAN', isManual: false } },
        { type: ANALYTICS_EVENTS.LOOKUP_FAILED, meta: { docType: 'AADHAAR', errorType: 'TIMEOUT' } },
        { type: ANALYTICS_EVENTS.RECHARGE_STARTED, meta: { paymentMethod: 'GATEWAY', rechargeAmount: 200 } },
        { type: ANALYTICS_EVENTS.RECHARGE_COMPLETED, meta: { paymentMethod: 'GATEWAY', rechargeAmount: 200 } },
        { type: ANALYTICS_EVENTS.PRINT_STARTED, meta: { docType: 'VOTER', printFormat: 'CR80' } },
        { type: ANALYTICS_EVENTS.PRINT_COMPLETED, meta: { docType: 'VOTER', printFormat: 'CR80', isReprint: false } },
        { type: ANALYTICS_EVENTS.REPEAT_PRINT, meta: { docType: 'VOTER', printFormat: 'CR80' } },
      ];

      for (const item of eventsToTest) {
        trackEvent(item.type, item.meta);
      }

      expect((window as any).dataLayer).toHaveLength(eventsToTest.length);

      const pushedEventTypes = (window as any).dataLayer.map((e: any) => e.event);
      expect(pushedEventTypes).toEqual([
        'page_view',
        'registration_started',
        'registration_completed',
        'first_lookup',
        'lookup_failed',
        'recharge_started',
        'recharge_completed',
        'print_started',
        'print_completed',
        'repeat_print',
      ]);
    });
  });
});
