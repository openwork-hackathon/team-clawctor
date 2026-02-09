import { corsMiddleware, handleOptions } from './middleware/cors';
import {
  submitQuestionnaire,
  listQuestionnaires,
  getQuestionnaire,
  updateQuestionnaireStatus
} from './routes/questionnaires';
import {
  createTask,
  handleListTasks,
  getTask,
  getTaskByQuestionnaire,
  handlePayment,
  handleGetReportStatus,
  handleGetReport,
  handleGenerateReport
} from './routes/tasks';

const PORT = process.env.PORT || 3001;

// Helper to extract path parameters
function matchPath(pathname: string, pattern: string): { match: boolean; params: Record<string, string> } {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');
  
  if (patternParts.length !== pathParts.length) {
    return { match: false, params: {} };
  }
  
  const params: Record<string, string> = {};
  
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return { match: false, params: {} };
    }
  }
  
  return { match: true, params };
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const { pathname } = url;
    const method = req.method;
    
    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return handleOptions(req);
    }

    // Route handling
    let response: Response | null = null;

    // Health check
    if (pathname === '/api/health') {
      response = Response.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Questionnaire routes
    // POST /api/questionnaires - Submit a new questionnaire
    if (!response && pathname === '/api/questionnaires' && method === 'POST') {
      response = await submitQuestionnaire(req);
    }

    // GET /api/questionnaires - List all questionnaires
    if (!response && pathname === '/api/questionnaires' && method === 'GET') {
      response = await listQuestionnaires(req);
    }

    // GET /api/questionnaires/:id - Get a single questionnaire
    const getMatch = matchPath(pathname, '/api/questionnaires/:id');
    if (!response && getMatch.match && method === 'GET') {
      response = await getQuestionnaire(req, getMatch.params.id);
    }

    // PATCH /api/questionnaires/:id/status - Update questionnaire status
    const statusMatch = matchPath(pathname, '/api/questionnaires/:id/status');
    if (!response && statusMatch.match && method === 'PATCH') {
      response = await updateQuestionnaireStatus(req, statusMatch.params.id);
    }

    // Task routes
    // POST /api/tasks - Create a task manually
    if (!response && pathname === '/api/tasks' && method === 'POST') {
      response = await createTask(req);
    }

    // GET /api/tasks - List all tasks
    if (!response && pathname === '/api/tasks' && method === 'GET') {
      response = await handleListTasks(req);
    }

    // GET /api/tasks/by-questionnaire/:questionnaireId - Get task by questionnaire ID
    const taskByQuestionnaireMatch = matchPath(pathname, '/api/tasks/by-questionnaire/:questionnaireId');
    if (!response && taskByQuestionnaireMatch.match && method === 'GET') {
      response = await getTaskByQuestionnaire(req, taskByQuestionnaireMatch.params.questionnaireId);
    }

    // POST /api/tasks/:id/payment - Record payment and trigger report generation
    const paymentMatch = matchPath(pathname, '/api/tasks/:id/payment');
    if (!response && paymentMatch.match && method === 'POST') {
      response = await handlePayment(req, paymentMatch.params.id);
    }

    // GET /api/tasks/:id/report-status - Get report generation status
    const reportStatusMatch = matchPath(pathname, '/api/tasks/:id/report-status');
    if (!response && reportStatusMatch.match && method === 'GET') {
      response = await handleGetReportStatus(req, reportStatusMatch.params.id);
    }

    // GET /api/tasks/:id/report - Get the HTML report
    const reportMatch = matchPath(pathname, '/api/tasks/:id/report');
    if (!response && reportMatch.match && method === 'GET') {
      response = await handleGetReport(req, reportMatch.params.id);
    }

    // POST /api/tasks/:id/generate-report - Manually trigger report generation
    const generateReportMatch = matchPath(pathname, '/api/tasks/:id/generate-report');
    if (!response && generateReportMatch.match && method === 'POST') {
      response = await handleGenerateReport(req, generateReportMatch.params.id);
    }

    // GET /api/tasks/:id - Get a single task (must be after more specific routes)
    const taskMatch = matchPath(pathname, '/api/tasks/:id');
    if (!response && taskMatch.match && method === 'GET') {
      response = await getTask(req, taskMatch.params.id);
    }

    // 404 for unmatched routes
    if (!response) {
      response = Response.json({ error: 'Not Found' }, { status: 404 });
    }

    // Apply CORS headers
    return corsMiddleware(response);
  },
});

console.log(`🚀 API server running on http://localhost:${PORT}`);
