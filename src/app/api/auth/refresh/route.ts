import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  parseDurationToSeconds,
} from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    let refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      // Check JSON body fallback
      try {
        const body = await request.json();
        refreshToken = body.refreshToken;
      } catch {
        // body is empty or not json
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 401 }
      );
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(payload.userId);
    if (!user || user.status === 'suspended') {
      return NextResponse.json(
        { error: 'User not found or account suspended' },
        { status: 403 }
      );
    }

    const newAccessToken = await signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const newRefreshToken = await signRefreshToken({
      userId: user._id.toString(),
    });

    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    const secureCookie = process.env.NODE_ENV === 'production' && !isLocalhost;

    const accessMaxAge = parseDurationToSeconds(process.env.ACCESS_TOKEN_EXPIRY, 3 * 86400);
    const refreshMaxAge = parseDurationToSeconds(process.env.REFRESH_TOKEN_EXPIRY, 30 * 86400);

    const response = NextResponse.json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

    response.cookies.set({
      name: 'auth-token',
      value: newAccessToken,
      httpOnly: true,
      secure: secureCookie,
      sameSite: 'lax',
      path: '/',
      maxAge: accessMaxAge,
    });

    response.cookies.set({
      name: 'accessToken',
      value: newAccessToken,
      httpOnly: true,
      secure: secureCookie,
      sameSite: 'lax',
      path: '/',
      maxAge: accessMaxAge,
    });

    response.cookies.set({
      name: 'refreshToken',
      value: newRefreshToken,
      httpOnly: true,
      secure: secureCookie,
      sameSite: 'lax',
      path: '/',
      maxAge: refreshMaxAge,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Token refresh failed' },
      { status: 500 }
    );
  }
}
