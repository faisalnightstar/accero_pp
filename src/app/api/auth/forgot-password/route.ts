import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/mail';

const forgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'Please enter your registered email or phone number'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier } = forgotPasswordSchema.parse(body);

    await connectToDatabase();

    const normalizedIdentifier = identifier.trim();

    // Find user by email or 10-digit phone
    const user = await User.findOne({
      $or: [
        { email: normalizedIdentifier.toLowerCase() },
        { phone: normalizedIdentifier },
      ],
    });

    // To prevent account enumeration, return success even if user doesn't exist
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with this email or phone number, reset instructions have been sent.',
      });
    }

    if (user.status === 'suspended') {
      return NextResponse.json(
        { error: 'This account has been suspended. Please contact support.' },
        { status: 403 }
      );
    }

    // Generate secure random reset token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expires;
    await user.save();

    // Determine base URL
    const origin =
      request.headers.get('origin') ||
      process.env.CLIENT_URL ||
      'http://localhost:3000';
    const resetUrl = `${origin}/reset-password?token=${rawToken}`;

    // Dispatch email
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    return NextResponse.json({
      message: 'If an account exists with this email or phone number, reset instructions have been sent.',
      ...(process.env.NODE_ENV !== 'production' ? { devResetUrl: resetUrl } : {}),
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
