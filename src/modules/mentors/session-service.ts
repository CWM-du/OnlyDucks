import { MentorSessionStatus } from '@prisma/client';
import { sessionRepository, type SessionRepository } from './session-repository';
import { InvalidSessionStateError, MentorNotFoundError, SessionNotFoundError } from './errors';

export class SessionService {
  constructor(private readonly repo: SessionRepository = sessionRepository) {}

  async createSession(externalUserId: string, mentorSlug: string) {
    const user = await this.repo.ensureUser(externalUserId);

    const mentor = await this.repo.ensureMentorProfile(mentorSlug);
    if (!mentor || !mentor.isEnabled) {
      throw new MentorNotFoundError(mentorSlug);
    }

    return this.repo.createSessionWithConflictCheck(user.id, mentor.id);
  }

  async getActiveSession(externalUserId: string) {
    const user = await this.repo.ensureUser(externalUserId);
    return this.repo.getActiveSessionByUserId(user.id);
  }

  async transitionSessionStatus(
    externalUserId: string,
    sessionId: string,
    targetStatus: MentorSessionStatus,
  ) {
    const user = await this.repo.ensureUser(externalUserId);
    const session = await this.repo.getSessionById(sessionId);

    if (!session || session.userId !== user.id) {
      throw new SessionNotFoundError(sessionId);
    }

    if (session.status !== MentorSessionStatus.ACTIVE) {
      throw new InvalidSessionStateError(session.status);
    }

    return this.repo.updateSessionStatus(sessionId, targetStatus, new Date());
  }
}

export const sessionService = new SessionService();
