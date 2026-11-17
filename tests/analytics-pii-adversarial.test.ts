import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  sanitizeDataLayerPayload,
  sanitizeAnalyticsUrl,
  pushToDataLayer,
} from '@/lib/analytics/dataLayer';
import {
  trackEvent,
  sanitizeMetadata,
  ANALYTICS_EVENTS,
  Analytics,
} from '@/lib/analytics/events';

describe('Adversarial PII & Citizen Security Defense Suite (Workstream A)', () => {
  beforeEach(() => {
    (globalThis as any).window = {
      dataLayer: [],
      location: { href: 'https://printportal.accero.app/studio' },
      dispatchEvent: vi.fn(),
    };
    (globalThis as any).document = {
      title: 'Accero PrintPortal Document Studio',
    };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).document;
  });

  describe('1. Citizen Document Identity Protection', () => {
    it('redacts 12-digit Aadhaar numbers (continuous, spaced, and Unicode-spaced)', () => {
      const payloads = [
        { aadhaar: '987654321098' },
        { citizen_uid: '9876 5432 1098' },
        { userAadhaar: '9876\u00A05432\u200B1098' },
        { aAdHaAr_No: '9876\t5432\t1098' },
        { notes: 'Citizen verified with Aadhaar 987654321098 today' },
      ];

      for (const payload of payloads) {
        const clean = sanitizeDataLayerPayload(payload);
        const str = JSON.stringify(clean);
        expect(str).not.toContain('987654321098');
        expect(str).not.toContain('9876 5432 1098');
      }
    });

    it('redacts Indian PAN card numbers (uppercase, lowercase, mixed-case, spaced)', () => {
      const payloads = [
        { pan: 'ABCDE1234F' },
        { PAN_NUMBER: 'abcde1234f' },
        { personalPan: 'AbCdE1234F' },
        { citizen_pan_card: 'ABCDE 1234 F' },
        { remarks: 'Assigned customer PAN is ABCDE1234F for operator reference' },
      ];

      for (const payload of payloads) {
        const clean = sanitizeDataLayerPayload(payload);
        const str = JSON.stringify(clean);
        expect(str.toLowerCase()).not.toContain('abcde1234f');
      }
    });

    it('redacts EPIC Voter ID numbers across various key formats', () => {
      const payloads = [
        { epic: 'XYZ1234567' },
        { voterId: 'ABC9876543' },
        { citizen_voter_card: 'KLM0123456' },
        { user_input: 'Citizen voter card EPIC XYZ1234567 submitted' },
      ];

      for (const payload of payloads) {
        const clean = sanitizeDataLayerPayload(payload);
        const str = JSON.stringify(clean);
        expect(str).not.toContain('XYZ1234567');
        expect(str).not.toContain('ABC9876543');
        expect(str).not.toContain('KLM0123456');
      }
    });

    it('redacts Driving Licence (DL) and Vehicle Registration (RC) numbers', () => {
      const payloads = [
        { dl: 'DL0420220000001' },
        { drivingLicenceNumber: 'MH12 20110012345' },
        { rc: 'DL01AB1234' },
        { vehicleRegistration: 'MH-12-DE-1433' },
        { description: 'Smart card print for vehicle MH12DE1433' },
      ];

      for (const payload of payloads) {
        const clean = sanitizeDataLayerPayload(payload);
        const str = JSON.stringify(clean);
        expect(str).not.toContain('DL0420220000001');
        expect(str).not.toContain('MH12 20110012345');
        expect(str).not.toContain('DL01AB1234');
        expect(str).not.toContain('MH-12-DE-1433');
      }
    });

    it('redacts Ration Card and Farmer ID (AgriStack) numbers', () => {
      const payloads = [
        { rationCard: '071234567890' },
        { ration_number: '100123456789' },
        { farmerId: 'FID9876543210' },
        { agristack_id: 'AGRI-IND-998877' },
      ];

      for (const payload of payloads) {
        const clean = sanitizeDataLayerPayload(payload);
        const str = JSON.stringify(clean);
        expect(str).not.toContain('071234567890');
        expect(str).not.toContain('100123456789');
        expect(str).not.toContain('FID9876543210');
        expect(str).not.toContain('AGRI-IND-998877');
      }
    });
  });

  describe('2. Demographic, Contact & Biometric PII Protection', () => {
    it('redacts Indian mobile phone numbers (+91, 91, 0, local)', () => {
      const payloads = [
        { phone: '+919876543210' },
        { mobile: '919876543210' },
        { contactNumber: '9876543210' },
        { customer_cell: '09876543210' },
        { sms_log: 'Confirmation sent to 9876543210 successfully' },
      ];

      for (const payload of payloads) {
        const clean = sanitizeDataLayerPayload(payload);
        const str = JSON.stringify(clean);
        expect(str).not.toContain('9876543210');
      }
    });

    it('redacts citizen email addresses in fields and sentences', () => {
      const payloads = [
        { email: 'citizen.name@example.co.in' },
        { user_email: 'ramesh.sharma+tag@gmail.com' },
        { details: 'Receipt delivered to citizen.name@example.co.in' },
      ];

      for (const payload of payloads) {
        const clean = sanitizeDataLayerPayload(payload);
        const str = JSON.stringify(clean);
        expect(str).not.toContain('citizen.name@example.co.in');
        expect(str).not.toContain('ramesh.sharma+tag@gmail.com');
      }
    });

    it('redacts citizen names, father names, DOBs, and addresses', () => {
      const payload = {
        name: 'Ramesh Kumar Sharma',
        fatherName: 'Suresh Chandra Sharma',
        dob: '1985-04-12',
        dateOfBirth: '12/04/1985',
        residentialAddress: 'House 42, Sector 15, Rohini, New Delhi 110085',
        citizen_city: 'New Delhi',
        safeContext: 'operator_assisted',
      };

      const clean = sanitizeDataLayerPayload(payload);
      expect(clean.safeContext).toBe('operator_assisted');
      expect(clean.name).toBeUndefined();
      expect(clean.fatherName).toBeUndefined();
      expect(clean.dob).toBeUndefined();
      expect(clean.dateOfBirth).toBeUndefined();
      expect(clean.residentialAddress).toBeUndefined();
      expect(clean.citizen_city).toBeUndefined();
    });

    it('redacts photos, signatures, base64 data URIs, and binary biometric buffers', () => {
      const payload = {
        photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBD...',
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
        imageBase64: 'base64rawstringdata1234567890...',
        biometricFingerprint: 'wQEAACoAAAAB...',
        docType: 'PAN',
      };

      const clean = sanitizeDataLayerPayload(payload);
      expect(clean.docType).toBe('PAN');
      expect(clean.photo).toBeUndefined();
      expect(clean.signature).toBeUndefined();
      expect(clean.imageBase64).toBeUndefined();
      expect(clean.biometricFingerprint).toBeUndefined();
    });
  });

  describe('3. Financial & Authentication Secrets Protection', () => {
    it('purges bank account numbers, IFSC codes, and UPI VPAs', () => {
      const payload = {
        accountNumber: '123456789012345',
        ifscCode: 'HDFC0001234',
        upiId: 'operator@okhdfcbank',
        vpa: 'shop@paytm',
        rechargeAmount: 500,
        currency: 'INR',
      };

      const clean = sanitizeDataLayerPayload(payload);
      expect(clean.rechargeAmount).toBe(500);
      expect(clean.currency).toBe('INR');
      expect(clean.accountNumber).toBeUndefined();
      expect(clean.ifscCode).toBeUndefined();
      expect(clean.upiId).toBeUndefined();
      expect(clean.vpa).toBeUndefined();
    });

    it('purges wallet balances, before/after balances, and internal ledgers', () => {
      const payload = {
        balance: 1540.5,
        walletBalance: 1540.5,
        currentBalance: 1540.5,
        remainingBalance: 1540.5,
        balanceBefore: 1540.5,
        balanceAfter: 1535.5,
        ledgerId: 'LEDG_998877',
        safeMetric: 'balance_check_ok',
      };

      const clean = sanitizeDataLayerPayload(payload);
      expect(clean.safeMetric).toBe('balance_check_ok');
      expect(clean.balance).toBeUndefined();
      expect(clean.walletBalance).toBeUndefined();
      expect(clean.currentBalance).toBeUndefined();
      expect(clean.remainingBalance).toBeUndefined();
      expect(clean.balanceBefore).toBeUndefined();
      expect(clean.balanceAfter).toBeUndefined();
      expect(clean.ledgerId).toBeUndefined();
    });

    it('purges passwords, JWT tokens, Bearer headers, and API keys', () => {
      const payload = {
        password: 'SuperSecretPassword!123',
        jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0In0.abc123def456',
        authToken: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        apiKey: 'sk_live_accero_portal_secret_key_9988',
        authorization: 'Bearer token_secret_value',
        pagePath: '/dashboard',
      };

      const clean = sanitizeDataLayerPayload(payload);
      expect(clean.pagePath).toBe('/dashboard');
      expect(clean.password).toBeUndefined();
      expect(clean.jwtToken).toBeUndefined();
      expect(clean.authToken).toBeUndefined();
      expect(clean.apiKey).toBeUndefined();
      expect(clean.authorization).toBeUndefined();
    });
  });

  describe('4. Adversarial Structure & Edge Cases', () => {
    it('handles deeply nested objects without leaking PII', () => {
      const nested = {
        level1: {
          level2: {
            level3: {
              aadhaarNumber: '987654321098',
              customerPhone: '9876543210',
              safeParam: 'depth_ok',
            },
          },
        },
      };

      const clean = sanitizeDataLayerPayload(nested);
      expect(clean.level1.level2.level3.safeParam).toBe('depth_ok');
      expect(clean.level1.level2.level3.aadhaarNumber).toBeUndefined();
      expect(clean.level1.level2.level3.customerPhone).toBeUndefined();
    });

    it('handles arrays of objects containing citizen data', () => {
      const payload = {
        records: [
          { name: 'Ramesh', pan: 'ABCDE1234F', status: 'ready' },
          { name: 'Suresh', pan: 'WXYZ9876P', status: 'pending' },
        ],
      };

      const clean = sanitizeDataLayerPayload(payload);
      expect(clean.records).toHaveLength(2);
      expect(clean.records[0].status).toBe('ready');
      expect(clean.records[0].name).toBeUndefined();
      expect(clean.records[0].pan).toBeUndefined();
      expect(clean.records[1].status).toBe('pending');
      expect(clean.records[1].name).toBeUndefined();
      expect(clean.records[1].pan).toBeUndefined();
    });

    it('safely handles circular references without throwing call stack errors', () => {
      const circular: any = {
        docType: 'PAN',
        safeMetric: 'test_circular',
      };
      circular.self = circular;

      expect(() => sanitizeDataLayerPayload(circular)).not.toThrow();
      const clean = sanitizeDataLayerPayload(circular);
      expect(clean.docType).toBe('PAN');
      expect(clean.safeMetric).toBe('test_circular');
      expect(clean.self).toBeUndefined();
    });

    it('handles special objects: Date, Error, null, undefined', () => {
      const dateObj = new Date('2026-11-17T06:00:00.000Z');
      const errObj = new Error('Database connection timeout on lookup');

      const payload = {
        createdAt: dateObj,
        error: errObj,
        emptyVal: null,
        missingVal: undefined,
        docType: 'VOTER',
      };

      const clean = sanitizeDataLayerPayload(payload);
      expect(clean.docType).toBe('VOTER');
      expect(clean.createdAt).toBe('2026-11-17T06:00:00.000Z');
      expect(clean.error).toContain('timeout on lookup');
      expect(clean.emptyVal).toBeUndefined();
      expect(clean.missingVal).toBeUndefined();
    });

    it('sanitizes URL query parameters containing PII and secret tokens', () => {
      const dirtyUrls = [
        'https://printportal.accero.app/studio?pan=ABCDE1234F&type=pan',
        'https://printportal.accero.app/verify?token=eyJhbGciOi...&phone=9876543210',
        '/studio?aadhaar=987654321098&auth=bearer_token_123',
      ];

      for (const url of dirtyUrls) {
        const clean = sanitizeAnalyticsUrl(url);
        expect(clean).not.toContain('ABCDE1234F');
        expect(clean).not.toContain('9876543210');
        expect(clean).not.toContain('987654321098');
        expect(clean).not.toContain('bearer_token_123');
        expect(clean).not.toContain('token=');
      }
    });
  });

  describe('5. Preservation of Legitimate GA4 E-Commerce & Event Telemetry', () => {
    it('preserves valid GA4 purchase event parameters strictly', () => {
      Analytics.trackPurchase('ORD_TEST_998877', 500, 'GATEWAY');

      expect((window as any).dataLayer).toHaveLength(1);
      const purchaseEvent = (window as any).dataLayer[0];

      expect(purchaseEvent.event).toBe('purchase');
      expect(purchaseEvent.transactionId).toBe('ORD_TEST_998877');
      expect(purchaseEvent.value).toBe(500);
      expect(purchaseEvent.currency).toBe('INR');
      expect(purchaseEvent.paymentMethod).toBe('GATEWAY');
      expect(purchaseEvent.items).toEqual([
        {
          item_id: 'wallet_topup',
          item_name: 'Prepaid Wallet Topup',
          price: 500,
          quantity: 1,
        },
      ]);
    });

    it('preserves legitimate print lifecycle metadata', () => {
      Analytics.trackPrintInitiated('PAN', false, 5);

      expect((window as any).dataLayer).toHaveLength(1);
      const printEvent = (window as any).dataLayer[0];

      expect(printEvent.event).toBe('print_initiated');
      expect(printEvent.docType).toBe('PAN');
      expect(printEvent.printFormat).toBe('CR80');
      expect(printEvent.isReprint).toBe(false);
      expect(printEvent.fee).toBe(5);
    });
  });
});
