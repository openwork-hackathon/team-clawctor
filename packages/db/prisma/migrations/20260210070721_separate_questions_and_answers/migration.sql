-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'TEXTAREA', 'MULTIPLE_CHOICE', 'MULTI_SELECT', 'YES_NO', 'FILE_UPLOAD', 'DATE', 'NUMBER');

-- AlterTable
ALTER TABLE "QuestionnaireAnswer" ADD COLUMN     "questionId" TEXT,
ALTER COLUMN "questionCode" DROP NOT NULL,
ALTER COLUMN "questionText" DROP NOT NULL,
ALTER COLUMN "order" DROP NOT NULL,
ALTER COLUMN "order" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "questionCode" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL DEFAULT 'TEXT',
    "description" TEXT,
    "placeholder" TEXT,
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "validationRules" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Question_questionCode_key" ON "Question"("questionCode");

-- CreateIndex
CREATE INDEX "Question_sectionKey_idx" ON "Question"("sectionKey");

-- CreateIndex
CREATE INDEX "Question_questionCode_idx" ON "Question"("questionCode");

-- CreateIndex
CREATE INDEX "Question_isActive_idx" ON "Question"("isActive");

-- CreateIndex
CREATE INDEX "QuestionnaireAnswer_questionId_idx" ON "QuestionnaireAnswer"("questionId");

-- AddForeignKey
ALTER TABLE "QuestionnaireAnswer" ADD CONSTRAINT "QuestionnaireAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
