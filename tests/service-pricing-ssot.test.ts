import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import {
  SERVICE_FEES,
  DEFAULT_SERVICE_PRICING,
  calculateDiscountPercent,
  calculateEffectiveFee,
  normalizeDocType,
} from '@/lib/wallet/constants';
import {
  getConfiguredServicePricing,
  getPublicServicePricingCatalog,
  getRequiredServiceFee,
} from '@/lib/wallet/pricing';
import ServiceConfig from '@/models/ServiceConfig';

// Mock mongoose connection & models
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/models/ServiceConfig', () => ({
  default: {
    findOne: vi.fn(),
    find: vi.fn(),
    findOneAndUpdate: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/models/DocumentRecord', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock('@/models/VerificationRequest', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock('@/models/Wallet', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

describe('Service Pricing Single Source of Truth & % OFF Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Math & Calculation Utilities', () => {
    it('calculates percentage discount accurately and safely', () => {
      // 50 down to 20 is 60% OFF
      expect(calculateDiscountPercent(50, 20)).toBe(60);
      // 25 down to 20 is 20% OFF
      expect(calculateDiscountPercent(25, 20)).toBe(20);
      // 30 down to 25 is 17% OFF (16.66% rounded)
      expect(calculateDiscountPercent(30, 25)).toBe(17);
      // 10 down to 5 is 50% OFF
      expect(calculateDiscountPercent(10, 5)).toBe(50);
      // Equal price -> 0%
      expect(calculateDiscountPercent(50, 50)).toBe(0);
      // Fee higher than original price -> 0%
      expect(calculateDiscountPercent(50, 60)).toBe(0);
      // Zero or invalid original price -> 0%
      expect(calculateDiscountPercent(0, 20)).toBe(0);
    });

    it('calculates effective fee from percentage discount accurately', () => {
      // 60% OFF on 50 -> 20
      expect(calculateEffectiveFee(50, 60)).toBe(20);
      // 20% OFF on 25 -> 20
      expect(calculateEffectiveFee(25, 20)).toBe(20);
      // 50% OFF on 10 -> 5
      expect(calculateEffectiveFee(10, 50)).toBe(5);
      // 0% discount -> original fee
      expect(calculateEffectiveFee(50, 0)).toBe(50);
      // 100% discount -> 0
      expect(calculateEffectiveFee(50, 100)).toBe(0);
    });
  });

  describe('2. SSOT Catalog Structure & Default Rates', () => {
    it('includes all primary document types in DEFAULT_SERVICE_PRICING', () => {
      const requiredServices = ['PAN', 'AADHAAR', 'VOTER', 'DL', 'RC', 'RATION', 'MANUAL'];
      for (const sid of requiredServices) {
        const item = DEFAULT_SERVICE_PRICING[sid];
        expect(item).toBeDefined();
        expect(item.serviceId).toBe(sid);
        expect(item.originalFee).toBeGreaterThanOrEqual(item.fee);
        expect(typeof item.displayName).toBe('string');
        expect(typeof item.note).toBe('string');
        expect(typeof item.discountPercent).toBe('number');
      }
    });

    it('enforces mathematically consistent pricing across all SSOT defaults', () => {
      for (const [sid, item] of Object.entries(DEFAULT_SERVICE_PRICING)) {
        expect(item.fee).toBeGreaterThan(0);
        expect(item.originalFee).toBeGreaterThanOrEqual(item.fee);
        const expectedDiscount = calculateDiscountPercent(item.originalFee, item.fee);
        expect(item.discountPercent).toBe(expectedDiscount);
        if (item.discountPercent > 0) {
          expect(item.offerActive).toBe(true);
          expect(item.offerBadge).toContain('% OFF');
        }
      }
    });

    it('preserves backward-compatible SERVICE_FEES constants', () => {
      expect(SERVICE_FEES.PAN).toBe(50);
      expect(SERVICE_FEES.RC).toBe(35);
      expect(SERVICE_FEES.DL).toBe(30);
      expect(SERVICE_FEES.AADHAAR).toBe(25);
      expect(SERVICE_FEES.RATION).toBe(25);
      expect(SERVICE_FEES.VOTER).toBe(20);
      expect(SERVICE_FEES.MANUAL).toBe(5);
    });

    it('normalizes document types properly', () => {
      expect(normalizeDocType('pan')).toBe('PAN');
      expect(normalizeDocType('epic')).toBe('VOTER');
      expect(normalizeDocType('voter')).toBe('VOTER');
      expect(normalizeDocType('uid')).toBe('AADHAAR');
      expect(normalizeDocType('driving_license')).toBe('DL');
      expect(normalizeDocType('vehicle_rc')).toBe('RC');
      expect(normalizeDocType('manual')).toBe('MANUAL');
    });
  });

  describe('3. getConfiguredServicePricing', () => {
    it('returns SSOT fallback when ServiceConfig query returns null', async () => {
      vi.mocked(ServiceConfig.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      const pricing = await getConfiguredServicePricing('PAN');
      expect(pricing.serviceId).toBe('PAN');
      expect(pricing.fee).toBe(SERVICE_FEES.PAN);
      expect(pricing.originalFee).toBe(DEFAULT_SERVICE_PRICING.PAN.originalFee);
      expect(pricing.enabled).toBe(true);
      expect(pricing.maintenanceMode).toBe(false);
    });

    it('resolves database-configured fee, original fee, % OFF, and offer badge', async () => {
      vi.mocked(ServiceConfig.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          serviceId: 'PAN',
          displayName: 'PAN Special Verification',
          fee: 15,
          originalFee: 50,
          discountPercent: 70,
          offerActive: true,
          offerBadge: '70% FLASH SALE',
          enabled: true,
          maintenanceMode: false,
        }),
      } as any);

      const pricing = await getConfiguredServicePricing('pan');
      expect(pricing.fee).toBe(15);
      expect(pricing.originalFee).toBe(50);
      expect(pricing.discountPercent).toBe(70);
      expect(pricing.offerActive).toBe(true);
      expect(pricing.offerBadge).toBe('70% FLASH SALE');
    });

    it('auto-computes discountPercent if only fee and originalFee are stored in MongoDB', async () => {
      vi.mocked(ServiceConfig.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          serviceId: 'RC',
          fee: 25,
          originalFee: 50,
          enabled: true,
        }),
      } as any);

      const pricing = await getConfiguredServicePricing('RC');
      expect(pricing.fee).toBe(25);
      expect(pricing.originalFee).toBe(50);
      expect(pricing.discountPercent).toBe(50); // (50 - 25) / 50 = 50%
      expect(pricing.offerActive).toBe(true);
      expect(pricing.offerBadge).toBe('50% OFF');
    });

    it('reflects maintenance mode and notice', async () => {
      vi.mocked(ServiceConfig.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          serviceId: 'VOTER',
          fee: 20,
          enabled: true,
          maintenanceMode: true,
          maintenanceNotice: 'ECI server under scheduled maintenance until 8 AM',
        }),
      } as any);

      const pricing = await getConfiguredServicePricing('voter');
      expect(pricing.maintenanceMode).toBe(true);
      expect(pricing.maintenanceNotice).toBe('ECI server under scheduled maintenance until 8 AM');
    });
  });

  describe('4. getPublicServicePricingCatalog', () => {
    it('returns array of all 7 service pricing records', async () => {
      vi.mocked(ServiceConfig.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      } as any);

      const catalog = await getPublicServicePricingCatalog();
      expect(Array.isArray(catalog)).toBe(true);
      expect(catalog.length).toBe(7);

      const serviceIds = catalog.map((c) => c.serviceId);
      expect(serviceIds).toContain('PAN');
      expect(serviceIds).toContain('AADHAAR');
      expect(serviceIds).toContain('VOTER');
      expect(serviceIds).toContain('DL');
      expect(serviceIds).toContain('RC');
      expect(serviceIds).toContain('RATION');
      expect(serviceIds).toContain('MANUAL');
    });
  });

  describe('5. getRequiredServiceFee', () => {
    it('returns fee 0 and 100% discount when document was already paid', async () => {
      const DocumentRecord = (await import('@/models/DocumentRecord')).default;
      vi.mocked(DocumentRecord.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          printCount: 2,
          isPaid: true,
        }),
      } as any);

      const result = await getRequiredServiceFee(
        new mongoose.Types.ObjectId().toString(),
        'PAN',
        'ABCDE1234F'
      );

      expect(result.fee).toBe(0);
      expect(result.isFreeReprint).toBe(true);
      expect(result.discountPercent).toBe(100);
    });

    it('returns configured manual fee for manual draft mode', async () => {
      vi.mocked(ServiceConfig.findOne).mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          serviceId: 'MANUAL',
          fee: 5,
          originalFee: 10,
          discountPercent: 50,
          offerActive: true,
        }),
      } as any);

      const result = await getRequiredServiceFee(
        new mongoose.Types.ObjectId().toString(),
        'PAN',
        undefined,
        true
      );

      expect(result.docType).toBe('MANUAL');
      expect(result.fee).toBe(5);
      expect(result.originalFee).toBe(10);
      expect(result.discountPercent).toBe(50);
      expect(result.isFreeReprint).toBe(false);
    });
  });
});

