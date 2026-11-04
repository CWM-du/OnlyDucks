import {
  recommendationRepository,
  type RecommendationRepository,
} from './recommendation-repository';
import { sessionRepository, type SessionRepository } from '@/modules/mentors/session-repository';
import { SessionNotFoundError } from '@/modules/mentors/errors';

export class RecommendationService {
  constructor(
    private readonly repo: RecommendationRepository = recommendationRepository,
    private readonly sessionRepo: SessionRepository = sessionRepository,
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

    return this.repo.createRecommendation(data);
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
