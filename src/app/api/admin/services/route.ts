import { NextResponse } from 'next/server';
import { getAdminServices, updateAdminServiceConfig } from '@/actions/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const services = await getAdminServices();
    return NextResponse.json({ success: true, services });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: error.message?.includes('Forbidden') ? 403 : 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const result = await updateAdminServiceConfig(body.serviceId, {
      enabled: body.enabled,
      fee: body.fee,
      maintenanceMode: body.maintenanceMode,
      maintenanceNotice: body.maintenanceNotice,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update service' },
      { status: error.message?.includes('Forbidden') ? 403 : 400 }
    );
  }
}
