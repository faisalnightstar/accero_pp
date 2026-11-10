import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getRoleDashboardUrl, getSafeRedirectUrl } from '@/lib/rbac';

export { getRoleDashboardUrl, getSafeRedirectUrl };

export type SessionRole =
  | 'super_admin'
  | 'admin'
  | 'support_manager'
  | 'support_agent'
  | 'operator'
  | 'customer'
  | 'user';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: SessionRole;
}

const JWT_ISSUER = 'accero-printportal';
const JWT_AUDIENCE = 'accero-users';

/**
 * Returns cryptographic key for signing and verifying JWT tokens.
 * Fails hard if JWT_SECRET is missing or less than 32 characters.
 */
export function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      'FATAL SECURITY MISCONFIGURATION: JWT_SECRET environment variable is missing or less than 32 characters long.'
    );
  }
  return new TextEncoder().encode(secret.trim());
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signJwtToken(payload: UserSession): Promise<string> {
  const secret = getJwtSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyJwtToken(token: string): Promise<UserSession | null> {
  try {
    const secret = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: (payload.role as UserSession['role']) || 'user',
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    return verifyJwtToken(token);
  } catch {
    return null;
  }
}

/**
 * Server-side validated session check.
 * Optionally verifies that the user still exists in MongoDB and is active.
 */
export async function getValidatedSession(options?: {
  checkDb?: boolean;
}): Promise<UserSession | null> {
  const session = await getSession();
  if (!session) return null;

  if (options?.checkDb) {
    try {
      const { connectToDatabase } = await import('@/lib/mongodb');
      const User = (await import('@/models/User')).default;
      await connectToDatabase();
      const user = await User.findById(session.userId).select('status role email name');
      if (!user || user.status !== 'active') {
        return null;
      }
      return {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch {
      return session;
    }
  }

  return session;
}

/**
 * Validates role-based authorization for administrative and sensitive operations
 */
export function hasAdminRole(role?: string): boolean {
  return role === 'admin' || role === 'super_admin';
}
