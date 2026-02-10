import { useState, useEffect, useCallback } from 'react';
import { useParams } from '@tanstack/react-router';
import { TaskHeader } from '../components/task-details/TaskHeader';
import { RiskSummaryRow } from '../components/task-details/RiskSummaryRow';
import { ReportOutline } from '../components/task-details/ReportOutline';
import { ReportPreviewPanel } from '../components/task-details/ReportPreviewPanel';
import { FooterDetails } from '../components/task-details/FooterDetails';
import { ReportGeneratingLoader } from '../components/task-details/ReportGeneratingLoader';
import { InlineReportViewer } from '../components/task-details/FullReportViewer';
import { useTask } from '../hooks/useTask';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Report outline sections (static for now, could be dynamic based on task data)
const reportOutlineSections = [
  { icon: 'summarize', label: 'Executive Summary', isActive: true },
  { icon: 'shield', label: 'Vulnerability Assessment', isLocked: true },
  { icon: 'gavel', label: 'Compliance Check (GDPR)', isLocked: true },
  { icon: 'hub', label: 'Model Robustness Analysis', isLocked: true },
  { icon: 'assignment_turned_in', label: 'Remediation Roadmap', isLocked: true },
];

// AICC Token cost for unlocking the report
const REPORT_UNLOCK_COST = 2500;

// Helper to generate audit ID from task ID
function generateAuditId(taskId: string): string {
  const shortId = taskId.slice(-6).toUpperCase();
  return `#OC-${shortId}-AI`;
}

