import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { PATCH } from './[sessionId]/route';
import { sessionService } from '@/modules/mentors/session-service';
import {
  ActiveSessionConflictError,
  InvalidSessionStateError,
  MentorNotFoundError,
  SessionNotFoundError,
} from '@/modules/mentors/errors';
import { MentorSessionStatus } from '@prisma/client';
import * as requireAuthModule from '@/lib/security/require-auth';

describe('Mentor Sessions API routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const baseUrl = 'http://localhost:3000/api/mentor-sessions';

  const mockActiveSession = {
    id: 'session-cuid-1',
    userId: 'user-cuid-1',
    mentorId: 'mentor-cuid-1',
    status: MentorSessionStatus.ACTIVE,
    turnCount: 1,
    startedAt: new Date(),
    endedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    mentor: {
      id: 'mentor-cuid-1',
      slug: 'python-socratic',
      name: 'Python Socratic',
      technology: 'Python',
      teachingStyle: 'Socratic',
    },
    messages: [],
  };

  describe('POST /api/mentor-sessions', () => {
    it('returns 403 when origin header is invalid', async () => {
      const request = new Request(baseUrl, {
        method: 'POST',
        headers: {
          origin: 'https://malicious-site.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mentorSlug: 'python-socratic' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it('returns 401 when user is not authenticated', async () => {
      const request = new Request(baseUrl, {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mentorSlug: 'python-socratic' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('returns 400 when request payload is invalid', async () => {
      vi.spyOn(requireAuthModule, 'requireAuthentication').mockResolvedValue({
        ok: true,
        identity: { externalUserId: 'ext-user-1', issuer: 'test' },
      });

      const request = new Request(baseUrl, {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mentorSlug: '' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 201 when session creation succeeds', async () => {
      vi.spyOn(requireAuthModule, 'requireAuthentication').mockResolvedValue({
        ok: true,
        identity: { externalUserId: 'ext-user-1', issuer: 'test' },
      });
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockActiveSession);

      const request = new Request(baseUrl, {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mentorSlug: 'python-socratic' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBe('session-cuid-1');
      expect(sessionService.createSession).toHaveBeenCalledWith('ext-user-1', 'python-socratic');
    });

    it('returns 404 when mentor profile is not found', async () => {
      vi.spyOn(requireAuthModule, 'requireAuthentication').mockResolvedValue({
        ok: true,
        identity: { externalUserId: 'ext-user-1', issuer: 'test' },
      });
      vi.spyOn(sessionService, 'createSession').mockRejectedValue(
        new MentorNotFoundError('unknown-slug'),
      );

      const request = new Request(baseUrl, {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mentorSlug: 'unknown-slug' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(404);
    });

    it('returns 409 Conflict when active session already exists', async () => {
      vi.spyOn(requireAuthModule, 'requireAuthentication').mockResolvedValue({
        ok: true,
        identity: { externalUserId: 'ext-user-1', issuer: 'test' },
      });
      vi.spyOn(sessionService, 'createSession').mockRejectedValue(
        new ActiveSessionConflictError('session-cuid-1'),
      );

      const request = new Request(baseUrl, {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mentorSlug: 'python-socratic' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/mentor-sessions', () => {
    it('returns 401 when not authenticated', async () => {
      const request = new Request(baseUrl, { method: 'GET' });
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('returns 200 with active session for authenticated user', async () => {
      vi.spyOn(requireAuthModule, 'requireAuthentication').mockResolvedValue({
        ok: true,
        identity: { externalUserId: 'ext-user-1', issuer: 'test' },
      });
      vi.spyOn(sessionService, 'getActiveSession').mockResolvedValue(mockActiveSession);

      const request = new Request(baseUrl, { method: 'GET' });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.activeSession.id).toBe('session-cuid-1');
    });
  });

  describe('PATCH /api/mentor-sessions/[sessionId]', () => {
    const patchUrl = 'http://localhost:3000/api/mentor-sessions/session-cuid-1';

    it('returns 403 when origin is invalid', async () => {
      const request = new Request(patchUrl, {
        method: 'PATCH',
        headers: {
          origin: 'https://evil.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ sessionId: 'session-cuid-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('returns 200 on successful transition', async () => {
      vi.spyOn(requireAuthModule, 'requireAuthentication').mockResolvedValue({
        ok: true,
        identity: { externalUserId: 'ext-user-1', issuer: 'test' },
      });
      vi.spyOn(sessionService, 'transitionSessionStatus').mockResolvedValue({
        ...mockActiveSession,
        status: MentorSessionStatus.COMPLETED,
        endedAt: new Date(),
      });

      const request = new Request(patchUrl, {
        method: 'PATCH',
        headers: {
          origin: 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ sessionId: 'session-cuid-1' }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('COMPLETED');
    });

    it('returns 404 when session does not exist or user is unauthorized', async () => {
      vi.spyOn(requireAuthModule, 'requireAuthentication').mockResolvedValue({
        ok: true,
        identity: { externalUserId: 'ext-user-1', issuer: 'test' },
      });
      vi.spyOn(sessionService, 'transitionSessionStatus').mockRejectedValue(
        new SessionNotFoundError('session-cuid-1'),
      );

      const request = new Request(patchUrl, {
        method: 'PATCH',
        headers: {
          origin: 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ sessionId: 'session-cuid-1' }),
      });
      expect(response.status).toBe(404);
    });

    it('returns 409 when session transition is invalid', async () => {
      vi.spyOn(requireAuthModule, 'requireAuthentication').mockResolvedValue({
        ok: true,
        identity: { externalUserId: 'ext-user-1', issuer: 'test' },
      });
      vi.spyOn(sessionService, 'transitionSessionStatus').mockRejectedValue(
        new InvalidSessionStateError('COMPLETED'),
      );

      const request = new Request(patchUrl, {
        method: 'PATCH',
        headers: {
          origin: 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ sessionId: 'session-cuid-1' }),
      });
      expect(response.status).toBe(409);
    });
  });
});

