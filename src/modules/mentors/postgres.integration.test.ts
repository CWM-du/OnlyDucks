import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MentorSessionStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { SessionRepository } from './session-repository';
import { SessionService } from './session-service';
import { InvalidSessionStateError, SessionNotFoundError } from './errors';

const enabled = Boolean(process.env.TEST_DATABASE_URL);
const suffix = `integration-${process.pid}-${Date.now()}`;

describe.skipIf(!enabled)('PostgreSQL backend integration', () => {
  const repository = new SessionRepository();
  const service = new SessionService(repository);
  let userA: { id: string; externalUserId: string };
  let userB: { id: string; externalUserId: string };
  let mentor: { id: string; slug: string };

  beforeAll(async () => {
    await prisma.$connect();
    userA = await repository.ensureUser(`${suffix}-a`);
    userB = await repository.ensureUser(`${suffix}-b`);
    const profile = await repository.ensureMentorProfile('python-socratic');
    if (!profile) throw new Error('Required seeded mentor profile is unavailable');
    mentor = profile;
  });

  afterAll(async () => {
    if (userA?.id) await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
    await prisma.$disconnect();
  });

  it('enforces one ACTIVE session per user under concurrent inserts', async () => {
    const attempts = await Promise.allSettled(
      Array.from({ length: 8 }, () => repository.createSessionWithConflictCheck(userA.id, mentor.id)),
    );
    expect(attempts.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(attempts.filter((result) => result.status === 'rejected')).toHaveLength(7);
    expect(await prisma.mentorSession.count({
      where: { userId: userA.id, status: MentorSessionStatus.ACTIVE },
    })).toBe(1);
  });

  it('prevents one user from transitioning another user session', async () => {
    const session = await prisma.mentorSession.findFirstOrThrow({
      where: { userId: userA.id, status: MentorSessionStatus.ACTIVE },
    });
    await expect(
      service.transitionSessionStatus(userB.externalUserId, session.id, MentorSessionStatus.COMPLETED),
    ).rejects.toBeInstanceOf(SessionNotFoundError);
    await expect(
      service.transitionSessionStatus(userA.externalUserId, session.id, MentorSessionStatus.COMPLETED),
    ).resolves.toMatchObject({ id: session.id, userId: userA.id, status: MentorSessionStatus.COMPLETED });
  });

  it('allows only one concurrent terminal transition and records no duplicate winner', async () => {
    const session = await repository.createSessionWithConflictCheck(userB.id, mentor.id);
    const attempts = await Promise.allSettled([
      service.transitionSessionStatus(userB.externalUserId, session.id, MentorSessionStatus.COMPLETED),
      service.transitionSessionStatus(userB.externalUserId, session.id, MentorSessionStatus.COMPLETED),
    ]);

    expect(attempts.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(attempts.filter((result) => result.status === 'rejected')).toHaveLength(1);
    const rejected = attempts.find((result) => result.status === 'rejected');
    expect(rejected).toMatchObject({ reason: expect.any(InvalidSessionStateError) });
    expect(await prisma.mentorSession.count({
      where: { id: session.id, status: MentorSessionStatus.COMPLETED },
    })).toBe(1);
  });
});
