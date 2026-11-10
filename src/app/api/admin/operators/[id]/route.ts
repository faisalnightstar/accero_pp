import { NextResponse } from 'next/server';
import {
  getAdminOperatorDetail,
  updateOperatorStatus,
  addOperatorNote,
  executeAdministrativeWalletAdjustment,
} from '@/actions/admin';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getAdminOperatorDetail(id);
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Operator not found' },
      { status: error.message?.includes('Forbidden') ? 403 : 404 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'UPDATE_STATUS') {
      const res = await updateOperatorStatus(id, body.status, body.reason);
      return NextResponse.json(res);
    }

    if (body.action === 'ADD_NOTE') {
      const res = await addOperatorNote(id, body.note);
      return NextResponse.json(res);
    }

    if (body.action === 'ADJUST_WALLET') {
      const res = await executeAdministrativeWalletAdjustment({
        operatorId: id,
        amount: body.amount,
        type: body.type,
        reason: body.reason,
      });
      return NextResponse.json(res);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid operator action specified' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Action failed' },
      { status: error.message?.includes('Forbidden') || error.message?.includes('Security') ? 403 : 400 }
    );
  }
}
