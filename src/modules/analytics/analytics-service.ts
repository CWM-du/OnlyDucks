import {
  analyticsRepository,
  type AnalyticsRepository,
  type ListAnalyticsEventsFilter,
} from './analytics-repository';
import { type AnalyticsEventInput } from './event-schema';
import { sanitizeProperties } from './sanitizer';

export interface TrackEventResult {
  recorded: boolean;
  id?: string;
}

export class AnalyticsService {
  constructor(private readonly repo: AnalyticsRepository = analyticsRepository) {}

  async trackEvent(input: AnalyticsEventInput): Promise<TrackEventResult> {
    try {
      const sanitizedProps = sanitizeProperties(input.properties);
      if (input.source && typeof input.source === 'string' && !sanitizedProps.source) {
        sanitizedProps.source = input.source;
      }

      const occurredAtDate = input.occurredAt ? new Date(input.occurredAt) : undefined;
      const validOccurredAt =
        occurredAtDate && !Number.isNaN(occurredAtDate.getTime()) ? occurredAtDate : undefined;

      const created = await this.repo.createEvent({
        eventType: input.eventType,
        userId: input.userId,
        sessionId: input.sessionId,
        contentId: input.contentId,
        destination: input.destination,
        properties: sanitizedProps,
        occurredAt: validOccurredAt,
      });

      return { recorded: true, id: created.id };
    } catch {
      // Analytics must never disrupt core user flows.
      return { recorded: false };
    }
  }

  async trackSessionStarted(
    userId: string,
    sessionId: string,
    mentorSlug: string,
  ): Promise<TrackEventResult> {
    return this.trackEvent({
      eventType: 'mentor_session_started',
      userId,
      sessionId,
      properties: { mentorSlug },
    });
  }

  async trackSessionCompleted(
    userId: string,
    sessionId: string,
    turnCount: number,
  ): Promise<TrackEventResult> {
    return this.trackEvent({
      eventType: 'mentor_session_completed',
      userId,
      sessionId,
      properties: { turnCount },
    });
  }

  async trackSessionFailed(
    userId: string,
    sessionId: string,
    reason?: string,
  ): Promise<TrackEventResult> {
    return this.trackEvent({
      eventType: 'mentor_session_failed',
      userId,
      sessionId,
      properties: { reason: reason ?? 'unspecified' },
    });
  }

  async trackRecommendationDisplayed(
    userId: string,
    sessionId: string,
    contentId: string,
    metadata?: Record<string, unknown>,
  ): Promise<TrackEventResult> {
    return this.trackEvent({
      eventType: 'recommendation_displayed',
      userId,
      sessionId,
      contentId,
      properties: metadata,
    });
  }

  async trackOutboundClick(data: {
    userId?: string;
    sessionId?: string;
    contentId?: string;
    destination: string;
    source?: string;
    properties?: Record<string, unknown>;
  }): Promise<TrackEventResult> {
    return this.trackEvent({
      eventType: 'outbound_click',
      userId: data.userId,
      sessionId: data.sessionId,
      contentId: data.contentId,
      destination: data.destination,
      source: data.source,
      properties: data.properties,
    });
  }

  async listEvents(filter: ListAnalyticsEventsFilter = {}) {
    return this.repo.listEvents(filter);
  }

  async getAttributionReport(filter: { from?: Date; to?: Date } = {}) {
    return this.repo.getAttributionReport(filter);
  }
}

export const analyticsService = new AnalyticsService();
