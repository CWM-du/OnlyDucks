import type { MentorSessionStatus, MessageRole } from '@prisma/client';

export type { MentorSessionStatus, MessageRole };

export interface MentorProfileSummaryDTO {
  id: string;
  slug: string;
  name: string;
  technology: string;
  teachingStyle: string;
}

export interface MentorMessageDTO {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  turnNumber: number;
  createdAt: Date | string;
}

export interface MentorSessionDTO {
  id: string;
  userId: string;
  mentorId: string;
  status: MentorSessionStatus;
  turnCount: number;
  startedAt: Date | string;
  endedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  mentor?: MentorProfileSummaryDTO;
  messages?: MentorMessageDTO[];
}

export interface CreateSessionInput {
  mentorSlug: string;
}

export interface TransitionSessionInput {
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED';
  reason?: string;
}

export interface AdvanceTurnInput {
  content: string;
}

