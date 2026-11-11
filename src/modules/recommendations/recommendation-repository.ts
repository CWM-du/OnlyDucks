import { prisma } from '@/lib/db/prisma';

export class RecommendationRepository {
  async createRecommendation(data: { sessionId: string; contentItemId: string; notes?: string }) {
    return prisma.sessionRecommendation.create({
      data: {
        sessionId: data.sessionId,
        contentItemId: data.contentItemId,
        notes: data.notes,
      },
      include: {
        contentItem: true,
      },
    });
  }

  async getRecommendationsBySessionId(sessionId: string) {
    return prisma.sessionRecommendation.findMany({
      where: { sessionId },
      include: {
        contentItem: true,
      },
      orderBy: { recommendedAt: 'desc' },
    });
  }
}

export const recommendationRepository = new RecommendationRepository();
