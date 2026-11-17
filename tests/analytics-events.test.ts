import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ANALYTICS_EVENTS,
  Analytics,
  trackEvent,
  sanitizeMetadata,
  trackPrintInitiated,
  trackPrintDialogClosed,
  trackPrintSuccessConfirmed,
  trackRegistrationStarted,
  trackRegistrationCompleted,
  trackPurchase,
} from '@/lib/analytics/events';

describe('Analytics & GA4 Conversion Event Tracking Contract', () => {
  let dataLayerEvents: any[] = [];

  beforeEach(() => {
    dataLayerEvents = [];
    (globalThis as any).window = {
      dataLayer: {
        push: (event: any) => dataLayerEvents.push(event),
      },
      dispatchEvent: vi.fn(),
    };
  });

  describe('1. Canonical Event Definitions', () => {
    it('defines all 10 mandatory Phase 3.1.2 events with exact naming', () => {
      expect(ANALYTICS_EVENTS.REGISTRATION_STARTED).toBe('registration_started');
      expect(ANALYTICS_EVENTS.REGISTRATION_COMPLETED).toBe('registration_completed');
      expect(ANALYTICS_EVENTS.LOGIN_COMPLETED).toBe('login_completed');
      expect(ANALYTICS_EVENTS.WALLET_RECHARGE_INITIATED).toBe('wallet_recharge_initiated');
      expect(ANALYTICS_EVENTS.PURCHASE).toBe('purchase');
      expect(ANALYTICS_EVENTS.DOCUMENT_PROCESSING_STARTED).toBe('document_processing_started');
      expect(ANALYTICS_EVENTS.PRINT_INITIATED).toBe('print_initiated');
      expect(ANALYTICS_EVENTS.PRINT_DIALOG_CLOSED).toBe('print_dialog_closed');
      expect(ANALYTICS_EVENTS.PRINT_SUCCESS_CONFIRMED).toBe('print_success_confirmed');
      expect(ANALYTICS_EVENTS.REFUND_COMPLETED).toBe('refund_completed');
    });
  });

  describe('2. Citizen PII Sanitization & Denylist Defense', () => {
    it('completely drops forbidden citizen identifier keys', () => {
      const payload: any = {
        aadhaar: '123456789012',
        panNumber: 'ABCDE1234F',
        voterId: 'ABC1234567',
        rationCardNumber: 'RC99887766',
        citizenName: 'Ramesh Kumar',
        fatherName: 'Suresh Kumar',
        phoneNumber: '9876543210',
        email: 'operator@accero.app',
        docType: 'PAN',
        pagePath: '/register',
      };

      const clean = sanitizeMetadata(payload);

      expect(clean.aadhaar).toBeUndefined();
      expect(clean.panNumber).toBeUndefined();
      expect(clean.voterId).toBeUndefined();
      expect(clean.rationCardNumber).toBeUndefined();
      expect(clean.citizenName).toBeUndefined();
      expect(clean.fatherName).toBeUndefined();
      expect(clean.phoneNumber).toBeUndefined();
      expect(clean.email).toBeUndefined();

      // Safe non-PII keys are preserved
      expect(clean.docType).toBe('PAN');
      expect(clean.pagePath).toBe('/register');
    });

    it('redacts sensitive string patterns appearing in generic parameter values', () => {
      const payload = {
        label: '123456789012', // 12-digit Aadhaar pattern
        identifier: 'ABCDE1234F', // 10-char PAN pattern
        contact: 'operator@accero.app', // Email pattern
        mobile: '9876543210', // 10-digit mobile pattern
        safeNote: 'CR80 standard alignment verified',
      };

      const clean = sanitizeMetadata(payload);

      expect(clean.label).toBe('[REDACTED_PII]');
      expect(clean.identifier).toBe('[REDACTED_PII]');
      expect(clean.safeNote).toBe('CR80 standard alignment verified');
    });
  });

  describe('3. Purchase Event Deduplication & Server-Verified E-Commerce Tracking', () => {
    it('dispatches GA4 standard purchase event on server-confirmed order', () => {
      const uniqueTxnId = `test_order_${Date.now()}_1`;
      Analytics.trackPurchase(uniqueTxnId, 250, 'GATEWAY');

      expect(dataLayerEvents.length).toBe(1);
      const purchaseEvent = dataLayerEvents[0];

      expect(purchaseEvent.event).toBe('purchase');
      expect(purchaseEvent.transactionId).toBe(uniqueTxnId);
      expect(purchaseEvent.value).toBe(250);
      expect(purchaseEvent.currency).toBe('INR');
      expect(purchaseEvent.items).toEqual([
        {
          item_id: 'wallet_topup',
          item_name: 'Prepaid Wallet Topup',
          price: 250,
          quantity: 1,
        },
      ]);
    });

    it('deduplicates purchase events: never fires twice for identical transactionId', () => {
      const uniqueTxnId = `dedup_txn_${Date.now()}_2`;

      // First call: fires
      Analytics.trackPurchase(uniqueTxnId, 100, 'UPI');
      expect(dataLayerEvents.length).toBe(1);

      // Second duplicate call (e.g. from React component rerender or back-nav): suppressed
      Analytics.trackPurchase(uniqueTxnId, 100, 'UPI');
      expect(dataLayerEvents.length).toBe(1);
    });
  });

  describe('4. Print Workflow Semantics', () => {
    it('distinguishes print initiation from print dialog return', () => {
      Analytics.trackPrintInitiated('PAN', false, 5);
      expect(dataLayerEvents[0].event).toBe('print_initiated');
      expect(dataLayerEvents[0].docType).toBe('PAN');
      expect(dataLayerEvents[0].fee).toBe(5);

      Analytics.trackPrintDialogClosed('PAN', false);
      expect(dataLayerEvents[1].event).toBe('print_dialog_closed');
      expect(dataLayerEvents[1].docType).toBe('PAN');

      Analytics.trackPrintSuccessConfirmed('PAN', 'epson_tray');
      expect(dataLayerEvents[2].event).toBe('print_success_confirmed');
      expect(dataLayerEvents[2].printerTray).toBe('epson_tray');
    });

    it('supports direct hoisted function calls safely without throwing', () => {
      trackPrintInitiated('AADHAAR', true, 0);
      expect(dataLayerEvents[0].event).toBe('print_initiated');
      expect(dataLayerEvents[0].docType).toBe('AADHAAR');
      expect(dataLayerEvents[0].isReprint).toBe(true);
      expect(dataLayerEvents[0].fee).toBe(0);

      trackPrintDialogClosed('AADHAAR', true);
      expect(dataLayerEvents[1].event).toBe('print_dialog_closed');
      expect(dataLayerEvents[1].docType).toBe('AADHAAR');

      trackPrintSuccessConfirmed('AADHAAR', 'canon_tray');
      expect(dataLayerEvents[2].event).toBe('print_success_confirmed');
      expect(dataLayerEvents[2].printerTray).toBe('canon_tray');
    });

    it('safely handles missing or undefined arguments without throwing exceptions', () => {
      expect(() => {
        (trackPrintInitiated as any)();
      }).not.toThrow();
      expect(dataLayerEvents[0].event).toBe('print_initiated');
      expect(dataLayerEvents[0].docType).toBe('DOCUMENT');

      expect(() => {
        (trackPrintDialogClosed as any)();
      }).not.toThrow();
      expect(dataLayerEvents[1].event).toBe('print_dialog_closed');
      expect(dataLayerEvents[1].docType).toBe('DOCUMENT');

      expect(() => {
        (trackPrintSuccessConfirmed as any)();
      }).not.toThrow();
      expect(dataLayerEvents[2].event).toBe('print_success_confirmed');
    });
  });
});
