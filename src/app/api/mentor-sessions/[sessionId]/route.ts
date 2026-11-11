import { NextResponse } from 'next/server';
import { requireAuthentication } from '@/lib/security/require-auth';
import { hasValidRequestOrigin } from '@/modules/auth/session';
import { transitionSessionSchema } from '@/lib/validation/mentor-session-schema';
import { sessionService } from '@/modules/mentors/session-service';
import { DomainError } from '@/modules/mentors/errors';

export async function PATCH(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  if (!hasValidRequestOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  }

  const auth = await requireAuthentication(request);
  if (!auth.ok) return auth.response;

  const { sessionId } = await context.params;
  if (!sessionId || sessionId.trim().length === 0) {
    return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = transitionSessionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body.', details: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const updatedSession = await sessionService.transitionSessionStatus(
      auth.identity.externalUserId,
      sessionId,
      parsed.data.status,
    );
    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
