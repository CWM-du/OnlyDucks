import 'server-only';
import { prisma } from '@/lib/db/prisma';

/**
 * Temporary stub until the shared auth layer (Developer 1/2) is in place.
 * Reads the external user id from the `x-user-id` header and upserts a local
 * User row so foreign keys resolve. Replace with the real auth helper
 * (session token / cookie / JWT) once available, keeping this signature.
 */
export async function getCurrentUserId(request: Request): Promise<string | null> {
  const externalUserId = request.headers.get('x-user-id');
  if (!externalUserId) return null;

  const user = await prisma.user.upsert({
    where: { externalUserId },
    update: {},
    create: { externalUserId },
    select: { id: true },
  });

  return user.id;
}
