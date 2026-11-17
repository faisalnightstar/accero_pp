import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200, headers: NO_CACHE_HEADERS }
      );
    }

    await connectToDatabase();

    const [user, wallet] = await Promise.all([
      User.findById(session.userId).select('name email phone role').lean(),
      Wallet.findOne({ userId: session.userId }).select('balance').lean(),
    ]);

    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: (user as any)._id,
          name: (user as any).name,
          email: (user as any).email,
          phone: (user as any).phone,
          role: (user as any).role,
          walletBalance: wallet ? (wallet as any).balance : 0,
        },
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
