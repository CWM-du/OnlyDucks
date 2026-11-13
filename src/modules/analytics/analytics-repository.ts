import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export interface CreateAnalyticsEventData {
  eventType: string;
  userId?: string;
  sessionId?: string;
  contentId?: string;
  destination?: string;
  properties?: Record<string, unknown>;
  occurredAt?: Date;
}

export interface ListAnalyticsEventsFilter {
  eventType?: string;
  userId?: string;
  sessionId?: string;
  contentId?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

export interface AttributionSummaryItem {
  contentId: string | null;
  destination: string | null;
  source: string | null;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
}

export interface AttributionReport {
  totalClicks: number;
  totalImpressions: number;
  items: AttributionSummaryItem[];
}

export class AnalyticsRepository {
  constructor(private readonly db = prisma) {}

  async createEvent(data: CreateAnalyticsEventData) {
    const jsonProperties = data.properties
      ? (data.properties as Prisma.InputJsonValue)
      : Prisma.JsonNull;

    return this.db.analyticsEvent.create({
      data: {
        eventType: data.eventType,
        userId: data.userId ?? null,
        sessionId: data.sessionId ?? null,
        contentId: data.contentId ?? null,
        destination: data.destination ?? null,
        properties: jsonProperties,
        occurredAt: data.occurredAt ?? new Date(),
      },
    });
  }

  async listEvents(filter: ListAnalyticsEventsFilter = {}) {
    const where: Prisma.AnalyticsEventWhereInput = {};

    if (filter.eventType) {
      where.eventType = filter.eventType;
    }
    if (filter.userId) {
      where.userId = filter.userId;
    }
    if (filter.sessionId) {
      where.sessionId = filter.sessionId;
    }
    if (filter.contentId) {
      where.contentId = filter.contentId;
    }
    if (filter.from || filter.to) {
      where.occurredAt = {};
      if (filter.from) {
        where.occurredAt.gte = filter.from;
      }
      if (filter.to) {
        where.occurredAt.lte = filter.to;
      }
    }

    const limit = Math.min(Math.max(filter.limit ?? 50, 1), 100);
    const offset = Math.max(filter.offset ?? 0, 0);

    const [events, total] = await Promise.all([
      this.db.analyticsEvent.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.db.analyticsEvent.count({ where }),
    ]);

    return {
      events,
      total,
      limit,
      offset,
    };
  }

  async getAttributionReport(filter: { from?: Date; to?: Date } = {}): Promise<AttributionReport> {
    const where: Prisma.AnalyticsEventWhereInput = {
      eventType: {
        in: ['outbound_click', 'recommendation_displayed'],
      },
    };

    if (filter.from || filter.to) {
      where.occurredAt = {};
      if (filter.from) {
        where.occurredAt.gte = filter.from;
      }
      if (filter.to) {
        where.occurredAt.lte = filter.to;
      }
    }

    const events = await this.db.analyticsEvent.findMany({
      where,
      select: {
        eventType: true,
        contentId: true,
        destination: true,
        properties: true,
      },
    });

    let totalClicks = 0;
    let totalImpressions = 0;
    const itemMap = new Map<
      string,
      {
        contentId: string | null;
        destination: string | null;
        source: string | null;
        impressions: number;
        clicks: number;
      }
    >();

    for (const ev of events) {
      const propObj =
        ev.properties && typeof ev.properties === 'object' && !Array.isArray(ev.properties)
          ? (ev.properties as Record<string, unknown>)
          : {};
      const source = typeof propObj.source === 'string' ? propObj.source : null;
      const key = `${ev.contentId ?? 'none'}|${ev.destination ?? 'none'}|${source ?? 'direct'}`;

      if (!itemMap.has(key)) {
        itemMap.set(key, {
          contentId: ev.contentId,
          destination: ev.destination,
          source,
          impressions: 0,
          clicks: 0,
        });
      }

      const entry = itemMap.get(key)!;
      if (ev.eventType === 'outbound_click') {
        entry.clicks += 1;
        totalClicks += 1;
      } else if (ev.eventType === 'recommendation_displayed') {
        entry.impressions += 1;
        totalImpressions += 1;
      }
    }

    const items: AttributionSummaryItem[] = Array.from(itemMap.values()).map((entry) => ({
      ...entry,
      clickThroughRate:
        entry.impressions > 0
          ? Math.round((entry.clicks / entry.impressions) * 10000) / 100
          : entry.clicks > 0
            ? 100
            : 0,
    }));

    return {
      totalClicks,
      totalImpressions,
      items,
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
