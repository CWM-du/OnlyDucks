import { prisma } from '@/lib/db/prisma';
import { generateSessionToken, sessionTokenHash } from './crypto';

export const SESSION_COOKIE = 'onlyducks_session';
export const SESSION_MAX_AGE = 60 * 60 * 8;

export function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}

export function readSessionToken(request: Request): string | null {
  const cookie = request.headers.get('cookie') ?? '';
  const entry = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!entry) return null;
  const value = entry.slice(SESSION_COOKIE.length + 1);
  return /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
}

export async function createSession(userId: string) {
  const token = generateSessionToken();
  await prisma.authSession.create({ data: {
    userId, tokenHash: sessionTokenHash(token),
    expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
  } });
  return token;
}

export async function revokeSession(token: string | null) {
  if (!token) return;
  await prisma.authSession.updateMany({
    where: { tokenHash: sessionTokenHash(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Reject cross-site writes that use ambient authentication cookies. */
export function hasValidRequestOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const target = new URL(request.url);
    const configured = process.env.APP_BASE_URL ? new URL(process.env.APP_BASE_URL) : target;
    return url.origin === configured.origin && url.protocol === configured.protocol;
  } catch { return false; }
}
