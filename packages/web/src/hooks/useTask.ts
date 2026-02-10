import { useState, useEffect, useCallback } from 'react';

// Report status type
export type ReportStatus = 'NOT_STARTED' | 'GENERATING' | 'COMPLETED' | 'FAILED';

// Task data type matching the API response
export interface Task {
  id: string;
  questionAnswerId: string;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  aiModel: string | null;
  aiAssessmentRaw: unknown;
  assessmentSummary: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage: string | null;
  // Report fields
  reportStatus: ReportStatus;
  htmlReport: string | null;
  reportGeneratedAt: string | null;
  reportError: string | null;
  // Payment fields
  paymentTxHash: string | null;
  paymentAmount: number | null;
  paidAt: string | null;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
}

interface UseTaskResult {
  task: Task | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useTask(taskId: string | undefined): UseTaskResult {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = async () => {
    if (!taskId) {
      setIsLoading(false);
      setError('Task ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch task');
      }

      if (data.success && data.data) {
        setTask(data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTask(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  return {
    task,
    isLoading,
    error,
    refetch: fetchTask,
  };
}
