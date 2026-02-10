import { useEffect, useState } from 'react';

interface ReportGeneratingLoaderProps {
  onComplete?: () => void;
}

const loadingMessages = [
  'Analyzing security questionnaire responses...',
  'Evaluating risk factors across all domains...',
  'Generating executive summary...',
  'Calculating category health scores...',
  'Identifying critical vulnerabilities...',
  'Creating remediation roadmap...',
  'Formatting detailed report...',
  'Finalizing security assessment...',
];

export function ReportGeneratingLoader({ onComplete }: ReportGeneratingLoaderProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle through messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    // Simulate progress (will be replaced by actual polling)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 5;
      });
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-8 bg-[#1a2632] rounded-xl p-12">
      {/* Animated Logo/Icon */}
      <div className="relative">
        <div className="absolute inset-0 animate-ping">
          <div className="w-24 h-24 rounded-full bg-[#0d7df2]/20"></div>
        </div>
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#0d7df2] to-[#0b6ad4] flex items-center justify-center shadow-lg shadow-[#0d7df2]/30">
          <span className="material-symbols-outlined text-white text-4xl animate-pulse">
            auto_awesome
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-white text-2xl font-bold mb-2">Generating Your Security Report</h2>
        <p className="text-[#93adc8] text-lg">
          AI is analyzing your security responses
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#93adc8]">Progress</span>
          <span className="text-[#0d7df2] font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-[#243647] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#0d7df2] to-[#0b6ad4] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Current Status Message */}
      <div className="flex items-center gap-3 text-[#93adc8]">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#0d7df2] border-t-transparent"></div>
        <span className="text-sm font-medium transition-all duration-300">
          {loadingMessages[currentMessageIndex]}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mt-4">
        <div className="bg-[#243647]/50 rounded-lg p-4 text-center">
          <span className="material-symbols-outlined text-[#0d7df2] text-2xl mb-2">security</span>
          <p className="text-white text-sm font-bold">Risk Analysis</p>
          <p className="text-[#93adc8] text-xs">Comprehensive assessment</p>
        </div>
        <div className="bg-[#243647]/50 rounded-lg p-4 text-center">
          <span className="material-symbols-outlined text-[#0d7df2] text-2xl mb-2">analytics</span>
          <p className="text-white text-sm font-bold">Score Calculation</p>
          <p className="text-[#93adc8] text-xs">Domain-by-domain breakdown</p>
        </div>
        <div className="bg-[#243647]/50 rounded-lg p-4 text-center">
          <span className="material-symbols-outlined text-[#0d7df2] text-2xl mb-2">route</span>
          <p className="text-white text-sm font-bold">Remediation Plan</p>
          <p className="text-[#93adc8] text-xs">Actionable roadmap</p>
        </div>
      </div>

      {/* Estimated Time */}
      <p className="text-[#617589] text-sm">
        Estimated time remaining: <span className="text-[#93adc8]">1-2 minutes</span>
      </p>
    </div>
  );
}
