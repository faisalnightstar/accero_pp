import { NextResponse } from 'next/server';
import { getPublicServicePricingCatalog } from '@/lib/wallet/pricing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const services = await getPublicServicePricingCatalog();
    return NextResponse.json({
      success: true,
      services,
      hasActiveOffers: services.some((s) => s.offerActive && s.discountPercent > 0),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve service pricing catalog',
      },
      { status: 500 }
    );
  }
}

