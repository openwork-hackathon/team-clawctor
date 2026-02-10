import { describe, expect, test, beforeEach, mock } from "bun:test";
import {
  createTask,
  handleListTasks,
  getTask,
  getTaskByQuestionnaire,
  handlePayment,
  handleGetReportStatus,
  handleGetReport,
  handleGenerateReport,
} from "./tasks";
import { prisma } from "@team-clawctor/db";
import * as aiService from "../services/ai-risk-assessment";
import * as reportService from "../services/ai-report-generator";

// Mock the services
mock.module("../services/ai-risk-assessment", () => ({
  createTaskFromQuestionnaire: mock(),
  getTaskById: mock(),
  getTaskByQuestionnaireId: mock(),
  listTasks: mock(),
}));

mock.module("../services/ai-report-generator", () => ({
  generateHTMLReport: mock(),
  getReportStatus: mock(),
  recordPaymentAndGenerateReport: mock(),
}));

describe("createTask", () => {
  test("should return 400 if neither questionnaireId nor questionAnswerId provided", async () => {
    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await createTask(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Either questionnaireId or questionAnswerId is required");
  });

  test("should return 409 if task already exists for questionnaire", async () => {
    const mockGetTaskByQuestionnaireId = aiService.getTaskByQuestionnaireId as any;
    mockGetTaskByQuestionnaireId.mockResolvedValue({ id: "existing-task-id" });

    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({ questionnaireId: "test-questionnaire-id" }),
    });

    const response = await createTask(req);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe("Task already exists for this questionnaire");
    expect(data.taskId).toBe("existing-task-id");
  });

  test("should create task with questionnaireId", async () => {
    const mockGetTaskByQuestionnaireId = aiService.getTaskByQuestionnaireId as any;
    const mockCreateTaskFromQuestionnaire = aiService.createTaskFromQuestionnaire as any;

    mockGetTaskByQuestionnaireId.mockResolvedValue(null);
    mockCreateTaskFromQuestionnaire.mockResolvedValue({
      taskId: "new-task-id",
      status: "PENDING",
    });

    const req = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({ questionnaireId: "test-questionnaire-id" }),
    });

    const response = await createTask(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.taskId).toBe("new-task-id");
  });
});

describe("handleListTasks", () => {
  test("should list tasks with pagination", async () => {
    const mockListTasks = aiService.listTasks as any;
    mockListTasks.mockResolvedValue({
      tasks: [{ id: "task-1" }, { id: "task-2" }],
      pagination: { page: 1, limit: 20, total: 2 },
    });

    const req = new Request("http://localhost/api/tasks?page=1&limit=20");

    const response = await handleListTasks(req);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.pagination).toEqual({ page: 1, limit: 20, total: 2 });
  });
});

describe("getTask", () => {
  test("should return 404 if task not found", async () => {
    const mockGetTaskById = aiService.getTaskById as any;
    mockGetTaskById.mockResolvedValue(null);

    const req = new Request("http://localhost/api/tasks/non-existent");
    const response = await getTask(req, "non-existent");
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Task not found");
  });

  test("should return task data", async () => {
    const mockGetTaskById = aiService.getTaskById as any;
    mockGetTaskById.mockResolvedValue({
      id: "task-1",
      questionAnswerId: "qa-1",
      status: "COMPLETED",
      highRiskCount: 2,
      mediumRiskCount: 3,
      lowRiskCount: 5,
      assessmentSummary: "Test summary",
      reportStatus: "PENDING",
    });

    const req = new Request("http://localhost/api/tasks/task-1");
    const response = await getTask(req, "task-1");
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.id).toBe("task-1");
    expect(data.data.status).toBe("COMPLETED");
  });
});

