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
 * Returns cryptographic key for signing and verifying Access JWT tokens.
 * Supports ACCESS_TOKEN_SECRET with fallback to JWT_SECRET.
 */
export function getJwtSecretKey(): Uint8Array {
  const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      'FATAL SECURITY MISCONFIGURATION: ACCESS_TOKEN_SECRET or JWT_SECRET environment variable is missing or less than 32 characters long.'
    );
  }
  return new TextEncoder().encode(secret.trim());
}

/**
 * Returns cryptographic key for signing and verifying Refresh JWT tokens.
 * Supports REFRESH_TOKEN_SECRET with fallback to ACCESS_TOKEN_SECRET / JWT_SECRET.
 */
export function getRefreshTokenSecretKey(): Uint8Array {
  const secret =
    process.env.REFRESH_TOKEN_SECRET ||
    process.env.ACCESS_TOKEN_SECRET ||
    process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      'FATAL SECURITY MISCONFIGURATION: REFRESH_TOKEN_SECRET environment variable is missing or less than 32 characters long.'
    );
  }
  return new TextEncoder().encode(secret.trim());
}

/**
 * Helper to parse human-readable durations (e.g. '3d', '30d', '24h', '3600s') into seconds.
 */
export function parseDurationToSeconds(
  duration: string | undefined,
  defaultSeconds: number
): number {
  if (!duration) return defaultSeconds;
  const match = duration.trim().match(/^(\d+)([dhms]?)$/);
  if (!match) return defaultSeconds;
  const num = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 'd':
      return num * 86400;
    case 'h':
      return num * 3600;
    case 'm':
      return num * 60;
    case 's':
      return num;
    default:
      return num;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Signs an Access Token using ACCESS_TOKEN_SECRET and ACCESS_TOKEN_EXPIRY (default: 3d).
 */
export async function signAccessToken(payload: UserSession): Promise<string> {
  const secret = getJwtSecretKey();
  const expiry = process.env.ACCESS_TOKEN_EXPIRY || '3d';
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(secret);
}

/**
 * Verifies an Access Token. Falls back to relaxed issuer/audience check if strict check fails.
 */
export async function verifyAccessToken(token: string): Promise<UserSession | null> {
  try {
    const secret = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }).catch(async () => {
      // Fallback verification without strict issuer/audience
      return await jwtVerify(token, secret);
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

/**
 * Signs a Refresh Token using REFRESH_TOKEN_SECRET and REFRESH_TOKEN_EXPIRY (default: 30d).
 */
export async function signRefreshToken(payload: { userId: string }): Promise<string> {
  const secret = getRefreshTokenSecretKey();
  const expiry = process.env.REFRESH_TOKEN_EXPIRY || '30d';
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(secret);
}

/**
 * Verifies a Refresh Token.
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const secret = getRefreshTokenSecretKey();
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }).catch(async () => {
      return await jwtVerify(token, secret);
    });

    return {
      userId: payload.userId as string,
    };
  } catch {
    return null;
  }
}

// Backwards-compatibility aliases
export const signJwtToken = signAccessToken;
export const verifyJwtToken = verifyAccessToken;

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('accessToken')?.value ||
      cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    return verifyAccessToken(token);
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
