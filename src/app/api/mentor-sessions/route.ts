import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma, MentorSessionStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUserId } from '@/lib/security/current-user';

const createSessionSchema = z.object({
  mentorSlug: z.string().min(1),
});

/**
 * GET /api/mentor-sessions
 * Returns the current user's active session if any, otherwise 204.
 */
export async function GET(request: Request) {
  const userId = await getCurrentUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const active = await prisma.mentorSession.findFirst({
    where: { userId, status: MentorSessionStatus.ACTIVE },
    include: {
      mentor: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!active) return new NextResponse(null, { status: 204 });
  return NextResponse.json(active);
}

/**
 * POST /api/mentor-sessions
 * Creates a new active session. If the user already has one active, returns it
 * with 200 instead of a conflict — the UI resumes the existing conversation.
 */
export async function POST(request: Request) {
  const userId = await getCurrentUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const parsed = createSessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const mentor = await prisma.mentorProfile.findUnique({
    where: { slug: parsed.data.mentorSlug },
  });
  if (!mentor || !mentor.isEnabled) {
    return NextResponse.json({ error: 'Mentor not found.' }, { status: 404 });
  }

  try {
    const session = await prisma.mentorSession.create({
      data: {
        userId,
        mentorId: mentor.id,
        promptKeyUsed: mentor.promptKey,
      },
      include: {
        mentor: true,
        messages: true,
      },
    });
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    // P2002 = unique constraint violation. Our partial unique index on
    // (userId) WHERE status='ACTIVE' guarantees at most one active session;
    // on race, return the existing one so the UI resumes it.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const existing = await prisma.mentorSession.findFirst({
        where: { userId, status: MentorSessionStatus.ACTIVE },
        include: {
          mentor: true,
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
      if (existing) return NextResponse.json(existing, { status: 200 });
    }
    throw error;
  }
}
