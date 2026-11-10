import { NextResponse } from 'next/server';
import {
  getSupportTicketDetail,
  addTicketMessage,
  assignSupportTicket,
  escalateSupportTicket,
  resolveSupportTicket,
} from '@/actions/support';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await getSupportTicketDetail(id);
    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Ticket not found' },
      { status: error.message?.includes('Forbidden') ? 403 : 404 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'ADD_MESSAGE') {
      const res = await addTicketMessage(id, body.message, body.isInternal || false);
      return NextResponse.json(res);
    }

    if (body.action === 'ASSIGN') {
      const res = await assignSupportTicket(id, body.agentId);
      return NextResponse.json(res);
    }

    if (body.action === 'ESCALATE') {
      const res = await escalateSupportTicket(id, body.reason || 'Escalated by support staff');
      return NextResponse.json(res);
    }

    if (body.action === 'RESOLVE') {
      const res = await resolveSupportTicket(id, body.resolutionNote || 'Issue resolved');
      return NextResponse.json(res);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid ticket action specified' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Ticket operation failed' },
      { status: error.message?.includes('Forbidden') ? 403 : 400 }
    );
  }
}
