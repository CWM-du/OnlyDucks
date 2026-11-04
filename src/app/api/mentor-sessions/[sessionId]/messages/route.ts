import { NextResponse } from 'next/server';
import { z } from 'zod';
import { MentorMessageRole, MentorSessionStatus } from '@prisma/client';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUserId } from '@/lib/security/current-user';
import { callProvider } from '@/lib/providers/openai-compatible';
import { loadPrompt } from '@/modules/mentors/prompt-loader';
import { parseClosure, stripClosureBlock } from '@/modules/mentors/parse-closure';

const sendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
});

const MAX_TURNS = 4;
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const userId = await getCurrentUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { sessionId } = await params;

  const parsed = sendMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const session = await prisma.mentorSession.findUnique({
    where: { id: sessionId },
    include: {
      mentor: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  }
  if (session.status !== MentorSessionStatus.ACTIVE) {
    return NextResponse.json(
      { error: 'Session already closed.', status: session.status },
      { status: 409 },
    );
  }

  // Inactivity timeout: close the session instead of accepting more input.
  const idleMs = Date.now() - session.lastActivityAt.getTime();
  if (idleMs > INACTIVITY_TIMEOUT_MS) {
    await prisma.mentorSession.update({
      where: { id: sessionId },
      data: {
        status: MentorSessionStatus.CANCELLED,
        endedAt: new Date(),
      },
    });
    return NextResponse.json({ error: 'Session expired due to inactivity.' }, { status: 410 });
  }

  const nextTurn = session.turnCount + 1;
  if (nextTurn > MAX_TURNS) {
    return NextResponse.json({ error: 'Session turn limit reached.' }, { status: 409 });
  }

  // Persist the user message first so we never lose it on a provider failure.
  const userMessage = await prisma.mentorMessage.create({
    data: {
      sessionId,
      role: MentorMessageRole.USER,
      content: parsed.data.content,
      turnNumber: nextTurn,
    },
  });

  // Build the message list for the provider: system prompt + turn marker +
  // full history + the new user message.
  const systemPrompt = await loadPrompt(session.promptKeyUsed);
  const history: ChatCompletionMessageParam[] = session.messages.map((m) => ({
    role: m.role === MentorMessageRole.USER ? 'user' : 'assistant',
    content: m.content,
  }));

  const messagesForProvider: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    {
      role: 'user',
      content: `[TURNO: ${nextTurn} de ${MAX_TURNS}] ${parsed.data.content}`,
    },
  ];

  let providerResult;
  try {
    providerResult = await callProvider({
      messages: messagesForProvider,
      userId,
      sessionId,
      messageId: userMessage.id,
    });
  } catch (error) {
    // Roll back the turn so the user can retry.
    await prisma.mentorMessage.delete({ where: { id: userMessage.id } });
    console.error('[mentor-sessions] provider call failed', error);
    return NextResponse.json(
      { error: 'Mentor is unavailable. Please try again.' },
      { status: 502 },
    );
  }

  const rawContent = providerResult.content;
  const isFinalTurn = nextTurn >= MAX_TURNS;
  const closure = isFinalTurn ? parseClosure(rawContent) : null;
  const displayContent = isFinalTurn ? stripClosureBlock(rawContent) : rawContent;

  // Persist assistant message + bump counters + close session if final.
  const [assistantMessage, updatedSession] = await prisma.$transaction([
    prisma.mentorMessage.create({
      data: {
        sessionId,
        role: MentorMessageRole.ASSISTANT,
        content: rawContent,
        turnNumber: nextTurn,
        tokensIn: providerResult.tokensIn,
        tokensOut: providerResult.tokensOut,
      },
    }),
    prisma.mentorSession.update({
      where: { id: sessionId },
      data: {
        turnCount: nextTurn,
        lastActivityAt: new Date(),
        ...(isFinalTurn && {
          status: MentorSessionStatus.COMPLETED,
          endedAt: new Date(),
          recommendationType: closure?.tipo ?? null,
          recommendationTopic: closure?.tema ?? null,
          recommendationReason: closure?.razon ?? null,
          recommendationInvitation: closure?.invitacion ?? null,
        }),
      },
      include: { mentor: true },
    }),
  ]);

  return NextResponse.json({
    assistantMessage: {
      ...assistantMessage,
      displayContent,
    },
    session: updatedSession,
    closure: isFinalTurn ? closure : null,
  });
}
