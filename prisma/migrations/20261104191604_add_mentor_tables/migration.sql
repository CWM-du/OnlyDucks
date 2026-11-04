/*
  Warnings:

  - Added the required column `promptKeyUsed` to the `MentorSession` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MentorMessageRole" AS ENUM ('USER', 'ASSISTANT');

-- AlterTable
ALTER TABLE "MentorSession" ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "promptKeyUsed" TEXT NOT NULL,
ADD COLUMN     "recommendationInvitation" TEXT,
ADD COLUMN     "recommendationReason" TEXT,
ADD COLUMN     "recommendationTopic" TEXT,
ADD COLUMN     "recommendationType" TEXT,
ADD COLUMN     "turnCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MentorPrompt" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "MentorMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OscarUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "messageId" TEXT,
    "model" TEXT NOT NULL,
    "tokensIn" INTEGER NOT NULL,
    "tokensOut" INTEGER NOT NULL,
    "costEstimateCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OscarUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MentorPrompt_key_key" ON "MentorPrompt"("key");

-- CreateIndex
CREATE INDEX "MentorMessage_sessionId_createdAt_idx" ON "MentorMessage"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "OscarUsage_userId_createdAt_idx" ON "OscarUsage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "OscarUsage_sessionId_idx" ON "OscarUsage"("sessionId");

-- CreateIndex
CREATE INDEX "MentorSession_status_lastActivityAt_idx" ON "MentorSession"("status", "lastActivityAt");

-- AddForeignKey
ALTER TABLE "MentorMessage" ADD CONSTRAINT "MentorMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MentorSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscarUsage" ADD CONSTRAINT "OscarUsage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MentorSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Partial unique index: only one ACTIVE session per user
CREATE UNIQUE INDEX "MentorSession_userId_active_unique"
  ON "MentorSession"("userId")
  WHERE "status" = 'ACTIVE';