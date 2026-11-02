import { NextResponse } from 'next/server';
import { z } from 'zod';

const createSessionSchema = z.object({
  mentorSlug: z.string().min(1),
});

/**
 * Placeholder only.
 * Before pilot use, implement shared authentication, database-backed session
 * creation, authorization, concurrency-safe enforcement, and audit logging.
 */
export async function POST(request: Request) {
  const parsed = createSessionSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  return NextResponse.json(
    {
      error: 'Mentor session creation is not implemented.',
      requestedMentor: parsed.data.mentorSlug,
    },
    { status: 501 },
  );
}
