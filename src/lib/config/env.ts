import { z } from 'zod';

const optionalUrl = z.string().url().optional().or(z.literal(''));

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  OSCAR_API_BASE_URL: optionalUrl,
  OSCAR_API_KEY: z.string().optional(),
  APP_BASE_URL: optionalUrl,
});

export const serverEnv = serverEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  OSCAR_API_BASE_URL: process.env.OSCAR_API_BASE_URL,
  OSCAR_API_KEY: process.env.OSCAR_API_KEY,
  APP_BASE_URL: process.env.APP_BASE_URL,
});
