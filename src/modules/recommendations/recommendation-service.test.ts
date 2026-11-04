import { describe, expect, it, vi } from 'vitest';
import { RecommendationService } from './recommendation-service';
import { RecommendationRepository } from './recommendation-repository';
import { SessionRepository } from '@/modules/mentors/session-repository';
import { SessionNotFoundError } from '@/modules/mentors/errors';
import { MentorSessionStatus } from '@prisma/client';

describe('RecommendationService', () => {
  const mockUser = {
    id: 'user-cuid-1',
    externalUserId: 'ext-user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMentor = {
    id: 'mentor-cuid-1',
    slug: 'python-socratic',
    name: 'Python Socratic',
    technology: 'Python',
    teachingStyle: 'Socratic',
  };

  const mockSession = {
    id: 'session-cuid-1',
    userId: mockUser.id,
    mentorId: mockMentor.id,
    status: MentorSessionStatus.ACTIVE,
    turnCount: 1,
    startedAt: new Date(),
    endedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    mentor: mockMentor,
    messages: [],
  };

  const mockRecommendation = {
    id: 'rec-1',
    sessionId: 'session-cuid-1',
    contentItemId: 'content-1',
    recommendedAt: new Date(),
    notes: 'Suggested next step',
    contentItem: {
      id: 'content-1',
      externalId: null,
      type: 'ARTICLE' as const,
      title: 'Python Async Deep Dive',
      summary: null,
      destinationUrl: 'https://notodoescodigo.com/python-async',
      source: 'internal',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  it('adds recommendation when session exists and is owned by user', async () => {
    const repo = new RecommendationRepository();
    const sessionRepo = new SessionRepository();

    vi.spyOn(sessionRepo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(sessionRepo, 'getSessionById').mockResolvedValue(mockSession);
    vi.spyOn(repo, 'createRecommendation').mockResolvedValue(mockRecommendation);

    const service = new RecommendationService(repo, sessionRepo);
    const result = await service.addRecommendation('ext-user-1', {
      sessionId: 'session-cuid-1',
      contentItemId: 'content-1',
      notes: 'Suggested next step',
    });

    expect(result).toEqual(mockRecommendation);
    expect(repo.createRecommendation).toHaveBeenCalledWith({
      sessionId: 'session-cuid-1',
      contentItemId: 'content-1',
      notes: 'Suggested next step',
    });
  });

  it('rejects adding recommendation when session does not belong to user', async () => {
    const repo = new RecommendationRepository();
    const sessionRepo = new SessionRepository();

    vi.spyOn(sessionRepo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(sessionRepo, 'getSessionById').mockResolvedValue({
      ...mockSession,
      userId: 'other-user',
    });

    const service = new RecommendationService(repo, sessionRepo);
    await expect(
      service.addRecommendation('ext-user-1', {
        sessionId: 'session-cuid-1',
        contentItemId: 'content-1',
      }),
    ).rejects.toThrow(SessionNotFoundError);
  });

  it('retrieves recommendations for valid session', async () => {
    const repo = new RecommendationRepository();
    const sessionRepo = new SessionRepository();

    vi.spyOn(sessionRepo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(sessionRepo, 'getSessionById').mockResolvedValue(mockSession);
    vi.spyOn(repo, 'getRecommendationsBySessionId').mockResolvedValue([mockRecommendation]);

    const service = new RecommendationService(repo, sessionRepo);
    const result = await service.getSessionRecommendations('ext-user-1', 'session-cuid-1');

    expect(result).toEqual([mockRecommendation]);
    expect(repo.getRecommendationsBySessionId).toHaveBeenCalledWith('session-cuid-1');
  });
});
