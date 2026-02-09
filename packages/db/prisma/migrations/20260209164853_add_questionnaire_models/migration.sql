/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "QuestionnaireStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'EVALUATED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AnswerStatus" AS ENUM ('ANSWERED', 'MISSING_INFO', 'SKIPPED', 'FLAGGED');

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "verification_tokens";

-- CreateTable
CREATE TABLE "QuestionnaireSubmission" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "organizationId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'web_portal',
    "assetHash" TEXT,
    "status" "QuestionnaireStatus" NOT NULL DEFAULT 'SUBMITTED',
    "sessionVerified" BOOLEAN NOT NULL DEFAULT false,
    "submitterEmail" TEXT,
    "submitterName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionnaireSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireSection" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionnaireSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireAnswer" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "questionCode" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "answerText" TEXT,
    "answerJson" JSONB,
    "status" "AnswerStatus" NOT NULL DEFAULT 'ANSWERED',
    "flaggedForReview" BOOLEAN NOT NULL DEFAULT false,
    "flagPriority" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionnaireAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireAttachment" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "fileUrl" TEXT NOT NULL,
    "description" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionnaireAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionnaireSubmission_companyName_idx" ON "QuestionnaireSubmission"("companyName");

-- CreateIndex
CREATE INDEX "QuestionnaireSubmission_status_idx" ON "QuestionnaireSubmission"("status");

-- CreateIndex
CREATE INDEX "QuestionnaireSubmission_createdAt_idx" ON "QuestionnaireSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "QuestionnaireSection_submissionId_idx" ON "QuestionnaireSection"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireSection_submissionId_sectionKey_key" ON "QuestionnaireSection"("submissionId", "sectionKey");

-- CreateIndex
CREATE INDEX "QuestionnaireAnswer_sectionId_idx" ON "QuestionnaireAnswer"("sectionId");

-- CreateIndex
CREATE INDEX "QuestionnaireAnswer_status_idx" ON "QuestionnaireAnswer"("status");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireAnswer_sectionId_questionCode_key" ON "QuestionnaireAnswer"("sectionId", "questionCode");

-- CreateIndex
CREATE INDEX "QuestionnaireAttachment_answerId_idx" ON "QuestionnaireAttachment"("answerId");

-- AddForeignKey
ALTER TABLE "QuestionnaireSection" ADD CONSTRAINT "QuestionnaireSection_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "QuestionnaireSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireAnswer" ADD CONSTRAINT "QuestionnaireAnswer_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "QuestionnaireSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireAttachment" ADD CONSTRAINT "QuestionnaireAttachment_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "QuestionnaireAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
