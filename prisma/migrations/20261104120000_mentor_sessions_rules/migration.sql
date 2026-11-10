-- AlterTable
ALTER TABLE "MentorSession" ADD COLUMN IF NOT EXISTS "turnCount" INTEGER NOT NULL DEFAULT 1;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "MentorMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "turnNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SessionRecommendation" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "contentItemId" TEXT NOT NULL,
    "recommendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "SessionRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MentorMessage_sessionId_createdAt_idx" ON "MentorMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SessionRecommendation_sessionId_idx" ON "SessionRecommendation"("sessionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SessionRecommendation_contentItemId_idx" ON "SessionRecommendation"("contentItemId");

-- CreateIndex: Partial unique index for concurrency-safe single active session per user
CREATE UNIQUE INDEX IF NOT EXISTS "idx_mentor_sessions_user_active" ON "MentorSession"("userId") WHERE "status" = 'ACTIVE';

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "MentorMessage" ADD CONSTRAINT "MentorMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MentorSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "SessionRecommendation" ADD CONSTRAINT "SessionRecommendation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MentorSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "SessionRecommendation" ADD CONSTRAINT "SessionRecommendation_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

