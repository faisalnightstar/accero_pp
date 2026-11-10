import { NextResponse } from 'next/server';
import { getAdminTeam, createTeamMember, updateTeamMemberRole } from '@/actions/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const team = await getAdminTeam();
    return NextResponse.json({ success: true, team });
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
    const result = await createTeamMember(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create team member' },
      { status: error.message?.includes('Forbidden') ? 403 : 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const result = await updateTeamMemberRole(body.userId, body.newRole);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update team member' },
      { status: error.message?.includes('Forbidden') ? 403 : 400 }
    );
  }
}
