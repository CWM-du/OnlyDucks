import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from './crypto';

// Lockout is account-based; deploy an IP-aware edge rate limiter before public exposure.
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;
export async function verifyLocalLogin(username: string, password: string): Promise<string | null> {
  const externalUserId = `local:${username.toLowerCase()}`;
  const user = await prisma.user.findUnique({
    where: { externalUserId }, include: { localCredential: true },
  });
  const credential = user?.localCredential;
  if (!user || !credential) return null;
  if (credential.lockedUntil && credential.lockedUntil > new Date()) return null;
  const valid = await verifyPassword(password, credential.passwordHash);
  if (!valid) {
    const attempts = credential.failedAttempts + 1;
    await prisma.localCredential.update({ where: { userId: user.id }, data: {
      failedAttempts: attempts,
      lockedUntil: attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MS) : null,
    } });
    return null;
  }
  await prisma.localCredential.update({ where: { userId: user.id }, data: { failedAttempts: 0, lockedUntil: null } });
  return user.id;
}
