import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyLocalLogin } from '@/modules/auth/login';
import { createSession, hasValidRequestOrigin, SESSION_COOKIE, sessionCookieOptions } from '@/modules/auth/session';

export const runtime = 'nodejs';
const schema = z.object({ username: z.string().trim().min(3).max(64).regex(/^[a-zA-Z0-9_-]+$/), password: z.string().min(1).max(1024) });
export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  try {
    const userId = await verifyLocalLogin(body.data.username, body.data.password);
    if (!userId) return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    const token = await createSession(userId);
    const response = NextResponse.json({ authenticated: true }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ error: 'Authentication unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
