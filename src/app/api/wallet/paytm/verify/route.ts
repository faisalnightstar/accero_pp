import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { verifyAndCreditPaytmPayment } from '@/lib/payment/paytm';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, status: 'failed', error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const orderId = body.orderId ? String(body.orderId).trim() : '';

    if (!orderId) {
      return NextResponse.json(
        { success: false, status: 'failed', error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const result = await verifyAndCreditPaytmPayment(orderId, session.userId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/wallet/paytm/verify] Error:', error);
    return NextResponse.json(
      { success: false, status: 'failed', error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

