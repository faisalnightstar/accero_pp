import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import PromoCode from '@/models/PromoCode';
import PromoRedemption from '@/models/PromoRedemption';
import { getSession } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'campaigns'; // 'campaigns' or 'redemptions'

    await connectToDatabase();

    if (type === 'redemptions') {
      const redemptions = await PromoRedemption.find({})
        .populate('operatorId', 'name email phone')
        .populate('promoCodeId', 'code campaignName discountType')
        .sort({ redeemedAt: -1 })
        .lean();

      const headers = [
        'Redemption ID',
        'Promo Code',
        'Campaign Name',
        'Operator Name',
        'Operator Email',
        'Operator Phone',
        'Payment ID',
        'Recharge Amount',
        'Bonus Amount',
        'Discount Amount',
        'Status',
        'Redeemed At',
      ];

      const rows = redemptions.map((r: any) => [
        r._id.toString(),
        `"${r.code || ''}"`,
        `"${(r.promoCodeId?.campaignName || '').replace(/"/g, '""')}"`,
        `"${(r.operatorId?.name || '').replace(/"/g, '""')}"`,
        `"${(r.operatorId?.email || '').replace(/"/g, '""')}"`,
        `"${(r.operatorId?.phone || '').replace(/"/g, '""')}"`,
        `"${r.paymentId || ''}"`,
        r.rechargeAmount || 0,
        r.bonusAmount || 0,
        r.discountAmount || 0,
        r.status || 'COMPLETED',
        r.redeemedAt ? new Date(r.redeemedAt).toISOString() : '',
      ]);

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="promo-redemptions-${Date.now()}.csv"`,
        },
      });
    }

    // Default: Export Promo Codes & Campaigns
    const codes = await PromoCode.find({})
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      'Code',
      'Campaign Name',
      'Description',
      'Discount Type',
      'Discount Value',
      'Min Recharge Amount',
      'Max Bonus',
      'Total Redemption Limit',
      'Per User Limit',
      'Total Budget',
      'Budget Spent',
      'Total Redeemed',
      'First Recharge Only',
      'Is Active',
      'Starts At',
      'Expires At',
      'Created By',
      'Created At',
    ];

    const rows = codes.map((c: any) => [
      `"${c.code}"`,
      `"${(c.campaignName || '').replace(/"/g, '""')}"`,
      `"${(c.description || '').replace(/"/g, '""')}"`,
      c.discountType,
      c.discountValue,
      c.minimumRechargeAmount || 0,
      c.maximumBonus || 0,
      c.totalRedemptionLimit || 0,
      c.perUserRedemptionLimit || 1,
      c.totalBudget || 0,
      c.budgetSpent || 0,
      c.totalRedeemed || 0,
      c.firstRechargeOnly ? 'Yes' : 'No',
      c.isActive ? 'Active' : 'Inactive',
      c.startsAt ? new Date(c.startsAt).toISOString() : '',
      c.expiresAt ? new Date(c.expiresAt).toISOString() : '',
      `"${(c.createdBy?.name || 'Administrator').replace(/"/g, '""')}"`,
      c.createdAt ? new Date(c.createdAt).toISOString() : '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="promo-campaigns-${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to export CSV' },
      { status: 500 }
    );
  }
}

