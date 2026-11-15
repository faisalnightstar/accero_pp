import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  response.cookies.set({ name: 'auth-token', value: '', ...cookieOptions });
  response.cookies.set({ name: 'accessToken', value: '', ...cookieOptions });
  response.cookies.set({ name: 'refreshToken', value: '', ...cookieOptions });

  return response;
}

export async function GET(request: Request) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('message', 'logged_out');
  const response = NextResponse.redirect(loginUrl);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  response.cookies.set({ name: 'auth-token', value: '', ...cookieOptions });
  response.cookies.set({ name: 'accessToken', value: '', ...cookieOptions });
  response.cookies.set({ name: 'refreshToken', value: '', ...cookieOptions });

  return response;
}
