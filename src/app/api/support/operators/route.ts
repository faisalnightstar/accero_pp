import { NextResponse } from 'next/server';
import { searchSupportOperators, getOperatorSupportProfile } from '@/actions/support';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const query = searchParams.get('query');

    if (id) {
      const profile = await getOperatorSupportProfile(id);
      return NextResponse.json({ success: true, profile });
    }

    if (query) {
      const operators = await searchSupportOperators(query);
      return NextResponse.json({ success: true, operators });
    }

    return NextResponse.json({ success: true, operators: [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Operator search failed' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}
