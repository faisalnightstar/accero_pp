import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { runOutboundIpDiagnostics } from '@/lib/network/diagnostics';

// Enforce standard Node.js runtime for proxy socket / dispatcher support
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/diagnostics/outbound-ip
 *
 * Verifies outbound network connectivity, Fixie proxy authentication,
 * and static egress IP validation against Fixie's static IP pool.
 *
 * Restricted to super_admin and admin roles.
 */
export async function GET() {
  try {
    const session = await getSession();
    assertRole(session, ['super_admin', 'admin'], 'view outbound network diagnostics');

    const report = await runOutboundIpDiagnostics();

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        outboundIp: report.proxiedEgressIp || report.directEgressIp || null,
        isProxied: Boolean(report.proxiedEgressIp),
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
