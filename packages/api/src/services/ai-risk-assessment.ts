import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { prisma, TaskStatus } from "@team-clawctor/db";

// Types for questionnaire data
interface QuestionnaireAnswer {
  questionCode: string;
  questionText: string;
  answerText: string | null;
  answerJson: unknown;
}

interface QuestionnaireSection {
  sectionKey: string;
  title: string;
  answers: QuestionnaireAnswer[];
}

interface QuestionnaireData {
  id: string;
  sections: QuestionnaireSection[];
}

// AI Risk Assessment Result
interface RiskAssessmentResult {
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  summary: string;
  rawResponse: unknown;
}

// Format questionnaire data for AI prompt
function formatQuestionnaireForAI(data: QuestionnaireData): string {
  let formatted = '';

  for (const section of data.sections) {
    formatted += `## ${section.title}\n\n`;

    for (const answer of section.answers) {
      const answerValue = answer.answerText ||
        (answer.answerJson ? JSON.stringify(answer.answerJson) : "No answer provided");
      formatted += `**${answer.questionCode}**: ${answer.questionText}\n`;
      formatted += `Answer: ${answerValue}\n\n`;
    }
  }

  return formatted;
}

// Perform AI risk assessment using Google Gemini
export async function assessQuestionnaireRisk(
  questionnaireData: QuestionnaireData
): Promise<RiskAssessmentResult> {
  const formattedData = formatQuestionnaireForAI(questionnaireData);
  
  const systemPrompt = `You are a security risk assessment expert. Analyze the following security questionnaire responses and identify potential risks.

For each identified risk, categorize it as:
- HIGH RISK: Critical security vulnerabilities, missing essential controls, or practices that could lead to immediate security breaches
- MEDIUM RISK: Significant gaps in security practices that should be addressed but don't pose immediate threats
- LOW RISK: Minor improvements needed or best practices not fully implemented

Respond in the following JSON format only:
{
  "highRiskCount": <number>,
  "mediumRiskCount": <number>,
  "lowRiskCount": <number>,
  "summary": "<brief 2-3 sentence summary of the overall security posture>",
  "risks": [
    {
      "level": "HIGH|MEDIUM|LOW",
      "category": "<security category>",
      "description": "<brief description of the risk>"
    }
  ]
}`;

  const userPrompt = `Please analyze the following security questionnaire and provide a risk assessment:

${formattedData}`;

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: userPrompt,
    });

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      highRiskCount: parsed.highRiskCount || 0,
      mediumRiskCount: parsed.mediumRiskCount || 0,
      lowRiskCount: parsed.lowRiskCount || 0,
      summary: parsed.summary || "Assessment completed",
      rawResponse: parsed,
    };
  } catch (error) {
    console.error("AI risk assessment error:", error);
    throw error;
  }
}

// Answer input from the API request
interface AnswerInput {
  sectionId: string;
  questionId?: string;
  answerText?: string;
  answerJson?: unknown;
}

// Create a task from questionnaire answer with AI assessment
export async function createTaskFromQuestionnaire(
  questionnaireId: string,
  answers: AnswerInput[]
): Promise<{ taskId: string; status: TaskStatus }> {
  // Create the task first
  const task = await prisma.task.create({
    data: {
      status: TaskStatus.PENDING,
    },
  });

  // Create QuestionnaireAnswer records linked to this task
  await prisma.questionnaireAnswer.createMany({
    data: answers.map((a) => ({
      sectionId: a.sectionId,
      questionId: a.questionId,
      answerText: a.answerText,
      answerJson: a.answerJson ?? undefined,
      taskId: task.id,
    })),
  });

  // Fetch created answers with section info for AI assessment
  const createdAnswers = await prisma.questionnaireAnswer.findMany({
    where: { taskId: task.id },
    include: { section: true, question: true },
  });

  // Group answers by section for AI assessment
  const sectionMap = new Map<string, { sectionKey: string; title: string; answers: typeof createdAnswers }>();
  for (const answer of createdAnswers) {
    const key = answer.section.sectionKey;
    if (!sectionMap.has(key)) {
      sectionMap.set(key, {
        sectionKey: answer.section.sectionKey,
        title: answer.section.title,
        answers: [],
      });
    }
    sectionMap.get(key)!.answers.push(answer);
  }

  const questionnaireData: QuestionnaireData = {
    id: questionnaireId,
    sections: Array.from(sectionMap.values()).map((s) => ({
      sectionKey: s.sectionKey,
      title: s.title,
      answers: s.answers.map((a) => ({
        questionCode: a.question?.questionCode ?? "",
        questionText: a.question?.questionText ?? a.answerText ?? "",
        answerText: a.answerText,
        answerJson: a.answerJson,
      })),
    })),
  };

  // Process AI assessment asynchronously
  processAIAssessment(task.id, questionnaireData).catch((error) => {
    console.error(`Failed to process AI assessment for task ${task.id}:`, error);
  });

  return {
    taskId: task.id,
    status: task.status,
  };
}

// Process AI assessment (can be called asynchronously)
async function processAIAssessment(
  taskId: string,
  questionnaireData: QuestionnaireData
): Promise<void> {
  try {
    // Update task to PROCESSING
    await prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.PROCESSING },
    });

    // Perform AI risk assessment
    const assessment = await assessQuestionnaireRisk(questionnaireData);

    // Update task with assessment results
    await prisma.task.update({
      where: { id: taskId },
      data: {
        highRiskCount: assessment.highRiskCount,
        mediumRiskCount: assessment.mediumRiskCount,
        lowRiskCount: assessment.lowRiskCount,
        assessmentSummary: assessment.summary,
        aiAssessmentRaw: assessment.rawResponse as object,
        aiModel: "gemini-1.5-flash",
        status: TaskStatus.COMPLETED,
        processedAt: new Date(),
      },
    });

    // Update questionnaire status to EVALUATED
    await prisma.questionnaireSubmission.update({
      where: { id: questionnaireData.id },
      data: { status: "EVALUATED" },
    });

    console.log(`Task ${taskId} completed with assessment:`, {
      highRisk: assessment.highRiskCount,
      mediumRisk: assessment.mediumRiskCount,
      lowRisk: assessment.lowRiskCount,
    });
  } catch (error) {
    // Update task with error status
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

// Get task by ID
export async function getTaskById(taskId: string) {
  return prisma.task.findUnique({
    where: { id: taskId },
  });
}

// Get task by questionnaire ID (finds task linked to any answer in the questionnaire)
export async function getTaskByQuestionnaireId(questionnaireId: string) {
  // Find a task that has answers belonging to this questionnaire
  const task = await prisma.task.findFirst({
    where: {
      questionnaireAnswers: {
        some: {
          section: {
            submissionId: questionnaireId,
          },
        },
      },
    },
  });

  return task;
}

// List all tasks with pagination
export async function listTasks(options: {
  page?: number;
  limit?: number;
  status?: TaskStatus;
}) {
  const { page = 1, limit = 20, status } = options;
  const where = status ? { status } : {};

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
