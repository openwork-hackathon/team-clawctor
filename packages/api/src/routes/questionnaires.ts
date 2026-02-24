import { prisma, QuestionnaireStatus } from '@team-clawctor/db';
import { createTaskFromQuestionnaire } from '../services/ai-risk-assessment';

// POST /api/questionnaires - Submit answers to a questionnaire
export async function submitQuestionnaire(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { questionnaireId, answers } = body as {
      questionnaireId?: string;
      answers?: {
        sectionId: string;
        questionId?: string;
        answerText?: string;
        answerJson?: unknown;
      }[];
    };

    if (!questionnaireId) {
      return Response.json(
        { error: "questionnaireId is required" },
        { status: 400 }
      );
    }

    if (!answers || answers.length === 0) {
      return Response.json(
        { error: "answers is required" },
        { status: 400 }
      );
    }

    const result = await createTaskFromQuestionnaire(questionnaireId, answers);

    return Response.json(
      {
        success: true,
        data: {
          taskId: result.taskId,
          status: result.status,
          message:
            "Task created. AI risk assessment is being processed in the background.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
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
