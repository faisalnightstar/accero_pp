import { NextResponse } from 'next/server';
import { getSupportTickets, createSupportTicket } from '@/actions/support';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const assignedToMe = searchParams.get('assignedToMe') === 'true';

    const data = await getSupportTickets({
      page,
      limit,
      status,
      priority,
      category,
      search,
      assignedToMe,
    });
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
    const result = await createSupportTicket(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create ticket' },
      { status: 400 }
    );
  }
}
