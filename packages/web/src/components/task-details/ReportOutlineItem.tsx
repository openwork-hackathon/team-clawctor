interface ReportOutlineItemProps {
  icon: string;
  label: string;
  isActive?: boolean;
  isLocked?: boolean;
}

export function ReportOutlineItem({
  icon,
  label,
  isActive = false,
  isLocked = false,
}: ReportOutlineItemProps) {
  if (isActive) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-primary bg-primary/5 rounded-lg">
        <span className="material-symbols-outlined text-lg">{icon}</span>
        {label}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      {label}
      {isLocked && (
        <span className="material-symbols-outlined text-xs ml-auto">lock</span>
      )}
    </div>
  );
}