describe("handlePayment", () => {
  test("should return 400 if txHash missing", async () => {
    const req = new Request("http://localhost/api/tasks/task-1/payment", {
      method: "POST",
      body: JSON.stringify({ amount: 100 }),
    });

    const response = await handlePayment(req, "task-1");
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("txHash is required");
  });

  test("should return 400 if amount invalid", async () => {
    const req = new Request("http://localhost/api/tasks/task-1/payment", {
      method: "POST",
      body: JSON.stringify({ txHash: "0x123", amount: 0 }),
    });

    const response = await handlePayment(req, "task-1");
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Valid amount is required");
  });

  test("should return 404 if task not found", async () => {
    const mockGetTaskById = aiService.getTaskById as any;
    mockGetTaskById.mockResolvedValue(null);

    const req = new Request("http://localhost/api/tasks/task-1/payment", {
      method: "POST",
      body: JSON.stringify({ txHash: "0x123", amount: 100 }),
    });

    const response = await handlePayment(req, "task-1");
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Task not found");
  });

  test("should return 400 if task not completed", async () => {
    const mockGetTaskById = aiService.getTaskById as any;
    mockGetTaskById.mockResolvedValue({
      id: "task-1",
      status: "PENDING",
      reportStatus: "NOT_STARTED",
    });

    const req = new Request("http://localhost/api/tasks/task-1/payment", {
      method: "POST",
      body: JSON.stringify({ txHash: "0x123", amount: 100 }),
    });

    const response = await handlePayment(req, "task-1");
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Task assessment must be completed before payment");
  });

  test("should process payment successfully", async () => {
    const mockGetTaskById = aiService.getTaskById as any;
    const mockRecordPayment = reportService.recordPaymentAndGenerateReport as any;

    mockGetTaskById.mockResolvedValue({
      id: "task-1",
      status: "COMPLETED",
      reportStatus: "NOT_STARTED",
    });

    mockRecordPayment.mockResolvedValue({
      taskId: "task-1",
      reportStatus: "GENERATING",
    });

    const req = new Request("http://localhost/api/tasks/task-1/payment", {
      method: "POST",
      body: JSON.stringify({ txHash: "0x123", amount: 100 }),
    });

    const response = await handlePayment(req, "task-1");
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.reportStatus).toBe("GENERATING");
  });
});

describe("handleGetReportStatus", () => {
  test("should return 404 if task not found", async () => {
    const mockGetReportStatus = reportService.getReportStatus as any;
    mockGetReportStatus.mockResolvedValue(null);

    const req = new Request("http://localhost/api/tasks/task-1/report-status");
    const response = await handleGetReportStatus(req, "task-1");
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Task not found");
  });

  test("should return report status", async () => {
    const mockGetReportStatus = reportService.getReportStatus as any;
    mockGetReportStatus.mockResolvedValue({
      id: "task-1",
      reportStatus: "COMPLETED",
      reportGeneratedAt: new Date(),
      reportError: null,
      htmlReport: "<html>Report</html>",
    });

    const req = new Request("http://localhost/api/tasks/task-1/report-status");
    const response = await handleGetReportStatus(req, "task-1");
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.reportStatus).toBe("COMPLETED");
    expect(data.data.hasReport).toBe(true);
  });
});

describe("handleGetReport", () => {
  test("should return 404 if report not available", async () => {
    const mockGetReportStatus = reportService.getReportStatus as any;
    mockGetReportStatus.mockResolvedValue({
      id: "task-1",
      reportStatus: "PENDING",
      htmlReport: null,
    });

    const req = new Request("http://localhost/api/tasks/task-1/report");
    const response = await handleGetReport(req, "task-1");
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Report not available");
  });

  test("should return HTML report", async () => {
    const mockGetReportStatus = reportService.getReportStatus as any;
    mockGetReportStatus.mockResolvedValue({
      id: "task-1",
      reportStatus: "COMPLETED",
      htmlReport: "<html><body>Test Report</body></html>",
    });

    const req = new Request("http://localhost/api/tasks/task-1/report");
    const response = await handleGetReport(req, "task-1");
    const html = await response.text();

    expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(html).toBe("<html><body>Test Report</body></html>");
  });
});

describe("handleGenerateReport", () => {
  test("should return 404 if task not found", async () => {
    const mockGetTaskById = aiService.getTaskById as any;
    mockGetTaskById.mockResolvedValue(null);

    const req = new Request("http://localhost/api/tasks/task-1/generate-report", {
      method: "POST",
    });

    const response = await handleGenerateReport(req, "task-1");
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Task not found");
  });

  test("should return 400 if task not completed", async () => {
    const mockGetTaskById = aiService.getTaskById as any;
    mockGetTaskById.mockResolvedValue({
      id: "task-1",
      status: "PROCESSING",
    });

    const req = new Request("http://localhost/api/tasks/task-1/generate-report", {
      method: "POST",
    });

    const response = await handleGenerateReport(req, "task-1");
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Task assessment must be completed before generating report");
  });

  test("should generate report successfully", async () => {
    const mockGetTaskById = aiService.getTaskById as any;
    const mockGenerateReport = reportService.generateHTMLReport as any;

    mockGetTaskById.mockResolvedValue({
      id: "task-1",
      status: "COMPLETED",
    });

    mockGenerateReport.mockResolvedValue("<html>Generated Report</html>");

    const req = new Request("http://localhost/api/tasks/task-1/generate-report", {
      method: "POST",
    });

    const response = await handleGenerateReport(req, "task-1");
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.reportStatus).toBe("COMPLETED");
    expect(data.data.reportLength).toBeGreaterThan(0);
  });
});
