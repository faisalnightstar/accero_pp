import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPaytmAccounts } from '@/lib/payment/paytm';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const accounts = getPaytmAccounts().map((acc) => ({
      index: acc.index,
      name: acc.name,
      upi: acc.upi,
      midMasked: acc.mid.length > 8 ? `${acc.mid.slice(0, 4)}...${acc.mid.slice(-4)}` : acc.mid,
    }));

    return NextResponse.json({
      success: true,
      accounts,
    });
  } catch (error: any) {
    console.error('[API /api/wallet/paytm/accounts] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

