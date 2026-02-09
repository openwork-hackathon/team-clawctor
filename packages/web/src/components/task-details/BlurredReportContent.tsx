export function BlurredReportContent() {
  return (
    <div className="p-10 select-none pointer-events-none blur-[6px] opacity-40">
      <div className="space-y-8">
        {/* Title and text placeholders */}
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 w-1/3 rounded" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 w-full rounded" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 w-full rounded" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 w-4/5 rounded" />
        </div>

        {/* Chart placeholders */}
        <div className="grid grid-cols-2 gap-8">
          <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">
              bar_chart
            </span>
          </div>
          <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">
              pie_chart
            </span>
          </div>
        </div>

        {/* Risk items placeholders */}
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 w-1/4 rounded" />
          <div className="space-y-3">
            <div className="h-12 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20" />
            <div className="h-12 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20" />
            <div className="h-12 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20" />
            <div className="h-12 bg-slate-50 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>

        {/* Large content placeholder */}
        <div className="h-64 bg-slate-50 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
