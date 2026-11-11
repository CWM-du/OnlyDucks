import { NextResponse } from 'next/server';
import { identityProvider } from '@/modules/auth/provider';
import type { AuthenticatedIdentity, IdentityProvider } from '@/modules/auth/types';

export type AuthenticationResult =
  | { ok: true; identity: AuthenticatedIdentity }
  | { ok: false; response: NextResponse };

/** Authenticate on the server for every protected operation. */
export async function requireAuthentication(
  request: Request,
  provider: IdentityProvider = identityProvider,
): Promise<AuthenticationResult> {
  try {
    const identity = await provider.authenticate(request);
    if (
      identity &&
      typeof identity.externalUserId === 'string' &&
      identity.externalUserId.trim().length > 0 &&
      typeof identity.issuer === 'string' &&
      identity.issuer.trim().length > 0
    ) {
      return { ok: true, identity };
    }
  } catch {
    // Provider errors must never bypass authorization or disclose internals.
  }

  return {
    ok: false,
    response: NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    ),
  };
}
