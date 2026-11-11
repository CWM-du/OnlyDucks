import { z } from 'zod';

export const analyticsEventTypeEnum = z.enum([
  'mentor_session_started',
  'mentor_session_completed',
  'mentor_session_failed',
  'recommendation_displayed',
  'outbound_click',
]);

export type AnalyticsEventType = z.infer<typeof analyticsEventTypeEnum>;

export const analyticsPropertiesSchema = z.record(z.string(), z.unknown());
export type AnalyticsProperties = z.infer<typeof analyticsPropertiesSchema>;

export const analyticsEventSchema = z.object({
  eventType: analyticsEventTypeEnum,
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  contentId: z.string().optional(),
  source: z.string().optional(),
  destination: z.string().url().optional(),
  properties: analyticsPropertiesSchema.optional(),
  occurredAt: z.string().datetime().optional(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;


// Browser-submitted analytics are deliberately limited to user-observable actions.
// Mentor lifecycle events are emitted only by trusted server-side service methods.
export const publicAnalyticsEventSchema = z.object({
  eventType: z.enum(['recommendation_displayed', 'outbound_click']),
  sessionId: z.string().optional(),
  contentId: z.string().optional(),
  source: z.string().max(100).optional(),
  destination: z.string().url().optional(),
  properties: analyticsPropertiesSchema.optional(),
}).strict();
