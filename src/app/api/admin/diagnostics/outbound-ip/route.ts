import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { checkOutboundIp, getFixieConfig } from '@/lib/outbound/fixie';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/diagnostics/outbound-ip
 *
 * Verifies outbound network connectivity and tests whether requests egress through
 * Fixie's static IP proxy addresses.
 *
 * Restricted to super_admin and admin roles.
 */
export async function GET() {
  try {
    const session = await getSession();
    assertRole(session, ['super_admin', 'admin'], 'view outbound network diagnostics');

    const config = getFixieConfig();
    const result = await checkOutboundIp();

    return NextResponse.json({
      success: true,
      data: {
        fixieConfigured: Boolean(config),
        proxyHost: config?.host || null,
        proxyPort: config?.port || null,
        proxyProtocol: config?.protocol || null,
        maskedUrl: config?.maskedUrl || null,
        outboundIp: result.ip || null,
        isProxied: result.proxied,
        latencyMs: result.latencyMs,
        reflectionSuccess: result.success,
        error: result.error || null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to inspect outbound IP diagnostics',
      },
      {
        status:
          error.message?.includes('Forbidden') ||
          error.message?.includes('Unauthorized') ||
          error.message?.includes('Authentication required')
            ? 403
            : 500,
      }
    );
  }
}
