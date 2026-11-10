import { z } from 'zod';

export const createSessionSchema = z.object({
  mentorSlug: z
    .string()
    .trim()
    .min(1, 'mentorSlug cannot be empty')
    .max(100, 'mentorSlug cannot exceed 100 characters'),
});

export const transitionSessionSchema = z.object({
  status: z.enum(['COMPLETED', 'FAILED', 'CANCELLED']),
  reason: z.string().trim().max(500).optional(),
});

export const advanceTurnSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'content cannot be empty')
    .max(2000, 'content cannot exceed 2000 characters'),
});

export type CreateSessionSchema = z.infer<typeof createSessionSchema>;
export type TransitionSessionSchema = z.infer<typeof transitionSessionSchema>;
export type AdvanceTurnSchema = z.infer<typeof advanceTurnSchema>;
