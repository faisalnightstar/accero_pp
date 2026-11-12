import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import { hashPassword, signJwtToken, getRoleDashboardUrl } from '@/lib/auth';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { logAuditEvent } from '@/lib/logger/audit';
import {
  generateUniqueReferralCode,
  processReferralRegistration,
} from '@/lib/referral/service';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Must be a 10-digit mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters long for security'),
  referralCode: z.string().optional(),
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
    // Rate limit registration by IP (max 5 per minute)
    const rateLimit = await checkRateLimit('AUTH_REGISTER', ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: validatedData.email.toLowerCase() }, { phone: validatedData.phone }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email or phone number already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Generate unique referral code for the new operator
    const userReferralCode = await generateUniqueReferralCode(validatedData.name);

    // Create User record
    const user = new User({
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      phone: validatedData.phone,
      passwordHash,
      role: 'user',
      referralCode: userReferralCode,
    });

    await user.save();

    // Automatically provision user's wallet with ₹0 initial balance
    const wallet = new Wallet({
      userId: user._id,
      balance: 0,
      currency: 'INR',
      transactions: [],
    });

    await wallet.save();

    // Link wallet to user
    user.walletId = wallet._id as any;
    await user.save();

    // Process referral code if provided by new operator
    if (validatedData.referralCode?.trim()) {
      await processReferralRegistration(
        user._id.toString(),
        validatedData.referralCode.trim(),
        ip
      );
    }

    await logAuditEvent({
      actorId: user._id,
      actorEmail: user.email,
      action: 'AUTH_REGISTER',
      resourceType: 'AUTH',
      resourceId: user._id.toString(),
      ip,
      userAgent,
      details: { name: user.name, phone: user.phone },
      status: 'SUCCESS',
    });

    // Issue JWT Token in HTTP-only Cookie
    const token = await signJwtToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        message: 'Account registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          walletBalance: 0,
        },
        redirectTo: getRoleDashboardUrl(user.role),
      },
      { status: 201 }
    );

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
      { error: error.message || 'Failed to register account' },
      { status: 500 }
    );
  }
}
