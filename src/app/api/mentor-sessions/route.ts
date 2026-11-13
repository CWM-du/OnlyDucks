import { NextResponse } from 'next/server';
import { requireAuthentication } from '@/lib/security/require-auth';
import { hasValidRequestOrigin } from '@/modules/auth/session';
import { createSessionSchema } from '@/lib/validation/mentor-session-schema';
import { sessionService } from '@/modules/mentors/session-service';
import { DomainError } from '@/modules/mentors/errors';

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  }

  const auth = await requireAuthentication(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createSessionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body.', details: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const session = await sessionService.createSession(
      auth.identity.externalUserId,
      parsed.data.mentorSlug,
    );
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const auth = await requireAuthentication(request);
  if (!auth.ok) return auth.response;

  try {
    const activeSession = await sessionService.getActiveSession(auth.identity.externalUserId);
    return NextResponse.json({ activeSession }, { status: 200 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
