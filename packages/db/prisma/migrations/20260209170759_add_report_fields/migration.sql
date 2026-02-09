-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('NOT_STARTED', 'GENERATING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "htmlReport" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentAmount" INTEGER,
ADD COLUMN     "paymentTxHash" TEXT,
ADD COLUMN     "reportError" TEXT,
ADD COLUMN     "reportGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "reportStatus" "ReportStatus" NOT NULL DEFAULT 'NOT_STARTED';

-- CreateIndex
CREATE INDEX "Task_reportStatus_idx" ON "Task"("reportStatus");
