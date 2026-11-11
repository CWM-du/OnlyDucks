import { describe, expect, it } from 'vitest';
import { generateSessionToken, hashPassword, sessionTokenHash, verifyPassword } from './crypto';
import { hasValidRequestOrigin, readSessionToken, SESSION_COOKIE } from './session';

describe('local authentication primitives', () => {
  it('hashes passwords with random salts and validates them', async () => {
    const a = await hashPassword('correct horse battery staple');
    const b = await hashPassword('correct horse battery staple');
    expect(a).not.toBe(b);
    expect(await verifyPassword('correct horse battery staple', a)).toBe(true);
    expect(await verifyPassword('incorrect', a)).toBe(false);
    expect(await verifyPassword('incorrect', 'malformed')).toBe(false);
  });
  it('generates opaque unique tokens and deterministic hashes', () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(a).not.toBe(b);
    expect(sessionTokenHash(a)).toBe(sessionTokenHash(a));
    expect(sessionTokenHash(a)).not.toBe(sessionTokenHash(b));
  });
  it('rejects cross-origin state changes', () => {
    expect(hasValidRequestOrigin(new Request('http://localhost:3000/api/auth/login', { headers: { origin: 'https://attacker.example' } }))).toBe(false);
    expect(hasValidRequestOrigin(new Request('http://localhost:3000/api/auth/login', { headers: { origin: 'http://localhost:3000' } }))).toBe(true);
  });
  it('rejects malformed cookies', () => {
    expect(readSessionToken(new Request('http://localhost', { headers: { cookie: `${SESSION_COOKIE}=fake` } }))).toBeNull();
    const token = generateSessionToken();
    expect(readSessionToken(new Request('http://localhost', { headers: { cookie: `${SESSION_COOKIE}=${token}` } }))).toBe(token);
  });
});
