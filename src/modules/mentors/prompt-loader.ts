// src/modules/mentors/prompt-loader.ts
import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const PROMPT_DIR = path.join(process.cwd(), 'src', 'modules', 'mentors', 'prompts');

const cache = new Map<string, string>();

export async function loadPrompt(promptKey: string): Promise<string> {
  const cached = cache.get(promptKey);
  if (cached) return cached;

  const raw = await readFile(path.join(PROMPT_DIR, `${promptKey}.md`), 'utf-8');
  cache.set(promptKey, raw);
  return raw;
}
