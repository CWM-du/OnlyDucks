/** Stable, provider-verified identity. Never populate from unverified request headers. */
export interface AuthenticatedIdentity {
  externalUserId: string;
  issuer: string;
}

export interface IdentityProvider {
  /** Returns null if missing, invalid, expired, or revoked. */
  authenticate(request: Request): Promise<AuthenticatedIdentity | null>;
}
