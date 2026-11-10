import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createPaytmPaymentOrder } from '@/lib/payment/paytm';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in to top-up wallet.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const amount = Number(body.amount);
    const preferredAccountIndex = body.accountIndex ? Number(body.accountIndex) : undefined;

    if (isNaN(amount) || amount < 10) {
      return NextResponse.json(
        { success: false, error: 'Minimum recharge amount is ₹10.' },
        { status: 400 }
      );
    }

    if (amount > 50000) {
      return NextResponse.json(
        { success: false, error: 'Maximum recharge limit per transaction is ₹50,000.' },
        { status: 400 }
      );
    }

    const result = await createPaytmPaymentOrder(
      session.userId,
      amount,
      preferredAccountIndex
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create payment order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      amount: result.amount,
      upiId: result.upiId,
      mid: result.mid,
      accountIndex: result.accountIndex,
      upiUrl: result.upiUrl,
      qrDataUrl: result.qrDataUrl,
    });
  } catch (error: any) {
    console.error('[API /api/wallet/paytm/create-order] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

