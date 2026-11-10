import { NextResponse } from 'next/server';
import { getAdminFinancialLedger, executeAdministrativeWalletAdjustment } from '@/actions/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const type = searchParams.get('type') || '';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    const data = await getAdminFinancialLedger({ page, limit, type, category, search });
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await executeAdministrativeWalletAdjustment({
      operatorId: body.operatorId,
      amount: body.amount,
      type: body.type,
      reason: body.reason,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Wallet adjustment failed' },
      { status: error.message?.includes('Forbidden') || error.message?.includes('Security') ? 403 : 400 }
    );
  }
}
