import { describe, expect, it, vi } from 'vitest';
import { MentorSessionStatus } from '@prisma/client';
import { SessionService } from './session-service';
import { SessionRepository } from './session-repository';
import { AnalyticsService } from '@/modules/analytics/analytics-service';
import {
  ActiveSessionConflictError,
  InvalidSessionStateError,
  MentorNotFoundError,
  SessionNotFoundError,
} from './errors';

describe('SessionService', () => {
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
    promptKey: 'python-socratic-v1',
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockActiveSession = {
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

  it('creates a new session successfully and tracks mentor_session_started', async () => {
    const repo = new SessionRepository();
    const analytics = new AnalyticsService();
    vi.spyOn(repo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(repo, 'ensureMentorProfile').mockResolvedValue(mockMentor);
    vi.spyOn(repo, 'createSessionWithConflictCheck').mockResolvedValue(mockActiveSession);
    const trackStartedSpy = vi
      .spyOn(analytics, 'trackSessionStarted')
      .mockResolvedValue({ recorded: true, id: 'event-1' });

    const service = new SessionService(repo, analytics);
    const result = await service.createSession('ext-user-1', 'python-socratic');

    expect(result).toEqual(mockActiveSession);
    expect(repo.ensureUser).toHaveBeenCalledWith('ext-user-1');
    expect(repo.ensureMentorProfile).toHaveBeenCalledWith('python-socratic');
    expect(repo.createSessionWithConflictCheck).toHaveBeenCalledWith(mockUser.id, mockMentor.id);
    expect(trackStartedSpy).toHaveBeenCalledWith(
      mockUser.id,
      mockActiveSession.id,
      'python-socratic',
    );
  });

  it('still creates session even if analytics tracking fails', async () => {
    const repo = new SessionRepository();
    const analytics = new AnalyticsService();
    vi.spyOn(repo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(repo, 'ensureMentorProfile').mockResolvedValue(mockMentor);
    vi.spyOn(repo, 'createSessionWithConflictCheck').mockResolvedValue(mockActiveSession);
    vi.spyOn(analytics, 'trackSessionStarted').mockResolvedValue({ recorded: false });

    const service = new SessionService(repo, analytics);
    const result = await service.createSession('ext-user-1', 'python-socratic');

    expect(result).toEqual(mockActiveSession);
  });

  it('throws MentorNotFoundError when mentor profile does not exist', async () => {
    const repo = new SessionRepository();
    vi.spyOn(repo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(repo, 'ensureMentorProfile').mockResolvedValue(null);

    const service = new SessionService(repo);
    await expect(service.createSession('ext-user-1', 'unknown-mentor')).rejects.toThrow(
      MentorNotFoundError,
    );
  });

  it('throws MentorNotFoundError when mentor is disabled', async () => {
    const repo = new SessionRepository();
    vi.spyOn(repo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(repo, 'ensureMentorProfile').mockResolvedValue({
      ...mockMentor,
      isEnabled: false,
    });

    const service = new SessionService(repo);
    await expect(service.createSession('ext-user-1', 'python-socratic')).rejects.toThrow(
      MentorNotFoundError,
    );
  });

  it('throws ActiveSessionConflictError on concurrent or existing active session', async () => {
    const repo = new SessionRepository();
    vi.spyOn(repo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(repo, 'ensureMentorProfile').mockResolvedValue(mockMentor);
    vi.spyOn(repo, 'createSessionWithConflictCheck').mockRejectedValue(
      new ActiveSessionConflictError('session-cuid-1'),
    );

    const service = new SessionService(repo);
    await expect(service.createSession('ext-user-1', 'python-socratic')).rejects.toThrow(
      ActiveSessionConflictError,
    );
  });

  it('retrieves active session for user', async () => {
    const repo = new SessionRepository();
    vi.spyOn(repo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(repo, 'getActiveSessionByUserId').mockResolvedValue(mockActiveSession);

    const service = new SessionService(repo);
    const result = await service.getActiveSession('ext-user-1');

    expect(result).toEqual(mockActiveSession);
    expect(repo.getActiveSessionByUserId).toHaveBeenCalledWith(mockUser.id);
  });

  it('transitions active session to completed status and tracks mentor_session_completed', async () => {
    const repo = new SessionRepository();
    const analytics = new AnalyticsService();
    vi.spyOn(repo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(repo, 'getSessionById').mockResolvedValue(mockActiveSession);
    vi.spyOn(repo, 'updateSessionStatus').mockResolvedValue({
      ...mockActiveSession,
      status: MentorSessionStatus.COMPLETED,
      endedAt: new Date(),
    });
    const trackCompletedSpy = vi
      .spyOn(analytics, 'trackSessionCompleted')
      .mockResolvedValue({ recorded: true, id: 'event-2' });

    const service = new SessionService(repo, analytics);
    const result = await service.transitionSessionStatus(
      'ext-user-1',
      'session-cuid-1',
      MentorSessionStatus.COMPLETED,
    );

    expect(result.status).toBe(MentorSessionStatus.COMPLETED);
    expect(repo.updateSessionStatus).toHaveBeenCalledWith(
      'session-cuid-1',
      MentorSessionStatus.COMPLETED,
      expect.any(Date),
    );
    expect(trackCompletedSpy).toHaveBeenCalledWith(
      mockUser.id,
      'session-cuid-1',
      mockActiveSession.turnCount,
    );
  });

  it('transitions active session to failed or cancelled status and tracks mentor_session_failed', async () => {
    const repo = new SessionRepository();
    const analytics = new AnalyticsService();
    vi.spyOn(repo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(repo, 'getSessionById').mockResolvedValue(mockActiveSession);
    vi.spyOn(repo, 'updateSessionStatus').mockResolvedValue({
      ...mockActiveSession,
      status: MentorSessionStatus.FAILED,
      endedAt: new Date(),
    });
    const trackFailedSpy = vi
      .spyOn(analytics, 'trackSessionFailed')
      .mockResolvedValue({ recorded: true, id: 'event-3' });

    const service = new SessionService(repo, analytics);
    const result = await service.transitionSessionStatus(
      'ext-user-1',
      'session-cuid-1',
      MentorSessionStatus.FAILED,
    );

    expect(result.status).toBe(MentorSessionStatus.FAILED);
    expect(trackFailedSpy).toHaveBeenCalledWith(
      mockUser.id,
      'session-cuid-1',
      MentorSessionStatus.FAILED,
    );
  });

  it('rejects transition when session is not owned by user', async () => {
    const repo = new SessionRepository();
    vi.spyOn(repo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(repo, 'getSessionById').mockResolvedValue({
      ...mockActiveSession,
      userId: 'different-user-cuid',
    });

    const service = new SessionService(repo);
    await expect(
      service.transitionSessionStatus(
        'ext-user-1',
        'session-cuid-1',
        MentorSessionStatus.COMPLETED,
      ),
    ).rejects.toThrow(SessionNotFoundError);
  });

  it('rejects transition when session is already completed', async () => {
    const repo = new SessionRepository();
    vi.spyOn(repo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(repo, 'getSessionById').mockResolvedValue({
      ...mockActiveSession,
      status: MentorSessionStatus.COMPLETED,
    });

    const service = new SessionService(repo);
    await expect(
      service.transitionSessionStatus(
        'ext-user-1',
        'session-cuid-1',
        MentorSessionStatus.CANCELLED,
      ),
    ).rejects.toThrow(InvalidSessionStateError);
  });
});