export function TaskDetailsPage() {
  const { taskId } = useParams({ from: '/tasks/$taskId' });
  const { task, isLoading, error, refetch } = useTask(taskId);

  const [viewMode, setViewMode] = useState<'preview' | 'generating' | 'report'>('preview');
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);

  // Record payment and trigger report generation
  const recordPaymentAndGenerateReport = useCallback(async (transactionHash: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash: transactionHash,
          amount: REPORT_UNLOCK_COST,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to record payment');
      }

      // Switch to generating view
      setViewMode('generating');
      
      // Start polling for report status
      startPolling();
    } catch (err) {
      console.error('Error recording payment:', err);
    }
  }, [taskId]);

  // Start polling for report status
  const startPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/report-status`);
        const data = await response.json();

        if (data.success && data.data) {
          if (data.data.reportStatus === 'COMPLETED') {
            // Report is ready, switch to report view
            setViewMode('report');
            clearInterval(interval);
            setPollingInterval(null);
            refetch(); // Refresh task data
          } else if (data.data.reportStatus === 'FAILED') {
            // Report generation failed
            clearInterval(interval);
            setPollingInterval(null);
            refetch();
          }
        }
      } catch (err) {
        console.error('Error polling report status:', err);
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);
  }, [taskId, refetch]);

  // Check initial report status
  useEffect(() => {
    if (task) {
      if (task.reportStatus === 'COMPLETED') {
        setViewMode('report');
      } else if (task.reportStatus === 'GENERATING') {
        setViewMode('generating');
        startPolling();
      }
    }
  }, [task?.reportStatus]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleUnlockSuccess = (transactionHash: `0x${string}`) => {
    recordPaymentAndGenerateReport(transactionHash);
  };

  const handleTopUp = () => {
    console.log('Top up clicked');
    window.open('https://app.uniswap.org/#/swap?chain=base', '_blank');
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="flex flex-1 justify-center py-8">
        <div className="layout-content-container flex flex-col max-w-[1200px] w-full px-4 md:px-10">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d7df2]"></div>
            <p className="text-[#93adc8] text-lg">Loading task details...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !task) {
    return (
      <main className="flex flex-1 justify-center py-8">
        <div className="layout-content-container flex flex-col max-w-[1200px] w-full px-4 md:px-10">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <span className="material-symbols-outlined text-5xl text-red-500">error</span>
            <h2 className="text-white text-xl font-bold">Failed to load task</h2>
            <p className="text-[#93adc8]">{error || 'Task not found'}</p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-6 py-2 bg-[#243647] text-white rounded-lg hover:bg-[#2d4459] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Processing/Pending state (assessment not yet complete)
  if (task.status === 'PENDING' || task.status === 'PROCESSING') {
    return (
      <main className="flex flex-1 justify-center py-8">
        <div className="layout-content-container flex flex-col max-w-[1200px] w-full px-4 md:px-10">
          <TaskHeader
            auditId={generateAuditId(task.id)}
            title="AI Security Audit"
          />
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 bg-[#1a2632] rounded-xl p-8 mt-6">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-5xl text-[#0d7df2]">
                {task.status === 'PENDING' ? 'hourglass_empty' : 'sync'}
              </span>
              <h2 className="text-white text-xl font-bold">
                {task.status === 'PENDING' ? 'Assessment Queued' : 'Processing Assessment'}
              </h2>
              <p className="text-[#93adc8] text-center max-w-md">
                {task.status === 'PENDING'
                  ? 'Your security assessment is queued and will begin processing shortly.'
                  : 'Our AI is analyzing your questionnaire responses. This usually takes 1-2 minutes.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Failed state (assessment failed)
  if (task.status === 'FAILED') {
    return (
      <main className="flex flex-1 justify-center py-8">
        <div className="layout-content-container flex flex-col max-w-[1200px] w-full px-4 md:px-10">
          <TaskHeader
            auditId={generateAuditId(task.id)}
            title="AI Security Audit"
          />
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 bg-[#1a2632] rounded-xl p-8 mt-6">
            <span className="material-symbols-outlined text-5xl text-red-500">warning</span>
            <h2 className="text-white text-xl font-bold">Assessment Failed</h2>
            <p className="text-[#93adc8] text-center max-w-md">
              {task.errorMessage || 'An error occurred during the AI assessment. Please try again.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-[#0d7df2] text-white rounded-lg hover:bg-[#0b6ad4] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Report generation failed state
  if (task.reportStatus === 'FAILED') {
    return (
      <main className="flex flex-1 justify-center py-8">
        <div className="layout-content-container flex flex-col max-w-[1200px] w-full px-4 md:px-10">
          <TaskHeader
            auditId={generateAuditId(task.id)}
            title="AI Security Audit"
          />
          <RiskSummaryRow data={{
            high: { count: task.highRiskCount, description: 'Immediate action required' },
            medium: { count: task.mediumRiskCount, description: 'Review within 14 days' },
            low: { count: task.lowRiskCount, description: 'Optimization suggested' },
          }} />
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 bg-[#1a2632] rounded-xl p-8 mt-6">
            <span className="material-symbols-outlined text-5xl text-red-500">error</span>
            <h2 className="text-white text-xl font-bold">Report Generation Failed</h2>
            <p className="text-[#93adc8] text-center max-w-md">
              {task.reportError || 'An error occurred while generating your report. Please contact support.'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Report generating state
  if (viewMode === 'generating' || task.reportStatus === 'GENERATING') {
    return (
      <main className="flex flex-1 justify-center py-8">
        <div className="layout-content-container flex flex-col max-w-[1200px] w-full px-4 md:px-10">
          <TaskHeader
            auditId={generateAuditId(task.id)}
            title="AI Security Audit"
          />
          <RiskSummaryRow data={{
            high: { count: task.highRiskCount, description: 'Immediate action required' },
            medium: { count: task.mediumRiskCount, description: 'Review within 14 days' },
            low: { count: task.lowRiskCount, description: 'Optimization suggested' },
          }} />
          <div className="mt-6">
            <ReportGeneratingLoader />
          </div>
        </div>
      </main>
    );
  }

  // Report completed - show full report
  if (viewMode === 'report' || task.reportStatus === 'COMPLETED') {
    return (
      <main className="flex flex-1 justify-center py-8">
        <div className="layout-content-container flex flex-col max-w-[1200px] w-full px-4 md:px-10">
          <TaskHeader
            auditId={generateAuditId(task.id)}
            title="AI Security Audit"
          />
          <RiskSummaryRow data={{
            high: { count: task.highRiskCount, description: 'Immediate action required' },
            medium: { count: task.mediumRiskCount, description: 'Review within 14 days' },
            low: { count: task.lowRiskCount, description: 'Optimization suggested' },
          }} />
          <div className="mt-6">
            <InlineReportViewer 
              taskId={task.id}
              onBack={() => setViewMode('preview')}
            />
          </div>
          <FooterDetails />
        </div>
      </main>
    );
  }

  // Default: Completed assessment, show preview with unlock option
  const riskData = {
    high: { count: task.highRiskCount, description: 'Immediate action required' },
    medium: { count: task.mediumRiskCount, description: 'Review within 14 days' },
    low: { count: task.lowRiskCount, description: 'Optimization suggested' },
  };

  // Calculate report stats based on risk counts
  const totalRisks = task.highRiskCount + task.mediumRiskCount + task.lowRiskCount;
  const reportStats = {
    pages: Math.max(10, Math.ceil(totalRisks * 1.5)),
    insights: totalRisks,
    format: 'HTML',
  };

  // Calculate confidence score based on risk distribution
  const confidenceScore = Math.max(
    50,
    100 - task.highRiskCount * 3 - task.mediumRiskCount * 1
  );

  // Determine if report is locked (not paid yet)
  const isReportLocked = task.reportStatus === 'NOT_STARTED' && !task.paidAt;

  return (
    <main className="flex flex-1 justify-center py-8">
      <div className="layout-content-container flex flex-col max-w-[1200px] w-full px-4 md:px-10">
        {/* Task Header */}
        <TaskHeader
          auditId={generateAuditId(task.id)}
          title={`AI Security Audit`}
        />

        {/* Risk Summary Row */}
        <RiskSummaryRow data={riskData} />

        {/* Report Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents / Sidebar */}
          <ReportOutline
            sections={reportOutlineSections}
            confidenceScore={confidenceScore}
            dataPoints={totalRisks * 50}
          />

          {/* Report Preview (Blurred when locked) */}
          <ReportPreviewPanel
            isLocked={isReportLocked}
            tokenCost={REPORT_UNLOCK_COST}
            stats={reportStats}
            onUnlockSuccess={handleUnlockSuccess}
            onTopUp={handleTopUp}
          />
        </div>

        {/* Footer Details */}
        <FooterDetails />
      </div>
    </main>
  );
}
