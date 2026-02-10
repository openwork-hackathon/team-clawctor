import { BlurredReportContent } from './BlurredReportContent';
import { UnlockOverlay } from './UnlockOverlay';

interface ReportPreviewPanelProps {
  isLocked?: boolean;
  tokenCost: number;
  stats: {
    pages: number;
    insights: number;
    format: string;
  };
  onUnlockSuccess?: (txHash: `0x${string}`) => void;
  onTopUp?: () => void;
}

export function ReportPreviewPanel({
  isLocked = true,
  tokenCost,
  stats,
  onUnlockSuccess,
  onTopUp,
}: ReportPreviewPanelProps) {
  return (
    <div className="lg:col-span-3 relative min-h-[600px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <BlurredReportContent />
      {isLocked && (
        <UnlockOverlay
          tokenCost={tokenCost}
          stats={stats}
          onUnlockSuccess={onUnlockSuccess}
          onTopUp={onTopUp}
        />
      )}
    </div>
  );
}
