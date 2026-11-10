import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';
import { getPromoAnalyticsAction } from '@/actions/promo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const result = await getPromoAnalyticsAction();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

