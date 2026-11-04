import 'server-only';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { prisma } from '@/lib/db/prisma';

const baseURL = process.env.PROVIDER_BASE_URL;
const apiKey = process.env.PROVIDER_API_KEY;
const defaultModel = process.env.PROVIDER_MODEL ?? 'gpt-4o-mini';

if (!baseURL || !apiKey) {
  throw new Error('PROVIDER_BASE_URL and PROVIDER_API_KEY must be set in the environment');
}

const client = new OpenAI({
  baseURL,
  apiKey,
  timeout: 30_000,
  maxRetries: 1,
});

export type ChatMessage = ChatCompletionMessageParam;

export type ChatCompletionResult = {
  content: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  costEstimateCents: number;
};

// Pricing table in cents per 1k tokens. Keep this in one place and update
// when the provider's prices change or when we switch model.
const PRICING_CENTS_PER_1K: Record<string, { in: number; out: number }> = {
  'gpt-4o-mini': { in: 0.015, out: 0.06 },
  'gpt-4o': { in: 0.25, out: 1.0 },
};

function estimateCostCents(model: string, tokensIn: number, tokensOut: number): number {
  const price = PRICING_CENTS_PER_1K[model];
  if (!price) return 0;
  const cents = (tokensIn / 1000) * price.in + (tokensOut / 1000) * price.out;
  return Math.ceil(cents);
}

export type CallProviderInput = {
  messages: ChatMessage[];
  userId: string;
  sessionId: string;
  messageId?: string;
  model?: string;
};

export async function callProvider({
  messages,
  userId,
  sessionId,
  messageId,
  model = defaultModel,
}: CallProviderInput): Promise<ChatCompletionResult> {
  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
  });

  const choice = response.choices[0];
  const content = choice?.message?.content ?? '';
  const tokensIn = response.usage?.prompt_tokens ?? 0;
  const tokensOut = response.usage?.completion_tokens ?? 0;
  const costEstimateCents = estimateCostCents(model, tokensIn, tokensOut);

  // Fire-and-forget would lose data on crash; await it.
  await prisma.oscarUsage.create({
    data: {
      userId,
      sessionId,
      messageId,
      model,
      tokensIn,
      tokensOut,
      costEstimateCents,
    },
  });

  return { content, model, tokensIn, tokensOut, costEstimateCents };
}
