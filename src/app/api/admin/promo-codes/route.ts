import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';
import {
  getAdminPromoCodesAction,
  createPromoCodeAction,
  updatePromoCodeAction,
  deletePromoCodeAction,
  togglePromoCodeStatusAction,
} from '@/actions/promo';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getAdminPromoCodesAction({ search, status, page, limit });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const result = await createPromoCodeAction(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create promo code' },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, action, isActive, ...data } = body;

    if (action === 'toggle-status') {
      const result = await togglePromoCodeStatusAction(id, isActive);
      return NextResponse.json(result);
    }

    const result = await updatePromoCodeAction(id, data);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update promo code' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const result = await deletePromoCodeAction(id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete promo code' },
      { status: 400 }
    );
  }
}

