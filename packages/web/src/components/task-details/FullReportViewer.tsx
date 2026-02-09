import { useEffect, useRef } from 'react';

interface FullReportViewerProps {
  htmlContent: string;
  onClose?: () => void;
}

export function FullReportViewer({ htmlContent, onClose }: FullReportViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with actions */}
      <div className="flex items-center justify-between bg-[#1a2632] px-6 py-4 border-b border-[#2d4459]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#0d7df2]">description</span>
          <h2 className="text-white text-lg font-bold">Security Health Check Report</h2>
          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
            GENERATED
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const blob = new Blob([htmlContent], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'security-report.html';
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#243647] text-white rounded-lg hover:bg-[#2d4459] transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Download HTML
          </button>
          <button
            onClick={() => {
              const newWindow = window.open('', '_blank');
              if (newWindow) {
                newWindow.document.write(htmlContent);
                newWindow.document.close();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#243647] text-white rounded-lg hover:bg-[#2d4459] transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-lg">open_in_new</span>
            Open in New Tab
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-[#0d7df2] text-white rounded-lg hover:bg-[#0b6ad4] transition-colors text-sm font-bold"
            >
              <span className="material-symbols-outlined text-lg">close</span>
              Close
            </button>
          )}
        </div>
      </div>

      {/* Report iframe */}
      <div className="flex-1 bg-white">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Security Report"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}

// Inline report viewer that shows within the page
interface InlineReportViewerProps {
  taskId: string;
  onBack?: () => void;
}

export function InlineReportViewer({ taskId, onBack }: InlineReportViewerProps) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const reportUrl = `${API_BASE_URL}/api/tasks/${taskId}/report`;

  return (
    <div className="flex flex-col h-full min-h-[800px]">
      {/* Header with actions */}
      <div className="flex items-center justify-between bg-[#1a2632] px-6 py-4 rounded-t-xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-[#93adc8] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}
          <span className="material-symbols-outlined text-[#0d7df2]">description</span>
          <h2 className="text-white text-lg font-bold">Security Health Check Report</h2>
          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
            GENERATED
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={reportUrl}
            download="security-report.html"
            className="flex items-center gap-2 px-4 py-2 bg-[#243647] text-white rounded-lg hover:bg-[#2d4459] transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Download
          </a>
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#0d7df2] text-white rounded-lg hover:bg-[#0b6ad4] transition-colors text-sm font-bold"
          >
            <span className="material-symbols-outlined text-lg">open_in_new</span>
            Open Full Report
          </a>
        </div>
      </div>

      {/* Report iframe */}
      <div className="flex-1 bg-white rounded-b-xl overflow-hidden">
        <iframe
          src={reportUrl}
          className="w-full h-full border-0 min-h-[700px]"
          title="Security Report"
        />
      </div>
    </div>
  );
}
