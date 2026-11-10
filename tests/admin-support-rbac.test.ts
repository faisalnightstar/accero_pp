import { describe, it, expect } from 'vitest';
import {
  normalizeRole,
  isSuperAdmin,
  isAdmin,
  isSupportManager,
  isSupportStaff,
  hasPermission,
  assertRole,
  assertFinancialAdjustmentPermission,
  maskPhone,
  maskEmail,
  maskIdentifier,
} from '@/lib/rbac';
import { calculateCampaignBonus } from '@/lib/wallet/campaignEngine';

describe('Accero Admin & Support RBAC Engine', () => {
  describe('Role Normalization & Hierarchy', () => {
    it('normalizes legacy and uppercase role strings correctly', () => {
      expect(normalizeRole('SUPER_ADMIN')).toBe('super_admin');
      expect(normalizeRole('ADMIN')).toBe('admin');
      expect(normalizeRole('SUPPORT_MANAGER')).toBe('support_manager');
      expect(normalizeRole('SUPPORT_AGENT')).toBe('support_agent');
      expect(normalizeRole('OPERATOR')).toBe('operator');
      expect(normalizeRole('CUSTOMER')).toBe('customer');
      expect(normalizeRole(undefined)).toBe('user');
      expect(normalizeRole('unknown_role')).toBe('user');
    });

    it('validates super admin privileges', () => {
      expect(isSuperAdmin('super_admin')).toBe(true);
      expect(isSuperAdmin('admin')).toBe(false);
      expect(isSuperAdmin('support_manager')).toBe(false);
      expect(isSuperAdmin('support_agent')).toBe(false);
      expect(isSuperAdmin('operator')).toBe(false);
    });

    it('validates admin privileges (super_admin + admin)', () => {
      expect(isAdmin('super_admin')).toBe(true);
      expect(isAdmin('admin')).toBe(true);
      expect(isAdmin('support_manager')).toBe(false);
      expect(isAdmin('support_agent')).toBe(false);
      expect(isAdmin('operator')).toBe(false);
    });

    it('validates support manager privileges (super_admin + admin + support_manager)', () => {
      expect(isSupportManager('super_admin')).toBe(true);
      expect(isSupportManager('admin')).toBe(true);
      expect(isSupportManager('support_manager')).toBe(true);
      expect(isSupportManager('support_agent')).toBe(false);
      expect(isSupportManager('operator')).toBe(false);
    });

    it('validates support staff privileges (super_admin + admin + support_manager + support_agent)', () => {
      expect(isSupportStaff('super_admin')).toBe(true);
      expect(isSupportStaff('admin')).toBe(true);
      expect(isSupportStaff('support_manager')).toBe(true);
      expect(isSupportStaff('support_agent')).toBe(true);
      expect(isSupportStaff('operator')).toBe(false);
      expect(isSupportStaff('user')).toBe(false);
    });
  });

  describe('Permission Matrix & Endpoint Guards', () => {
    it('grants financial and campaign management to super_admin and admin, but denies support staff', () => {
      expect(hasPermission('super_admin', 'FINANCIAL_TRANSACTIONS_VIEW')).toBe(true);
      expect(hasPermission('admin', 'FINANCIAL_TRANSACTIONS_VIEW')).toBe(true);
      expect(hasPermission('support_manager', 'FINANCIAL_TRANSACTIONS_VIEW')).toBe(false);
      expect(hasPermission('support_agent', 'FINANCIAL_TRANSACTIONS_VIEW')).toBe(false);
      expect(hasPermission('operator', 'FINANCIAL_TRANSACTIONS_VIEW')).toBe(false);

      expect(hasPermission('admin', 'CAMPAIGN_MANAGE')).toBe(true);
      expect(hasPermission('support_agent', 'CAMPAIGN_MANAGE')).toBe(false);
    });

    it('restricts team super_admin creation strictly to super_admin', () => {
      expect(hasPermission('super_admin', 'TEAM_ACCESS_CONTROL')).toBe(true);
      expect(hasPermission('admin', 'TEAM_ACCESS_CONTROL')).toBe(false);
      expect(hasPermission('support_manager', 'TEAM_ACCESS_CONTROL')).toBe(false);
      expect(hasPermission('support_agent', 'TEAM_ACCESS_CONTROL')).toBe(false);
    });

    it('assertRole throws 403 / unauthorized for unauthorized roles', () => {
      const mockSession = { userId: '123', email: 'agent@accero.app', name: 'Agent', role: 'support_agent' as const };
      expect(() => assertRole(mockSession, ['admin'], 'manage campaigns')).toThrowError(/Unauthorized/);
      expect(() => assertRole(null, ['admin'], 'manage campaigns')).toThrowError(/Authentication required/);
      expect(() => assertRole(mockSession, ['support_agent', 'admin'], 'view tickets')).not.toThrow();
    });
  });

  describe('Financial Maker-Checker Integrity', () => {
    it('strictly forbids support agents and support managers from adjusting wallets', () => {
      const supportSession = { userId: '123', email: 'agent@accero.app', name: 'Agent', role: 'support_agent' as const };
      expect(() => assertFinancialAdjustmentPermission(supportSession, 50)).toThrowError(
        /Forbidden: Support staff cannot perform wallet financial adjustments/
      );

      const managerSession = { userId: '456', email: 'mgr@accero.app', name: 'Mgr', role: 'support_manager' as const };
      expect(() => assertFinancialAdjustmentPermission(managerSession, 50)).toThrowError(
        /Forbidden: Support staff cannot perform wallet financial adjustments/
      );
    });

    it('allows standard admin to adjust up to ₹10,000, but blocks > ₹10,000 without super_admin', () => {
      const adminSession = { userId: '789', email: 'admin@accero.app', name: 'Admin', role: 'admin' as const };
      expect(() => assertFinancialAdjustmentPermission(adminSession, 500)).not.toThrow();
      expect(() => assertFinancialAdjustmentPermission(adminSession, 10000)).not.toThrow();

      expect(() => assertFinancialAdjustmentPermission(adminSession, 10001)).toThrowError(
        /Forbidden: Administrative adjustments exceeding ₹10,000 require Super Admin approval/
      );
    });

    it('allows super_admin to perform high-value adjustments (> ₹10,000)', () => {
      const superAdminSession = { userId: '001', email: 'super@accero.app', name: 'Super', role: 'super_admin' as const };
      expect(() => assertFinancialAdjustmentPermission(superAdminSession, 25000)).not.toThrow();
    });
  });

  describe('Customer Privacy & PII Data Minimization', () => {
    it('masks phone numbers safely', () => {
      expect(maskPhone('9876543210')).toBe('98*****210');
      expect(maskPhone('+919876543210')).toBe('+91*****210');
      expect(maskPhone('123')).toBe('***');
      expect(maskPhone('')).toBe('N/A');
    });

    it('masks email addresses safely', () => {
      expect(maskEmail('rahul.sharma@example.com')).toBe('r***@example.com');
      expect(maskEmail('a@domain.com')).toBe('a***@domain.com');
      expect(maskEmail('')).toBe('N/A');
    });

    it('masks document identifiers safely', () => {
      expect(maskIdentifier('123456789012')).toBe('********9012');
      expect(maskIdentifier('ABCDE1234F')).toBe('******234F');
      expect(maskIdentifier('')).toBe('N/A');
    });
  });

  describe('Promotional Campaign Engine (Launch Offer)', () => {
    const mockCampaign = {
      id: 'camp_001',
      name: 'Launch Offer',
      code: 'LAUNCH_BONUS',
      status: 'ACTIVE' as const,
      startDate: new Date(Date.now() - 100000),
      endDate: new Date(Date.now() + 100000000),
      minRechargeAmount: 249,
      slabAmount: 249,
      bonusPerSlab: 50,
      maxBonusPerOperator: 1000,
      totalBudget: 50000,
      budgetSpent: 1000,
      totalRedemptions: 20,
    };

    it('calculates 1 slab bonus correctly (₹249 -> ₹50 bonus)', () => {
      const result = calculateCampaignBonus(mockCampaign, 249, 0);
      expect(result.eligible).toBe(true);
      expect(result.bonusAmount).toBe(50);
      expect(result.slabsEarned).toBe(1);
    });

    it('calculates multi-slab bonus correctly (₹498 -> ₹100 bonus, ₹747 -> ₹150 bonus)', () => {
      const res2 = calculateCampaignBonus(mockCampaign, 498, 0);
      expect(res2.eligible).toBe(true);
      expect(res2.bonusAmount).toBe(100);
      expect(res2.slabsEarned).toBe(2);

      const res3 = calculateCampaignBonus(mockCampaign, 747, 0);
      expect(res3.eligible).toBe(true);
      expect(res3.bonusAmount).toBe(150);
      expect(res3.slabsEarned).toBe(3);
    });

    it('rejects recharges below minimum slab (e.g. ₹100 recharge)', () => {
      const res = calculateCampaignBonus(mockCampaign, 100, 0);
      expect(res.eligible).toBe(false);
      expect(res.bonusAmount).toBe(0);
      expect(res.slabsEarned).toBe(0);
    });

    it('enforces maximum operator bonus cap (₹1,000)', () => {
      // Operator has already received ₹950 in bonuses
      const res = calculateCampaignBonus(mockCampaign, 498, 950);
      expect(res.eligible).toBe(true);
      // Earned 100, but cap remaining is 50
      expect(res.bonusAmount).toBe(50);

      // Operator has already received ₹1,000 in bonuses
      const resCapped = calculateCampaignBonus(mockCampaign, 249, 1000);
      expect(resCapped.eligible).toBe(false);
      expect(resCapped.bonusAmount).toBe(0);
    });

    it('enforces campaign budget exhaustion', () => {
      const exhaustedCampaign = {
        ...mockCampaign,
        totalBudget: 50000,
        budgetSpent: 49980,
      };

      const res = calculateCampaignBonus(exhaustedCampaign, 249, 0);
      expect(res.eligible).toBe(true);
      // Only ₹20 remaining in budget
      expect(res.bonusAmount).toBe(20);

      const depletedCampaign = {
        ...mockCampaign,
        totalBudget: 50000,
        budgetSpent: 50000,
      };
      const resDepleted = calculateCampaignBonus(depletedCampaign, 249, 0);
      expect(resDepleted.eligible).toBe(false);
      expect(resDepleted.bonusAmount).toBe(0);
    });
  });
});
