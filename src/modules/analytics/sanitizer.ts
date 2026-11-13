export const SENSITIVE_KEY_PATTERNS = [
  /prompt/i,
  /message/i,
  /query/i,
  /password/i,
  /passwd/i,
  /token/i,
  /secret/i,
  /credential/i,
  /authorization/i,
  /auth/i,
  /bearer/i,
  /cookie/i,
  /session_id_token/i,
  /api[_-]?key/i,
  /email/i,
  /phone/i,
  /ssn/i,
  /credit[_-]?card/i,
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BEARER_REGEX = /^bearer\s+[a-zA-Z0-9._-]+$/i;
const JWT_REGEX = /^eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/;

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

export function sanitizeValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (EMAIL_REGEX.test(trimmed)) {
      return '[REDACTED_EMAIL]';
    }
    if (BEARER_REGEX.test(trimmed) || JWT_REGEX.test(trimmed)) {
      return '[REDACTED_TOKEN]';
    }
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, seen));
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[CIRCULAR]';
    }
    seen.add(value);

    const record = value as Record<string, unknown>;
    const sanitizedRecord: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(record)) {
      if (isSensitiveKey(key)) {
        continue;
      }
      sanitizedRecord[key] = sanitizeValue(val, seen);
    }

    return sanitizedRecord;
  }

  return undefined;
}

export function sanitizeProperties(
  properties?: Record<string, unknown> | null,
): Record<string, unknown> {
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) {
    return {};
  }

  const sanitized = sanitizeValue(properties);
  if (sanitized && typeof sanitized === 'object' && !Array.isArray(sanitized)) {
    return sanitized as Record<string, unknown>;
  }

  return {};
}

export interface SanitizedEventPayload {
  eventType: string;
  userId?: string;
  sessionId?: string;
  contentId?: string;
  destination?: string;
  properties: Record<string, unknown>;
  occurredAt?: Date;
}
