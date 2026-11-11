import { describe, expect, it, vi } from 'vitest';
import { AnalyticsService } from './analytics-service';
import { AnalyticsRepository } from './analytics-repository';

describe('AnalyticsService', () => {
  const mockCreatedEvent = {
    id: 'event-cuid-1',
    eventType: 'mentor_session_started',
    userId: 'user-1',
    sessionId: 'session-1',
    contentId: null,
    destination: null,
    properties: { mentorSlug: 'python-socratic' },
    occurredAt: new Date(),
  };

  it('records an event successfully and returns recorded: true with id', async () => {
    const repo = new AnalyticsRepository();
    vi.spyOn(repo, 'createEvent').mockResolvedValue(mockCreatedEvent);

    const service = new AnalyticsService(repo);
    const result = await service.trackEvent({
      eventType: 'mentor_session_started',
      userId: 'user-1',
      sessionId: 'session-1',
      properties: { mentorSlug: 'python-socratic' },
    });

    expect(result).toEqual({ recorded: true, id: 'event-cuid-1' });
    expect(repo.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'mentor_session_started',
        userId: 'user-1',
        sessionId: 'session-1',
        properties: { mentorSlug: 'python-socratic' },
      }),
    );
  });

  it('never throws an exception when the database or repository fails (zero-failure boundary)', async () => {
    const repo = new AnalyticsRepository();
    vi.spyOn(repo, 'createEvent').mockRejectedValue(new Error('PostgreSQL connection terminated'));

    const service = new AnalyticsService(repo);
    const result = await service.trackEvent({
      eventType: 'mentor_session_started',
      userId: 'user-1',
      sessionId: 'session-1',
    });

    expect(result).toEqual({ recorded: false });
  });

  it('sanitizes sensitive properties before delegating to repository', async () => {
    const repo = new AnalyticsRepository();
    vi.spyOn(repo, 'createEvent').mockResolvedValue(mockCreatedEvent);

    const service = new AnalyticsService(repo);
    await service.trackEvent({
      eventType: 'mentor_session_started',
      userId: 'user-1',
      sessionId: 'session-1',
      properties: {
        mentorSlug: 'python-socratic',
        prompt: 'You are a python expert...',
        passwordHash: 'secret-hash',
        userEmail: 'dev@example.com',
      },
    });

    expect(repo.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: {
          mentorSlug: 'python-socratic',
        },
      }),
    );
  });

  it('embeds attribution source into properties if provided at root', async () => {
    const repo = new AnalyticsRepository();
    vi.spyOn(repo, 'createEvent').mockResolvedValue(mockCreatedEvent);

    const service = new AnalyticsService(repo);
    await service.trackOutboundClick({
      userId: 'user-1',
      sessionId: 'session-1',
      contentId: 'content-1',
      destination: 'https://example.com/docs',
      source: 'recommendation_card',
      properties: { position: 1 },
    });

    expect(repo.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'outbound_click',
        destination: 'https://example.com/docs',
        properties: {
          position: 1,
          source: 'recommendation_card',
        },
      }),
    );
  });

  it('records mentor_session_completed with turn count', async () => {
    const repo = new AnalyticsRepository();
    vi.spyOn(repo, 'createEvent').mockResolvedValue(mockCreatedEvent);

    const service = new AnalyticsService(repo);
    const result = await service.trackSessionCompleted('user-1', 'session-1', 4);

    expect(result.recorded).toBe(true);
    expect(repo.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'mentor_session_completed',
        properties: { turnCount: 4 },
      }),
    );
  });

  it('records mentor_session_failed with reason', async () => {
    const repo = new AnalyticsRepository();
    vi.spyOn(repo, 'createEvent').mockResolvedValue(mockCreatedEvent);

    const service = new AnalyticsService(repo);
    const result = await service.trackSessionFailed('user-1', 'session-1', 'network_timeout');

    expect(result.recorded).toBe(true);
    expect(repo.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'mentor_session_failed',
        properties: { reason: 'network_timeout' },
      }),
    );
  });

  it('records recommendation_displayed with contentId and metadata', async () => {
    const repo = new AnalyticsRepository();
    vi.spyOn(repo, 'createEvent').mockResolvedValue(mockCreatedEvent);

    const service = new AnalyticsService(repo);
    const result = await service.trackRecommendationDisplayed('user-1', 'session-1', 'content-1', {
      category: 'python',
    });

    expect(result.recorded).toBe(true);
    expect(repo.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'recommendation_displayed',
        contentId: 'content-1',
        properties: { category: 'python' },
      }),
    );
  });

  it('delegates listEvents and getAttributionReport to the repository', async () => {
    const repo = new AnalyticsRepository();
    const mockListResult = { events: [], total: 0, limit: 50, offset: 0 };
    const mockReportResult = { totalClicks: 0, totalImpressions: 0, items: [] };

    vi.spyOn(repo, 'listEvents').mockResolvedValue(mockListResult);
    vi.spyOn(repo, 'getAttributionReport').mockResolvedValue(mockReportResult);

    const service = new AnalyticsService(repo);
    const listRes = await service.listEvents({ eventType: 'outbound_click' });
    const reportRes = await service.getAttributionReport();

    expect(listRes).toBe(mockListResult);
    expect(reportRes).toBe(mockReportResult);
  });
});
