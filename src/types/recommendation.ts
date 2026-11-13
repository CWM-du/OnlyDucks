import type { ContentType } from '@prisma/client';

export interface ContentItemSummaryDTO {
  id: string;
  type: ContentType;
  title: string;
  summary?: string | null;
  destinationUrl: string;
  source: string;
}

export interface RecommendationDTO {
  id: string;
  sessionId: string;
  contentItemId: string;
  recommendedAt: Date | string;
  notes?: string | null;
  contentItem?: ContentItemSummaryDTO;
}

export interface CreateRecommendationInput {
  sessionId: string;
  contentItemId: string;
  notes?: string;
}

