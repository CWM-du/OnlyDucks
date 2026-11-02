import type { AuthenticatedIdentity, IdentityProvider } from './types';

/**
 * Fail-closed adapter until the notodoescodigo.com SSO contract is confirmed.
 * Do not accept X-User-ID, bearer payloads, unsigned JWTs, or local cookies
 * as proof of identity. Replace this adapter only with a verified integration.
 */
class UnconfiguredIdentityProvider implements IdentityProvider {
  async authenticate(): Promise<AuthenticatedIdentity | null> {
    return null;
  }
}

export const identityProvider: IdentityProvider = new UnconfiguredIdentityProvider();
