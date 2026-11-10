import { describe, expect, it } from 'vitest';
import { isSensitiveKey, sanitizeProperties, sanitizeValue } from './sanitizer';

describe('Analytics Sanitizer', () => {
  describe('isSensitiveKey', () => {
    it('identifies sensitive keywords regardless of case', () => {
      expect(isSensitiveKey('prompt')).toBe(true);
      expect(isSensitiveKey('user_prompt')).toBe(true);
      expect(isSensitiveKey('PromptText')).toBe(true);
      expect(isSensitiveKey('raw_message')).toBe(true);
      expect(isSensitiveKey('passwordHash')).toBe(true);
      expect(isSensitiveKey('accessToken')).toBe(true);
      expect(isSensitiveKey('apiKey')).toBe(true);
      expect(isSensitiveKey('user_email')).toBe(true);
      expect(isSensitiveKey('cookieSession')).toBe(true);
      expect(isSensitiveKey('authHeader')).toBe(true);
    });

    it('identifies safe business keys', () => {
      expect(isSensitiveKey('mentorSlug')).toBe(false);
      expect(isSensitiveKey('category')).toBe(false);
      expect(isSensitiveKey('turnCount')).toBe(false);
      expect(isSensitiveKey('source')).toBe(false);
      expect(isSensitiveKey('durationMs')).toBe(false);
    });
  });

  describe('sanitizeProperties', () => {
    it('returns empty object when input is null, undefined, or empty', () => {
      expect(sanitizeProperties(null)).toEqual({});
      expect(sanitizeProperties(undefined)).toEqual({});
      expect(sanitizeProperties({})).toEqual({});
    });

    it('removes prohibited sensitive keys and keeps safe properties', () => {
      const input = {
        mentorSlug: 'python-socratic',
        prompt: 'Act as a senior python mentor...',
        message: 'Hello duck!',
        turnCount: 2,
        userToken: 'secret_12345',
        source: 'mentor_chat',
      };

      const result = sanitizeProperties(input);

      expect(result).toEqual({
        mentorSlug: 'python-socratic',
        turnCount: 2,
        source: 'mentor_chat',
      });
      expect(result).not.toHaveProperty('prompt');
      expect(result).not.toHaveProperty('message');
      expect(result).not.toHaveProperty('userToken');
    });

    it('recursively scrubs nested objects and arrays', () => {
      const input = {
        metadata: {
          category: 'backend',
          authHeader: 'Bearer 123456',
          nested: {
            safeValue: 42,
            query: 'how to mock prisma in tests',
          },
        },
        tags: ['tutorial', 'python'],
        items: [
          { safeId: '1', prompt: 'test' },
          { safeId: '2', credential: 'pwd' },
        ],
      };

      const result = sanitizeProperties(input);

      expect(result).toEqual({
        metadata: {
          category: 'backend',
          nested: {
            safeValue: 42,
          },
        },
        tags: ['tutorial', 'python'],
        items: [{ safeId: '1' }, { safeId: '2' }],
      });
    });

    it('redacts email and bearer tokens found inside string values of allowed keys', () => {
      const input = {
        referrerNote: 'user@example.com',
        customHeader: 'Bearer abc.def.ghi',
        normalText: 'Clean descriptive text',
      };

      const result = sanitizeProperties(input);

      expect(result.referrerNote).toBe('[REDACTED_EMAIL]');
      expect(result.customHeader).toBe('[REDACTED_TOKEN]');
      expect(result.normalText).toBe('Clean descriptive text');
    });

    it('handles circular references gracefully without throwing', () => {
      const circularObj: Record<string, unknown> = {
        name: 'test-event',
      };
      circularObj.self = circularObj;

      const result = sanitizeProperties(circularObj);

      expect(result.name).toBe('test-event');
      expect(result.self).toBe('[CIRCULAR]');
    });
  });

  describe('sanitizeValue', () => {
    it('preserves primitive numbers and booleans', () => {
      expect(sanitizeValue(100)).toBe(100);
      expect(sanitizeValue(true)).toBe(true);
      expect(sanitizeValue(false)).toBe(false);
      expect(sanitizeValue(null)).toBeNull();
      expect(sanitizeValue(undefined)).toBeUndefined();
    });
  });
});
