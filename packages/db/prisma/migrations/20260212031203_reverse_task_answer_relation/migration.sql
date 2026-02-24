-- AlterTable: Add taskId to QuestionnaireAnswer first
ALTER TABLE "QuestionnaireAnswer" ADD COLUMN "taskId" TEXT;

-- Migrate existing data: copy the relationship from Task.questionAnswerId to QuestionnaireAnswer.taskId
UPDATE "QuestionnaireAnswer" qa
SET "taskId" = t."id"
FROM "Task" t
WHERE t."questionAnswerId" = qa."id";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_questionAnswerId_fkey";

-- DropIndex
DROP INDEX "Task_questionAnswerId_idx";

-- AlterTable: Remove questionAnswerId from Task
ALTER TABLE "Task" DROP COLUMN "questionAnswerId";

-- CreateIndex
CREATE INDEX "QuestionnaireAnswer_taskId_idx" ON "QuestionnaireAnswer"("taskId");

-- AddForeignKey
ALTER TABLE "QuestionnaireAnswer" ADD CONSTRAINT "QuestionnaireAnswer_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
