import { z } from 'zod';

export const analyticsEventSchema = z.object({
  eventType: z.enum([
    'mentor_session_started',
    'mentor_session_completed',
    'mentor_session_failed',
    'recommendation_displayed',
    'outbound_click',
  ]),
  sessionId: z.string().optional(),
  contentId: z.string().optional(),
  destination: z.string().url().optional(),
  occurredAt: z.string().datetime().optional(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
