import { prisma } from '@/lib/db/prisma';
import { readSessionToken } from './session';
import { sessionTokenHash } from './crypto';
import type { AuthenticatedIdentity, IdentityProvider } from './types';

/** Local MVP adapter. Replace via this interface when the verified SSO contract exists. */
class LocalIdentityProvider implements IdentityProvider {
  async authenticate(request: Request): Promise<AuthenticatedIdentity | null> {
    const token = readSessionToken(request);
    if (!token) return null;
    const session = await prisma.authSession.findUnique({
      where: { tokenHash: sessionTokenHash(token) },
      select: { user: { select: { externalUserId: true } }, expiresAt: true, revokedAt: true },
    });
    if (!session || session.revokedAt || session.expiresAt <= new Date()) return null;
    return { externalUserId: session.user.externalUserId, issuer: 'onlyducks-local-mvp' };
  }
}

export const identityProvider: IdentityProvider = new LocalIdentityProvider();
