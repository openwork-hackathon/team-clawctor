interface ConfidenceScoreProps {
  score: number;
  dataPoints: number;
}

export function ConfidenceScore({ score, dataPoints }: ConfidenceScoreProps) {
  return (
    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
        Confidence Score
      </p>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-sm font-bold text-emerald-500">{score}%</span>
      </div>
      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
        Based on {dataPoints.toLocaleString()} validated data points and automated
        regression tests.
      </p>
    </div>
  );
}
