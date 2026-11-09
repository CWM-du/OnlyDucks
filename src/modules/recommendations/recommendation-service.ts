import {
  recommendationRepository,
  type RecommendationRepository,
} from './recommendation-repository';
import { sessionRepository, type SessionRepository } from '@/modules/mentors/session-repository';
import { SessionNotFoundError } from '@/modules/mentors/errors';
import { analyticsService, type AnalyticsService } from '@/modules/analytics/analytics-service';

export class RecommendationService {
  constructor(
    private readonly repo: RecommendationRepository = recommendationRepository,
    private readonly sessionRepo: SessionRepository = sessionRepository,
    private readonly analytics: AnalyticsService = analyticsService,
  ) {}

  async addRecommendation(
    externalUserId: string,
    data: { sessionId: string; contentItemId: string; notes?: string },
  ) {
    const user = await this.sessionRepo.ensureUser(externalUserId);
    const session = await this.sessionRepo.getSessionById(data.sessionId);

    if (!session || session.userId !== user.id) {
      throw new SessionNotFoundError(data.sessionId);
    }

    const recommendation = await this.repo.createRecommendation(data);

    await this.analytics.trackRecommendationDisplayed(
      user.id,
      data.sessionId,
      data.contentItemId,
      data.notes ? { notes: data.notes } : undefined,
    );

    return recommendation;
  }

  async getSessionRecommendations(externalUserId: string, sessionId: string) {
    const user = await this.sessionRepo.ensureUser(externalUserId);
    const session = await this.sessionRepo.getSessionById(sessionId);

    if (!session || session.userId !== user.id) {
      throw new SessionNotFoundError(sessionId);
    }

    return this.repo.getRecommendationsBySessionId(sessionId);
  }
}

export const recommendationService = new RecommendationService();
