import { PrismaClient } from '@prisma/client';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

const username = process.env.DEMO_USERNAME?.trim().toLowerCase();
const password = process.env.DEMO_PASSWORD;
if (!username || !/^[a-z0-9_-]{3,64}$/.test(username) || !password || password.length < 12 || !process.env.DATABASE_URL) {
  console.error('Set DATABASE_URL, DEMO_USERNAME (3-64 alphanumeric/underscore/hyphen) and DEMO_PASSWORD (>=12 chars).');
  process.exit(1);
}
const prisma = new PrismaClient();
try {
  const externalUserId = `local:${username}`;
  const existing = await prisma.user.findUnique({ where: { externalUserId } });
  if (existing) throw new Error('Account already exists; refusing to overwrite credentials.');
  const salt = randomBytes(16).toString('hex');
  const key = await promisify(scryptCallback)(password, salt, 64);
  await prisma.user.create({ data: { externalUserId, localCredential: { create: { passwordHash: `scrypt:${salt}:${key.toString('hex')}` } } } });
  console.log(`Demo user created: ${username}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Unable to create demo user');
  process.exitCode = 1;
} finally { await prisma.$disconnect(); }
