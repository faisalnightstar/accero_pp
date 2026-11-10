import { NextResponse } from 'next/server';
import {
  getAdminCampaigns,
  createAdminCampaign,
  toggleCampaignStatus,
} from '@/actions/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const campaigns = await getAdminCampaigns();
    return NextResponse.json({ success: true, campaigns });
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
    const result = await createAdminCampaign(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create campaign' },
      { status: error.message?.includes('Forbidden') ? 403 : 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const result = await toggleCampaignStatus(body.campaignId, body.status);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update campaign' },
      { status: error.message?.includes('Forbidden') ? 403 : 400 }
    );
  }
}
