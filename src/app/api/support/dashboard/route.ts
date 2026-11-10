import { NextResponse } from 'next/server';
import { getSupportOverviewMetrics } from '@/actions/support';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getSupportOverviewMetrics();
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
