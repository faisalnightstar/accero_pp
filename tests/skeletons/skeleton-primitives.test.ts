import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CardSkeleton,
  TableSkeleton,
  DashboardSkeleton,
  WalletSkeleton,
  DocumentSkeleton,
  FormSkeleton,
  ChartSkeleton,
  ProfileSkeleton,
  ListSkeleton,
  DetailSkeleton,
  PageSkeleton,
} from '@/components/skeletons';

describe('Accero Centralized Skeleton Loading System', () => {
  describe('Skeleton Primitive (src/components/ui/skeleton.tsx)', () => {
    it('renders with status role, aria-busy, and motion-reduce:animate-none', () => {
      const html = renderToStaticMarkup(React.createElement(Skeleton, { className: 'h-6 w-24' }));
      expect(html).toContain('role="status"');
      expect(html).toContain('aria-busy="true"');
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain('animate-pulse');
      expect(html).toContain('motion-reduce:animate-none');
      expect(html).toContain('h-6 w-24');
      expect(html).toContain('Loading...');
    });
  });

  describe('CardSkeleton', () => {
    it('renders default stat variant with accessible attributes', () => {
      const html = renderToStaticMarkup(React.createElement(CardSkeleton));
      expect(html).toContain('role="status"');
      expect(html).toContain('aria-busy="true"');
      expect(html).toContain('animate-pulse');
    });

    it('renders service variant with custom card styling', () => {
      const html = renderToStaticMarkup(React.createElement(CardSkeleton, { variant: 'service' }));
      expect(html).toContain('role="status"');
      expect(html).toContain('rounded-2xl');
      expect(html).toContain('animate-pulse');
    });

    it('renders compact variant', () => {
      const html = renderToStaticMarkup(React.createElement(CardSkeleton, { variant: 'compact' }));
      expect(html).toContain('role="status"');
      expect(html).toContain('rounded-xl');
    });
  });

  describe('TableSkeleton', () => {
    it('renders configured rows and columns with table structure', () => {
      const html = renderToStaticMarkup(React.createElement(TableSkeleton, { rows: 4, columns: 3 }));
      expect(html).toContain('role="status"');
      expect(html).toContain('<table');
      expect(html).toContain('<thead');
      expect(html).toContain('<tbody');

      // Count the number of <tr> inside the tbody
      const tbodyContent = html.split('<tbody')[1].split('</tbody>')[0];
      const tbodyRows = (tbodyContent.match(/<tr/g) || []).length;
      expect(tbodyRows).toBe(4);
    });

    it('supports hiding the table header', () => {
      const html = renderToStaticMarkup(React.createElement(TableSkeleton, { showHeader: false }));
      expect(html).not.toContain('<thead');
    });
  });

  describe('FormSkeleton', () => {
    it('renders specified number of field inputs and submit buttons', () => {
      const html = renderToStaticMarkup(React.createElement(FormSkeleton, { fields: 6, columns: 2 }));
      expect(html).toContain('role="status"');
      expect(html).toContain('grid-cols-1 md:grid-cols-2');
    });
  });

  describe('DocumentSkeleton', () => {
    it('renders CR80 card aspect ratio placeholder and studio layout', () => {
      const html = renderToStaticMarkup(React.createElement(DocumentSkeleton, { splitView: true }));
      expect(html).toContain('role="status"');
      // Matches ISO CR80 standard card aspect ratio 1.586
      expect(html).toContain('aspect-[1.586]');
      expect(html).toContain('lg:col-span-5');
      expect(html).toContain('lg:col-span-7');
    });
  });

  describe('WalletSkeleton', () => {
    it('renders financial balance card, recharge chips, and transactions table', () => {
      const html = renderToStaticMarkup(React.createElement(WalletSkeleton));
      expect(html).toContain('role="status"');
      expect(html).toContain('grid-cols-1 md:grid-cols-3');
      expect(html).toContain('<table');
    });
  });

  describe('DashboardSkeleton', () => {
    it('renders top banner, metric cards, services grid, and document table', () => {
      const html = renderToStaticMarkup(React.createElement(DashboardSkeleton));
      expect(html).toContain('role="status"');
      expect(html).toContain('<table');
      expect(html).toContain('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4');
    });
  });

  describe('ChartSkeleton', () => {
    it('renders deterministic visual bar throughput without layout shifts', () => {
      const html = renderToStaticMarkup(React.createElement(ChartSkeleton, { bars: 8 }));
      expect(html).toContain('role="status"');
      expect(html).toContain('h-64');
    });
  });

  describe('ProfileSkeleton', () => {
    it('renders avatar circle, details sections, and security rows', () => {
      const html = renderToStaticMarkup(React.createElement(ProfileSkeleton));
      expect(html).toContain('role="status"');
      expect(html).toContain('rounded-full');
    });
  });

  describe('ListSkeleton', () => {
    it('renders feed items with header and status icons', () => {
      const html = renderToStaticMarkup(React.createElement(ListSkeleton, { items: 3, hasHeader: true }));
      expect(html).toContain('role="status"');
    });
  });

  describe('DetailSkeleton', () => {
    it('renders detail summary and attribute rows', () => {
      const html = renderToStaticMarkup(React.createElement(DetailSkeleton));
      expect(html).toContain('role="status"');
    });
  });

  describe('PageSkeleton', () => {
    it('renders generic page shell with cards or table variants', () => {
      const htmlCards = renderToStaticMarkup(React.createElement(PageSkeleton, { variant: 'cards' }));
      expect(htmlCards).toContain('role="status"');

      const htmlTable = renderToStaticMarkup(React.createElement(PageSkeleton, { variant: 'table' }));
      expect(htmlTable).toContain('<table');
    });
  });
});
