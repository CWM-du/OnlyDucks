import { describe, expect, it, vi } from 'vitest';
import { MentorSessionStatus } from '@prisma/client';
import { SessionService } from './session-service';
import { SessionRepository } from './session-repository';
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

  it('creates a new session successfully', async () => {
    const repo = new SessionRepository();
    vi.spyOn(repo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(repo, 'ensureMentorProfile').mockResolvedValue(mockMentor);
    vi.spyOn(repo, 'createSessionWithConflictCheck').mockResolvedValue(mockActiveSession);

    const service = new SessionService(repo);
    const result = await service.createSession('ext-user-1', 'python-socratic');

    expect(result).toEqual(mockActiveSession);
    expect(repo.ensureUser).toHaveBeenCalledWith('ext-user-1');
    expect(repo.ensureMentorProfile).toHaveBeenCalledWith('python-socratic');
    expect(repo.createSessionWithConflictCheck).toHaveBeenCalledWith(mockUser.id, mockMentor.id);
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

  it('transitions active session to completed status', async () => {
    const repo = new SessionRepository();
    vi.spyOn(repo, 'ensureUser').mockResolvedValue(mockUser);
    vi.spyOn(repo, 'getSessionById').mockResolvedValue(mockActiveSession);
    vi.spyOn(repo, 'updateSessionStatus').mockResolvedValue({
      ...mockActiveSession,
      status: MentorSessionStatus.COMPLETED,
      endedAt: new Date(),
    });

    const service = new SessionService(repo);
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

