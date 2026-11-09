import { MentorSessionStatus } from '@prisma/client';
import { sessionRepository, type SessionRepository } from './session-repository';
import { InvalidSessionStateError, MentorNotFoundError, SessionNotFoundError } from './errors';
import { analyticsService, type AnalyticsService } from '@/modules/analytics/analytics-service';

export class SessionService {
  constructor(
    private readonly repo: SessionRepository = sessionRepository,
    private readonly analytics: AnalyticsService = analyticsService,
  ) {}

  async createSession(externalUserId: string, mentorSlug: string) {
    const user = await this.repo.ensureUser(externalUserId);

    const mentor = await this.repo.ensureMentorProfile(mentorSlug);
    if (!mentor || !mentor.isEnabled) {
      throw new MentorNotFoundError(mentorSlug);
    }

    const session = await this.repo.createSessionWithConflictCheck(user.id, mentor.id);

    await this.analytics.trackSessionStarted(user.id, session.id, mentorSlug);

    return session;
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

    const updated = await this.repo.updateSessionStatus(sessionId, targetStatus, new Date());

    if (targetStatus === MentorSessionStatus.COMPLETED) {
      await this.analytics.trackSessionCompleted(user.id, sessionId, session.turnCount);
    } else if (
      targetStatus === MentorSessionStatus.FAILED ||
      targetStatus === MentorSessionStatus.CANCELLED
    ) {
      await this.analytics.trackSessionFailed(user.id, sessionId, targetStatus);
    }

    return updated;
  }
}

export const sessionService = new SessionService();
