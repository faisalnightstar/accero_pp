import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Route loading components
import DashboardLoading from '@/app/dashboard/loading';
import WalletLoading from '@/app/wallet/loading';
import CardsLoading from '@/app/cards/loading';
import StudioLoading from '@/app/studio/loading';
import AdminLoading from '@/app/admin/loading';
import SupportLoading from '@/app/support/loading';
import PanLookupLoading from '@/app/dashboard/pan-lookup/loading';
import AdminFinanceLoading from '@/app/admin/finance/loading';
import AdminOperatorsLoading from '@/app/admin/operators/loading';
import AdminPaymentsLoading from '@/app/admin/payments/loading';
import AdminPromoCodesLoading from '@/app/admin/promo-codes/loading';
import AdminReferralsLoading from '@/app/admin/referrals/loading';
import AdminServicesLoading from '@/app/admin/services/loading';
import SupportTicketsLoading from '@/app/support/tickets/loading';
import OffersLoading from '@/app/dashboard/offers/loading';
import DashboardPromoCodesLoading from '@/app/dashboard/promo-codes/loading';
import ReferEarnLoading from '@/app/dashboard/refer-earn/loading';
import AdminCampaignsLoading from '@/app/admin/campaigns/loading';
import AdminReportsLoading from '@/app/admin/reports/loading';
import AdminTeamLoading from '@/app/admin/team/loading';
import SupportKnowledgeBaseLoading from '@/app/support/knowledge-base/loading';
import SupportOperatorsLoading from '@/app/support/operators/loading';
import SupportTroubleshootingLoading from '@/app/support/troubleshooting/loading';

describe('App Router Route-Level loading.tsx Contracts', () => {
  const routes = [
    { name: 'Dashboard', file: 'src/app/dashboard/loading.tsx', component: DashboardLoading },
    { name: 'Wallet', file: 'src/app/wallet/loading.tsx', component: WalletLoading },
    { name: 'Cards Showcase', file: 'src/app/cards/loading.tsx', component: CardsLoading },
    { name: 'Studio', file: 'src/app/studio/loading.tsx', component: StudioLoading },
    { name: 'Admin Overview', file: 'src/app/admin/loading.tsx', component: AdminLoading },
    { name: 'Support', file: 'src/app/support/loading.tsx', component: SupportLoading },
    { name: 'PAN Lookup', file: 'src/app/dashboard/pan-lookup/loading.tsx', component: PanLookupLoading },
    { name: 'Admin Finance', file: 'src/app/admin/finance/loading.tsx', component: AdminFinanceLoading },
    { name: 'Admin Operators', file: 'src/app/admin/operators/loading.tsx', component: AdminOperatorsLoading },
    { name: 'Admin Payments', file: 'src/app/admin/payments/loading.tsx', component: AdminPaymentsLoading },
    { name: 'Admin Promo Codes', file: 'src/app/admin/promo-codes/loading.tsx', component: AdminPromoCodesLoading },
    { name: 'Admin Referrals', file: 'src/app/admin/referrals/loading.tsx', component: AdminReferralsLoading },
    { name: 'Admin Services', file: 'src/app/admin/services/loading.tsx', component: AdminServicesLoading },
    { name: 'Admin Campaigns', file: 'src/app/admin/campaigns/loading.tsx', component: AdminCampaignsLoading },
    { name: 'Admin Reports', file: 'src/app/admin/reports/loading.tsx', component: AdminReportsLoading },
    { name: 'Admin Team', file: 'src/app/admin/team/loading.tsx', component: AdminTeamLoading },
    { name: 'Support Tickets', file: 'src/app/support/tickets/loading.tsx', component: SupportTicketsLoading },
    { name: 'Support Knowledge Base', file: 'src/app/support/knowledge-base/loading.tsx', component: SupportKnowledgeBaseLoading },
    { name: 'Support Operators', file: 'src/app/support/operators/loading.tsx', component: SupportOperatorsLoading },
    { name: 'Support Troubleshooting', file: 'src/app/support/troubleshooting/loading.tsx', component: SupportTroubleshootingLoading },
    { name: 'Dashboard Offers', file: 'src/app/dashboard/offers/loading.tsx', component: OffersLoading },
    { name: 'Dashboard Promo Codes', file: 'src/app/dashboard/promo-codes/loading.tsx', component: DashboardPromoCodesLoading },
    { name: 'Dashboard Refer & Earn', file: 'src/app/dashboard/refer-earn/loading.tsx', component: ReferEarnLoading },
  ];

  routes.forEach(({ name, file, component }) => {
    it(`verifies ${name} loading.tsx file exists on disk`, () => {
      const fullPath = path.resolve(process.cwd(), file);
      expect(fs.existsSync(fullPath)).toBe(true);
    });

    it(`renders ${name} loading component to static markup cleanly`, () => {
      const html = renderToStaticMarkup(React.createElement(component));
      expect(html).toBeTruthy();
      expect(html).toContain('role="status"');
      expect(html).toContain('aria-busy="true"');
      expect(html).toContain('animate-pulse');
    });
  });
});
