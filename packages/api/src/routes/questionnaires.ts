import { prisma, QuestionnaireStatus, AnswerStatus, Prisma } from '@team-clawctor/db';
import { createTaskFromQuestionnaire } from '../services/ai-risk-assessment';

// Types for questionnaire submission request
interface AnswerInput {
  questionCode: string;
  questionText: string;
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

interface SectionInput {
  sectionKey: string;
  title: string;
  icon?: string;
  answers: AnswerInput[];
}

interface QuestionnaireSubmissionInput {
  companyName: string;
  organizationId?: string;
  submitterEmail?: string;
  submitterName?: string;
  source?: string;
  sections: SectionInput[];
}

// Generate asset hash for verification using Web Crypto API (Bun compatible)
async function generateAssetHash(data: QuestionnaireSubmissionInput): Promise<string> {
  const content = JSON.stringify({
    companyName: data.companyName,
    sections: data.sections,
    timestamp: Date.now(),
  });
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Validate submission input
function validateSubmission(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid request body'] };
  }
  
  const input = data as Record<string, unknown>;
  
  if (!input.companyName || typeof input.companyName !== 'string') {
    errors.push('companyName is required and must be a string');
  }
  
  if (!input.sections || !Array.isArray(input.sections)) {
    errors.push('sections is required and must be an array');
  } else {
    input.sections.forEach((section: unknown, index: number) => {
      if (!section || typeof section !== 'object') {
        errors.push(`sections[${index}] must be an object`);
        return;
      }
      
      const sec = section as Record<string, unknown>;
      
      if (!sec.sectionKey || typeof sec.sectionKey !== 'string') {
        errors.push(`sections[${index}].sectionKey is required`);
      }
      
      if (!sec.title || typeof sec.title !== 'string') {
        errors.push(`sections[${index}].title is required`);
      }
      
      if (!sec.answers || !Array.isArray(sec.answers)) {
        errors.push(`sections[${index}].answers is required and must be an array`);
      } else {
        sec.answers.forEach((answer: unknown, ansIndex: number) => {
          if (!answer || typeof answer !== 'object') {
            errors.push(`sections[${index}].answers[${ansIndex}] must be an object`);
            return;
          }
          
          const ans = answer as Record<string, unknown>;
          
          if (!ans.questionCode || typeof ans.questionCode !== 'string') {
            errors.push(`sections[${index}].answers[${ansIndex}].questionCode is required`);
          }
          
          if (!ans.questionText || typeof ans.questionText !== 'string') {
            errors.push(`sections[${index}].answers[${ansIndex}].questionText is required`);
          }
        });
      }
    });
  }
  
  return { valid: errors.length === 0, errors };
}

// POST /api/questionnaires - Submit a new questionnaire
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
    
    // Generate asset hash
    const assetHash = await generateAssetHash(input);
    
    // Create submission with nested sections and answers
    const submission = await prisma.questionnaireSubmission.create({
      data: {
        companyName: input.companyName,
        organizationId: input.organizationId,
        submitterEmail: input.submitterEmail,
        submitterName: input.submitterName,
        source: input.source || 'web_portal',
        assetHash,
        sessionVerified: true,
        status: QuestionnaireStatus.SUBMITTED,
        sections: {
          create: input.sections.map((section, sectionIndex) => ({
            sectionKey: section.sectionKey,
            title: section.title,
            icon: section.icon,
            order: sectionIndex,
            answers: {
              create: section.answers.map((answer, answerIndex) => ({
                questionCode: answer.questionCode,
                questionText: answer.questionText,
                answerText: answer.answerText,
                answerJson: answer.answerJson,
                order: answerIndex,
                status: answer.answerText || answer.answerJson 
                  ? AnswerStatus.ANSWERED 
                  : AnswerStatus.MISSING_INFO,
                attachments: answer.attachments ? {
                  create: answer.attachments.map(att => ({
                    fileName: att.fileName,
                    fileType: att.fileType,
                    fileSize: att.fileSize,
                    fileUrl: att.fileUrl,
                    description: att.description,
                  })),
                } : undefined,
              })),
            },
          })),
        },
      },
      include: {
        sections: {
          include: {
            answers: {
              include: {
                attachments: true,
              },
            },
          },
        },
      },
    });
    
    const sectionsCount = submission.sections.length;
    const totalQuestions = submission.sections.reduce(
      (acc: number, sec) => acc + sec.answers.length,
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
          companyName: submission.companyName,
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
        companyName: sub.companyName,
        organizationId: sub.organizationId,
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
export async function getQuestionnaire(req: Request, id: string): Promise<Response> {
  try {
    const submission = await prisma.questionnaireSubmission.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            answers: {
              orderBy: { order: 'asc' },
              include: {
                attachments: true,
              },
            },
          },
        },
      },
    });
    
    if (!submission) {
      return Response.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      );
    }
    
    return Response.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error getting questionnaire:', error);
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
