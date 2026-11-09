import { describe, expect, it } from 'vitest';
import { analyticsEventSchema } from './event-schema';

describe('analyticsEventSchema', () => {
  it('accepts an outbound click event with a valid destination and attribution fields', () => {
    const result = analyticsEventSchema.safeParse({
      eventType: 'outbound_click',
      destination: 'https://example.com/resource',
      sessionId: 'session-cuid-1',
      contentId: 'content-cuid-1',
      userId: 'user-cuid-1',
      source: 'recommendation_card',
      properties: {
        category: 'backend',
        position: 1,
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.eventType).toBe('outbound_click');
      expect(result.data.source).toBe('recommendation_card');
      expect(result.data.destination).toBe('https://example.com/resource');
    }
  });

  it('accepts all 5 domain event types', () => {
    const validEvents = [
      'mentor_session_started',
      'mentor_session_completed',
      'mentor_session_failed',
      'recommendation_displayed',
      'outbound_click',
    ];

    for (const eventType of validEvents) {
      const result = analyticsEventSchema.safeParse({ eventType });
      expect(result.success).toBe(true);
    }
  });

  it('rejects an unknown event type', () => {
    const result = analyticsEventSchema.safeParse({
      eventType: 'unknown_event',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid destination URL', () => {
    const result = analyticsEventSchema.safeParse({
      eventType: 'outbound_click',
      destination: 'not-a-valid-url',
    });

    expect(result.success).toBe(false);
  });

  it('accepts ISO datetime for occurredAt', () => {
    const result = analyticsEventSchema.safeParse({
      eventType: 'mentor_session_started',
      occurredAt: '2026-11-09T12:00:00.000Z',
    });

    expect(result.success).toBe(true);
  });
});
