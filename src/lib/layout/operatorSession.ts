import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import type { OperatorUserData } from '@/components/layout/operator/OperatorHeader';

/**
 * Server-side helper to load operator session and live wallet balance for Operator layouts.
 * Gracefully falls back to JWT session claims if database is temporarily unreachable.
 */
export async function getOperatorUserSession(): Promise<OperatorUserData | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    await connectToDatabase();
    const [userRecord, walletRecord] = await Promise.all([
      User.findById(session.userId).select('name email phone role').lean(),
      Wallet.findOne({ userId: session.userId }).select('balance').lean(),
    ]);

    return {
      id: session.userId,
      name: (userRecord as any)?.name || session.name,
      email: (userRecord as any)?.email || session.email,
      phone: (userRecord as any)?.phone || '',
      role: (userRecord as any)?.role || session.role,
      walletBalance: typeof (walletRecord as any)?.balance === 'number' ? (walletRecord as any).balance : 0,
    };
  } catch (err) {
    console.warn('[OperatorSession] Fallback to JWT payload:', err);
    return {
      id: session.userId,
      name: session.name,
      email: session.email,
      phone: '',
      role: session.role,
      walletBalance: 0,
    };
  }
}
