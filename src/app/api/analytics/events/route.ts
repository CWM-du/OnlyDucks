import { NextResponse } from 'next/server';
import { requireAuthentication } from '@/lib/security/require-auth';
import { hasValidRequestOrigin } from '@/modules/auth/session';
import { analyticsEventSchema } from '@/modules/analytics/event-schema';
import { analyticsService } from '@/modules/analytics/analytics-service';

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  }

  const auth = await requireAuthentication(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = analyticsEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body.', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const eventPayload = {
    ...parsed.data,
    userId: parsed.data.userId ?? auth.identity.externalUserId,
  };

  const result = await analyticsService.trackEvent(eventPayload);

  if (result.recorded) {
    return NextResponse.json({ recorded: true, id: result.id }, { status: 201 });
  }

  return NextResponse.json({ recorded: false }, { status: 200 });
}

export async function GET(request: Request) {
  const auth = await requireAuthentication(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    if (mode === 'attribution' || mode === 'summary') {
      const fromParam = searchParams.get('from');
      const toParam = searchParams.get('to');
      const from = fromParam ? new Date(fromParam) : undefined;
      const to = toParam ? new Date(toParam) : undefined;

      const report = await analyticsService.getAttributionReport({ from, to });
      return NextResponse.json({ attribution: report }, { status: 200 });
    }

    const eventType = searchParams.get('eventType') ?? undefined;
    const sessionId = searchParams.get('sessionId') ?? undefined;
    const contentId = searchParams.get('contentId') ?? undefined;
    const userId = searchParams.get('userId') ?? undefined;
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? Number.parseInt(offsetParam, 10) : undefined;
    const from = fromParam ? new Date(fromParam) : undefined;
    const to = toParam ? new Date(toParam) : undefined;

    const data = await analyticsService.listEvents({
      eventType,
      sessionId,
      contentId,
      userId,
      limit,
      offset,
      from,
      to,
    });

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
