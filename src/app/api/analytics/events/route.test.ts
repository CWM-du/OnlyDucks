import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAuthentication: vi.fn(),
  hasValidRequestOrigin: vi.fn(),
  trackEvent: vi.fn(),
  listEvents: vi.fn(),
  getAttributionReport: vi.fn(),
}));

vi.mock('@/lib/security/require-auth', () => ({ requireAuthentication: mocks.requireAuthentication }));
vi.mock('@/modules/auth/session', () => ({ hasValidRequestOrigin: mocks.hasValidRequestOrigin }));
vi.mock('@/modules/analytics/analytics-service', () => ({
  analyticsService: {
    trackEvent: mocks.trackEvent,
    listEvents: mocks.listEvents,
    getAttributionReport: mocks.getAttributionReport,
  },
}));

import { GET, POST } from './route';

const identity = { externalUserId: 'user-authenticated', issuer: 'test' };

describe('analytics events route authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuthentication.mockResolvedValue({ ok: true, identity });
    mocks.hasValidRequestOrigin.mockReturnValue(true);
    mocks.trackEvent.mockResolvedValue({ recorded: true, id: 'event-1' });
    mocks.listEvents.mockResolvedValue({ events: [], total: 0, limit: 50, offset: 0 });
  });

  it('attributes browser events to the authenticated identity, never a supplied userId', async () => {
    const response = await POST(new Request('https://onlyducks.test/api/analytics/events', {
      method: 'POST',
      headers: { origin: 'https://onlyducks.test', 'content-type': 'application/json' },
      body: JSON.stringify({ eventType: 'outbound_click', userId: 'victim', destination: 'https://example.com' }),
    }));
    expect(response.status).toBe(400);
    expect(mocks.trackEvent).not.toHaveBeenCalled();
  });

  it('rejects client-controlled event timestamps', async () => {
    const response = await POST(new Request('https://onlyducks.test/api/analytics/events', {
      method: 'POST',
      headers: { origin: 'https://onlyducks.test', 'content-type': 'application/json' },
      body: JSON.stringify({ eventType: 'outbound_click', destination: 'https://example.com', occurredAt: '2000-01-01T00:00:00.000Z' }),
    }));
    expect(response.status).toBe(400);
    expect(mocks.trackEvent).not.toHaveBeenCalled();
  });

  it('rejects internal mentor lifecycle events from browser clients', async () => {
    const response = await POST(new Request('https://onlyducks.test/api/analytics/events', {
      method: 'POST',
      headers: { origin: 'https://onlyducks.test', 'content-type': 'application/json' },
      body: JSON.stringify({ eventType: 'mentor_session_completed', sessionId: 'session-1' }),
    }));
    expect(response.status).toBe(400);
    expect(mocks.trackEvent).not.toHaveBeenCalled();
  });

  it('attributes accepted browser events to the authenticated identity', async () => {
    const response = await POST(new Request('https://onlyducks.test/api/analytics/events', {
      method: 'POST',
      headers: { origin: 'https://onlyducks.test', 'content-type': 'application/json' },
      body: JSON.stringify({ eventType: 'outbound_click', destination: 'https://example.com' }),
    }));
    expect(response.status).toBe(201);
    expect(mocks.trackEvent).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-authenticated' }));
  });

  it('rejects attempts to query another user’s events', async () => {
    const response = await GET(new Request('https://onlyducks.test/api/analytics/events?userId=victim'));
    expect(response.status).toBe(403);
    expect(mocks.listEvents).not.toHaveBeenCalled();
  });

  it('always scopes event listing to the authenticated identity', async () => {
    const response = await GET(new Request('https://onlyducks.test/api/analytics/events?eventType=outbound_click'));
    expect(response.status).toBe(200);
    expect(mocks.listEvents).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-authenticated' }));
  });

  it('denies global attribution reports until trusted admin authorization exists', async () => {
    const response = await GET(new Request('https://onlyducks.test/api/analytics/events?mode=attribution'));
    expect(response.status).toBe(403);
    expect(mocks.getAttributionReport).not.toHaveBeenCalled();
  });
});
