import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { analyticsService } from '@/modules/analytics/analytics-service';
import * as requireAuthModule from '@/lib/security/require-auth';

describe('Analytics Events API route', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const baseUrl = 'http://localhost:3000/api/analytics/events';

  describe('POST /api/analytics/events', () => {
    it('returns 403 when origin header is invalid', async () => {
      const request = new Request(baseUrl, {
        method: 'POST',
        headers: {
          origin: 'http://malicious-site.com',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventType: 'outbound_click' }),
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
        body: JSON.stringify({
          eventType: 'outbound_click',
          destination: 'https://example.com',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('returns 400 when body does not match schema', async () => {
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
        body: JSON.stringify({
          eventType: 'unknown_event_type',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe('Invalid request body.');
    });

    it('returns 201 when event is tracked successfully and assigns user id', async () => {
      vi.spyOn(requireAuthModule, 'requireAuthentication').mockResolvedValue({
        ok: true,
        identity: { externalUserId: 'ext-user-1', issuer: 'test' },
      });

      const trackSpy = vi.spyOn(analyticsService, 'trackEvent').mockResolvedValue({
        recorded: true,
        id: 'event-cuid-100',
      });

      const request = new Request(baseUrl, {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'outbound_click',
          destination: 'https://example.com/docs',
          sessionId: 'session-cuid-1',
          contentId: 'content-cuid-1',
          source: 'feed_card',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json).toEqual({ recorded: true, id: 'event-cuid-100' });
      expect(trackSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'outbound_click',
          destination: 'https://example.com/docs',
          sessionId: 'session-cuid-1',
          contentId: 'content-cuid-1',
          source: 'feed_card',
          userId: 'ext-user-1',
        }),
      );
    });

    it('returns 200 when event recording was suppressed or degraded', async () => {
      vi.spyOn(requireAuthModule, 'requireAuthentication').mockResolvedValue({
        ok: true,
        identity: { externalUserId: 'ext-user-1', issuer: 'test' },
      });

      vi.spyOn(analyticsService, 'trackEvent').mockResolvedValue({
        recorded: false,
      });

      const request = new Request(baseUrl, {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'mentor_session_started',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({ recorded: false });
    });
  });

  describe('GET /api/analytics/events', () => {
    it('returns 401 when request is not authenticated', async () => {
      const request = new Request(baseUrl, { method: 'GET' });
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('returns 200 with list of events and pagination data', async () => {
      vi.spyOn(requireAuthModule, 'requireAuthentication').mockResolvedValue({
        ok: true,
        identity: { externalUserId: 'ext-user-1', issuer: 'test' },
      });

      const mockList = {
        events: [
          {
            id: 'event-1',
            eventType: 'outbound_click',
            userId: 'user-1',
            sessionId: 'session-1',
            contentId: 'content-1',
            destination: 'https://example.com',
            properties: { source: 'feed' },
            occurredAt: new Date(),
          },
        ],
        total: 1,
        limit: 10,
        offset: 0,
      };

      vi.spyOn(analyticsService, 'listEvents').mockResolvedValue(mockList);

      const request = new Request(`${baseUrl}?eventType=outbound_click&limit=10&offset=0`, {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.total).toBe(1);
      expect(json.limit).toBe(10);
      expect(json.events.length).toBe(1);
    });

    it('returns 200 with attribution report when mode is attribution', async () => {
      vi.spyOn(requireAuthModule, 'requireAuthentication').mockResolvedValue({
        ok: true,
        identity: { externalUserId: 'ext-user-1', issuer: 'test' },
      });

      const mockReport = {
        totalClicks: 5,
        totalImpressions: 20,
        items: [
          {
            contentId: 'content-1',
            destination: 'https://example.com',
            source: 'feed_card',
            impressions: 20,
            clicks: 5,
            clickThroughRate: 25,
          },
        ],
      };

      vi.spyOn(analyticsService, 'getAttributionReport').mockResolvedValue(mockReport);

      const request = new Request(`${baseUrl}?mode=attribution`, {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.attribution).toEqual(mockReport);
    });
  });
});
