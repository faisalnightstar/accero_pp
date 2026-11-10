import { UserSession } from '@/lib/auth';
import { UserRole } from '@/models/User';

/**
 * Accero PrintPortal Role-Based Access Control (RBAC) System
 *
 * Supported Roles:
 * - SUPER_ADMIN: Full platform access, team management, sensitive financial controls.
 * - ADMIN: Business management, operator accounts, wallet adjustments, campaigns, services.
 * - SUPPORT_MANAGER: Support team assignment, escalations, support performance.
 * - SUPPORT_AGENT: Ticket handling, customer communication, masked operator troubleshooting.
 * - OPERATOR / CUSTOMER / USER: Customer document processing and print portal utility.
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin' as const,
  ADMIN: 'admin' as const,
  SUPPORT_MANAGER: 'support_manager' as const,
  SUPPORT_AGENT: 'support_agent' as const,
  OPERATOR: 'operator' as const,
  CUSTOMER: 'customer' as const,
  USER: 'user' as const,
};

/**
 * Normalizes input role strings to canonical lowercase format
 */
export function normalizeRole(role?: string | null): UserRole {
  if (!role) return 'user';
  const clean = role.toLowerCase().trim();
  if (clean === 'super_admin' || clean === 'superadmin') return 'super_admin';
  if (clean === 'admin') return 'admin';
  if (clean === 'support_manager' || clean === 'supportmanager') return 'support_manager';
  if (clean === 'support_agent' || clean === 'supportagent' || clean === 'support')
    return 'support_agent';
  if (clean === 'operator') return 'operator';
  if (clean === 'customer') return 'customer';
  return 'user';
}

/**
 * Role Checkers
 */
export function isSuperAdmin(role?: string | null): boolean {
  return normalizeRole(role) === 'super_admin';
}

export function isAdmin(role?: string | null): boolean {
  const norm = normalizeRole(role);
  return norm === 'super_admin' || norm === 'admin';
}

export function isSupportManager(role?: string | null): boolean {
  const norm = normalizeRole(role);
  return norm === 'super_admin' || norm === 'admin' || norm === 'support_manager';
}

export function isSupportStaff(role?: string | null): boolean {
  const norm = normalizeRole(role);
  return (
    norm === 'super_admin' ||
    norm === 'admin' ||
    norm === 'support_manager' ||
    norm === 'support_agent'
  );
}

/**
 * Granular Permission Matrix
 */
export const Permissions = {
  // Admin Dashboard Features
  ACCESS_ADMIN_DASHBOARD: (role?: string | null) => isAdmin(role),
  FINANCIAL_TRANSACTIONS_VIEW: (role?: string | null) => isAdmin(role),
  CAMPAIGN_MANAGE: (role?: string | null) => isAdmin(role),
  MANAGE_CAMPAIGNS: (role?: string | null) => isAdmin(role),
  TEAM_ACCESS_CONTROL: (role?: string | null) => isSuperAdmin(role),
  MANAGE_TEAM: (role?: string | null) => isSuperAdmin(role),
  ADJUST_WALLET: (role?: string | null) => isAdmin(role),
  MANAGE_SERVICES: (role?: string | null) => isAdmin(role),
  VIEW_FINANCIAL_REPORTS: (role?: string | null) => isAdmin(role),
  SUSPEND_OPERATOR: (role?: string | null) => isAdmin(role),

  // Support Dashboard Features
  ACCESS_SUPPORT_DASHBOARD: (role?: string | null) => isSupportStaff(role),
  ASSIGN_TICKETS: (role?: string | null) => isSupportManager(role),
  ESCALATE_TICKET: (role?: string | null) => isSupportStaff(role),
  REPLY_TICKET: (role?: string | null) => isSupportStaff(role),
  CLOSE_TICKET: (role?: string | null) => isSupportStaff(role),
  VIEW_OPERATOR_SUPPORT_PROFILE: (role?: string | null) => isSupportStaff(role),
};

export function hasPermission(
  role: string | null | undefined,
  permission: keyof typeof Permissions
): boolean {
  const norm = normalizeRole(role);
  const checkFn = Permissions[permission];
  return checkFn ? checkFn(norm) : false;
}

/**
 * Server-Side Role Assertion Guards
 * Throws explicit authorization errors if session does not satisfy role requirement.
 */
export function assertRole(
  session: UserSession | null,
  allowedRoles: UserRole[],
  actionDescription: string = 'this action'
): void {
  if (!session) {
    throw new Error('Authentication required: No active session.');
  }

  const userRole = normalizeRole(session.role);
  if (!allowedRoles.includes(userRole)) {
    throw new Error(
      `Forbidden: Unauthorized access for ${actionDescription}. Required roles: ${allowedRoles.join(
        ', '
      )}`
    );
  }
}

/**
 * Protects administrative financial operations:
 * Rejects any support staff or unauthorized operators from financial adjustments.
 */
export function assertFinancialAdjustmentPermission(
  session: UserSession | null,
  amount: number
): void {
  if (!session) {
    throw new Error('Authentication required: No active session for financial adjustment.');
  }

  const role = normalizeRole(session.role);

  // Hard block on support agents or support managers
  if (role === 'support_agent' || role === 'support_manager') {
    throw new Error(
      'Forbidden: Support staff cannot perform wallet financial adjustments.'
    );
  }

  // Must be Super Admin or Admin
  if (role !== 'super_admin' && role !== 'admin') {
    throw new Error('Forbidden: Only administrators can execute wallet adjustments.');
  }

  // High-value adjustment sanity guard (> ₹10,000 requires super_admin)
  if (amount > 10000 && role !== 'super_admin') {
    throw new Error(
      'Forbidden: Administrative adjustments exceeding ₹10,000 require Super Admin approval.'
    );
  }
}

/**
 * Data Minimization & Privacy Protection Helpers
 * Ensures customer contact details and citizen identifiers are never exposed unnecessarily.
 */
export function maskPhone(phone?: string | null): string {
  if (!phone) return 'N/A';
  const trimmed = phone.trim();
  if (trimmed.length < 5) return '***';

  if (trimmed.startsWith('+91')) {
    const rest = trimmed.slice(3).replace(/[^0-9]/g, '');
    if (rest.length <= 4) return '+91***';
    return `+91*****${rest.slice(-3)}`;
  }

  const clean = trimmed.replace(/[^0-9]/g, '');
  if (clean.length <= 4) return '***';
  return `${clean.slice(0, 2)}*****${clean.slice(-3)}`;
}

export function maskEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return 'N/A';
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return 'N/A';
  return `${localPart[0]}***@${domain}`;
}

export function maskIdentifier(identifier?: string | null): string {
  if (!identifier) return 'N/A';
  const clean = identifier.trim();
  if (clean.length <= 4) return '****';
  const maskLength = clean.length - 4;
  return `${'*'.repeat(maskLength)}${clean.slice(-4)}`;
}
