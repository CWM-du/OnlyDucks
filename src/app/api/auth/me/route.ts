import { NextResponse } from 'next/server';
import { requireAuthentication } from '@/lib/security/require-auth';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  const auth = await requireAuthentication(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json({ authenticated: true, identity: auth.identity }, { headers: { 'Cache-Control': 'no-store' } });
}
