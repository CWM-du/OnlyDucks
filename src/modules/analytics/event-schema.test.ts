import { describe, expect, it } from 'vitest';
import { analyticsEventSchema } from './event-schema';

describe('analyticsEventSchema', () => {
  it('accepts an outbound click event with a valid destination', () => {
    const result = analyticsEventSchema.safeParse({
      eventType: 'outbound_click',
      destination: 'https://example.com/resource',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an unknown event type', () => {
    const result = analyticsEventSchema.safeParse({
      eventType: 'unknown_event',
    });

    expect(result.success).toBe(false);
  });
});
