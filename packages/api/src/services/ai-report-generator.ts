import { generateText } from "ai";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { prisma } from "@team-clawctor/db";
import { generateReportHTML } from "./report-html-template";

// Report status enum (matching Prisma)
export const ReportStatus = {
  NOT_STARTED: "NOT_STARTED",
  GENERATING: "GENERATING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

// Types for the detailed risk assessment
export interface RiskItem {
  level: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  description: string;
  cvss?: number;
  remediation?: string;
}

export interface CategoryHealth {
  name: string;
  score: number;
  color: string;
}

export interface RemediationPhase {
  phase: number;
  title: string;
  urgency: string;
  description: string;
  expectedBoost: string;
}

export interface DetailedAssessment {
  overallScore: number;
  executiveSummary: string;
  categoryHealth: CategoryHealth[];
  risks: RiskItem[];
  remediationRoadmap: RemediationPhase[];
}

export interface TaskData {
  id: string;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  assessmentSummary: string | null;
  aiAssessmentRaw: unknown;
  createdAt: Date;
}

// Generate the HTML report using AI
export async function generateHTMLReport(taskId: string): Promise<string> {
  // Fetch the task with questionnaire data
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }

  if (task.status !== "COMPLETED") {
    throw new Error(`Task assessment not completed: ${taskId}`);
  }

  // Update status to GENERATING
  await prisma.task.update({
    where: { id: taskId },
    data: { reportStatus: ReportStatus.GENERATING },
  });

  try {
    // Get the raw AI assessment data
    const assessmentData = task.aiAssessmentRaw as {
      risks?: RiskItem[];
      summary?: string;
    } | null;

    // Generate detailed report content using AI
    const detailedAssessment = await generateDetailedAssessment(task, assessmentData);

    // Generate the HTML report
    const htmlReport = generateReportHTML(task, detailedAssessment);

    // Save the report to the database
    await prisma.task.update({
      where: { id: taskId },
      data: {
        htmlReport,
        reportStatus: ReportStatus.COMPLETED,
        reportGeneratedAt: new Date(),
      },
    });

    console.log(`HTML report generated for task ${taskId}`);
    return htmlReport;
  } catch (error) {
    // Update task with error status
    await prisma.task.update({
      where: { id: taskId },
      data: {
        reportStatus: ReportStatus.FAILED,
        reportError: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

// Generate detailed assessment using AI
async function generateDetailedAssessment(
  task: TaskData,
  assessmentData: { risks?: RiskItem[]; summary?: string } | null
): Promise<DetailedAssessment> {
  const systemPrompt = `You are a security report generator. Based on the provided risk assessment data, generate a detailed security health check report in JSON format.

The report should include:
1. An overall security score (0-100)
2. A detailed executive summary (2-3 paragraphs)
3. Category health scores for: Network Security, Identity & Access, Data Encryption, API Integrity
4. Detailed risk items with CVSS scores and remediation suggestions
5. A phased remediation roadmap

Respond ONLY with valid JSON in this exact format:
{
  "overallScore": <number 0-100>,
  "executiveSummary": "<detailed 2-3 paragraph summary>",
  "categoryHealth": [
    {"name": "Network Security", "score": <0-100>, "color": "<green/yellow/orange/red based on score>"},
    {"name": "Identity & Access", "score": <0-100>, "color": "<color>"},
    {"name": "Data Encryption", "score": <0-100>, "color": "<color>"},
    {"name": "API Integrity", "score": <0-100>, "color": "<color>"}
  ],
  "risks": [
    {
      "level": "HIGH|MEDIUM|LOW",
      "category": "<category name>",
      "description": "<risk description>",
      "cvss": <number 0-10>,
      "remediation": "<remediation suggestion>"
    }
  ],
  "remediationRoadmap": [
    {
      "phase": 1,
      "title": "<phase title>",
      "urgency": "Urgent|Week 2|Month 1",
      "description": "<what to do>",
      "expectedBoost": "+X%"
    }
  ]
}`;

  const userPrompt = `Generate a detailed security health check report for:

High Risk Issues: ${task.highRiskCount}
Medium Risk Issues: ${task.mediumRiskCount}
Low Risk Issues: ${task.lowRiskCount}
Initial Summary: ${task.assessmentSummary || "No summary available"}

${assessmentData?.risks ? `Identified Risks:\n${JSON.stringify(assessmentData.risks, null, 2)}` : ""}

Please generate a comprehensive security report with detailed findings, scores, and remediation recommendations.`;

  const bedrock = createAmazonBedrock();
  const { text } = await generateText({
    model: bedrock("global.anthropic.claude-sonnet-4-5-20250929-v1:0"),
    system: systemPrompt,
    prompt: userPrompt,
  });

  // Parse the JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }

  return JSON.parse(jsonMatch[0]) as DetailedAssessment;
}

// Get report status for a task
export async function getReportStatus(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      reportStatus: true,
      htmlReport: true,
      reportGeneratedAt: true,
      reportError: true,
    },
  });

  return task;
}

// Record payment and trigger report generation
export async function recordPaymentAndGenerateReport(
  taskId: string,
  paymentTxHash: string,
  paymentAmount: number
): Promise<{ taskId: string; reportStatus: string }> {
  // Update task with payment info
  await prisma.task.update({
    where: { id: taskId },
    data: {
      paymentTxHash,
      paymentAmount,
      paidAt: new Date(),
      reportStatus: ReportStatus.GENERATING,
    },
  });

  // Start report generation asynchronously
  generateHTMLReport(taskId).catch((error) => {
    console.error(`Failed to generate report for task ${taskId}:`, error);
  });

  return {
    taskId,
    reportStatus: ReportStatus.GENERATING,
  };
}
