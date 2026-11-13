import { NextResponse } from 'next/server';
import { hasValidRequestOrigin, readSessionToken, revokeSession, SESSION_COOKIE, sessionCookieOptions } from '@/modules/auth/session';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  }
  try { await revokeSession(readSessionToken(request)); }
  catch { return NextResponse.json({ error: 'Logout unavailable.' }, { status: 503 }); }
  const response = NextResponse.json({ authenticated: false }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
