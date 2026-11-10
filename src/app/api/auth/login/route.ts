import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import { verifyPassword, signJwtToken, getRoleDashboardUrl } from '@/lib/auth';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { logAuditEvent } from '@/lib/logger/audit';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Please provide your email or phone number'),
  password: z.string().min(1, 'Password is required'),
});

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    const body = await request.json();
    const { identifier, password } = loginSchema.parse(body);
    const normalizedIdentifier = identifier.trim().toLowerCase();

    // Rate Limit Check (5 attempts per minute per IP + account)
    const rateLimit = await checkRateLimit('AUTH_LOGIN', `${ip}:${normalizedIdentifier}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    await connectToDatabase();

    // Support login via email or 10-digit phone
    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { phone: identifier.trim() }],
    }).select('+passwordHash');

    if (!user) {
      await logAuditEvent({
        action: 'AUTH_LOGIN_FAILED',
        resourceType: 'AUTH',
        resourceId: normalizedIdentifier,
        ip,
        userAgent,
        details: { reason: 'User not found' },
        status: 'FAILURE',
      });

      return NextResponse.json(
        { error: 'Invalid email/phone or password.' },
        { status: 401 }
      );
    }

    if (user.status === 'suspended') {
      await logAuditEvent({
        actorId: user._id,
        actorEmail: user.email,
        action: 'AUTH_LOGIN_FAILED',
        resourceType: 'AUTH',
        resourceId: user._id.toString(),
        ip,
        userAgent,
        details: { reason: 'Account suspended' },
        status: 'WARNING',
      });

      return NextResponse.json(
        { error: 'This account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      await logAuditEvent({
        actorId: user._id,
        actorEmail: user.email,
        action: 'AUTH_LOGIN_FAILED',
        resourceType: 'AUTH',
        resourceId: user._id.toString(),
        ip,
        userAgent,
        details: { reason: 'Invalid password' },
        status: 'FAILURE',
      });

      return NextResponse.json(
        { error: 'Invalid email/phone or password.' },
        { status: 401 }
      );
    }

    // Fetch user wallet balance
    const wallet = await Wallet.findOne({ userId: user._id });
    const balance = wallet ? wallet.balance : 0;

    // Issue JWT Token
    const token = await signJwtToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await logAuditEvent({
      actorId: user._id,
      actorEmail: user.email,
      action: 'AUTH_LOGIN_SUCCESS',
      resourceType: 'AUTH',
      resourceId: user._id.toString(),
      ip,
      userAgent,
      details: { role: user.role },
      status: 'SUCCESS',
    });

    const response = NextResponse.json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        walletBalance: balance,
      },
      redirectTo: getRoleDashboardUrl(user.role),
    });

    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
