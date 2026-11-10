import { NextResponse } from 'next/server';
import { getSession, hasAdminRole } from '@/lib/auth';
import {
  getPendingManualRecharges,
  approveManualRecharge,
  rejectManualRecharge,
} from '@/actions/wallet';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required.' },
        { status: 403 }
      );
    }

    const result = await getPendingManualRecharges();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !hasAdminRole(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action, requestId, reason } = body;

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'requestId is required' },
        { status: 400 }
      );
    }

    if (action === 'APPROVE') {
      const result = await approveManualRecharge(requestId);
      return NextResponse.json(result);
    }

    if (action === 'REJECT') {
      const result = await rejectManualRecharge(requestId, reason || 'Unverified payment');
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Must be APPROVE or REJECT.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

