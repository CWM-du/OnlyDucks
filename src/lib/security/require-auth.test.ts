import { describe, expect, it } from 'vitest';
import { requireAuthentication } from './require-auth';
import type { IdentityProvider } from '@/modules/auth/types';

const request = new Request('http://localhost:3000/api/mentor-sessions', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer untrusted',
    'X-User-ID': 'forged-user',
    Cookie: 'session=untrusted',
  },
});

describe('server-side authentication boundary', () => {
  it('rejects forged headers and cookies when SSO is unconfigured', async () => {
    const result = await requireAuthentication(request);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
      expect(result.response.headers.get('Cache-Control')).toBe('no-store');
    }
  });

  it('rejects expired or invalid identity from the provider', async () => {
    const provider: IdentityProvider = { authenticate: async () => null };
    expect((await requireAuthentication(request, provider)).ok).toBe(false);
  });

  it('fails closed if the provider errors', async () => {
    const provider: IdentityProvider = { authenticate: async () => { throw new Error('private'); } };
    const result = await requireAuthentication(request, provider);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(await result.response.json()).toEqual({ error: 'Authentication required.' });
  });

  it('accepts only a verified, nonempty provider identity', async () => {
    const provider: IdentityProvider = {
      authenticate: async () => ({ externalUserId: 'external-123', issuer: 'trusted-issuer' }),
    };
    const result = await requireAuthentication(request, provider);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.identity.externalUserId).toBe('external-123');
  });

  it('rejects malformed identity claims', async () => {
    const provider: IdentityProvider = {
      authenticate: async () => ({ externalUserId: ' ', issuer: '' }),
    };
    expect((await requireAuthentication(request, provider)).ok).toBe(false);
  });
});
