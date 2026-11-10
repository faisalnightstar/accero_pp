import { NextResponse } from 'next/server';
import { exportFinancialReportCsv, getAdminOverviewMetrics } from '@/actions/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    if (format === 'csv') {
      const csv = await exportFinancialReportCsv(dateFrom, dateTo);
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="accero-financial-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    const data = await getAdminOverviewMetrics();
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Report generation failed' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
