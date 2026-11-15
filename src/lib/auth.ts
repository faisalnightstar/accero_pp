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

// User specified secrets & defaults
export const DEFAULT_ACCESS_TOKEN_SECRET =
  '58baf280aa06bc777111fb1defe21e04674255bb91569cc8e4a0c741741ed840';
export const DEFAULT_REFRESH_TOKEN_SECRET =
  'daf9988adaf9d0878bc8142a0ac82e1d4345be548b91e0add21495b4b48b94ba';

/**
 * Returns primary cryptographic key for signing Access JWT tokens.
 */
export function getJwtSecretKey(): Uint8Array {
  const secret =
    process.env.ACCESS_TOKEN_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    DEFAULT_ACCESS_TOKEN_SECRET;
  return new TextEncoder().encode(secret);
}

/**
 * Returns candidate secrets for Access Token verification to prevent
 * Edge Runtime vs Node.js Serverless runtime configuration discrepancies.
 */
export function getPossibleAccessSecrets(): Uint8Array[] {
  const candidates = [
    process.env.ACCESS_TOKEN_SECRET?.trim(),
    process.env.JWT_SECRET?.trim(),
    DEFAULT_ACCESS_TOKEN_SECRET,
  ].filter((s): s is string => !!s && s.length >= 32);

  const unique = Array.from(new Set(candidates));
  return unique.map((s) => new TextEncoder().encode(s));
}

/**
 * Returns primary cryptographic key for signing Refresh JWT tokens.
 */
export function getRefreshTokenSecretKey(): Uint8Array {
  const secret =
    process.env.REFRESH_TOKEN_SECRET?.trim() ||
    process.env.ACCESS_TOKEN_SECRET?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    DEFAULT_REFRESH_TOKEN_SECRET;
  return new TextEncoder().encode(secret);
}

/**
 * Returns candidate secrets for Refresh Token verification.
 */
export function getPossibleRefreshSecrets(): Uint8Array[] {
  const candidates = [
    process.env.REFRESH_TOKEN_SECRET?.trim(),
    process.env.ACCESS_TOKEN_SECRET?.trim(),
    process.env.JWT_SECRET?.trim(),
    DEFAULT_REFRESH_TOKEN_SECRET,
  ].filter((s): s is string => !!s && s.length >= 32);

  const unique = Array.from(new Set(candidates));
  return unique.map((s) => new TextEncoder().encode(s));
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
 * Verifies an Access Token against candidate secrets with strict and relaxed issuer/audience checks.
 */
export async function verifyAccessToken(token: string): Promise<UserSession | null> {
  const secrets = getPossibleAccessSecrets();

  for (const secret of secrets) {
    try {
      const { payload } = await jwtVerify(token, secret, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }).catch(async () => {
        return await jwtVerify(token, secret);
      });

      return {
        userId: payload.userId as string,
        email: payload.email as string,
        name: payload.name as string,
        role: (payload.role as UserSession['role']) || 'user',
      };
    } catch {
      // Continue to next candidate secret
    }
  }

  return null;
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
 * Verifies a Refresh Token against candidate secrets.
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  const secrets = getPossibleRefreshSecrets();

  for (const secret of secrets) {
    try {
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
      // Continue to next candidate secret
    }
  }

  return null;
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
