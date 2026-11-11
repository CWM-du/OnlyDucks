import { describe, expect, it } from 'vitest';
import {
  advanceTurnSchema,
  createSessionSchema,
  transitionSessionSchema,
} from './mentor-session-schema';

describe('mentor-session-schema', () => {
  describe('createSessionSchema', () => {
    it('accepts valid mentorSlug', () => {
      const result = createSessionSchema.safeParse({ mentorSlug: 'python-socratic' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mentorSlug).toBe('python-socratic');
      }
    });

    it('rejects empty mentorSlug', () => {
      const result = createSessionSchema.safeParse({ mentorSlug: '   ' });
      expect(result.success).toBe(false);
    });

    it('rejects missing mentorSlug', () => {
      const result = createSessionSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('transitionSessionSchema', () => {
    it('accepts valid statuses', () => {
      for (const status of ['COMPLETED', 'FAILED', 'CANCELLED'] as const) {
        const result = transitionSessionSchema.safeParse({ status, reason: 'Session concluded' });
        expect(result.success).toBe(true);
      }
    });

    it('rejects ACTIVE as a transition target', () => {
      const result = transitionSessionSchema.safeParse({ status: 'ACTIVE' });
      expect(result.success).toBe(false);
    });

    it('rejects arbitrary invalid status', () => {
      const result = transitionSessionSchema.safeParse({ status: 'ARCHIVED' });
      expect(result.success).toBe(false);
    });
  });

  describe('advanceTurnSchema', () => {
    it('accepts valid message content', () => {
      const result = advanceTurnSchema.safeParse({ content: 'Hello mentor' });
      expect(result.success).toBe(true);
    });

    it('rejects empty content', () => {
      const result = advanceTurnSchema.safeParse({ content: '  ' });
      expect(result.success).toBe(false);
    });

    it('rejects excessively long content', () => {
      const result = advanceTurnSchema.safeParse({ content: 'a'.repeat(2001) });
      expect(result.success).toBe(false);
    });
  });
});

