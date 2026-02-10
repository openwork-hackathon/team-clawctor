-- AlterTable: Remove companyName from QuestionnaireSubmission
ALTER TABLE "QuestionnaireSubmission" DROP COLUMN "companyName";

-- AlterTable: Remove companyName index
DROP INDEX IF EXISTS "QuestionnaireSubmission_companyName_idx";

-- First, we need to add the questionAnswerId column to Task table
-- We'll add it as nullable first, then update existing records, then make it required
ALTER TABLE "Task" ADD COLUMN "questionAnswerId" TEXT;

-- Update existing Task records to link them to the first answer of their questionnaire
-- This is a data migration step - for each existing task, find its questionnaire's first answer
UPDATE "Task" t
SET "questionAnswerId" = (
  SELECT a.id
  FROM "QuestionnaireAnswer" a
  INNER JOIN "QuestionnaireSection" s ON a."sectionId" = s.id
  INNER JOIN "QuestionnaireSubmission" qs ON s."submissionId" = qs.id
  WHERE qs.id = t."questionnaireId"
  ORDER BY s."order" ASC, a."createdAt" ASC
  LIMIT 1
)
WHERE t."questionAnswerId" IS NULL;

-- Now make questionAnswerId required and add unique constraint
ALTER TABLE "Task" ALTER COLUMN "questionAnswerId" SET NOT NULL;

-- Create unique index on questionAnswerId
CREATE UNIQUE INDEX "Task_questionAnswerId_key" ON "Task"("questionAnswerId");

-- Create index on questionAnswerId (for query performance)
CREATE INDEX "Task_questionAnswerId_idx" ON "Task"("questionAnswerId");

-- Add foreign key constraint
ALTER TABLE "Task" ADD CONSTRAINT "Task_questionAnswerId_fkey" FOREIGN KEY ("questionAnswerId") REFERENCES "QuestionnaireAnswer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old questionnaireId index
DROP INDEX IF EXISTS "Task_questionnaireId_idx";

-- Drop old questionnaireId unique constraint
DROP INDEX IF EXISTS "Task_questionnaireId_key";

-- Finally, drop the old questionnaireId and companyName columns from Task
ALTER TABLE "Task" DROP COLUMN "questionnaireId";
ALTER TABLE "Task" DROP COLUMN "companyName";
