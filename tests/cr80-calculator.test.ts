import { describe, it, expect } from 'vitest';
import {
  calculateCr80Dimensions,
  CR80_STANDARD,
  CR80_DPI_PRESETS,
} from '@/lib/print/cr80Calculator';

describe('CR80 ISO/IEC 7810 ID-1 DPI & Dimension Calculation Engine', () => {
  describe('1. Physical Dimension Constants', () => {
    it('strictly conforms to ISO/IEC 7810 ID-1 standard metrics', () => {
      expect(CR80_STANDARD.WIDTH_MM).toBe(85.6);
      expect(CR80_STANDARD.HEIGHT_MM).toBe(53.98);
      expect(CR80_STANDARD.CORNER_RADIUS_MM).toBe(3.18);
      expect(CR80_STANDARD.THICKNESS_MM).toBe(0.76);
      expect(CR80_STANDARD.ASPECT_RATIO).toBeCloseTo(1.58577, 4);
    });
  });

  describe('2. Resolution & Pixel Metrics at Standard DPIs', () => {
    it('calculates exact pixel dimensions at 96 DPI (Web Preview)', () => {
      const res = calculateCr80Dimensions(96);

      // (85.6 / 25.4) * 96 = 323.527 -> 324 px
      // (53.98 / 25.4) * 96 = 204.018 -> 204 px
      expect(res.cardWidthPx).toBe(324);
      expect(res.cardHeightPx).toBe(204);
      expect(res.cornerRadiusPx).toBe(12);
      expect(res.bleedMm).toBe(0);
    });

    it('calculates exact pixel dimensions at 300 DPI (Standard Inkjet Tray)', () => {
      const res = calculateCr80Dimensions(300);

      // (85.6 / 25.4) * 300 = 1011.023 -> 1011 px
      // (53.98 / 25.4) * 300 = 637.559 -> 638 px
      expect(res.cardWidthPx).toBe(1011);
      expect(res.cardHeightPx).toBe(638);
      expect(res.cornerRadiusPx).toBe(38);
    });

    it('calculates exact pixel dimensions at 600 DPI (High-Definition)', () => {
      const res = calculateCr80Dimensions(600);

      // (85.6 / 25.4) * 600 = 2022.047 -> 2022 px
      // (53.98 / 25.4) * 600 = 1275.118 -> 1275 px
      expect(res.cardWidthPx).toBe(2022);
      expect(res.cardHeightPx).toBe(1275);
      expect(res.cornerRadiusPx).toBe(75);
    });

    it('calculates exact pixel dimensions with 2mm outer bleed at 300 DPI', () => {
      const res = calculateCr80Dimensions(300, 2.0);

      expect(res.cardWidthPx).toBe(1011);
      expect(res.cardHeightPx).toBe(638);
      // Total with bleed: (85.6 + 4) = 89.60 mm -> (89.6 / 25.4) * 300 = 1058.267 -> 1058 px
      // Total height with bleed: (53.98 + 4) = 57.98 mm -> (57.98 / 25.4) * 300 = 684.803 -> 685 px
      expect(res.totalWidthPx).toBe(1058);
      expect(res.totalHeightPx).toBe(685);
      expect(res.bleedPx).toBe(24);
    });
  });

  describe('3. Industry Presets', () => {
    it('provides all 4 standard industry presets with grounded use cases', () => {
      expect(CR80_DPI_PRESETS.length).toBe(4);
      expect(CR80_DPI_PRESETS[0].dpi).toBe(96);
      expect(CR80_DPI_PRESETS[1].dpi).toBe(300);
      expect(CR80_DPI_PRESETS[2].dpi).toBe(600);
      expect(CR80_DPI_PRESETS[3].dpi).toBe(1200);
    });
  });

  describe('4. Input Validation & Error Handling', () => {
    it('throws on out-of-range or invalid DPI values', () => {
      expect(() => calculateCr80Dimensions(50)).toThrowError(/Invalid DPI/);
      expect(() => calculateCr80Dimensions(5000)).toThrowError(/Invalid DPI/);
      expect(() => calculateCr80Dimensions(NaN)).toThrowError(/Invalid DPI/);
      expect(() => calculateCr80Dimensions(Infinity)).toThrowError(/Invalid DPI/);
    });

    it('gracefully handles non-positive or excessive bleed values', () => {
      const resNegative = calculateCr80Dimensions(300, -5);
      expect(resNegative.bleedMm).toBe(0);

      const resExcessive = calculateCr80Dimensions(300, 50);
      expect(resExcessive.bleedMm).toBe(0);
    });
  });
});
