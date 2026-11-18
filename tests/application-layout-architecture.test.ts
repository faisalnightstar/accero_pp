import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getApplicationContext,
  isPublicRoute,
  isOperatorRoute,
  isAdminRoute,
  isSupportRoute,
  isAuthRoute,
} from '@/lib/layout/routeContext';
import { isAdmin, isSuperAdmin, isSupportStaff } from '@/lib/rbac';
import { getOperatorUserSession } from '@/lib/layout/operatorSession';
import * as auth from '@/lib/auth';

// Mock getSession for server-side layout tests
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof auth>('@/lib/auth');
  return {
    ...actual,
    getSession: vi.fn(),
  };
});

// Mock database connection for operatorSession
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue({}),
  connectToDatabase: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/models/User', () => ({
  default: {
    findById: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          name: 'Jane Operator',
          email: 'operator@accero.app',
          phone: '9876543210',
          role: 'operator',
        }),
      }),
    }),
  },
}));

vi.mock('@/models/Wallet', () => ({
  default: {
    findOne: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          balance: 350.5,
        }),
      }),
    }),
  },
}));

describe('Application Layout Architecture & Strict Boundary Separation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // SECTION 1: PUBLIC MARKETING ROUTES
  // =========================================================================
  describe('1. Public Routes & Marketing Layout Classification', () => {
    it('1. classifies homepage (/) as public marketing context', () => {
      expect(getApplicationContext('/')).toBe('public');
      expect(isPublicRoute('/')).toBe(true);
      expect(isOperatorRoute('/')).toBe(false);
      expect(isAdminRoute('/')).toBe(false);
    });

    it('2. classifies /pricing as public marketing context', () => {
      expect(getApplicationContext('/pricing')).toBe('public');
      expect(isPublicRoute('/pricing')).toBe(true);
    });

    it('3. classifies /about as public marketing context', () => {
      expect(getApplicationContext('/about')).toBe('public');
      expect(isPublicRoute('/about')).toBe(true);
    });

    it('4. classifies /contact as public marketing context', () => {
      expect(getApplicationContext('/contact')).toBe('public');
      expect(isPublicRoute('/contact')).toBe(true);
    });

    it('5. classifies public SEO and programmatic service routes as public context', () => {
      const publicPaths = [
        '/faq',
        '/terms',
        '/privacy-policy',
        '/security',
        '/resources',
        '/print-portal',
        '/csc-print-portal',
        '/cyber-cafe-printing-software',
        '/services/pan-card-printing',
        '/services/aadhaar-document-management',
        '/services/voter-id-printing',
        '/blog',
        '/blog/cr80-card-dimensions-guide',
        '/tools/cr80-card-size-calculator',
      ];

      publicPaths.forEach((path) => {
        expect(getApplicationContext(path)).toBe('public');
        expect(isPublicRoute(path)).toBe(true);
        expect(isOperatorRoute(path)).toBe(false);
        expect(isAdminRoute(path)).toBe(false);
      });
    });
  });

  // =========================================================================
  // SECTION 2: OPERATOR APPLICATION ROUTES
  // =========================================================================
  describe('2. Operator Application Routes & Complete Public Navbar Exclusion', () => {
    it('6. classifies /dashboard as operator context (public navbar strictly excluded)', () => {
      expect(getApplicationContext('/dashboard')).toBe('operator');
      expect(isOperatorRoute('/dashboard')).toBe(true);
      expect(isPublicRoute('/dashboard')).toBe(false);
      expect(isAdminRoute('/dashboard')).toBe(false);
    });

    it('7. classifies /studio as operator context (public navbar strictly excluded)', () => {
      expect(getApplicationContext('/studio')).toBe('operator');
      expect(isOperatorRoute('/studio')).toBe(true);
      expect(isPublicRoute('/studio')).toBe(false);
    });

    it('8. classifies /wallet as operator context (public navbar strictly excluded)', () => {
      expect(getApplicationContext('/wallet')).toBe('operator');
      expect(isOperatorRoute('/wallet')).toBe(true);
      expect(isPublicRoute('/wallet')).toBe(false);
    });

    it('9. classifies /cards and nested operator subroutes as operator context', () => {
      const operatorPaths = [
        '/cards',
        '/dashboard/pan-lookup',
        '/dashboard/offers',
        '/dashboard/promo-codes',
        '/dashboard/refer-earn',
      ];

      operatorPaths.forEach((path) => {
        expect(getApplicationContext(path)).toBe('operator');
        expect(isOperatorRoute(path)).toBe(true);
        expect(isPublicRoute(path)).toBe(false);
        expect(isAdminRoute(path)).toBe(false);
      });
    });

    it('10. resolves complete operator user data and live balance for operator shell', async () => {
      vi.mocked(auth.getSession).mockResolvedValueOnce({
        userId: 'user_operator_123',
        email: 'operator@accero.app',
        name: 'Jane Operator',
        role: 'operator',
      });

      const user = await getOperatorUserSession();
      expect(user).not.toBeNull();
      expect(user?.id).toBe('user_operator_123');
      expect(user?.name).toBe('Jane Operator');
      expect(user?.email).toBe('operator@accero.app');
      expect(user?.phone).toBe('9876543210');
      expect(user?.role).toBe('operator');
      expect(user?.walletBalance).toBe(350.5);
    });
  });

  // =========================================================================
  // SECTION 3: ADMIN APPLICATION ROUTES
  // =========================================================================
  describe('3. Admin Application Routes & Complete Public Navbar Exclusion', () => {
    it('11. classifies /admin as admin context (public navbar strictly excluded)', () => {
      expect(getApplicationContext('/admin')).toBe('admin');
      expect(isAdminRoute('/admin')).toBe(true);
      expect(isPublicRoute('/admin')).toBe(false);
      expect(isOperatorRoute('/admin')).toBe(false);
    });

    it('12. classifies /admin/finance as admin context (public navbar strictly excluded)', () => {
      expect(getApplicationContext('/admin/finance')).toBe('admin');
      expect(isAdminRoute('/admin/finance')).toBe(true);
      expect(isPublicRoute('/admin/finance')).toBe(false);
    });

    it('13. classifies all other admin subroutes into admin shell context', () => {
      const adminRoutes = [
        '/admin/operators',
        '/admin/campaigns',
        '/admin/promo-codes',
        '/admin/referrals',
        '/admin/services',
        '/admin/payments',
        '/admin/reports',
        '/admin/team',
      ];

      adminRoutes.forEach((route) => {
        expect(getApplicationContext(route)).toBe('admin');
        expect(isAdminRoute(route)).toBe(true);
        expect(isPublicRoute(route)).toBe(false);
        expect(isOperatorRoute(route)).toBe(false);
      });
    });

    it('14. verifies support application routes are classified into dedicated support context', () => {
      const supportRoutes = [
        '/support',
        '/support/tickets',
        '/support/operators',
        '/support/troubleshooting',
        '/support/knowledge-base',
      ];

      supportRoutes.forEach((route) => {
        expect(getApplicationContext(route)).toBe('support');
        expect(isSupportRoute(route)).toBe(true);
        expect(isPublicRoute(route)).toBe(false);
        expect(isAdminRoute(route)).toBe(false);
        expect(isOperatorRoute(route)).toBe(false);
      });
    });
  });

  // =========================================================================
  // SECTION 4: AUTHENTICATION & RBAC BOUNDARIES
  // =========================================================================
  describe('4. Server-Side Authentication & Role Authorization Enforcement', () => {
    it('15. rejects unauthenticated access to operator session', async () => {
      vi.mocked(auth.getSession).mockResolvedValueOnce(null);
      const user = await getOperatorUserSession();
      expect(user).toBeNull();
    });

    it('16. prevents standard operators from accessing admin privileges', () => {
      expect(isAdmin('operator')).toBe(false);
      expect(isAdmin('customer')).toBe(false);
      expect(isAdmin('user')).toBe(false);
    });

    it('17. retains authorized access for ADMIN and SUPER_ADMIN roles', () => {
      expect(isAdmin('admin')).toBe(true);
      expect(isAdmin('ADMIN')).toBe(true);
      expect(isAdmin('super_admin')).toBe(true);
      expect(isAdmin('SUPER_ADMIN')).toBe(true);

      expect(isSuperAdmin('super_admin')).toBe(true);
      expect(isSuperAdmin('SUPER_ADMIN')).toBe(true);
      expect(isSuperAdmin('admin')).toBe(false);
    });

    it('18. validates support staff access controls', () => {
      expect(isSupportStaff('support_agent')).toBe(true);
      expect(isSupportStaff('SUPPORT_AGENT')).toBe(true);
      expect(isSupportStaff('support_manager')).toBe(true);
      expect(isSupportStaff('SUPPORT_MANAGER')).toBe(true);
      expect(isSupportStaff('admin')).toBe(true);
      expect(isSupportStaff('operator')).toBe(false);
    });

    it('19. classifies authentication routes into dedicated auth context', () => {
      const authRoutes = [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
      ];

      authRoutes.forEach((route) => {
        expect(getApplicationContext(route)).toBe('auth');
        expect(isAuthRoute(route)).toBe(true);
        expect(isPublicRoute(route)).toBe(false);
        expect(isOperatorRoute(route)).toBe(false);
        expect(isAdminRoute(route)).toBe(false);
      });
    });

    it('20. handles trailing slashes and undefined pathnames gracefully without crashing', () => {
      expect(getApplicationContext(undefined)).toBe('public');
      expect(getApplicationContext(null)).toBe('public');
      expect(getApplicationContext('')).toBe('public');
      expect(getApplicationContext('/dashboard/')).toBe('operator');
      expect(getApplicationContext('/admin/')).toBe('admin');
      expect(getApplicationContext('/support/')).toBe('support');
      expect(getApplicationContext('/pricing/')).toBe('public');
    });
  });

  // =========================================================================
  // SECTION 5: ZERO DUPLICATION & ARCHITECTURAL INTEGRITY
  // =========================================================================
  describe('5. Zero Navigation Duplication & Layout Separation Guarantees', () => {
    it('21. ensures RootLayout does not import or render Navbar, Footer, or WhatsApp unconditionally', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const layoutSource = fs.readFileSync(
        path.join(process.cwd(), 'src/app/layout.tsx'),
        'utf8'
      );

      // Verify unconditional Navbar, Footer, WhatsAppSupportWidget are removed from RootLayout
      expect(layoutSource).not.toMatch(/<Navbar\s*\/>/);
      expect(layoutSource).not.toMatch(/<Footer\s*\/>/);
      expect(layoutSource).not.toMatch(/<WhatsAppSupportWidget\s*\/>/);
      expect(layoutSource).toContain('<AppLayoutShell>{children}</AppLayoutShell>');
    });

    it('22. ensures DashboardLayout renders OperatorShell and zero public components', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const dashboardLayoutSource = fs.readFileSync(
        path.join(process.cwd(), 'src/app/dashboard/layout.tsx'),
        'utf8'
      );

      expect(dashboardLayoutSource).toContain('<OperatorShell user={user}>{children}</OperatorShell>');
      expect(dashboardLayoutSource).not.toContain('PublicNavbar');
      expect(dashboardLayoutSource).not.toContain('Footer');
    });

    it('23. ensures StudioLayout, WalletLayout, CardsLayout render OperatorShell', async () => {
      const fs = await import('fs');
      const path = await import('path');

      const studioSource = fs.readFileSync(path.join(process.cwd(), 'src/app/studio/layout.tsx'), 'utf8');
      const walletSource = fs.readFileSync(path.join(process.cwd(), 'src/app/wallet/layout.tsx'), 'utf8');
      const cardsSource = fs.readFileSync(path.join(process.cwd(), 'src/app/cards/layout.tsx'), 'utf8');

      expect(studioSource).toContain('<OperatorShell user={user}>{children}</OperatorShell>');
      expect(walletSource).toContain('<OperatorShell user={user}>{children}</OperatorShell>');
      expect(cardsSource).toContain('<OperatorShell user={user}>{children}</OperatorShell>');
    });

    it('24. ensures AdminLayout renders AdminHeader and sidebar without public components', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const adminLayoutSource = fs.readFileSync(
        path.join(process.cwd(), 'src/app/admin/layout.tsx'),
        'utf8'
      );

      expect(adminLayoutSource).toContain('<AdminHeader');
      expect(adminLayoutSource).not.toContain('PublicNavbar');
      expect(adminLayoutSource).not.toContain('Footer');
    });

    it('25. ensures SupportLayout renders SupportHeader and sidebar without public components', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const supportLayoutSource = fs.readFileSync(
        path.join(process.cwd(), 'src/app/support/layout.tsx'),
        'utf8'
      );

      expect(supportLayoutSource).toContain('<SupportHeader');
      expect(supportLayoutSource).not.toContain('PublicNavbar');
      expect(supportLayoutSource).not.toContain('Footer');
    });
  });
});
