import { prisma } from "@team-clawctor/db";
import {
  createTaskFromQuestionnaire,
  getTaskById,
  getTaskByQuestionnaireId,
  listTasks,
} from "../services/ai-risk-assessment";
import {
  generateHTMLReport,
  getReportStatus,
  recordPaymentAndGenerateReport,
} from "../services/ai-report-generator";

// POST /api/tasks - Create a task from question answer (manual trigger)
export async function createTask(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { questionnaireId, questionAnswerId } = body as {
      questionnaireId?: string;
      questionAnswerId?: string;
    };

    if (!questionnaireId && !questionAnswerId) {
      return Response.json(
        { error: "Either questionnaireId or questionAnswerId is required" },
        { status: 400 }
      );
    }

    // If questionnaireId provided, check if task already exists
    if (questionnaireId) {
      const existingTask = await getTaskByQuestionnaireId(questionnaireId);
      if (existingTask) {
        return Response.json(
          {
            error: "Task already exists for this questionnaire",
            taskId: existingTask.id,
          },
          { status: 409 }
        );
      }

      const result = await createTaskFromQuestionnaire(questionnaireId);

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
    }

    // If questionAnswerId provided, create task directly
    if (questionAnswerId) {
      const task = await prisma.task.create({
        data: {
          questionAnswerId,
          status: "PENDING",
        },
      });

      return Response.json(
        {
          success: true,
          data: {
            taskId: task.id,
            status: task.status,
            message: "Task created.",
          },
        },
        { status: 201 }
      );
    }

    return Response.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Error creating task:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}

// GET /api/tasks - List all tasks
export async function handleListTasks(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const status = url.searchParams.get("status") as
      | "PENDING"
      | "PROCESSING"
      | "COMPLETED"
      | "FAILED"
      | null;

    const result = await listTasks({
      page,
      limit,
      status: status || undefined,
    });

    return Response.json({
      success: true,
      data: result.tasks,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error listing tasks:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/tasks/:id - Get a single task
export async function getTask(req: Request, id: string): Promise<Response> {
  try {
    const task = await getTaskById(id);

    if (!task) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    // Return only specific fields
    return Response.json({
      success: true,
      data: {
        id: task.id,
        questionAnswerId: task.questionAnswerId,
        status: task.status,
        highRiskCount: task.highRiskCount,
        mediumRiskCount: task.mediumRiskCount,
        lowRiskCount: task.lowRiskCount,
        assessmentSummary: task.assessmentSummary,
        reportStatus: task.reportStatus,
      },
    });
  } catch (error) {
    console.error("Error getting task:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/tasks/by-questionnaire/:questionnaireId - Get task by questionnaire ID
export async function getTaskByQuestionnaire(
  req: Request,
  questionnaireId: string
): Promise<Response> {
  try {
    const task = await getTaskByQuestionnaireId(questionnaireId);

    if (!task) {
      return Response.json(
        { error: "Task not found for this questionnaire" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Error getting task by questionnaire:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/tasks/:id/payment - Record payment and trigger report generation
export async function handlePayment(
  req: Request,
  taskId: string
): Promise<Response> {
  try {
    const body = await req.json();
    const { txHash, amount } = body as { txHash: string; amount: number };

    if (!txHash) {
      return Response.json(
        { error: "txHash is required" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return Response.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Check if task exists
    const task = await getTaskById(taskId);
    if (!task) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if task assessment is completed
    if (task.status !== "COMPLETED") {
      return Response.json(
        { error: "Task assessment must be completed before payment" },
        { status: 400 }
      );
    }

    // Check if report is already generated or generating
    if (task.reportStatus === "COMPLETED") {
      return Response.json(
        {
          error: "Report already generated",
          reportStatus: task.reportStatus,
        },
        { status: 409 }
      );
    }

    if (task.reportStatus === "GENERATING") {
      return Response.json(
        {
          error: "Report is already being generated",
          reportStatus: task.reportStatus,
        },
        { status: 409 }
      );
    }

    // Record payment and start report generation
    const result = await recordPaymentAndGenerateReport(taskId, txHash, amount);

    return Response.json({
      success: true,
      data: {
        taskId: result.taskId,
        reportStatus: result.reportStatus,
        message: "Payment recorded. Report generation started.",
      },
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}

// GET /api/tasks/:id/report-status - Get report generation status
export async function handleGetReportStatus(
  req: Request,
  taskId: string
): Promise<Response> {
  try {
    const reportInfo = await getReportStatus(taskId);

    if (!reportInfo) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: {
        taskId: reportInfo.id,
        reportStatus: reportInfo.reportStatus,
        reportGeneratedAt: reportInfo.reportGeneratedAt,
        reportError: reportInfo.reportError,
        hasReport: !!reportInfo.htmlReport,
      },
    });
  } catch (error) {
    console.error("Error getting report status:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/tasks/:id/report - Get the HTML report
export async function handleGetReport(
  req: Request,
  taskId: string
): Promise<Response> {
  try {
    const reportInfo = await getReportStatus(taskId);

    if (!reportInfo) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    if (reportInfo.reportStatus !== "COMPLETED" || !reportInfo.htmlReport) {
      return Response.json(
        {
          error: "Report not available",
          reportStatus: reportInfo.reportStatus,
          reportError: reportInfo.reportError,
        },
        { status: 404 }
      );
    }

    // Return the HTML report
    return new Response(reportInfo.htmlReport, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error getting report:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/tasks/:id/generate-report - Manually trigger report generation (for testing)
export async function handleGenerateReport(
  req: Request,
  taskId: string
): Promise<Response> {
  try {
    // Check if task exists
    const task = await getTaskById(taskId);
    if (!task) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if task assessment is completed
    if (task.status !== "COMPLETED") {
      return Response.json(
        { error: "Task assessment must be completed before generating report" },
        { status: 400 }
      );
    }

    // Generate the report
    const htmlReport = await generateHTMLReport(taskId);

    return Response.json({
      success: true,
      data: {
        taskId,
        reportStatus: "COMPLETED",
        reportLength: htmlReport.length,
        message: "Report generated successfully.",
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
