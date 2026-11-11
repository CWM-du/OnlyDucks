import { Prisma, MentorSessionStatus, type MessageRole } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { initialMentorProfiles } from './mentor-profiles';
import { ActiveSessionConflictError } from './errors';

export class SessionRepository {
  async ensureUser(externalUserId: string) {
    return prisma.user.upsert({
      where: { externalUserId },
      update: {},
      create: { externalUserId },
    });
  }

  async ensureMentorProfile(slug: string) {
    const existing = await prisma.mentorProfile.findUnique({
      where: { slug },
    });
    if (existing) return existing;

    const seed = initialMentorProfiles.find((profile) => profile.slug === slug);
    if (!seed) return null;

    return prisma.mentorProfile.create({
      data: {
        slug: seed.slug,
        name: seed.name,
        technology: seed.technology,
        teachingStyle: seed.teachingStyle,
        promptKey: seed.promptKey,
        isEnabled: true,
      },
    });
  }

  async getActiveSessionByUserId(userId: string) {
    return prisma.mentorSession.findFirst({
      where: {
        userId,
        status: MentorSessionStatus.ACTIVE,
      },
      include: {
        mentor: {
          select: {
            id: true,
            slug: true,
            name: true,
            technology: true,
            teachingStyle: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async createSessionWithConflictCheck(userId: string, mentorId: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        const active = await tx.mentorSession.findFirst({
          where: {
            userId,
            status: MentorSessionStatus.ACTIVE,
          },
          select: { id: true },
        });

        if (active) {
          throw new ActiveSessionConflictError(active.id);
        }

        return await tx.mentorSession.create({
          data: {
            userId,
            mentorId,
            status: MentorSessionStatus.ACTIVE,
            turnCount: 1,
          },
          include: {
            mentor: {
              select: {
                id: true,
                slug: true,
                name: true,
                technology: true,
                teachingStyle: true,
              },
            },
          },
        });
      });
    } catch (error) {
      if (error instanceof ActiveSessionConflictError) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint violation (e.g. idx_mentor_sessions_user_active)
        // P2034: Transaction failed due to a write conflict or a deadlock
        if (error.code === 'P2002' || error.code === 'P2034') {
          throw new ActiveSessionConflictError();
        }
      }
      throw error;
    }
  }

  async getSessionById(sessionId: string) {
    return prisma.mentorSession.findUnique({
      where: { id: sessionId },
      include: {
        mentor: {
          select: {
            id: true,
            slug: true,
            name: true,
            technology: true,
            teachingStyle: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async updateSessionStatus(
    sessionId: string,
    status: MentorSessionStatus,
    endedAt: Date = new Date(),
  ) {
    return prisma.mentorSession.update({
      where: { id: sessionId },
      data: {
        status,
        endedAt,
      },
      include: {
        mentor: {
          select: {
            id: true,
            slug: true,
            name: true,
            technology: true,
            teachingStyle: true,
          },
        },
      },
    });
  }

  async addSessionMessage(data: {
    sessionId: string;
    role: MessageRole;
    content: string;
    turnNumber: number;
  }) {
    return prisma.mentorMessage.create({
      data: {
        sessionId: data.sessionId,
        role: data.role,
        content: data.content,
        turnNumber: data.turnNumber,
      },
    });
  }

  async incrementTurnCount(sessionId: string) {
    return prisma.mentorSession.update({
      where: { id: sessionId },
      data: {
        turnCount: { increment: 1 },
      },
    });
  }
}

export const sessionRepository = new SessionRepository();

