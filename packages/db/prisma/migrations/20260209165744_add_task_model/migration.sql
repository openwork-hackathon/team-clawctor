-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "highRiskCount" INTEGER NOT NULL DEFAULT 0,
    "mediumRiskCount" INTEGER NOT NULL DEFAULT 0,
    "lowRiskCount" INTEGER NOT NULL DEFAULT 0,
    "aiModel" TEXT,
    "aiAssessmentRaw" JSONB,
    "assessmentSummary" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_questionnaireId_key" ON "Task"("questionnaireId");

-- CreateIndex
CREATE INDEX "Task_questionnaireId_idx" ON "Task"("questionnaireId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_createdAt_idx" ON "Task"("createdAt");
