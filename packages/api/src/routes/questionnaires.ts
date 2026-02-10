import { prisma, QuestionnaireStatus, AnswerStatus, Prisma } from '@team-clawctor/db';
import { createTaskFromQuestionnaire } from '../services/ai-risk-assessment';

// Types for questionnaire submission request
interface AnswerInput {
  sectionId: string; // Reference to QuestionnaireSection.id
  questionId: string; // Reference to Question.id
  answerText?: string;
  answerJson?: Prisma.InputJsonValue;
  attachments?: AttachmentInput[];
}

interface AttachmentInput {
  fileName: string;
  fileType: string;
  fileSize?: number;
  fileUrl: string;
  description?: string;
}

interface QuestionnaireSubmissionInput {
  questionnaireId: string; // ID of the questionnaire template to submit answers for
  submitterEmail?: string;
  submitterName?: string;
  source?: string;
  answers: AnswerInput[];
}

// Generate asset hash for verification using Web Crypto API (Bun compatible)
async function generateAssetHash(data: QuestionnaireSubmissionInput): Promise<string> {
  const content = JSON.stringify({
    answers: data.answers,
    timestamp: Date.now(),
  });
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b: number) => b.toString(16).padStart(2, '0')).join('');
}

// Validate submission input
function validateSubmission(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid request body'] };
  }

  const input = data as Record<string, unknown>;

  if (!input.questionnaireId || typeof input.questionnaireId !== 'string') {
    errors.push('questionnaireId is required');
  }

  if (!input.answers || !Array.isArray(input.answers)) {
    errors.push('answers is required and must be an array');
  } else {
    input.answers.forEach((answer: unknown, index: number) => {
      if (!answer || typeof answer !== 'object') {
        errors.push(`answers[${index}] must be an object`);
        return;
      }

      const ans = answer as Record<string, unknown>;

      if (!ans.sectionId || typeof ans.sectionId !== 'string') {
        errors.push(`answers[${index}].sectionId is required`);
      }

      if (!ans.questionId || typeof ans.questionId !== 'string') {
        errors.push(`answers[${index}].questionId is required`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

// POST /api/questionnaires - Submit answers to a questionnaire
export async function submitQuestionnaire(req: Request): Promise<Response> {
  try {
    const body = await req.json();

    // Validate input
    const validation = validateSubmission(body);
    if (!validation.valid) {
      return Response.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const input = body as QuestionnaireSubmissionInput;

    // Verify the questionnaire template exists
    const questionnaireTemplate = (await prisma.questionnaireSubmission.findUnique({
      where: { id: input.questionnaireId },
      include: {
        sections: {
          include: {
            answers: {
              include: {
                question: true,
              },
            },
          },
        },
      },
    })) as any;

    if (!questionnaireTemplate) {
      return Response.json(
        { error: 'Questionnaire template not found' },
        { status: 404 }
      );
    }

    // Validate that all referenced sections and questions belong to this questionnaire
    const allSectionIds = [...new Set(input.answers.map(a => a.sectionId))];
    const templateSectionIds = questionnaireTemplate.sections.map((s: any) => s.id);

    const invalidSections = allSectionIds.filter(id => !templateSectionIds.includes(id));
    if (invalidSections.length > 0) {
      return Response.json(
        {
          error: 'Invalid section IDs',
          details: `The following section IDs do not belong to this questionnaire: ${invalidSections.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate questions
    const allQuestionIds = input.answers.map(a => a.questionId);
    const templateQuestionIds = questionnaireTemplate.sections.flatMap((s: any) =>
      s.answers.map((a: any) => a.questionId)
    );

    const invalidQuestions = allQuestionIds.filter(id => !templateQuestionIds.includes(id));
    if (invalidQuestions.length > 0) {
      return Response.json(
        {
          error: 'Invalid question IDs',
          details: `The following question IDs do not belong to this questionnaire: ${invalidQuestions.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Update or create answers
    await Promise.all(
      input.answers.map(async (answer) => {
        // Find if answer already exists
        const existingAnswer = await (prisma as any).questionnaireAnswer.findFirst({
          where: {
            sectionId: answer.sectionId,
            questionId: answer.questionId,
          },
        });

        if (existingAnswer) {
          // Update existing answer
          return await (prisma as any).questionnaireAnswer.update({
            where: { id: existingAnswer.id },
            data: {
              answerText: answer.answerText,
              answerJson: answer.answerJson,
              status: answer.answerText || answer.answerJson
                ? AnswerStatus.ANSWERED
                : AnswerStatus.MISSING_INFO,
              attachments: answer.attachments ? {
                deleteMany: {}, // Clear existing attachments
                create: answer.attachments.map((att: AttachmentInput) => ({
                  fileName: att.fileName,
                  fileType: att.fileType,
                  fileSize: att.fileSize,
                  fileUrl: att.fileUrl,
                  description: att.description,
                })),
              } : undefined,
            },
          });
        } else {
          // Create new answer
          return await (prisma as any).questionnaireAnswer.create({
            data: {
              sectionId: answer.sectionId,
              questionId: answer.questionId,
              answerText: answer.answerText,
              answerJson: answer.answerJson,
              status: answer.answerText || answer.answerJson
                ? AnswerStatus.ANSWERED
                : AnswerStatus.MISSING_INFO,
              attachments: answer.attachments ? {
                create: answer.attachments.map((att: AttachmentInput) => ({
                  fileName: att.fileName,
                  fileType: att.fileType,
                  fileSize: att.fileSize,
                  fileUrl: att.fileUrl,
                  description: att.description,
                })),
              } : undefined,
            },
          });
        }
      })
    );

    // Update submission metadata
    const assetHash = await generateAssetHash(input);
    const submission = await prisma.questionnaireSubmission.update({
      where: { id: input.questionnaireId },
      data: {
        submitterEmail: input.submitterEmail,
        submitterName: input.submitterName,
        source: input.source || 'web_portal',
        assetHash,
        sessionVerified: true,
        status: QuestionnaireStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      include: {
        sections: {
          include: {
            answers: {
              include: {
                question: true,
                attachments: true,
              },
            },
          },
        },
      },
    } as any);

    const sectionsCount = (submission as any).sections.length;
    const totalQuestions = (submission as any).sections.reduce(
      (acc: number, sec: any) => acc + sec.answers.filter((a: any) => a.answerText || a.answerJson).length,
      0
    );

    // Automatically create a task with AI risk assessment
    let taskInfo: { taskId: string; status: string } | null = null;
    try {
      const taskResult = await createTaskFromQuestionnaire(submission.id);
      taskInfo = {
        taskId: taskResult.taskId,
        status: taskResult.status,
      };
    } catch (taskError) {
      console.error('Error creating task for questionnaire:', taskError);
      // Don't fail the questionnaire submission if task creation fails
    }

    return Response.json(
      {
        success: true,
        data: {
          id: submission.id,
          assetHash: submission.assetHash,
          status: submission.status,
          submittedAt: submission.submittedAt,
          sectionsCount,
          totalQuestions,
          task: taskInfo,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/questionnaires - List all questionnaire submissions
export async function listQuestionnaires(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const status = url.searchParams.get('status') as QuestionnaireStatus | null;

    const where = status ? { status } : {};

    const [submissions, total] = await Promise.all([
      prisma.questionnaireSubmission.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { sections: true },
          },
        },
      }),
      prisma.questionnaireSubmission.count({ where }),
    ]);

    return Response.json({
      success: true,
      data: submissions.map(sub => ({
        id: sub.id,
        status: sub.status,
        source: sub.source,
        assetHash: sub.assetHash,
        sessionVerified: sub.sessionVerified,
        submitterEmail: sub.submitterEmail,
        submitterName: sub.submitterName,
        sectionsCount: sub._count.sections,
        submittedAt: sub.submittedAt,
        createdAt: sub.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing questionnaires:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/questionnaires/:id - Get a single questionnaire submission with full details
export async function getQuestionnaire(_req: Request, id: string): Promise<Response> {
  try {
    const submission = await prisma.questionnaireSubmission.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    } as any);

    if (!submission) {
      return Response.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      );
    }

    // Get questions for each section
    const sectionsWithQuestions = await Promise.all(
      (submission as any).sections.map(async (section: any) => {
        const questions = await (prisma as any).question.findMany({
          where: { sectionKey: section.sectionKey },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            questionCode: true,
            questionText: true,
            order: true,
          },
        });

        return {
          id: section.id,
          title: section.title,
          icon: section.icon,
          order: section.order,
          questions,
        };
      })
    );

    const simplifiedData = {
      id: submission.id,
      sections: sectionsWithQuestions,
    };

    return Response.json({
      success: true,
      data: simplifiedData,
    });
  } catch (error) {
    console.error('Error getting questionnaire:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/latest_questionnaires - Get the latest questionnaire submission
export async function getLatestQuestionnaire(_req: Request): Promise<Response> {
  try {
    const submission = await prisma.questionnaireSubmission.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    } as any);

    if (!submission) {
      return Response.json(
        { error: 'No questionnaire found' },
        { status: 404 }
      );
    }

    // Get questions for each section
    const sectionsWithQuestions = await Promise.all(
      (submission as any).sections.map(async (section: any) => {
        const questions = await (prisma as any).question.findMany({
          where: { sectionKey: section.sectionKey },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            questionCode: true,
            questionText: true,
            order: true,
          },
        });

        return {
          id: section.id,
          title: section.title,
          icon: section.icon,
          order: section.order,
          questions,
        };
      })
    );

    const simplifiedData = {
      id: submission.id,
      sections: sectionsWithQuestions,
    };

    return Response.json({
      success: true,
      data: simplifiedData,
    });
  } catch (error) {
    console.error('Error getting latest questionnaire:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/questionnaires/:id/status - Update questionnaire status
export async function updateQuestionnaireStatus(
  req: Request,
  id: string
): Promise<Response> {
  try {
    const body = await req.json();
    const { status } = body as { status: QuestionnaireStatus };

    if (!status || !Object.values(QuestionnaireStatus).includes(status)) {
      return Response.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const submission = await prisma.questionnaireSubmission.update({
      where: { id },
      data: { status },
    });

    return Response.json({
      success: true,
      data: {
        id: submission.id,
        status: submission.status,
        updatedAt: submission.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating questionnaire status:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
