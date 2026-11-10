import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { validatePromoCode } from '@/lib/promo/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { valid: false, error: 'Please sign in to apply a promo code.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, amount } = body;

    const result = await validatePromoCode(
      code,
      session.userId,
      Number(amount) || 0
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: error.message || 'Validation error' },
      { status: 500 }
    );
  }
}

