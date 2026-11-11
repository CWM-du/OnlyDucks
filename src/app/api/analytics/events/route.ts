import { NextResponse } from 'next/server';
import { requireAuthentication } from '@/lib/security/require-auth';
import { hasValidRequestOrigin } from '@/modules/auth/session';
import { publicAnalyticsEventSchema } from '@/modules/analytics/event-schema';
import { analyticsService } from '@/modules/analytics/analytics-service';

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  }

  const auth = await requireAuthentication(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = publicAnalyticsEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body.', details: parsed.error.issues },
      { status: 400 },
    );
  }

  // The authenticated identity is authoritative. Client payloads cannot attribute
  // events to another account; internal mentor lifecycle events use server services.
  const result = await analyticsService.trackEvent({
    ...parsed.data,
    userId: auth.identity.externalUserId,
  });

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

    // There is no verified admin/analytics role in the current identity contract.
    // Fail closed until role/permission claims are part of the trusted SSO contract.
    if (mode === 'attribution' || mode === 'summary') {
      return NextResponse.json(
        { error: 'Analytics reports require an authorized administrator.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const requestedUserId = searchParams.get('userId');
    if (requestedUserId && requestedUserId !== auth.identity.externalUserId) {
      return NextResponse.json(
        { error: 'You cannot access another user’s analytics.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const eventType = searchParams.get('eventType') ?? undefined;
    const sessionId = searchParams.get('sessionId') ?? undefined;
    const contentId = searchParams.get('contentId') ?? undefined;
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? Number.parseInt(offsetParam, 10) : undefined;
    const from = fromParam ? new Date(fromParam) : undefined;
    const to = toParam ? new Date(toParam) : undefined;

    if (
      (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 100)) ||
      (offset !== undefined && (!Number.isInteger(offset) || offset < 0)) ||
      (from && Number.isNaN(from.getTime())) ||
      (to && Number.isNaN(to.getTime()))
    ) {
      return NextResponse.json({ error: 'Invalid analytics query.' }, { status: 400 });
    }

    const data = await analyticsService.listEvents({
      eventType,
      sessionId,
      contentId,
      userId: auth.identity.externalUserId,
      limit,
      offset,
      from,
      to,
    });

    return NextResponse.json(data, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
